/**
 * OBSERVATOIRE IMMOBILIER & DVF — MOTEUR D'APPLICATION (app.js)
 * Sylvain MATIGNON | Propriétés-Privées — Bassin Nontronnais
 */

// ==========================================================================
// 1. DONNÉES SOURCES LOCALES & PARAMÈTRES
// ==========================================================================

const APP_CONFIG = {
  sheetId: "17vApGLuH1dVbeOPjjUezAt4bn93h7WVqsz-2IFGcEeM",
  seuilPlancherDvf: 400,
  codesPostauxSecteur: ["24300", "24360", "24470"]
};

// Portefeuille des biens du secteur Nontron (~15 km)
const INITIAL_PROPERTIES = [
  {
    ref: "3631",
    cp: "24300",
    commune: "Saint-Martial-de-Valette",
    type: "Maison",
    prixFAI: 288750,
    surface: 152,
    prixM2: 1900,
    chambres: 4,
    dpe: "B",
    ges: "A",
    terrain: 11537,
    agence: "Immobilière Brun Salat",
    description: "Maison 1978 redécorée 2021 sur ss-sol aménageable, séjour 58m² cheminée, PAC + panneaux solaires, piscine 10x5, terrain 1,15 ha"
  },
  {
    ref: "98-5589",
    cp: "24300",
    commune: "Nontron",
    type: "Maison de plain-pied sans travaux",
    prixFAI: 293216,
    surface: 187,
    prixM2: 1568,
    chambres: 3,
    dpe: "B",
    ges: "A",
    terrain: 11394,
    agence: "HUMAN Immobilier Nontron",
    description: "Proche centre-ville, maison de plain-pied, pièce de vie 51m² lumineuse, PAC, double garage, terrain de 11 394 m²"
  },
  {
    ref: "BVI84708",
    cp: "24300",
    commune: "Savignac-de-Nontron",
    type: "Maison de caractère en pierre",
    prixFAI: 297460,
    surface: 183,
    prixM2: 1625,
    chambres: 5,
    dpe: "B",
    ges: "A",
    terrain: 2125,
    agence: "Beaux Villages Immobilier",
    description: "Maison en pierre rénovée, cuisine ouverte 4 ch à l'étage, studio, PAC, dépendances, jardin 2 125 m²"
  },
  {
    ref: "3750",
    cp: "24300",
    commune: "Saint-Front-la-Rivière",
    type: "Grange rénovée",
    prixFAI: 299000,
    surface: 185,
    prixM2: 1616,
    chambres: 4,
    dpe: "A",
    ges: "A",
    terrain: 1559,
    agence: "Immobilière Brun Salat",
    description: "Grange rénovée haut de gamme, séjour 57m², 4 ch, mezzanine, PAC au sol, alu DV, terrain 1 559 m²"
  },
  {
    ref: "3811",
    cp: "24300",
    commune: "Savignac-de-Nontron",
    type: "Maison de campagne",
    prixFAI: 299250,
    surface: 221,
    prixM2: 1354,
    chambres: 4,
    dpe: "B",
    ges: "B",
    terrain: 2125,
    agence: "Immobilière Brun Salat",
    description: "Maison en pierre 1850 rénovée, séjour 70m², 4 ch dont suite, grange séparée, fournil, terrain 2 125 m²"
  },
  {
    ref: "98-5456",
    cp: "24360",
    commune: "Varaignes",
    type: "Maison en pierre rénovée",
    prixFAI: 317700,
    surface: 220,
    prixM2: 1444,
    chambres: 3,
    dpe: "B",
    ges: "A",
    terrain: 6500,
    agence: "HUMAN Immobilier Nontron",
    description: "Au calme à la campagne, pierre rénovée, séjour 60m², suite RDC, PAC, 3 garages, terrain 6 500 m²"
  },
  {
    ref: "2074784",
    cp: "24300",
    commune: "Saint-Martin-le-Pin",
    type: "Maison de plain-pied avec 2 studios",
    prixFAI: 326000,
    surface: 300,
    prixM2: 1087,
    chambres: 7,
    dpe: "A",
    ges: "A",
    terrain: 7572,
    agence: "iad France (Nicolas Brunet)",
    description: "Résidence principale 180m² + 2 studios indépendants de 60m², séjour 39m², terrain 7 572 m²"
  }
];

// Historique officiel des médianes DVF du secteur Nontron (~15 km)
const DVF_SECTEUR_HISTORY = {
  years: ["2021", "2022", "2023", "2024", "2025", "2026"],
  medianes: [1293, 1302, 1445, 1357, 1319, 1276],
  volumes: [569, 476, 414, 370, 353, 142]
};

// Historique DVF par commune repère
const DVF_COMMUNES_HISTORY = {
  "Saint-Martin-le-Pin": {
    medianes: [1308, 1369, 1029, 1460, 1501, 993],
    volumes: [16, 4, 10, 5, 6, 1]
  },
  "Nontron": {
    medianes: [1150, 1220, 1285, 1240, 1215, 1180],
    volumes: [85, 78, 62, 59, 54, 22]
  },
  "Saint-Martial-de-Valette": {
    medianes: [1340, 1310, 1410, 1380, 1350, 1290],
    volumes: [18, 14, 12, 11, 9, 4]
  },
  "Savignac-de-Nontron": {
    medianes: [1280, 1315, 1390, 1340, 1310, 1250],
    volumes: [12, 9, 8, 7, 6, 2]
  },
  "Saint-Front-la-Rivière": {
    medianes: [1220, 1260, 1340, 1300, 1280, 1210],
    volumes: [10, 8, 7, 6, 5, 2]
  },
  "Varaignes": {
    medianes: [1250, 1290, 1370, 1320, 1295, 1240],
    volumes: [9, 7, 6, 5, 4, 1]
  }
};

// ==========================================================================
// 2. ÉTAT DE L'APPLICATION
// ==========================================================================

let appState = {
  properties: [...INITIAL_PROPERTIES],
  filteredProperties: [...INITIAL_PROPERTIES],
  selectedTargetRef: "2074784",
  filters: {
    budgetMax: 600000,
    chambresMin: 3,
    dpeMax: "B"
  }
};

// ==========================================================================
// 3. UTILITAIRES & FORMATAGE
// ==========================================================================

const formatMoney = (val) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat("fr-FR").format(val);
const formatPercent = (val) => `${val > 0 ? "+" : ""}${val.toFixed(1).replace(".", ",")}%`;

const DPE_ORDER = { "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7 };

// ==========================================================================
// 4. RENDU & LOGIQUE DE L'INTERFACE
// ==========================================================================

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  populateTargetSelect();
  applyFilters();
});

// Configuration des écouteurs d'événements
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

  // Boutons de sélection rapide du DPE
  const dpePills = document.querySelectorAll(".dpe-btn");
  dpePills.forEach((btn) => {
    btn.addEventListener("click", () => {
      dpePills.forEach((b) => b.classList.remove("active"));
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
      btnRefresh.textContent = "Actualisation...";
      setTimeout(() => {
        applyFilters();
        btnRefresh.textContent = "Actualiser";
      }, 350);
    });
  }
}

// Remplissage du menu déroulant de sélection du bien cible
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

// Filtrage dynamique du portefeuille
function applyFilters() {
  const { budgetMax, chambresMin, dpeMax } = appState.filters;

  appState.filteredProperties = appState.properties.filter((p) => {
    if (p.prixFAI > budgetMax) return false;
    if (chambresMin > 0 && p.chambres < chambresMin) return false;
    if (dpeMax !== "ALL" && DPE_ORDER[p.dpe] > DPE_ORDER[dpeMax]) return false;
    return true;
  });

  // Tri par prix croissant
  appState.filteredProperties.sort((a, b) => a.prixFAI - b.prixFAI);

  updateKPIs();
  renderPropertiesGrid();
  updateTargetAnalysis();
}

// Mise à jour des cartes métriques (KPIs)
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

// Rendu des cartes de biens en vente
function renderPropertiesGrid() {
  const grid = document.getElementById("propertiesGrid");
  grid.innerHTML = "";

  if (appState.filteredProperties.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: #64748B;">
        <p style="font-size: 1.125rem; font-weight: 600;">Aucun bien ne correspond exactement à vos critères.</p>
        <p style="font-size: 0.875rem; margin-top: 0.25rem;">Essayez d'augmenter le budget max ou d'élargir le DPE.</p>
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

    card.innerHTML = `
      <div class="card-top">
        <div>
          <span class="prop-ref">RÉF. ${p.ref}</span>
          <h3 class="prop-type">${p.type}</h3>
          <p class="prop-city">${p.commune} (${p.cp})</p>
        </div>
        <span class="badge-dpe dpe-${p.dpe}">DPE ${p.dpe}</span>
      </div>

      <p style="font-size: 0.8125rem; color: #475569; line-height: 1.4;">${p.description}</p>

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

// ==========================================================================
// 5. CALCULS & TABLEAU DVF (COMMUNE vs SECTEUR)
// ==========================================================================

function updateTargetAnalysis() {
  const target = appState.properties.find((p) => p.ref === appState.selectedTargetRef) || appState.properties[0];
  if (!target) return;

  // Mise à jour de la fiche du bien sélectionné
  document.getElementById("targetCommune").textContent = target.commune;
  document.getElementById("targetSurface").textContent = `${target.surface} m²`;
  document.getElementById("targetPrice").textContent = formatMoney(target.prixFAI);
  document.getElementById("targetPriceM2").textContent = `${formatNumber(target.prixM2)} €/m²`;

  // Concurrence en vente sur la même commune
  const concurrenceCommune = appState.properties.filter((p) => p.commune === target.commune);
  const avgM2Offres = Math.round(concurrenceCommune.reduce((acc, c) => acc + c.prixM2, 0) / concurrenceCommune.length);
  const ecartOffres = ((target.prixM2 - avgM2Offres) / avgM2Offres) * 100;
  
  const badgeOffres = document.getElementById("targetVsOffres");
  badgeOffres.textContent = formatPercent(ecartOffres);
  badgeOffres.className = `badge ${ecartOffres <= 0 ? "badge-success" : "badge-warning"}`;

  // Récupération de l'historique DVF de la commune
  const comHistory = DVF_COMMUNES_HISTORY[target.commune] || {
    medianes: [1250, 1280, 1350, 1300, 1280, 1200],
    volumes: [8, 6, 5, 4, 3, 1]
  };

  const years = DVF_SECTEUR_HISTORY.years;

  years.forEach((yr, idx) => {
    const medCom = comHistory.medianes[idx];
    const medSec = DVF_SECTEUR_HISTORY.medianes[idx];
    const volCom = comHistory.volumes[idx];
    const volSec = DVF_SECTEUR_HISTORY.volumes[idx];

    // Médianes
    const elMedCom = document.getElementById(`medCom${yr}`);
    const elMedSec = document.getElementById(`medSec${yr}`);
    if (elMedCom) elMedCom.textContent = `${formatNumber(medCom)} €`;
    if (elMedSec) elMedSec.textContent = `${formatNumber(medSec)} €`;

    // Écart Bien vs Médiane Secteur
    const ecartSec = ((target.prixM2 - medSec) / medSec) * 100;
    const elEcart = document.getElementById(`ecart${yr}`);
    if (elEcart) {
      elEcart.textContent = formatPercent(ecartSec);
      elEcart.style.color = ecartSec <= 0 ? "var(--success)" : "var(--danger)";
    }

    // Volumes
    const elVol = document.getElementById(`vol${yr}`);
    if (elVol) elVol.textContent = `${volCom} / ${volSec}`;
  });
}
