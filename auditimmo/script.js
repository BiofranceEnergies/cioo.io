// Initialisation
window.onload = () => { addRoom(); };

function addRoom() {
    const container = document.getElementById('roomsContainer');
    const roomId = 'room-' + Date.now();
    const div = document.createElement('div');
    div.className = 'room-block';
    div.id = roomId;

    div.innerHTML = `
        <div class="room-header">
            <input type="text" placeholder="Pièce (ex: Salon)" class="room-name" style="flex:2;">
            <input type="number" placeholder="m²" class="room-area" style="flex:1;" oninput="calculateTotal()">
            <button class="delete-btn" onclick="document.getElementById('${roomId}').remove(); calculateTotal();">✕</button>
        </div>

        <div class="grid-2" style="margin-top:10px;">
            <div>
                <label>Ouvrant</label>
                <select class="room-ouvrants">
                    <option value="Aucun">Aucun</option>
                    <option value="Fenêtre">Fenêtre</option>
                    <option value="Porte-Fenêtre">Porte-Fenêtre</option>
                    <option value="Coulissant">Coulissant</option>
                    <option value="Vélux">Vélux</option>
                </select>
            </div>
            <div>
                <label>Volet</label>
                <select class="room-volets">
                    <option value="Sans">Sans</option>
                    <option value="Roulant Élec.">Roulant Élec.</option>
                    <option value="Roulant Man.">Roulant Man.</option>
                    <option value="Battant">Battant</option>
                </select>
            </div>
        </div>

        <textarea class="room-notes" placeholder="Notes sur la pièce..." rows="1" style="margin-top:10px;"></textarea>

        <div class="photo-zone">
            <label class="photo-input-label">
                📷 Ajouter des photos
                <input type="file" accept="image/*" multiple onchange="previewImages(this, '${roomId}-photos')">
            </label>
            <div id="${roomId}-photos" class="photo-preview-container"></div>
        </div>
    `;
    container.appendChild(div);
}

function previewImages(input, containerId) {
    const container = document.getElementById(containerId);
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgWrapper = document.createElement('div');
                imgWrapper.className = 'img-wrapper';
                imgWrapper.innerHTML = `<img src="${e.target.result}" class="stored-img"><span class="remove-img" onclick="this.parentElement.remove()">×</span>`;
                container.appendChild(imgWrapper);
            }
            reader.readAsDataURL(file);
        });
    }
}

function calculateTotal() {
    let total = 0;
    document.querySelectorAll('.room-area').forEach(input => { total += Number(input.value); });
    document.getElementById('totalArea').innerText = total + " m²";
}

function printReport() {
    // Infos Vendeur
    document.getElementById('p-date').innerText = "Le " + new Date().toLocaleDateString('fr-FR');
    document.getElementById('p-nom').innerText = document.getElementById('vendeurName').value || "/";
    document.getElementById('p-adresse').innerText = document.getElementById('adresseBien').value || "/";
    document.getElementById('p-projet').innerText = document.getElementById('projetVendeur').value || "/";
    
    // Technique
    document.getElementById('p-dpe').innerText = document.getElementById('dpeEnergie').value + " / GES : " + document.getElementById('dpeClimat').value;
    document.getElementById('p-toiture').innerText = document.getElementById('typeToiture').value + " (" + document.getElementById('etatToiture').value + ")";
    
    // LA NOTE TECHNIQUE MANUELLE
    document.getElementById('p-notes-tech').innerText = document.getElementById('notesTechniquesGales').value || "Aucune note particulière.";

    // Pièces
    document.getElementById('p-total').innerText = document.getElementById('totalArea').innerText;
    const list = document.getElementById('p-rooms-list');
    list.innerHTML = "";

    document.querySelectorAll('.room-block').forEach(block => {
        const name = block.querySelector('.room-name').value;
        const area = block.querySelector('.room-area').value;
        const imgs = block.querySelectorAll('.stored-img');
        const ouvrant = block.querySelector('.room-ouvrants').value;
        const volet = block.querySelector('.room-volets').value;
        const notes = block.querySelector('.room-notes').value;

        if (name) {
            let html = `<div class="p-room-item">
                <div class="p-room-header"><strong>${name}</strong> <span>${area} m²</span></div>
                <div style="font-size:0.9rem; margin-bottom:5px;">Ouvrant : ${ouvrant} | Volet : ${volet}</div>
                ${notes ? `<p style="font-size:0.85rem; color:#555;"><em>${notes}</em></p>` : ''}
                <div class="p-room-gallery">`;
            imgs.forEach(img => html += `<img src="${img.src}">`);
            html += `</div></div>`;
            list.innerHTML += html;
        }
    });

    window.print();
}
