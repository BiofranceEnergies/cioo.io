document.addEventListener('DOMContentLoaded', () => {
    
    // On sélectionne tous les éléments qui ont la classe 'anim'
    const elementsToAnimate = document.querySelectorAll('.anim');

    // On utilise l'IntersectionObserver : c'est la façon moderne et performante
    // de détecter quand un élément est visible à l'écran
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Si l'élément est visible
            if (entry.isIntersecting) {
                // On ajoute la classe 'visible' qui déclenche le CSS
                entry.target.classList.add('visible');
                // On arrête d'observer cet élément (l'anim ne se joue qu'une fois)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // L'animation se lance quand 10% de l'élément est visible
    });

    // On lance l'observation sur chaque élément
    elementsToAnimate.forEach(el => observer.observe(el));
});
