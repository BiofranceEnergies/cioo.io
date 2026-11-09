document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION COMMUNE NTFY ---
    const NTFY_TOPIC = "lp-visite-sylvain-982";


    // --- 0. NOTIFICATION NTFY DE VISITE (SANS FORMULAIRE) ---
    if (!sessionStorage.getItem('ntfy_visit_sent')) {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = document.referrer;
        let provenance = "Direct";

        if (urlParams.has('gclid')) {
            provenance = "Google Ads (Campagne payante)";
        } else if (urlParams.get('source') === 'fiche-google' || urlParams.get('utm_source') === 'google_business') {
            provenance = "Fiche Google Établissement";
        } else if (ref && ref.includes('google.')) {
            provenance = "Google (Recherche / Maps)";
        } else if (ref) {
            provenance = `Lien externe : ${ref}`;
        }

        const messageVisite = `Visiteur sur la LP Nontron (${provenance})`;

        fetch(`https://ntfy.sh/${NTFY_TOPIC}/publish?title=${encodeURIComponent("👀 Visiteur sur la LP")}&message=${encodeURIComponent(messageVisite)}&tags=eyes`, {
            method: 'GET',
            mode: 'no-cors'
        })
        .then(() => {
            sessionStorage.setItem('ntfy_visit_sent', 'true');
        })
        .catch(err => console.error("Erreur ntfy visite:", err));
    }


    // --- 1. ANIMATIONS AU SCROLL ---
    const elementsToAnimate = document.querySelectorAll('.anim');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elementsToAnimate.forEach(el => observer.observe(el));


    // --- 2. LECTURE VIDÉO IMMERSION (SMARTPHONE) ---
    const bgVideo = document.querySelector('.header-bg-video');
    if (bgVideo && bgVideo.tagName === 'VIDEO') {
        bgVideo.muted = true;
        bgVideo.play().catch(() => {
            const startOnInteraction = () => {
                bgVideo.play();
                window.removeEventListener('click', startOnInteraction);
                window.removeEventListener('touchstart', startOnInteraction);
            };
            window.addEventListener('click', startOnInteraction);
            window.addEventListener('touchstart', startOnInteraction);
        });
    }


    // --- 3. GESTION COOKIES RGPD ---
    const cookieBanner = document.getElementById('cookie-banner') || document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookie-accept') || document.getElementById('cookieAccept');
    const rejectBtn = document.getElementById('cookie-reject') || document.getElementById('cookieRefuse');

    function updateConsent(granted) {
        const status = granted ? 'granted' : 'denied';

        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                'ad_storage': status,
                'ad_user_data': status,
                'ad_personalization': status,
                'analytics_storage': status
            });
        }

        if (cookieBanner) {
            cookieBanner.classList.remove('show');
        }

        localStorage.setItem('cookieConsent', granted ? 'accepted' : 'rejected');
    }

    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent === 'accepted') {
        updateConsent(true);
    } else if (savedConsent === 'rejected') {
        // Bloqué par défaut
    } else {
        setTimeout(() => {
            if (cookieBanner) cookieBanner.classList.add('show');
        }, 1000);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => updateConsent(true));
    }
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => updateConsent(false));
    }


    // --- 4. GESTION MODALE VIDÉO MÉTHODE (50 SECONDES) ---
    const videoModal = document.getElementById("video-modal") || document.getElementById("videoModal");
    const openVideoBtn = document.getElementById("open-video-btn") || document.getElementById("openVideoBtn");
    const closeVideoBtn = document.getElementById("close-video") || document.getElementById("closeVideoBtn");
    const youtubePlayer = document.getElementById("youtube-player") || document.getElementById("videoIframe");
    const videoUrl = "https://www.youtube.com/embed/ePCvHf_q9JE?autoplay=1";

    if (openVideoBtn && videoModal && youtubePlayer) {
        openVideoBtn.addEventListener("click", (e) => {
            e.preventDefault();
            youtubePlayer.src = videoUrl;
            videoModal.style.display = "block";
        });

        const stopAndCloseVideo = () => {
            videoModal.style.display = "none";
            youtubePlayer.src = "";
        };

        if (closeVideoBtn) {
            closeVideoBtn.addEventListener("click", stopAndCloseVideo);
        }

        window.addEventListener("click", (event) => {
            if (event.target === videoModal) stopAndCloseVideo();
        });
    }


    // --- 5. GESTION MENTIONS LÉGALES ---
    const legalModal = document.getElementById("legal-modal") || document.getElementById("legalModal");
    const openLegalBtn = document.getElementById("open-legal") || document.getElementById("openModalBtn");
    const closeLegalBtn = legalModal ? (legalModal.querySelector(".close-btn") || document.getElementById("closeModalBtn")) : null;

    if (openLegalBtn && legalModal) {
        openLegalBtn.addEventListener("click", (e) => {
            e.preventDefault();
            legalModal.style.display = "block";
        });
    }
    if (closeLegalBtn && legalModal) {
        closeLegalBtn.addEventListener("click", () => {
            legalModal.style.display = "none";
        });
    }
    window.addEventListener("click", (event) => {
        if (event.target === legalModal) legalModal.style.display = "none";
    });


    // --- 6. MODULE ESTIMATION EN DIRECT (TUNNEL 2 ÉTAPES & NTFY) ---
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const stepResult = document.getElementById('step-result');

    const btnToStep2 = document.getElementById('btn-to-step-2');
    const btnBackToStep1 = document.getElementById('btn-back-to-step-1');
    const btnSubmit = document.getElementById('btn-submit-estimation');

    const communeInput = document.getElementById('commune');
    const surfaceInput = document.getElementById('surface_hab');
    const terrainSelect = document.getElementById('surface_terrain');
    const typeHidden = document.getElementById('type_bien');
    const etatHidden = document.getElementById('etat_bien');

    const addressInput = document.getElementById('address_input');
    const addressDropdown = document.getElementById('address-suggestions');
    const nameInput = document.getElementById('client_name');
    const phoneInputStep2 = document.getElementById('client_phone');
    const summaryText = document.getElementById('summary-text');

    // 6.1 Gestion des boutons pilules (Pill-buttons)
    function setupPillGroup(groupId, hiddenInputId) {
        const group = document.getElementById(groupId);
        if (!group) return;
        const buttons = group.querySelectorAll('.pill-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                const target = document.getElementById(hiddenInputId);
                if (target) target.value = btn.dataset.value;
            });
        });
    }
    setupPillGroup('typeBienGroup', 'type_bien');
    setupPillGroup('etatBienGroup', 'etat_bien');

    // 6.2 Étape 1 -> Étape 2
    if (btnToStep2) {
        btnToStep2.addEventListener('click', () => {
            const commune = communeInput ? communeInput.value.trim() : '';
            const surface = surfaceInput ? surfaceInput.value.trim() : '';

            if (!commune) {
                communeInput.focus();
                alert("Merci d'indiquer la commune ou le code postal du bien.");
                return;
            }
            if (!surface || parseInt(surface) <= 0) {
                surfaceInput.focus();
                alert("Merci d'indiquer une surface habitable approximative.");
                return;
            }

            if (summaryText && typeHidden) {
                summaryText.textContent = `${typeHidden.value} • ${surface} m² • ${commune}`;
            }

            if (step1 && step2) {
                step1.style.display = 'none';
                step2.style.display = 'block';
                if (addressInput) addressInput.focus();
            }
        });
    }

    // 6.3 Étape 2 -> Étape 1
    if (btnBackToStep1) {
        btnBackToStep1.addEventListener('click', () => {
            if (step1 && step2) {
                step2.style.display = 'none';
                step1.style.display = 'block';
            }
        });
    }

    // 6.4 Autocomplétion de l'adresse (API Adresse Gouv)
    let debounceTimer;
    if (addressInput && addressDropdown) {
        addressInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();

            if (query.length < 3) {
                addressDropdown.style.display = 'none';
                addressDropdown.innerHTML = '';
                return;
            }

            debounceTimer = setTimeout(async () => {
                try {
                    const postCode = communeInput ? encodeURIComponent(communeInput.value.trim()) : '';
                    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&postcode=${postCode}`);
                    const data = await res.json();

                    if (data.features && data.features.length > 0) {
                        addressDropdown.innerHTML = '';
                        data.features.forEach(feature => {
                            const item = document.createElement('div');
                            item.className = 'address-item';
                            item.textContent = feature.properties.label;
                            item.addEventListener('click', () => {
                                addressInput.value = feature.properties.label;
                                addressDropdown.style.display = 'none';
                                addressDropdown.innerHTML = '';
                            });
                            addressDropdown.appendChild(item);
                        });
                        addressDropdown.style.display = 'block';
                    } else {
                        addressDropdown.style.display = 'none';
                    }
                } catch (err) {
                    console.error("Erreur API Adresse:", err);
                }
            }, 250);
        });

        document.addEventListener('click', (e) => {
            if (!addressInput.contains(e.target) && !addressDropdown.contains(e.target)) {
                addressDropdown.style.display = 'none';
            }
        });
    }

    // 6.5 Formatage téléphone
    if (phoneInputStep2) {
        phoneInputStep2.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 10) val = val.substring(0, 10);
            e.target.value = val.replace(/(\d{2})(?=\d)/g, '$1 ');
        });
    }

 // 6.6 Soumission, Interrogation Google Sheets & Notification Complète
    if (btnSubmit) {
        btnSubmit.addEventListener('click', async () => {
            const address = addressInput ? addressInput.value.trim() : '';
            const name = nameInput ? nameInput.value.trim() : '';
            const phone = phoneInputStep2 ? phoneInputStep2.value.trim() : '';

            if (!address) {
                addressInput.focus();
                alert("Merci d'indiquer l'adresse ou le lieu-dit du bien.");
                return;
            }
            if (!name) {
                nameInput.focus();
                alert("Merci d'indiquer votre prénom ou nom.");
                return;
            }

            const cleanPhone = phone.replace(/\s/g, '');
            if (cleanPhone.length < 10) {
                phoneInputStep2.focus();
                alert("Merci d'indiquer un numéro de téléphone valide à 10 chiffres.");
                return;
            }

            btnSubmit.disabled = true;
            btnSubmit.innerHTML = "<span>Consultation de la base locale...</span>";

            const communeVal = communeInput ? communeInput.value.trim() : '';
            const surfaceVal = surfaceInput ? parseInt(surfaceInput.value.trim()) : 0;
            const typeVal = typeHidden ? typeHidden.value : 'Maison';
            const terrainVal = terrainSelect ? terrainSelect.value : '';
            const etatVal = etatHidden ? etatHidden.value : '';

            // 1. Interrogation directe de Google Sheets (Base ECM V2)
            const webAppUrl = "https://script.google.com/macros/s/AKfycbz3-6_6lZvLyKcnYC5P6NiB_qyP9EOIjMguEahlGvk8ZtxMVr7ckXlilD0Mgr468fYW/exec";
            const paramsUrl = `?action=estimer&commune=${encodeURIComponent(communeVal)}&surface=${surfaceVal}&type=${encodeURIComponent(typeVal)}&etat=${encodeURIComponent(etatVal)}`;

            let dataResult = null;
            try {
                const response = await fetch(webAppUrl + paramsUrl);
                dataResult = await response.json();
            } catch (err) {
                console.error("Erreur interrogation Google Sheets:", err);
            }

            // Éléments d'affichage
            const badgeElem = document.getElementById('result-property-badge');
            const inZoneBox = document.getElementById('result-in-zone');
            const outZoneBox = document.getElementById('result-out-zone');

            if (badgeElem) badgeElem.textContent = `${typeVal} • ${surfaceVal} m² • ${communeVal}`;

            let fourchetteTexte = "";
            let estimationStatut = "Standard";

            // 2. Traitement de la réponse
            if (dataResult && dataResult.success && !dataResult.specificite) {
                fourchetteTexte = `${dataResult.prix_bas.toLocaleString('fr-FR')} € – ${dataResult.prix_haut.toLocaleString('fr-FR')} €`;
                document.getElementById('result-price-range').textContent = fourchetteTexte;
                document.getElementById('result-avg-sqm').textContent = `${dataResult.moyenne_m2.toLocaleString('fr-FR')} €`;
                document.getElementById('result-competition-count').textContent = dataResult.nb_concurrents;

                inZoneBox.style.display = 'block';
                outZoneBox.style.display = 'none';
            } else if (dataResult && dataResult.specificite) {
                estimationStatut = "Spécifique (Étude approfondie requise)";
                fourchetteTexte = "Non chiffrée en direct (hors base / atypique)";
                inZoneBox.style.display = 'none';
                outZoneBox.style.display = 'block';
            } else {
                // Fallback de sécurité
                let basePrixM2 = typeVal.includes('Pavillon') ? 1550 : 1380;
                if (etatVal.includes('rafraîchir')) basePrixM2 *= 0.88;
                if (etatVal.includes('Rénovation')) basePrixM2 *= 0.60;

                const prixEstime = Math.round((surfaceVal * basePrixM2) / 1000) * 1000;
                const prixBas = Math.round((prixEstime * 0.92) / 1000) * 1000;
                const prixHaut = Math.round((prixEstime * 1.08) / 1000) * 1000;
                fourchetteTexte = `${prixBas.toLocaleString('fr-FR')} € – ${prixHaut.toLocaleString('fr-FR')} € (secours)`;

                document.getElementById('result-price-range').textContent = `${prixBas.toLocaleString('fr-FR')} € – ${prixHaut.toLocaleString('fr-FR')} €`;
                document.getElementById('result-avg-sqm').textContent = `${Math.round(basePrixM2).toLocaleString('fr-FR')} €`;
                document.getElementById('result-competition-count').textContent = "4";

                inZoneBox.style.display = 'block';
                outZoneBox.style.display = 'none';
            }

            // 3. Notification NTFY immédiate avec la fourchette calculée
            const ntfyMessage = `👤 ${name} - 📞 ${phone}
📍 ${address} (${communeVal})
🏠 ${typeVal} • ${surfaceVal} m² • Terrain: ${terrainVal}
🔨 État: ${etatVal}
💰 Estimation affichée: ${fourchetteTexte}`;

            // Envoi compatible navigateur sans blocage CORS
           // Envoi compatible et garanti sans blocage
            const ntfyPublishUrl = `https://ntfy.sh/${NTFY_TOPIC}/publish?title=${encodeURIComponent("Nouveau Prospect : " + name)}&priority=high&tags=house,euro&message=${encodeURIComponent(ntfyMessage)}`;

            fetch(ntfyPublishUrl, {
                method: 'GET',
                mode: 'no-cors'
            }).catch(err => console.error("Erreur envoi ntfy:", err));

            // 4. Transition vers l'écran résultat
         // 4. Transition vers l'écran résultat
            step2.style.display = 'none';
            stepResult.style.display = 'block';
        });
    }

    // --- 6.7 RECOMMENCER / MODIFIER L'ESTIMATION ---
    const btnRestart = document.getElementById('btn-restart-estimation');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            if (stepResult && step1) {
                stepResult.style.display = 'none';
                step1.style.display = 'block';
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = "Découvrir le positionnement de mon bien →";
                }
            }
        });
    }

});
