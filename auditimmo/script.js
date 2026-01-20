// Fonction pour ajouter une pièce (Galerie ou Photo)
function addRoom() {
    const container = document.getElementById('roomsContainer');
    const div = document.createElement('div');
    div.className = 'room-block'; 
    
    // On met un ID unique à l'image pour pouvoir la récupérer facilement
    const uniqueId = 'img-' + Date.now();

    div.innerHTML = `
        <div class="room-row">
            <input type="text" placeholder="Nom (ex: Salon)" class="room-name" style="flex:2;">
            <input type="number" placeholder="m²" class="room-area" style="flex:1;" oninput="calculateTotal()">
        </div>
        <div class="room-photo-container">
            <label>📸 Photo :</label>
            <input type="file" accept="image/*" onchange="previewRoomImage(this, '${uniqueId}')">
            <img id="${uniqueId}" class="room-preview" src="" alt="" style="display:none;">
        </div>
    `;
    container.appendChild(div);
}

function previewRoomImage(input, imgId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.getElementById(imgId);
            img.src = e.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function calculateTotal() {
    let total = 0;
    const areas = document.querySelectorAll('.room-area');
    areas.forEach(input => {
        total += Number(input.value);
    });
    document.getElementById('totalArea').innerText = total + " m²";
}

// === NOUVELLE FONCTION PDF PUISSANTE ===
function generatePDF() {
    alert("Génération du PDF... Patientez.");

    // 1. On remplit le modèle caché avec les données
    document.getElementById('pdf-nom').innerText = document.getElementById('vendeurName').value || "Non renseigné";
    document.getElementById('pdf-adresse').innerText = document.getElementById('adresseBien').value || "";
    document.getElementById('pdf-projet').innerText = document.getElementById('projetVendeur').value || "";

    // DPE
    const dpe = document.getElementById('dpeEnergie').value + " / GES: " + document.getElementById('dpeClimat').value;
    document.getElementById('pdf-dpe').innerText = dpe;

    // Chauffage (Liste propre)
    const checkedChauffage = document.querySelectorAll('input[name="chauffage"]:checked');
    let chauffageList = [];
    checkedChauffage.forEach((checkbox) => { chauffageList.push(checkbox.value); });
    document.getElementById('pdf-chauffage').innerText = chauffageList.length > 0 ? chauffageList.join(', ') : "Non renseigné";

    // Toiture
    const toitInfos = document.getElementById('typeToiture').value + " - " + document.getElementById('etatToiture').value;
    const isDrone = document.getElementById('droneCheck').checked ? " (✅ VÉRIFIÉ DRONE)" : "";
    document.getElementById('pdf-toiture').innerText = toitInfos + isDrone;

    document.getElementById('pdf-volets').innerText = document.getElementById('volets').value;

    // 2. On gère les pièces et les photos
    const pdfRoomsContainer = document.getElementById('pdf-rooms-list');
    pdfRoomsContainer.innerHTML = ""; // On vide avant de remplir

    // On récupère tous les blocs de pièces de l'appli
    const roomBlocks = document.querySelectorAll('.room-block');

    roomBlocks.forEach(block => {
        const name = block.querySelector('.room-name').value;
        const area = block.querySelector('.room-area').value;
        const img = block.querySelector('.room-preview');

        if(name || area) {
            // Création d'une ligne propre pour le PDF
            let roomHtml = `<div style="margin-bottom: 15px; page-break-inside: avoid;">`;
            roomHtml += `<p style="font-weight:bold; font-size:1.1rem; margin:5px 0; border-bottom:1px solid #ddd;">${name} (${area} m²)</p>`;
            
            // Si il y a une image affichée, on l'ajoute en grand
            if(img && img.src && img.style.display !== 'none') {
                roomHtml += `<img src="${img.src}" style="width:100%; max-height:300px; object-fit:contain; border-radius:5px; margin-top:5px;">`;
            } else {
                roomHtml += `<p style="color:#999; font-style:italic; font-size:0.8rem;">Pas de photo</p>`;
            }
            roomHtml += `</div>`;
            pdfRoomsContainer.innerHTML += roomHtml;
        }
    });

    document.getElementById('pdf-total').innerText = document.getElementById('totalArea').innerText;
    document.getElementById('pdf-plus').innerText = document.getElementById('plus').value;
    document.getElementById('pdf-moins').innerText = document.getElementById('moins').value;

    // 3. On affiche temporairement le modèle pour le PDF
    const element = document.getElementById('printTemplate');
    element.style.display = 'block'; // On le rend visible pour le moteur PDF

    // 4. Paramètres PDF optimisés pour A4
    const opt = {
        margin:       10, // Marges blanches
        filename:     `Audit_${document.getElementById('vendeurName').value}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, // Meilleure qualité
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 5. Génération et remise à zéro
    html2pdf().set(opt).from(element).save().then(() => {
        element.style.display = 'none'; // On recache le modèle après
    });
}

addRoom();
