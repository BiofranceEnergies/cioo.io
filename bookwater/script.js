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

});
