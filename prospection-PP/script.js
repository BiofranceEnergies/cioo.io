const scriptURL = 'https://script.google.com/macros/s/AKfycbzuWqH_Yco59DG8orfiQIJg0vfxzqY2zRXoejgZH8mpYQfaBPxEWkQx1_DRoJHFVzkh/exec'; // <-- METS TA DERNIÈRE URL ICI

const form = document.getElementById('ppForm');
const btn = document.getElementById('submitBtn');
const status = document.getElementById('status');

form.addEventListener('submit', e => {
    e.preventDefault();
    btn.disabled = true;
    btn.innerText = "Compression & Envoi...";

    const file = document.getElementById('photo_file').files[0];
    const formData = new FormData(form);
    let payload = Object.fromEntries(formData.entries());

    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX = 1000; // On réduit encore la taille pour la sécurité

                if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
                else if (height > MAX) { width *= MAX / height; height = MAX; }

                canvas.width = width; canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);

                payload.fileData = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                payload.mimeType = 'image/jpeg';
                payload.fileName = 'photo_' + Date.now() + '.jpg';

                sendToServer(payload);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        sendToServer(payload);
    }
});

function sendToServer(data) {
    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // On reste en no-cors pour éviter les blocages
        body: JSON.stringify(data)
    })
    .then(() => {
        status.innerText = "✅ Terminé ! Vérifiez votre tableau.";
        status.style.color = "green";
        form.reset();
        btn.disabled = false;
        btn.innerText = "ENREGISTRER AU TABLEAU";
    })
    .catch(err => {
        status.innerText = "❌ Erreur d'envoi.";
        btn.disabled = false;
    });
}
