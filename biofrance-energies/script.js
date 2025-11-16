/* =========================================================
   FAQ — Accordéon
   ========================================================= */
(function () {
  function setPanelHeight(panel) {
    if (!panel) return;
    panel.style.maxHeight = "0px";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const h = panel.scrollHeight;
        panel.style.maxHeight = h + "px";
        const onEnd = (e) => {
          if (e.propertyName !== "max-height") return;
          panel.style.maxHeight = "none";
          panel.removeEventListener("transitionend", onEnd);
        };
        panel.addEventListener("transitionend", onEnd);
      })
    );
  }

  function closePanel(panel) {
    if (!panel) return;
    if (getComputedStyle(panel).maxHeight === "none") {
      panel.style.maxHeight = panel.scrollHeight + "px";
      void panel.offsetHeight;
    }
    panel.style.maxHeight = "0px";
  }

  function openItem(btn) {
    const panel = btn.nextElementSibling;
    document.querySelectorAll('.faq__btn[aria-expanded="true"]').forEach((b) => {
      if (b !== btn) {
        b.setAttribute("aria-expanded", "false");
        closePanel(b.nextElementSibling);
        b.closest(".faq__item")?.classList.remove("is-open");
      }
    });
    btn.setAttribute("aria-expanded", "true");
    btn.closest(".faq__item")?.classList.add("is-open");
    setPanelHeight(panel);
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq__btn");
    if (!btn) return;
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    const panel = btn.nextElementSibling;
    const it = btn.closest(".faq__item");
    if (isOpen) {
      btn.setAttribute("aria-expanded", "false");
      it?.classList.remove("is-open");
      closePanel(panel);
    } else {
      openItem(btn);
    }
  });

  window.addEventListener("load", () => {
    const firstBtn = document.querySelector(".faq__btn");
    if (firstBtn) openItem(firstBtn);
  });

  window.addEventListener("resize", () => {
    document
      .querySelectorAll('.faq__btn[aria-expanded="true"]')
      .forEach((btn) => setPanelHeight(btn.nextElementSibling));
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      document
        .querySelectorAll('.faq__btn[aria-expanded="true"]')
        .forEach((btn) => setPanelHeight(btn.nextElementSibling));
    });
  }
})();

/* =========================================================
   Mentions légales — Ouverture / Fermeture
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const link = document.getElementById("mentions-legales-link");
  const popup = document.getElementById("mentions-popup");
  const close = document.getElementById("close-mentions");
  if (!popup || !close) return;

  function openPopup(e) {
    if (e) e.preventDefault();
    popup.style.display = "block";
    close.focus();
  }
  function closePopup(e) {
    if (e) e.preventDefault();
    popup.style.display = "none";
  }

  if (link) link.addEventListener("click", openPopup);
  close.addEventListener("click", closePopup);

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && popup.style.display === "block") closePopup();
  });
});

/* =========================================================
   Calcul + Affichage (simulation)
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-estimation");
  if (!form) return;

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();

    // --- Financement
    const DUREE_MOIS = 84;
    const TAEG_PCT = 5.96;
    const financeTable = {
      2200: { mensu: 31.93, total: 2682.08 },
      2400: { mensu: 34.84, total: 2925.76 },
      2600: { mensu: 37.74, total: 3169.68 },
    };

    // Entrées
    const foyerVal = (document.getElementById("foyer")?.value || "").trim();
    const n = foyerVal === "1-2" ? 2 : foyerVal === "3-4" ? 4 : foyerVal === "5+" ? 5 : 0;
    const peau = !!document.getElementById("peau")?.checked;
    if (!n) {
      alert("Sélectionnez la taille du foyer.");
      document.getElementById("foyer")?.focus();
      return;
    }

    // Hypothèses
    const PRIX_KWH = 0.27,
      ECS_KWH_PP = 800,
      TAUX_GAIN_ECS = 0.1;
    const DEPENSE_PROD_PP = 220,
      TAUX_ECO_PROD = peau ? 0.45 : 0.35;
    const SAVE_MAT_FOYER = 80;

    // Calculs
    const baseProduits = n * DEPENSE_PROD_PP;
    const sProd = Math.round(baseProduits * TAUX_ECO_PROD);
    const sEnergie = Math.round(n * ECS_KWH_PP * PRIX_KWH * TAUX_GAIN_ECS);
    const sMateriel = SAVE_MAT_FOYER;
    const total = sProd + sEnergie + sMateriel;

    const r = 1.05, years = 10;
    const sommeGeo = (Math.pow(r, years) - 1) / (r - 1);
    const total10 = Math.round(sProd * 10 + sMateriel * 10 + sEnergie * sommeGeo);

    // Affichage "Résumé coût"
    const recap = document.getElementById("recap");
    if (recap) recap.style.display = "block";

    const rc = document.getElementById("resume-cout");
    const rcAnnual = document.getElementById("rc-annual");
    const rc10 = document.getElementById("rc-10ans");
    if (rc && rcAnnual && rc10) {
      rcAnnual.textContent = `${total.toLocaleString("fr-FR")} €`;
      rc10.textContent = `${total10.toLocaleString("fr-FR")} €`;
      rc.style.display = "block";
    }

    const valeurs = [sProd, sEnergie, sMateriel];
    ["rc-val-prod", "rc-val-energie", "rc-val-materiel"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = Math.round(valeurs[i]).toLocaleString("fr-FR");
    });

    // Sélection du modèle et tarif
    let modele, tarif;
    if (n <= 2) {
      modele = "Adoucisseur d’eau 10 L de résine";
      tarif = 2200;
    } else if (n <= 4) {
      modele = "Adoucisseur d’eau 15 L de résine";
      tarif = 2400;
    } else {
      modele = "Adoucisseur d’eau 20 L de résine";
      tarif = 2600;
    }

    // Mise à jour bloc produit
    const prod = document.getElementById("prod");
    if (prod) {
      prod.style.display = "block";

      const capSpan = document.getElementById("prod-capacite"); // ex: "10 L"
      const resineSpan = document.getElementById("prod-resine"); // ex: "10"
      const prixSpan = document.getElementById("prod-prix");

      const capL   = (modele.match(/\d+\s?L/) || [""])[0]; // "10 L"|"15 L"|"20 L"
      const capNum = (modele.match(/\d+/)     || [""])[0]; // "10"  |"15"  |"20"

      if (capSpan)    capSpan.textContent = capL;
      if (resineSpan) resineSpan.textContent = capNum;
      if (prixSpan)   prixSpan.textContent = tarif.toLocaleString("fr-FR") + " €";

      // (optionnel) si un id prod-modele existe un jour
      const modSpan = document.getElementById("prod-modele");
      if (modSpan) modSpan.textContent = "Vanne volumétrique Fleck";
    }

    // Bloc "Autofinancement"
    const af = document.getElementById("autofin");
    if (af) {
      const afTotal = document.getElementById("af-total");
      if (afTotal) afTotal.textContent = total.toLocaleString("fr-FR") + " €";

      const fin = financeTable[tarif];
      const elCap = document.getElementById("fin-capital");
      const elMen = document.getElementById("fin-mensu");
      const elDur = document.getElementById("fin-duree");
      const elT = document.getElementById("fin-taeg");
      const elTot = document.getElementById("fin-total");

      if (fin && elCap && elMen && elDur && elT && elTot) {
        const fmt2 = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
        elCap.textContent = tarif.toLocaleString("fr-FR");
        elMen.textContent = fin.mensu.toLocaleString("fr-FR", fmt2);
        elDur.textContent = String(DUREE_MOIS);
        elT.textContent = TAEG_PCT.toLocaleString("fr-FR", fmt2);
        elTot.textContent = fin.total.toLocaleString("fr-FR", fmt2);
      }

      af.style.display = "block";
    }

    // Texte brut (debug/trace)
    const out = document.getElementById("recap-content");
    if (out) {
      const fin = financeTable[tarif], fmt2 = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
      const finBloc = fin
        ? `\nFinancement (facultatif) :\nPour ${tarif.toLocaleString("fr-FR")} €\nMensualité : ${fin.mensu.toLocaleString("fr-FR", fmt2)} € (Hors assurance facultative)\nDurée : ${DUREE_MOIS} mois\nTAEG : ${TAEG_PCT.toLocaleString("fr-FR", fmt2)}%\nMontant total dû (Hors assurance facultative) : ${fin.total.toLocaleString("fr-FR", fmt2)} €\n\nUn crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.\n`
        : "";
      out.textContent =
        `Taille du foyer : ${foyerVal}  (≈ ${n} pers)\n` +
        `Peau sèche : ${peau ? "Oui" : "Non"}\n` +
        `Modèle recommandé : ${modele}\n` +
        `Prix installé & mis en service : ${tarif.toLocaleString("fr-FR")} € TTC\n\n` +
        `Économies Produits : ${sProd.toLocaleString("fr-FR")} € / an\n` +
        `Économies Énergie  : ${sEnergie.toLocaleString("fr-FR")} € / an\n` +
        `Entretien/Matériel : ${sMateriel.toLocaleString("fr-FR")} € / an\n` +
        `--------------------------------------------\n` +
        `TOTAL estimé       : ${total.toLocaleString("fr-FR")} € / an\n` +
        `Projection 10 ans  : ${total10.toLocaleString("fr-FR")} €\n` +
        finBloc +
        `\nNos estimations sont basées sur les consommations moyennes observées en France.`;
    }

    // Masquer les sections marquées après simulation
    document.querySelectorAll('[data-hide-after-sim="1"]').forEach((el) => {
      el.style.display = "none";
    });

    // 👉 Affichage du bandeau téléphone après simulation (si présent dans le HTML)
    const telBanner = document.getElementById("tel-banner");
    if (telBanner) {
      telBanner.classList.add("tel-banner--visible");
      telBanner.setAttribute("aria-hidden", "false");
    }

    // Scroll sur le bloc résultats
    recap?.scrollIntoView({ behavior: "smooth", block: "start" });
  }); // <-- fin du form.addEventListener("submit", ...)
});


/* =========================================================
   Injection — Envoi Google Sheets (simu + unlock + phone)
   ========================================================= */
(function () {
  "use strict";

  const ENDPOINT = "https://script.google.com/macros/s/AKfycbyHYz40LwNcC0lYeymn_93CLK-LBfObF6reZPSjWLH4QDlzUb4dnkfpIkg1lWCTtTwL/exec";
  const SOURCE = "LP Adoucisseur";

  function getUtmParams() {
    const params = new URLSearchParams(location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_term: params.get("utm_term") || "",
    };
  }
  function commonMeta() {
    return { pageUrl: location.href, ua: navigator.userAgent || "" };
  }

  function computeSnapshot() {
    const foyerVal = (document.getElementById("foyer")?.value || "").trim();
    const n = foyerVal === "1-2" ? 2 : foyerVal === "3-4" ? 4 : foyerVal === "5+" ? 5 : 0;
    const peau = !!document.getElementById("peau")?.checked;
    if (!n) return null;

    const PRIX_KWH = 0.27, ECS_KWH_PP = 800, TAUX_GAIN_ECS = 0.1;
    const DEPENSE_PROD_PP = 220, TAUX_ECO_PROD = peau ? 0.45 : 0.35;
    const SAVE_MAT_FOYER = 80;

    const baseProduits = n * DEPENSE_PROD_PP;
    const sProd = Math.round(baseProduits * TAUX_ECO_PROD);
    const sEnergie = Math.round(n * ECS_KWH_PP * PRIX_KWH * TAUX_GAIN_ECS);
    const sMateriel = SAVE_MAT_FOYER;
    const total = sProd + sEnergie + sMateriel;

    const r = 1.05, years = 10;
    const sommeGeo = (Math.pow(r, years) - 1) / (r - 1);
    const total10 = Math.round(sProd * 10 + sMateriel * 10 + sEnergie * sommeGeo);

    let modele, tarif;
    if (n <= 2) {
      modele = "Adoucisseur d’eau 10 L de résine";
      tarif = 2200;
    } else if (n <= 4) {
      modele = "Adoucisseur d’eau 15 L de résine";
      tarif = 2400;
    } else {
      modele = "Adoucisseur d’eau 20 L de résine";
      tarif = 2600;
    }

    return { foyerVal, peau, annual: total, tenYears: total10, model: modele, price: tarif };
  }

  async function postLead(payload) {
    try {
      const fd = new FormData();
      fd.append("phase", payload.phase || "simu");
      fd.append("source", SOURCE);
      fd.append("foyer", payload.foyer ?? "");
      fd.append("peau_seche", payload.peau_seche ?? "");
      fd.append("annual", payload.annual ?? "");
      fd.append("tenYears", payload.tenYears ?? "");
      fd.append("model", payload.model ?? "");
      fd.append("price", payload.price ?? "");
      fd.append("email", payload.email ?? "");
      fd.append("phone", payload.phone ?? "");
      fd.append("pageUrl", payload.pageUrl ?? "");
      fd.append("ua", payload.ua ?? "");
      fd.append("utm_source", payload.utm_source ?? "");
      fd.append("utm_campaign", payload.utm_campaign ?? "");
      fd.append("utm_term", payload.utm_term ?? "");
      await fetch(ENDPOINT, { method: "POST", body: fd, mode: "no-cors" });
    } catch (err) {
      console.warn("⚠️ Envoi Sheets échoué:", err);
    }
  }

  // Hook simulation
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-estimation");
    if (!form) return;

    form.addEventListener("submit", function () {
      setTimeout(() => {
        const snap = computeSnapshot();
        if (!snap) return;
        const utm = getUtmParams();
        const meta = commonMeta();
        postLead({
          phase: "simu",
          foyer: snap.foyerVal,
          peau_seche: snap.peau ? "1" : "0",
          annual: String(snap.annual),
          tenYears: String(snap.tenYears),
          model: snap.model,
          price: String(snap.price),
          email: "",
          phone: "",
          ...meta,
          ...utm,
        });
      }, 0);
    });
  });

  // Hook déverrouillage (si le gate existe encore dans le HTML)
  document.addEventListener("DOMContentLoaded", function () {
    const gform = document.getElementById("gate-form");
    if (!gform) return;

    gform.addEventListener("submit", function () {
      setTimeout(() => {
        const snap = computeSnapshot();
        const email = (document.getElementById("gate-email")?.value || "").trim();
        const phone = (document.getElementById("gate-phone")?.value || "").trim();
        if (!snap) return;

        const utm = getUtmParams();
        const meta = commonMeta();

        postLead({
          phase: "unlock",
          foyer: snap.foyerVal,
          peau_seche: snap.peau ? "1" : "0",
          annual: String(snap.annual),
          tenYears: String(snap.tenYears),
          model: snap.model,
          price: String(snap.price),
          email,
          phone,
          ...meta,
          ...utm,
        });
      }, 0);
    });
  });

// Hook bandeau téléphone (petit bandeau en bas de résultats)
document.addEventListener("DOMContentLoaded", function () {
  const bannerForm = document.getElementById("tel-banner-form");
  if (!bannerForm) return;

  const phoneInput = document.getElementById("tel-banner-input");

  // 👉 FORMATAGE EN TEMPS RÉEL DU NUMÉRO (00 00 00 00 00)
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let v = phoneInput.value.replace(/\D/g, "");   // on garde uniquement les chiffres
      v = v.substring(0, 10);                        // max 10 chiffres
      let formatted = v.replace(/(\d{2})(?=\d)/g, "$1 ");
      phoneInput.value = formatted.trim();
    });
  }

  // 👉 SUBMIT DU BANDEAU
  bannerForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!phoneInput) return;

    const brut = (phoneInput.value || "").trim();
    const cleaned = brut.replace(/[^0-9]/g, ""); // on enlève les espaces
    const pattern = /^0[0-9]{9}$/;               // 0 + 9 chiffres

    if (!pattern.test(cleaned)) {
      alert("Merci de saisir un numéro de téléphone valide (ex : 06 12 34 56 78).");
      phoneInput.focus();
      return;
    }

    const snap = computeSnapshot();
    if (!snap) return;

    const utm = getUtmParams();
    const meta = commonMeta();

    postLead({
      phase: "phone",
      foyer: snap.foyerVal,
      peau_seche: snap.peau ? "1" : "0",
      annual: String(snap.annual),
      tenYears: String(snap.tenYears),
      model: snap.model,
      price: String(snap.price),
      email: "",
      phone: cleaned,          // numéro SANS espaces envoyé au Sheets
      ...meta,
      ...utm,
    });

   // Feedback interface
phoneInput.disabled = true;
if (ev.submitter) {
  ev.submitter.disabled = true;
  ev.submitter.textContent = "Merci ! Nous vous envoyons un SMS dans un instant.";
}

});
});
})();
/* Gestion des étapes du simulateur PAC */
/* Gestion des étapes du simulateur PAC */
/* Gestion des étapes du simulateur PAC */
document.addEventListener('DOMContentLoaded', function () {
  const steps = Array.from(document.querySelectorAll('#simulateur .card-step'));
  if (!steps.length) return;

  const total      = steps.length;
  const spanCurrent = document.getElementById('step-current');
  const spanTotal   = document.getElementById('step-total');
  const bar         = document.getElementById('step-bar');
  const btnPrev     = document.getElementById('step-prev');
  const btnNext     = document.getElementById('step-next');
  const form        = document.getElementById('form-estimation');

  if (spanTotal) spanTotal.textContent = String(total);

  let currentIndex = 0;

  function showStep(index) {
    steps.forEach((step, i) => {
      step.style.display = (i === index) ? 'block' : 'none';
    });
    currentIndex = index;

    // Texte étape
    if (spanCurrent) spanCurrent.textContent = String(currentIndex + 1);

    // Barre de progression
    if (bar) {
      const pct = Math.min(100, ((currentIndex + 1) / total) * 100);
      bar.style.width = pct + '%';
    }

    // Boutons
    if (btnPrev) {
      btnPrev.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
    }
    if (btnNext) {
      btnNext.textContent = (currentIndex === total - 1)
        ? 'Afficher mon reste à charge'
        : 'Suivant';
    }
  }

  function isCurrentStepValid() {
    const stepEl = steps[currentIndex];
    if (!stepEl) return true;
    const fields = stepEl.querySelectorAll('input, select, textarea');
    for (const field of fields) {
      if (field.hasAttribute('required') && !field.checkValidity()) {
        field.reportValidity();
        return false;
      }
    }
    return true;
  }

  showStep(0);

  if (btnNext) {
    btnNext.addEventListener('click', function () {
      if (!isCurrentStepValid()) return;

      if (currentIndex < total - 1) {
        showStep(currentIndex + 1);
      } else {
        if (form) {
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', function () {
      if (currentIndex > 0) showStep(currentIndex - 1);
    });
  }
});


