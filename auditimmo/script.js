function addRoom() {
    const container = document.getElementById('roomsContainer');
    const div = document.createElement('div');
    div.className = 'room-row';
    div.innerHTML = `
        <input type="text" placeholder="Nom (ex: Salon)" class="room-name" style="flex:2;">
        <input type="number" placeholder="m²" class="room-area" style="flex:1;" oninput="calculateTotal()">
    `;
    container.appendChild(div);
}

function calculateTotal() {
    let total = 0;
    const areas = document.querySelectorAll('.room-area');
    areas.forEach(input => {
        total += Number(input.value);
    });
    document.getElementById('totalArea').innerText = total + " m²";
}

function generateReport() {
    const vendeurName = document.getElementById('vendeurName').value;
    const adresse = document.getElementById('adresseBien').value;
    const projet = document.getElementById('projetVendeur').value;
    
    // Récupération des DEUX notes DPE
    const dpeEnergie = document.getElementById('dpeEnergie').value;
    const dpeClimat = document.getElementById('dpeClimat').value;

    // Chauffage
    const checkedChauffage = document.querySelectorAll('input[name="chauffage"]:checked');
    let chauffageList = [];
    checkedChauffage.forEach((checkbox) => {
        chauffageList.push(checkbox.value);
    });
    const chauffage = chauffageList.length > 0 ? chauffageList.join(', ') : "Non renseigné";

    // Toiture
    const typeToiture = document.getElementById('typeToiture').value;
    const etatToiture = document.getElementById('etatToiture').value;
    const isDrone = document.getElementById('droneCheck').checked;
    const droneText = isDrone ? " (✅ Inspecté au Drone)" : "";

    // Volets
    const volets = document.getElementById('volets').value;

    const plus = document.getElementById('plus').value;
    const moins = document.getElementById('moins').value;
    const totalArea = document.getElementById('totalArea').innerText;

    let text = "--- AUDIT VISITE IMMO ---\n\n";
    text += `👤 Vendeur : ${vendeurName}\n`;
    text += `📍 Adresse : ${adresse}\n`;
    text += `🎯 Projet : ${projet}\n\n`;
    
    text += "🔧 TECHNIQUE & CONFORT :\n";
    // Affichage double note
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

addRoom();
