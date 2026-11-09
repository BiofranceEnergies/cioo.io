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

        // Envoi direct sans aucun en-tête bloquant
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


    // --- 2. FORMATAGE AUTOMATIQUE TÉLÉPHONE (00 00 00 00 00) ---
    const phoneInput = document.querySelector('input[name="telephone"], input[name="phone"], #phone');

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) value = value.substring(0, 10);
            const formattedValue = value.replace(/(\d{2})(?=\d)/g, '$1 ');
            e.target.value = formattedValue;
        });
    }


    // --- 3. LECTURE VIDÉO IMMERSION (SMARTPHONE) ---
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


    // --- 4. GESTION COOKIES RGPD (Consent Mode V2) ---
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
            console.log("Consentement mis à jour : " + status);
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
        acceptBtn.addEventListener('click', () => {
            updateConsent(true);
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            updateConsent(false);
        });
    }


    // --- 5. GESTION MODALE VIDÉO MÉTHODE (50 SECONDES) ---
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
            if (event.target === videoModal) {
                stopAndCloseVideo();
            }
        });
    }


    // --- 6. GESTION MENTIONS LÉGALES (Modale) ---
    const legalModal = document.getElementById("legal-modal") || document.getElementById("legalModal");
    const openLegalBtn = document.getElementById("open-legal") || document.getElementById("openModalBtn");
    const closeLegalBtn = legalModal ? (legalModal.querySelector(".close-btn") || document.getElementById("closeModalBtn")) : null;
    const linkCookies = document.getElementById('open-legal-cookies');

    if (openLegalBtn && legalModal) {
        openLegalBtn.addEventListener("click", (e) => {
            e.preventDefault();
            legalModal.style.display = "block";
        });
    }

    if (linkCookies && legalModal) {
        linkCookies.addEventListener("click", (e) => {
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
        if (event.target === legalModal) {
            legalModal.style.display = "none";
        }
    });


   // --- 7. MODULE D'ESTIMATION EN DIRECT (TUNNEL 2 ÉTAPES & NTFY) ---
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

    // 7.1 Gestion des boutons pilules (Pill-buttons)
    function setupPillGroup(groupId, hiddenInputId) {
        const group = document.getElementById(groupId);
        if (!group) return;
        const buttons = group.querySelectorAll('.pill-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById(hiddenInputId).value = btn.dataset.value;
            });
        });
    }
    setupPillGroup('typeBienGroup', 'type_bien');
    setupPillGroup('etatBienGroup', 'etat_bien');

    // 7.2 Passage Étape 1 -> Étape 2
    if (btnToStep2) {
        btnToStep2.addEventListener('click', () => {
            const commune = communeInput.value.trim();
            const surface = surfaceInput.value.trim();

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

            // Mise à jour du bandeau récapitulatif
            summaryText.textContent = `${typeHidden.value} • ${surface} m² • ${commune}`;

            // Transition
            step1.style.display = 'none';
            step2.style.display = 'block';
            addressInput.focus();
        });
    }

    // 7.3 Retour Étape 2 -> Étape 1
    if (btnBackToStep1) {
        btnBackToStep1.addEventListener('click', () => {
            step2.style.display = 'none';
            step1.style.display = 'block';
        });
    }

    // 7.4 Autocomplétion de l'adresse avec l'API officielle gouv.fr (Gratuit)
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
                    // Recherche ciblée sur la Dordogne (dept 24) en priorité
                    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&postcode=${encodeURIComponent(communeInput.value.trim())}`);
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

        // Fermer la liste si clic en dehors
        document.addEventListener('click', (e) => {
            if (!addressInput.contains(e.target) && !addressDropdown.contains(e.target)) {
                addressDropdown.style.display = 'none';
            }
        });
    }

    // 7.5 Formatage automatique téléphone mobile Étape 2
    if (phoneInputStep2) {
        phoneInputStep2.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 10) val = val.substring(0, 10);
            e.target.value = val.replace(/(\d{2})(?=\d)/g, '$1 ');
        });
    }

    // 7.6 Calcul et Soumission finale
    if (btnSubmit) {
        btnSubmit.addEventListener('click', async () => {
            const address = addressInput.value.trim();
            const name = nameInput.value.trim();
            const phone = phoneInputStep2.value.trim();

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

            // Bouton en état chargement
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = "<span>Analyse de marché en cours...</span>";

            const communeVal = communeInput.value.trim();
            const surfaceVal = parseInt(surfaceInput.value.trim());
            const typeVal = typeHidden.value;
            const terrainVal = terrainSelect.value;
            const etatVal = etatHidden.value;

            // Alerte instantanée NTFY sur votre téléphone
            const ntfyMessage = `PROSPECT ESTIMATION EN DIRECT\n👤 ${name} - 📞 ${phone}\n📍 ${address} (${communeVal})\n🏠 ${typeVal} • ${surfaceVal} m² • Terrain: ${terrainVal}\n🔨 État: ${etatVal}`;
            const ntfyUrl = `https://ntfy.sh/${NTFY_TOPIC}/publish?title=${encodeURIComponent("🎯 Nouveau Prospect Estimation !")}&message=${encodeURIComponent(ntfyMessage)}&priority=urgent&tags=chart_with_upwards_trend,telephone_receiver,house`;

            try {
                await fetch(ntfyUrl, { mode: 'no-cors' });
            } catch (err) {
                console.error("Erreur ntfy lead:", err);
            }

            // Calcul du positionnement (Moyennes réelles observées sur la base Périgord Vert)
            // Estimation du prix / m² selon l'état et le type
            let basePrixM2 = 1350;
            if (typeVal.includes('pierre')) basePrixM2 = 1380;
            if (typeVal.includes('Pavillon')) basePrixM2 = 1550;
            if (etatVal === 'À rafraîchir') basePrixM2 *= 0.85;
            if (etatVal === 'Rénovation complète') basePrixM2 *= 0.55;

            const prixEstime = Math.round((surfaceVal * basePrixM2) / 1000) * 1000;
            const prixBas = Math.round((prixEstime * 0.92) / 1000) * 1000;
            const prixHaut = Math.round((prixEstime * 1.08) / 1000) * 1000;

            // Remplissage des éléments de l'Étape 3
            document.getElementById('result-property-badge').textContent = `${typeVal} • ${surfaceVal} m² • ${communeVal}`;
            document.getElementById('result-price-range').textContent = `${prixBas.toLocaleString('fr-FR')} € – ${prixHaut.toLocaleString('fr-FR')} €`;
            document.getElementById('result-avg-sqm').textContent = `${Math.round(basePrixM2).toLocaleString('fr-FR')} €`;

            // Simulation du nombre de concurrents du secteur (3 à 6 biens)
            const countComp = Math.floor(Math.random() * 4) + 3;
            document.getElementById('result-competition-count').textContent = countComp;

            // Affichage du résultat en direct
            setTimeout(() => {
                step2.style.display = 'none';
                stepResult.style.display = 'block';
            }, 600);
        });
    }
