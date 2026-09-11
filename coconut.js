/* =========================================
   ITHAANO ATHAANO - COCONUT COMPARISON
   ========================================= */

"use strict";


/* =========================================
   STATE
   ========================================= */

let imageA = null;
let imageB = null;

let objectUrlA = null;
let objectUrlB = null;

let comparisonTimer = null;


/* =========================================
   DOM ELEMENTS
   ========================================= */

const fileA = document.getElementById("fileA");
const fileB = document.getElementById("fileB");

const chooseBtnA = document.getElementById("chooseBtnA");
const chooseBtnB = document.getElementById("chooseBtnB");

const changeBtnA = document.getElementById("changeBtnA");
const changeBtnB = document.getElementById("changeBtnB");

const placeholderA = document.getElementById("placeholderA");
const placeholderB = document.getElementById("placeholderB");

const previewContainerA =
    document.getElementById("previewContainerA");

const previewContainerB =
    document.getElementById("previewContainerB");

const previewA = document.getElementById("previewA");
const previewB = document.getElementById("previewB");

const statusA = document.getElementById("statusA");
const statusB = document.getElementById("statusB");

const compareBtn = document.getElementById("compareBtn");

const loadingArea =
    document.getElementById("loadingArea");

const resultSection =
    document.getElementById("resultSection");

const resultImageA =
    document.getElementById("resultImageA");

const resultImageB =
    document.getElementById("resultImageB");

const resultExplanation =
    document.getElementById("resultExplanation");

const winnerName =
    document.getElementById("winnerName");

const scoreA =
    document.getElementById("scoreA");

const scoreB =
    document.getElementById("scoreB");

const scoreBarA =
    document.getElementById("scoreBarA");

const scoreBarB =
    document.getElementById("scoreBarB");

const resetBtn =
    document.getElementById("resetBtn");

const errorMessage =
    document.getElementById("errorMessage");

const menuBtn =
    document.getElementById("menuBtn");

const mobileMenu =
    document.getElementById("mobileMenu");

const optionButtons =
    document.querySelectorAll(".option-btn");

let selectedCriterion = "fibers";

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


/* =========================================
   INITIALIZE
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    setupUploadEvents();

    setupMenu();

    updateCompareButton();

});


/* =========================================
   UPLOAD EVENTS
   ========================================= */

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


    compareBtn.addEventListener("click", compareCoconuts);

    resetBtn.addEventListener("click", resetComparison);

}


/* =========================================
   HANDLE IMAGE UPLOAD
   ========================================= */

function handleImageUpload(event, person) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!validateImage(file)) {

        showError(
            "Please choose a valid coconut image."
        );

        event.target.value = "";

        return;
    }

    hideError();

    showPreview(file, person);

}


/* =========================================
   VALIDATE IMAGE
   ========================================= */

function validateImage(file) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    return allowedTypes.includes(file.type);

}


/* =========================================
   SHOW PREVIEW
   ========================================= */

function showPreview(file, person) {

    const objectUrl =
        URL.createObjectURL(file);


    if (person === "A") {

        if (objectUrlA) {
            URL.revokeObjectURL(objectUrlA);
        }

        objectUrlA = objectUrl;

        imageA = file;

        previewA.src = objectUrl;

        placeholderA.style.display = "none";

        previewContainerA.classList.add("show");

        statusA.textContent = "Coconut image selected ✓";

        statusA.classList.add("success");

    } else {

        if (objectUrlB) {
            URL.revokeObjectURL(objectUrlB);
        }

        objectUrlB = objectUrl;

        imageB = file;

        previewB.src = objectUrl;

        placeholderB.style.display = "none";

        previewContainerB.classList.add("show");

        statusB.textContent = "Coconut image selected ✓";

        statusB.classList.add("success");

    }

    updateCompareButton();

}


/* =========================================
   VALIDATE BOTH IMAGES
   ========================================= */

function validateImages() {

    if (!imageA || !imageB) {

        showError(
            "Please upload both coconut images first."
        );

        return false;
    }

    if (
        !validateImage(imageA) ||
        !validateImage(imageB)
    ) {

        showError(
            "Please choose valid coconut images."
        );

        return false;
    }

    hideError();

    return true;

}


/* =========================================
   UPDATE COMPARE BUTTON
   ========================================= */

function updateCompareButton() {

    compareBtn.disabled = !(imageA && imageB);

}


/* =========================================
   COMPARE COCONUTS
   ========================================= */

async function compareCoconuts() {

    if (!validateImages()) {
        return;
    }

    compareBtn.disabled = true;

    compareBtn.style.display = "none";

    loadingArea.classList.add("show");

    hideError();


    try {
        const result = await compareWithGemini("coconut", selectedCriterion, objectUrlA, objectUrlB);
        loadingArea.classList.remove("show");
        compareBtn.style.display = "inline-flex";
        showResult(result);
    } catch (error) {
        loadingArea.classList.remove("show");
        compareBtn.style.display = "inline-flex";
        compareBtn.disabled = false;
        showError(error.message);
    }

}


/* =========================================
   FUTURE AI ANALYSIS HOOK
   ========================================= */

function analyzeCoconutFibers(imageA, imageB) {

    /*
        PROTOTYPE ONLY.

        Real AI image analysis will be connected
        here in a future phase.

        These values are fixed demo values.
        They are NOT calculated from the images.
    */

    return {

        winner: "A",

        scoreA: 90,

        scoreB: 60,

        explanation:
            "Coconut A has more visible fibers in this prototype comparison.",

        isPrototype: true

    };

}


/* =========================================
   SHOW RESULT
   ========================================= */

function showResult(result) {


    /*
        Display uploaded images
        in the result section.
    */

    resultImageA.src = objectUrlA;
    resultImageB.src = objectUrlB;


    /*
        Display demo scores.
    */

    scoreA.textContent =
        `${result.scoreA}%`;

    scoreB.textContent =
        `${result.scoreB}%`;


    /*
        Display winner.
    */

    if (result.winner === "A") {

        winnerName.textContent =
            "🏆 Person A Wins!";

    } else {

        winnerName.textContent =
            "🏆 Person B Wins!";

    }


    /*
        Display explanation.
    */

    resultExplanation.textContent =
        result.explanation;


    /*
        Show result.
    */

    resultSection.classList.add("show");


    /*
        Animate progress bars
        after the result becomes visible.
    */

    requestAnimationFrame(() => {

        setTimeout(() => {

            scoreBarA.style.width =
                `${result.scoreA}%`;

            scoreBarB.style.width =
                `${result.scoreB}%`;

        }, 150);

    });


    /*
        Scroll to result.
    */

    setTimeout(() => {

        resultSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 250);

}


/* =========================================
   RESET COMPARISON
   ========================================= */

function resetComparison() {

    if (comparisonTimer) {

        clearTimeout(comparisonTimer);

        comparisonTimer = null;

    }


    /*
        Revoke old object URLs.
    */

    if (objectUrlA) {

        URL.revokeObjectURL(objectUrlA);

        objectUrlA = null;

    }

    if (objectUrlB) {

        URL.revokeObjectURL(objectUrlB);

        objectUrlB = null;

    }


    /*
        Clear state.
    */

    imageA = null;
    imageB = null;


    /*
        Clear inputs.
    */

    fileA.value = "";
    fileB.value = "";


    /*
        Clear previews.
    */

    previewA.src = "";
    previewB.src = "";


    /*
        Restore placeholders.
    */

    placeholderA.style.display = "flex";
    placeholderB.style.display = "flex";

    previewContainerA.classList.remove("show");
    previewContainerB.classList.remove("show");


    /*
        Restore status.
    */

    statusA.textContent = "No image selected";
    statusB.textContent = "No image selected";

    statusA.classList.remove("success");
    statusB.classList.remove("success");


    /*
        Hide result.
    */

    resultSection.classList.remove("show");


    /*
        Reset scores.
    */

    scoreBarA.style.width = "0";
    scoreBarB.style.width = "0";


    /*
        Reset loading.
    */

    loadingArea.classList.remove("show");

    compareBtn.style.display = "inline-flex";

    hideError();


    /*
        Update button.
    */

    updateCompareButton();


    /*
        Scroll back to upload area.
    */

    document.querySelector(
        ".comparison-section"
    ).scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   ERROR FUNCTIONS
   ========================================= */

function showError(message) {

    errorMessage.textContent = message;

    errorMessage.classList.add("show");

}


function hideError() {

    errorMessage.classList.remove("show");

}


/* =========================================
   MOBILE MENU
   ========================================= */

function setupMenu() {

    menuBtn.addEventListener("click", () => {

        mobileMenu.classList.toggle("show");

    });


    const mobileLinks =
        mobileMenu.querySelectorAll("a");

    mobileLinks.forEach((link) => {

        link.addEventListener("click", () => {

            mobileMenu.classList.remove("show");

        });

    });

}


/* =========================================
   DRAG & DROP SUPPORT
   ========================================= */

const uploadAreas = [
    {
        area: document.getElementById("uploadAreaA"),
        input: fileA,
        person: "A"
    },
    {
        area: document.getElementById("uploadAreaB"),
        input: fileB,
        person: "B"
    }
];


uploadAreas.forEach((item) => {

    item.area.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            item.area.style.borderColor =
                "var(--orange)";

        }
    );


    item.area.addEventListener(
        "dragleave",
        () => {

            item.area.style.borderColor =
                "";

        }
    );


    item.area.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            item.area.style.borderColor =
                "";

            const file =
                event.dataTransfer.files[0];

            if (!file) {
                return;
            }

            if (!validateImage(file)) {

                showError(
                    "Please choose a valid coconut image."
                );

                return;
            }

            hideError();

            showPreview(
                file,
                item.person
            );

        }
    );

});