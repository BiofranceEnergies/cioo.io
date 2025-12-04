
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ANIMATIONS AU SCROLL ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


    // --- 2. LOGIQUE DU SLIDER AVANT/APRÈS ---
    const slider = document.getElementById('slider');
    const imgBefore = document.getElementById('img-before');
    const sliderBtn = document.querySelector('.slider-button');

    slider.addEventListener('input', (e) => {
        const value = e.target.value;
        // On change la largeur de l'image du dessus
        imgBefore.style.width = value + "%"; 
        // On bouge le bouton rond
        sliderBtn.style.left = value + "%";
    });


    // --- 3. CALCULATEUR D'ÉCONOMIES ---
    const inputPersonnes = document.getElementById('nb-personnes');
    const displayProduits = document.getElementById('eco-produits');
    const displayEnergie = document.getElementById('eco-energie');
    const displayTotal = document.getElementById('eco-total');
    const displayRoi = document.getElementById('roi-mois');

    function calculateSavings() {
        const nb = parseInt(inputPersonnes.value) || 0;
        
        // HYPOTHÈSES (Tu peux changer ces chiffres)
        // Source moyenne : ~250€/an d'économie par personne (produits + énergie + électroménager)
        const ecoProduitsParPers = 110; 
        const ecoEnergieParPers = 60; 
        
        const totalProduits = nb * ecoProduitsParPers;
        const totalEnergie = nb * ecoEnergieParPers;
        const total = totalProduits + totalEnergie + (nb * 50); // +50€ usure électroménager

        // Prix moyen adoucisseur posé (pour le ROI) : disons 1800€
        const prixAppareil = 1800; 
        const roiMois = Math.round((prixAppareil / total) * 12);

        // Affichage
        displayProduits.textContent = totalProduits + " €";
        displayEnergie.textContent = totalEnergie + " €";
        displayTotal.textContent = total + " €";
        displayRoi.textContent = roiMois > 0 && roiMois < 100 ? roiMois : "--";
    }

    // Écouter les changements
    inputPersonnes.addEventListener('input', calculateSavings);
    
    // Calcul initial
    calculateSavings();
});
