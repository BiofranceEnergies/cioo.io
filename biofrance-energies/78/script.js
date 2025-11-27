// Fonction pour ouvrir la simulation
function openSimulation(kitName) {
    // On met à jour le nom du kit sélectionné
    document.getElementById("selected-kit").textContent = kitName;
    // On affiche la modale
    document.getElementById("sim-modal").style.display = "block";
}

// Fonction pour fermer la simulation
function closeModal() {
    document.getElementById("sim-modal").style.display = "none";
}

// Fermer si on clique en dehors de la boîte
window.onclick = function(event) {
    const modal = document.getElementById("sim-modal");
    if (event.target == modal) {
        closeModal();
    }
}
