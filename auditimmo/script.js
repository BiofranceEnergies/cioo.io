// Fonction pour ajouter une pièce
function addRoom() {
    const container = document.getElementById('roomsContainer');
    const div = document.createElement('div');
    div.className = 'room-block';
    // ID unique pour lier l'image
    const imgId = 'img-' + Date.now();

    div.innerHTML = `
        <div class="room-row">
            <input type="text" placeholder="Salon, Cuisine..." class="room-name" style="flex:2;">
            <input type="number" placeholder="m²" class="room-area" style="flex:1;" oninput="calculateTotal()">
        </div>
        <div style="margin-top:5px;">
            <input type="file" accept="image/*" onchange="previewImage(this, '${imgId}')">
            <img id="${imgId}" class="room-preview" src="">
        </div>
    `;
    container.appendChild(div);
}

// Afficher l'image quand on la sélectionne
function previewImage(input, imgId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById(imgId);
            img.src = e.target.result;
            img.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Calcul du total
function calculateTotal() {
    let total = 0;
    document.querySelectorAll('.room-area').forEach(input => {
        total += Number(input.value);
    });
    document.getElementById('totalArea').innerText = total + " m²";
}

// === FONCTION D'IMPRESSION (NATIVE CHROME) ===
function printReport() {
    // 1. COPIE DES TEXTES SIMPLES
    document.getElementById('p-nom').innerText = document.getElementById('vendeurName').value;
    document.getElementById('p-adresse').innerText = document.getElementById('adresseBien').value;
    document.getElementById('p-projet').innerText = document.getElementById('projetVendeur').value;
    
    document.getElementById('p-dpe').innerText = document.getElementById('dpeEnergie').value + " / GES: " + document.getElementById('dpeClimat').value;
    
    // Copie Chauffage (Liste)
    let chauffages = [];
    document.querySelectorAll('input[name="chauffage"]:checked').forEach(c => chauffages.push(c.value));
    document.getElementById('p-chauffage').innerText = chauffages.join(', ') || "Non renseigné";

    // Copie Toiture / Volets
    let toit = document.getElementById('typeToiture').value + " - " + document.getElementById('etatToiture').value;
    if(document.getElementById('droneCheck').checked) toit += " (✅ Vu au drone)";
    document.getElementById('p-toiture').innerText = toit;
    document.getElementById('p-volets').innerText = document.getElementById('volets').value;

    document.getElementById('p-total').innerText = document.getElementById('totalArea').innerText;
    document.getElementById('p-plus').innerText = document.getElementById('plus').value;
    document.getElementById('p-moins').innerText = document.getElementById('moins').value;

    // 2. COPIE DES PIÈCES ET DES PHOTOS
    const printContainer = document.getElementById('p-rooms-list');
    printContainer.innerHTML = ""; // On vide

    const blocks = document.querySelectorAll('.room-block');
    blocks.forEach(block => {
        const name = block.querySelector('.room-name').value;
        const area = block.querySelector('.room-area').value;
        const img = block.querySelector('.room-preview');

        if (name || area) {
            let html = `<div class="p-room-item">`;
            html += `<strong>${name}</strong> (${area} m²)`;
            
            // Si l'image a une source (src), on l'ajoute au rapport
            if (img.src && img.style.display !== 'none') {
                html += `<img src="${img.src}" class="p-room-img">`;
            }
            html += `</div>`;
            printContainer.innerHTML += html;
        }
    });

    // 3. LANCER L'IMPRESSION
    window.print();
}

addRoom();
