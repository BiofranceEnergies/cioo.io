// --- FONCTIONNALITÉ SOLAIRE ---

// Ouvre la modale et met à jour le contenu selon le Kit choisi
function openSimulation(kitName) {
    const modal = document.getElementById("sim-modal");
    const kitLabel = document.getElementById("selected-kit");
    
    // Met à jour le texte dans la modale
    kitLabel.textContent = kitName;
    
    // Affiche la modale
    modal.style.display = "block";
    
    // (Optionnel) Ici tu pourrais aussi changer le prix dynamiquement
    // selon si c'est 3kWc ou 9kWc
}

function closeModal() {
    const modal = document.getElementById("sim-modal");
    modal.style.display = "none";
}

// Fermer si on clique en dehors
window.onclick = function(event) {
  const modal = document.getElementById("sim-modal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// --- TON CODE D'ANIMATION EXISTANT (Je le laisse, il est top) ---
document.addEventListener('DOMContentLoaded', () => {
    const elementsToAnimate = document.querySelectorAll('.anim');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    elementsToAnimate.forEach(el => observer.observe(el));
});
