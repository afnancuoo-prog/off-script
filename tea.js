/* =========================================
   TEA BUBBLE COMPARISON
   ithaano athaano

   Prototype only.
   No real AI/API is being used.
========================================= */


// =========================================
// STATE
// =========================================

let imageA = null;
let imageB = null;

let objectUrlA = null;
let objectUrlB = null;

let comparisonTimer = null;


// =========================================
// DOM ELEMENTS
// =========================================

const fileA = document.getElementById("fileA");
const fileB = document.getElementById("fileB");

const chooseBtnA = document.getElementById("chooseBtnA");
const chooseBtnB = document.getElementById("chooseBtnB");

const changeBtnA = document.getElementById("changeBtnA");
const changeBtnB = document.getElementById("changeBtnB");

const uploadAreaA = document.getElementById("uploadAreaA");
const uploadAreaB = document.getElementById("uploadAreaB");

const placeholderA = document.getElementById("placeholderA");
const placeholderB = document.getElementById("placeholderB");

const previewContainerA =
    document.getElementById("previewContainerA");

const previewContainerB =
    document.getElementById("previewContainerB");

const previewA =
    document.getElementById("previewA");

const previewB =
    document.getElementById("previewB");

const statusA =
    document.getElementById("statusA");

const statusB =
    document.getElementById("statusB");

const compareBtn =
    document.getElementById("compareBtn");

const loadingArea =
    document.getElementById("loadingArea");

const resultSection =
    document.getElementById("resultSection");

const resultImageA =
    document.getElementById("resultImageA");

const resultImageB =
    document.getElementById("resultImageB");

const scoreA =
    document.getElementById("scoreA");

const scoreB =
    document.getElementById("scoreB");

const scoreBarA =
    document.getElementById("scoreBarA");

const scoreBarB =
    document.getElementById("scoreBarB");

const winnerName =
    document.getElementById("winnerName");

const resultExplanation =
    document.getElementById("resultExplanation");

const resetBtn =
    document.getElementById("resetBtn");

const errorMessage =
    document.getElementById("errorMessage");

const menuBtn =
    document.getElementById("menuBtn");

const navLinks =
    document.getElementById("navLinks");

const optionButtons =
    document.querySelectorAll(".option-btn");

let selectedCriterion = "count";

optionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        selectedCriterion = button.dataset.criterion;
        optionButtons.forEach((option) => {
            const isActive = option === button;
            option.classList.toggle("active", isActive);
            option.setAttribute("aria-pressed", String(isActive));
        });
    });
});


// =========================================
// INITIAL SETUP
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    setupUploadEvents();
    setupDragAndDrop();
    setupMobileMenu();
    updateCompareButton();

});


// =========================================
// UPLOAD EVENTS
// =========================================

function setupUploadEvents() {

    chooseBtnA.addEventListener("click", () => {
        fileA.click();
    });

    chooseBtnB.addEventListener("click", () => {
        fileB.click();
    });

    changeBtnA.addEventListener("click", () => {
        fileA.click();
    });

    changeBtnB.addEventListener("click", () => {
        fileB.click();
    });


    fileA.addEventListener("change", (event) => {
        handleImageUpload(event, "A");
    });

    fileB.addEventListener("change", (event) => {
        handleImageUpload(event, "B");
    });

}


// =========================================
// IMAGE UPLOAD
// =========================================

function handleImageUpload(event, person) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    hideError();


    // Validate
    if (!validateImage(file)) {
        showError(
            "Please choose a valid JPEG, PNG, or WEBP image."
        );

        event.target.value = "";
        return;
    }


    // Store file
    if (person === "A") {
        imageA = file;
    } else {
        imageB = file;
    }


    // Show preview
    showPreview(file, person);

    updateCompareButton();

}


// =========================================
// IMAGE VALIDATION
// =========================================

function validateImage(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    return allowedTypes.includes(file.type);

}


// =========================================
// SHOW PREVIEW
// =========================================

function showPreview(file, person) {

    const objectUrl = URL.createObjectURL(file);


    if (person === "A") {

        // Clean previous URL
        if (objectUrlA) {
            URL.revokeObjectURL(objectUrlA);
        }

        objectUrlA = objectUrl;

        previewA.src = objectUrlA;

        placeholderA.style.display = "none";

        previewContainerA.classList.add("show");

        statusA.textContent =
            "Tea A selected";

    } else {

        if (objectUrlB) {
            URL.revokeObjectURL(objectUrlB);
        }

        objectUrlB = objectUrl;

        previewB.src = objectUrlB;

        placeholderB.style.display = "none";

        previewContainerB.classList.add("show");

        statusB.textContent =
            "Tea B selected";
    }

}


// =========================================
// COMPARE BUTTON
// =========================================

function updateCompareButton() {

    const ready =
        imageA !== null &&
        imageB !== null;

    compareBtn.disabled = !ready;

}


// =========================================
// COMPARE TEAS
// =========================================

async function compareTeas() {

    if (!imageA || !imageB) {

        showError(
            "Please upload both Tea A and Tea B images first."
        );

        return;
    }


    hideError();


    // Prevent duplicate clicks
    compareBtn.disabled = true;

    compareBtn.textContent =
        "Comparing...";


    // Hide previous result
    resultSection.classList.remove("show");

    // Show loading
    loadingArea.classList.add("show");


    try {
        const result = await compareWithGemini("tea", selectedCriterion, objectUrlA, objectUrlB);
        loadingArea.classList.remove("show");
        showResult(result);
        compareBtn.disabled = false;
        compareBtn.textContent =
            "🧋 Compare Teas";
    } catch (error) {
        loadingArea.classList.remove("show");
        compareBtn.disabled = false;
        compareBtn.textContent = "🧋 Compare Teas";
        showError(error.message);
    }

}


// =========================================
// PROTOTYPE ANALYSIS
// =========================================

function analyzeTeaBubbles(imageA, imageB) {

    /*
     * Prototype only.
     *
     * Real AI image analysis will be connected later.
     *
     * The uploaded images are NOT actually analyzed here.
     */

    return {

        winner: "A",

        scoreA: 90,

        scoreB: 60,

        explanation:
            "Tea A has more visible bubbles in this prototype comparison.",

        isPrototype: true

    };

}


// =========================================
// SHOW RESULT
// =========================================

function showResult(result) {

    // Put uploaded images into result
    resultImageA.src =
        objectUrlA;

    resultImageB.src =
        objectUrlB;


    // Scores
    scoreA.textContent =
        result.scoreA;

    scoreB.textContent =
        result.scoreB;


    // Winner
    if (result.winner === "A") {

        winnerName.textContent =
            "🏆 Tea A Wins!";

    } else if (result.winner === "B") {

        winnerName.textContent =
            "🏆 Tea B Wins!";

    } else {

        winnerName.textContent =
            "🤝 It's a Tie!";

    }


    resultExplanation.textContent =
        result.explanation;


    // Show result
    resultSection.classList.add("show");


    // Animate bars
    requestAnimationFrame(() => {

        setTimeout(() => {

            scoreBarA.style.width =
                result.scoreA + "%";

            scoreBarB.style.width =
                result.scoreB + "%";

        }, 150);

    });


    // Scroll to result
    setTimeout(() => {

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 200);

}


// =========================================
// RESET
// =========================================

function resetComparison() {

    // Cancel timer
    if (comparisonTimer) {

        clearTimeout(comparisonTimer);

        comparisonTimer = null;
    }


    // Revoke object URLs
    if (objectUrlA) {

        URL.revokeObjectURL(objectUrlA);

        objectUrlA = null;
    }

    if (objectUrlB) {

        URL.revokeObjectURL(objectUrlB);

        objectUrlB = null;
    }


    // Clear state
    imageA = null;
    imageB = null;


    // Clear file inputs
    fileA.value = "";
    fileB.value = "";


    // Clear image sources
    previewA.removeAttribute("src");
    previewB.removeAttribute("src");

    resultImageA.removeAttribute("src");
    resultImageB.removeAttribute("src");


    // Reset preview UI
    previewContainerA.classList.remove("show");
    previewContainerB.classList.remove("show");

    placeholderA.style.display = "";
    placeholderB.style.display = "";


    statusA.textContent =
        "Tea A selected";

    statusB.textContent =
        "Tea B selected";


    // Reset scores
    scoreA.textContent = "90";
    scoreB.textContent = "60";

    scoreBarA.style.width = "0%";
    scoreBarB.style.width = "0%";


    // Hide result/loading
    resultSection.classList.remove("show");
    loadingArea.classList.remove("show");


    // Reset button
    compareBtn.disabled = true;

    compareBtn.textContent =
        "🧋 Compare Teas";


    hideError();


    // Scroll back to comparison
    document.querySelector(".comparison-section")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


// =========================================
// ERROR
// =========================================

function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.classList.add("show");

}


function hideError() {

    errorMessage.textContent = "";

    errorMessage.classList.remove("show");

}


// =========================================
// DRAG & DROP
// =========================================

function setupDragAndDrop() {

    setupDropArea(uploadAreaA, "A");

    setupDropArea(uploadAreaB, "B");

}


function setupDropArea(area, person) {

    area.addEventListener("dragover", (event) => {

        event.preventDefault();

        area.classList.add("dragover");

    });


    area.addEventListener("dragleave", () => {

        area.classList.remove("dragover");

    });


    area.addEventListener("drop", (event) => {

        event.preventDefault();

        area.classList.remove("dragover");


        const file =
            event.dataTransfer.files[0];


        if (!file) {
            return;
        }


        if (!validateImage(file)) {

            showError(
                "Please drop a JPEG, PNG, or WEBP image."
            );

            return;
        }


        hideError();


        if (person === "A") {

            imageA = file;

            showPreview(file, "A");

        } else {

            imageB = file;

            showPreview(file, "B");

        }


        updateCompareButton();

    });

}


// =========================================
// MOBILE MENU
// =========================================

function setupMobileMenu() {

    if (!menuBtn || !navLinks) {
        return;
    }


    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("active");

    });


    navLinks.querySelectorAll("a").forEach((link) => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("active");

        });

    });

}


// =========================================
// BUTTON EVENTS
// =========================================

compareBtn.addEventListener(
    "click",
    compareTeas
);

resetBtn.addEventListener(
    "click",
    resetComparison
);


// =========================================
// ESCAPE KEY
// =========================================

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        if (navLinks) {
            navLinks.classList.remove("active");
        }

    }

});


// =========================================
// CLEANUP
// =========================================

window.addEventListener("beforeunload", () => {

    if (objectUrlA) {
        URL.revokeObjectURL(objectUrlA);
    }

    if (objectUrlB) {
        URL.revokeObjectURL(objectUrlB);
    }

});