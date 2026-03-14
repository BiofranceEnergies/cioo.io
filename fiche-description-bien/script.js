document.addEventListener('DOMContentLoaded', () => {
    const rooms = [
        "Palier", "Entrée", "Salon", "Salle-à-manger", "Cuisine Equipée (Oui/Non)",
        "Salle de bains", "Chambre 1", "Chambre 2", "Chambre 3", "Chambre 4",
        "Chambre 5", "Suite parentale", "Dressing", "Bureau", "WC",
        "Salle d'eau", "Salle de douches", "Salle de bains (bis)", "Buanderie",
        "Lingerie", "Sous sol", "Dépendances", "Piscine", "Local technique", "Autre"
    ];

    const tbody = document.querySelector('#roomsTable tbody');

    rooms.forEach(room => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${room}</td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
            <td><input type="text"></td>
        `;
        tbody.appendChild(tr);
    });
});
