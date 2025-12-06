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
            if(slideNumber === 5) badge.textContent = "Slide 5 / Dimensionnement";
        }
    };

    // ============================================================
    // 2. ANIMATION DES BARRES (Graphique Slide 1)
    // ============================================================
    setTimeout(() => {
        const bars = document.querySelectorAll('.bar-fill');
        bars.forEach(bar => {
            const target = bar.getAttribute('data-width');
            bar.style.width = '0';
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

        if(resultDisplay) {
            resultDisplay.textContent = Number.isInteger(totalKg) ? totalKg : totalKg.toFixed(1);
        }
    }

    if(thInput && volInput) {
        thInput.addEventListener('input', calculateRock);
        volInput.addEventListener('input', calculateRock);
        calculateRock();
    }

    // ============================================================
    // 4. CALCULATEUR 2 : AUDIT FINANCIER (Slide 3)
    // ============================================================
    let peopleCount = 4;

    window.adjustPeople = function(delta) {
        peopleCount += delta;
        if(peopleCount < 1) peopleCount = 1;
        if(peopleCount > 10) peopleCount = 10;
        
        const display = document.getElementById('nb-people-display');
        if(display) display.textContent = peopleCount;
        
        calculateAudit();
    };

    function calculateAudit() {
        // Energie : ~22€/pers
        const ecoEnergie = Math.round(peopleCount * 21.6);
        // Produits : ~88€/pers
        const ecoProduits = Math.round(peopleCount * 88);
        // Matériel : 80€ fixe
        const ecoMateriel = 80;

        const totalSavings = ecoEnergie + ecoProduits + ecoMateriel;
        const tenYearSavings = totalSavings * 10;

        const wasteDisplay = document.getElementById('total-waste');
        if(wasteDisplay) wasteDisplay.textContent = totalSavings;
        
        const projectionEl = document.querySelector('.audit-projection strong');
        if(projectionEl) {
            projectionEl.textContent = tenYearSavings.toLocaleString('fr-FR') + " €";
        }
    }
    calculateAudit();

    // ============================================================
    // 5. CALCULATEUR TECH & ABAQUE (Slide 5)
    // ============================================================
    
    // Variables d'état
    let techVolume = 20; // Par défaut 20L
    
    // Sélection des éléments DOM
    const techThInput = document.getElementById('tech-th');
    const techConsoInput = document.getElementById('tech-conso');
    
    // Outputs
    const outAutonomy = document.getElementById('res-autonomy');
    const outFreq = document.getElementById('res-freq');
    const outSalt = document.getElementById('res-salt');
    const outWater = document.getElementById('res-water');
    const outElec = document.getElementById('res-elec');

    // Fonction de changement de volume (Boutons 10L / 20L / 30L)
    window.setVolume = function(vol) {
        techVolume = vol;
        
        // Gestion visuelle des boutons
        document.querySelectorAll('.device-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`btn-${vol}l`);
        if(activeBtn) activeBtn.classList.add('active');

        // Recalcul immédiat
        calculateTech();
    };

    // Fonction principale de calcul

    function calculateTech() {
        if(!techThInput || !techConsoInput) return;

        let th = parseFloat(techThInput.value);
        let conso = parseFloat(techConsoInput.value);

        // Sécurités
        if(isNaN(th) || th <= 0) th = 30;
        if(isNaN(conso) || conso <= 0) conso = 130;

        // --- CONSTANTES ---
        const capacity = 5.5;    // °f.m3/L
        const saltRatio = 0.15;  // kg de sel par Litre de résine
        const waterRatio = 6;    // Litres d'eau par Litre de résine

        // --- 1. CALCUL AUTONOMIE ---
        const autonomy = (techVolume * capacity * 1000) / th;

        // --- 2. FREQUENCE REGENERATION ---
        const freqDays = autonomy / conso;

        // --- 3. CONSOMMABLES ANNUELS ---
        const regensPerYear = 365 / freqDays;
        
        // Sel
        const saltPerYear = regensPerYear * (techVolume * saltRatio);
        
        // Eau
        const waterPerYear = (regensPerYear * (techVolume * waterRatio)) / 1000;

        // --- 4. ELECTRICITÉ (EN KWH MAINTENANT) ---
        // Moyenne : 3.5 Watts x 24h x 365j / 1000 = ~30.6 kWh/an
        const wattsAvg = 3.5;
        const elecKwh = (wattsAvg * 24 * 365) / 1000;

        // --- AFFICHAGE ---
        if(outAutonomy) outAutonomy.textContent = Math.round(autonomy).toLocaleString();
        if(outFreq) outFreq.textContent = Math.round(freqDays);
        if(outSalt) outSalt.textContent = Math.round(saltPerYear);
        if(outWater) outWater.textContent = waterPerYear.toFixed(1);
        
        // Affichage Elec en kWh (avec 1 décimale)
        if(outElec) outElec.textContent = elecKwh.toFixed(1).replace('.', ',');
    }

    // Écouteurs d'événements
    if(techThInput) techThInput.addEventListener('input', calculateTech);
    if(techConsoInput) techConsoInput.addEventListener('input', calculateTech);

    // Synchronisation intelligente (Slide 1 -> Slide 5)
    // On "surcharge" la fonction goToSlide pour ajouter la logique du slide 5
    const originalGoToSlide = window.goToSlide;
    window.goToSlide = function(slideNumber) {
        // Appelle la fonction originale pour changer de page
        originalGoToSlide(slideNumber);
        
        // Si on va sur le Slide 5, on récupère le TH du Slide 1
        if(slideNumber === 5) {
            const thSlide1 = document.getElementById('th-input');
            if(thSlide1 && techThInput) {
                techThInput.value = thSlide1.value;
                calculateTech();
            }
        }
    };

});
