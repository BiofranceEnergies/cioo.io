document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'bilan_technique_pp_autosave_v1';

  const formContainer = document.getElementById('form-container');
  const vendeursList = document.getElementById('vendeurs-list');
  const btnAddVendeur = document.getElementById('btn-add-vendeur');
  const toggleSci = document.getElementById('toggle-sci');
  const blockSci = document.getElementById('block-sci');
  const togglePiscine = document.getElementById('toggle-piscine');
  const blockPiscine = document.getElementById('block-piscine');
  const agencesTbody = document.getElementById('agences-tbody');
  const btnAddAgence = document.getElementById('btn-add-agence');
  const parcellesTbody = document.getElementById('parcelles-tbody');
  const btnAddParcelle = document.getElementById('btn-add-parcelle');
  const piecesTbody = document.getElementById('pieces-tbody');
  const btnAddPiece = document.getElementById('btn-add-piece');
  const mobilierTbody = document.getElementById('mobilier-tbody');
  const btnAddMobilier = document.getElementById('btn-add-mobilier');

  // Éléments Mode Lecture & Export HTML autonome
  const btnToggleReadonly = document.getElementById('btn-toggle-readonly');
  const btnExportHtml = document.getElementById('btn-export-html');

  // Éléments vignette photo & liens couverture
  const inputPhoto = document.getElementById('input-photo');
  const photoPreview = document.getElementById('photo-preview');
  const photoPlaceholder = document.getElementById('photo-placeholder');
  const btnRemovePhoto = document.getElementById('btn-remove-photo');
  const inputLienNotaires = document.getElementById('input-lien-notaires');
  const linkNotairesView = document.getElementById('link-notaires-view');
  const inputLienYoutube = document.getElementById('input-lien-youtube');
  const linkYoutubeView = document.getElementById('link-youtube-view');
  const inputLienAnnonce = document.getElementById('input-lien-annonce');
  const linkAnnonceView = document.getElementById('link-annonce-view');

  let photoDataUrl = '';
  let vendeurCount = 1;
  let isRestoring = false;

  // --- MODE LECTURE ÉCRAN ---
  function setReadOnlyMode(enabled) {
    document.body.classList.toggle('readonly-mode', enabled);

    formContainer.querySelectorAll('input, select, textarea').forEach((el) => {
      if (enabled) {
        el.setAttribute('readonly', 'readonly');
        if (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'date') {
          el.disabled = true;
        }
      } else {
        el.removeAttribute('readonly');
        el.disabled = false;
      }
    });

    if (btnToggleReadonly) {
      btnToggleReadonly.textContent = enabled ? '✏️ Mode Édition' : '👁️ Mode Lecture';
      btnToggleReadonly.classList.toggle('btn-active-mode', enabled);
    }
  }

  btnToggleReadonly.addEventListener('click', () => {
    const nextState = !document.body.classList.contains('readonly-mode');
    setReadOnlyMode(nextState);
  });

  // --- EXPORT FICHE HTML AUTONOME EN LECTURE SEULE (AVEC PHOTO & CSS INTÉGRÉS) ---
  btnExportHtml.addEventListener('click', async () => {
    let cssText = '';
    try {
      const resp = await fetch('style.css');
      if (resp.ok) cssText = await resp.text();
    } catch (e) {
      // Fallback via feuilles de style chargées
    }
    if (!cssText) {
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          Array.from(sheet.cssRules).forEach((rule) => {
            cssText += rule.cssText + '\n';
          });
        } catch (err) {}
      });
    }

    // Clone du formulaire avec toutes les valeurs figurées dans les attributs HTML
    const clone = formContainer.cloneNode(true);
    const origInputs = formContainer.querySelectorAll('input, select, textarea');
    const cloneInputs = clone.querySelectorAll('input, select, textarea');

    origInputs.forEach((orig, i) => {
      const target = cloneInputs[i];
      if (!target) return;
      if (orig.type === 'checkbox' || orig.type === 'radio') {
        if (orig.checked) target.setAttribute('checked', 'checked');
        else target.removeAttribute('checked');
        target.setAttribute('disabled', 'disabled');
      } else if (orig.tagName === 'SELECT') {
        Array.from(target.options).forEach((opt, idx) => {
          if (idx === orig.selectedIndex) opt.setAttribute('selected', 'selected');
          else opt.removeAttribute('selected');
        });
        target.setAttribute('disabled', 'disabled');
      } else if (orig.tagName === 'TEXTAREA') {
        target.textContent = orig.value;
        target.setAttribute('readonly', 'readonly');
      } else {
        target.setAttribute('value', orig.value);
        target.setAttribute('readonly', 'readonly');
      }
    });

    // Supprime tous les éléments d'édition (.no-print) du clone
    clone.querySelectorAll('.no-print').forEach((el) => el.remove());

    const nomVendeur = (document.querySelector('[name="contact_nom"]').value || 'client')
      .trim()
      .replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);

    const standaloneHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fiche Technique — ${nomVendeur} | Propriétés-Privées.com</title>
  <style>${cssText}</style>
</head>
<body class="readonly-mode standalone-export">
  ${clone.outerHTML}
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Fiche_Technique_PP_${nomVendeur}_${dateStr}.html`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // --- FONCTIONS CENTRALES DE COLLECTE & RESTAURATION DES DONNÉES ---
  function collectFormData() {
    const data = {
      meta: {
        vendeursCount: document.querySelectorAll('.vendeur-block').length,
        hasSci: toggleSci.checked,
        hasPiscine: togglePiscine.checked,
        photoDataUrl: photoDataUrl
      },
      fields: {},
      agences: [],
      parcelles: [],
      pieces: [],
      mobilier: []
    };

    formContainer.querySelectorAll('input, select, textarea').forEach((el) => {
      if (!el.name || el.name.endsWith('[]')) return;
      if (el.type === 'checkbox') {
        data.fields[el.name] = el.checked;
      } else {
        data.fields[el.name] = el.value;
      }
    });

    agencesTbody.querySelectorAll('tr').forEach((tr) => {
      data.agences.push({
        nom: tr.querySelector('[name="ag_nom[]"]').value,
        depuis: tr.querySelector('[name="ag_depuis[]"]').value,
        prix: tr.querySelector('[name="ag_prix[]"]').value,
        obs: tr.querySelector('[name="ag_obs[]"]').value
      });
    });

    parcellesTbody.querySelectorAll('tr').forEach((tr) => {
      data.parcelles.push({
        commune: tr.querySelector('[name="cad_commune[]"]').value,
        section: tr.querySelector('[name="cad_section[]"]').value,
        num: tr.querySelector('[name="cad_num[]"]').value,
        surf: tr.querySelector('[name="cad_surf[]"]').value,
        nature: tr.querySelector('[name="cad_nature[]"]').value
      });
    });

    piecesTbody.querySelectorAll('tr').forEach((tr) => {
      data.pieces.push({
        niv: tr.querySelector('[name="p_niv[]"]').value,
        nom: tr.querySelector('[name="p_nom[]"]').value,
        hab: tr.querySelector('[name="p_hab[]"]').value,
        ann: tr.querySelector('[name="p_ann[]"]').value,
        ori: tr.querySelector('[name="p_ori[]"]').value,
        obs: tr.querySelector('[name="p_obs[]"]').value
      });
    });

    mobilierTbody.querySelectorAll('tr').forEach((tr) => {
      data.mobilier.push({
        nom: tr.querySelector('[name="mob_nom[]"]').value,
        detail: tr.querySelector('[name="mob_detail[]"]').value,
        etat: tr.querySelector('[name="mob_etat[]"]').value,
        val: tr.querySelector('[name="mob_val[]"]').value
      });
    });

    return data;
  }

  function saveAutoDraft() {
    if (isRestoring) return;
    try {
      const data = collectFormData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      // Ignore si quota localStorage atteint
    }
  }

  function applyFormData(data) {
    if (!data || typeof data !== 'object') return;
    isRestoring = true;
    try {
      document.querySelectorAll('.vendeur-block').forEach((b, idx) => {
        if (idx > 0) b.remove();
      });
      const targetVendeurs = (data.meta && data.meta.vendeursCount) || 1;
      for (let i = 2; i <= targetVendeurs; i++) {
        vendeursList.appendChild(createVendeurBlock(i));
      }
      vendeurCount = document.querySelectorAll('.vendeur-block').length;

      toggleSci.checked = !!(data.meta && data.meta.hasSci);
      blockSci.classList.toggle('hidden-block', !toggleSci.checked);
      togglePiscine.checked = !!(data.meta && data.meta.hasPiscine);
      blockPiscine.classList.toggle('hidden-block', !togglePiscine.checked);
      setPhoto((data.meta && data.meta.photoDataUrl) || '');

      if (data.fields) {
        Object.entries(data.fields).forEach(([name, val]) => {
          const el = formContainer.querySelector(`[name="${name}"]`);
          if (!el) return;
          if (el.type === 'checkbox') {
            el.checked = !!val;
          } else {
            el.value = val;
          }
        });
      }

      syncQuickLink(inputLienNotaires, linkNotairesView, 'Ouvrir Dossier Notaires');
      syncQuickLink(inputLienYoutube, linkYoutubeView, 'Voir Vidéo YouTube');
      syncQuickLink(inputLienAnnonce, linkAnnonceView, "Voir l'annonce en ligne");

      if (Array.isArray(data.agences) && data.agences.length > 0) {
        agencesTbody.innerHTML = '';
        data.agences.forEach((ag) => addAgenceRow(ag));
      }

      if (Array.isArray(data.parcelles) && data.parcelles.length > 0) {
        parcellesTbody.innerHTML = '';
        data.parcelles.forEach((cad) => addParcelleRow(cad));
        recalculateCadastre();
      }

      if (Array.isArray(data.pieces)) {
        piecesTbody.innerHTML = '';
        data.pieces.forEach((p) => addPieceRow(p));
        recalculateSurfaces();
      }

      if (Array.isArray(data.mobilier) && data.mobilier.length > 0) {
        mobilierTbody.innerHTML = '';
        data.mobilier.forEach((m) => addMobilierRow(m));
        recalculateMobilier();
      }
    } finally {
      isRestoring = false;
    }
  }

  // 0. Gestion de la vignette photo & des liens
  function setPhoto(dataUrl) {
    photoDataUrl = dataUrl || '';
    if (photoDataUrl) {
      photoPreview.src = photoDataUrl;
      photoPreview.classList.remove('hidden-block');
      photoPlaceholder.classList.add('hidden-block');
      btnRemovePhoto.classList.remove('hidden-block');
    } else {
      photoPreview.src = '';
      photoPreview.classList.add('hidden-block');
      photoPlaceholder.classList.remove('hidden-block');
      btnRemovePhoto.classList.add('hidden-block');
    }
    saveAutoDraft();
  }

  inputPhoto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 640;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  btnRemovePhoto.addEventListener('click', () => setPhoto(''));

  function syncQuickLink(inputEl, anchorEl, labelText) {
    const url = (inputEl.value || '').trim();
    if (url) {
      anchorEl.href = url.startsWith('http') ? url : 'https://' + url;
      anchorEl.textContent = `${labelText} (${url}) ↗`;
      anchorEl.classList.remove('hidden-block');
    } else {
      anchorEl.href = '#';
      anchorEl.classList.add('hidden-block');
    }
  }

  inputLienNotaires.addEventListener('input', () =>
    syncQuickLink(inputLienNotaires, linkNotairesView, 'Ouvrir Dossier Notaires')
  );
  inputLienYoutube.addEventListener('input', () =>
    syncQuickLink(inputLienYoutube, linkYoutubeView, 'Voir Vidéo YouTube')
  );
  inputLienAnnonce.addEventListener('input', () =>
    syncQuickLink(inputLienAnnonce, linkAnnonceView, "Voir l'annonce en ligne")
  );

  // 1. Gestion des vendeurs supplémentaires (2 à 6)
  function createVendeurBlock(num) {
    const div = document.createElement('div');
    div.className = 'sub-block vendeur-block';
    div.dataset.vendeur = num;
    div.innerHTML = `
      <h3>
        <span>Vendeur ${num}</span>
        <button type="button" class="btn-del-row no-print" title="Retirer ce vendeur">Retirer ×</button>
      </h3>
      <div class="check-row">
        <strong>Qualité :</strong>
        <label><input type="checkbox" name="v${num}_qual_pp"> Pleine propriété</label>
        <label><input type="checkbox" name="v${num}_qual_ind"> Indivision</label>
        <label><input type="checkbox" name="v${num}_qual_succ"> Succession</label>
        <label><input type="checkbox" name="v${num}_qual_np"> Nue-propriété</label>
        <label><input type="checkbox" name="v${num}_qual_usu"> Usufruitier</label>
        <label>Autre : <input type="text" name="v${num}_qual_autre" class="inline-input"></label>
      </div>
      <div class="grid-4 mt-1">
        <div class="field"><label>Nom</label><input type="text" name="v${num}_nom"></div>
        <div class="field"><label>Prénoms</label><input type="text" name="v${num}_prenoms"></div>
        <div class="field"><label>Date de naissance</label><input type="date" name="v${num}_ddn"></div>
        <div class="field"><label>Lieu de naissance</label><input type="text" name="v${num}_ldn"></div>
        <div class="field col-span-2"><label>Adresse</label><input type="text" name="v${num}_adresse"></div>
        <div class="field"><label>Code postal</label><input type="text" name="v${num}_cp"></div>
        <div class="field"><label>Ville</label><input type="text" name="v${num}_ville"></div>
        <div class="field"><label>Téléphone / Portable</label><input type="tel" name="v${num}_port"></div>
        <div class="field"><label>E-mail</label><input type="email" name="v${num}_email"></div>
        <div class="field"><label>Nationalité &amp; Profession</label><input type="text" name="v${num}_nat_prof"></div>
        <div class="field"><label>État civil &amp; Régime</label><input type="text" name="v${num}_ec_regime" placeholder="Marié(e), Pacsé(e), Célibataire..."></div>
      </div>
    `;
    div.querySelector('.btn-del-row').addEventListener('click', () => {
      div.remove();
      vendeurCount = document.querySelectorAll('.vendeur-block').length;
      saveAutoDraft();
    });
    return div;
  }

  btnAddVendeur.addEventListener('click', () => {
    const currentBlocks = document.querySelectorAll('.vendeur-block').length;
    if (currentBlocks >= 6) {
      alert('Maximum 6 vendeurs atteint.');
      return;
    }
    vendeurCount = currentBlocks + 1;
    vendeursList.appendChild(createVendeurBlock(vendeurCount));
    saveAutoDraft();
  });

  // 2. Affichage / Masquage SCI et Piscine
  toggleSci.addEventListener('change', (e) => {
    blockSci.classList.toggle('hidden-block', !e.target.checked);
    saveAutoDraft();
  });

  togglePiscine.addEventListener('change', (e) => {
    blockPiscine.classList.toggle('hidden-block', !e.target.checked);
    saveAutoDraft();
  });

  // 3. Tableau dynamique des agences / commercialisation actuelle
  function addAgenceRow(data = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" name="ag_nom[]" value="${data.nom || ''}" placeholder="Agence / Support..."></td>
      <td><input type="date" name="ag_depuis[]" value="${data.depuis || ''}"></td>
      <td><input type="number" step="500" name="ag_prix[]" value="${data.prix || ''}" placeholder="0"></td>
      <td><input type="text" name="ag_obs[]" value="${data.obs || ''}" placeholder="Mandat simple, observations..."></td>
      <td class="no-print"><button type="button" class="btn-del-row" title="Supprimer">×</button></td>
    `;
    agencesTbody.appendChild(tr);
  }

  btnAddAgence.addEventListener('click', () => {
    addAgenceRow();
    saveAutoDraft();
  });

  agencesTbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-del-row')) {
      if (agencesTbody.querySelectorAll('tr').length > 1) {
        e.target.closest('tr').remove();
        saveAutoDraft();
      }
    }
  });

  // 4. Tableau dynamique des parcelles cadastrales & calcul m² / ha
  function recalculateCadastre() {
    let totalM2 = 0;
    document.querySelectorAll('.calc-cad').forEach((inp) => {
      const val = parseFloat(inp.value);
      if (!isNaN(val) && val > 0) totalM2 += val;
    });

    document.getElementById('total-cad-m2').textContent =
      Math.round(totalM2).toLocaleString('fr-FR') + ' m²';

    const ha = Math.floor(totalM2 / 10000);
    const resteHa = Math.round(totalM2) % 10000;
    const ares = Math.floor(resteHa / 100);
    const ca = resteHa % 100;
    const pad = (n) => String(n).padStart(2, '0');
    document.getElementById('total-cad-ha').textContent =
      `${ha} ha ${pad(ares)} a ${pad(ca)} ca`;
  }

  function addParcelleRow(data = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" name="cad_commune[]" value="${data.commune || ''}" placeholder="Commune"></td>
      <td><input type="text" name="cad_section[]" value="${data.section || ''}" placeholder="Section"></td>
      <td><input type="text" name="cad_num[]" value="${data.num || ''}" placeholder="N°"></td>
      <td><input type="number" step="1" name="cad_surf[]" class="calc-cad" value="${data.surf || ''}" placeholder="0"></td>
      <td><input type="text" name="cad_nature[]" value="${data.nature || ''}" placeholder="Jardin, bois, prairie..."></td>
      <td class="no-print"><button type="button" class="btn-del-row" title="Supprimer">×</button></td>
    `;
    parcellesTbody.appendChild(tr);
  }

  btnAddParcelle.addEventListener('click', () => {
    const firstCommune = parcellesTbody.querySelector('[name="cad_commune[]"]');
    addParcelleRow({ commune: firstCommune ? firstCommune.value : '' });
    saveAutoDraft();
  });

  parcellesTbody.addEventListener('input', (e) => {
    if (e.target.classList.contains('calc-cad')) {
      recalculateCadastre();
    }
  });

  parcellesTbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-del-row')) {
      if (parcellesTbody.querySelectorAll('tr').length > 1) {
        e.target.closest('tr').remove();
        recalculateCadastre();
        saveAutoDraft();
      }
    }
  });

  // 5. Tableau dynamique des pièces & calcul automatique des surfaces
  function recalculateSurfaces() {
    let sumHab = 0;
    let sumAnn = 0;
    document.querySelectorAll('.calc-hab').forEach((inp) => {
      const val = parseFloat(inp.value);
      if (!isNaN(val)) sumHab += val;
    });
    document.querySelectorAll('.calc-ann').forEach((inp) => {
      const val = parseFloat(inp.value);
      if (!isNaN(val)) sumAnn += val;
    });
    document.getElementById('total-hab').textContent = sumHab.toFixed(1).replace('.', ',') + ' m²';
    document.getElementById('total-ann').textContent = sumAnn.toFixed(1).replace('.', ',') + ' m²';
  }

  function addPieceRow(data = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" name="p_niv[]" value="${data.niv || ''}" placeholder="RDC / Étage"></td>
      <td><input type="text" name="p_nom[]" value="${data.nom || ''}" placeholder="Nom pièce"></td>
      <td><input type="number" step="0.1" name="p_hab[]" class="calc-hab" value="${data.hab || ''}"></td>
      <td><input type="number" step="0.1" name="p_ann[]" class="calc-ann" value="${data.ann || ''}"></td>
      <td><input type="text" name="p_ori[]" value="${data.ori || ''}"></td>
      <td><input type="text" name="p_obs[]" value="${data.obs || ''}"></td>
      <td class="no-print"><button type="button" class="btn-del-row" title="Supprimer">×</button></td>
    `;
    piecesTbody.appendChild(tr);
  }

  btnAddPiece.addEventListener('click', () => {
    addPieceRow();
    saveAutoDraft();
  });

  piecesTbody.addEventListener('input', (e) => {
    if (e.target.classList.contains('calc-hab') || e.target.classList.contains('calc-ann')) {
      recalculateSurfaces();
    }
  });

  piecesTbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-del-row')) {
      e.target.closest('tr').remove();
      recalculateSurfaces();
      saveAutoDraft();
    }
  });

  // 6. Tableau dynamique du mobilier & équipements laissés par le vendeur
  function recalculateMobilier() {
    let totalMob = 0;
    document.querySelectorAll('.calc-mob').forEach((inp) => {
      const val = parseFloat(inp.value);
      if (!isNaN(val) && val > 0) totalMob += val;
    });
    document.getElementById('total-mob').textContent =
      Math.round(totalMob).toLocaleString('fr-FR') + ' €';
  }

  function addMobilierRow(data = {}) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" name="mob_nom[]" value="${data.nom || ''}" placeholder="Élément laissé..."></td>
      <td><input type="text" name="mob_detail[]" value="${data.detail || ''}" placeholder="Marque, précision..."></td>
      <td><input type="text" name="mob_etat[]" value="${data.etat || ''}" placeholder="Bon état / Année"></td>
      <td><input type="number" step="10" name="mob_val[]" class="calc-mob" value="${data.val || ''}" placeholder="0"></td>
      <td class="no-print"><button type="button" class="btn-del-row" title="Supprimer">×</button></td>
    `;
    mobilierTbody.appendChild(tr);
  }

  btnAddMobilier.addEventListener('click', () => {
    addMobilierRow();
    saveAutoDraft();
  });

  mobilierTbody.addEventListener('input', (e) => {
    if (e.target.classList.contains('calc-mob')) {
      recalculateMobilier();
    }
  });

  mobilierTbody.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-del-row')) {
      if (mobilierTbody.querySelectorAll('tr').length > 1) {
        e.target.closest('tr').remove();
        recalculateMobilier();
        saveAutoDraft();
      }
    }
  });

  // 7. Sauvegarde automatique continue à chaque modification
  formContainer.addEventListener('input', saveAutoDraft);
  formContainer.addEventListener('change', saveAutoDraft);

  // 8. Sauvegarde & Chargement JSON manuel (pour archiver/reprendre un dossier sur Drive)
  document.getElementById('btn-save-json').addEventListener('click', () => {
    const data = collectFormData();
    const nomVendeur = (data.fields.contact_nom || 'client').trim().replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bilan_Technique_PP_${nomVendeur}_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('input-load-json').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        applyFormData(data);
        saveAutoDraft();
      } catch (err) {
        alert('Fichier JSON invalide ou corrompu.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // 9. Réinitialiser (vide aussi le brouillon localStorage) & Exporter PDF
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Vider toutes les informations saisies pour démarrer un nouveau dossier vierge ?')) {
      localStorage.removeItem(STORAGE_KEY);
      if (document.body.classList.contains('readonly-mode')) {
        setReadOnlyMode(false);
      }
      formContainer.querySelectorAll('input, select, textarea').forEach((el) => {
        if (el.type === 'checkbox') el.checked = false;
        else if (el.name !== 'sci_type') el.value = '';
      });
      setPhoto('');
      syncQuickLink(inputLienNotaires, linkNotairesView, 'Ouvrir Dossier Notaires');
      syncQuickLink(inputLienYoutube, linkYoutubeView, 'Voir Vidéo YouTube');
      syncQuickLink(inputLienAnnonce, linkAnnonceView, "Voir l'annonce en ligne");
      recalculateCadastre();
      recalculateSurfaces();
      recalculateMobilier();
    }
  });

  document.getElementById('btn-print').addEventListener('click', () => {
    window.print();
  });

  // 10. Restauration automatique au chargement de la page s'il existe un brouillon en cours
  try {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      applyFormData(JSON.parse(savedDraft));
    }
  } catch (err) {
    // Ignore si localStorage vide ou corrompu
  }
});
