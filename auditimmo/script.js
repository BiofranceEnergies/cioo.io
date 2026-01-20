// Fonction pour ajouter une pièce
function addRoom() {
    const container = document.getElementById('roomsContainer');
    const div = document.createElement('div');
    div.className = 'room-block'; 
    const uniqueId = 'img-' + Date.now(); // ID unique pour chaque photo

    div.innerHTML = `
        <div class="room-row">
            <input type="text" placeholder="Nom (ex: Salon)" class="room-name" style="flex:2;">
            <input type="number" placeholder="m²" class="room-area" style="flex:1;" oninput="calculateTotal()">
        </div>
        <div class="room-photo-container">
            <label>📸 Photo :</label>
            <input type="file" accept="image/*" onchange="previewRoomImage(this, '${uniqueId}')">
            <img id="${uniqueId}" class="room-preview" src="" style="display:none;">
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
    areas.forEach(input => { total += Number(input.value); });
    document.getElementById('totalArea').innerText = total + " m²";
}

// === FONCTION PDF INFAILLIBLE ===
function generatePDF() {
    // 1. Remplir le modèle caché avec les données
    document.getElementById('pdf-nom').innerText = document.getElementById('vendeurName').value || "Non renseigné";
    document.getElementById('pdf-adresse').innerText = document.getElementById('adresseBien').value || "";
    document.getElementById('pdf-projet').innerText = document.getElementById('projetVendeur').value || "";

    const dpe = document.getElementById('dpeEnergie').value + " / GES: " + document.getElementById('dpeClimat').value;
    document.getElementById('pdf-dpe').innerText = dpe;

    // Chauffage
    const checkedChauffage = document.querySelectorAll('input[name="chauffage"]:checked');
    let chauffageList = [];
    checkedChauffage.forEach((checkbox) => { chauffageList.push(checkbox.value); });
    document.getElementById('pdf-chauffage').innerText = chauffageList.length > 0 ? chauffageList.join(', ') : "Non renseigné";

    // Toiture
    const toitInfos = document.getElementById('typeToiture').value + " - " + document.getElementById('etatToiture').value;
    const isDrone = document.getElementById('droneCheck').checked ? " (✅ VÉRIFIÉ DRONE)" : "";
    document.getElementById('pdf-toiture').innerText = toitInfos + isDrone;
    document.getElementById('pdf-volets').innerText = document.getElementById('volets').value;

    // Pièces et Photos (Copie propre)
    const pdfRoomsContainer = document.getElementById('pdf-rooms-list');
    pdfRoomsContainer.innerHTML = ""; // Vider
    const roomBlocks = document.querySelectorAll('.room-block');

    roomBlocks.forEach(block => {
        const name = block.querySelector('.room-name').value;
        const area = block.querySelector('.room-area').value;
        const img = block.querySelector('.room-preview');

        if(name || area) {
            let roomHtml = `<div style="margin-bottom: 20px; border-bottom:1px solid #eee; padding-bottom:10px;">`;
            roomHtml += `<p style="font-weight:bold; font-size:1.1rem; margin:0;">${name} (${area} m²)</p>`;
            
            // Si une image existe et est affichée
            if(img && img.src && img.style.display !== 'none') {
                roomHtml += `<img src="${img.src}" style="width:100%; max-height:400px; object-fit:contain; margin-top:10px; border-radius:5px;">`;
            }
            roomHtml += `</div>`;
            pdfRoomsContainer.innerHTML += roomHtml;
        }
    });

    document.getElementById('pdf-total').innerText = document.getElementById('totalArea').innerText;
    document.getElementById('pdf-plus').innerText = document.getElementById('plus').value;
    document.getElementById('pdf-moins').innerText = document.getElementById('moins').value;

    // 2. AFFICHER LE MODÈLE (C'est le secret pour éviter la page blanche)
    const template = document.getElementById('printTemplate');
    const app = document.getElementById('appInterface');
    
    // On cache l'appli et on montre le PDF en plein écran
    app.style.display = 'none';
    template.style.display = 'block';

    alert("Génération du PDF... Patientez 2 secondes...");

    // 3. ATTENDRE UN PEU (500ms) pour que les images chargent
    setTimeout(() => {
        const opt = {
            margin: 10,
            filename: `Audit_${document.getElementById('vendeurName').value}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(template).save().then(() => {
            // 4. Une fois fini, on remet tout comme avant
            template.style.display = 'none';
            app.style.display = 'block';
        });
    }, 500); // Pause de 500 millisecondes
}

addRoom();
