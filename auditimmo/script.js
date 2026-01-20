// Fonction pour ajouter une ligne de pièce
function addRoom() {
    const container = document.getElementById('roomsContainer');
    const div = document.createElement('div');
    div.className = 'room-row';
    
    // On injecte le HTML des inputs
    div.innerHTML = `
        <input type="text" placeholder="Nom (ex: Salon)" class="room-name" style="flex:2;">
        <input type="number" placeholder="m²" class="room-area" style="flex:1;" oninput="calculateTotal()">
    `;
    
    container.appendChild(div);
}

// Fonction pour calculer le total en temps réel
function calculateTotal() {
    let total = 0;
    const areas = document.querySelectorAll('.room-area');
    
    areas.forEach(input => {
        // On convertit la valeur en nombre (Number)
        total += Number(input.value);
    });
    
    // On met à jour l'affichage
    document.getElementById('totalArea').innerText = total + " m²";
}

// Fonction pour générer le rapport final
function generateReport() {
    // Récupération des valeurs
    const vendeurName = document.getElementById('vendeurName').value;
    const adresse = document.getElementById('adresseBien').value;
    const projet = document.getElementById('projetVendeur').value;
    const chauffage = document.getElementById('chauffage').value;
    const toiture = document.getElementById('toiture').value;
    const fenetres = document.getElementById('fenetres').value;
    const plus = document.getElementById('plus').value;
    const moins = document.getElementById('moins').value;
    const totalArea = document.getElementById('totalArea').innerText;

    // Construction du texte
    let text = "--- AUDIT VISITE IMMO ---\n\n";
    text += `👤 Vendeur : ${vendeurName}\n`;
    text += `📍 Adresse : ${adresse}\n`;
    text += `🎯 Projet : ${projet}\n\n`;
    
    text += "🔧 TECHNIQUE :\n";
    text += `- Chauffage : ${chauffage}\n`;
    text += `- Toiture : ${toiture}\n`;
    text += `- Fenêtres : ${fenetres}\n\n`;

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

    // Copie dans le presse-papier
    navigator.clipboard.writeText(text).then(() => {
        alert("Rapport copié ! Tu peux le coller dans tes notes ou un mail.");
    }).catch(err => {
        alert("Erreur lors de la copie : " + err);
    });
}

// On lance l'ajout d'une première pièce au chargement de la page
addRoom();
