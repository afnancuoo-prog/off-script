"use strict";

async function toDataUrl(imageUrl) {
    if (imageUrl.startsWith("data:")) {
        return imageUrl;
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error("Unable to read the selected image.");
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Unable to read the selected image."));
        reader.readAsDataURL(blob);
    });
}

async function compareWithGemini(type, criterion, imageA, imageB, context = {}) {
    const [imageDataA, imageDataB] = await Promise.all([
        toDataUrl(imageA),
        toDataUrl(imageB)
    ]);

    const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, criterion, imageA: imageDataA, imageB: imageDataB, ...context })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || "Gemini could not analyze these images.");
    }

    return data;
}
