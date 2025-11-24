document.addEventListener('DOMContentLoaded', () => {
    
    // Sélection des éléments
    const heroVisual = document.getElementById('heroVisual');
    const productWrapper = document.querySelector('.product-wrapper');
    
    // Configuration de l'effet
    const movementStrength = 25; // Plus le chiffre est haut, plus ça bouge

    // Fonction de mouvement
    function handleMouseMove(e) {
        // Détecter si on est sur mobile (pour ne pas activer l'effet)
        if (window.innerWidth < 968) return;

        // Calculer la position de la souris par rapport au centre de l'écran
        const height = movementStrength / window.innerHeight;
        const width = movementStrength / window.innerWidth;

        const pageX = e.pageX - (window.innerWidth / 2);
        const pageY = e.pageY - (window.innerHeight / 2);

        const newvalueX = width * pageX * -1 - 25; // Inverser pour effet profondeur
        const newvalueY = height * pageY * -1 - 50;

        // Appliquer la transformation CSS
        productWrapper.style.transform = `translate(${newvalueX}px, ${newvalueY}px)`;
    }

    // Écouteur d'événement sur la zone Hero
    if(heroVisual) {
        document.addEventListener('mousemove', handleMouseMove);
    }

    // Animation d'entrée douce au chargement
    productWrapper.style.opacity = '0';
    productWrapper.style.transition = 'opacity 1s ease-out, transform 0.1s ease-out';
    
    setTimeout(() => {
        productWrapper.style.opacity = '1';
    }, 200);
});
