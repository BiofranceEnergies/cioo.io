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

// --- 2. AUTOCOMPLÉTION (API GOUV) ---
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

document.addEventListener('click', (e) => { if (e.target !== addrInput) suggestionsBox.style.display = 'none'; });

// --- 3. CALCUL PRIX M² ---
function updateM2() {
    let s = parseFloat(surfH.value);
    let p = parseFloat(prixV.value);
    prixM2.value = (s > 0 && p > 0) ? Math.round(p / s) + " € / m²" : "";
}
surfH.addEventListener('input', updateM2);
prixV.addEventListener('input', updateM2);

// --- 4. ENVOI DES DONNÉES ---
form.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerText = "Envoi en cours...";
    
    const fileInput = document.getElementById('photo_file');
    const file = fileInput.files[0];
    const formData = new FormData(form);
    const params = new URLSearchParams();

    for (const pair of formData.entries()) {
        params.append(pair[0], pair[1]);
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            params.append('fileData', reader.result.split(',')[1]);
            params.append('mimeType', file.type);
            params.append('fileName', file.name);
            sendFinal(params);
        };
        reader.readAsDataURL(file);
    } else {
        sendFinal(params);
    }
});

function sendFinal(params) {
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // On garde ton choix
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    })
    .then(() => {
        // Note : avec no-cors, on passe ici même si Google a une erreur interne
        status.innerText = "✅ Commande envoyée au serveur !";
        status.style.color = "green";
        form.reset();
        prixM2.value = "";
        btn.disabled = false;
        btn.innerText = "ENREGISTRER AU TABLEAU";
    })
    .catch(err => {
        status.innerText = "❌ Erreur réseau.";
        btn.disabled = false;
    });
}
