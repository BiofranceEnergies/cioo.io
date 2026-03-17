document.addEventListener('DOMContentLoaded', () => {
    // Fonction pour sauvegarder automatiquement les données saisies
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            console.log(`Champ ${input.name || input.placeholder} mis à jour.`);
            // On peut ici ajouter un stockage en LocalStorage pour ne pas perdre la saisie
            localStorage.setItem(input.name, input.value);
        });
    });

    // Message de confirmation au chargement
    console.log("Bilan Technique Propriétés-Privées prêt à l'emploi.");
});
