// Fonction pour ajouter une pièce (Galerie ou Photo)
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
            <label>📸 Photo :</label>
            <input type="file" accept="image/*" onchange="previewRoomImage(this)" class="no-print">
            <img class="room-preview" src="" alt="Aperçu">
        </div>
    `;
    container.appendChild(div);
}

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

function calculateTotal() {
    let total = 0;
    const areas = document.querySelectorAll('.room-area');
    areas.forEach(input => {
        total += Number(input.value);
    });
    document.getElementById('totalArea').innerText = total + " m²";
}

// --- NOUVELLE FONCTION : GÉNÉRER LE PDF ---
function downloadPDF() {
    // On sélectionne l'élément qui contient tout l'audit
    const element = document.getElementById('contentToPrint');
    
    // On récupère le nom du client pour le nom du fichier
    const clientName = document.getElementById('vendeurName').value || "Client";
    
    // Options du PDF
    const opt = {
        margin:       10,
        filename:     `Audit_${clientName}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 }, // Meilleure qualité
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // On lance la génération (ça peut prendre 2-3 secondes)
    alert("Création du PDF en cours... Patientez quelques secondes.");
    html2pdf().set(opt).from(element).save();
}

addRoom();
