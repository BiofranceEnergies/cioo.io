// 1. TA CONFIGURATION
const scriptURL = 'https://script.google.com/macros/s/AKfycbzuWqH_Yco59DG8orfiQIJg0vfxzqY2zRXoejgZH8mpYQfaBPxEWkQx1_DRoJHFVzkh/exec';

const form = document.getElementById('ppForm');
const addrInput = document.getElementById('adresse_input');
const suggestionsBox = document.getElementById('suggestions');
const surfH = document.getElementById('surf_h');
const prixV = document.getElementById('prix');
const prixM2 = document.getElementById('prix_m2');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('status');

// --- 2. AUTOCOMPLÉTION ---
addrInput.addEventListener('input', function() {
    let val = this.value;
    if (val.length < 5) { suggestionsBox.style.display = 'none'; return; }
    fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(val)}&limit=5`)
        .then(res => res.json())
        .then(data => {
            suggestionsBox.innerHTML = '';
            if (data.features.length > 0) {
                suggestionsBox.style.display = 'block';
                data.features.forEach(feature => {
                    let div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.innerText = feature.properties.label;
                    div.onclick = function() {
                        addrInput.value = feature.properties.name;
                        document.getElementById('cp').value = feature.properties.postcode;
                        document.getElementById('ville').value = feature.properties.city;
                        suggestionsBox.style.display = 'none';
                    };
                    suggestionsBox.appendChild(div);
                });
            }
        });
});

// --- 3. CALCUL PRIX M2 ---
function updateM2() {
    let s = parseFloat(surfH.value), p = parseFloat(prixV.value);
    prixM2.value = (s > 0 && p > 0) ? Math.round(p / s) + " € / m²" : "";
}
surfH.addEventListener('input', updateM2);
prixV.addEventListener('input', updateM2);

// --- 4. ENVOI SIMPLE (TEXTE UNIQUEMENT) ---
form.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerText = "Envoi...";

    fetch(scriptURL, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: new URLSearchParams(new FormData(form)) 
    })
    .then(() => {
        status.innerText = "✅ Enregistré !";
        form.reset();
        prixM2.value = "";
        btn.disabled = false;
        btn.innerText = "ENREGISTRER AU TABLEAU";
    })
    .catch(() => {
        status.innerText = "❌ Erreur.";
        btn.disabled = false;
    });
});
