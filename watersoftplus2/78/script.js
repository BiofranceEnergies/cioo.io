/* =========================================================
   WATERSOFT 2025 - LOGIC CORE (FINAL VERSION)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION ---
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyHYz40LwNcC0lYeymn_93CLK-LBfObF6reZPSjWLH4QDlzUb4dnkfpIkg1lWCTtTwL/exec";
    
    // ID Google Ads (Celui que tu m'as donné)
    const ADS_ID = 'AW-11242044118'; 
    // ⚠️ IMPORTANT : Remplace 'AbCdEfGhIjKlM' par ton Label de conversion (trouvable dans Google Ads > Conversions)
    const ADS_CONVERSION_LABEL = 'AbCdEfGhIjKlM'; 

    // Données de calcul
    const TVA_RATE = 0.10; // TVA 10%
    const BASE_PRICES_HT = {
        "10L": 2200,
        "15L": 2400,
        "20L": 2600
    };

    // Variables d'état
    let selectedPeople = 4; // Par défaut 3-4 personnes
    let selectedModelName = "NOVAQUA 15L";
    let finalPriceTTC = 0;
    let estimatedSavings = 0;


    // --- 2. GESTION DES MODALES (Mentions, CGV...) ---
    // On attache ces fonctions à 'window' pour qu'elles soient accessibles depuis le HTML
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


    // --- 3. GESTION DU SIMULATEUR ---
    
    // A. Choix du nombre de personnes
    const peopleBtns = document.querySelectorAll('.option-btn');
    peopleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            peopleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Lecture de la valeur data-value (1, 3, ou 5)
            selectedPeople = parseInt(this.getAttribute('data-value'));
        });
    });

    // B. Clic sur "CALCULER MON PRIX"
    const btnCalculate = document.querySelector('#btn-calculate');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    
    if(btnCalculate) {
        btnCalculate.addEventListener('click', function() {
            
            // 1. Détermination du modèle
            let priceHT = 0;

            if (selectedPeople <= 2) {
                selectedModelName = "NOVAQUA 10L"; // Compact
                priceHT = BASE_PRICES_HT["10L"];
            } else if (selectedPeople >= 5) {
                selectedModelName = "NOVAQUA 20L"; // Grand Confort
                priceHT = BASE_PRICES_HT["20L"];
            } else {
                selectedModelName = "NOVAQUA 15L"; // Standard (3-4 pers)
                priceHT = BASE_PRICES_HT["15L"];
            }

            // 2. Calculs financiers (Pour le fichier client)
            finalPriceTTC = Math.round(priceHT * (1 + TVA_RATE));
            
            // Calcul économies annuelles (Formule : Eau + Energie + Produits)
            // Basé sur tes stats : (Nb Pers * 800kWh * 0.27€ * 10%) + (Nb Pers * 220€ * 40%) + 80€
            const ecoEnergie = Math.round(selectedPeople * 800 * 0.27 * 0.1);
            const ecoProduits = Math.round(selectedPeople * 220 * 0.40);
            const ecoMateriel = 80;
            estimatedSavings = ecoEnergie + ecoProduits + ecoMateriel;

            // 3. Mise à jour de l'affichage (Interface)
            document.getElementById('model-name-display').textContent = selectedModelName;
            
            // 4. Transition visuelle
            step1.style.display = 'none';
            step2.style.display = 'block';
        });
    }


    // --- 4. ENVOI DU FORMULAIRE FINAL (LEAD) ---
    const finalForm = document.getElementById('final-form');
    const phoneInput = finalForm ? finalForm.querySelector('input[type="tel"]') : null;
    const submitBtn = finalForm ? finalForm.querySelector('button') : null;

    if(finalForm) {
        // Formatage du numéro en temps réel (06 12 34 56 78)
        phoneInput.addEventListener('input', function (e) {
            let v = e.target.value.replace(/\D/g, "").substring(0, 10);
            e.target.value = v.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
        });

        finalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const rawPhone = phoneInput.value.replace(/\s/g, ''); // Numéro clean
            
            // Validation
            if(rawPhone.length < 10) {
                alert("Merci d'entrer un numéro de téléphone valide (10 chiffres).");
                return;
            }

            // Feedback visuel (Chargement)
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = "Envoi...";
            submitBtn.disabled = true;

            // Préparation des données pour Google Sheet
            const formData = new FormData();
            formData.append("phase", "Lead Qualifié"); 
            formData.append("source", "Watersoft LP");
            formData.append("phone", rawPhone);
            formData.append("foyer", selectedPeople + " personnes");
            formData.append("model_recommande", selectedModelName);
            formData.append("prix_ttc_estime", finalPriceTTC + " €"); // Prix calculé avec TVA
            formData.append("economie_annuelle", estimatedSavings + " €/an");
            
            // UTM Tracking
            const params = new URLSearchParams(location.search);
            formData.append("utm_source", params.get("utm_source") || "");
            formData.append("utm_campaign", params.get("utm_campaign") || "");

            // ENVOI
            fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                body: formData,
                mode: "no-cors" 
            })
            .then(() => {
                // 1. Feedback succès
                submitBtn.innerHTML = "✔ Reçu";
                submitBtn.style.backgroundColor = "#22c55e";
                
                // 2. TRACKING GOOGLE ADS (CONVERSION)
                // C'est ici qu'on dit à Google "On a un client !"
                if(typeof gtag === 'function') {
                    gtag('event', 'conversion', {
                        'send_to': ADS_ID + '/' + ADS_CONVERSION_LABEL
                    });
                }

                alert("Merci ! Votre demande est bien reçue. Un expert Watersoft vous contactera au " + phoneInput.value + ".");
            })
            .catch(err => {
                console.error("Erreur", err);
                submitBtn.innerHTML = "Erreur";
                submitBtn.disabled = false;
                alert("Une erreur est survenue. Merci de nous appeler directement.");
            });
        });
    }

    // Fonction "Modifier mes choix" (Retour arrière)
    window.restartSim = function() {
        document.getElementById('step-2').style.display = 'none';
        document.getElementById('step-1').style.display = 'block';
    };


    // --- 5. BANNIÈRE COOKIES (RGPD) ---
    const cookieBanner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('cookie-accept');
    const btnRefuse = document.getElementById('cookie-refuse');

    // Vérifier si déjà accepté/refusé
    if (!localStorage.getItem('watersoft_consent')) {
        setTimeout(() => {
            if(cookieBanner) {
                cookieBanner.style.display = 'block';
                setTimeout(() => cookieBanner.classList.add('visible'), 10);
            }
        }, 1500);
    }

    if(btnAccept) {
        btnAccept.addEventListener('click', () => {
            localStorage.setItem('watersoft_consent', 'accepted');
            hideBanner();
            // Tu pourrais activer des scripts de tracking avancés ici
        });
    }

    if(btnRefuse) {
        btnRefuse.addEventListener('click', () => {
            localStorage.setItem('watersoft_consent', 'refused');
            hideBanner();
        });
    }

    function hideBanner() {
        if(cookieBanner) {
            cookieBanner.classList.remove('visible');
            setTimeout(() => {
                cookieBanner.style.display = 'none';
            }, 400); 
        }
    }

});
