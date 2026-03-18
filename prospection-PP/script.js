// --- 3. ENVOI DES DONNEES ET PHOTO ---
form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const status = document.getElementById('status');
    
    btn.disabled = true;
    btn.innerText = "Envoi en cours...";
    status.innerText = "Connexion au serveur...";

    const file = document.getElementById('photo_file').files[0];
    const formData = new FormData(form);
    
    // On crée un objet propre avec toutes les données
    let mainData = {};
    formData.forEach((value, key) => { mainData[key] = value; });

    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            mainData.fileData = reader.result.split(',')[1];
            mainData.mimeType = file.type;
            mainData.fileName = file.name;
            sendNow(mainData);
        };
    } else {
        sendNow(mainData);
    }
});

function sendNow(obj) {
    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(obj) // On envoie en JSON
    })
    .then(res => {
        document.getElementById('status').innerText = "✅ Succès ! Bien enregistré dans 'BIENS'.";
        document.getElementById('status').style.color = "green";
        form.reset();
        prixM2.value = "";
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('submitBtn').innerText = "ENREGISTRER AU TABLEAU";
    })
    .catch(err => {
        document.getElementById('status').innerText = "❌ Erreur d'envoi. Vérifiez votre connexion.";
        document.getElementById('status').style.color = "red";
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('submitBtn').innerText = "RÉESSAYER";
    });
}
