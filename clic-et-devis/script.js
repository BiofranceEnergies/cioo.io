document.addEventListener('DOMContentLoaded', () => {
    
    // On sélectionne tous les éléments qui ont la classe 'anim'
    const elementsToAnimate = document.querySelectorAll('.anim');

    // On utilise l'IntersectionObserver : c'est la façon moderne et performante
    // de détecter quand un élément est visible à l'écran
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Si l'élément est visible
            if (entry.isIntersecting) {
                // On ajoute la classe 'visible' qui déclenche le CSS
                entry.target.classList.add('visible');
                // On arrête d'observer cet élément (l'anim ne se joue qu'une fois)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // L'animation se lance quand 10% de l'élément est visible
    });

    // On lance l'observation sur chaque élément
    elementsToAnimate.forEach(el => observer.observe(el));
});

// --- GESTION DES MENTIONS LÉGALES ---
const modal = document.getElementById("legal-modal");
const btn = document.getElementById("open-legal");
const span = document.getElementsByClassName("close-btn")[0];

// Ouvrir
if(btn) {
    btn.onclick = function(e) {
      e.preventDefault();
      modal.style.display = "block";
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
// --- FORMATAGE AUTOMATIQUE TÉLÉPHONE (00 00 00 00 00) ---
const phoneInput = document.querySelector('input[name="telephone"]');

if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        // 1. On nettoie : on garde uniquement les chiffres (supprime lettres, espaces, tirets...)
        let value = e.target.value.replace(/\D/g, '');

        // 2. On limite à 10 chiffres (format français standard)
        if (value.length > 10) value = value.substring(0, 10);

        // 3. On ajoute un espace tous les 2 chiffres
        // La regex cherche 2 chiffres suivis d'un autre chiffre, et insère un espace
        const formattedValue = value.replace(/(\d{2})(?=\d)/g, '$1 ');

        // 4. On met à jour le champ
        e.target.value = formattedValue;
    });
}
// --- GESTION COOKIES RGPD ---
const cookieBanner = document.getElementById('cookie-banner');
const acceptBtn = document.getElementById('cookie-accept');
const rejectBtn = document.getElementById('cookie-reject');

// Fonction pour lancer les scripts de tracking (Google Ads, etc.)
function loadTrackingScripts() {
    console.log("Cookies acceptés : Chargement de Google Analytics / Ads...");
    
    // ICI : C'est là que tu colleras ton code Google (gtag.js) plus tard.
    // Pour l'instant, c'est vide, donc compliant à 100%.
}

// Vérifier si l'utilisateur a déjà choisi
const consent = localStorage.getItem('cookieConsent');

if (!consent) {
    // Si pas de choix, on affiche la bannière après 1 seconde (effet doux)
    setTimeout(() => {
        if(cookieBanner) cookieBanner.classList.add('show');
    }, 1000);
} else if (consent === 'accepted') {
    // S'il a déjà accepté avant, on charge les scripts direct
    loadTrackingScripts();
}

// Clic sur "Accepter"
if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted'); // On mémorise
        cookieBanner.classList.remove('show'); // On cache
        loadTrackingScripts(); // On lance le tracking
    });
}

// Clic sur "Continuer sans"
if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected'); // On mémorise le refus
        cookieBanner.classList.remove('show'); // On cache
        // On ne charge RIEN.
    });
}

// Ouvre la modale Mentions Légales depuis la bannière cookies
const linkCookies = document.getElementById('open-legal-cookies');
if(linkCookies) {
    linkCookies.onclick = function(e) {
        e.preventDefault();
        // On vérifie que la modale existe avant de l'ouvrir
        const modal = document.getElementById("legal-modal");
        if(modal) modal.style.display = "block";
    }
}
