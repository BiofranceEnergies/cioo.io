// CONFIGURATION : Mets ton URL ici
const scriptURL = 'https://script.google.com/macros/s/AKfycbzuWqH_Yco59DG8orfiQIJg0vfxzqY2zRXoejgZH8mpYQfaBPxEWkQx1_DRoJHFVzkh/exec';

const form = document.getElementById('ppForm');
const addrInput = document.getElementById('adresse_input');
const suggestionsBox = document.getElementById('suggestions');
const surfH = document.getElementById('surf_h');
const prixV = document.getElementById('prix');
const prixM2 = document.getElementById('prix_m2');

// --- 1. AUTOCOMPLETION (API GOUV FRANCE) ---
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

// Fermer les suggestions si clic extérieur
document.addEventListener('click', (e) => {
    if (e.target !== addrInput) suggestionsBox.style.display = 'none';
});

// --- 2. CALCUL PRIX AU M2 ---
function updateM2() {
    let s = parseFloat(surfH.value);
    let p = parseFloat(prixV.value);
    if (s > 0 && p > 0) {
        prixM2.value = Math.round(p / s) + " € / m²";
    } else {
        prixM2.value = "";
    }
}
surfH.addEventListener('input', updateM2);
prixV.addEventListener('input', updateM2);

// --- 3. ENVOI DES DONNEES ET PHOTO ---
form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('status');
    
    btn.disabled = true;
    btn.innerText = "Envoi en cours...";
    status.innerText = "Préparation des données...";

    const file = document.getElementById('photo_file').files[0];
    const formData = new FormData(form);

    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            formData.append('fileData', reader.result.split(',')[1]);
            formData.append('mimeType', file.type);
            formData.append('fileName', file.name);
            sendFinalData(formData);
        };
    } else {
        sendFinalData(formData);
    }
});

function sendFinalData(formData) {
    fetch(scriptURL, { method: 'POST', body: formData, mode: 'no-cors' })
        .then(() => {
            document.getElementById('status').innerText = "✅ Succès ! Bien enregistré dans 'BIENS'.";
            document.getElementById('status').style.color = "green";
            form.reset();
            prixM2.value = "";
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').innerText = "ENREGISTRER AU TABLEAU";
        })
        .catch(err => {
            document.getElementById('status').innerText = "❌ Erreur de connexion.";
            document.getElementById('status').style.color = "red";
            document.getElementById('submitBtn').disabled = false;
        });
}
