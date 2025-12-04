document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. NAVIGATION ENTRE LES SLIDES ---
    window.goToSlide = function(slideNumber) {
        // Cacher toutes les slides
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        
        // Montrer la bonne
        const target = document.getElementById(`slide-${slideNumber}`);
        if(target) target.classList.add('active');

        // Mettre à jour le badge en haut
        const badge = document.getElementById('step-indicator');
        if(slideNumber === 1) badge.textContent = "Slide 1 / Le Constat";
        if(slideNumber === 2) badge.textContent = "Slide 2 / Le Diagnostic";
    };

    // --- 2. ANIMATION DES BARRES (Graphique Slide 1) ---
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

    // --- 3. CALCULATEUR (Slide 1) ---
    const thInput = document.getElementById('th-input');
    const volInput = document.getElementById('vol-input');
    const resultDisplay = document.getElementById('rock-result');

    function calculateRock() {
        if(!thInput || !volInput) return;
        
        const th = parseFloat(thInput.value) || 0;
        const vol = parseFloat(volInput.value) || 0;
        const totalKg = (th * 10 * vol) / 1000;

        resultDisplay.textContent = Number.isInteger(totalKg) ? totalKg : totalKg.toFixed(1);
    }

    if(thInput && volInput) {
        thInput.addEventListener('input', calculateRock);
        volInput.addEventListener('input', calculateRock);
        calculateRock();
    }
});
