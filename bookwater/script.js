document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ANIMATION DES BARRES (Graphique de droite) ---
    // On attend un tout petit peu que la page s'affiche
    setTimeout(() => {
        const bars = document.querySelectorAll('.bar-fill');
        bars.forEach(bar => {
            const targetWidth = bar.style.width; 
            // On met la largeur à 0 pour commencer
            bar.style.width = '0'; 
            
            // On lance l'animation vers la vraie largeur
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 50);
        });
    }, 200);

    // --- 2. CALCULATEUR INTERACTIF ---
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

        // Affichage (si entier on affiche entier, sinon 1 chiffre après virgule)
        resultDisplay.textContent = Number.isInteger(totalKg) ? totalKg : totalKg.toFixed(1);
    }

    // On écoute les changements sur les inputs
    if(thInput && volInput) {
        thInput.addEventListener('input', calculateRock);
        volInput.addEventListener('input', calculateRock);
        // Calcul initial
        calculateRock();
    }

    // --- 3. BOUTON SUIVANT ---
    const btnNext = document.querySelector('.nav-btn.primary');
    if(btnNext) {
        btnNext.addEventListener('click', () => {
            alert("La Slide 2 (Les Dégâts) sera prête dans la prochaine étape !");
        });
    }

});
