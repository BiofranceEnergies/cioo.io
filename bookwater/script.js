document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. NAVIGATION ENTRE LES SLIDES ---
    window.goToSlide = function(slideNumber) {
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`slide-${slideNumber}`);
        if(target) target.classList.add('active');

        const badge = document.getElementById('step-indicator');
        if(slideNumber === 1) badge.textContent = "Slide 1 / Le Constat";
        if(slideNumber === 2) badge.textContent = "Slide 2 / Le Diagnostic";
        if(slideNumber === 3) badge.textContent = "Slide 3 / L'Audit Financier";
    };

    // --- 2. LOGIQUE SLIDE 1 (Calculateur TH) ---
    // (Code identique à la version précédente pour l'animation barres et le calcul KG)
    setTimeout(() => {
        const bars = document.querySelectorAll('.bar-fill');
        bars.forEach(bar => {
            const targetWidth = bar.style.width; 
            bar.style.width = '0'; 
            setTimeout(() => { bar.style.width = targetWidth; }, 50);
        });
    }, 200);

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

    // --- 3. LOGIQUE SLIDE 3 (Calculateur Financier - LP LOGIC) ---
    let peopleCount = 4; // Défaut

    window.adjustPeople = function(delta) {
        peopleCount += delta;
        if(peopleCount < 1) peopleCount = 1;
        if(peopleCount > 10) peopleCount = 10;
        
        document.getElementById('nb-people-display').textContent = peopleCount;
        calculateAudit();
    };

    function calculateAudit() {
        // FORMULES EXACTES DE TA LANDING PAGE :
        // Energie : 800 * 0.27 * 0.1 = 21.6 €/pers
        const ecoEnergie = Math.round(peopleCount * 21.6);
        
        // Produits : 220 * 0.40 = 88 €/pers
        const ecoProduits = Math.round(peopleCount * 88);
        
        // Matériel : Fixe 80 €
        const ecoMateriel = 80;

        const totalSavings = ecoEnergie + ecoProduits + ecoMateriel;
        const tenYearSavings = totalSavings * 10;

        // Affichage
        // On anime le chiffre (optionnel, mais sympa)
        document.getElementById('total-waste').textContent = totalSavings;
        
        // Update texte 10 ans
        const projectionEl = document.querySelector('.audit-projection strong');
        if(projectionEl) projectionEl.textContent = tenYearSavings.toLocaleString('fr-FR') + " €";
    }

    // ...
if(slideNumber === 3) badge.textContent = "Slide 3 / L'Audit Financier";
if(slideNumber === 4) badge.textContent = "Slide 4 / La Solution Novaqua"; // C'est tout bon

    // Calcul initial au chargement
    calculateAudit();
});
