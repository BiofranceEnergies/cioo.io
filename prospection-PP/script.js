const scriptURL = 'https://script.google.com/macros/s/AKfycbzuWqH_Yco59DG8orfiQIJg0vfxzqY2zRXoejgZH8mpYQfaBPxEWkQx1_DRoJHFVzkh/exec';
const form = document.getElementById('ppForm');
const addrInput = document.getElementById('adresse_input');
const suggestionsBox = document.getElementById('suggestions');

// 1. AUTOCOMPLETION
addrInput.addEventListener('input', function() {
    if (this.value.length < 5) { suggestionsBox.style.display = 'none'; return; }
    fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(this.value)}&limit=5`)
        .then(res => res.json())
        .then(data => {
            suggestionsBox.innerHTML = '';
            if (data.features.length > 0) {
                suggestionsBox.style.display = 'block';
                data.features.forEach(f => {
                    let div = document.createElement('div');
                    div.className = 'suggestion-item';
                    div.innerText = f.properties.label;
                    div.onclick = () => {
                        addrInput.value = f.properties.name;
                        document.getElementById('cp').value = f.properties.postcode;
                        document.getElementById('ville').value = f.properties.city;
                        suggestionsBox.style.display = 'none';
                    };
                    suggestionsBox.appendChild(div);
                });
            }
        });
});

// 2. CALCUL PRIX M2
const calc = () => {
    const s = parseFloat(document.getElementById('surf_h').value);
    const p = parseFloat(document.getElementById('prix').value);
    document.getElementById('prix_m2').value = (s > 0 && p > 0) ? Math.round(p / s) + " €/m²" : "";
};
document.getElementById('surf_h').addEventListener('input', calc);
document.getElementById('prix').addEventListener('input', calc);

// 3. ENVOI
form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true; btn.innerText = "Envoi...";
    
    const file = document.getElementById('photo_file').files[0];
    const formData = new FormData(form);
    const params = new URLSearchParams();
    for (const pair of formData.entries()) { params.append(pair[0], pair[1]); }

    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            params.append('fileData', reader.result.split(',')[1]);
            params.append('mimeType', file.type);
            params.append('fileName', file.name);
            send(params);
        };
    } else { send(params); }
});

function send(params) {
    fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: params.toString() })
    .then(() => {
        document.getElementById('status').innerText = "✅ Bien enregistré !";
        form.reset();
        btn.disabled = false; btn.innerText = "ENREGISTRER AU TABLEAU";
    });
}
