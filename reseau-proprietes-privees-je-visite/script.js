document.addEventListener("DOMContentLoaded", function() {
    // 1. On récupère les paramètres situés dans l'adresse URL
    const urlParams = new URLSearchParams(window.location.search);
    let numeroMandat = urlParams.get('mandat');

    // 2. Éléments HTML à cibler
    const inputMandat = document.getElementById('champ-mandat');
    const affichageMandat = document.getElementById('id-mandat-affiche');

    // 3. Si un numéro de mandat est détecté dans le lien
    if (numeroMandat && numeroMandat.trim() !== "") {
        // Nettoyage de sécurité : si l'URL a capturé des résidus ou des parenthèses, on ne garde que l'essentiel
        numeroMandat = numeroMandat.split(/[() ]+/)[0].trim();

        // On remplit le champ caché du formulaire pour FormSubmit
        if (inputMandat) {
            inputMandat.value = numeroMandat;
        }
        // On met à jour l'affichage visuel sur la page de façon propre
        if (affichageMandat) {
            affichageMandat.textContent = "Référence Mandat : " + numeroMandat;
            affichageMandat.style.display = "inline-block";
        }
    } else {
        // Si aucun mandat n'est précisé dans l'URL
        if (affichageMandat) {
            affichageMandat.textContent = "Sélectionnez un bien depuis nos vidéos";
        }
    }

    // --- AJOUT : Formatage automatique du numéro de téléphone ---
    const phoneInput = document.querySelector('input[type="tel"]') || document.getElementById('telephone');
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // On ne garde que les chiffres
            let value = e.target.value.replace(/\D/g, '');
            
            // On limite à 10 chiffres maximum
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            
            // On sépare par blocs de 2 chiffres avec un espace
            const formattedValue = value.match(/.{1,2}/g);
            e.target.value = formattedValue ? formattedValue.join(' ') : '';
        });
    }
});

const form = document.getElementById("contact-form");
const button = document.getElementById("submit-button");

if (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Bloque la page grise de Formspree
        
        button.disabled = true;
        button.innerHTML = "<span>Envoi en cours...</span>";

        const data = new FormData(form);

        fetch(form.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            // Redirection forcée vers TA page merci
            window.location.href = "https://cioo.io/reseau-proprietes-privees-je-visite/merci.html";
        }).catch(error => {
            // En cas de bug réseau, on redirige quand même pour ne pas bloquer le client
            window.location.href = "https://cioo.io/reseau-proprietes-privees-je-visite/merci.html";
        });
    });
}
