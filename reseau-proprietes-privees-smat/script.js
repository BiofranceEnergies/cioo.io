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
    const phoneInput = document.querySelector('input[name="telephone"], input[name="phone"], #phone');

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Garde uniquement les chiffres
            if (value.length > 10) value = value.substring(0, 10);
            const formattedValue = value.replace(/(\d{2})(?=\d)/g, '$1 ');
            e.target.value = formattedValue;
        });
    }


    // --- 3. LECTURE VIDÉO IMMERSION (SMARTPHONE) ---
    const bgVideo = document.querySelector('.header-bg-video');
    if (bgVideo && bgVideo.tagName === 'VIDEO') {
        bgVideo.muted = true;
        bgVideo.play().catch(() => {
            // Reprise automatique dès la première interaction si Chrome bloque l'autoplay
            const startOnInteraction = () => {
                bgVideo.play();
                window.removeEventListener('click', startOnInteraction);
                window.removeEventListener('touchstart', startOnInteraction);
            };
            window.addEventListener('click', startOnInteraction);
            window.addEventListener('touchstart', startOnInteraction);
        });
    }


    // --- 4. GESTION COOKIES RGPD (Consent Mode V2) ---
    const cookieBanner = document.getElementById('cookie-banner') || document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookie-accept') || document.getElementById('cookieAccept');
    const rejectBtn = document.getElementById('cookie-reject') || document.getElementById('cookieRefuse');

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


    // --- 5. GESTION MODALE VIDÉO MÉTHODE (50 SECONDES) ---
    const videoModal = document.getElementById("video-modal") || document.getElementById("videoModal");
    const openVideoBtn = document.getElementById("open-video-btn") || document.getElementById("openVideoBtn");
    const closeVideoBtn = document.getElementById("close-video") || document.getElementById("closeVideoBtn");
    const youtubePlayer = document.getElementById("youtube-player") || document.getElementById("videoIframe");
    const videoUrl = "https://www.youtube.com/embed/ePCvHf_q9JE?autoplay=1";

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


    // --- 6. GESTION MENTIONS LÉGALES (Modale) ---
    const legalModal = document.getElementById("legal-modal") || document.getElementById("legalModal");
    const openLegalBtn = document.getElementById("open-legal") || document.getElementById("openModalBtn");
    const closeLegalBtn = legalModal ? (legalModal.querySelector(".close-btn") || document.getElementById("closeModalBtn")) : null;
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


  // --- 7. SOUMISSION ASYNCHRONE FORMULAIRE FORMSPREE & NTFY ---
    const contactForm = document.getElementById("contact-form") || document.querySelector(".clean-form");
    const submitBtn = document.getElementById("submit-button") || (contactForm ? contactForm.querySelector('button[type="submit"]') : null);

    const NTFY_TOPIC = "lp-visite-sylvain-982";

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "<span>Envoi en cours...</span>";
            }

            const formData = new FormData(contactForm);

            const nom = formData.get('name') || 'Non renseigné';
            const telephone = formData.get('telephone') || formData.get('phone') || 'Non renseigné';
            const email = formData.get('email') || 'Non renseigné';
            const adresse = formData.get('address') || 'Non renseignée';

            const ntfyMessage = `Nouveau prospect vendeur !\n\n👤 Nom : ${nom}\n📞 Tél : ${telephone}\n📧 Email : ${email}\n📍 Commune : ${adresse}`;

            // 1. Envoi de l'alerte push sur ton smartphone
            const ntfyRequest = fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
                method: 'POST',
                body: ntfyMessage,
                headers: {
                    'Title': '🚨 Nouveau Lead LP Nontron',
                    'Priority': 'urgent',
                    'Tags': 'house,telephone_receiver'
                }
            }).catch(err => console.error("Erreur ntfy:", err));

            // 2. Envoi habituel vers Formspree
            const formspreeRequest = fetch(contactForm.action, {
                method: contactForm.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).catch(err => console.error("Erreur Formspree:", err));

            // Redirection dès que les deux requêtes sont parties
            Promise.allSettled([formspreeRequest, ntfyRequest]).then(() => {
                window.location.href = "https://cioo.io/reseau-proprietes-privees-smat/merci.html";
            });
        });
    }
