/* =========================================================
   WATERSOFT 2025 - LOGIC CORE (FINAL AVEC TRACKING ADS)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION ---
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyHYz40LwNcC0lYeymn_93CLK-LBfObF6reZPSjWLH4QDlzUb4dnkfpIkg1lWCTtTwL/exec";
    
    // ID & LABEL GOOGLE ADS (OFFICIELS)
    const ADS_ID = 'AW-11242044118'; 
    const ADS_CONVERSION_LABEL = 'DO1tCKLg97sbENb1z_Ap'; // <--- TON LABEL EST ICI !

    // Données de calcul
    const TVA_RATE = 0.10; 
    const BASE_PRICES_HT = {
        "10L": 2200,
        "15L": 2400,
        "20L": 2600
    };

    // Variables
    let selectedPeople = 4;
    let selectedModelName = "NOVAQUA 15L";
    let finalPriceTTC = 0;
    let estimatedSavings = 0;

    // --- GESTION DES MODALES ---
    window.openModal = function(modalId) {
        const m = document.getElementById(modalId);
        if(m) m.classList.add('show');
    };
    window.closeModal = function(modalId) {
        const m = document.getElementById(modalId);
        if(m) m.classList.remove('show');
    };
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) event.target.classList.remove('show');
    };

    // --- GESTION DU SIMULATEUR ---
    const peopleBtns = document.querySelectorAll('.option-btn');
    peopleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            peopleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const val = this.getAttribute('data-value');
            selectedPeople = parseInt(val);
        });
    });

    const btnCalculate = document.querySelector('#btn-calculate');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    
    if(btnCalculate) {
        btnCalculate.addEventListener('click', function() {
            // Calcul Modèle
            let priceHT = 0;
            if (selectedPeople <= 2) {
                selectedModelName = "NOVAQUA 10L"; priceHT = BASE_PRICES_HT["10L"];
            } else if (selectedPeople >= 5) {
                selectedModelName = "NOVAQUA 20L"; priceHT = BASE_PRICES_HT["20L"];
            } else {
                selectedModelName = "NOVAQUA 15L"; priceHT = BASE_PRICES_HT["15L"];
            }

            // Calculs
            finalPriceTTC = Math.round(priceHT * (1 + TVA_RATE));
            const ecoEnergie = Math.round(selectedPeople * 800 * 0.27 * 0.1);
            const ecoProduits = Math.round(selectedPeople * 220 * 0.40);
            const ecoMateriel = 80;
            estimatedSavings = ecoEnergie + ecoProduits + ecoMateriel;

            // Affichage
            document.getElementById('model-name-display').textContent = selectedModelName;
            step1.style.display = 'none';
            step2.style.display = 'block';
        });
    }

    // --- ENVOI DU FORMULAIRE ---
    const finalForm = document.getElementById('final-form');
    const phoneInput = finalForm ? finalForm.querySelector('input[type="tel"]') : null;
    const submitBtn = finalForm ? finalForm.querySelector('button') : null;

    if(finalForm) {
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

            submitBtn.innerHTML = "Envoi...";
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append("phase", "Lead Qualifié"); 
            formData.append("source", "Watersoft LP");
            formData.append("phone", rawPhone);
            formData.append("foyer", selectedPeople + " personnes");
            formData.append("model_recommande", selectedModelName);
            formData.append("prix_ttc_estime", finalPriceTTC + " €");
            formData.append("economie_annuelle", estimatedSavings + " €/an");
            
            const params = new URLSearchParams(location.search);
            formData.append("utm_source", params.get("utm_source") || "");
            formData.append("utm_campaign", params.get("utm_campaign") || "");

            fetch(GOOGLE_SCRIPT_URL, { method: "POST", body: formData, mode: "no-cors" })
            .then(() => {
                submitBtn.innerHTML = "✔ Reçu";
                submitBtn.style.backgroundColor = "#22c55e";
                
                // 🚀 TRACKING GOOGLE ADS (DÉCLENCHEMENT OFFICIEL)
                if(typeof gtag === 'function') {
                    gtag('event', 'conversion', {
                        'send_to': ADS_ID + '/' + ADS_CONVERSION_LABEL,
                        'value': 1.0,
                        'currency': 'EUR'
                    });
                    console.log("Conversion envoyée à Google Ads !");
                }

                alert("Merci ! Un expert Watersoft vous contactera au " + phoneInput.value + ".");
            })
            .catch(err => {
                console.error("Erreur", err);
                submitBtn.innerHTML = "Erreur";
                submitBtn.disabled = false;
            });
        });
    }

    window.restartSim = function() {
        document.getElementById('step-2').style.display = 'none';
        document.getElementById('step-1').style.display = 'block';
    };

 // --- 5. BANNIÈRE COOKIES (MÉTHODE UNIVERSELLE) ---
    
    // Fonctions utilitaires pour gérer les vrais cookies
    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        const name = cname + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    const cookieBanner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('cookie-accept');
    const btnRefuse = document.getElementById('cookie-refuse');

    // Si le cookie n'existe pas encore (vide), on affiche la bannière
    if (getCookie('watersoft_consent') === "") {
        setTimeout(() => {
            if(cookieBanner) {
                cookieBanner.style.display = 'block';
                // Force le navigateur à calculer le rendu avant d'ajouter la classe (Astuce CSS)
                void cookieBanner.offsetWidth; 
                cookieBanner.classList.add('visible');
            }
        }, 1000);
    }

    if(btnAccept) {
        btnAccept.addEventListener('click', () => {
            setCookie('watersoft_consent', 'accepted', 365); // Valide pour 1 an
            hideBanner();
        });
    }

    if(btnRefuse) {
        btnRefuse.addEventListener('click', () => {
            setCookie('watersoft_consent', 'refused', 365);
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
