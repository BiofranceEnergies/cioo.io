// Fonction pour ajouter une ligne de pièce AVEC PHOTO (Version Galerie + Caméra)
function addRoom() {
    const container = document.getElementById('roomsContainer');
    const div = document.createElement('div');
    div.className = 'room-block'; 
    
    div.innerHTML = `
        <div class="room-row">
            <input type="text" placeholder="Nom (ex: Salon)" class="room-name" style="flex:2;">
            <input type="number" placeholder="m²" class="room-area" style="flex:1;" oninput="calculateTotal()">
        </div>
        <div class="room-photo-container">
            <label>📸 Photo (Caméra ou Galerie) :</label>
            <input type="file" accept="image/*" onchange="previewRoomImage(this)">
            <img class="room-preview" src="" alt="Aperçu">
        </div>
    `;
    
    container.appendChild(div);
}

// Fonction pour afficher la photo (inchangée)
function previewRoomImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = input.parentElement.querySelector('.room-preview');
            img.src = e.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Fonction pour calculer le total (inchangée)
function calculateTotal() {
    let total = 0;
    const areas = document.querySelectorAll('.room-area');
    areas.forEach(input => {
        total += Number(input.value);
    });
    document.getElementById('totalArea').innerText = total + " m²";
}

// Fonction Rapport (inchangée)
function generateReport() {
    const vendeurName = document.getElementById('vendeurName').value;
    const adresse = document.getElementById('adresseBien').value;
    const projet = document.getElementById('projetVendeur').value;
    const dpeEnergie = document.getElementById('dpeEnergie').value;
    const dpeClimat = document.getElementById('dpeClimat').value;

    const checkedChauffage = document.querySelectorAll('input[name="chauffage"]:checked');
    let chauffageList = [];
    checkedChauffage.forEach((checkbox) => { chauffageList.push(checkbox.value); });
    const chauffage = chauffageList.length > 0 ? chauffageList.join(', ') : "Non renseigné";

    const typeToiture = document.getElementById('typeToiture').value;
    const etatToiture = document.getElementById('etatToiture').value;
    const isDrone = document.getElementById('droneCheck').checked;
    const droneText = isDrone ? " (✅ Inspecté au Drone)" : "";

    const volets = document.getElementById('volets').value;
    const plus = document.getElementById('plus').value;
    const moins = document.getElementById('moins').value;
    const totalArea = document.getElementById('totalArea').innerText;

    let text = "--- AUDIT VISITE IMMO ---\n\n";
    text += `👤 Vendeur : ${vendeurName}\n`;
    text += `📍 Adresse : ${adresse}\n`;
    text += `🎯 Projet : ${projet}\n\n`;
    
    text += "🔧 TECHNIQUE & CONFORT :\n";
    text += `📊 DPE : ${dpeEnergie} / GES : ${dpeClimat}\n`;
    text += `- Chauffage : ${chauffage}\n`;
    text += `- Toiture : ${typeToiture} / ${etatToiture}${droneText}\n`;
    text += `- Volets : ${volets}\n\n`;

    text += "📐 SURFACES :\n";
    const names = document.querySelectorAll('.room-name');
    const areas = document.querySelectorAll('.room-area');
    for(let i=0; i<names.length; i++) {
        if(names[i].value) {
            text += `- ${names[i].value} : ${areas[i].value} m²\n`;
        }
    }
    text += `👉 TOTAL ESTIMÉ : ${totalArea}\n\n`;

    text += "📝 BILAN :\n";
    text += `✅ Les + : ${plus}\n`;
    text += `⚠️ Les - : ${moins}\n`;

    navigator.clipboard.writeText(text).then(() => {
        alert("Rapport copié !");
    }).catch(err => {
        alert("Erreur : " + err);
    });
}

// Ajout d'une première pièce
addRoom();
