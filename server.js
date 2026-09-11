"use strict";

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const QRCode = require("qrcode");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const envPath = path.join(root, ".env");
const gameSessions = new Map();

if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
        if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
        }
    }
}

const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml"
};

const comparisonPrompts = {
    banana: {
        size: { label: "Size", instruction: "Compare the apparent size and length of the bananas." },
        color: { label: "Color", instruction: "Compare the visible color, ripeness tone, and color consistency of the bananas." },
        curvature: { label: "Curvature", instruction: "Compare the visible curvature of the bananas." }
    },
    coconut: {
        fibers: { label: "Outer fibers", instruction: "Compare the visibility and amount of outer fibers on the coconuts." },
        size: { label: "Size", instruction: "Compare the apparent size of the coconuts." },
        color: { label: "Shell color", instruction: "Compare the visible shell color and color consistency of the coconuts." }
    },
    tea: {
        count: { label: "Bubble count", instruction: "Compare the visible number of bubbles in the tea drinks." },
        density: { label: "Bubble density", instruction: "Compare how densely bubbles are distributed in the visible tea surface." },
        coverage: { label: "Bubble coverage", instruction: "Compare how much of the visible tea surface is covered by bubbles." }
    },
    game: {
        appearance: { label: "Looks better", instruction: "Compare which product looks better overall based only on visible appearance, presentation, condition, and design." }
    }
};

function sendJson(response, statusCode, body) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(body));
}

function readBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";
        request.on("data", chunk => {
            body += chunk;
            if (body.length > 24 * 1024 * 1024) {
                reject(new Error("Request is too large."));
                request.destroy();
            }
        });
        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
}

function getLanAddress() {
    const interfaces = os.networkInterfaces();
    for (const entries of Object.values(interfaces)) {
        for (const entry of entries || []) {
            if (entry.family === "IPv4" && !entry.internal) {
                return entry.address;
            }
        }
    }
    return "localhost";
}

function gameSessionUrl(request, sessionId, player) {
    const host = request.headers.host?.split(":")[0];
    const address = host && host !== "localhost" && host !== "127.0.0.1"
        ? host
        : getLanAddress();
    return `http://${address}:${port}/phone-upload.html?session=${encodeURIComponent(sessionId)}&player=${encodeURIComponent(player)}`;
}

function imagePart(dataUrl) {
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
    if (!match) {
        throw new Error("Only JPEG, PNG, and WEBP images are supported.");
    }
    return { type: "image", mime_type: match[1], data: match[2] };
}

async function compareImages(payload) {
    const type = String(payload.type || "").toLowerCase();
    const criterion = String(payload.criterion || "").toLowerCase();
    const comparison = comparisonPrompts[type]?.[criterion];
    if (!comparison) {
        throw new Error("Unsupported comparison type.");
    }

    const product = type === "game" ? String(payload.product || "the product") : "the items";
    const prompt = `The challenge product is ${product}. ${comparison.instruction}

Return only valid JSON with this exact shape:
{"winner":"A|B|TIE","scoreA":0,"scoreB":0,"explanation":"brief evidence-based explanation","criterion":"${comparison.label}"}

Use scores from 0 to 100. Judge only what is visibly present. If the images are too ambiguous to distinguish, use TIE and explain why.`;

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions?key=" + encodeURIComponent(process.env.GEMINI_API_KEY),
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gemini-3.1-flash-lite",
                input: [
                    { type: "text", text: prompt },
                    imagePart(payload.imageA),
                    imagePart(payload.imageB)
                ],
                response_format: [{
                    type: "text",
                    mime_type: "application/json",
                    schema: {
                        type: "object",
                        properties: {
                            winner: { type: "string", enum: ["A", "B", "TIE"] },
                            scoreA: { type: "integer", minimum: 0, maximum: 100 },
                            scoreB: { type: "integer", minimum: 0, maximum: 100 },
                            explanation: { type: "string" },
                            criterion: { type: "string" }
                        },
                        required: ["winner", "scoreA", "scoreB", "explanation", "criterion"],
                        additionalProperties: false
                    }
                }],
                generation_config: { temperature: 0.2 },
                store: false
            })
        }
    );

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Gemini API request failed.");
    }

    const modelOutput = [...(data.steps || [])]
        .reverse()
        .find(step => step.type === "model_output");
    const text = data.output_text || modelOutput?.content
        ?.filter(content => content.type === "text")
        .map(content => content.text)
        .join("");
    if (!text) {
        throw new Error("Gemini returned an empty analysis.");
    }

    const result = JSON.parse(text);
    const winner = ["A", "B", "TIE"].includes(result.winner) ? result.winner : "TIE";
    const scoreA = Math.max(0, Math.min(100, Number(result.scoreA) || 0));
    const scoreB = Math.max(0, Math.min(100, Number(result.scoreB) || 0));

    return {
        winner,
        scoreA,
        scoreB,
        explanation: String(result.explanation || "Gemini could not provide a detailed explanation."),
        criterion: comparison.label
    };
}

const server = http.createServer(async (request, response) => {
    if (request.method === "GET" && request.url?.startsWith("/api/game/qr?")) {
        try {
            const data = new URL(request.url, `http://${request.headers.host}`).searchParams.get("data");
            if (!data) {
                sendJson(response, 400, { error: "QR data is missing." });
                return;
            }
            const qr = await QRCode.toBuffer(data, { type: "png", width: 220, margin: 2 });
            response.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "no-store" });
            response.end(qr);
        } catch (error) {
            sendJson(response, 400, { error: "Unable to create QR code." });
        }
        return;
    }

    if (request.method === "POST" && request.url === "/api/game/session") {
        const body = await readBody(request);
        const payload = body ? JSON.parse(body) : {};
        const player = payload.player === "B" ? "B" : "A";
        const sessionId = crypto.randomBytes(12).toString("hex");
        gameSessions.set(sessionId, { image: null, player, createdAt: Date.now() });
        sendJson(response, 200, { sessionId, uploadUrl: gameSessionUrl(request, sessionId, player) });
        return;
    }

    const gameMatch = request.url?.match(/^\/api\/game\/session\/([a-f0-9]+)(?:\?.*)?$/);
    if (gameMatch) {
        const session = gameSessions.get(gameMatch[1]);
        if (!session || Date.now() - session.createdAt > 15 * 60 * 1000) {
            gameSessions.delete(gameMatch[1]);
            sendJson(response, 404, { error: "This game session has expired." });
            return;
        }

        if (request.method === "GET") {
            sendJson(response, 200, { ready: Boolean(session.image), image: session.image });
            return;
        }

        if (request.method === "POST") {
            try {
                const payload = JSON.parse(await readBody(request));
                imagePart(payload.image);
                session.image = payload.image;
                sendJson(response, 200, { ready: true });
            } catch (error) {
                sendJson(response, 400, { error: error.message || "Unable to upload this image." });
            }
            return;
        }
    }

    if (request.method === "POST" && request.url === "/api/compare") {
        if (!process.env.GEMINI_API_KEY) {
            sendJson(response, 500, { error: "GEMINI_API_KEY is missing from .env." });
            return;
        }

        try {
            const payload = JSON.parse(await readBody(request));
            sendJson(response, 200, await compareImages(payload));
        } catch (error) {
            sendJson(response, 400, { error: error.message || "Unable to analyze the images." });
        }
        return;
    }

    const requestedPath = request.url === "/" ? "/index.html" : request.url;
    const filePath = path.resolve(root, "." + requestedPath.split("?")[0]);
    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        response.writeHead(404);
        response.end("Not found");
        return;
    }

    response.writeHead(200, {
        "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
        "Cache-Control": "no-store, no-cache, must-revalidate"
    });
    fs.createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
    console.log(`ithaano athaano is running at http://localhost:${port}`);
});
