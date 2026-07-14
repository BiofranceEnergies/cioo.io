document.addEventListener("DOMContentLoaded", function() {
    // 1. On récupère les paramètres situés dans l'adresse URL
    const urlParams = new URLSearchParams(window.location.search);
    const numeroMandat = urlParams.get('mandat');

    // 2. Éléments HTML à cibler
    const inputMandat = document.getElementById('champ-mandat');
    const affichageMandat = document.getElementById('id-mandat-affiche');

    // 3. Si un numéro de mandat est détecté dans le lien
    if (numeroMandat && numeroMandat.trim() !== "") {
        // On remplit le champ caché du formulaire
        if (inputMandat) {
            inputMandat.value = numeroMandat;
        }
        // On met à jour l'affichage visuel sur la page
        if (affichageMandat) {
            affichageMandat.textContent = "Référence Mandat : " + numeroMandat;
            affichageMandat.style.display = "inline-block"; // S'assure qu'il est bien visible
        }
    } else {
        // Si aucun mandat n'est précisé dans l'URL
        if (affichageMandat) {
            affichageMandat.textContent = "Sélectionnez un bien depuis nos vidéos";
            // Optionnel : on peut aussi simplement masquer le badge si pas de mandat
            // affichageMandat.style.display = "none";
        }
    }
});
