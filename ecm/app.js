/**
 * OBSERVATOIRE IMMOBILIER & DVF
 * Sylvain MATIGNON • Propriétés-Privées • Nontron & Périgord Vert
 */

const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbzN6ClYq7pAmRDkDZq3IIBbYcSFcDvepkT-X-G4145lmlvr36KzGpnoYZMdu87VqGB54g/exec";

const DVF_BASSIN_DATA = {
    years: ["2021", "2022", "2023", "2024", "2025", "2026"],
    median_sqm: { "2021": 1278, "2022": 1235, "2023": 1368, "2024": 1323, "2025": 1341, "2026": 1029 },
    avg_sqm: { "2021": 1572, "2022": 1470, "2023": 1731, "2024": 1453, "2025": 1470, "2026": 1242 },
    volumes: { "2021": 262, "2022": 220, "2023": 183, "2024": 162, "2025": 149, "2026": 67 }
};

let propertiesData = [];
const brokenImageRefs = new Set();

let appState = {
    minPrice: null,
    maxPrice: null,
    minRooms: 0,
    dpeMax: "ALL",
    onlyWithPhoto: true,
    sortBy: "price-asc",
    selectedTargetRef: null
};

document.addEventListener("DOMContentLoaded", () => {
    initFilters();
    renderDvfTable();
    loadPropertiesFromSheets();
});

async function loadPropertiesFromSheets() {
    const statusEl = document.getElementById("sync-status");
    if (statusEl) statusEl.textContent = "Synchronisation Google Sheets...";

    try {
        const response = await fetch(GOOGLE_SHEETS_API_URL);
        const data = await response.json();

        if (data && data.properties && data.properties.length > 0) {
            propertiesData = data.properties;
            
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

function initFilters() {
    const minInput = document.getElementById("min-price");
    const maxInput = document.getElementById("max-price");
    const dpeSelect = document.getElementById("dpe-max");
    const roomButtons = document.querySelectorAll("#room-filters .seg-btn");
    const targetSelect = document.getElementById("target-select");
    const onlyPhotoCheckbox = document.getElementById("only-with-photo");
    const sortSelect = document.getElementById("sort-select");

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

    if (onlyPhotoCheckbox) {
        onlyPhotoCheckbox.addEventListener("change", (e) => {
            appState.onlyWithPhoto = e.target.checked;
            renderAll();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            appState.sortBy = e.target.value;
            renderProperties();
        });
    }

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
        renderAll();
    });
}

function hasValidPhoto(prop) {
    if (brokenImageRefs.has(prop.ref)) return false;
    if (!prop.image) return false;
    const firstUrl = prop.image.split("|")[0].trim();
    if (!firstUrl || !firstUrl.startsWith("http")) return false;
    const lower = firstUrl.toLowerCase();
    if (lower.includes("no-photo") || lower.includes("nophoto") || lower.includes("placeholder") || lower.includes("indisponible")) {
        return false;
    }
    return true;
}

window.handleImageError = function(imgEl, ref) {
    brokenImageRefs.add(ref);
    if (appState.onlyWithPhoto && ref !== appState.selectedTargetRef) {
        renderAll();
    } else {
        imgEl.style.display = "none";
        if (imgEl.nextElementSibling) {
            imgEl.nextElementSibling.style.display = "flex";
        }
    }
};

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

function getTargetDuplicateRefs() {
    const target = propertiesData.find(p => p.ref === appState.selectedTargetRef);
    if (!target || !target.desc) return new Set();

    const refs = new Set();
    const match = target.desc.match(/m[êe]me bien que[^)]*?([A-Z0-9-]{3,})/gi);
    if (match) {
        match.forEach(segment => {
            const tokens = segment.match(/\b[A-Z0-9-]{3,}\b/gi) || [];
            tokens.forEach(tok => {
                if (!/^(m[êe]me|bien|que|r[ée]f|brun|salat|iad|human|efficity|anb|chez)$/i.test(tok)) {
                    refs.add(tok.toLowerCase());
                }
            });
        });
    }
    return refs;
}

function getFilteredProperties() {
    const dpeRank = { "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7 };
    const duplicateRefsOfTarget = getTargetDuplicateRefs();

    const filtered = propertiesData.filter(item => {
        const isTarget = item.ref === appState.selectedTargetRef;

        if (!isTarget) {
            if (/\b(m[êe]me bien que|doublon)\b/i.test(item.desc || "")) return false;
            if (duplicateRefsOfTarget.has(String(item.ref).toLowerCase())) return false;
        }

        if (appState.onlyWithPhoto && !isTarget && !hasValidPhoto(item)) return false;
        if (appState.minPrice !== null && item.price < appState.minPrice) return false;
        if (appState.maxPrice !== null && item.price > appState.maxPrice) return false;
        if (item.rooms < appState.minRooms) return false;

        if (appState.dpeMax !== "ALL") {
            const maxRank = dpeRank[appState.dpeMax] || 99;
            const itemRank = dpeRank[(item.dpe || "").charAt(0)] || 99;
            if (itemRank > maxRank) return false;
        }

        return true;
    });

    return filtered.sort((a, b) => {
        switch (appState.sortBy) {
            case "sqm-asc":
                return a.sqmPrice - b.sqmPrice;
            case "sqm-desc":
                return b.sqmPrice - a.sqmPrice;
            case "surface-desc":
                return b.surface - a.surface;
            case "price-asc":
            default:
                return a.price - b.price;
        }
    });
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
    renderCompetitiveSummary(target, filtered);
}

/**
 * GÉNÉRATION DU RÉSUMÉ & CLASSEMENT CONCURRENTIEL SOUS LE TABLEAU DVF
 */
function renderCompetitiveSummary(target, filtered) {
    const container = document.getElementById("competitive-summary");
    if (!container) return;

    const pool = filtered.some(p => p.ref === target.ref) ? [...filtered] : [target, ...filtered];
    const competitors = pool.filter(p => p.ref !== target.ref);

    if (competitors.length === 0) {
        container.innerHTML = `
            <div class="summary-empty">
                Aucune autre offre active dans cette fourchette de critères pour établir un classement concurrentiel.
            </div>
        `;
        return;
    }

    const total = pool.length;

    // 1. Calcul des rangs du bien analysé
    const priceAsc = [...pool].sort((a, b) => a.price - b.price);
    const rankPrice = priceAsc.findIndex(p => p.ref === target.ref) + 1;

    const sqmAsc = [...pool].sort((a, b) => a.sqmPrice - b.sqmPrice);
    const rankSqm = sqmAsc.findIndex(p => p.ref === target.ref) + 1;

    const surfDesc = [...pool].sort((a, b) => b.surface - a.surface);
    const rankSurface = surfDesc.findIndex(p => p.ref === target.ref) + 1;

    const landDesc = [...pool].sort((a, b) => (b.land || 0) - (a.land || 0));
    const rankLand = landDesc.findIndex(p => p.ref === target.ref) + 1;

    const formatRank = (r) => (r === 1 ? "1er" : `${r}e`);

    // 2. Analyse comparative : ce que les concurrents offrent en plus
    const dpeOrder = { "A": 1, "B": 2, "C": 3, "D": 4, "E": 5, "F": 6, "G": 7 };
    const targetDpeScore = dpeOrder[(target.dpe || "G").charAt(0)] || 7;

    const biggerSurface = competitors.filter(c => c.surface > target.surface);
    const maxSurfaceComp = [...competitors].sort((a, b) => b.surface - a.surface)[0];

    const moreRooms = competitors.filter(c => c.rooms > target.rooms);
    const maxRoomsComp = [...competitors].sort((a, b) => b.rooms - a.rooms)[0];

    const biggerLand = competitors.filter(c => (c.land || 0) > (target.land || 0));
    const maxLandComp = [...competitors].sort((a, b) => (b.land || 0) - (a.land || 0))[0];

    const betterDpe = competitors.filter(c => {
        const score = dpeOrder[(c.dpe || "G").charAt(0)] || 7;
        return score < targetDpeScore;
    });

    const featureMatchers = [
        { label: "piscine", regex: /\bpiscine\b/i },
        { label: "dépendance / grange / hangar", regex: /\b(d[ée]pendance|grange|hangar|atelier)\b/i },
        { label: "gîte / studio / 2e logement", regex: /\b(g[îi]te|studio|2\s*maisons|logement|locatif)\b/i },
        { label: "plain-pied", regex: /\bplain[\s-]pied\b/i }
    ];

    const targetDesc = `${target.type || ""} ${target.desc || ""}`;
    const detectedExtras = [];

    featureMatchers.forEach(fm => {
        const targetHasIt = fm.regex.test(targetDesc);
        const matchingComps = competitors.filter(c => fm.regex.test(`${c.type || ""} ${c.desc || ""}`));
        if (matchingComps.length > 0 && !targetHasIt) {
            detectedExtras.push(`<strong>${matchingComps.length}</strong> bien(s) avec <em>${fm.label}</em>`);
        }
    });

    const advantageBullets = [];

    if (biggerSurface.length > 0) {
        advantageBullets.push(
            `<strong>Surface habitable :</strong> <strong>${biggerSurface.length} concurrent(s) sur ${competitors.length}</strong> offrent plus de surface habitable (jusqu'à <strong>${maxSurfaceComp.surface} m²</strong> à ${maxSurfaceComp.commune} pour ${formatCurrency(maxSurfaceComp.price)}).`
        );
    } else {
        advantageBullets.push(
            `<strong>Surface habitable :</strong> Votre bien offre la <strong>plus grande surface habitable</strong> de la sélection (${target.surface} m²).`
        );
    }

    if (moreRooms.length > 0) {
        advantageBullets.push(
            `<strong>Capacité d'accueil :</strong> <strong>${moreRooms.length} concurrent(s)</strong> proposent davantage de chambres (jusqu'à <strong>${maxRoomsComp.rooms} ch.</strong> contre ${target.rooms} ch.).`
        );
    }

    if (biggerLand.length > 0) {
        advantageBullets.push(
            `<strong>Terrain extérieur :</strong> <strong>${biggerLand.length} concurrent(s)</strong> disposent d'un terrain plus vaste (jusqu'à <strong>${formatNumber(maxLandComp.land)} m²</strong> à ${maxLandComp.commune}).`
        );
    }

    if (betterDpe.length > 0) {
        const bestDpeLetter = betterDpe.map(c => c.dpe.charAt(0)).sort()[0];
        advantageBullets.push(
            `<strong>Performance énergétique :</strong> <strong>${betterDpe.length} concurrent(s)</strong> affichent une meilleure étiquette DPE (classe ${bestDpeLetter} ou mieux contre DPE ${target.dpe}).`
        );
    }

    if (detectedExtras.length > 0) {
        advantageBullets.push(
            `<strong>Équipements absents du bien analysé :</strong> ${detectedExtras.join(" • ")}.`
        );
    }

    const bulletsHtml = advantageBullets.map(item => `<li>${item}</li>`).join("");

    // 3. Top 3 des concurrents résidentiels les plus compétitifs
    const residentialCompetitors = competitors.filter(c => {
        const t = (c.type || "").toLowerCase();
        return !t.includes("commercial") && !t.includes("tertiaire") && !t.includes("terrain") && !t.includes("immeuble de rapport");
    });
    const poolForTop3 = residentialCompetitors.length > 0 ? residentialCompetitors : competitors;

    const scoredCompetitors = poolForTop3.map(c => {
        const priceDiff = c.price - target.price;
        const surfDiff = c.surface - target.surface;
        const landDiff = (c.land || 0) - (target.land || 0);
        const valueScore = (target.sqmPrice - c.sqmPrice) + (surfDiff * 6) + (landDiff * 0.015) - (Math.max(0, priceDiff) * 0.01);
        return { prop: c, priceDiff, surfDiff, landDiff, valueScore };
    }).sort((a, b) => b.valueScore - a.valueScore).slice(0, 3);

    const threatsMarkup = scoredCompetitors.map(item => {
        const c = item.prop;
        const priceDeltaStr = item.priceDiff === 0
            ? "même prix"
            : (item.priceDiff > 0 ? `+${formatCurrency(item.priceDiff)}` : `${formatCurrency(item.priceDiff)}`);
        const surfDeltaStr = item.surfDiff > 0 ? `+${item.surfDiff} m² hab.` : `${c.surface} m² hab.`;
        const landDeltaStr = item.landDiff > 500 ? `+${formatNumber(item.landDiff)} m² terrain` : `${formatNumber(c.land || 0)} m² terrain`;

        return `
            <div class="threat-card" onclick="selectPropertyFromSummary('${c.ref}')" title="Cliquer pour analyser ce bien concurrent">
                <div class="threat-header">
                    <span class="threat-ref">Réf. ${c.ref} • ${c.commune}</span>
                    <span class="threat-price">${formatCurrency(c.price)} <small>(${priceDeltaStr})</small></span>
                </div>
                <div class="threat-title">${c.type} — ${formatNumber(c.sqmPrice)} €/m² • DPE ${c.dpe}</div>
                <div class="threat-gains">
                    <span class="gain-pill">${surfDeltaStr}</span>
                    <span class="gain-pill">${c.rooms} ch.</span>
                    <span class="gain-pill">${landDeltaStr}</span>
                </div>
            </div>
        `;
    }).join("");

    let positioningAlert = "";
    if (rankSqm === total && total > 1) {
        positioningAlert = `Le bien analysé affiche le <strong>prix au m² le plus élevé de toute la sélection (${formatRank(rankSqm)} / ${total})</strong>.`;
    } else if (rankSqm > Math.ceil(total / 2)) {
        positioningAlert = `Le bien analysé se situe dans la <strong>moitié haute des prix au m² (${formatRank(rankSqm)} / ${total})</strong> face à la concurrence active.`;
    } else {
        positioningAlert = `Le bien analysé est <strong>bien positionné au m² (${formatRank(rankSqm)} / ${total})</strong> par rapport aux offres concurrentes.`;
    }

    container.innerHTML = `
        <div class="summary-header">
            <span class="summary-badge">Synthèse &amp; Argumentaire Vendeur</span>
            <p class="summary-headline">${positioningAlert}</p>
        </div>

        <div class="rank-pills-row">
            <div class="rank-box">
                <span class="rank-lbl">Classement Prix FAI</span>
                <span class="rank-val">${formatRank(rankPrice)} <small>/ ${total}</small></span>
                <span class="rank-hint">${rankPrice === 1 ? "Ticket d'entrée le plus bas" : "Du moins cher au plus cher"}</span>
            </div>
            <div class="rank-box ${rankSqm >= total - 1 ? "rank-alert" : ""}">
                <span class="rank-lbl">Classement Prix / m²</span>
                <span class="rank-val">${formatRank(rankSqm)} <small>/ ${total}</small></span>
                <span class="rank-hint">${rankSqm === total ? "Le plus cher au m²" : "Du moins cher au plus cher/m²"}</span>
            </div>
            <div class="rank-box">
                <span class="rank-lbl">Classement Surface Hab.</span>
                <span class="rank-val">${formatRank(rankSurface)} <small>/ ${total}</small></span>
                <span class="rank-hint">${rankSurface === total ? "La plus petite surface" : "De la plus grande à la plus petite"}</span>
            </div>
            <div class="rank-box">
                <span class="rank-lbl">Classement Terrain</span>
                <span class="rank-val">${formatRank(rankLand)} <small>/ ${total}</small></span>
                <span class="rank-hint">Du plus grand au plus petit terrain</span>
            </div>
        </div>

        <div class="summary-columns">
            <div class="summary-col">
                <h4>⚖️ Ce que la concurrence offre en plus sur ce budget</h4>
                <ul class="advantages-list">
                    ${bulletsHtml}
                </ul>
            </div>
            <div class="summary-col">
                <h4>🎯 Top 3 des concurrents les plus compétitifs</h4>
                <div class="threats-list">
                    ${threatsMarkup}
                </div>
            </div>
        </div>
    `;
}

window.selectPropertyFromSummary = function(ref) {
    appState.selectedTargetRef = ref;
    const select = document.getElementById("target-select");
    if (select) select.value = ref;
    renderAll();
    const card = document.getElementById(`card-prop-${ref}`);
    if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
};

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
        card.id = `card-prop-${prop.ref}`;

        const firstImageUrl = prop.image ? prop.image.split("|")[0].trim() : "";

        const mediaMarkup = firstImageUrl && !brokenImageRefs.has(prop.ref)
            ? `<div class="card-media">
                 <img src="${firstImageUrl}" alt="${prop.type} à ${prop.commune}" loading="lazy"
                      onerror="handleImageError(this, '${prop.ref}')">
                 <div class="card-media-placeholder" style="display: none;">
                     <span>🏠 Aperçu photo indisponible</span>
                 </div>
                 <span class="dpe-badge dpe-${prop.dpe.charAt(0)} card-dpe-overlay">DPE ${prop.dpe}</span>
               </div>`
            : `<div class="card-media">
                 <div class="card-media-placeholder">
                     <span>🏠 Aperçu photo à venir</span>
                 </div>
                 <span class="dpe-badge dpe-${prop.dpe.charAt(0)} card-dpe-overlay">DPE ${prop.dpe}</span>
               </div>`;

        const refMarkup = prop.driveLink 
            ? `<a href="${prop.driveLink}" target="_blank" rel="noopener noreferrer" class="ref-badge drive-link" title="Ouvrir la fiche Drive / PDF" onclick="event.stopPropagation()">📄 Réf. ${prop.ref}</a>`
            : `<span class="ref-badge">Réf. ${prop.ref}</span>`;

        const agencyMarkup = prop.agencyLink 
            ? `<a href="${prop.agencyLink}" target="_blank" rel="noopener noreferrer" class="agency-link-btn" title="Voir l'annonce sur le site de l'agence" onclick="event.stopPropagation()">🌐 Annonce agence ↗</a>`
            : "";

        const targetBadgeMarkup = isTarget 
            ? `<span class="target-indicator-badge">🎯 Bien analysé</span>` 
            : "";

        card.innerHTML = `
            ${targetBadgeMarkup}
            ${mediaMarkup}
            <div class="card-body">
                <div class="card-top">
                    <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
                        ${refMarkup}
                        ${agencyMarkup}
                    </div>
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
            </div>
        `;

        card.addEventListener("click", () => {
            appState.selectedTargetRef = prop.ref;
            document.getElementById("target-select").value = prop.ref;
            renderAll();
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
