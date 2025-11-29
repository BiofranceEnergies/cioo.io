/* =========================================
   1. CONFIGURATION & DONNÉES
   ========================================= */
const SOLAR_DATA = [
  {"Departement":"78","PrixKwh":"0,24","Puissance":"3 kWc","Prod":3334,"Seuil":4000,"Panels":6,"Prix":5900,"RemiseChantier":300,"Mensualite":49.18,"Mois":180,"Taeg":5.96,"Total":8850.15},
  {"Departement":"78","PrixKwh":"0,24","Puissance":"4.5 kWc","Prod":5151,"Seuil":6000,"Panels":9,"Prix":7900,"RemiseChantier":300,"Mensualite":65.85,"Mois":180,"Taeg":5.96,"Total":11850.98},
  {"Departement":"78","PrixKwh":"0,24","Puissance":"6 kWc","Prod":6838,"Seuil":8000,"Panels":12,"Prix":8900,"RemiseChantier":300,"Mensualite":74.18,"Mois":180,"Taeg":5.96,"Total":13351.77},
  {"Departement":"78","PrixKwh":"0,24","Puissance":"7.5 kWc","Prod":8535,"Seuil":10000,"Panels":15,"Prix":9900,"RemiseChantier":300,"Mensualite":82.42,"Mois":180,"Taeg":5.96,"Total":14851.47},
  {"Departement":"78","PrixKwh":"0,24","Puissance":"9 kWc","Prod":10302,"Seuil":12000,"Panels":18,"Prix":10900,"RemiseChantier":300,"Mensualite":90.95,"Mois":180,"Taeg":5.96,"Total":16352.36},
  {"Departement":"78","PrixKwh":"0,24","Puissance":"12 kWc","Prod":13700,"Seuil":16000,"Panels":24,"Prix":13900,"RemiseChantier":300,"Mensualite":115.50,"Mois":180,"Taeg":5.96,"Total":20790.00}
];

const DEPARTEMENT_CIBLE = "78"; 
const PRIX_KWH_BASE = 0.24; 

// URL de ton Script Google (Récupérée de l'ancienne LP)
const G_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwhlyD_FMMm2g9JIQAm2Se2xehUqIM2MzWMl1YGl_gP1DJKM_-jZFj_YStDMhWi-0F8XA/exec';

// Variable pour mémoriser le kit choisi par le client
let CURRENT_SELECTION = null;

/* =========================================
   2. LOGIQUE MODALE SIMULATION
   ========================================= */
/* =========================================
   2. LOGIQUE MODALE SIMULATION (+ SIGNAL GOOGLE)
   ========================================= */
function openSimulation(kitName) {
    const data = SOLAR_DATA.find(item => item.Puissance === kitName && item.Departement === DEPARTEMENT_CIBLE);

    if (data) {
        // 1. ON MÉMORISE LA SÉLECTION
        CURRENT_SELECTION = data;

        // 2. ENVOI DU SIGNAL "INTÉRÊT" À GOOGLE ADS (Le mouchard)
        // C'est ici que la magie opère pour ton Quality Score
        if(typeof gtag === 'function') {
            // Signal standard
            gtag('event', 'select_content', {
                'content_type': 'panneaux_solaires',
                'item_id': kitName
            });
            // Signal personnalisé (plus facile à lire dans les rapports)
            gtag('event', 'clic_simulation', {
                'event_category': 'Engagement',
                'event_label': kitName
            });
        }

        // 3. REMPLISSAGE UI (Affichage des chiffres)
        document.getElementById("sim-titre").textContent = data.Puissance;
        document.getElementById("sim-panels").textContent = data.Panels + " Panneaux (500W)";
        document.getElementById("sim-prod").textContent = data.Prod.toLocaleString('fr-FR') + " kWh";
        
        const gainAnnuel = Math.round(data.Prod * PRIX_KWH_BASE);
        document.getElementById("sim-gain").textContent = gainAnnuel.toLocaleString('fr-FR') + " € / an";

        // 4. AFFICHAGE DE LA MODALE
        document.getElementById("sim-modal").style.display = "block";
    } else {
        console.error("Erreur : Pas de données pour " + kitName);
    }
}

function closeModal() {
    document.getElementById("sim-modal").style.display = "none";
}

/* =========================================
   3. ENVOI DU LEAD VERS GOOGLE SHEET (Moteur AppScript)
   ========================================= */
function submitForm(event) {
    event.preventDefault();
    const phoneInput = document.getElementById("user-phone");
    const phone = phoneInput.value;
    const formContainer = document.querySelector('.modal-content');
    
    // Nettoyage du numéro (enlève les espaces)
    const cleanPhone = phone.replace(/\D/g, '');

    if(cleanPhone.length >= 10) {
        
        // --- A. PRÉPARATION DES DONNÉES (LEURRES INCLUS) ---
        // On récupère le GCLID stocké par le bandeau cookie s'il existe
        const storedGclid = localStorage.getItem('gclid_token') || '';
        const sessionId = 'S' + Date.now().toString(36); // ID unique simple

        // Si jamais CURRENT_SELECTION est vide (bug rare), on met des valeurs par défaut
        const sel = CURRENT_SELECTION || { Puissance: 'Inconnue', Prod: 0, Prix: 0 };
        const gainEstime = Math.round(sel.Prod * PRIX_KWH_BASE);

        // On construit l'objet EXACTEMENT comme ton ancien script l'attend
        const payload = {
            event: 'lead',
            unlock: '1',
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            
            // Infos Contact
            telephone: cleanPhone,
            tel: cleanPhone,
            email: '', // Pas demandé
            code_postal: '78000', // Valeur par défaut car on ne demande pas le CP

            // Infos Techniques (Vraies valeurs)
            puissance: sel.Puissance,
            panneaux: sel.Panels || 0,
            prod: sel.Prod || 0,
            prix: sel.Prix || 0,
            
            // Infos Financières (Vraies valeurs estimées)
            eco1: gainEstime, // Gain année 1
            ecomensuelle: Math.round(gainEstime / 12),
            
            // LEURRES (Pour satisfaire le vieux script)
            facture: 0,
            conso: 0,
            source_conso: 'simulation_rapide',
            prix_kwh: PRIX_KWH_BASE,
            remise: 0,
            mensualite: 0,
            taeg: 0,
            totalcredit: 0,
            mois: 0,
            eco15: 0,
            emailUser: '',
            
            // Tracking
            gclid: storedGclid
        };

        // --- B. ENVOI DES DONNÉES (Invisible pour l'utilisateur) ---
        // On transforme l'objet en paramètres d'URL
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(payload)) {
            params.append(k, v);
        }

        // On envoie via fetch en mode "no-cors"
        fetch(G_SCRIPT_URL, {
            method: 'POST',
            body: params
        }).catch(e => console.error("Erreur envoi:", e));

        // --- C. AFFICHAGE SUCCÈS (Immédiat) ---
        formContainer.innerHTML = `
            <span class="close-btn" onclick="closeModal()">&times;</span>
            <div class="success-animation">
                <div class="checkmark-circle">
                    <span class="checkmark">✓</span>
                </div>
                <h2 style="color:white; margin-bottom:10px; font-weight:800;">Demande Transmise !</h2>
                <p style="color:#cbd5e1; font-size:1rem;">
                    Votre simulation a bien été enregistrée.
                </p>
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; margin:20px 0;">
                    <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:5px;">Un technicien Biofrance vous rappellera au :</p>
                    <strong style="color:white; font-size:1.2rem;">${phone}</strong>
                </div>
                <p style="color:#cbd5e1; font-size:0.9rem;">Délai moyen de réponse : <span style="color:#F59E0B">Moins de 24h</span>.</p>
                <button class="full-width" onclick="closeModal()" style="margin-top:25px;">Retour au site</button>
            </div>
        `;
        
        // Tracking Conversion Google
        if(typeof gtag === 'function') {
            gtag('event', 'conversion', {'send_to': 'AW-11242044118/DO1tCKLg97sbENb1z_Ap'});
        }

    } else {
        alert("Merci de vérifier votre numéro de téléphone (10 chiffres).");
    }
}

/* =========================================
   4. FORMATAGE TÉLÉPHONE
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('user-phone');
    if(phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.substring(0, 10);
            const formatted = value.match(/.{1,2}/g)?.join(' ') || value;
            e.target.value = formatted;
        });
    }
});

/* =========================================
   5. SCROLL & ANIMATIONS
   ========================================= */
function scrollToTotem() {
    const hero = document.querySelector('.hero-section');
    hero.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        const btns = document.querySelectorAll('.totem-btn');
        btns.forEach(btn => {
            btn.classList.add('highlight-pulse');
            setTimeout(() => btn.classList.remove('highlight-pulse'), 1500);
        });
    }, 800);
}

/* =========================================
   6. GESTION ACCORDÉON FAQ (+ TRACKING)
   ========================================= */
function toggleFaq(element) {
    // 1. On ouvre/ferme visuellement
    element.classList.toggle('active');
    const content = element.querySelector('.faq-content');
    
    if (element.classList.contains('active')) {
        // Si on ouvre -> On déplie
        content.style.maxHeight = content.scrollHeight + "px";
        
        // --- SIGNAL GOOGLE : "Il est curieux !" ---
        if(typeof gtag === 'function') {
            // On récupère le titre de la question (h3) pour savoir ce qu'il a lu
            const questionText = element.querySelector('h3').innerText;
            
            gtag('event', 'faq_open', {
                'event_category': 'Engagement',
                'event_label': questionText
            });
        }
        
    } else {
        // Si on ferme -> On replie
        content.style.maxHeight = null;
    }
    
    // 2. Gestion de l'accordéon (Fermer les autres)
    const allFaqs = document.querySelectorAll('.faq-item');
    allFaqs.forEach(item => {
        if (item !== element && item.classList.contains('active')) {
            item.classList.remove('active');
            item.querySelector('.faq-content').style.maxHeight = null;
        }
    });
}
// Fermeture modale click extérieur (Gère Simu + Legal)
window.onclick = function(event) {
    const simModal = document.getElementById("sim-modal");
    const legalModal = document.getElementById("legal-modal");
    if (event.target == simModal) closeModal();
    if (event.target == legalModal) closeLegalModal();
}

/* =========================================
   6. GESTION DES TEXTES LÉGAUX
   ========================================= */
const LEGAL_CONTENT = {
    mentions: `
        <h3>1. Éditeur du site</h3>
        <p>Le site <strong>Watersoft+</strong> est édité par :<br>
        <strong>cioo.io</strong> Editeur Sylvain Matignon<br>
        Adresse : 4 rue du Pont Saint Jean, 27530 Ézy-sur-Eure<br>
        SIRET : 422 231 928 00025<br>
        Email : contact.cioo.io@gmail.com</p>
        <h3>2. Hébergement</h3>
        <p>Hébergeur technique : <strong>GitHub Pages</strong><br>
        88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA</p>
    `,
    privacy: `
        <h3>1. Données personnelles</h3>
        <p>Les informations recueillies sont destinées à l'établissement de votre étude. Elles ne sont ni vendues, ni stockées à des fins tierces.</p>
        <h3>2. Cookies</h3>
        <p>Ce site utilise des cookies Google Ads pour mesurer la performance publicitaire.</p>
    `,
    conditions: `
        <h3>Gratuité</h3>
        <p>La demande d'étude est gratuite et sans engagement.</p>
    `
};

function openLegalModal(type) {
    const modal = document.getElementById('legal-modal');
    const title = document.getElementById('legal-title');
    const body = document.getElementById('legal-body');

    if (LEGAL_CONTENT[type]) {
        title.textContent = type === 'mentions' ? "Mentions Légales" : type === 'privacy' ? "Politique de Confidentialité" : "Conditions Générales";
        body.innerHTML = LEGAL_CONTENT[type];
        modal.style.display = "block";
    }
}
function closeLegalModal() {
    document.getElementById('legal-modal').style.display = "none";
}

/* =========================================
   7. INTELLIGENCE COOKIES & GCLID
   ========================================= */
document.addEventListener("DOMContentLoaded", function() {
    const banner = document.getElementById('consent-banner');
    const btnAccept = document.getElementById('consent-accept');
    const btnReject = document.getElementById('consent-reject');
    const STORAGE_KEY = 'consent_v2_biofrance';

    const savedConsent = localStorage.getItem(STORAGE_KEY);
    if (savedConsent) {
        updateGoogleConsent(JSON.parse(savedConsent));
    } else {
        if(banner) banner.style.display = 'block';
    }

    if(btnAccept) {
        btnAccept.addEventListener('click', function() {
            const state = { analytics: true, ads: true };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            updateGoogleConsent(state);
            if(banner) banner.style.display = 'none';
        });
    }

    if(btnReject) {
        btnReject.addEventListener('click', function() {
            const state = { analytics: false, ads: false };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            updateGoogleConsent(state);
            if(banner) banner.style.display = 'none';
        });
    }

    function updateGoogleConsent(state) {
        if(typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': state.analytics ? 'granted' : 'denied',
                'ad_storage': state.ads ? 'granted' : 'denied',
                'ad_user_data': state.ads ? 'granted' : 'denied',
                'ad_personalization': state.ads ? 'granted' : 'denied'
            });
        }
    }

    // Capture GCLID
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid');
    if (gclid) {
        localStorage.setItem('gclid_token', gclid);
    }
   // --- C. TRACKING APPELS TÉLÉPHONIQUES (Mobile) ---
    // Surveille tous les liens qui commencent par "tel:"
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            if(typeof gtag === 'function') {
                gtag('event', 'click_telephone', {
                    'event_category': 'Contact',
                    'event_label': this.textContent.trim() // Envoie le numéro cliqué (ex: 06 48...)
                });
            }
        });
    });
});
