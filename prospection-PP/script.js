const scriptURL = 'https://script.google.com/macros/s/AKfycbzuWqH_Yco59DG8orfiQIJg0vfxzqY2zRXoejgZH8mpYQfaBPxEWkQx1_DRoJHFVzkh/exec';

const form = document.getElementById('ppForm');
const addrInput = document.getElementById('adresse_input');
const suggestionsBox = document.getElementById('suggestions');
const surfH = document.getElementById('surf_h');
const prixV = document.getElementById('prix');
const prixM2 = document.getElementById('prix_m2');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('status');

// --- 1. AUTOCOMPLÉTION ---
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

// --- 2. CALCUL PRIX M2 ---
function updateM2() {
    let s = parseFloat(surfH.value), p = parseFloat(prixV.value);
    prixM2.value = (s > 0 && p > 0) ? Math.round(p / s) + " € / m²" : "";
}
surfH.addEventListener('input', updateM2);
prixV.addEventListener('input', updateM2);

// --- 3. ENVOI ET COMPRESSION ---
form.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerText = "Compression & Envoi...";
    status.innerText = "Traitement de l'image...";

    const file = document.getElementById('photo_file').files[0];
    const formData = new FormData(form);
    let payload = Object.fromEntries(formData.entries());

    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 1000; // Taille optimale
                let w = img.width, h = img.height;
                if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
                else if (h > MAX) { w *= MAX / h; h = MAX; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);

                payload.fileData = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
                payload.mimeType = 'image/jpeg';
                payload.fileName = 'photo_' + Date.now() + '.jpg';
                sendToServer(payload);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        sendToServer(payload);
    }
});

function sendToServer(data) {
    status.innerText = "Envoi au tableur...";
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(data)
    })
    .then(() => {
        status.innerText = "✅ Enregistré avec succès !";
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
