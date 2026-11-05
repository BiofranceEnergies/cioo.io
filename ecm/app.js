/**
 * OBSERVATOIRE IMMOBILIER & DVF — MOTEUR DYNAMIQUE APPS SCRIPT (app.js)
 * Sylvain MATIGNON | Propriétés-Privées — Bassin Nontronnais
 */

// ==========================================================================
// 1. COLLER VOTRE URL GOOGLE APPS SCRIPT CI-DESSOUS
// ==========================================================================
const SCRIPT_API_URL = "/**
 * OBSERVATOIRE IMMOBILIER & DVF — MOTEUR DYNAMIQUE APPS SCRIPT (app.js)
 * Sylvain MATIGNON | Propriétés-Privées — Bassin Nontronnais
 */

// ==========================================================================
// 1. COLLER VOTRE URL GOOGLE APPS SCRIPT CI-DESSOUS
// ==========================================================================
const SCRIPT_API_URL = "https://script.google.com/macros/s/AKfycbz3-6_6lZvLyKcnYC5P6NiB_qyP9EOIjMguEahlGvk8ZtxMVr7ckXlilD0Mgr468fYW/exec";

let appState = {
  properties: [],
  filteredProperties: [],
  selectedTargetRef: null,
  dvfSecteurData: {
    years: ["2021", "2022", "2023", "2024", "2025", "2026"],
    medianes: [1293, 1302, 1445, 1357, 1319, 1276],
    volumes: [569, 476, 414, 370, 353, 142]
  },
  filters: {
    budgetMax: 600000,
    chambresMin: 3,
    dpeMax: "B"
  }
};

const DPE_ORDER = { "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7 };
const formatMoney = (val) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat("fr-FR").format(val);
const formatPercent = (val) => `${val > 0 ? "+" : ""}${val.toFixed(1).replace(".", ",")}%`;

// ==========================================================================
// 2. RÉCUPÉRATION DES DONNÉES EN DIRECT DEPUIS GOOGLE SHEETS
// ==========================================================================
async function fetchPropertiesFromSheets() {
  const statusEl = document.querySelector(".status-pill");
  if (statusEl) {
    statusEl.textContent = "⏳ Chargement des données...";
    statusEl.className = "status-pill";
    statusEl.style.background = "#FEF3C7";
    statusEl.style.color = "#D97706";
  }

  try {
    const response = await fetch(SCRIPT_API_URL);
    const properties = await response.json();

    if (Array.isArray(properties) && properties.length > 0) {
      appState.properties = properties;
      if (!appState.selectedTargetRef) {
        appState.selectedTargetRef = properties[properties.length - 1].ref;
      }

      if (statusEl) {
        statusEl.textContent = `● Connecté (${properties.length} biens en direct)`;
        statusEl.className = "status-pill live";
        statusEl.style.background = "";
        statusEl.style.color = "";
      }

      populateTargetSelect();
      applyFilters();
    }
  } catch (error) {
    console.error("Erreur de chargement Google Sheets :", error);
    if (statusEl) {
      statusEl.textContent = "⚠️ Erreur de connexion";
      statusEl.className = "status-pill";
      statusEl.style.background = "#FEE2E2";
      statusEl.style.color = "#DC2626";
    }
  }
}

// ==========================================================================
// 3. LOGIQUE D'AFFICHAGE & FILTRES
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  fetchPropertiesFromSheets();
});

function setupEventListeners() {
  const rangeBudget = document.getElementById("filterBudgetMax");
  const selectChambres = document.getElementById("filterChambres");
  const selectTarget = document.getElementById("selectTargetProperty");
  const btnRefresh = document.getElementById("btnRefresh");

  rangeBudget.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    appState.filters.budgetMax = val;
    document.getElementById("budgetDisplay").textContent = val >= 600000 ? "Tous" : formatMoney(val);
    applyFilters();
  });

  selectChambres.addEventListener("change", (e) => {
    appState.filters.chambresMin = parseInt(e.target.value, 10);
    applyFilters();
  });

  document.querySelectorAll(".dpe-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dpe-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      appState.filters.dpeMax = btn.dataset.dpe;
      applyFilters();
    });
  });

  selectTarget.addEventListener("change", (e) => {
    appState.selectedTargetRef = e.target.value;
    updateTargetAnalysis();
    renderPropertiesGrid();
  });

  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      fetchPropertiesFromSheets();
    });
  }
}

function populateTargetSelect() {
  const select = document.getElementById("selectTargetProperty");
  select.innerHTML = "";

  appState.properties.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.ref;
    opt.textContent = `${p.ref} — ${p.commune} (${formatMoney(p.prixFAI)})`;
    if (p.ref === appState.selectedTargetRef) opt.selected = true;
    select.appendChild(opt);
  });
}

function applyFilters() {
  const { budgetMax, chambresMin, dpeMax } = appState.filters;

  appState.filteredProperties = appState.properties.filter((p) => {
    if (p.prixFAI > budgetMax) return false;
    if (chambresMin > 0 && p.chambres < chambresMin) return false;
    if (dpeMax !== "ALL" && DPE_ORDER[p.dpe] > DPE_ORDER[dpeMax]) return false;
    return true;
  });

  appState.filteredProperties.sort((a, b) => a.prixFAI - b.prixFAI);

  updateKPIs();
  renderPropertiesGrid();
  updateTargetAnalysis();
}

function updateKPIs() {
  const items = appState.filteredProperties;
  const count = items.length;

  document.getElementById("kpiCount").textContent = `${count} ${count > 1 ? "biens" : "bien"}`;
  document.getElementById("resultsCount").textContent = `${count} ${count > 1 ? "biens trouvés" : "bien trouvé"}`;

  if (count === 0) {
    document.getElementById("kpiAvgPrice").textContent = "—";
    document.getElementById("kpiAvgM2").textContent = "—";
    return;
  }

  const sumPrice = items.reduce((acc, cur) => acc + cur.prixFAI, 0);
  const sumM2 = items.reduce((acc, cur) => acc + cur.prixM2, 0);

  document.getElementById("kpiAvgPrice").textContent = formatMoney(Math.round(sumPrice / count));
  document.getElementById("kpiAvgM2").textContent = `${formatNumber(Math.round(sumM2 / count))} €/m²`;
}

function renderPropertiesGrid() {
  const grid = document.getElementById("propertiesGrid");
  grid.innerHTML = "";

  if (appState.filteredProperties.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #64748B;">
        <p style="font-size: 1.125rem; font-weight: 600;">Aucun bien ne correspond aux filtres.</p>
      </div>
    `;
    return;
  }

  appState.filteredProperties.forEach((p) => {
    const isSelected = p.ref === appState.selectedTargetRef;
    const card = document.createElement("div");
    card.className = `property-card ${isSelected ? "selected" : ""}`;
    card.onclick = () => {
      appState.selectedTargetRef = p.ref;
      document.getElementById("selectTargetProperty").value = p.ref;
      updateTargetAnalysis();
      renderPropertiesGrid();
    };

    // Liens Agence et Fiche Drive cliquables
    const linkAgenceHtml = p.urlAgence 
      ? `<a href="${p.urlAgence}" target="_blank" rel="noopener noreferrer" class="ref-link" onclick="event.stopPropagation();" title="Voir l'annonce sur le site de l'agence">🌐 Annonce Agence ↗</a>` 
      : "";

    const linkDriveHtml = p.urlDrive
      ? `<a href="${p.urlDrive}" target="_blank" rel="noopener noreferrer" class="ref-link" onclick="event.stopPropagation();" style="background: rgba(27, 54, 93, 0.08); color: var(--primary);" title="Voir la fiche PDF Drive">📄 Fiche Drive ↗</a>`
      : "";

    card.innerHTML = `
      <div class="card-top">
        <div>
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <span class="prop-ref">RÉF. ${p.ref}</span>
            ${linkAgenceHtml}
            ${linkDriveHtml}
          </div>
          <h3 class="prop-type">${p.type}</h3>
          <p class="prop-city">${p.commune} (${p.cp})</p>
        </div>
        <span class="badge-dpe dpe-${p.dpe}">DPE ${p.dpe}</span>
      </div>

      <p style="font-size: 0.8125rem; color: #475569; line-height: 1.4;">${p.description || "Aucune remarque renseignée."}</p>

      <div class="prop-features">
        <span>📐 <strong>${p.surface} m²</strong></span>
        <span>🛏️ <strong>${p.chambres} ch.</strong></span>
        <span>🌳 <strong>${formatNumber(p.terrain)} m²</strong></span>
      </div>

      <div class="prop-price-box">
        <span class="prop-price">${formatMoney(p.prixFAI)}</span>
        <span class="prop-m2">${formatNumber(p.prixM2)} €/m² hab.</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

function updateTargetAnalysis() {
  const target = appState.properties.find((p) => p.ref === appState.selectedTargetRef) || appState.properties[0];
  if (!target) return;

  document.getElementById("targetCommune").textContent = target.commune;
  document.getElementById("targetSurface").textContent = `${target.surface} m²`;
  document.getElementById("targetPrice").textContent = formatMoney(target.prixFAI);
  document.getElementById("targetPriceM2").textContent = `${formatNumber(target.prixM2)} €/m²`;

  const concurrenceCommune = appState.properties.filter((p) => p.commune === target.commune);
  const avgM2Offres = Math.round(concurrenceCommune.reduce((acc, c) => acc + c.prixM2, 0) / concurrenceCommune.length);
  const ecartOffres = ((target.prixM2 - avgM2Offres) / avgM2Offres) * 100;
  
  const badgeOffres = document.getElementById("targetVsOffres");
  badgeOffres.textContent = formatPercent(ecartOffres);
  badgeOffres.className = `badge ${ecartOffres <= 0 ? "badge-success" : "badge-warning"}`;

  // Historique DVF Secteur Nontron
  const years = appState.dvfSecteurData.years;
  years.forEach((yr, idx) => {
    const medSec = appState.dvfSecteurData.medianes[idx];
    const elMedSec = document.getElementById(`medSec${yr}`);
    if (elMedSec) elMedSec.textContent = `${formatNumber(medSec)} €`;

    const ecartSec = ((target.prixM2 - medSec) / medSec) * 100;
    const elEcart = document.getElementById(`ecart${yr}`);
    if (elEcart) {
      elEcart.textContent = formatPercent(ecartSec);
      elEcart.style.color = ecartSec <= 0 ? "var(--success)" : "var(--danger)";
    }
  });
}";

let appState = {
  properties: [],
  filteredProperties: [],
  selectedTargetRef: null,
  dvfSecteurData: {
    years: ["2021", "2022", "2023", "2024", "2025", "2026"],
    medianes: [1293, 1302, 1445, 1357, 1319, 1276],
    volumes: [569, 476, 414, 370, 353, 142]
  },
  filters: {
    budgetMax: 600000,
    chambresMin: 3,
    dpeMax: "B"
  }
};

const DPE_ORDER = { "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7 };
const formatMoney = (val) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat("fr-FR").format(val);
const formatPercent = (val) => `${val > 0 ? "+" : ""}${val.toFixed(1).replace(".", ",")}%`;

// ==========================================================================
// 2. RÉCUPÉRATION DES DONNÉES EN DIRECT DEPUIS GOOGLE SHEETS
// ==========================================================================
async function fetchPropertiesFromSheets() {
  const statusEl = document.querySelector(".status-pill");
  if (statusEl) {
    statusEl.textContent = "⏳ Chargement des données...";
    statusEl.className = "status-pill";
    statusEl.style.background = "#FEF3C7";
    statusEl.style.color = "#D97706";
  }

  try {
    const response = await fetch(SCRIPT_API_URL);
    const properties = await response.json();

    if (Array.isArray(properties) && properties.length > 0) {
      appState.properties = properties;
      if (!appState.selectedTargetRef) {
        appState.selectedTargetRef = properties[properties.length - 1].ref;
      }

      if (statusEl) {
        statusEl.textContent = `● Connecté (${properties.length} biens en direct)`;
        statusEl.className = "status-pill live";
        statusEl.style.background = "";
        statusEl.style.color = "";
      }

      populateTargetSelect();
      applyFilters();
    }
  } catch (error) {
    console.error("Erreur de chargement Google Sheets :", error);
    if (statusEl) {
      statusEl.textContent = "⚠️ Erreur de connexion";
      statusEl.className = "status-pill";
      statusEl.style.background = "#FEE2E2";
      statusEl.style.color = "#DC2626";
    }
  }
}

// ==========================================================================
// 3. LOGIQUE D'AFFICHAGE & FILTRES
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  fetchPropertiesFromSheets();
});

function setupEventListeners() {
  const rangeBudget = document.getElementById("filterBudgetMax");
  const selectChambres = document.getElementById("filterChambres");
  const selectTarget = document.getElementById("selectTargetProperty");
  const btnRefresh = document.getElementById("btnRefresh");

  rangeBudget.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    appState.filters.budgetMax = val;
    document.getElementById("budgetDisplay").textContent = val >= 600000 ? "Tous" : formatMoney(val);
    applyFilters();
  });

  selectChambres.addEventListener("change", (e) => {
    appState.filters.chambresMin = parseInt(e.target.value, 10);
    applyFilters();
  });

  document.querySelectorAll(".dpe-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dpe-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      appState.filters.dpeMax = btn.dataset.dpe;
      applyFilters();
    });
  });

  selectTarget.addEventListener("change", (e) => {
    appState.selectedTargetRef = e.target.value;
    updateTargetAnalysis();
    renderPropertiesGrid();
  });

  if (btnRefresh) {
    btnRefresh.addEventListener("click", () => {
      fetchPropertiesFromSheets();
    });
  }
}

function populateTargetSelect() {
  const select = document.getElementById("selectTargetProperty");
  select.innerHTML = "";

  appState.properties.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.ref;
    opt.textContent = `${p.ref} — ${p.commune} (${formatMoney(p.prixFAI)})`;
    if (p.ref === appState.selectedTargetRef) opt.selected = true;
    select.appendChild(opt);
  });
}

function applyFilters() {
  const { budgetMax, chambresMin, dpeMax } = appState.filters;

  appState.filteredProperties = appState.properties.filter((p) => {
    if (p.prixFAI > budgetMax) return false;
    if (chambresMin > 0 && p.chambres < chambresMin) return false;
    if (dpeMax !== "ALL" && DPE_ORDER[p.dpe] > DPE_ORDER[dpeMax]) return false;
    return true;
  });

  appState.filteredProperties.sort((a, b) => a.prixFAI - b.prixFAI);

  updateKPIs();
  renderPropertiesGrid();
  updateTargetAnalysis();
}

function updateKPIs() {
  const items = appState.filteredProperties;
  const count = items.length;

  document.getElementById("kpiCount").textContent = `${count} ${count > 1 ? "biens" : "bien"}`;
  document.getElementById("resultsCount").textContent = `${count} ${count > 1 ? "biens trouvés" : "bien trouvé"}`;

  if (count === 0) {
    document.getElementById("kpiAvgPrice").textContent = "—";
    document.getElementById("kpiAvgM2").textContent = "—";
    return;
  }

  const sumPrice = items.reduce((acc, cur) => acc + cur.prixFAI, 0);
  const sumM2 = items.reduce((acc, cur) => acc + cur.prixM2, 0);

  document.getElementById("kpiAvgPrice").textContent = formatMoney(Math.round(sumPrice / count));
  document.getElementById("kpiAvgM2").textContent = `${formatNumber(Math.round(sumM2 / count))} €/m²`;
}

function renderPropertiesGrid() {
  const grid = document.getElementById("propertiesGrid");
  grid.innerHTML = "";

  if (appState.filteredProperties.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #64748B;">
        <p style="font-size: 1.125rem; font-weight: 600;">Aucun bien ne correspond aux filtres.</p>
      </div>
    `;
    return;
  }

  appState.filteredProperties.forEach((p) => {
    const isSelected = p.ref === appState.selectedTargetRef;
    const card = document.createElement("div");
    card.className = `property-card ${isSelected ? "selected" : ""}`;
    card.onclick = () => {
      appState.selectedTargetRef = p.ref;
      document.getElementById("selectTargetProperty").value = p.ref;
      updateTargetAnalysis();
      renderPropertiesGrid();
    };

    // Liens Agence et Fiche Drive cliquables
    const linkAgenceHtml = p.urlAgence 
      ? `<a href="${p.urlAgence}" target="_blank" rel="noopener noreferrer" class="ref-link" onclick="event.stopPropagation();" title="Voir l'annonce sur le site de l'agence">🌐 Annonce Agence ↗</a>` 
      : "";

    const linkDriveHtml = p.urlDrive
      ? `<a href="${p.urlDrive}" target="_blank" rel="noopener noreferrer" class="ref-link" onclick="event.stopPropagation();" style="background: rgba(27, 54, 93, 0.08); color: var(--primary);" title="Voir la fiche PDF Drive">📄 Fiche Drive ↗</a>`
      : "";

    card.innerHTML = `
      <div class="card-top">
        <div>
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.35rem; flex-wrap:wrap;">
            <span class="prop-ref">RÉF. ${p.ref}</span>
            ${linkAgenceHtml}
            ${linkDriveHtml}
          </div>
          <h3 class="prop-type">${p.type}</h3>
          <p class="prop-city">${p.commune} (${p.cp})</p>
        </div>
        <span class="badge-dpe dpe-${p.dpe}">DPE ${p.dpe}</span>
      </div>

      <p style="font-size: 0.8125rem; color: #475569; line-height: 1.4;">${p.description || "Aucune remarque renseignée."}</p>

      <div class="prop-features">
        <span>📐 <strong>${p.surface} m²</strong></span>
        <span>🛏️ <strong>${p.chambres} ch.</strong></span>
        <span>🌳 <strong>${formatNumber(p.terrain)} m²</strong></span>
      </div>

      <div class="prop-price-box">
        <span class="prop-price">${formatMoney(p.prixFAI)}</span>
        <span class="prop-m2">${formatNumber(p.prixM2)} €/m² hab.</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

function updateTargetAnalysis() {
  const target = appState.properties.find((p) => p.ref === appState.selectedTargetRef) || appState.properties[0];
  if (!target) return;

  document.getElementById("targetCommune").textContent = target.commune;
  document.getElementById("targetSurface").textContent = `${target.surface} m²`;
  document.getElementById("targetPrice").textContent = formatMoney(target.prixFAI);
  document.getElementById("targetPriceM2").textContent = `${formatNumber(target.prixM2)} €/m²`;

  const concurrenceCommune = appState.properties.filter((p) => p.commune === target.commune);
  const avgM2Offres = Math.round(concurrenceCommune.reduce((acc, c) => acc + c.prixM2, 0) / concurrenceCommune.length);
  const ecartOffres = ((target.prixM2 - avgM2Offres) / avgM2Offres) * 100;
  
  const badgeOffres = document.getElementById("targetVsOffres");
  badgeOffres.textContent = formatPercent(ecartOffres);
  badgeOffres.className = `badge ${ecartOffres <= 0 ? "badge-success" : "badge-warning"}`;

  // Historique DVF Secteur Nontron
  const years = appState.dvfSecteurData.years;
  years.forEach((yr, idx) => {
    const medSec = appState.dvfSecteurData.medianes[idx];
    const elMedSec = document.getElementById(`medSec${yr}`);
    if (elMedSec) elMedSec.textContent = `${formatNumber(medSec)} €`;

    const ecartSec = ((target.prixM2 - medSec) / medSec) * 100;
    const elEcart = document.getElementById(`ecart${yr}`);
    if (elEcart) {
      elEcart.textContent = formatPercent(ecartSec);
      elEcart.style.color = ecartSec <= 0 ? "var(--success)" : "var(--danger)";
    }
  });
}
