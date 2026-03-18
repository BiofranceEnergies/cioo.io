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

// --- 4. ENVOI DES DONNÉES ET PHOTO COMPRESSÉE ---
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Création d'un canvas pour redimensionner l'image
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 1200; // Largeur ou hauteur max de 1200px

                if (width > height && width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compression en JPEG (qualité 0.7 = excellent rapport poids/visuel)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                
                params.append('fileData', compressedBase64.split(',')[1]);
                params.append('mimeType', 'image/jpeg');
                // On s'assure que le nom finit par .jpg
                const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                params.append('fileName', cleanName);
                
                sendFinal(params);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // S'il n'y a pas de photo, on envoie les données texte seules
        sendFinal(params);
    }
}); // Fin de l'event listener submit

function sendFinal(params) {
    // On transforme les paramètres en un objet simple
    const data = Object.fromEntries(params.entries());

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // On garde no-cors
        body: JSON.stringify(data) // On envoie du JSON, c'est bien plus fiable pour les images
    })
    .then(() => {
        status.innerText = "✅ Enregistré avec succès (photo incluse) !";
        status.style.color = "green";
        form.reset();
        prixM2.value = "";
        btn.disabled = false;
        btn.innerText = "ENREGISTRER AU TABLEAU";
    })
    .catch(err => {
        console.error(err);
        status.innerText = "❌ Erreur de connexion.";
        btn.disabled = false;
    });
}
