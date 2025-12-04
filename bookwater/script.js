document.addEventListener('DOMContentLoaded', () => {
    
    // Animation d'entrée des barres de graphique
    // On attend 200ms que la page soit affichée
    setTimeout(() => {
        const bars = document.querySelectorAll('.bar-fill');
        
        // On récupère la largeur cible définie dans le style HTML (ex: style="width: 20%")
        // Et on l'applique réellement pour déclencher la transition CSS
        bars.forEach(bar => {
            const targetWidth = bar.style.width; 
            bar.style.width = '0'; // On reset à 0
            
            // On force le navigateur à calculer le style 0
            setTimeout(() => {
                bar.style.width = targetWidth; // On lance l'anim vers la cible
            }, 50);
        });
    }, 200);

    // Interaction Bouton Suivant (Pour plus tard)
    const btnNext = document.querySelector('.nav-btn.primary');
    btnNext.addEventListener('click', () => {
        alert("La Slide 2 (Les Dégâts) sera prête dans la prochaine étape !");
    });
    document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ANIMATION DES BARRES (Graphique de droite) ---
    setTimeout(() => {
        const bars = document.querySelectorAll('.bar-fill');
        bars.forEach(bar => {
            const targetWidth = bar.style.width; 
            bar.style.width = '0'; 
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 50);
        });
    }, 200);

    // --- 2. CALCULATEUR INTERACTIF (Nouveau) ---
    const thInput = document.getElementById('th-input');
    const volInput = document.getElementById('vol-input');
    const resultDisplay = document.getElementById('rock-result');

    function calculateRock() {
        // Récupérer les valeurs (0 si vide)
        const th = parseFloat(thInput.value) || 0;
        const vol = parseFloat(volInput.value) || 0;

        // Formule : (TH x 10g) x Volume = Grammes total
        // On divise par 1000 pour avoir des Kilos
        const totalKg = (th * 10 * vol) / 1000;

        // Affichage (avec 1 chiffre après la virgule si besoin, sinon entier)
        // Si c'est un entier (ex: 36), on affiche 36. Si c'est 36.5, on affiche 36.5
        resultDisplay.textContent = Number.isInteger(totalKg) ? totalKg : totalKg.toFixed(1);
    }

    // Écouter les changements (dès qu'on tape une lettre)
    thInput.addEventListener('input', calculateRock);
    volInput.addEventListener('input', calculateRock);

    // Lancer le calcul une première fois au démarrage
    calculateRock();

});

});
