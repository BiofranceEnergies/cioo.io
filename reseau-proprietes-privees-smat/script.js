document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ANIMATIONS AU SCROLL ---
    const elementsToAnimate = document.querySelectorAll('.anim');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elementsToAnimate.forEach(el => observer.observe(el));


    // --- 2. FORMATAGE AUTOMATIQUE TÉLÉPHONE (00 00 00 00 00) ---
    const phoneInput = document.querySelector('input[name="telephone"]');

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Garde uniquement les chiffres
            if (value.length > 10) value = value.substring(0, 10);
            const formattedValue = value.replace(/(\d{2})(?=\d)/g, '$1 ');
            e.target.value = formattedValue;
        });
    }


    // --- 3. GESTION COOKIES RGPD (Consent Mode V2) ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');

    function updateConsent(granted) {
        const status = granted ? 'granted' : 'denied';

        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': status,
                'ad_user_data': status,
                'ad_personalization': status,
                'analytics_storage': status
            });
            console.log("Consentement mis à jour : " + status);
        }

        if (cookieBanner) {
            cookieBanner.classList.remove('show');
        }

        localStorage.setItem('cookieConsent', granted ? 'accepted' : 'rejected');
    }

    const savedConsent = localStorage.getItem('cookieConsent');

    if (savedConsent === 'accepted') {
        updateConsent(true);
    } else if (savedConsent === 'rejected') {
        // Reste bloqué par défaut
    } else {
        setTimeout(() => {
            if (cookieBanner) cookieBanner.classList.add('show');
        }, 1000);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            updateConsent(true);
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            updateConsent(false);
        });
    }


    // --- 4. GESTION MODALE VIDÉO MÉTHODE (50 SECONDES) ---
    const videoModal = document.getElementById("video-modal");
    const openVideoBtn = document.getElementById("open-video-btn");
    const closeVideoBtn = document.getElementById("close-video");
    const youtubePlayer = document.getElementById("youtube-player");
    const videoUrl = "https://www.youtube-nocookie.com/embed/ePCvHf_q9JE?autoplay=1&rel=0";

    if (openVideoBtn && videoModal && youtubePlayer) {
        openVideoBtn.addEventListener("click", (e) => {
            e.preventDefault();
            youtubePlayer.src = videoUrl; // Lance la vidéo avec son
            videoModal.style.display = "block";
        });

        const stopAndCloseVideo = () => {
            videoModal.style.display = "none";
            youtubePlayer.src = ""; // Coupe immédiatement la lecture et le son
        };

        if (closeVideoBtn) {
            closeVideoBtn.addEventListener("click", stopAndCloseVideo);
        }

        window.addEventListener("click", (event) => {
            if (event.target === videoModal) {
                stopAndCloseVideo();
            }
        });
    }


    // --- 5. GESTION MENTIONS LÉGALES (Modale) ---
    const legalModal = document.getElementById("legal-modal");
    const openLegalBtn = document.getElementById("open-legal");
    const closeLegalBtn = legalModal ? legalModal.querySelector(".close-btn") : null;
    const linkCookies = document.getElementById('open-legal-cookies');

    if (openLegalBtn && legalModal) {
        openLegalBtn.addEventListener("click", (e) => {
            e.preventDefault();
            legalModal.style.display = "block";
        });
    }

    if (linkCookies && legalModal) {
        linkCookies.addEventListener("click", (e) => {
            e.preventDefault();
            legalModal.style.display = "block";
        });
    }

    if (closeLegalBtn && legalModal) {
        closeLegalBtn.addEventListener("click", () => {
            legalModal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === legalModal) {
            legalModal.style.display = "none";
        }
    });


    // --- 6. SOUMISSION ASYNCHRONE FORMULAIRE FORMSPREE ---
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-button");

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "<span>Envoi en cours...</span>";
            }

            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: contactForm.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(() => {
                window.location.href = "https://cioo.io/reseau-proprietes-privees-smat/merci.html";
            }).catch(() => {
                window.location.href = "https://cioo.io/reseau-proprietes-privees-smat/merci.html";
            });
        });
    }

});
