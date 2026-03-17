/**
 * Logique pour le Bilan Technique Propriétés-Privées
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Formulaire Propriétés-Privées chargé.");

    const form = document.getElementById('bilanForm');

    // Fonction pour sauvegarder localement les données saisies (évite de tout perdre)
    form.addEventListener('input', (e) => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem('draft_bilan', JSON.stringify(data));
    });

    // Charger le brouillon si existant
    const saved = localStorage.getItem('draft_bilan');
    if (saved) {
        console.log("Brouillon récupéré.");
        // Ici, on pourrait boucler pour remplir les champs automatiquement
    }

    // Gestion de la conformité assainissement (Mémo Page 9 [cite: 738])
    const spancFait = document.querySelector('input[name="spanc_fait"]');
    if (spancFait) {
        spancFait.addEventListener('change', () => {
            if (!spancFait.checked) {
                alert("Attention : Le rapport SPANC est INDISPENSABLE pour la signature du compromis."); [cite: 741]
            }
        });
    }
});
