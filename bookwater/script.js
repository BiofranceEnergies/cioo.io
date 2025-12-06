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
// ============================================================
    // 5. CALCULATEUR TECH (Slide 5 - Abaque)
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

    // Fonction principale de calcul (L'Abaque)
    function calculateTech() {
        if(!techThInput || !techConsoInput) return;

        let th = parseFloat(techThInput.value);
        let conso = parseFloat(techConsoInput.value);

        // Sécurités
        if(isNaN(th) || th <= 0) th = 30; // Valeur par défaut si vide
        if(isNaN(conso) || conso <= 0) conso = 130;

        // --- CONSTANTES TECHNIQUES ---
        const capacity = 5.5;    // °f.m3/L
        const saltRatio = 0.15;  // kg de sel par Litre de résine
        const waterRatio = 6;    // Litres d'eau par Litre de résine

        // --- 1. CALCUL AUTONOMIE (V1) ---
        // Formule : (Volume Résine * Capacité * 1000) / TH
        // Ex pour 20L à 30°f : (20 * 5.5 * 1000) / 30 = 3666 Litres
        const autonomy = (techVolume * capacity * 1000) / th;

        // --- 2. FREQUENCE REGENERATION ---
        // Autonomie / Conso Jour
        const freqDays = autonomy / conso;

        // --- 3. CONSOMMABLES ANNUELS ---
        const regensPerYear = 365 / freqDays;
        
        // Sel : Nb Regen/an * (Volume Résine * 0.15)
        const saltPerYear = regensPerYear * (techVolume * saltRatio);
        
        // Eau : Nb Regen/an * (Volume Résine * 6)
        // On divise par 1000 pour avoir des m3
        const waterPerYear = (regensPerYear * (techVolume * waterRatio)) / 1000;

        // --- AFFICHAGE ---
        if(outAutonomy) outAutonomy.textContent = Math.round(autonomy).toLocaleString();
        if(outFreq) outFreq.textContent = Math.round(freqDays);
        if(outSalt) outSalt.textContent = Math.round(saltPerYear);
        if(outWater) outWater.textContent = waterPerYear.toFixed(1);
    }

    // Écouteurs d'événements
    if(techThInput) techThInput.addEventListener('input', calculateTech);
    if(techConsoInput) techConsoInput.addEventListener('input', calculateTech);

    // PETIT BONUS UX : Synchronisation intelligente
    // Quand on ouvre le slide 5, on va chercher le TH du Slide 1 si l'utilisateur l'a déjà rempli.
    const originalGoToSlide = window.goToSlide;
    window.goToSlide = function(slideNumber) {
        // Appel de la fonction originale
        originalGoToSlide(slideNumber);

        // Si on va au slide 5
        if(slideNumber === 5) {
            // Récupérer la valeur du Slide 1
            const thSlide1 = document.getElementById('th-input');
            if(thSlide1 && techThInput) {
                // On met à jour le slide 5 avec la valeur du slide 1
                techThInput.value = thSlide1.value;
                calculateTech(); // On lance le calcul
            }
            // Mettre à jour le badge titre
            const badge = document.getElementById('step-indicator');
            if(badge) badge.textContent = "Slide 5 / Dimensionnement";
        }
    };
});
