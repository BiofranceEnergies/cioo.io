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
