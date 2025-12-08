
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
            let value = e.target.value.replace(/\D/g, ''); // Garde que les chiffres
            if (value.length > 10) value = value.substring(0, 10); // Max 10 chiffres
            // Ajoute un espace tous les 2 chiffres
            const formattedValue = value.replace(/(\d{2})(?=\d)/g, '$1 ');
            e.target.value = formattedValue;
        });
    }


    // --- 3. GESTION COOKIES RGPD (Consent Mode V2) ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');

    // Fonction principale qui parle à Google
    function updateConsent(granted) {
        // On définit le statut : 'granted' (oui) ou 'denied' (non)
        const status = granted ? 'granted' : 'denied';

        // On envoie l'info à Google Ads
        // Note: La fonction gtag() est définie dans ton code HTML
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': status,
                'ad_user_data': status,
                'ad_personalization': status,
                'analytics_storage': status
            });
            console.log("Consentement mis à jour : " + status);
        }

        // On cache la bannière
        if(cookieBanner) {
            cookieBanner.classList.remove('show');
        }

        // On sauvegarde le choix dans le navigateur
        localStorage.setItem('cookieConsent', granted ? 'accepted' : 'rejected');
    }

    // A. Vérification au démarrage
    const savedConsent = localStorage.getItem('cookieConsent');

    if (savedConsent === 'accepted') {
        // Si déjà accepté avant, on réactive tout de suite
        updateConsent(true);
    } else if (savedConsent === 'rejected') {
        // Si déjà refusé, on laisse bloqué (le 'denied' par défaut du HTML suffit)
        // On ne fait rien, la bannière reste cachée
    } else {
        // Si aucun choix (nouveau visiteur), on affiche la bannière après 1 seconde
        setTimeout(() => {
            if(cookieBanner) cookieBanner.classList.add('show');
        }, 1000);
    }

    // B. Clic sur "C'est OK pour moi"
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            updateConsent(true);
        });
    }

    // C. Clic sur "Continuer sans"
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            updateConsent(false);
        });
    }
});


// --- 4. GESTION DES MENTIONS LÉGALES (Modale) ---
const modal = document.getElementById("legal-modal");
const btn = document.getElementById("open-legal");
const span = document.getElementsByClassName("close-btn")[0];
const linkCookies = document.getElementById('open-legal-cookies'); // Lien dans la bannière

// Ouvrir depuis le footer
if(btn) {
    btn.onclick = function(e) {
        e.preventDefault();
        modal.style.display = "block";
    }
}

// Ouvrir depuis la bannière cookies
if(linkCookies) {
    linkCookies.onclick = function(e) {
        e.preventDefault();
        if(modal) modal.style.display = "block";
    }
}

// Fermer avec la croix
if(span) {
    span.onclick = function() {
        modal.style.display = "none";
    }
}

// Fermer en cliquant à côté
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
