"use strict";

const challengeProducts = [
    { name: "a pair of shoes", icon: "👟" },
    { name: "a backpack", icon: "🎒" },
    { name: "a water bottle", icon: "🧴" },
    { name: "a laptop", icon: "💻" },
    { name: "a coffee mug", icon: "☕" },
    { name: "a wristwatch", icon: "⌚" },
    { name: "a baseball cap", icon: "🧢" },
    { name: "a pair of sunglasses", icon: "🕶️" },
    { name: "a book", icon: "📘" },
    { name: "a phone", icon: "📱" }
];

const challengeProduct = document.getElementById("challengeProduct");
const challengeTimer = document.getElementById("challengeTimer");
const challengeStatus = document.getElementById("challengeStatus");
const startChallengeButton = document.getElementById("startChallengeBtn");
const newProductButton = document.getElementById("newProductBtn");
const challengeUploads = document.getElementById("challengeUploads");
const challengeInputA = document.getElementById("challengeInputA");
const challengeInputB = document.getElementById("challengeInputB");
const challengePreviewA = document.getElementById("challengePreviewA");
const challengePreviewB = document.getElementById("challengePreviewB");
const challengeCompareButton = document.getElementById("challengeCompareBtn");
const challengeResult = document.getElementById("challengeResult");
const gameResult = document.getElementById("gameResult");
const gameResultProduct = document.getElementById("gameResultProduct");
const gameWinnerTitle = document.getElementById("gameWinnerTitle");
const gameWinnerSubtitle = document.getElementById("gameWinnerSubtitle");
const gameResultImageA = document.getElementById("gameResultImageA");
const gameResultImageB = document.getElementById("gameResultImageB");
const gameScoreA = document.getElementById("gameScoreA");
const gameScoreB = document.getElementById("gameScoreB");
const gameScoreBarA = document.getElementById("gameScoreBarA");
const gameScoreBarB = document.getElementById("gameScoreBarB");
const gameResultExplanation = document.getElementById("gameResultExplanation");
const gamePlayerCardA = document.getElementById("gamePlayerCardA");
const gamePlayerCardB = document.getElementById("gamePlayerCardB");
const phoneConnect = document.getElementById("phoneConnect");
const challengeQrA = document.getElementById("challengeQrA");
const challengeQrB = document.getElementById("challengeQrB");
const phoneUploadLinkA = document.getElementById("phoneUploadLinkA");
const phoneUploadLinkB = document.getElementById("phoneUploadLinkB");

let selectedProduct = null;
let remainingSeconds = 180;
let challengeInterval = null;
let objectUrlA = null;
let objectUrlB = null;
let phoneSessionIds = { A: null, B: null };
let phonePollInterval = null;

function chooseProduct() {
    const previousProduct = selectedProduct?.name;
    const availableProducts = challengeProducts.filter(product => product.name !== previousProduct);
    selectedProduct = availableProducts[Math.floor(Math.random() * availableProducts.length)];
    challengeProduct.textContent = `${selectedProduct.icon} ${selectedProduct.name}`;
}

function renderTimer() {
    const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
    const seconds = String(remainingSeconds % 60).padStart(2, "0");
    challengeTimer.textContent = `${minutes}:${seconds}`;
    challengeTimer.classList.toggle("urgent", remainingSeconds <= 30);
}

function stopChallengeTimer() {
    clearInterval(challengeInterval);
    challengeInterval = null;
}

function stopPhonePolling() {
    clearInterval(phonePollInterval);
    phonePollInterval = null;
}

async function createPhoneSession(side) {
    const response = await fetch("/api/game/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: side })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to create the phone upload link.");
    phoneSessionIds[side] = data.sessionId;
    const link = side === "A" ? phoneUploadLinkA : phoneUploadLinkB;
    const qr = side === "A" ? challengeQrA : challengeQrB;
    link.href = data.uploadUrl;
    link.textContent = data.uploadUrl;
    qr.src = `/api/game/qr?data=${encodeURIComponent(data.uploadUrl)}`;
    phoneConnect.hidden = false;
}

async function checkPhoneUpload() {
    for (const side of ["A", "B"]) {
        const sessionId = phoneSessionIds[side];
        const currentImage = side === "A" ? objectUrlA : objectUrlB;
        if (!sessionId || currentImage) continue;
        try {
            const response = await fetch(`/api/game/session/${encodeURIComponent(sessionId)}`);
            if (!response.ok) continue;
            const data = await response.json();
            if (!data.ready || !data.image) continue;
            if (side === "A") {
                objectUrlA = data.image;
                challengePreviewA.src = data.image;
            } else {
                objectUrlB = data.image;
                challengePreviewB.src = data.image;
            }
        } catch (error) {
            challengeStatus.textContent = "Waiting for the phone photos...";
        }
    }
    if (objectUrlA && objectUrlB) {
        challengeCompareButton.disabled = false;
        challengeStatus.textContent = "Both player photos arrived. The judge is ready.";
    }
}

function startChallengeTimer() {
    stopChallengeTimer();
    challengeInterval = setInterval(() => {
        remainingSeconds -= 1;
        renderTimer();
        if (remainingSeconds <= 0) {
            stopChallengeTimer();
            challengeStatus.textContent = "Time is up. Upload what you found and compare the two finds.";
            challengeTimer.classList.add("finished");
        }
    }, 1000);
}

async function startRound() {
    stopPhonePolling();
    if (objectUrlA) URL.revokeObjectURL(objectUrlA);
    if (objectUrlB) URL.revokeObjectURL(objectUrlB);
    objectUrlA = null;
    objectUrlB = null;
    chooseProduct();
    remainingSeconds = 180;
    renderTimer();
    challengeTimer.classList.remove("finished");
    challengeUploads.hidden = false;
    newProductButton.hidden = false;
    startChallengeButton.hidden = true;
    challengeStatus.textContent = "Find this product with your friend before the clock runs out.";
    challengeResult.textContent = "";
    gameResult.hidden = true;
    challengeInputA.value = "";
    challengeInputB.value = "";
    challengePreviewA.removeAttribute("src");
    challengePreviewB.removeAttribute("src");
    phoneConnect.hidden = true;
    phoneSessionIds = { A: null, B: null };
    challengeCompareButton.disabled = true;
    startChallengeTimer();
    challengeStatus.textContent = "Product selected. Preparing your QR code...";
    try {
        await Promise.all([createPhoneSession("A"), createPhoneSession("B")]);
        phonePollInterval = setInterval(checkPhoneUpload, 1200);
        phoneConnect.scrollIntoView({ behavior: "smooth", block: "center" });
        challengeStatus.textContent = "Two QR codes ready. Scan one with each player's phone.";
    } catch (error) {
        challengeStatus.textContent = `Phone upload unavailable: ${error.message} You can still use the desktop upload.`;
    }
}

function resetRound() {
    stopChallengeTimer();
    stopPhonePolling();
    if (objectUrlA) URL.revokeObjectURL(objectUrlA);
    if (objectUrlB) URL.revokeObjectURL(objectUrlB);
    objectUrlA = null;
    objectUrlB = null;
    selectedProduct = null;
    phoneSessionIds = { A: null, B: null };
    remainingSeconds = 180;
    renderTimer();
    challengeTimer.classList.remove("finished", "urgent");
    challengeProduct.textContent = "Ready for a challenge?";
    challengeStatus.textContent = "Start the round to reveal your product.";
    challengeUploads.hidden = true;
    phoneConnect.hidden = true;
    newProductButton.hidden = true;
    startChallengeButton.hidden = false;
    challengeResult.textContent = "";
    gameResult.hidden = true;
    challengeInputA.value = "";
    challengeInputB.value = "";
    challengePreviewA.removeAttribute("src");
    challengePreviewB.removeAttribute("src");
    challengeCompareButton.disabled = true;
}

function handleChallengeImage(event, preview, side) {
    const file = event.target.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        challengeStatus.textContent = "Please choose a JPEG, PNG, or WEBP image.";
        event.target.value = "";
        return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (side === "A" && objectUrlA) URL.revokeObjectURL(objectUrlA);
    if (side === "B" && objectUrlB) URL.revokeObjectURL(objectUrlB);
    if (side === "A") objectUrlA = objectUrl;
    if (side === "B") objectUrlB = objectUrl;
    preview.src = objectUrl;
    challengeCompareButton.disabled = !(objectUrlA && objectUrlB);
    challengeStatus.textContent = challengeCompareButton.disabled
        ? "One more photo and the judge is ready."
        : "Both finds are ready. Let the visual judge decide.";
}

async function compareChallengeFinds() {
    if (!selectedProduct || !objectUrlA || !objectUrlB) return;
    challengeCompareButton.disabled = true;
    challengeCompareButton.textContent = "Judging the finds...";
    challengeResult.textContent = "Gemini is comparing only visible appearance.";
    stopChallengeTimer();

    try {
        const result = await compareWithGemini(
            "game",
            "appearance",
            objectUrlA,
            objectUrlB,
            { product: selectedProduct.name }
        );
        showGameResult(result);
    } catch (error) {
        challengeResult.textContent = error.message;
        challengeCompareButton.disabled = false;
    } finally {
        challengeCompareButton.textContent = "🏆 Compare Finds";
    }
}

function showGameResult(result) {
    const winnerTitle = result.winner === "TIE"
        ? "A photo-finish tie!"
        : result.winner === "A" ? "Player One wins!" : "Player Two wins!";
    const winnerSubtitle = result.winner === "TIE"
        ? "Both finds look equally strong."
        : "The better-looking find is...";

    gameResultProduct.textContent = `${selectedProduct.icon} Challenge item: ${selectedProduct.name}`;
    gameWinnerTitle.textContent = winnerTitle;
    gameWinnerSubtitle.textContent = winnerSubtitle;
    gameResultImageA.src = objectUrlA;
    gameResultImageB.src = objectUrlB;
    gameScoreA.textContent = result.scoreA;
    gameScoreB.textContent = result.scoreB;
    gameScoreBarA.style.width = `${result.scoreA}%`;
    gameScoreBarB.style.width = `${result.scoreB}%`;
    gameResultExplanation.textContent = result.explanation;
    gamePlayerCardA.classList.toggle("winner", result.winner === "A");
    gamePlayerCardB.classList.toggle("winner", result.winner === "B");
    gameResult.hidden = false;
    challengeResult.textContent = "";
    gameResult.scrollIntoView({ behavior: "smooth", block: "center" });
}

startChallengeButton.addEventListener("click", startRound);
newProductButton.addEventListener("click", startRound);
challengeInputA.addEventListener("change", event => handleChallengeImage(event, challengePreviewA, "A"));
challengeInputB.addEventListener("change", event => handleChallengeImage(event, challengePreviewB, "B"));
challengeCompareButton.addEventListener("click", compareChallengeFinds);
renderTimer();
