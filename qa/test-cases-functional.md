# Cas de Test Fonctionnels — iReg Moto BF
## 150+ Cas de Test Couvrant les Modules A a H

---

| Attribut | Valeur |
|---|---|
| Version | 1.0 |
| Date | 2025-06-09 |
| Total cas de test | 155 |
| Statut | Pret pour execution |

---

## MODULE A — Acteurs Economiques (20 cas)

### A.1 — Enregistrement Importateur

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| A-01 | A | Enregistrement importateur avec documents complets | Aucun acteur existant avec le meme RCCM | 1. Acceder au formulaire d'enregistrement importateur 2. Saisir denomination "MOTO IMPORT BF SA" 3. Saisir RCCM "RCCM-BF-2024-A-12345" 4. Saisir IFU "0012345678901" 5. Uploader extrait RCCM (PDF) 6. Uploader attestation fiscale 7. Uploader certificat d'importation 8. Valider le formulaire | Acteur cree avec statut "En attente validation", numero provisoire genere, notification admin envoyee | Haute |
| A-02 | A | Enregistrement sans RCCM (doit echouer) | Aucune | 1. Acceder au formulaire 2. Saisir denomination "Import Sans RCCM" 3. Laisser le champ RCCM vide 4. Remplir les autres champs 5. Valider | Message d'erreur "RCCM obligatoire — Article 3 de l'arrete", formulaire non soumis | Critique |
| A-03 | A | Enregistrement avec RCCM existant | Un acteur existe avec RCCM "RCCM-BF-2024-A-12345" | 1. Acceder au formulaire 2. Saisir RCCM deja existant "RCCM-BF-2024-A-12345" 3. Valider | Message d'erreur "RCCM deja enregistre", suggestion de visualiser la fiche existante | Haute |
| A-04 | A | Upload documents formats non supportes | Aucune | 1. Saisir les champs obligatoires 2. Uploader un fichier .exe comme extrait RCCM 3. Valider | Message d'erreur "Format non supporte — PDF, JPG, PNG uniquement", fichier rejete | Moyenne |
| A-05 | A | Enregistrement avec RCCM invalide (format) | Aucune | 1. Saisir RCCM "INVALID-123" 2. Remplir les autres champs 3. Valider | Message d'erreur "Format RCCM invalide — attendu: RCCM-BF-AAAA-N-XXXXX" | Moyenne |

### A.2 — Enregistrement Distributeur et Detaillant

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| A-06 | A | Enregistrement distributeur avec reference importateur | Importateur "MOTO IMPORT BF SA" (A-01) existe et agree | 1. Acceder au formulaire distributeur 2. Saisir denomination "DISTRI MOTO CENTRE" 3. Saisir RCCM "RCCM-BF-2024-B-67890" 4. Selectionner importateur source "MOTO IMPORT BF SA" 5. Uploader contrat de distribution 6. Uploader extrait RCCM 7. Valider | Distributeur cree avec statut "En attente", liaison vers importateur etablie | Haute |
| A-07 | A | Enregistrement detaillant avec reference distributeur | Distributeur "DISTRI MOTO CENTRE" (A-06) existe | 1. Acceder au formulaire detaillant 2. Saisir denomination "MOTO SHOP OUAGA" 3. Saisir RCCM "RCCM-BF-2024-C-11111" 4. Selectionner distributeur source "DISTRI MOTO CENTRE" 5. Saisir adresse physique complete 6. Uploader extrait RCCM, permis d'ouvrir 7. Valider | Detaillant cree avec statut "En attente", liaison distributeur etablie, geolocalisation enregistree | Haute |
| A-08 | A | Enregistrement detaillant sans adresse precise | Aucune | 1. Remplir le formulaire detaillant 2. Saisir adresse "Ouagadougou" sans precision 3. Valider | Message d'erreur "Adresse physique detaillee obligatoire — rue, secteur, coordonnees GPS" | Moyenne |
| A-09 | A | Enregistrement distributeur sans contrat d'importateur | Aucun importateur reference | 1. Acceder au formulaire distributeur 2. Remplir les champs 3. Ne pas selectionner d'importateur 4. Ne pas uploader de contrat 5. Valider | Message d'erreur "Contrat de distribution avec un importateur agre obligatoire" | Haute |
| A-10 | A | Enregistrement detaillant sans permis d'ouvrir | Aucune | 1. Remplir le formulaire detaillant 2. Ne pas uploader le permis d'ouvrir 3. Valider | Message d'erreur "Permis d'ouvrir obligatoire pour les detaillants — Article 4" | Haute |

### A.3 — Renouvellement et Validations

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| A-11 | A | Renouvellement agreement arrivant a expiration | Importateur "MOTO IMPORT BF SA" avec agreement expire dans 30 jours | 1. Se connecter en tant qu'importateur 2. Recevoir notification expiration 3. Acceder a la demande de renouvellement 4. Mettre a jour les documents 5. Payer les frais de renouvellement 6. Soumettre la demande | Demande de renouvellement creee, statut "En cours de renouvellement", ancien agreement prolonge temporairement | Critique |
| A-12 | A | Renouvellement apres expiration (penalite) | Importateur avec agreement expire depuis 15 jours | 1. Tenter le renouvellement 2. Constater le message de penalite 3. Payer les frais + penalite 4. Soumettre | Renouvellement accepte avec mention "Retard" dans l'historique, penalite enregistree | Haute |
| A-13 | A | Validation agreement par le ministere (approbation) | Demande A-01 en attente | 1. Se connecter au portail ministere 2. Consulter la demande 3. Verifier les documents 4. Approuver la demande 5. Generer le numero agreement | Statut passe a "Actif", numero agreement "AGR-IMP-2026-001" attribue, notification envoyee | Critique |
| A-14 | A | Rejet d'une demande par le ministere | Demande en attente avec documents incomplets | 1. Consulter la demande 2. Rejeter avec motif "Attestation fiscale non a jour" 3. Soumettre le rejet | Statut "Rejete", motif enregistre, notification avec raison du rejet envoyee au demandeur | Haute |
| A-15 | A | Suspension d'un agreement actif | Importateur actif avec numero agreement | 1. Se connecter au portail ministere 2. Rechercher l'acteur 3. Initier la suspension 4. Saisir le motif "Non conformite rapport trimestriel" 5. Confirmer la suspension | Statut passe a "Suspendu", numero agreement invalide, notification envoyee, blocage des operations commerciales | Critique |

### A.4 — Alertes et Recherches

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| A-16 | A | Alerte expiration agreement (30 jours) | Importateur avec agreement expirant dans 30 jours | 1. Executer le batch quotidien de verification 2. Verifier les envois de notification | Notification email + SMS envoyee a l'importateur avec lien vers renouvellement | Critique |
| A-17 | A | Alerte expiration agreement (7 jours) | Importateur avec agreement expirant dans 7 jours | 1. Executer le batch quotidien 2. Verifier les envois | Notification d'urgence envoyee (email + SMS + notification in-app), alerte au ministere | Critique |
| A-18 | A | Alerte agreement expire | Importateur avec agreement expire | 1. Executer le batch quotidien 2. Verifier les alertes | Notification de suspension imminente, blocage progressif des fonctionnalites | Critique |
| A-19 | A | Recherche acteur par numero agreement | Plusieurs acteurs enregistres | 1. Acceder a la recherche 2. Saisir "AGR-IMP-2026-001" 3. Lancer la recherche | Fiche de l'acteur affichee avec toutes ses informations, statut, historique | Moyenne |
| A-20 | A | Recherche acteur par RCCM | Plusieurs acteurs enregistres | 1. Acceder a la recherche 2. Saisir RCCM "RCCM-BF-2024-A-12345" 3. Lancer la recherche | Fiche de l'acteur affichee, liaison vers distributeurs et detaillants associes visible | Moyenne |

---

## MODULE B — Stocks (20 cas)

### B.1 — Enregistrement VIN et Reception Stock

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| B-01 | B | Enregistrement VIN valide | Importateur "MOTO IMPORT BF SA" actif | 1. Acceder au formulaire de reception de stock 2. Saisir VIN "ML8BCE7H8KJ123456" 3. Saisir modele "MOTO XR 150L" 4. Saisir annee fabrication "2025" 5. Saisir NGP "8903.21.00" 6. Uploader document d'importation 7. Valider | Engin enregistre, statut "En stock", QR code genere, numero de suivi attribue | Haute |
| B-02 | B | Enregistrement VIN invalide (format) | Importateur actif | 1. Saisir VIN "INVALID123" 2. Remplir les autres champs 3. Valider | Message d'erreur "Format VIN invalide — 17 caracteres alphanumeriques requis" | Haute |
| B-03 | B | Enregistrement VIN duplique | VIN "ML8BCE7H8KJ123456" deja enregistre (B-01) | 1. Saisir le meme VIN "ML8BCE7H8KJ123456" 2. Remplir les autres champs 3. Valider | Message d'erreur "VIN deja enregistre dans le systeme", lien vers la fiche existante | Haute |
| B-04 | B | Enregistrement modele interdit depuis 2022 | Importateur actif | 1. Saisir VIN "ABCDE12345FG67890" 2. Saisir modele "MOTO MODELE-BAN-2022" 3. Saisir annee "2021" 4. Valider | Message d'alerte "Modele interdit a l'importation depuis 2022", enregistrement bloque, signalement au ministere | Critique |
| B-05 | B | Enregistrement avec NGP invalide | Importateur actif | 1. Saisir VIN valide 2. Saisir NGP "9999.99.99" 3. Valider | Message d'erreur "NGP invalide — verifier le Nomenclature Generale des Produits" | Moyenne |

### B.2 — Mouvements de Stock

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| B-06 | B | Mouvement stock sortie (vente a distributeur) | Engin "ML8BCE7H8KJ123456" en stock chez importateur | 1. Selectionner l'engin 2. Choisir type mouvement "Sortie" 3. Selectionner destinataire distributeur "DISTRI MOTO CENTRE" 4. Saisir date de transfert 5. Uploader bon de sortie 6. Valider | Statut engin "En transit", stock importateur decremente, mouvement historise | Haute |
| B-07 | B | Mouvement stock entree (reception distributeur) | Mouvement B-06 effectue | 1. Se connecter en tant que distributeur 2. Acceder aux receptions en attente 3. Confirmer la reception de l'engin 4. Verifier l'etat 5. Valider | Statut engin "En stock chez distributeur", stock distributeur incremente, tracabilite mise a jour | Haute |
| B-08 | B | Mouvement sortie sans engin en stock | Aucun engin en stock | 1. Tenter de creer un mouvement de sortie 2. Selectionner un engin non disponible 3. Valider | Message d'erreur "Engin non disponible en stock", mouvement bloque | Haute |
| B-09 | B | Mouvement vers destinataire non reference | Engin en stock | 1. Creer mouvement sortie 2. Saisir un destinataire non enregistre dans le systeme 3. Valider | Message d'erreur "Destinataire non reference — enregistrer le distributeur d'abord" | Haute |
| B-10 | B | Historique complet des mouvements d'un engin | Engin avec plusieurs mouvements | 1. Rechercher l'engin par VIN 2. Consulter l'onglet "Historique" 3. Verifier la chronologie | Historique complet affiche: importateur -> distributeur -> detaillant -> client, avec dates et acteurs | Haute |

### B.3 — Inventaire et Alertes

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| B-11 | B | Inventaire physique vs systeme (ecart detecte) | 50 engins declares en stock systeme | 1. Lancer la procedure d'inventaire 2. Scanner les QR codes des engins physiquement presents (47 trouves) 3. Saisir le resultat physique 4. Comparer au systeme | Rapport d'ecart genere: 3 engins manquants, alerte de securite creee, investigation requise | Haute |
| B-12 | B | Inventaire physique conforme | 50 engins en stock | 1. Lancer l'inventaire 2. Scanner les 50 QR codes 3. Saisir le resultat | Inventaire valide, rapport "Conforme", date d'inventaire mise a jour | Moyenne |
| B-13 | B | Blocage vente modele interdit | Modele "MOTO-MODELE-BAN-2022" en stock | 1. Tenter de vendre l'engin 2. Valider la transaction | Message d'erreur "Vente impossible — modele interdit depuis 2022 (Article 8 de l'arrete)", transaction bloquee, signalement CNTI | Critique |
| B-14 | B | Alerte stock faible | Seuil d'alerte configure a 10 engins | 1. Diminuer le stock a 8 engins 2. Attendre le batch de verification | Notification "Stock faible" envoyee au detaillant et au ministere | Moyenne |
| B-15 | B | Alerte engin non vendu depuis 180 jours | Engin en stock depuis 200 jours | 1. Executer le batch quotidien 2. Verifier les alertes | Notification "Engin en stock depuis plus de 180 jours" envoyee, relance commerciale suggeree | Faible |

### B.4 — Gestion des Etats et Transferts

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| B-16 | B | Transfert inter-agences (distributeur multi-sites) | Distributeur avec 2 points de vente | 1. Selectionner engin au site A 2. Creer mouvement "Transfert interne" 3. Selectionner site B 4. Valider | Statut "En transit interne", reception attendue au site B | Moyenne |
| B-17 | B | Reception transfert inter-agences | Transfert B-16 en cours | 1. Se connecter au site B 2. Confirmer la reception 3. Verifier l'etat de l'engin | Statut "En stock site B", tracabilite mise a jour | Moyenne |
| B-18 | B | Annulation mouvement (erreur de saisie) | Mouvement cree il y a 5 minutes | 1. Acceder au mouvement 2. Cliquer "Annuler" 3. Saisir le motif "Erreur de saisie" 4. Confirmer | Mouvement annule, stock restaure, ligne d'annulation dans l'historique | Moyenne |
| B-19 | B | Export inventaire au format Excel | Inventaire existant | 1. Acceder a la page inventaire 2. Cliquer "Exporter" 3. Selectionner le format Excel 4. Telecharger | Fichier Excel genere avec: VIN, modele, date entree, localisation, statut | Faible |
| B-20 | B | Scan QR code pour identification rapide | Engin avec QR code genere | 1. Scanner le QR code de l'engin 2. Verifier l'affichage | Fiche de l'engin affichee avec toutes ses informations et son historique | Moyenne |

---

## MODULE C — Clients (20 cas)

### C.1 — Enregistrement Client KYC

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| C-01 | C | Enregistrement client KYC complet | Client non existant | 1. Acceder au formulaire client 2. Saisir nom "KABORE" 3. Saisir prenom "Jean" 4. Saisir date naissance "15/03/1990" 5. Selectionner type piece "CNIB" 6. Saisir numero piece "B1234567890123" 7. Uploader scan CNIB (recto/verso) 8. Saisir telephone "+226 70 12 34 56" 9. Saisir adresse "Secteur 15, Ouagadougou" 10. Valider | Client cree avec ID "CLI-2026-00001", statut "KYC complet", score KYC = 100% | Critique |
| C-02 | C | Enregistrement client sans piece d'identite | Aucune | 1. Remplir le formulaire client 2. Ne pas uploader de piece d'identite 3. Ne pas saisir le numero 4. Valider | Message d'erreur "Piece d'identite obligatoire (CNIB, Passeport, Permis de conduire) — Article 12", enregistrement bloque | Critique |
| C-03 | C | Enregistrement client avec CNIB expiree | Aucune | 1. Saisir les informations client 2. Uploader CNIB expiree (date validite passee) 3. Saisir numero 4. Valider | Message d'alerte "CNIB expiree — mise a jour obligatoire avant achat", enregistrement partiel autorise, vente bloquee | Haute |
| C-04 | C | Enregistrement client mineur | Aucune | 1. Saisir date naissance "15/03/2010" (age < 18) 2. Uploader piece identite 3. Valider | Message d'erreur "Acheteur mineur — vente d'engin motorise interdite aux mineurs", enregistrement bloque | Haute |
| C-05 | C | Enregistrement client avec telephone duplique | Client "KABORE Jean" existe avec tel "+226 70 12 34 56" | 1. Creer nouveau client 2. Saisir telephone "+226 70 12 34 56" 3. Valider | Alerte "Numero de telephone deja associe a KABORE Jean — confirmer identite", demande de verification | Moyenne |

### C.2 — Vente et Liaison

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| C-06 | C | Vente sans piece d'identite (doit echouer) | Client sans KYC complet | 1. Tenter de vendre un engin au client 2. Ne pas fournir de piece d'identite 3. Valider la vente | Message d'erreur "Vente impossible — KYC incomplet. Piece d'identite obligatoire.", vente bloquee | Critique |
| C-07 | C | Vente avec KYC complet | Client C-01 avec KYC complet, Engin en stock | 1. Selectionner le client "KABORE Jean" 2. Selectionner l'engin "ML8BCE7H8KJ123456" 3. Saisir prix de vente 4. Generer la facture 5. Valider la vente | Vente enregistree, engin lie au client "CLI-2026-00001", statut "Vendu", facture generee | Critique |
| C-08 | C | Liaison acheteur-engin | Vente C-07 effectuee | 1. Consulter la fiche de l'engin 2. Verifier l'onglet "Proprietaire" | Client "KABORE Jean" affiche comme proprietaire actuel avec date d'achat | Haute |
| C-09 | C | Transfert propriete (revente) | Client A possede l'engin, Client B (KYC complet) veut acheter | 1. Enregistrer la revente 2. Selectionner nouveau proprietaire 3. Saisir prix de revente 4. Generer nouvelle facture 5. Valider | Ancien proprietaire archive, nouveau proprietaire enregistre, historique de propriete mis a jour | Haute |
| C-10 | C | Vente a client avec agreement suspendu | Detaillant "MOTO SHOP OUAGA" suspendu | 1. Tenter d'enregistrer une vente 2. Valider | Message d'erreur "Vente impossible — agreement du vendeur suspendu", transaction bloquee, alerte au ministere | Critique |

### C.3 — Historique et Recherches

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| C-11 | C | Historique propriete complet | Engin avec 3 proprietaires successifs | 1. Rechercher l'engin par VIN 2. Consulter l'onglet "Historique propriete" | Liste chronologique des 3 proprietaires avec dates d'achat, prix, documents associes | Haute |
| C-12 | C | Recherche client par numero piece | Plusieurs clients enregistres | 1. Acceder a la recherche 2. Saisir "B1234567890123" 3. Lancer | Fiche client "KABORE Jean" affichee avec ses achats | Moyenne |
| C-13 | C | Recherche client par telephone | Plusieurs clients | 1. Saisir "+226 70 12 34 56" 2. Lancer la recherche | Fiche client affichee | Faible |
| C-14 | C | Mise a jour informations client (changement adresse) | Client C-01 existe | 1. Acceder a la fiche client 2. Modifier l'adresse 3. Uploader justificatif 4. Valider | Adresse mise a jour, historique des modifications conserve, ancienne adresse archivee | Faible |
| C-15 | C | Verification KYC automatique (batch) | 100 clients enregistres | 1. Executer le batch de verification KYC 2. Verifier les resultats | Rapport: 95 KYC complets, 3 CNIB a renouveler, 2 pieces douteuses signalees | Moyenne |

### C.4 — Alertes et Conformite Client

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| C-16 | C | Alerte client acheteur multiple (suspicion) | Client a achete 5 engins en 1 mois | 1. Executer le batch de detection 2. Verifier les alertes | Alerte "Client acheteur multiple — 5 engins en 30 jours", signalement CNTI suggere | Haute |
| C-17 | C | Client sur liste de surveillance | Client signale par les autorites | 1. Enregistrer le signalement 2. Marquer le client 3. Tenter une vente | Message d'alerte "Client sur liste de surveillance — verification obligatoire avant vente", alerte CNTI automatique | Critique |
| C-18 | C | Export liste clients (RGPD) | Client demande ses donnees | 1. Client fait une demande d'export 2. Systeme genere l'export | Fichier JSON/PDF avec toutes les donnees personnelles, historique, droits RGPD respectes | Moyenne |
| C-19 | C | Suppression donnees client (droit a l'oubli RGPD) | Client avec achats anciens (> 5 ans) | 1. Client demande la suppression 2. Verifier les contraintes legales 3. Anonymiser si possible | Donnees anonymisees, references conservees pour la reglementation, suppression logique | Moyenne |
| C-20 | C | Double vente du meme engin (conflit) | Deux detaillants tentent de vendre le meme engin simultanement | 1. Vendeur A initie la vente 2. Vendeur B initie la vente simultanement 3. Les deux valident | Une seule vente reussit, l'autre recoit "Engin deja vendu — transaction annulee", mecanisme de verrouillage fonctionne | Haute |

---

## MODULE D — Commercial (15 cas)

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| D-01 | D | Enregistrement prix achat importateur | Importateur actif, engin enregistre | 1. Acceder au formulaire prix 2. Saisir VIN "ML8BCE7H8KJ123456" 3. Saisir prix achat FOB "1200 EUR" 4. Saisir fret "300 EUR" 5. Saisir assurance "50 EUR" 6. Saisir droits de douane "250 EUR" 7. Calculer prix revient 8. Valider | Prix achat enregistre, prix revient calcule = 1800 EUR, marge potentielle calculee | Haute |
| D-02 | D | Enregistrement prix vente detaillant | Engin avec prix achat enregistre (D-01) | 1. Acceder au formulaire de vente 2. Selectionner l'engin 3. Saisir prix de vente "2200 EUR" 4. Calculer la marge 5. Valider | Prix vente enregistre, marge calculee = 22.2%, alerte marge > 20% declenchee | Haute |
| D-03 | D | Alerte marge > 20% (seuil reglementaire) | Prix revient = 1800 EUR | 1. Saisir prix de vente "2500 EUR" 2. Valider | Message d'alerte "Marge de 38.9% superieure au seuil reglementaire de 20% — justification obligatoire", champ "Motif de la marge elevee" requis | Critique |
| D-04 | D | Alerte marge > 20% avec justification | D-03 en cours | 1. Saisir le motif "Modele edition limitee, cout de transport eleve" 2. Uploader justificatifs 3. Valider | Alerte enregistree avec justification, signalement au ministere pour validation | Haute |
| D-05 | D | Blocage vente prix anormalement bas (sous-evaluation) | Prix revient = 1800 EUR | 1. Saisir prix de vente "1000 EUR" 2. Valider | Message d'alerte "Prix de vente inferieur au prix de revient — suspicion de sous-evaluation", blocage vente, signalement CNTI | Haute |
| D-06 | D | Generation facture OHADA | Vente C-07 validee | 1. Generer la facture 2. Verifier le contenu OHADA | Facture generee avec: en-tete vendeur, infos acheteur, detail engin (VIN, modele), prix, TVA, total TTC, mentions obligatoires OHADA | Critique |
| D-07 | D | Mention numero agreement sur facture | Detaillant avec agreement "AGR-DET-2026-045" | 1. Generer la facture 2. Verifier la mention | Facture contient "Vente effectuee par operateur agree sous le numero AGR-DET-2026-045 conformement a l'arrete ministeriel 05/06/2026" | Critique |
| D-08 | D | Export comptable (Grand Livre) | 100 transactions sur le mois | 1. Selectionner la periode 2. Choisir format export "Grand Livre OHADA" 3. Generer | Fichier exporte avec: date, numero piece, compte debit, compte credit, montant, libelle, reference | Haute |
| D-09 | D | Export comptable (Balance) | Donnees comptables du trimestre | 1. Selectionner la periode T1-2026 2. Choisir format "Balance" 3. Generer | Balance comptable avec: comptes, soldes initiaux, mouvements debits/credits, soldes finaux | Haute |
| D-10 | D | Export comptable (Journal des ventes) | Donnees du mois | 1. Selectionner le mois 2. Choisir format "Journal des ventes" 3. Generer | Journal avec: date, numero facture, client, montant HT, TVA, TTC, mode de paiement | Haute |
| D-11 | D | Calcul TVA applicable | Prix de vente 2200 EUR, TVA 18% | 1. Generer la facture 2. Verifier le calcul | TVA = 396 EUR, Total TTC = 2596 EUR, detail sur la facture | Moyenne |
| D-12 | D | Historique des prix d'un engin | Engin avec prix achat et prix vente | 1. Consulter la fiche de l'engin 2. Acceder a l'onglet "Prix" | Historique: prix achat par importateur, prix de transfert distributeur, prix vente final | Faible |
| D-13 | D | Comparaison prix par zone geographique | Ventes dans 3 regions | 1. Acceder au tableau de bord 2. Selectionner "Comparaison prix" 3. Filtrer par region | Graphique comparatif des prix moyens par region, ecart type calcule | Faible |
| D-14 | D | Generation avoir (annulation vente) | Vente D-06 effectuee | 1. Selectionner la vente 2. Cliquer "Generer avoir" 3. Saisir motif "Retour produit defectueux" 4. Valider | Avoir genere, vente annulee, stock restaure, facture d'avoir transmise | Moyenne |
| D-15 | D | Paiement echelonne (vente a temperament) | Vente approuvee | 1. Enregistrer la vente 2. Selectionner "Paiement echelonne" 3. Saisir apport initial 30% 4. Saisir nombre d'echeances (6) 5. Generer l'echeancier | Echeancier genere avec: dates, montants echeances, total, taux d'interet si applicable | Faible |

---

## MODULE E — Rapportage (25 cas) — CRITIQUE

### E.1 — Generation Rapport Trimestriel

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| E-01 | E | Generation rapport trimestriel complet | Importateur "MOTO IMPORT BF SA" actif avec transactions T1-2026 | 1. Se connecter en tant qu'importateur 2. Acceder a "Rapport trimestriel" 3. Selectionner trimestre "T1-2026" 4. Cliquer "Generer" | Rapport genere avec toutes les sections: identification, stock initial, entrees, sorties, stock final, ventes, clients, conformite | Critique |
| E-02 | E | Generation avec donnees incompletes (doit alerter) | Importateur avec donnees manquantes (prix non enregistres) | 1. Tenter de generer le rapport T1-2026 2. Valider | Message d'alerte "Rapport incomplet — prix d'achat manquants pour 3 engins", liste des donnees manquantes, rapport non genere | Critique |
| E-03 | E | Generation rapport trimestriel en retard | Echeance 15/04/2026 passee (nous sommes le 20/04/2026) | 1. Tenter de generer le rapport 2. Constater l'alerte | Message d'avertissement "Rapport en retard — penalite applicable conformement a l'arrete", calcul de la penalite affiche | Critique |
| E-04 | E | Verification contenu obligatoire du rapport | Rapport E-01 genere | 1. Verifier la section "Identification operateur" 2. Verifier "Stock initial" 3. Verifier "Entrees" 4. Verifier "Sorties" 5. Verifier "Stock final" 6. Verifier "Ventes detaillees" 7. Verifier "Liste clients" 8. Verifier "Etat conformite" | Toutes les sections presentes avec donnees coherentes, total de controle correct | Critique |
| E-05 | E | Coherence des totaux dans le rapport | Rapport E-01 genere | 1. Verifier: Stock initial + Entrees - Sorties = Stock final 2. Verifier: Total ventes = Somme des lignes de vente 3. Verifier: Total clients = Nombre de clients uniques | Les 3 equations verifiees, ecart = 0 | Critique |

### E.2 — Soumission XML

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| E-06 | E | Soumission XML au ministere | Rapport E-01 genere et complet | 1. Cliquer "Soumettre au ministere" 2. Selectionner format "XML" 3. Confirmer la soumission | Fichier XML genere conforme au schema XSD, soumission enregistree, accuse de reception recu | Critique |
| E-07 | E | Verification format XML conforme | Fichier XML E-06 genere | 1. Valider le XML contre le XSD ministeriel 2. Verifier la structure | XML valide: balises correctes, namespaces presents, encodage UTF-8,DTD respecte | Critique |
| E-08 | E | Soumission XML avec donnees invalides | Rapport avec erreurs de donnees | 1. Tenter de soumettre 2. Valider | Message d'erreur "Donnees invalides detectees — corriger avant soumission", details des erreurs XML | Critique |
| E-09 | E | Accuse de reception ministeriel | Soumission E-06 effectuee | 1. Attendre la reponse du systeme ministeriel (mock) 2. Verifier le statut | Statut "Soumis — En attente validation", accuse de reception avec numero de tracking "TRK-2026-001" | Haute |
| E-10 | E | Rejet XML par le ministere | Soumission en attente | 1. Ministere rejette le XML avec motif "Structure invalide" 2. Verifier la notification | Statut "Rejete", motif detaille, lien pour corriger et resoumettre | Haute |

### E.3 — Generation PDF Signe

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| E-11 | E | Generation PDF signe | Rapport E-01 genere | 1. Cliquer "Telecharger PDF" 2. Selectionner "PDF signe numeriquement" 3. Telecharger | PDF genere avec: contenu complet, signature numerique de l'operateur, horodatage, empreinte SHA-256 | Critique |
| E-12 | E | Verification signature PDF | PDF E-11 telecharge | 1. Ouvrir le PDF 2. Verifier la signature numerique 3. Verifier l'horodatage | Signature valide, horodatage correct, document non altere, certificat de signature verifie | Haute |
| E-13 | E | PDF avec tampon ministeriel (apres validation) | Rapport valide par le ministere | 1. Ministere valide le rapport 2. Operateur telecharge le PDF valide | PDF avec tampon "Valide par le Ministere du Commerce" avec date et reference | Haute |
| E-14 | E | Generation PDF avec annexes | Rapport avec documents justificatifs | 1. Generer le PDF 2. Inclure les annexes (factures, bons de livraison) 3. Telecharger | PDF complet avec annexes integrees, table des matieres, numerotation des pages | Faible |
| E-15 | E | Conservation archive du rapport | Rapport soumis | 1. Verifier l'archivage automatique 2. Consulter l'historique | Rapport archive avec reference unique, accessible pendant 10 ans, immuable | Haute |

### E.4 — Gestion des Echeances et Alertes

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| E-16 | E | Alerte rapprochement echeance (30 jours) | Echeance rapport T2-2026: 15/07/2026, date actuelle: 15/06/2026 | 1. Executer le batch quotidien 2. Verifier les notifications | Notification envoyee: "Echeance rapport T2-2026 dans 30 jours — preparer vos donnees" | Critique |
| E-17 | E | Alerte rapprochement echeance (7 jours) | Echeance dans 7 jours | 1. Executer le batch 2. Verifier | Notification urgente envoyee (email + SMS + in-app) | Critique |
| E-18 | E | Alerte echeance depassee | Echeance 15/07/2026 passee, date: 16/07/2026 | 1. Executer le batch 2. Verifier | Notification "Echeance depassee — penalite en cours de calcul", score conformite impacte | Critique |
| E-19 | E | Calcul penalite de retard | Rapport en retard de 10 jours | 1. Systeme calcule la penalite 2. Afficher le detail | Penalite calculee selon formule reglementaire: X FCFA/jour de retard, total affiche | Haute |
| E-20 | E | Relance automatique operateur non reactif | Rapport non soumis 15 jours apres echeance | 1. Executer le batch de relance 2. Verifier | Relance automatique envoyee (email + SMS), escalade au ministere si 30 jours | Haute |

### E.5 — Tableaux de Bord et Statistiques

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| E-21 | E | Vue tableau de bord rapportage | Importateur avec plusieurs rapports | 1. Acceder au tableau de bord 2. Verifier les widgets | Widgets: rapports soumis/a soumettre, echeances, taux de conformite, alertes | Moyenne |
| E-22 | E | Comparaison trimestrielle | Rapports T1-2025, T2-2025, T3-2025, T4-2025, T1-2026 | 1. Selectionner la periode 2. Generer le comparatif | Graphique comparatif: evolution des ventes, stocks, clients par trimestre | Faible |
| E-23 | E | Export rapport au format CSV | Rapport genere | 1. Cliquer "Exporter" 2. Selectionner CSV 3. Telecharger | Fichier CSV avec separateur point-virgule, encodage UTF-8, toutes les donnees | Faible |
| E-24 | E | Impression rapport | Rapport genere | 1. Cliquer "Imprimer" 2. Verifier l'aperçu | Aperçu d'impression correct, mise en page A4, en-tete/pied de page, numerotation | Faible |
| E-25 | E | Rapport vide (aucune transaction) | Importateur sans transaction sur le trimestre | 1. Generer le rapport T1-2026 2. Verifier | Rapport genere avec sections vides et mention "Aucune operation sur cette periode", soumission tout de meme possible | Moyenne |

---

## MODULE F — Conformite (20 cas)

### F.1 — Calcul Score Conformite (150 points)

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| F-01 | F | Calcul score conformite complet (150 pts) | Importateur avec toutes les donnees | 1. Lancer le calcul de score 2. Verifier les criteres 3. Consulter le resultat | Score calcule sur 150 points: A = documents (30pts), B = rapports (30pts), C = stocks (25pts), D = KYC (25pts), E = prix (20pts), F = securite (20pts) | Critique |
| F-02 | F | Score 150/150 (conformite parfaite) | Importateur parfaitement conforme | 1. Calculer le score 2. Verifier le resultat | Score = 150/150, statut "Entierement conforme", badge vert, aucune action requise | Critique |
| F-03 | F | Score < 100 (non-conformite critique) | Importateur avec plusieurs manquements | 1. Calculer le score 2. Verifier | Score = 75/150, statut "Non conforme", alerte rouge, plan d'action obligatoire genere | Critique |
| F-04 | F | Score entre 100 et 120 (conformite partielle) | Importateur avec quelques manquements | 1. Calculer le score 2. Verifier | Score = 110/150, statut "Conformite partielle", alerte orange, recommandations generees | Haute |
| F-05 | F | Mise a jour score apres correction | Score F-03 = 75/150, operateur corrige les manquements | 1. Effectuer les corrections 2. Relancer le calcul | Score recalcule, progression visible, statut mis a jour | Haute |

### F.2 — Checklist par Type d'Acteur

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| F-06 | F | Checklist importateur complete | Importateur enregistre | 1. Acceder a la checklist 2. Verifier les 25 criteres | Checklist avec: RCCM valide (OK), attestation fiscale (OK), certificat importation (OK), rapport trimestriel (OK), etc. | Haute |
| F-07 | F | Checklist distributeur | Distributeur enregistre | 1. Acceder a la checklist distributeur 2. Verifier les 20 criteres | Checklist specifique distributeur: contrat importateur, agreement, localisation, etc. | Haute |
| F-08 | F | Checklist detaillant | Detaillant enregistre | 1. Acceder a la checklist 3. Verifier les 18 criteres | Checklist specifique detaillant: permis d'ouvrir, agreement, KYC clients, etc. | Haute |
| F-09 | F | Checklist avec criteres manquants | Detaillant sans permis d'ouvrir | 1. Consulter la checklist 2. Verifier les criteres non valides | Criteres manquants en rouge avec description et delai de correction | Haute |
| F-10 | F | Export checklist PDF | Checklist generee | 1. Cliquer "Exporter PDF" 2. Telecharger | PDF avec: criteres, statuts (OK/KO/NA), commentaires, date de generation | Faible |

### F.3 — Compte a Rebours Delai

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| F-11 | F | Compte a rebours 3 mois (importateur) | Nouvel importateur enregistre le 01/01/2026 | 1. Consulter le tableau de bord conformite 2. Verifier le compte a rebours | Affichage: "Delai de conformite: 90 jours restants — echeance: 01/04/2026" | Critique |
| F-12 | F | Compte a rebours 6 mois (distributeur) | Nouveau distributeur enregistre | 1. Consulter le tableau de bord 2. Verifier | Affichage: "Delai de conformite: 180 jours restants — echeance: [date]" | Critique |
| F-13 | F | Compte a rebours 1 an (detaillant) | Nouveau detaillant enregistre | 1. Consulter le tableau de bord 2. Verifier | Affichage: "Delai de conformite: 365 jours restants — echeance: [date]" | Critique |
| F-14 | F | Alerte compte a rebours (30 jours restants) | Delai expire dans 30 jours | 1. Consulter le tableau de bord 2. Verifier l'alerte | Compteur en orange, notification envoyee, taches prioritaires affichees | Critique |
| F-15 | F | Alerte compte a rebours (7 jours restants) | Delai expire dans 7 jours | 1. Consulter le tableau de bord 2. Verifier | Compteur en rouge clignotant, notification urgente, escalade au ministere | Critique |

### F.4 — Simulation Inspection et Plan d'Action

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| F-16 | F | Simulation inspection virtuelle | Importateur avec score 110/150 | 1. Lancer la simulation 2. Repondre aux 50 questions 3. Verifier le resultat | Rapport de simulation avec: points forts, points faibles, risques identifies, score simule | Haute |
| F-17 | F | Generation plan d'action correctif | Score F-03 = 75/150 | 1. Generer le plan d'action 2. Verifier le contenu | Plan d'action avec: actions correctives, responsables, delais, priorites, indicateurs de suivi | Critique |
| F-18 | F | Suivi plan d'action | Plan F-17 genere | 1. Consulter le plan d'action 2. Marquer une action comme "En cours" 3. Marquer comme "Terminee" | Plan mis a jour, progression calculee, alerte si retard sur une action | Haute |
| F-19 | F | Rapport d'inspection ministerielle | Inspection effectuee par le ministere | 1. Enregistrer les constats de l'inspection 2. Generer le rapport | Rapport d'inspection avec: date, inspecteur, constats, ecarts, recommandations, delais | Critique |
| F-20 | F | Fermeture administrative si non-conforme | Score < 75/150 apres delai | 1. Systeme detecte la non-conformite 2. Appliquer la procedure | Fermeture administrative enregistree, agreement suspendu, notification publique, blocage des operations | Critique |

---

## MODULE G — Securite (15 cas)

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| G-01 | G | Detection transaction suspecte (montant eleve) | Client achete 3 engins a 5 000 000 FCFA chacun | 1. Enregistrer les transactions 2. Executer le batch de detection | Alerte "Transaction suspecte — montant cumule 15 000 000 FCFA en 48h", score de risque calcule | Critique |
| G-02 | G | Detection structuration (smurfing) | Client effectue 5 achats de 1 800 000 FCFA (juste sous le seuil) | 1. Enregistrer les transactions 2. Executer le batch | Alerte "Structuration detectee — 5 transactions limite seuil", suspicion de smurfing | Critique |
| G-03 | G | Signalement CNTI (Cellule Nationale de Traitement des Informations) | Alerte G-01 ou G-02 detectee | 1. Consulter l'alerte 2. Cliquer "Signaler au CNTI" 3. Saisir les details 4. Confirmer | Signalement CNTI cree avec: reference, details transaction, profil client, historique, statut "Signale" | Critique |
| G-04 | G | Blacklist modele interdit | Modele "MOTO-XYZ-2021" sur liste noire | 1. Tenter d'enregistrer un engin de ce modele 2. Valider | Blocage immediat, message "Modele interdit depuis 2022 — reference blacklist: BL-2022-045", signalement automatique | Critique |
| G-05 | G | Consultation liste noire | Administrateur connecte | 1. Acceder a la section "Liste noire" 2. Consulter la liste | Liste des modeles interdits avec: reference, date d'interdiction, motif, arrete de reference | Haute |
| G-06 | G | Gestion saisie (enregistrement) | Autorite judiciaire notifie une saisie | 1. Enregistrer la saisie 2. Saisir le numero de procedure 3. Uploader l'ordonnance 4. Selectionner les engins concernes 5. Valider | Engins passes en statut "Saisi", blocage de toute transaction, notification aux proprietaires | Critique |
| G-07 | G | Consultation saisies actives | Plusieurs saisies enregistrees | 1. Acceder a la liste des saisies 2. Filtrer par statut "Actif" | Liste des saisies actives avec: numero procedure, date, engins concernes, autorite, statut | Haute |
| G-08 | G | Lever une saisie | Saisie G-06 active | 1. Acceder a la saisie 2. Uploader l'ordonnance de mainlevee 3. Valider | Statut "Saisie levee", engins redeviennent disponibles, notification envoyee | Haute |
| G-09 | G | Detection client a risque (PEP) | Client identifie comme Personne Politiquement Exposee | 1. Enregistrer l'information 2. Tenter une vente | Alerte "Client PEP — verification renforcee obligatoire", procedure renforcee KYC declenchee | Critique |
| G-10 | G | Audit trail des actions sensibles | Actions effectuees sur le systeme | 1. Consulter le journal d'audit 2. Filtrer par date et utilisateur | Journal complet: date/heure, utilisateur, action, IP, resultat, hash de verification | Critique |
| G-11 | G | Detection connexion anormale | Utilisateur se connecte depuis IP inhabituelle | 1. Simuler connexion depuis nouvelle IP 2. Verifier l'alerte | Alerte "Connexion depuis localisation inhabituelle — verification requise", MFA force | Haute |
| G-12 | G | Blocage compte apres tentatives echouees | Utilisateur standard | 1. Tenter 5 connexions avec mot de passe incorrect 2. Verifier | Compte bloque apres 5 tentatives, message "Compte temporairement bloque — contacter l'administrateur" | Haute |
| G-13 | G | Consultation historique alertes securite | Plusieurs alertes generees | 1. Acceder a l'historique des alertes 2. Filtrer par type 3. Consulter le detail | Liste chronologique avec: type, date, gravite, statut, actions prises | Moyenne |
| G-14 | G | Export alertes securite (CNTI) | Alertes sur la periode | 1. Selectionner la periode 2. Choisir format "Export CNTI" 3. Generer | Fichier XML conforme au format CNTI avec toutes les alertes de la periode | Haute |
| G-15 | G | Rapport mensuel securite | Mois clos | 1. Generer le rapport mensuel 2. Verifier le contenu | Rapport avec: nombre d'alertes, type, montants suspects, signalements CNTI, tendances | Moyenne |

---

## MODULE H — Portail Ministere (15 cas)

### H.1 — Vue Nationale et Agregations

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| H-01 | H | Vue nationale agregee (tableau de bord) | Administrateur ministere connecte, donnees disponibles | 1. Se connecter au portail ministere 2. Consulter le tableau de bord | Vue d'ensemble: nombre d'operateurs par type, volume de ventes, taux de conformite, alertes en cours | Critique |
| H-02 | H | Agregation par region | Operateurs dans 5 regions | 1. Selectionner "Vue par region" 2. Filtrer par region | Donnees aggregees par region: nombre d'operateurs, ventes, conformite moyenne, engins en circulation | Haute |
| H-03 | H | Agregation par type d'engin | Donnees sur 10 modeles | 1. Selectionner "Vue par modele" 2. Filtrer | Top 10 des modeles vendus, modeles interdits detectes, tendances | Moyenne |
| H-04 | H | Carte geographique des operateurs | Operateurs geolocalises | 1. Acceder a la carte 2. Zoomer sur une region | Carte interactive avec: position des operateurs, couleur selon statut conformite, clusters | Faible |
| H-05 | H | Evolution temporelle (série chronologique) | Donnees sur 12 mois | 1. Selectionner la periode 2. Choisir le type de graphique | Graphique chronologique: evolution des enregistrements, ventes, conformite | Faible |

### H.2 — Delivrance et Gestion des Agreements

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| H-06 | H | Delivrance agreement importateur | Demande A-13 approuvee | 1. Generer l'agreement 2. Saisir le numero "AGR-IMP-2026-001" 3. Signer numeriquement 4. Publier | Agreement delivre, numero actif, notification a l'operateur, publication dans le registre public | Critique |
| H-07 | H | Delivrance agreement distributeur | Demande validee | 1. Generer l'agreement 2. Signer 3. Publier | Agreement "AGR-DIS-2026-XXX" delivre, lie a l'importateur reference | Critique |
| H-08 | H | Delivrance agreement detaillant | Demande validee | 1. Generer l'agreement 2. Signer 3. Publier | Agreement "AGR-DET-2026-XXX" delivre, lie au distributeur reference | Critique |
| H-09 | H | Suspension agreement | Operateur avec infraction | 1. Rechercher l'operateur 2. Initier la suspension 3. Saisir le motif 4. Signer 5. Confirmer | Agreement suspendu, numero invalide, operations bloquees, notification, publication | Critique |
| H-10 | H | Revocation agreement | Suspension confirmee, non-conformite persistante | 1. Initier la revocation 2. Saisir le motif detaille 3. Signer 4. Confirmer | Agreement revoque, operateur radie du registre, fermeture administrative, notification publique | Critique |

### H.3 — Publications et Communications

| ID | Module | Fonctionnalite | Preconditions | Etapes | Resultat attendu | Priorite |
|---|---|---|---|---|---|---|
| H-11 | H | Publication reglementaire (liste operateurs agreees) | Mise a jour mensuelle | 1. Generer la liste des operateurs agreees 2. Publier sur le site web ministeriel | Liste publique a jour avec: nom, type, numero agreement, date de validite, statut | Haute |
| H-12 | H | Publication liste noire modeles | Nouveau modele interdit | 1. Ajouter le modele a la liste noire 2. Publier | Liste noire mise a jour avec: modele, date d'interdiction, arrete de reference, date effet | Haute |
| H-13 | H | Circulaire ministerielle (notification aux operateurs) | Nouvelle directive | 1. Rediger la circulaire 2. Selectionner les destinataires (tous les operateurs actifs) 3. Envoyer | Circulaire envoyee a tous les operateurs, accuse de reception, historique des communications | Haute |
| H-14 | H | Consultation rapports soumis par operateur | Rapports E-06 soumis | 1. Rechercher l'operateur 2. Consulter ses rapports 3. Verifier le contenu | Liste des rapports avec: trimestre, date soumission, statut, lien vers detail | Haute |
| H-15 | H | Validation/Rapport ministeriel (signalement a la justice) | Operateur en non-conformite grave | 1. Constater les infractions 2. Rediger le rapport 3. Signer numeriquement 4. Transmettre a la justice | Rapport transmis, reference unique generee, suivi de la procedure | Critique |

---

## Donnees de Test (Mock Data)

### Importateurs de test

| Denomination | RCCM | IFU | Type | Statut |
|---|---|---|---|---|
| MOTO IMPORT BF SA | RCCM-BF-2024-A-12345 | 0012345678901 | Importateur | Actif |
| ENGINS DU FASO SARL | RCCM-BF-2024-A-67890 | 0012345678902 | Importateur | Actif |
| AFRIQUE MOTO IMPORT | RCCM-BF-2024-A-11111 | 0012345678903 | Importateur | Suspendu |

### Distributeurs de test

| Denomination | RCCM | Importateur source | Statut |
|---|---|---|---|
| DISTRI MOTO CENTRE | RCCM-BF-2024-B-67890 | MOTO IMPORT BF SA | Actif |
| MOTO LOGISTIQUE BF | RCCM-BF-2024-B-22222 | MOTO IMPORT BF SA | Actif |

### Detaillants de test

| Denomination | RCCM | Distributeur source | Statut |
|---|---|---|---|
| MOTO SHOP OUAGA | RCCM-BF-2024-C-11111 | DISTRI MOTO CENTRE | Actif |
| TWO WHEELS BOBO | RCCM-BF-2024-C-33333 | DISTRI MOTO CENTRE | Actif |

### Engins de test

| VIN | Modele | Annee | NGP | Statut |
|---|---|---|---|---|
| ML8BCE7H8KJ123456 | MOTO XR 150L | 2025 | 8903.21.00 | En stock |
| ML8BCE7H8KJ789012 | MOTO CGL 125 | 2024 | 8903.21.00 | Vendu |
| ML8BCE7H8KJ345678 | MOTO MODELE-BAN-2022 | 2021 | 8903.21.00 | Interdit |

### Clients de test

| Nom | Prenom | CNIB | Telephone | Statut KYC |
|---|---|---|---|---|
| KABORE | Jean | B1234567890123 | +226 70 12 34 56 | Complet |
| OUEDRAOGO | Marie | B9876543210987 | +226 70 98 76 54 | Complet |
| COMPAORE | Amadou | B4567890123456 | +226 71 23 45 67 | Incomplet |

---

*Document genere par l'equipe QA Reglementaire iReg Moto BF — 155 cas de test fonctionnels*
