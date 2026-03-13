// Fonction pour ajouter une pièce complète
function addRoom() {
    const container = document.getElementById('roomsContainer');
    const roomId = 'room-' + Date.now();
    const div = document.createElement('div');
    div.className = 'room-block';
    div.id = roomId;

    div.innerHTML = `
        <div class="room-header">
            <input type="text" placeholder="Nom (ex: Salon)" class="room-name" style="flex:2;">
            <input type="number" placeholder="m²" class="room-area" style="flex:1;" oninput="calculateTotal()">
            <button class="delete-btn" onclick="document.getElementById('${roomId}').remove(); calculateTotal();">✕</button>
        </div>

        <div class="room-details-grid">
            <div>
                <label>Ouvrants</label>
                <select class="room-ouvrants">
                    <option value="Aucun">Aucun</option>
                    <option value="Fénêtre">Fenêtre</option>
                    <option value="Porte-Fenêtre">Porte-Fenêtre</option>
                    <option value="Coulissant">Coulissant</option>
                    <option value="Vélux">Vélux</option>
                </select>
            </div>
            <div>
                <label>Volets</label>
                <select class="room-volets">
                    <option value="N/A">N/A</option>
                    <option value="Roulant Élec.">Roulant Élec.</option>
                    <option value="Roulant Manuel">Roulant Manuel</option>
                    <option value="Battant">Battant</option>
                </select>
            </div>
        </div>

        <textarea class="room-notes" placeholder="Notes (état des murs, prises, etc...)" rows="2"></textarea>

        <div class="photo-section">
            <label class="photo-upload-label">
                📷 Ajouter des photos
                <input type="file" accept="image/*" multiple onchange="previewImages(this, '${roomId}-photos')">
            </label>
            <div id="${roomId}-photos" class="photo-preview-container"></div>
        </div>
    `;
    container.appendChild(div);
}

// Gérer plusieurs images
function previewImages(input, containerId) {
    const container = document.getElementById(containerId);
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'img-wrapper';
                imgWrapper.innerHTML = `
                    <img src="${e.target.result}" class="room-preview-img">
                    <span class="remove-img" onclick="this.parentElement.remove()">×</span>
                `;
                container.appendChild(imgWrapper);
            }
            reader.readAsDataURL(file);
        });
    }
}

// Mise à jour de la fonction d'impression pour inclure les nouveaux champs
function printReport() {
    // ... (garder le début de ta fonction pour les infos vendeurs) ...
    
    // Copie des pièces
    const printContainer = document.getElementById('p-rooms-list');
    printContainer.innerHTML = ""; 

    document.querySelectorAll('.room-block').forEach(block => {
        const name = block.querySelector('.room-name').value;
        const area = block.querySelector('.room-area').value;
        const ouvrant = block.querySelector('.room-ouvrants').value;
        const volet = block.querySelector('.room-volets').value;
        const notes = block.querySelector('.room-notes').value;
        const images = block.querySelectorAll('.room-preview-img');

        if (name || area) {
            let html = `<div class="p-room-item">
                <div class="p-room-main">
                    <strong>${name}</strong> — ${area} m²
                </div>
                <div class="p-room-details">
                    <span>Ouvrant: ${ouvrant}</span> | <span>Volet: ${volet}</span>
                </div>
                ${notes ? `<p class="p-room-notes"><em>Note: ${notes}</em></p>` : ''}
                <div class="p-room-gallery">`;
            
            images.forEach(img => {
                html += `<img src="${img.src}" class="p-room-img-mini">`;
            });

            html += `</div></div>`;
            printContainer.innerHTML += html;
        }
    });
    window.print();
}
