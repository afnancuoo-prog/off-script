```javascript
"use strict";


/* =========================================
   MOBILE MENU
========================================= */

const menuBtn =
    document.getElementById("menuBtn");

const navLinks =
    document.getElementById("navLinks");


if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", function () {

        navLinks.classList.toggle("active");

        const isOpen =
            navLinks.classList.contains("active");

        menuBtn.textContent =
            isOpen ? "✕" : "☰";

    });


    const mobileLinks =
        navLinks.querySelectorAll("a");


    mobileLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("active");

            menuBtn.textContent = "☰";

        });

    });

}


/* =========================================
   TOAST MESSAGE
========================================= */

function showMessage(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }


    const toastText =
        toast.querySelector("p");


    if (toastText) {

        toastText.textContent =
            message;

    } else {

        toast.textContent =
            message;

    }


    toast.classList.add("show");


    clearTimeout(window.toastTimer);


    window.toastTimer =
        setTimeout(function () {

            toast.classList.remove("show");

        }, 2500);

}


/* =========================================
   AUTH MODAL
========================================= */

function openAuth(type) {

    const modal =
        document.getElementById("authModal");

    const title =
        document.getElementById("authTitle");


    if (!modal || !title) {
        return;
    }


    title.textContent =
        type;


    modal.style.display =
        "flex";

}


function closeAuth() {

    const modal =
        document.getElementById("authModal");


    if (!modal) {
        return;
    }


    modal.style.display =
        "none";

}


/* =========================================
   CLOSE AUTH WHEN CLICKING OUTSIDE
========================================= */

const authModal =
    document.getElementById("authModal");


if (authModal) {

    authModal.addEventListener(
        "click",
        function (event) {

            if (event.target === authModal) {

                closeAuth();

            }

        }
    );

}


/* =========================================
   EXAMPLE CARDS
========================================= */

const exampleCards =
    document.querySelectorAll(
        ".example-card"
    );


exampleCards.forEach(function (card) {

    card.addEventListener(
        "click",
        function () {

            const titleElement =
                card.querySelector("h3");


            if (!titleElement) {
                return;
            }


            const title =
                titleElement.textContent.trim();


            /*
             * Banana and Coconut are handled
             * directly by onclick in index.html.
             *
             * We deliberately do NOT navigate
             * them here again.
             */


            if (
                title === "Banana" ||
                title === "Coconut"
            ) {

                return;

            }


            /* Anything */

            if (title === "Anything") {

                showMessage(
                    "Compare Anything will be available in the next phase! 🚀"
                );

                return;

            }


            /* Other examples */

            showMessage(
                title +
                " comparison will be available in the next phase! 🚀"
            );

        }
    );

});


/* =========================================
   SMOOTH SCROLL
========================================= */

const internalLinks =
    document.querySelectorAll(
        'a[href^="#"]'
    );


internalLinks.forEach(function (link) {

    link.addEventListener(
        "click",
        function (event) {

            const targetId =
                link.getAttribute("href");


            if (
                !targetId ||
                targetId === "#"
            ) {

                return;

            }


            const target =
                document.querySelector(
                    targetId
                );


            if (!target) {
                return;
            }


            event.preventDefault();


            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

});


/* =========================================
   SCROLL REVEAL
========================================= */

const revealElements =
    document.querySelectorAll(
        ".example-card, .step-card, .anything-card, .bet-card"
    );


if (
    "IntersectionObserver" in window
) {

    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(
                    function (entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(
        function (element) {

            observer.observe(element);

        }
    );

} else {

    revealElements.forEach(
        function (element) {

            element.classList.add(
                "visible"
            );

        }
    );

}


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeAuth();


            if (navLinks) {

                navLinks.classList.remove(
                    "active"
                );

            }


            if (menuBtn) {

                menuBtn.textContent =
                    "☰";

            }

        }

    }
);


/* =========================================
   WINDOW RESIZE
========================================= */

window.addEventListener(
    "resize",
    function () {

        if (window.innerWidth > 700) {

            if (navLinks) {

                navLinks.classList.remove(
                    "active"
                );

            }


            if (menuBtn) {

                menuBtn.textContent =
                    "☰";

            }

        }

    }
);
```
