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

        if(cookieBanner) {
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
            if(cookieBanner) cookieBanner.classList.add('show');
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
});


// --- 4. GESTION DES MENTIONS LÉGALES (Modale) ---
const modal = document.getElementById("legal-modal");
const btn = document.getElementById("open-legal");
const span = document.getElementsByClassName("close-btn")[0];
const linkCookies = document.getElementById('open-legal-cookies');

if(btn) {
    btn.onclick = function(e) {
        e.preventDefault();
        modal.style.display = "block";
    }
}

if(linkCookies) {
    linkCookies.onclick = function(e) {
        e.preventDefault();
        if(modal) modal.style.display = "block";
    }
}

if(span) {
    span.onclick = function() {
        modal.style.display = "none";
    }
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
const form = document.getElementById("contact-form");
const button = document.getElementById("submit-button");

if (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // On bloque la redirection par défaut de Formspree vers sa page grise
        
        if (button) {
            button.disabled = true;
            button.innerHTML = "<span>Envoi en cours...</span>";
        }

        const data = new FormData(form);

        fetch(form.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            // On force la redirection vers TA page de remerciement Mandat
            window.location.href = "https://cioo.io/reseau-proprietes-privees-smat/merci.html";
        }).catch(error => {
            // En cas de coupure ou problème, on redirige quand même pour ne pas perdre le client
            window.location.href = "https://cioo.io/reseau-proprietes-privees-smat/merci.html";
        });
    });
}
