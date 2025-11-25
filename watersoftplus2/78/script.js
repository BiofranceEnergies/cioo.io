/* =========================================================
   WATERSOFT 2025 - LOGIC CORE
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyHYz40LwNcC0lYeymn_93CLK-LBfObF6reZPSjWLH4QDlzUb4dnkfpIkg1lWCTtTwL/exec";
    
    // Données financières
    const PRIX_KWH = 0.27;
    const ECS_KWH_PP = 800; // Eau chaude par personne
    const DEPENSE_PROD_PP = 220; // Produits ménagers par personne
    
    // État du formulaire
    let selectedPeople = 4; // Par défaut 3-4 personnes
    let selectedModel = "NOVAQUA 15L (Standard)";
    let calculatedSavings = 0;

    // --- 1. GESTION DES MODALES ---
    window.openModal = function(modalId) {
        const m = document.getElementById(modalId);
        if(m) m.classList.add('show');
    };
    
    window.closeModal = function(modalId) {
        const m = document.getElementById(modalId);
        if(m) m.classList.remove('show');
    };

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    };

    // --- 2. GESTION DU SIMULATEUR ---
    
    // Clic sur les boutons "Nombre de personnes"
    const peopleBtns = document.querySelectorAll('.option-btn');
    peopleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            peopleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Logique : transformation du texte en nombre
            const val = this.innerText;
            if(val.includes("1")) selectedPeople = 2;      // 1 à 2
            else if(val.includes("3")) selectedPeople = 4; // 3 à 4
            else selectedPeople = 5;                       // 5 +
        });
    });

    // Clic sur "CALCULER MON PRIX"
    const btnCalculate = document.querySelector('#btn-calculate');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    
    if(btnCalculate) {
        btnCalculate.addEventListener('click', function() {
            
            // --- A. CALCUL DU MODÈLE ---
            if (selectedPeople <= 2) {
                selectedModel = "NOVAQUA 10L (Compact)";
            } else if (selectedPeople >= 5) {
                selectedModel = "NOVAQUA 20L (Grand Confort)";
            } else {
                selectedModel = "NOVAQUA 15L (Standard)";
            }

            // --- B. CALCUL DES ÉCONOMIES ---
            const ecoEnergie = Math.round(selectedPeople * ECS_KWH_PP * PRIX_KWH * 0.1);
            const ecoProduits = Math.round(selectedPeople * DEPENSE_PROD_PP * 0.40);
            const ecoMateriel = 80;
            calculatedSavings = ecoEnergie + ecoProduits + ecoMateriel;

            // --- C. AFFICHAGE ---
            document.getElementById('model-name-display').textContent = selectedModel;
            step1.style.display = 'none';
            step2.style.display = 'block';
        });
    }

    // --- 3. ENVOI DU FORMULAIRE FINAL ---
    const finalForm = document.getElementById('final-form');
    const phoneInput = finalForm ? finalForm.querySelector('input[type="tel"]') : null;
    const submitBtn = finalForm ? finalForm.querySelector('button') : null;

    if(finalForm) {
        // Formatage tel
        phoneInput.addEventListener('input', function (e) {
            let v = e.target.value.replace(/\D/g, "").substring(0, 10);
            e.target.value = v.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
        });

        finalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const rawPhone = phoneInput.value.replace(/\s/g, '');
            
            if(rawPhone.length < 10) {
                alert("Merci d'entrer un numéro valide (10 chiffres).");
                return;
            }

            submitBtn.innerHTML = "...";
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append("phase", "phone"); 
            formData.append("source", "LP Watersoft 2025");
            formData.append("phone", rawPhone);
            formData.append("foyer", selectedPeople + " personnes");
            formData.append("model", selectedModel);
            formData.append("annual", calculatedSavings); 
            
            const params = new URLSearchParams(location.search);
            formData.append("utm_source", params.get("utm_source") || "");
            formData.append("utm_campaign", params.get("utm_campaign") || "");

            fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                body: formData,
                mode: "no-cors" 
            })
            .then(() => {
                submitBtn.innerHTML = "✔";
                submitBtn.style.backgroundColor = "#22c55e";
                alert("Bien reçu ! Un expert Watersoft vous contactera au " + phoneInput.value + " pour vous donner votre tarif exact.");
            })
            .catch(err => {
                console.error("Erreur", err);
                submitBtn.innerHTML = "Erreur";
                submitBtn.disabled = false;
            });
        });
    }
 // --- GESTION COOKIES (RGPD) ---
    const cookieBanner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('cookie-accept');
    const btnRefuse = document.getElementById('cookie-refuse');

    // Vérifier si déjà accepté/refusé
    if (!localStorage.getItem('watersoft_consent')) {
        // Si pas de choix, on affiche après 1.5 seconde (effet smooth)
        setTimeout(() => {
            if(cookieBanner) {
                cookieBanner.style.display = 'block';
                // Petit délai pour permettre la transition CSS
                setTimeout(() => cookieBanner.classList.add('visible'), 10);
            }
        }, 1500);
    }

    // Action : ACCEPTER
    if(btnAccept) {
        btnAccept.addEventListener('click', () => {
            localStorage.setItem('watersoft_consent', 'accepted');
            hideBanner();
            // ICI : C'est là qu'on déclencherait le tag Google Ads (GTAG)
            console.log("Cookies acceptés - Activation GTAG");
        });
    }

    // Action : REFUSER
    if(btnRefuse) {
        btnRefuse.addEventListener('click', () => {
            localStorage.setItem('watersoft_consent', 'refused');
            hideBanner();
            console.log("Cookies refusés - Pas de tracking");
        });
    }

    function hideBanner() {
        cookieBanner.classList.remove('visible');
        setTimeout(() => {
            cookieBanner.style.display = 'none';
        }, 400); // Attend la fin de l'animation
    }
    window.restartSim = function() {
        document.getElementById('step-2').style.display = 'none';
        document.getElementById('step-1').style.display = 'block';
    };

});
