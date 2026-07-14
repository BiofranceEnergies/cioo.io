document.addEventListener("DOMContentLoaded", function() {
    // 1. On récupère les paramètres situés dans l'adresse URL
    const urlParams = new URLSearchParams(window.location.search);
    const numeroMandat = urlParams.get('mandat');

    // 2. É
