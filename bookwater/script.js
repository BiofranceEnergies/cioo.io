document.addEventListener('DOMContentLoaded', () => {
    
    // ============================================================
    // 1. NAVIGATION ENTRE LES SLIDES (Moteur du Book)
    // ============================================================
    window.goToSlide = function(slideNumber) {
        // Cacher toutes les slides
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        
        // Montrer la slide cible
        const target = document.getElementById(`slide-${slideNumber}`);
        if(target) target.classList.add('active');

        // Mettre à jour le titre en haut à droite
        const badge = document.getElementById('step-indicator');
        if(badge) {
            if(slideNumber === 1) badge.textContent = "Slide 1 / Le Constat";
            if(slideNumber === 2) badge.textContent = "Slide 2 / Le Diagnostic";
            if(slideNumber === 3) badge.textContent = "Slide 3 / L'Audit Financier";
            if(slideNumber === 4) badge.textContent = "Slide 4 / La Solution Novaqua";
        }
    };

    // ============================================================
    // 2. ANIMATION DES BARRES (Graphique Slide 1)
    // ============================================================
    setTimeout(() => {
        const bars = document.querySelectorAll('.bar-fill');
        bars.forEach(bar => {
            // On récupère la largeur cible depuis le HTML (data-width)
            const target = bar.getAttribute('data-width');
            
            // On force la largeur à 0 d'abord (par sécurité)
            bar.style.width = '0';
            
            // On lance l'animation vers la cible
            if(target) {
                setTimeout(() => {
                    bar.style.width = target;
                }, 100);
            }
        });
    }, 300);

    // ============================================================
    // 3. CALCULATEUR 1 : CHARGE CALCAIRE (Slide 1)
    // ============================================================
    const thInput = document.getElementById('th-input');
    const volInput = document.getElementById('vol-input');
    const resultDisplay = document.getElementById('rock-result');

    function calculateRock() {
        if(!thInput || !volInput) return;
        
        const th = parseFloat(thInput.value) || 0;
        const vol = parseFloat(volInput.value) || 0;
        
        // Formule : (TH x 10g) x Volume / 1000 = KG
        const totalKg = (th * 10 * vol) / 1000;

        // Affichage (Entier ou 1 décimale)
        if(resultDisplay) {
            resultDisplay.textContent = Number.isInteger(totalKg) ? totalKg : totalKg.toFixed(1);
        }
    }

    // Écouteurs d'événements pour le calculateur 1
    if(thInput && volInput) {
        thInput.addEventListener('input', calculateRock);
        volInput.addEventListener('input', calculateRock);
        calculateRock(); // Calcul initial
    }

    // ============================================================
    // 4. CALCULATEUR 2 : AUDIT FINANCIER (Slide 3)
    // ============================================================
    let peopleCount = 4; // Valeur par défaut

    // Fonction globale pour les boutons +/-
    window.adjustPeople = function(delta) {
        peopleCount += delta;
        if(peopleCount < 1) peopleCount = 1;
        if(peopleCount > 10) peopleCount = 10;
        
        const display = document.getElementById('nb-people-display');
        if(display) display.textContent = peopleCount;
        
        calculateAudit();
    };

    function calculateAudit() {
        // FORMULES DE TA LANDING PAGE :
        // Energie : 800kWh * 0.27€ * 10% perte = 21.6 €/pers
        const ecoEnergie = Math.round(peopleCount * 21.6);
        
        // Produits : 220€ * 40% perte = 88 €/pers
        const ecoProduits = Math.round(peopleCount * 88);
        
        // Matériel : Forfait Fixe 80 €
        const ecoMateriel = 80;

        const totalSavings = ecoEnergie + ecoProduits + ecoMateriel;
        const tenYearSavings = totalSavings * 10;

        // Affichage Résultat Annuel
        const wasteDisplay = document.getElementById('total-waste');
        if(wasteDisplay) wasteDisplay.textContent = totalSavings;
        
        // Affichage Résultat 10 ans
        const projectionEl = document.querySelector('.audit-projection strong');
        if(projectionEl) {
            projectionEl.textContent = tenYearSavings.toLocaleString('fr-FR') + " €";
        }
    }

    // Calcul initial au chargement pour le slide 3
    calculateAudit();

});
