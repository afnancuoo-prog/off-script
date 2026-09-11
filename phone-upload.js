"use strict";

const sessionId = new URLSearchParams(window.location.search).get("session");
const imageInput = document.getElementById("phoneImageInput");
const preview = document.getElementById("phonePreview");
const statusText = document.getElementById("phoneStatus");
const uploadButton = document.getElementById("phoneUploadButton");
const playerLabel = document.getElementById("playerLabel");
let selectedImage = null;

const player = new URLSearchParams(window.location.search).get("player");
if (player === "A" || player === "B") {
    playerLabel.textContent = `Player ${player === "A" ? "One" : "Two"}`;
}

if (!sessionId) {
    statusText.textContent = "This upload link is missing its game session.";
    imageInput.disabled = true;
}

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        statusText.textContent = "Please choose a JPEG, PNG, or WEBP image.";
        imageInput.value = "";
        return;
    }

    selectedImage = file;
    preview.src = URL.createObjectURL(file);
    preview.hidden = false;
    uploadButton.disabled = false;
    statusText.textContent = "Photo ready to send.";
});

uploadButton.addEventListener("click", () => {
    if (!selectedImage || !sessionId) return;
    uploadButton.disabled = true;
    statusText.textContent = "Sending photo to the game...";

    const reader = new FileReader();
    reader.onload = async () => {
        try {
            const response = await fetch(`/api/game/session/${encodeURIComponent(sessionId)}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: reader.result })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Upload failed.");
            statusText.textContent = "Photo sent. You can close this page.";
            uploadButton.textContent = "Photo Sent ✓";
        } catch (error) {
            uploadButton.disabled = false;
            statusText.textContent = error.message;
        }
    };
    reader.onerror = () => {
        uploadButton.disabled = false;
        statusText.textContent = "Unable to read this photo.";
    };
    reader.readAsDataURL(selectedImage);
});
