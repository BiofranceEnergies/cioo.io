// 1. TA CONFIGURATION
const scriptURL = 'https://script.google.com/macros/s/AKfycbzuWqH_Yco59DG8orfiQIJg0vfxzqY2zRXoejgZH8mpYQfaBPxEWkQx1_DRoJHFVzkh/exec';

// Sélection des éléments
const form = document.getElementById('ppForm');
const addrInput = document.getElementById('adresse_input');
const suggestionsBox = document.getElementById('suggestions');
const surfH = document.getElementById('surf_h');
const prixV = document.getElementById('prix');
const prixM2 = document.getElementById('prix_m2');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('status');

// --- 2. LOGIQUE : AUTOCOMPLÉTION (API GOUV) ---
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
                        addrInput.value = feature.properties.name; // La rue
                        document.getElementById('cp').value = feature.properties.postcode;
                        document.getElementById('ville').value = feature.properties.city;
                        suggestionsBox.style.display = 'none';
                    };
                    suggestionsBox.appendChild(div);
                });
            }
        });
});

document.addEventListener('click', (e) => {
    if (e.target !== addrInput) suggestionsBox.style.display = 'none';
});

// --- 3. LOGIQUE : CALCUL DU PRIX AU M² ---
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

// --- 4. LOGIQUE : ENVOI ET COMPRESSION ---
form.addEventListener('submit', e => {
    e.preventDefault();
    
    btn.disabled = true;
    btn.innerText = "Traitement & Envoi...";
    status.innerText = "Préparation des données...";

    const fileInput = document.getElementById('photo_file');
    const file = fileInput.files[0];
    const formData = new FormData(form);
    
    // On prépare l'objet final (JSON)
    let payload = Object.fromEntries(formData.entries());

    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Compression de l'image
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX = 1200; // Qualité HD mais légère

                if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
                else if (height > MAX) { width *= MAX / height; height = MAX; }

                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);

                // Conversion en Base64 léger
                payload.fileData = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
                payload.mimeType = 'image/jpeg';
                payload.fileName = 'photo_' + Date.now() + '.jpg';

                sendFinal(payload);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        sendFinal(payload);
    }
});

function sendFinal(data) {
    status.innerText = "Connexion au tableur...";
    
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
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
        console.error(err);
        status.innerText = "❌ Erreur d'envoi.";
        btn.disabled = false;
        btn.innerText = "RÉESSAYER";
    });
}
