// Chargement initial
window.onload = () => {
    loadData();
};

// Fonction universelle pour ajouter une pièce (Habitable ou Annexe)
function addRoom(type, data = null) {
    const container = document.getElementById(type === 'habitable' ? 'habitableList' : 'annexList');
    const roomId = 'id-' + Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = `room-block ${type}`;
    div.id = roomId;
    div.dataset.type = type;

    div.innerHTML = `
        <div class="room-header">
            <input type="text" placeholder="Nom" class="room-name" value="${data ? data.name : ''}" oninput="saveData()">
            <input type="number" placeholder="m²" class="room-area" value="${data ? data.area : ''}" oninput="calculateTotals(); saveData();">
            <button class="delete-btn" onclick="removeRoom('${roomId}')">✕</button>
        </div>
        <div class="grid-2 mt-5">
            <select class="room-ouvrants" onchange="saveData()">
                <option value="N/A">Ouvrant : N/A</option>
                <option value="Fenêtre" ${data?.ouvrant === 'Fenêtre' ? 'selected' : ''}>Fenêtre</option>
                <option value="P-Fenêtre" ${data?.ouvrant === 'P-Fenêtre' ? 'selected' : ''}>P-Fenêtre</option>
                <option value="Coulissant" ${data?.ouvrant === 'Coulissant' ? 'selected' : ''}>Coulissant</option>
                <option value="Vélux" ${data?.ouvrant === 'Vélux' ? 'selected' : ''}>Vélux</option>
            </select>
            <select class="room-volets" onchange="saveData()">
                <option value="N/A">Volet : N/A</option>
                <option value="Élec" ${data?.volet === 'Élec' ? 'selected' : ''}>Élec</option>
                <option value="Manuel" ${data?.volet === 'Manuel' ? 'selected' : ''}>Manuel</option>
                <option value="Battant" ${data?.volet === 'Battant' ? 'selected' : ''}>Battant</option>
            </select>
        </div>
        <textarea class="room-notes" placeholder="Notes..." rows="1" oninput="saveData()">${data ? data.notes : ''}</textarea>
        <div class="photo-zone">
            <input type="file" accept="image/*" multiple onchange="previewImages(this, '${roomId}-photos')">
            <div id="${roomId}-photos" class="photo-preview-container"></div>
        </div>
    `;
    container.appendChild(div);
    calculateTotals();
}

function removeRoom(id) {
    document.getElementById(id).remove();
    calculateTotals();
    saveData();
}

function calculateTotals() {
    let hab = 0; let ann = 0;
    document.querySelectorAll('#habitableList .room-area').forEach(el => hab += Number(el.value));
    document.querySelectorAll('#annexList .room-area').forEach(el => ann += Number(el.value));
    document.getElementById('totalHabitable').innerText = hab + " m²";
    document.getElementById('totalAnnex').innerText = ann + " m²";
}

// SAUVEGARDE LOCALE
function saveData() {
    const auditData = {
        vendeur: document.getElementById('vendeurName').value,
        adresse: document.getElementById('adresseBien').value,
        projet: document.getElementById('projetVendeur').value,
        dpe: document.getElementById('dpeEnergie').value,
        ges: document.getElementById('dpeClimat').value,
        notes: document.getElementById('notesTechniquesGales').value,
        rooms: []
    };

    document.querySelectorAll('.room-block').forEach(block => {
        auditData.rooms.push({
            type: block.dataset.type,
            name: block.querySelector('.room-name').value,
            area: block.querySelector('.room-area').value,
            ouvrant: block.querySelector('.room-ouvrants').value,
            volet: block.querySelector('.room-volets').value,
            notes: block.querySelector('.room-notes').value
        });
    });

    localStorage.setItem('monAuditSave', JSON.stringify(auditData));
}

function loadData() {
    const saved = localStorage.getItem('monAuditSave');
    if (!saved) return;
    const data = JSON.parse(saved);
    document.getElementById('vendeurName').value = data.vendeur || '';
    document.getElementById('adresseBien').value = data.adresse || '';
    document.getElementById('projetVendeur').value = data.projet || '';
    document.getElementById('dpeEnergie').value = data.dpe || '-';
    document.getElementById('dpeClimat').value = data.ges || '-';
    document.getElementById('notesTechniquesGales').value = data.notes || '';
    
    data.rooms.forEach(r => addRoom(r.type, r));
}

function resetForm() {
    if(confirm("Effacer tout l'audit en cours ?")) {
        localStorage.removeItem('monAuditSave');
        location.reload();
    }
}

// GESTION PHOTOS (Vignettes)
function previewImages(input, containerId) {
    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const wrap = document.createElement('div');
            wrap.className = 'img-wrapper';
            wrap.innerHTML = `<img src="${e.target.result}" class="stored-img"><span class="remove-img" onclick="this.parentElement.remove()">×</span>`;
            document.getElementById(containerId).appendChild(wrap);
        };
        reader.readAsDataURL(file);
    });
}

// IMPRESSION PDF
function printReport() {
    document.getElementById('p-date').innerText = "Expertise du " + new Date().toLocaleDateString();
    document.getElementById('p-total-hab').innerText = document.getElementById('totalHabitable').innerText;
    document.getElementById('p-total-annex').innerText = document.getElementById('totalAnnex').innerText;
    
    let content = `<h3>👤 CLIENT</h3><p>${document.getElementById('vendeurName').value} - ${document.getElementById('adresseBien').value}</p>`;
    content += `<h3>🔧 TECHNIQUE</h3><p>DPE : ${document.getElementById('dpeEnergie').value} / GES : ${document.getElementById('dpeClimat').value}</p>`;
    content += `<p>Notes : ${document.getElementById('notesTechniquesGales').value}</p>`;
    
    // Pièces Habitables
    content += `<h3>🏠 PIÈCES HABITABLES</h3>`;
    document.querySelectorAll('#habitableList .room-block').forEach(el => content += getRoomHtml(el));
    
    // Annexes
    content += `<h3>📦 SURFACES ANNEXES</h3>`;
    document.querySelectorAll('#annexList .room-block').forEach(el => content += getRoomHtml(el));

    document.getElementById('p-content').innerHTML = content;
    window.print();
}

function getRoomHtml(el) {
    const name = el.querySelector('.room-name').value;
    const area = el.querySelector('.room-area').value;
    if(!name) return "";
    let h = `<div class="p-item"><strong>${name}</strong> : ${area} m²<div class="p-gallery">`;
    el.querySelectorAll('.stored-img').forEach(img => h += `<img src="${img.src}">`);
    h += `</div></div>`;
    return h;
}
