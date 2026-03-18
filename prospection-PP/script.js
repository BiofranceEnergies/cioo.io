<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM Immobilier - Propriété-Privée</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="card">
    <div class="header">
        <h2>Fiche Prospection "BIENS"</h2>
    </div>

    <form id="ppForm">
        <section>
            <span class="step-title">1. Contact Propriétaire</span>
            <label>Nom & Prénom</label>
            <input type="text" name="nom" placeholder="Ex: Jean Dupont" required>
            
            <div class="row">
                <div>
                    <label>Téléphone</label>
                    <input type="tel" name="telephone" placeholder="06..." required>
                </div>
                <div>
                    <label>Email</label>
                    <input type="email" name="email" placeholder="client@mail.com">
                </div>
            </div>
        </section>

        <section>
            <span class="step-title">2. Adresse du Bien</span>
            <div class="autocomplete-wrapper">
                <label>Saisie assistée (API Gouv)</label>
                <input type="text" id="adresse_input" name="adresse" autocomplete="off" placeholder="Tapez l'adresse..." required>
                <div id="suggestions" class="autocomplete-res"></div>
            </div>
            
            <div class="row">
                <div class="flex-2">
                    <label>Ville</label>
                    <input type="text" id="ville" name="ville" required>
                </div>
                <div class="flex-1">
                    <label>CP</label>
                    <input type="text" id="cp" name="cp" required>
                </div>
            </div>
        </section>

        <section>
            <span class="step-title">3. Caractéristiques & Prix</span>
            <div class="row">
                <div>
                    <label>Type de bien</label>
                    <select name="type_bien">
                        <option value="Maison">Maison</option>
                        <option value="Appartement">Appartement</option>
                        <option value="Terrain">Terrain</option>
                    </select>
                </div>
                <div>
                    <label>Projet</label>
                    <select name="projet">
                        <option value="Estimation">Estimation</option>
                        <option value="Vente">Mandat de vente</option>
                    </select>
                </div>
            </div>

            <div class="row">
                <div>
                    <label>Habitable (m²)</label>
                    <input type="number" id="surf_h" name="surface_habitable" step="0.01" required>
                </div>
                <div>
                    <label>Terrain (m²)</label>
                    <input type="number" name="surface_terrain" step="0.01">
                </div>
            </div>

            <div class="price-box">
                <label>Prix de vente souhaité (€)</label>
                <input type="number" id="prix" name="prix_vente">
                
                <label>Prix au m² (Calculé)</label>
                <input type="text" id="prix_m2" name="prix_m2" readonly class="readonly-input">
            </div>
        </section>

        <section>
            <span class="step-title">4. Photos & Notes</span>
            <label>Ajouter une photo</label>
            <input type="file" id="photo_file" accept="image/*" capture="environment">
            
            <label>Notes (DPE, travaux, urgence...)</label>
            <textarea name="commentaires" rows="3"></textarea>
        </section>

        <button type="submit" id="submitBtn">ENREGISTRER AU TABLEAU</button>
    </form>
    
    <div id="status"></div>
</div>

<script src="script.js"></script>
</body>
</html>
