/* =========================================
   1. DATA (JSON avec Ajout du 12 kWc)
   ========================================= */
const SOLAR_DATA = [
  {"Departement":"78","PrixKwh":"0,24","Puissance":"3 kWc","Prod":3334,"Seuil":4000,"Panels":6,"Prix":5900,"RemiseChantier":300,"Mensualite":49.18,"Mois":180,"Taeg":5.96,"Total":8850.15},
  {"Departement":"78","PrixKwh":"0,24","Puissance":"4.5 kWc","Prod":5151,"Seuil":6000,"Panels":9,"Prix":7900,"RemiseChantier":300,"Mensualite":65.85,"Mois":180,"Taeg":5.96,"Total":11850.98},
  {"Departement":"78","PrixKwh":"0,24","Puissance":"6 kWc","Prod":6838,"Seuil":8000,"Panels":12,"Prix":8900,"RemiseChantier":300,"Mensualite":74.18,"Mois":180,"Taeg":5.96,"Total":13351.77},
  {"Departement":"78","PrixKwh":"0,24","Puissance":"7.5 kWc","Prod":8535,"Seuil":10000,"Panels":15,"Prix":9900,"RemiseChantier":300,"Mensualite":82.42,"Mois":180,"Taeg":5.96,"Total":14851.47},
  {"Departement":"78","PrixKwh":"0,24","Puissance":"9 kWc","Prod":10302,"Seuil":12000,"Panels":18,"Prix":10900,"RemiseChantier":300,"Mensualite":90.95,"Mois":180,"Taeg":5.96,"Total":16352.36},
  
  {"Departement":"78","PrixKwh":"0,24","Puissance":"12 kWc","Prod":13700,"Seuil":16000,"Panels":24,"Prix":13900,"RemiseChantier":300,"Mensualite":115.50,"Mois":180,"Taeg":5.96,"Total":20790.00}
];

// Configuration
const DEPARTEMENT_CIBLE = "78"; 
const PRIX_KWH_BASE = 0.24; 

/* =========================================
   2. LOGIQUE MODALE
   ========================================= */

function openSimulation(kitName) {
    // 1. Trouver la bonne ligne dans le JSON
    const data = SOLAR_DATA.find(item => item.Puissance === kitName && item.Departement === DEPARTEMENT_CIBLE);

    if (data) {
        // 2. Remplir le Titre
        document.getElementById("sim-titre").textContent = data.Puissance;
        
        // 3. Remplir le nombre de Panneaux (C'est ici que c'était mal placé)
        document.getElementById("sim-panels").textContent = data.Panels + " Panneaux (500W)";
        
        // 4. Remplir la Production
        document.getElementById("sim-prod").textContent = data.Prod.toLocaleString('fr-FR') + " kWh";
        
        // 5. Calculer et Remplir le Gain
        const gainAnnuel = Math.round(data.Prod * PRIX_KWH_BASE);
        document.getElementById("sim-gain").textContent = gainAnnuel.toLocaleString('fr-FR') + " € / an";

        // 6. Afficher la modale
        document.getElementById("sim-modal").style.display = "block";
    } else {
        console.error("Erreur : Pas de données pour " + kitName);
        alert("Une erreur est survenue lors de la récupération des données pour ce kit.");
    }
}

function closeModal() {
    document.getElementById("sim-modal").style.display = "none";
}

// Fermer en cliquant à l'extérieur
window.onclick = function(event) {
    const modal = document.getElementById("sim-modal");
    if (event.target == modal) {
        closeModal();
    }
}

/* =========================================
   3. ENVOI DU LEAD
   ========================================= */
function submitForm(event) {
    event.preventDefault();
    const phone = document.getElementById("user-phone").value;
    
    if(phone.length > 9) {
        alert("Demande bien reçue ! Un expert Biofrance vous rappellera au " + phone + " pour valider la faisabilité.");
        closeModal();
    } else {
        alert("Merci de vérifier votre numéro de téléphone.");
    }
}

/* =========================================
   4. FORMATAGE TÉLÉPHONE (AUTO-ESPACE)
   ========================================= */
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('user-phone');
    
    if(phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            // 1. On empêche d'écrire autre chose que des chiffres
            let value = e.target.value.replace(/\D/g, '');
            
            // 2. On limite à 10 chiffres (français)
            if (value.length > 10) value = value.substring(0, 10);
            
            // 3. On ajoute les espaces tous les 2 chiffres
            // Ex: 061234... devient 06 12 34...
            const formatted = value.match(/.{1,2}/g)?.join(' ') || value;
            
            e.target.value = formatted;
        });
    }
});
/* =========================================
   5. SCROLL & HIGHLIGHT (Retour au totem)
   ========================================= */
function scrollToTotem() {
    // 1. On remonte doucement
    const hero = document.querySelector('.hero-section');
    hero.scrollIntoView({ behavior: 'smooth' });

    // 2. Animation après la remontée
    setTimeout(() => {
        // A. On fait flasher les BOUTONS
        const btns = document.querySelectorAll('.totem-btn');
        btns.forEach(btn => {
            btn.classList.add('highlight-pulse');
            setTimeout(() => btn.classList.remove('highlight-pulse'), 1500); // On laisse un peu plus longtemps (1.5s)
        });

        // B. On fait flasher le TEXTE d'instruction (La flèche du bas)
        const instruction = document.querySelector('.instruction-container span');
        if(instruction) {
            instruction.style.color = 'var(--primary)'; // Devient vert
            instruction.style.transition = 'color 0.3s';
            instruction.style.fontWeight = '800'; // Devient très gras
            
            // On remet normal après 1.5s
            setTimeout(() => {
                instruction.style.color = ''; 
                instruction.style.fontWeight = '';
            }, 1500);
        }
        
    }, 800);
}
/* =========================================
   6. GESTION ACCORDÉON FAQ
   ========================================= */
function toggleFaq(element) {
    // 1. Gestion de la classe active pour le style
    element.classList.toggle('active');

    // 2. Gestion de la hauteur (Slide down / Slide up)
    const content = element.querySelector('.faq-content');
    
    if (element.classList.contains('active')) {
        // Si ouvert, on met la hauteur réelle du contenu
        content.style.maxHeight = content.scrollHeight + "px";
    } else {
        // Si fermé, hauteur 0
        content.style.maxHeight = null;
    }
    
    // 3. Optionnel : Fermer les autres quand on en ouvre un
    const allFaqs = document.querySelectorAll('.faq-item');
    allFaqs.forEach(item => {
        if (item !== element && item.classList.contains('active')) {
            item.classList.remove('active');
            item.querySelector('.faq-content').style.maxHeight = null;
        }
    });
}
/* =========================================
   3. ENVOI DU LEAD (Avec Success State)
   ========================================= */
function submitForm(event) {
    event.preventDefault();
    const phone = document.getElementById("user-phone").value;
    const formContainer = document.querySelector('.modal-content'); // On cible le contenu de la modale
    
    // Nettoyage sommaire du numéro
    const cleanPhone = phone.replace(/\s/g, '');

    if(cleanPhone.length >= 10) {
        
        // 1. Simulation d'envoi (Ici tu mettras ton fetch webhook plus tard)
        // console.log("Envoi du lead : " + phone);

        // 2. Remplacement du contenu de la modale par le message de succès
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

        // 3. Tracking Google Ads (À décommenter plus tard)
        // gtag('event', 'conversion', {'send_to': 'AW-XXXXXXXX/Label'});

    } else {
        alert("Merci de vérifier votre numéro de téléphone (10 chiffres).");
    }
}

/* =========================================
   7. GESTION DES TEXTES LÉGAUX (Mise à jour GitHub Pages)
   ========================================= */
const LEGAL_CONTENT = {
    mentions: `
        <h3>1. Éditeur du site</h3>
        <p>Le site <strong>Biofrance Energies</strong> est édité par :<br>
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
        <p>Les informations recueillies via le formulaire sont destinées uniquement à l'établissement de votre étude de faisabilité et au contact commercial. Elles ne sont ni vendues, ni stockées à des fins tierces.</p>

        <h3>2. Cookies</h3>
        <p>Ce site utilise des cookies Google Ads uniquement pour mesurer la performance des campagnes publicitaires, de manière anonyme.</p>
    `,

    conditions: `
        <h3>Gratuité</h3>
        <p style="font-size:1.05rem;">La demande d'étude et de simulation sur ce site est <strong>gratuite et sans engagement</strong>.</p>
        <p>Les chiffres présentés dans le simulateur sont des estimations basées sur un ensoleillement moyen dans les Yvelines et peuvent varier selon l'orientation réelle de votre toiture.</p>
    `
};

function openLegalModal(type) {
    const modal = document.getElementById('legal-modal');
    const title = document.getElementById('legal-title');
    const body = document.getElementById('legal-body');

    if (LEGAL_CONTENT[type]) {
        if(type === 'mentions') title.textContent = "Mentions Légales";
        if(type === 'privacy') title.textContent = "Politique de Confidentialité";
        if(type === 'conditions') title.textContent = "Conditions Générales";
        
        body.innerHTML = LEGAL_CONTENT[type];
        
        modal.style.display = "block";
    }
}

function closeLegalModal() {
    document.getElementById('legal-modal').style.display = "none";
}
/* =========================================
   10. INTELLIGENCE COOKIES & TRACKING (Le Cerveau)
   ========================================= */
document.addEventListener("DOMContentLoaded", function() {

    // --- A. GESTION DU BANDEAU COOKIES ---
    const banner = document.getElementById('consent-banner');
    const btnAccept = document.getElementById('consent-accept');
    const btnReject = document.getElementById('consent-reject');
    const STORAGE_KEY = 'consent_v2_biofrance';

    // 1. Est-ce qu'on a déjà le choix du visiteur ?
    const savedConsent = localStorage.getItem(STORAGE_KEY);

    if (savedConsent) {
        // Oui, on applique ce qu'il a choisi (pas besoin d'afficher le bandeau)
        const consentState = JSON.parse(savedConsent);
        updateGoogleConsent(consentState);
    } else {
        // Non, on affiche le bandeau
        if(banner) banner.style.display = 'block';
    }

    // 2. Clic sur "Tout Accepter"
    if(btnAccept) {
        btnAccept.addEventListener('click', function() {
            const state = { analytics: true, ads: true }; // On autorise tout
            saveAndClose(state);
        });
    }

    // 3. Clic sur "Refuser"
    if(btnReject) {
        btnReject.addEventListener('click', function() {
            const state = { analytics: false, ads: false }; // On refuse tout
            saveAndClose(state);
        });
    }

    function saveAndClose(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); // On sauvegarde
        updateGoogleConsent(state); // On prévient Google
        if(banner) banner.style.display = 'none'; // On cache le bandeau
    }

    function updateGoogleConsent(state) {
        // La fonction magique qui parle à Google Ads
        if(typeof gtag === 'function') {
            gtag('consent', 'update', {
                'analytics_storage': state.analytics ? 'granted' : 'denied',
                'ad_storage': state.ads ? 'granted' : 'denied',
                'ad_user_data': state.ads ? 'granted' : 'denied',
                'ad_personalization': state.ads ? 'granted' : 'denied'
            });
        }
    }

    // --- B. ESPION GOOGLE (CAPTURE GCLID) ---
    // C'est ça qui permet de savoir quel mot-clé a converti
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid'); // L'ID unique de Google Ads

    if (gclid) {
        // Si on trouve un GCLID, on le stocke pour plus tard (pour le formulaire)
        localStorage.setItem('gclid_token', gclid);
        
        // On stocke aussi la date pour ne pas utiliser un vieux clic (expiration 30 jours)
        const trackData = {
            gclid: gclid,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('ads_tracking_data', JSON.stringify(trackData));
    }
});
