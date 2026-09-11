/* =====================================================
   ITHAANO ATHAANO
   BANANA COMPARISON
   FRONTEND PROTOTYPE
===================================================== */


/* ================= ELEMENTS ================= */

const menuToggle =
    document.getElementById("menuToggle");

const navLinks =
    document.getElementById("navLinks");


const imageInputA =
    document.getElementById("imageInputA");

const imageInputB =
    document.getElementById("imageInputB");


const uploadBoxA =
    document.getElementById("uploadBoxA");

const uploadBoxB =
    document.getElementById("uploadBoxB");


const previewA =
    document.getElementById("previewA");

const previewB =
    document.getElementById("previewB");


const placeholderA =
    document.getElementById("placeholderA");

const placeholderB =
    document.getElementById("placeholderB");


const previewContainerA =
    document.getElementById(
        "previewContainerA"
    );

const previewContainerB =
    document.getElementById(
        "previewContainerB"
    );


const changeImageA =
    document.getElementById(
        "changeImageA"
    );

const changeImageB =
    document.getElementById(
        "changeImageB"
    );


const statusA =
    document.getElementById("statusA");

const statusB =
    document.getElementById("statusB");


const compareBtn =
    document.getElementById("compareBtn");

const compareHint =
    document.getElementById(
        "compareHint"
    );

const optionButtons =
    document.querySelectorAll(".option-btn");


const errorMessage =
    document.getElementById(
        "errorMessage"
    );

const errorText =
    document.getElementById(
        "errorText"
    );


const loadingSection =
    document.getElementById(
        "loadingSection"
    );

const resultSection =
    document.getElementById(
        "resultSection"
    );


const resultImageA =
    document.getElementById(
        "resultImageA"
    );

const resultImageB =
    document.getElementById(
        "resultImageB"
    );


const resultPersonA =
    document.getElementById(
        "resultPersonA"
    );

const resultPersonB =
    document.getElementById(
        "resultPersonB"
    );


const winnerName =
    document.getElementById(
        "winnerName"
    );

const winnerReason =
    document.getElementById(
        "winnerReason"
    );


const scoreA =
    document.getElementById("scoreA");

const scoreB =
    document.getElementById("scoreB");


const scoreAText =
    document.getElementById(
        "scoreAText"
    );

const scoreBText =
    document.getElementById(
        "scoreBText"
    );


const againBtn =
    document.getElementById(
        "againBtn"
    );


/* ================= STATE ================= */

let imageA = null;

let imageB = null;

let selectedCriterion = "curvature";

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


/* ================= MOBILE MENU ================= */

if (menuToggle && navLinks) {

    menuToggle.addEventListener(
        "click",
        () => {

            navLinks.classList.toggle(
                "active"
            );


            if (
                navLinks.classList.contains(
                    "active"
                )
            ) {

                menuToggle.textContent =
                    "✕";

            } else {

                menuToggle.textContent =
                    "☰";

            }

        }
    );


    document
        .querySelectorAll(
            ".nav-links a"
        )
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    navLinks.classList.remove(
                        "active"
                    );

                    menuToggle.textContent =
                        "☰";

                }
            );

        });

}


/* ================= UPLOAD BOXES ================= */

uploadBoxA.addEventListener(
    "click",
    () => {

        imageInputA.click();

    }
);


uploadBoxB.addEventListener(
    "click",
    () => {

        imageInputB.click();

    }
);


/* ================= KEYBOARD ================= */

uploadBoxA.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            imageInputA.click();

        }

    }
);


uploadBoxB.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            imageInputB.click();

        }

    }
);


/* ================= INPUT CHANGE ================= */

imageInputA.addEventListener(
    "change",
    (event) => {

        handleImageUpload(
            event,
            "A"
        );

    }
);


imageInputB.addEventListener(
    "change",
    (event) => {

        handleImageUpload(
            event,
            "B"
        );

    }
);


/* ================= CHANGE IMAGE ================= */

changeImageA.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        imageInputA.click();

    }
);


changeImageB.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        imageInputB.click();

    }
);


/* ================= HANDLE UPLOAD ================= */

function handleImageUpload(
    event,
    person
) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    if (
        !validateImages(file)
    ) {

        event.target.value = "";

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function (readerEvent) {

            const imageURL =
                readerEvent.target.result;


            if (person === "A") {

                imageA =
                    imageURL;


                showPreview(
                    "A",
                    imageURL
                );

            } else {

                imageB =
                    imageURL;


                showPreview(
                    "B",
                    imageURL
                );

            }


            hideError();

            validateImagesReady();

        };


    reader.onerror =
        function () {

            showError(
                "We couldn't read that image. Please try another one."
            );

        };


    reader.readAsDataURL(file);

}


/* ================= VALIDATION ================= */

function validateImages(file) {

    if (
        !file.type ||
        !file.type.startsWith(
            "image/"
        )
    ) {

        showError(
            "Please choose a valid banana image."
        );

        return false;

    }


    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        showError(
            "Please choose an image smaller than 10 MB."
        );

        return false;

    }


    return true;

}


/* ================= SHOW PREVIEW ================= */

function showPreview(
    person,
    imageURL
) {

    if (person === "A") {

        previewA.src =
            imageURL;


        placeholderA.style.display =
            "none";


        previewContainerA.hidden =
            false;


        changeImageA.hidden =
            false;


        statusA.textContent =
            "Banana image ready ✓";


        statusA.classList.add(
            "success"
        );


        uploadBoxA.classList.add(
            "uploaded"
        );

    }


    if (person === "B") {

        previewB.src =
            imageURL;


        placeholderB.style.display =
            "none";


        previewContainerB.hidden =
            false;


        changeImageB.hidden =
            false;


        statusB.textContent =
            "Banana image ready ✓";


        statusB.classList.add(
            "success"
        );


        uploadBoxB.classList.add(
            "uploaded"
        );

    }

}


/* ================= CHECK BOTH ================= */

function validateImagesReady() {

    const bothReady =
        imageA !== null &&
        imageB !== null;


    compareBtn.disabled =
        !bothReady;


    if (bothReady) {

        compareHint.textContent =
            "Both bananas are ready. Let's settle the debate! 🏆";

    } else {

        compareHint.textContent =
            "Upload both banana images to continue.";

    }

}


/* ================= ERROR ================= */

function showError(message) {

    errorText.textContent =
        message;


    errorMessage.classList.add(
        "show"
    );

}


function hideError() {

    errorMessage.classList.remove(
        "show"
    );

}


/* ================= COMPARE BUTTON ================= */

compareBtn.addEventListener(
    "click",
    () => {

        compareBananas();

    }
);


/* ================= COMPARE ================= */

async function compareBananas() {

    if (
        !imageA ||
        !imageB
    ) {

        showError(
            "Please upload both banana images first."
        );

        return;

    }


    hideError();


    compareBtn.disabled =
        true;


    compareHint.textContent =
        "Preparing the comparison...";


    loadingSection.hidden =
        false;


    loadingSection.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    try {
        const result = await compareWithGemini("banana", selectedCriterion, imageA, imageB);
        showResult(result);
    } catch (error) {
        loadingSection.hidden = true;
        compareBtn.disabled = false;
        compareHint.textContent = "Upload both banana images to continue.";
        showError(error.message);
    }

}


/* =====================================================
   PROTOTYPE ANALYSIS
===================================================== */

/*
    IMPORTANT:

    This function DOES NOT analyze the photographs.

    The values are demo values used only to test
    the complete UI.

    Later this function can be replaced with
    actual AI/image analysis.
*/

function analyzeBananaCurvature(
    imageA,
    imageB
) {

    const scoreA = 90;

    const scoreB = 60;


    let winner;


    if (
        scoreA > scoreB
    ) {

        winner = "A";

    }

    else if (
        scoreB > scoreA
    ) {

        winner = "B";

    }

    else {

        winner = "TIE";

    }


    return {

        winner: winner,

        scoreA: scoreA,

        scoreB: scoreB,

        explanation:
            "Person A's banana appears more curved in this prototype comparison."

    };

}


/* ================= SHOW RESULT ================= */

function showResult(result) {

    loadingSection.hidden =
        true;


    resultSection.hidden =
        false;


    /*
        Display the exact uploaded
        images in the result section.
    */

    resultImageA.src =
        imageA;


    resultImageB.src =
        imageB;


    /*
        Reset previous winner styling.
    */

    resultPersonA.classList.remove(
        "winner"
    );

    resultPersonB.classList.remove(
        "winner"
    );


    /*
        Reset bars before animating.
    */

    scoreA.style.width =
        "0%";

    scoreB.style.width =
        "0%";


    scoreAText.textContent =
        result.scoreA + "%";


    scoreBText.textContent =
        result.scoreB + "%";


    /*
        Winner
    */

    if (
        result.winner === "A"
    ) {

        resultPersonA.classList.add(
            "winner"
        );


        winnerName.textContent =
            "Person A Wins!";


        winnerReason.textContent =
            result.explanation;

    }


    else if (
        result.winner === "B"
    ) {

        resultPersonB.classList.add(
            "winner"
        );


        winnerName.textContent =
            "Person B Wins!";


        winnerReason.textContent =
            result.explanation;

    }


    else {

        winnerName.textContent =
            "It's a Tie!";


        winnerReason.textContent =
            result.explanation;

    }


    /*
        Animate curvature bars.
    */

    setTimeout(
        () => {

            scoreA.style.width =
                result.scoreA + "%";


            scoreB.style.width =
                result.scoreB + "%";

        },
        150
    );


    /*
        Scroll to result.
    */

    setTimeout(
        () => {

            resultSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        },
        250
    );

}


/* ================= RESET ================= */

againBtn.addEventListener(
    "click",
    () => {

        resetComparison();

    }
);


function resetComparison() {

    /*
        Clear state
    */

    imageA = null;

    imageB = null;


    /*
        Clear file inputs
    */

    imageInputA.value = "";

    imageInputB.value = "";


    /*
        Clear image previews
    */

    previewA.src = "";

    previewB.src = "";

    resultImageA.src = "";

    resultImageB.src = "";


    /*
        Show upload placeholders
    */

    placeholderA.style.display =
        "block";

    placeholderB.style.display =
        "block";


    /*
        Hide previews
    */

    previewContainerA.hidden =
        true;

    previewContainerB.hidden =
        true;


    /*
        Hide change buttons
    */

    changeImageA.hidden =
        true;

    changeImageB.hidden =
        true;


    /*
        Reset status
    */

    statusA.textContent =
        "Waiting for banana...";

    statusB.textContent =
        "Waiting for banana...";


    statusA.classList.remove(
        "success"
    );

    statusB.classList.remove(
        "success"
    );


    /*
        Reset comparison
    */

    compareBtn.disabled =
        true;


    compareHint.textContent =
        "Upload both banana images to continue.";


    /*
        Reset result bars
    */

    scoreA.style.width =
        "0%";

    scoreB.style.width =
        "0%";


    scoreAText.textContent =
        "90%";

    scoreBText.textContent =
        "60%";


    /*
        Remove winner
    */

    resultPersonA.classList.remove(
        "winner"
    );

    resultPersonB.classList.remove(
        "winner"
    );


    /*
        Hide sections
    */

    resultSection.hidden =
        true;

    loadingSection.hidden =
        true;


    /*
        Hide errors
    */

    hideError();


    /*
        Scroll back
    */

    document
        .getElementById(
            "comparison"
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

}


/* ================= PAGE LOAD ================= */

window.addEventListener(
    "load",
    () => {

        document.body.classList.add(
            "loaded"
        );

    }
);