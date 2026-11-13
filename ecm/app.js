/**
 * OBSERVATOIRE IMMOBILIER & DVF — APPLICATION JAVASCRIPT CONNECTÉE (app.js)
 * Sylvain MATIGNON • Propriétés-Privées • Nontron & Périgord Vert
 */

// ⚠️ COLLEZ ICI L'URL DE VOTRE APPLICATION WEB GOOGLE APPS SCRIPT (Étape 2) :
const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbz3-6_6lZvLyKcnYC5P6NiB_qyP9EOIjMguEahlGvk8ZtxMVr7ckXlilD0Mgr468fYW/exec";

// DONNÉES HISTORIQUES DVF DU BASSIN DE NONTRON (~15 km) — PRIX RÉELS ACTÉS
const DVF_BASSIN_DATA = {
    years: ["2021", "2022", "2023", "2024", "2025", "2026"],
    median_sqm: { "2021": 1278, "2022": 1235, "2023": 1368, "2024": 1323, "2025": 1341, "2026": 1029 },
    avg_sqm: { "2021": 1572, "2022": 1470, "2023": 1731, "2024": 1453, "2025": 1470, "2026": 1242 },
    volumes: { "2021": 262, "2022": 220, "2023": 183, "2024": 162, "2025": 149, "2026": 67 }
};

let propertiesData = [];

let appState = {
    minPrice: null,
    maxPrice: null,
    minRooms: 0,
    dpeMax: "ALL",
    selectedTargetRef: null
};

document.addEventListener("DOMContentLoaded", () => {
    initFilters();
    renderDvfTable();
    loadPropertiesFromSheets();
});

// CHARGEMENT DIRECT DEPUIS GOOGLE SHEETS
async function loadPropertiesFromSheets() {
    const statusEl = document.getElementById("sync-status");
    if (statusEl) statusEl.textContent = "Synchronisation Google Sheets...";

    try {
        const response = await fetch(GOOGLE_SHEETS_API_URL);
        const data = await response.json();

        if (data && data.properties && data.properties.length > 0) {
            propertiesData = data.properties;
            
            // Si aucun bien n'est sélectionné, on prend le premier ou la réf 2112309 si présente
            const defaultTarget = propertiesData.find(p => p.ref === "2112309") || propertiesData[0];
            appState.selectedTargetRef = defaultTarget.ref;

            populateTargetDropdown();
            renderAll();

            if (statusEl) statusEl.textContent = `Base connectée (${propertiesData.length} biens)`;
        } else {
            throw new Error("Format de données invalide");
        }
    } catch (err) {
        console.error("Erreur de connexion Sheets :", err);
        if (statusEl) statusEl.textContent = "Erreur connexion (Vérifier URL)";
    }
}

// INITIALISATION DES FILTRES
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

function renderAll() {
    const filtered = getFilteredProperties();
    renderKpis(filtered);
    renderTargetBenchmark(filtered);
    renderProperties(filtered);
}

function renderKpis(filtered) {
    const count = filtered.length;
    const avgPrice = count > 0 ? Math.round(filtered.reduce((s, p) => s + p.price, 0) / count) : 0;
    const avgSqm = count > 0 ? Math.round(filtered.reduce((s, p) => s + p.sqmPrice, 0) / count) : 0;

    document.getElementById("kpi-count").textContent = count;
    document.getElementById("kpi-avg-price").textContent = formatCurrency(avgPrice);
    document.getElementById("kpi-avg-sqm").textContent = `${formatNumber(avgSqm)} €/m²`;
    document.getElementById("list-counter").textContent = `${count} bien(s) correspondant(s)`;
}

function renderTargetBenchmark(filteredList = null) {
    const filtered = filteredList || getFilteredProperties();
    const target = propertiesData.find(p => p.ref === appState.selectedTargetRef);

    if (!target) return;

    document.getElementById("target-commune").textContent = target.commune;
    document.getElementById("target-surface").textContent = `${target.surface} m² (${target.rooms} ch.)`;
    document.getElementById("target-price").textContent = formatCurrency(target.price);
    document.getElementById("target-sqm").textContent = `${formatNumber(target.sqmPrice)} €/m²`;

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

    updateDvfGaps(target.sqmPrice);
}

function renderDvfTable() {
    DVF_BASSIN_DATA.years.forEach(year => {
        const medEl = document.getElementById(`dvf-median-${year}`);
        if (medEl) medEl.textContent = `${formatNumber(DVF_BASSIN_DATA.median_sqm[year])} €`;

        const avgEl = document.getElementById(`dvf-avg-${year}`);
        if (avgEl) avgEl.textContent = `${formatNumber(DVF_BASSIN_DATA.avg_sqm[year])} €`;

        const volEl = document.getElementById(`dvf-vol-${year}`);
        if (volEl) volEl.textContent = formatNumber(DVF_BASSIN_DATA.volumes[year]);
    });

    if (appState.selectedTargetRef) {
        const target = propertiesData.find(p => p.ref === appState.selectedTargetRef);
        if (target) updateDvfGaps(target.sqmPrice);
    }
}

function updateDvfGaps(targetSqmPrice) {
    DVF_BASSIN_DATA.years.forEach(year => {
        const gapEl = document.getElementById(`dvf-gap-${year}`);
        if (!gapEl) return;

        const medianYear = DVF_BASSIN_DATA.median_sqm[year];
        const gapPct = ((targetSqmPrice - medianYear) / medianYear) * 100;
        const sign = gapPct >= 0 ? "+" : "";

        gapEl.textContent = `${sign}${gapPct.toFixed(1)}%`;
        gapEl.style.color = gapPct > 20 ? "#b91c1c" : (gapPct < -5 ? "#047857" : "#1d4ed8");
    });
}

// AFFICHAGE DES CARTES AVEC RÉFÉRENCE CLIQUABLE VERS L'ANNONCE
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

        // Si une URL agence existe, on en fait un lien cliquable ↗
        const refMarkup = prop.agencyLink 
            ? `<a href="${prop.agencyLink}" target="_blank" rel="noopener noreferrer" class="ref-badge ref-link" onclick="event.stopPropagation()">Réf. ${prop.ref} ↗</a>`
            : `<span class="ref-badge">Réf. ${prop.ref}</span>`;

        card.innerHTML = `
            <div class="card-top">
                ${refMarkup}
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

        // Clic sur la carte = sélectionne le bien cible (sans interférer avec le lien)
        card.addEventListener("click", () => {
            appState.selectedTargetRef = prop.ref;
            document.getElementById("target-select").value = prop.ref;
            renderTargetBenchmark();
            renderProperties();
        });

        grid.appendChild(card);
    });
}

function formatCurrency(val) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
}

function formatNumber(val) {
    return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(val);
}
