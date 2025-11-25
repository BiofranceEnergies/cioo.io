/* =========================================================
   WATERSOFT 2025 - SCRIPT FINAL (VERSION COMPLETE)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURATION ---
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyHYz40LwNcC0lYeymn_93CLK-LBfObF6reZPSjWLH4QDlzUb4dnkfpIkg1lWCTtTwL/exec";
    
    // ID & LABEL GOOGLE ADS
    const ADS_ID = 'AW-11242044118'; 
    const ADS_CONVERSION_LABEL = 'DO1tCKLg97sbENb1z_Ap'; 

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

    // --- 2. GESTION DES MODALES ---
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

    // --- 3. GESTION DU SIMULATEUR ---
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
            const displayEl = document.getElementById('model-name-display');
            if(displayEl) displayEl.textContent = selectedModelName;
            
            if(step1) step1.style.display = 'none';
            if(step2) step2.style.display = 'block';
        });
    }

    // --- 4. ENVOI DU FORMULAIRE ---
    const finalForm = document.getElementById('final-form');
    
    if(finalForm) {
        const phoneInput = finalForm.querySelector('input[type="tel"]');
        const submitBtn = finalForm.querySelector('button');

        // Formatage du numéro
        if(phoneInput) {
            phoneInput.addEventListener('input', function (e) {
                let v = e.target.value.replace(/\D/g, "").substring(0, 10);
                e.target.value = v.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
            });
        }

        finalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if(!phoneInput) return;

            const rawPhone = phoneInput.value.replace(/\s/g, '');
            
            if(rawPhone.length < 10) {
                alert("Merci d'entrer un numéro valide (10 chiffres).");
                return;
            }

            if(submitBtn) {
                submitBtn.innerHTML = "Envoi...";
                submitBtn.disabled = true;
            }

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
                if(submitBtn) {
                    submitBtn.innerHTML = "✔ Reçu";
                    submitBtn.style.backgroundColor = "#22c55e";
                }
                
                if(typeof gtag === 'function') {
                    gtag('event', 'conversion', {
                        'send_to': ADS_ID + '/' + ADS_CONVERSION_LABEL,
                        'value': 1.0,
                        'currency': 'EUR'
                    });
                }

                alert("Merci ! Un expert Watersoft vous contactera au " + phoneInput.value + ".");
            })
            .catch(err => {
                console.error("Erreur", err);
                if(submitBtn) {
                    submitBtn.innerHTML = "Erreur";
                    submitBtn.disabled = false;
                }
            });
        });
    }

    window.restartSim = function() {
        const s1 = document.getElementById('step-1');
        const s2 = document.getElementById('step-2');
        if(s2) s2.style.display = 'none';
        if(s1) s1.style.display = 'block';
    };


    // --- 5. BANNIÈRE COOKIES (FORCE BRUTE & DEBUG) ---
    const cookieBanner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('cookie-accept');
    const btnRefuse = document.getElementById('cookie-refuse');

    // 1. Check HTML existence
    if (!cookieBanner) {
        console.log("Note: Bannière cookie introuvable dans le HTML");
    }

    // 2. Fonctions Cookies
    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) return match[2];
        return null;
    }

    function setCookie(name, value, days) {
        var d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        var expires = "expires="+ d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    // 3. Logique Affichage
    if (getCookie('watersoft_consent') === null) {
        setTimeout(function() {
            if(cookieBanner) {
                // Force display
                cookieBanner.style.display = 'block';
                // Force animation class
                setTimeout(() => {
                    cookieBanner.classList.add('show-banner');
                }, 50);
            }
        }, 1000);
    }

    // 4. Actions Boutons
    if(btnAccept) {
        btnAccept.addEventListener('click', function() {
            setCookie('watersoft_consent', 'accepted', 365);
            if(cookieBanner) {
                cookieBanner.style.display = 'none';
                cookieBanner.classList.remove('show-banner');
            }
        });
    }

    if(btnRefuse) {
        btnRefuse.addEventListener('click', function() {
            setCookie('watersoft_consent', 'refused', 30);
            if(cookieBanner) {
                cookieBanner.style.display = 'none';
                cookieBanner.classList.remove('show-banner');
            }
        });
    }

}); // FIN DU DOCUMENT READY
