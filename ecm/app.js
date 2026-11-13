/**
 * ==========================================================================
 * OBSERVATOIRE IMMOBILIER & DVF — APPLICATION JAVASCRIPT (app.js)
 * Mode 100% Autonome • Sylvain MATIGNON • Propriétés-Privées
 * ==========================================================================
 */

// DONNÉES HISTORIQUES DVF DU BASSIN DE NONTRON (~15 km) — EXTRACTION RÉELLE NOTARIÉE
const DVF_BASSIN_DATA = {
    years: ["2021", "2022", "2023", "2024", "2025", "2026"],
    // Ligne 1 : Prix réel de vente (médiane notariée)
    median_sqm: {
        "2021": 1278,
        "2022": 1235,
        "2023": 1368,
        "2024": 1323,
        "2025": 1341,
        "2026": 1029
    },
    // Ligne 2 : Moyenne du secteur (€/m²)
    avg_sqm: {
        "2021": 1572,
        "2022": 1470,
        "2023": 1731,
        "2024": 1453,
        "2025": 1470,
        "2026": 1242
    },
    // Ligne 4 : Nombre de maisons vendues
    volumes: {
        "2021": 262,
        "2022": 220,
        "2023": 183,
        "2024": 162,
        "2025": 149,
        "2026": 67
    }
};

// PORTEFEUILLE COMPLET — LES 17 BIENS RÉELS DE VOTRE TABLEUR (250k€ - 300k€)
let propertiesData = [
    {
        ref: "98-5689",
        commune: "Soudat",
        type: "Maison",
        price: 250000,
        surface: 184,
        sqmPrice: 1359,
        land: 1010,
        rooms: 5,
        dpe: "B",
        agency: "Human Immobilier",
        desc: "Maison pierre rénovée 8p au calme en impasse, séjour 39m², grande cuisine aménagée, 5 ch, terrain 1010m²."
    },
    {
        ref: "98-5554",
        commune: "Javerlhac-et-la-Chapelle-Saint-Robert",
        type: "Propriété avec sous-sol aménagé",
        price: 254880,
        surface: 226,
        sqmPrice: 1128,
        land: 2210,
        rooms: 3,
        dpe: "D",
        agency: "HUMAN Immobilier Nontron",
        desc: "Belle propriété de plain-pied : séjour 36m², cuisine équipée, 3 ch, sous-sol totalement aménagé, jardin 2210m²."
    },
    {
        ref: "3847",
        commune: "Nontron (10mn)",
        type: "Maison",
        price: 258000,
        surface: 190,
        sqmPrice: 1358,
        land: 27032,
        rooms: 3,
        dpe: "C",
        agency: "Immobilière Brun Salat",
        desc: "Maison rénovée, cheminée, studio indépendant, grange/atelier, terrain pré et bois de 2,7 ha."
    },
    {
        ref: "3712",
        commune: "Saint-Martial-de-Valette",
        type: "Fermette rénovée",
        price: 263000,
        surface: 192,
        sqmPrice: 1370,
        land: 1563,
        rooms: 3,
        dpe: "C",
        agency: "Immobilière Brun Salat",
        desc: "Fermette rénovée plain-pied, salon cathédrale 50m², poêle à bois, piscine 8x4 dôme, garage, terrain 1563m²."
    },
    {
        ref: "98-5652",
        commune: "Saint-Saud-Lacoussière",
        type: "Longère / Maison",
        price: 276120,
        surface: 202,
        sqmPrice: 1367,
        land: 36670,
        rooms: 7,
        dpe: "D",
        agency: "Human Immobilier",
        desc: "Longère en pierre 9p à la campagne, plain-pied, 7 ch, granges attenantes, grand terrain de 36670m²."
    },
    {
        ref: "3797",
        commune: "Proche Saint-Pardoux-la-Rivière",
        type: "Ferme restaurée",
        price: 278250,
        surface: 121,
        sqmPrice: 2300,
        land: 23288,
        rooms: 4,
        dpe: "D",
        agency: "Immobilière Brun Salat",
        desc: "Ferme restaurée, séjour 55m², studio à l'étage sur caves, atelier, 2 granges, puits, étang 9700m², parc 2,3 ha."
    },
    {
        ref: "2112309",
        commune: "Saint-Martin-le-Pin",
        type: "Grange rénovée",
        price: 283500,
        surface: 120,
        sqmPrice: 2358,
        land: 5255,
        rooms: 4,
        dpe: "C",
        agency: "iad France (Sylvie Vandenbosch)",
        desc: "Grange entièrement rénovée à neuf, séjour lumineux, poêle à granulés, terrain clos 5255m² vue dégagée."
    },
    {
        ref: "3631",
        commune: "Saint-Martial-de-Valette",
        type: "Maison",
        price: 288750,
        surface: 152,
        sqmPrice: 1900,
        land: 11537,
        rooms: 4,
        dpe: "B",
        agency: "Immobilière Brun Salat",
        desc: "Maison 1978 sur sous-sol aménageable, séjour 58m², PAC + solaire, piscine 10x5, hangar 156m², terrain 1,15 ha."
    },
    {
        ref: "BVI77625",
        commune: "Busserolles",
        type: "Ensemble 2 maisons en pierre",
        price: 288850,
        surface: 191,
        sqmPrice: 1512,
        land: 2932,
        rooms: 5,
        dpe: "C",
        agency: "Beaux Villages Immobilier",
        desc: "Ensemble 2 maisons mitoyennes pierre, hameau calme, PAC air-eau, garage indépendant, abri, terrain 2932m²."
    },
    {
        ref: "98-5589",
        commune: "Nontron",
        type: "Maison de plain-pied sans travaux",
        price: 293216,
        surface: 187,
        sqmPrice: 1568,
        land: 11394,
        rooms: 3,
        dpe: "B",
        agency: "HUMAN Immobilier Nontron",
        desc: "Proche centre-ville Nontron, plain-pied 187m², pièce de vie 51m², PAC, double garage, grand parc 11394m²."
    },
    {
        ref: "3836",
        commune: "Nontron (10mn)",
        type: "Grange rénovée",
        price: 294000,
        surface: 120,
        sqmPrice: 2450,
        land: 5255,
        rooms: 4,
        dpe: "C",
        agency: "Immobilière Brun Salat",
        desc: "Ancienne grange rénovée, séjour poêle granulés, cuisine équipée, 0 travaux, terrain 5255m²."
    },
    {
        ref: "98-5647",
        commune: "Saint-Martin-le-Pin",
        type: "Ancienne grange rénovée",
        price: 296520,
        surface: 150,
        sqmPrice: 1977,
        land: 5255,
        rooms: 4,
        dpe: "C",
        agency: "HUMAN Immobilier Nontron",
        desc: "Cadre privilégié vue dégagée, grange en pierre rénovée, séjour 40m², clim réversible, terrain 5255m²."
    },
    {
        ref: "98-5336",
        commune: "Abjat-sur-Bandiat",
        type: "Maison traditionnelle en pierre",
        price: 296800,
        surface: 177,
        sqmPrice: 1677,
        land: 2783,
        rooms: 6,
        dpe: "E",
        agency: "HUMAN Immobilier Nontron",
        desc: "Maison de caractère familiale en pierre, séjour 37m² cheminée granit, piscine, parc clos 2783m²."
    },
    {
        ref: "BVI84708",
        commune: "Savignac-de-Nontron",
        type: "Maison de caractère en pierre",
        price: 297460,
        surface: 183,
        sqmPrice: 1625,
        land: 2125,
        rooms: 5,
        dpe: "B",
        agency: "Beaux Villages Immobilier",
        desc: "Maison de caractère rénovée en bordure de village, plancher chauffant PAC, 3 dépendances, jardin 2125m²."
    },
    {
        ref: "3750",
        commune: "Saint-Front-la-Rivière",
        type: "Grange rénovée",
        price: 299000,
        surface: 185,
        sqmPrice: 1616,
        land: 1559,
        rooms: 4,
        dpe: "A",
        agency: "Immobilière Brun Salat",
        desc: "Grange rénovée haut de gamme, séjour 57m², PAC au sol, double vitrage alu, terrain 1559m²."
    },
    {
        ref: "3467",
        commune: "Saint-Estèphe",
        type: "Maison",
        price: 299250,
        surface: 227,
        sqmPrice: 1318,
        land: 2824,
        rooms: 4,
        dpe: "C",
        agency: "Immobilière Brun Salat",
        desc: "Villa 2000 proche étang, 2 suites RDC, gîte attenant, piscine couverte 11x5, parc 2824m²."
    },
    {
        ref: "3811",
        commune: "Savignac-de-Nontron",
        type: "Maison de campagne",
        price: 299250,
        surface: 221,
        sqmPrice: 1354,
        land: 2125,
        rooms: 4,
        dpe: "B",
        agency: "Immobilière Brun Salat",
        desc: "Superbe rénovation pierre 1850, séjour 70m², suite parentale, PAC, grange séparée, puits, 2125m²."
    }
];

// ÉTAT ACTUEL DE L'APPLICATION
let appState = {
    minPrice: null,
    maxPrice: null,
    minRooms: 0,
    dpeMax: "ALL",
    selectedTargetRef: "2112309" // Bien cible par défaut
};

// INITIALISATION DU DOM
document.addEventListener("DOMContentLoaded", () => {
    initFilters();
    populateTargetDropdown();
    renderAll();
    renderDvfTable();
});

// GESTION DES FILTRES ET ÉCOUTEURS
function initFilters() {
    const minInput = document.getElementById("min-price");
    const maxInput = document.getElementById("max-price");
    const dpeSelect = document.getElementById("dpe-max");
    const roomButtons = document.querySelectorAll("#room-filters .seg-btn");
    const targetSelect = document.getElementById("target-select");

    minInput.addEventListener("input", (e) => {
        appState.minPrice = e.target.value ? parseFloat(e.target.value) : null;
        updateBudgetLabel();
        renderAll();
    });

    maxInput.addEventListener("input", (e) => {
        appState.maxPrice = e.target.value ? parseFloat(e.target.value) : null;
        updateBudgetLabel();
        renderAll();
    });

    dpeSelect.addEventListener("change", (e) => {
        appState.dpeMax = e.target.value;
        renderAll();
    });

    roomButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            roomButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            appState.minRooms = parseInt(btn.dataset.rooms, 10);
            renderAll();
        });
    });

    // Quand on change de bien cible via le menu déroulant
    targetSelect.addEventListener("change", (e) => {
        appState.selectedTargetRef = e.target.value;
        renderTargetBenchmark();
        renderProperties();
    });
}

function updateBudgetLabel() {
    const lbl = document.getElementById("budget-val");
    const minStr = appState.minPrice ? formatCurrency(appState.minPrice) : "0 €";
    const maxStr = appState.maxPrice ? formatCurrency(appState.maxPrice) : "Sans max";
    lbl.textContent = `${minStr} – ${maxStr}`;
}

// ALIMENTATION DYNAMIQUE DU SÉLECTEUR DE BIEN CIBLE
function populateTargetDropdown() {
    const select = document.getElementById("target-select");
    select.innerHTML = "";

    propertiesData.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.ref;
        opt.textContent = `Réf. ${p.ref} — ${p.commune} (${formatCurrency(p.price)})`;
        if (p.ref === appState.selectedTargetRef) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
}

// FILTRAGE DYNAMIQUE DES BIENS
function getFilteredProperties() {
    const dpeRank = { "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7 };

    return propertiesData.filter(item => {
        if (appState.minPrice !== null && item.price < appState.minPrice) return false;
        if (appState.maxPrice !== null && item.price > appState.maxPrice) return false;
        if (item.rooms < appState.minRooms) return false;

        if (appState.dpeMax !== "ALL") {
            const maxRank = dpeRank[appState.dpeMax] || 99;
            const itemRank = dpeRank[item.dpe.charAt(0)] || 99;
            if (itemRank > maxRank) return false;
        }

        return true;
    }).sort((a, b) => a.price - b.price);
}

// MISE À JOUR GLOBALE DE L'INTERFACE
function renderAll() {
    const filtered = getFilteredProperties();
    renderKpis(filtered);
    renderTargetBenchmark(filtered);
    renderProperties(filtered);
}

// MISE À JOUR DES KPI (CORRESPONDANT À G3, H3, I3 DU TABLEUR)
function renderKpis(filtered) {
    const count = filtered.length;
    const avgPrice = count > 0 ? Math.round(filtered.reduce((s, p) => s + p.price, 0) / count) : 0;
    const avgSqm = count > 0 ? Math.round(filtered.reduce((s, p) => s + p.sqmPrice, 0) / count) : 0;

    document.getElementById("kpi-count").textContent = count;
    document.getElementById("kpi-avg-price").textContent = formatCurrency(avgPrice);
    document.getElementById("kpi-avg-sqm").textContent = `${formatNumber(avgSqm)} €/m²`;
    document.getElementById("list-counter").textContent = `${count} bien(s) correspondant(s)`;
}

// ANALYSE DU BIEN CIBLE : SE RECALCULE INSTANTANÉMENT DÈS QU'ON CHANGE DE BIEN !
function renderTargetBenchmark(filteredList = null) {
    const filtered = filteredList || getFilteredProperties();
    const target = propertiesData.find(p => p.ref === appState.selectedTargetRef);

    if (!target) return;

    // Remplissage des détails du bien sélectionné
    document.getElementById("target-commune").textContent = target.commune;
    document.getElementById("target-surface").textContent = `${target.surface} m² (${target.rooms} ch.)`;
    document.getElementById("target-price").textContent = formatCurrency(target.price);
    document.getElementById("target-sqm").textContent = `${formatNumber(target.sqmPrice)} €/m²`;

    // Calcul de l'écart face à la sélection filtrée (comme en G5 du tableur !)
    const vsMarketBadge = document.getElementById("target-vs-market");
    if (filtered.length > 0) {
        const avgFilteredSqm = filtered.reduce((s, p) => s + p.sqmPrice, 0) / filtered.length;
        const diffEuro = Math.round(target.sqmPrice - avgFilteredSqm);
        const diffPct = Math.round(((target.sqmPrice - avgFilteredSqm) / avgFilteredSqm) * 100);

        const sign = diffEuro >= 0 ? "+" : "";
        vsMarketBadge.textContent = `${sign}${formatNumber(diffEuro)} €/m² (${sign}${diffPct}%)`;

        if (diffPct > 15) {
            vsMarketBadge.style.backgroundColor = "var(--color-warning-light)";
            vsMarketBadge.style.color = "var(--color-warning)";
        } else if (diffPct < -5) {
            vsMarketBadge.style.backgroundColor = "var(--color-success-light)";
            vsMarketBadge.style.color = "var(--color-success)";
        } else {
            vsMarketBadge.style.backgroundColor = "var(--color-primary-light)";
            vsMarketBadge.style.color = "var(--color-primary)";
        }
    } else {
        vsMarketBadge.textContent = "Aucun comparatif";
        vsMarketBadge.style.backgroundColor = "var(--border-subtle)";
        vsMarketBadge.style.color = "var(--text-muted)";
    }

    // Mise à jour immédiate de la ligne "Votre bien vs le marché" dans le tableau DVF
    updateDvfGaps(target.sqmPrice);
}

// RENDU INITIAL DU TABLEAU HISTORIQUE DVF DU BASSIN
function renderDvfTable() {
    DVF_BASSIN_DATA.years.forEach(year => {
        // Ligne 1 : Prix réel de vente (Médiane)
        const medEl = document.getElementById(`dvf-median-${year}`);
        if (medEl) medEl.textContent = `${formatNumber(DVF_BASSIN_DATA.median_sqm[year])} €`;

        // Ligne 2 : Moyenne du secteur
        const avgEl = document.getElementById(`dvf-avg-${year}`);
        if (avgEl) avgEl.textContent = `${formatNumber(DVF_BASSIN_DATA.avg_sqm[year])} €`;

        // Ligne 4 : Nombre de maisons vendues
        const volEl = document.getElementById(`dvf-vol-${year}`);
        if (volEl) volEl.textContent = formatNumber(DVF_BASSIN_DATA.volumes[year]);
    });

    const target = propertiesData.find(p => p.ref === appState.selectedTargetRef);
    if (target) updateDvfGaps(target.sqmPrice);
}

// RECALCUL DYNAMIQUE DE LA LIGNE "VOTRE BIEN VS LE MARCHÉ" POUR CHAQUE ANNÉE
function updateDvfGaps(targetSqmPrice) {
    DVF_BASSIN_DATA.years.forEach(year => {
        const gapEl = document.getElementById(`dvf-gap-${year}`);
        if (!gapEl) return;

        const medianYear = DVF_BASSIN_DATA.median_sqm[year];
        const gapPct = ((targetSqmPrice - medianYear) / medianYear) * 100;
        const sign = gapPct >= 0 ? "+" : "";

        gapEl.textContent = `${sign}${gapPct.toFixed(1)}%`;
        // Code couleur pédagogique : rouge si au-dessus de +20%, vert si en dessous de -5%, bleu sinon
        gapEl.style.color = gapPct > 20 ? "#b91c1c" : (gapPct < -5 ? "#047857" : "#1d4ed8");
    });
}

// AFFICHAGE DES CARTES DES BIENS
function renderProperties(filteredList = null) {
    const list = filteredList || getFilteredProperties();
    const grid = document.getElementById("properties-grid");
    grid.innerHTML = "";

    if (list.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted); font-weight: 600;">
            Aucun bien ne correspond aux critères sélectionnés.
        </div>`;
        return;
    }

    list.forEach(prop => {
        const isTarget = prop.ref === appState.selectedTargetRef;
        const card = document.createElement("div");
        card.className = `property-card ${isTarget ? "is-target" : ""}`;

        card.innerHTML = `
            <div class="card-top">
                <span class="ref-badge">Réf. ${prop.ref}</span>
                <span class="dpe-badge dpe-${prop.dpe.charAt(0)}">DPE ${prop.dpe}</span>
            </div>
            <div>
                <h3 class="card-title">${prop.type}</h3>
                <p class="card-location">📍 ${prop.commune}</p>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${prop.desc}</p>
            <div class="card-specs">
                <span>📐 ${prop.surface} m²</span>
                <span>🛏️ ${prop.rooms} ch.</span>
                <span>🌳 ${formatNumber(prop.land)} m² terrain</span>
            </div>
            <div class="card-price-row">
                <span class="card-price">${formatCurrency(prop.price)}</span>
                <span class="card-sqm">${formatNumber(prop.sqmPrice)} €/m²</span>
            </div>
        `;

        // CLIC SUR UNE CARTE = SÉLECTION IMMÉDIATE DU BIEN COMME BIEN CIBLE !
        card.addEventListener("click", () => {
            appState.selectedTargetRef = prop.ref;
            document.getElementById("target-select").value = prop.ref;
            renderTargetBenchmark();
            renderProperties();
        });

        grid.appendChild(card);
    });
}

// FORMATTEURS
function formatCurrency(val) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

function formatNumber(val) {
    return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(val);
}
