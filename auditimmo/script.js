// Initialisation au chargement
window.onload = () => {
    addRoom(); // Ajoute une première pièce vide
};

// Fonction pour ajouter un bloc pièce complet
function addRoom() {
    const container = document.getElementById('roomsContainer');
    const roomId = 'room-' + Date.now();
    const div = document.createElement('div');
    div.className = 'room-block';
    div.id = roomId;

    div.innerHTML = `
        <div class="room-header">
            <input type="text" placeholder="Nom de la pièce (ex: Chambre 1)" class="room-name" style="flex:2;">
            <input type="number" placeholder="m²" class="room-area" style="flex:1;" oninput="calculateTotal()">
            <button class="delete-btn" onclick="document.getElementById('${roomId}').remove(); calculateTotal();">✕</button>
        </div>

        <div class="grid-2" style="margin-top:10px;">
            <div>
                <label>Type d'ouvrant</label>
                <select class="room-ouvrants">
                    <option value="Aucun">Aucun</option>
                    <option value="Fenêtre">Fenêtre</option>
                    <option value="Porte-Fenêtre">Porte-Fenêtre</option>
                    <option value="Coulissant">Coulissant</option>
                    <option value="Vélux">Vélux</option>
                </select>
            </div>
            <div>
                <label>Type de volet</label>
                <select class="room-volets">
                    <option value="Sans">Sans volet</option>
                    <option value="Roulant Élec.">Roulant Élec.</option>
                    <option value="Roulant Manuel">Roulant Manuel</option>
                    <option value="Battant">Battant (Bois/PVC)</option>
                </select>
            </div>
        </div>

        <textarea class="room-notes" placeholder="Notes techniques (état des murs, électricité, etc.)" rows="1" style="margin-top:10px;"></textarea>

        <div class="photo-zone">
            <label class="photo-input-label">
                📷 Ajouter des photos de la pièce
                <input type="file" accept="image/*" multiple onchange="previewImages(this, '${roomId}-photos')">
            </label>
            <div id="${roomId}-photos" class="photo-preview-container"></div>
        </div>
    `;
    container.appendChild(div);
}

// Gérer l'affichage des miniatures (multiples)
function previewImages(input, containerId) {
    const container = document.getElementById(containerId);
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'img-wrapper';
                imgWrapper.innerHTML = `
                    <img src="${e.target.result}" class="stored-img">
                    <span class="remove-img" onclick="this.parentElement.remove()">×</span>
                `;
                container.appendChild(imgWrapper);
            }
            reader.readAsDataURL(file);
        });
    }
}

// Calcul de la surface totale
function calculateTotal() {
    let total = 0;
    document.querySelectorAll('.room-area').forEach(input => {
        total += Number(input.value);
    });
    document.getElementById('totalArea').innerText = total + " m²";
}

// Préparation et lancement de l'impression
function printReport() {
    // 1. Remplissage des infos générales
    document.getElementById('p-date').innerText = "Le " + new Date().toLocaleDateString('fr-FR');
    document.getElementById('p-nom').innerText = document.getElementById('vendeurName').value || "Non renseigné";
    document.getElementById('p-adresse').innerText = document.getElementById('adresseBien').value || "Non renseignée";
    document.getElementById('p-projet').innerText = document.getElementById('projetVendeur').value || "Non renseigné";
    
    const dpe = `Énergie : ${document.getElementById('dpeEnergie').value} / GES : ${document.getElementById('dpeClimat').value}`;
    document.getElementById('p-dpe').innerText = dpe;
    
    const toit = `${document.getElementById('typeToiture').value} (${document.getElementById('etatToiture').value})`;
    document.getElementById('p-toiture').innerText = toit;
    
    document.getElementById('p-total').innerText = document.getElementById('totalArea').innerText;

    // 2. Construction de la liste des pièces
    const printContainer = document.getElementById('p-rooms-list');
    printContainer.innerHTML = "";

    document.querySelectorAll('.room-block').forEach(block => {
        const name = block.querySelector('.room-name').value;
        const area = block.querySelector('.room-area').value;
        const ouvrant = block.querySelector('.room-ouvrants').value;
        const volet = block.querySelector('.room-volets').value;
        const notes = block.querySelector('.room-notes').value;
        const images = block.querySelectorAll('.stored-img');

        if (name || area) {
            let html = `
                <div class="p-room-item">
                    <div class="p-room-header">
                        <strong>${name || "Pièce sans nom"}</strong>
                        <span>${area || "0"} m²</span>
                    </div>
                    <div class="p-room-details">
                        Ouvrant : ${ouvrant} | Volet : ${volet}
                    </div>
                    ${notes ? `<p class="p-room-notes"><em>Note : ${notes}</em></p>` : ''}
                    <div class="p-room-gallery">
            `;
            
            images.forEach(img => {
                html += `<img src="${img.src}">`;
            });

            html += `</div></div>`;
            printContainer.innerHTML += html;
        }
    });

    // 3. Impression
    window.print();
}
