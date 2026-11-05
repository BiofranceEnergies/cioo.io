/**
 * OBSERVATOIRE IMMOBILIER & DVF — MOTEUR DYNAMIQUE TEMPS RÉEL (app.js)
 * Connexion directe à Google Sheets via l'API Google Visualization
 * Sylvain MATIGNON | Propriétés-Privées — Bassin Nontronnais
 */

const SHEET_CONFIG = {
  // Votre Document ID officiel
  docId: "17vApGLuH1dVbeOPjjUezAt4bn93h7WVqsz-2IFGcEeM",
  // L'onglet source des biens filtrés
  tabName: "Recherche par Prix"
};

let appState = {
  properties: [],
  filteredProperties: [],
  selectedTargetRef: null,
  dvfCommuneData: {},
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
// 1. CHARGEMENT DYNAMIQUE DEPUIS GOOGLE SHEETS
// ==========================================================================
async function loadDataFromGoogleSheets() {
  const statusEl = document.querySelector(".status-pill");
  if (statusEl) {
    statusEl.textContent = "⏳ Chargement Google Sheets...";
    statusEl.className = "status-pill";
    statusEl.style.background = "#FEF3C7";
    statusEl.style.color = "#D97706";
  }

  // URL de l'API Google Sheets gviz (lecture en direct de A8:AB50)
  const query = encodeURIComponent("SELECT *");
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_CONFIG.docId}/gviz/tq?sheet=${encodeURIComponent(SHEET_CONFIG.tabName)}&range=A8:AB50&tq=${query}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    
    // Google renvoie du JSON enveloppé dans google.visualization.Query.setResponse(...)
    const jsonString = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const json = JSON.parse(jsonString);

    const rows = json.table.rows;
    const properties = [];

    rows.forEach((r) => {
      const c = r.c;
      // On vérifie que la ligne contient bien un prix FAI valide (colonne F, index 5)

      if (!c || !c[1] || !c[5] || !c[5].v) return;

      // Extraction propre des colonnes de votre onglet
      const ref = String(c[1].v || "").trim();
      const cp = String(c[2] ? c[2].v : "").trim();
      const commune = String(c[3] ? c[3].v : "").trim();
      const type = String(c[4] ? c[4].v : "Maison").trim();
      const prixFAI = parseFloat(c[5].v) || 0;
      const surface = parseFloat(c[9] ? c[9].v : 0) || 0;
      const prixM2 = parseFloat(c[10] ? c[10].v : 0) || (surface > 0 ? Math.round(prixFAI / surface) : 0);
      const terrain = parseFloat(c[12] ? c[12].v : 0) || 0;
      const chambres = parseInt(c[13] ? c[13].v : 0, 10) || 0;
      
      // Extraction lettre DPE (ex: "B (107)" -> "B")
      const dpeRaw = String(c[16] ? c[16].v : "D").trim().toUpperCase();
      const dpeMatch = dpeRaw.match(/^[A-G]/);
      const dpe = dpeMatch ? dpeMatch[0] : "D";

      const agence = String(c[22] ? c[22].v : "").trim();
      const description = String(c[23] ? c[23].v : "").trim();

      // RÉCUPÉRATION DU LIEN DE LA COLONNE A (Lien agence)
      // Si la cellule est un lien hypertexte Sheets, Google stocke l'URL dans c[0].formattedValue ou une propriété link
      let urlAgence = "";
      if (c[0]) {
        // En format gviz, si c'est un lien, c[0].v ou c[0].f peut contenir l'URL
        if (typeof c[0].v === "string" && c[0].v.startsWith("http")) {
          urlAgence = c[0].v;
        } else if (c[0].f && c[0].f.includes("http")) {
          const match = c[0].f.match(/https?:\/\/[^\s"']+/);
          if (match) urlAgence = match[0];
        }
      }

      properties.push({
        ref,
        cp,
        commune,
        type,
        prixFAI,
        surface,
        prixM2,
        terrain,
        chambres,
        dpe,
        agence,
        description,
        urlAgence
      });
    });

    if (properties.length > 0) {
      appState.properties = properties;
      if (!appState.selectedTargetRef) {
        appState.selectedTargetRef = properties[properties.length - 1].ref; // Bien sélectionné par défaut
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
  } catch (err) {
    console.error("Erreur de connexion Sheets :", err);
    if (statusEl) {
      statusEl.textContent = "⚠️ Mode Hors-ligne";
      statusEl.className = "status-pill";
      statusEl.style.background = "#FEE2E2";
      statusEl.style.color = "#DC2626";
    }
  }
}

// ==========================================================================
// 2. LOGIQUE D'AFFICHAGE & FILTRES
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  loadDataFromGoogleSheets(); // Chargement direct au lancement
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
      loadDataFromGoogleSheets();
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

    // Lien agence dynamique direct
    const linkAgenceHtml = p.urlAgence 
      ? `<a href="${p.urlAgence}" target="_blank" rel="noopener noreferrer" class="ref-link" onclick="event.stopPropagation();">🌐 Voir l'annonce ↗</a>` 
      : "";

    card.innerHTML = `
      <div class="card-top">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <span class="prop-ref">RÉF. ${p.ref}</span>
            ${linkAgenceHtml}
          </div>
          <h3 class="prop-type">${p.type}</h3>
          <p class="prop-city">${p.commune} (${p.cp})</p>
        </div>
        <span class="badge-dpe dpe-${p.dpe}">DPE ${p.dpe}</span>
      </div>

      <p style="font-size: 0.8125rem; color: #475569; line-height: 1.4;">${p.description || "Aucune remarque spécifique."}</p>

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

  // Historique DVF Secteur Nontron (~15 km)
  const years = appState.dvfSecteurData.years;
  years.forEach((yr, idx) => {
    const medSec = appState.dvfSecteurData.medianes[idx];
    const volSec = appState.dvfSecteurData.volumes[idx];

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
