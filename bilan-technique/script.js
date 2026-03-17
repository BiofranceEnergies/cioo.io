document.addEventListener('DOMContentLoaded', () => {
    // Initialisation
    console.log("Formulaire Propriétés-Privées - Intégralité chargée.");

    // Fonction pour ajouter dynamiquement des lignes de tableau si nécessaire
    const addRow = (tableId) => {
        const table = document.getElementById(tableId);
        // Logique d'ajout de ligne
    };

    // Alerte pour le rapport SPANC (Page 9 [cite: 741])
    const spanc = document.querySelector('input[name="spanc_fait"]');
    if(spanc) {
        spanc.addEventListener('change', (e) => {
            if(!e.target.checked) alert("Le rapport SPANC est INDISPENSABLE pour le compromis.");
        });
    }
});
