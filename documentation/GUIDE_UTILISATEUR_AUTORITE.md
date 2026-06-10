# Guide Utilisateur — Application Autorites

**iReg Moto BF — Plateforme de Gestion Reglementaire**

Ce guide presente l'ensemble des fonctionnalites de l'application **Autorites** destinee aux agents de regulation : Ministere du Commerce, CNTI, controleurs et super administrateurs.

---

## Table des matieres

1. [Connexion au portail](#1-connexion-au-portail)
2. [Tableau de bord national](#2-tableau-de-bord-national)
3. [Gerer les agrements](#3-gerer-les-agrements)
4. [Valider les rapports trimestriels](#4-valider-les-rapports-trimestriels)
5. [Planifier une inspection](#5-planifier-une-inspection)
6. [Detecter les fraudes](#6-detecter-les-fraudes)
7. [Gerer les interdictions](#7-gerer-les-interdictions)
8. [Publier un texte reglementaire](#8-publier-un-texte-reglementaire)
9. [FAQ](#9-faq)

---

## 1. Connexion au portail

### 1.1 Acceder a l'application Autorites

1. Ouvrez votre navigateur web
2. Saisissez l'URL : `https://autorite.ireg-moto-bf.gov.bf`
3. La page de connexion s'affiche

### 1.2 Saisir ses identifiants

```
+----------------------------------------------------------+
|           iReg Moto BF                                    |
|       Portail des Autorites de Regulation                |
|                                                           |
|  Email professionnel : [___________________________]     |
|                                                           |
|  Mot de passe :        [___________________________]     |
|                                                           |
|  [x] Se souvenir de moi                                  |
|                                                           |
|  [              SE CONNECTER              ]               |
|                                                           |
|  Mot de passe oublie ?  |  Aide technique                |
+----------------------------------------------------------+
```

1. Saisissez votre **email professionnel** (ex: `admin@mincommerce.gov.bf`)
2. Saisissez votre **mot de passe**
3. Cliquez sur **"Se connecter"**

### 1.3 Authentification MFA

Apres saisie des identifiants, un ecran de verification en deux etapes apparait :

1. Ouvrez votre application d'authentification (Google Authenticator, Microsoft Authenticator, etc.)
2. Saisissez le code a 6 chiffres affiche
3. Cliquez sur **"Verifier"**

> **Premiere connexion** : Si vous ne voyez pas de compte "iRegMotoBF" dans votre application, contactez votre administrateur pour obtenir un QR code de configuration.

### 1.4 Recuperation d'acces

En cas de perte d'acces MFA ou de mot de passe :

1. Contactez le **Super Administrateur** de la plateforme
2. Une procedure de verification d'identite sera mise en oeuvre :
   - Confirmation par email professionnel
   - Verification telephonique
   - Validation par un superieur hierarchique
3. Apres validation, votre MFA sera reinitialise et un nouveau mot de passe temporaire sera genere

### 1.5 Deconnexion

Pour vous deconnecter :
1. Cliquez sur votre nom en haut a droite
2. Selectionnez **"Deconnexion"**
3. Vous etes redirige vers la page de connexion

> **Important** : Deconnectez-vous systematiquement en quittant votre poste, meme temporairement.

---

## 2. Tableau de bord national

Le tableau de bord national offre une **vue synthetique et en temps reel** de l'ensemble du secteur des deux-roues au Burkina Faso.

### 2.1 Vue d'ensemble

```
+-----------------------------------------------------------------------+
| iReg Moto BF    [Tableau de bord] [Agrements] [Rapports] [Fraudes]  |
+-----------------------------------------------------------------------+
|                                                                       |
|  PERIODE : [Juin 2026]  [Region : Toutes]  [Actualiser]              |
|                                                                       |
|  +-------------------+ +-------------------+ +---------------------+ |
|  | ENTREPRISES       | | VENTES NATIONALES | | TAUX DE CONFORMITE  | |
|  | AGREES            | | (mois en cours)   | | MOYEN               | |
|  |                   | |                   | |                     | |
|  |      847          | |    12 847         | |     87.3%           | |
|  | [+23 ce mois]     | | [+8.2% vs mai]   | | [-1.2% vs mai]      | |
|  +-------------------+ +-------------------+ +---------------------+ |
|                                                                       |
|  +-------------------+ +-------------------+ +---------------------+ |
|  | VEHICULES EN      | | RAPPORTS Q2       | | ALERTES FRAUDE      | |
|  | CIRCULATION       | | EN ATTENTE        | | EN COURS            | |
|  |                   | |                   | |                     | |
|  |   284 521         | |      47           | |      12             | |
|  | [+1 245 ce mois]  | | [A valider]       | | [Investiguer]       | |
|  +-------------------+ +-------------------+ +---------------------+ |
|                                                                       |
|  +---------------------------------------------------------------+   |
|  |                    CARTE NATIONALE INTERACTIVE                 |   |
|  |                                                                |   |
|  |     +---+                                                      |   |
|  |    /       \    [Centre] 247 entreprises | 4 521 ventes/mois  |   |
|  |   |  *  *  |                                                   |   |
|  |   |  Ouaga |    [Hauts-Bassins] 156 | 2 847 ventes/mois       |   |
|  |    \  *  * /                                                    |   |
|  |     +----+     [Cascades] 89 | 1 234 ventes/mois               |   |
|  |                                                                |   |
|  |  [Boucle du Mouhoun] 112 | 1 876 ventes/mois                  |   |
|  |  [Nord] 98 | 1 543 ventes/mois                                 |   |
|  |  [Sahel] 45 | 678 ventes/mois                                  |   |
|  |                                                                |   |
|  |  Cliquez sur une region pour voir le detail                    |   |
|  +---------------------------------------------------------------+   |
|                                                                       |
|  +---------------------------+  +----------------------------------+ |
|  | TOP 5 MARQUES (ventes)     |  |  EVOLUTION MENSUELLE (12 mois) | |
|  |                            |  |                                 | |
|  | 1. YAMAHA      4 521 (35%)|  |  [Courbe ascendante]            | |
|  | 2. HONDA       3 847 (30%)|  |                                 | |
|  | 3. SUZUKI      2 134 (17%)|  |  Jan: 10.2k -> Juin: 12.8k    | |
|  | 4. TVS           987 (8%) |  |  +25.5% sur 6 mois             | |
|  | 5. Autres        358 (3%) |  |                                 | |
|  |                            |  |                                 | |
|  +---------------------------+  +----------------------------------+ |
|                                                                       |
|  +---------------------------+  +----------------------------------+ |
|  | ALERTES RECENTES           |  |  ACTIVITE RECENTE               | |
|  |                            |  |                                 | |
|  | ! Fraude detectee :       |  | - Rapport Q2 #1247 valide       | |
|  |   VIN duplique (3 ventes) |  |   (Suzuki BF) il y a 1h        | |
|  |   [Investiguer]           |  | - Agrement #892 approuve        | |
|  |                           |  |   (Moto Express) il y a 2h     | |
|  | ! Stock anormal :         |  | - Inspection #456 realisee      | |
|  |   -150 unites (ajustement)|  |   (Yamaha BF) il y a 3h        | |
|  |   [Verifier]              |  | - Alerte fraude #78 creee       | |
|  |                           |  |   il y a 4h                     | |
|  +---------------------------+  +----------------------------------+ |
|                                                                       |
+-----------------------------------------------------------------------+
```

### 2.2 Indicateurs cles nationaux (KPIs)

| KPI | Description | Source |
|---|---|---|
| **Entreprises agreees** | Nombre total d'operateurs avec agrement valide | Base agrements |
| **Ventes nationales** | Volume de ventes enregistrees sur le mois | Declarations entreprises |
| **Taux de conformite moyen** | Score moyen de conformite sur 150 points | Calcul agregé |
| **Vehicules en circulation** | Total des vehicules immatricules actifs | Base immatriculations |
| **Rapports en attente** | Rapports trimestriels a valider | Workflow rapports |
| **Alertes fraude** | Investigations en cours | Module fraude |

### 2.3 Carte nationale interactive

La carte du Burkina Faso est interactive et permet de :

- **Survoler** une region : Affiche un tooltip avec les indicateurs cles
- **Cliquer** sur une region : Ouvre le detail regional avec :
  - Liste des entreprises de la region
  - Volume de ventes mensuelles
  - Taux de conformite regional
  - Alertes specifiques a la region
  - Planning des inspections

**Regions couvertes** :

| Region | Entreprises | Ventes/mois | Conformite |
|---|---|---|---|
| Boucle du Mouhoun | 112 | 1 876 | 89.2% |
| Cascades | 89 | 1 234 | 91.5% |
| Centre | 247 | 4 521 | 85.1% |
| Centre-Est | 67 | 987 | 88.7% |
| Centre-Nord | 54 | 765 | 90.3% |
| Centre-Ouest | 78 | 1 123 | 87.6% |
| Est | 43 | 654 | 92.1% |
| Hauts-Bassins | 156 | 2 847 | 86.4% |
| Nord | 98 | 1 543 | 89.8% |
| Plateau Central | 71 | 876 | 91.2% |
| Sahel | 45 | 678 | 93.5% |
| Sud-Ouest | 52 | 765 | 90.8% |

### 2.4 Filtres temporels et regionaux

- **Periode** : Selectionnez le mois ou le trimestre a analyser
- **Region** : Filtrez par region administrative ou "Toutes"
- **Type d'entreprise** : Importateurs, Distributeurs, Assembleurs, Detallants
- **Actualiser** : Force le rafraichissement des donnees (cache : 5 minutes)

---

## 3. Gerer les agrements

Le module d'agrement gere le cycle de vie complet des agrements des operateurs du secteur.

### 3.1 Consulter les demandes d'agrement

1. Dans le menu lateral, cliquez sur **"Agrements"**
2. L'ecran d'agrement s'affiche avec :
   - **Onglet "En attente"** : Demandes a examiner
   - **Onglet "Approuves"** : Agrements actifs
   - **Onglet "Suspendus"** : Agrements temporairement suspendus
   - **Onglet "Revokes"** : Agrements definitivement revoques
   - **Onglet "Expires"** : Agrements dont la validite est passee

### 3.2 Examiner une demande d'agrement

1. Dans l'onglet **"En attente"**, cliquez sur une demande
2. La fiche detaillee s'affiche :

```
+---------------------------------------------------------------+
|  DEMANDE D'AGREMENT #AGR-2026-00489                          |
|                                                               |
|  +-------------------+  +-----------------------------+      |
|  | ENTREPRISE        |  | DEMANDEUR                   |      |
|  | Moto Express BF   |  | Jean-Baptiste SAWADOGO      |      |
|  | NIF: 0009876543   |  | Directeur General           |      |
|  | RCCM: BF-OUA-2026 |  | jean.b.sawadogo@...         |      |
|  | Secteur: Detallant|  | +226 70 55 44 33            |      |
|  +-------------------+  +-----------------------------+      |
|                                                               |
|  +--------------------------------------------------------+ |
|  | DOCUMENTS JOINTS                                        | |
|  |                                                         | |
|  | [x] RCCM                                                | |
|  | [x] Attestation fiscale                                 | |
|  | [x] Plan de localisation                                | |
|  | [x] Certificat d'assurance responsabilite               | |
|  | [x] Curriculum vitae du responsable                     | |
|  | [ ] Plan de securite (MANQUANT)                         | |
|  | [x] Attestation de non-condamnation                     | |
|  +--------------------------------------------------------+ |
|                                                               |
|  Historique de l'entreprise :                                 |
|  - Premiere demande (jamais agreee auparavant)               |
|                                                               |
|  [     REJETER      ]  [   DEMANDER COMPLEMENTS  ]           |
|  [                APPROUVER L'AGREMENT              ]        |
+---------------------------------------------------------------+
```

**Verification a effectuer** :
- Verifier la validite du NIF et du RCCM
- Verifier l'exactitude des documents joints
- Verifier l'absence d'antecedents de fraude
- Verifier la conformite du local (si inspection sur place)

### 3.3 Approuver un agrement

1. Apres verification, cliquez sur **"Approuver l'agrement"**
2. Saisissez les parametres de l'agrement :
   - **Date de debut** : Date de prise d'effet
   - **Date d'expiration** : Generalement 1 an plus tard
   - **Numero d'agrement** : Genere automatiquement
   - **Observations** : Notes eventuelles
3. Cliquez sur **"Confirmer l'approbation"**
4. L'agrement est delivre et l'entreprise est notifiee par email

**Notification envoyee** :
- Email a l'entreprise avec le numero d'agrement
- Attestation PDF telechargeable depuis le portail entreprise
- Mise a jour du statut dans la base nationale

### 3.4 Suspendre un agrement

La suspension est temporaire et motivee :

1. Ouvrez la fiche de l'agrement actif
2. Cliquez sur **"Suspendre"**
3. Remplissez le formulaire :
   - **Motif** : Non-conformite / Fraude suspectee / Demande de l'entreprise / Autre
   - **Description** : Details de la suspension
   - **Duree** : Duree prevue de la suspension
   - **Conditions de levee** : Ce que l'entreprise doit faire pour lever la suspension
4. Cliquez sur **"Confirmer la suspension"**
5. L'entreprise est notifiee et ne peut plus effectuer d'operations sur la plateforme

### 3.5 Revoquer un agrement

La revocation est definitive :

1. Ouvrez la fiche de l'agrement
2. Cliquez sur **"Revoquer"**
3. Confirmez la revocation avec :
   - **Motif detaille** : Raison de la revocation
   - **Reference reglementaire** : Article de l'arrete 05/06/2026 viole
   - **Date d'effet** : Immediate ou differee
4. La revocation est enregistree et :
   - L'entreprise est notifiee
   - Ses comptes utilisateurs sont desactives
   - Ses stocks sont geles
   - Une alerte est generee pour les controleurs

### 3.6 Renouveler un agrement

1. Dans l'onglet **"Expires"** ou **"Approuves"**, cliquez sur l'agrement
2. Cliquez sur **"Renouveler"**
3. Verifiez les informations (mises a jour si necessaire)
4. Saisissez la nouvelle date d'expiration
5. Cliquez sur **"Confirmer le renouvellement"**

---

## 4. Valider les rapports trimestriels

### 4.1 Consulter les rapports en attente

1. Dans le menu lateral, cliquez sur **"Rapports"**
2. L'onglet **"En attente de validation"** s'affiche

| Colonne | Description |
|---|---|
| Reference | Numero unique du rapport (ex: RPT-2026-T2-001) |
| Entreprise | Nom de l'entreprise declarante |
| Periode | Trimestre concerne |
| Date de soumission | Date et heure de transmission |
| Scoring conformite | Score de l'entreprise au moment de la soumission |
| Delai | Jours restants avant penalite |

### 4.2 Examiner un rapport

1. Cliquez sur le rapport a examiner
2. Le rapport detaille s'affiche :

```
+---------------------------------------------------------------+
|  RAPPORT TRIMESTRIEL #RPT-2026-T2-001                        |
|  Entreprise : Suzuki Burkina Faso                             |
|  Periode : T2 2026 (avril-juin)                              |
|  Soumis le : 10/07/2026 a 14:32                              |
|                                                               |
|  +------------------------+  +---------------------------+   |
|  |  VENTES DECLAREES      |  |  STOCK DECLARE            |   |
|  |  42 vehicules          |  |  198 vehicules            |   |
|  |  CA : 42 500 000 FCFA  |  |                           |   |
|  +------------------------+  +---------------------------+   |
|                                                               |
|  +--------------------------------------------------------+ |
|  |  VERIFICATION CROISEE (donnees systeme vs declarees)    | |
|  |                                                         | |
|  |  Ventes systeme : 42  |  Ventes declarees : 42   [OK]  | |
|  |  Stock systeme  : 198 |  Stock declare    : 198  [OK]  | |
|  |  CA systeme     : 42.5M| CA declare       : 42.5M [OK]  | |
|  |                                                         | |
|  |  Toutes les donnees sont coherentes.                    | |
|  +--------------------------------------------------------+ |
|                                                               |
|  Incidents declares :                                         |
|  - 15/04 : Retard livraison (resolu)                         |
|  - 02/05 : Piece defectueuse (en cours)                      |
|                                                               |
|  Documents joints :                                           |
|  [x] Bilan comptable trimestriel                             |
|  [x] Inventaire physique signe                                |
|  [x] Attestations CNTI                                        |
|                                                               |
|  [       DEMANDER DES COMPLEMENTS      ]                     |
|  [                VALIDER LE RAPPORT                ]        |
+---------------------------------------------------------------+
```

### 4.3 Verification croisee automatique

La plateforme effectue automatiquement une verification croisee entre :
- Les ventes enregistrees dans le systeme vs les ventes declarees
- Le stock systeme vs le stock declare
- Le CA calcule vs le CA declare

En cas d'ecart, une alerte est generee :

| Type d'ecart | Severite | Action |
|---|---|---|
| Ecart < 2% | Mineure | Accepter avec mention |
| Ecart 2-5% | Moderee | Demander justification |
| Ecart 5-10% | Elevee | Demander corrections |
| Ecart > 10% | Critique | Rejeter, inspection recommandee |

### 4.4 Valider un rapport

Si les donnees sont correctes :
1. Cliquez sur **"Valider le rapport"**
2. Saisissez un commentaire de validation (optionnel)
3. Cliquez sur **"Confirmer la validation"**
4. Le statut passe a **"Valide"**
5. L'entreprise est notifiee

### 4.5 Demander des complements

Si des informations manquent ou sont incorrectes :
1. Cliquez sur **"Demander des complements"**
2. Cochez les elements a corriger :
   - [ ] Donnees de ventes incoherentes
   - [ ] Documents manquants
   - [ ] Informations incompletes
   - [ ] Autre (preciser)
3. Saisissez votre commentaire detaille
4. Cliquez sur **"Envoyer la demande"**
5. L'entreprise est notifiee et peut soumettre une version corrigee

---

## 5. Planifier une inspection

### 5.1 Acceder au module Inspections

1. Dans le menu lateral, cliquez sur **"Inspections"**
2. L'ecran des inspections s'affiche avec :
   - **Onglet "A planifier"** : Inspections recommandees par le systeme
   - **Onglet "Planifiees"** : Inspections programmees
   - **Onglet "Realisees"** : Inspections terminees avec rapports
   - **Onglet "En retard"** : Inspections non effectuees apres la date prevue

### 5.2 Creer une inspection

**Methode 1 — Depuis une recommandation systeme**

1. Dans l'onglet **"A planifier"**, consultez les recommandations :
   - Entreprises avec score de conformite en baisse
   - Alertes de fraude necessitant verification
   - Controles periodiques automatiques
   - Nouvelles entreprises (controle initial)
2. Cliquez sur **"Planifier"** a cote de la recommandation

**Methode 2 — Inspection manuelle**

1. Cliquez sur **"+ Nouvelle inspection"**
2. Remplissez le formulaire :

| Champ | Obligatoire | Description |
|---|---|---|
| Entreprise | Oui | Selection de l'entreprise |
| Type d'inspection | Oui | Reguliere / Inopinee / Suite a alerte / Initiale |
| Inspecteur assigne | Oui | Agent qui effectuera l'inspection |
| Date prevue | Oui | Date et heure de l'inspection |
| Duree estimee | Non | Duree prevue (defaut : 2h) |
| Motif | Oui | Raison de l'inspection |
| Points de controle specifiques | Non | Elements particuliers a verifier |

3. Cliquez sur **"Planifier l'inspection"**
4. L'inspection apparait dans l'onglet **"Planifiees"**
5. L'inspecteur et l'entreprise sont notifies

### 5.3 Effectuer une inspection

L'inspecteur, sur le terrain, utilise son acces mobile :

1. Se connecte a la plateforme sur son appareil mobile
2. Accede a **"Mes inspections"**
3. Selectionne l'inspection du jour
4. Remplit la **grille d'evaluation** :

| Categorie | Points | Criteres |
|---|---|---|
| Agrement | 15 | Validite, affichage, respect des conditions |
| Stocks | 20 | Enregistrement, QR codes, etat physique |
| Ventes | 20 | Declarations en temps reel, facturation |
| KYC | 15 | Completude des fiches, documents |
| Conformite technique | 20 | Certificats CNTI, etat vehicules |
| Local | 10 | Conditions de stockage, securite |
| Personnel | 10 | Formations, connaissance des procedures |
| **Total** | **150** | **Seuil de conformite : 120** |

5. Pour chaque critere, l'inspecteur attribute une note et prend des photos si necessaire
6. Redige le **rapport d'inspection** avec recommandations
7. Signe electroniquement le rapport
8. Soumet le rapport

### 5.4 Suivre les inspections

Dans l'onglet **"Planifiees"**, vous pouvez :
- **Modifier** la date ou l'inspecteur
- **Annuler** l'inspection (avec motif)
- **Reprogrammer** en cas d'indisponibilite

---

## 6. Detecter les fraudes

Le module de detection des fraudes utilise des algorithmes automatises et des signalements pour identifier les comportements suspects.

### 6.1 Consulter les alertes de fraude

1. Dans le menu lateral, cliquez sur **"Fraudes"**
2. L'ecran des alertes s'affiche :

```
+---------------------------------------------------------------+
|  DETECTION DES FRAUDES — 12 alertes actives                  |
|                                                               |
|  Filtres : [Severite : Toutes] [Statut : Toutes] [Type : Toutes] |
|                                                               |
|  +-----+----------------+----------------+----------+--------+ |
|  | #   | Type           | Entreprise     | Severite | Statut | |
|  +-----+----------------+----------------+----------+--------+ |
|  | 78  | VIN duplique   | Boutique Moto X| CRITIQUE | Ouverte| |
|  | 77  | Stock negatif  | Moto Express   | Haute    | En inv.| |
|  | 76  | KYC suspect    | Scooters BF    | Moyenne  | Ouverte| |
|  | 75  | QR code invalide| Garage Y      | Moyenne  | Resolue| |
|  | ... |                |                |          |        | |
|  +-----+----------------+----------------+----------+--------+ |
|                                                               |
|  [     NOUVELLE ALERTE MANUELLE      ]                       |
+---------------------------------------------------------------+
```

### 6.2 Types de fraudes detectees automatiquement

| Type | Description | Severite |
|---|---|---|
| **VIN duplique** | Meme VIN enregistre pour plusieurs ventes | Critique |
| **Stock negatif** | Sorties de stock superieures aux entrees | Haute |
| **QR code invalide** | QR code scane non reconnu dans la base | Haute |
| **KYC suspect** | Pieces d'identite potentiellement fausses | Moyenne |
| **Vente retroactive** | Ventes datees de plus de 7 jours | Moyenne |
| **Ecart rapport** | Ecart > 5% entre declaration et realite | Moyenne |
| **Circuit parallele** | Vehicule non enregistre par l'importateur officiel | Haute |
| **Contrefaçon** | Vehicule ou piece soupçonnee de contrefaçon | Critique |

### 6.3 Investiguer une alerte

1. Cliquez sur l'alerte a investiguer
2. La fiche d'investigation s'affiche :

```
+---------------------------------------------------------------+
|  ALERTE #78 — VIN DUPLIQUE — CRITIQUE                        |
|                                                               |
|  VIN concerne : ML8DCRKP0N0001234                            |
|                                                               |
|  Historique du vehicule :                                     |
|  +----------------+------------+----------------+-----------+ |
|  | Date           | Operation  | Entreprise     | Client    | |
|  +----------------+------------+----------------+-----------+ |
|  | 15/03/2026     | Import     | Suzuki BF      | —         | |
|  | 20/03/2026     | Vente      | Suzuki BF      | KABORE S. | |
|  | 05/04/2026     | Vente      | Boutique Moto X| OUEDRAOGO | |
|  |                |            |                | M. (???)  | |
|  +----------------+------------+----------------+-----------+ |
|                                                               |
|  Anomalie : Le vehicule a ete vendu 2 fois !                 |
|                                                               |
|  +--------------------------------------------------------+ |
|  |  JOURNAL D'INVESTIGATION                                | |
|  |                                                         | |
|  |  10/07 09:15 — Alerte creee automatiquement            | |
|  |  10/07 09:30 — Inspecteur Compaore assigne             | |
|  |  10/07 11:00 — Inspection sur place programmee         | |
|  |                                                         | |
|  |  [Ajouter une note]                                    | |
|  +--------------------------------------------------------+ |
|                                                               |
|  [     CLASSER SANS SUITE      ]  [   CONFIRMER LA FRAUDE    |
+---------------------------------------------------------------+
```

3. L'inspecteur assigne mene l'enquete :
   - Verifie sur place les documents
   - Interroge les parties concernees
   - Collecte les preuves (photos, documents)
4. Remplit le journal d'investigation avec ses notes

### 6.4 Cloturer une alerte

Apres investigation, l'alerte peut etre classee :

| Decision | Description | Consequence |
|---|---|---|
| **Classer sans suite** | Fausse alerte ou explication legitime | Aucune |
| **Infirme** | Fraude confirmee mais mineure | Avertissement ecrit |
| **Confirmer la fraude** | Fraude averee | Suspension, sanction financiere, revocation |
| **Escalader** | Fraude complexe necessitant expertise | Transfert vers justice |

Pour cloturer :
1. Selectionnez la decision
2. Saisissez le rapport detaille
3. Attachez les preuves collectees
4. Cliquez sur **"Cloturer l'alerte"**

---

## 7. Gerer les interdictions (blacklist)

La blacklist recense les vehicules, marques ou modeles interdits a la vente au Burkina Faso.

### 7.1 Consulter la liste des interdictions

1. Dans le menu lateral, cliquez sur **"Interdictions"**
2. La liste des interdictions actives s'affiche :

| Colonne | Description |
|---|---|
| Reference | Numero d'interdiction |
| Type | Modele / Marque / VIN specifique / Categorie |
| Objet | Designation precise |
| Motif | Raison de l'interdiction |
| Date d'effet | Date de prise d'effet |
| Date de fin | Date de fin (vide si permanente) |
| Statut | Active / Levee / Programmee |

### 7.2 Ajouter une interdiction

1. Cliquez sur **"+ Nouvelle interdiction"**
2. Remplissez le formulaire :

| Champ | Obligatoire | Description |
|---|---|---|
| Type | Oui | Modele / Marque / VIN / Categorie |
| Objet | Oui | Designation (ex: "YAMAHA FAKE-125") |
| Motif | Oui | Raison detaillee de l'interdiction |
| Texte reglementaire | Oui | Reference de l'arrete ou decision |
| Date d'effet | Oui | Date de prise d'effet |
| Date de fin | Non | Date de fin (laisser vide si permanente) |
| Description technique | Non | Details techniques du vehicule interdit |
| Photos | Non | Photos du vehicule ou modele interdit |

3. Cliquez sur **"Publier l'interdiction"**
4. L'interdiction est diffusee :
   - Notification aux entreprises concernees
   - Alerte dans leur tableau de bord
   - Blocage automatique des ventes si le modele est en stock
   - Mise a jour de la base de verification QR code

### 7.3 Lever une interdiction

1. Ouvrez l'interdiction a lever
2. Cliquez sur **"Lever l'interdiction"**
3. Saisissez le motif de levee
4. Saisissez la reference du texte reglementaire de levee
5. Cliquez sur **"Confirmer"**
6. L'interdiction passe au statut **"Levee"** et les entreprises sont notifiees

---

## 8. Publier un texte reglementaire

### 8.1 Acceder au module

1. Dans le menu lateral, cliquez sur **"Textes reglementaires"**
2. La liste des textes publies s'affiche

### 8.2 Publier un nouveau texte

1. Cliquez sur **"+ Nouveau texte"**
2. Remplissez le formulaire :

| Champ | Obligatoire | Description |
|---|---|---|
| Type | Oui | Arrete / Circulaire / Note de service / Directive |
| Numero | Oui | Numero officiel du texte |
| Date de signature | Oui | Date de signature par l'autorite |
| Objet | Oui | Resume de l'objet du texte |
| Contenu | Oui | Texte complet du document |
| Date d'effet | Oui | Date de prise d'effet |
| Date de fin | Non | Date de fin (si applicable) |
| Fichier PDF | Oui | Document officiel scanne |
| Entreprises concernees | Oui | Toutes / Importateurs / Distributeurs / etc. |

3. Cochez **"Publier immediatement"** ou programmez une date de publication
4. Cliquez sur **"Publier"**

### 8.3 Impact de la publication

Des la publication :
- Les entreprises concernees recoivent une notification
- Le texte apparait dans leur onglet "Reglementation" du portail entreprise
- Une alerte est generee si le texte necessite une action de leur part
- Le texte est archive et consultable dans l'historique

---

## 9. FAQ

### Authentification et acces

**Q1 : Puis-je acceder a la plateforme depuis mon telephone ?**
> R : Oui, l'application est responsive et fonctionne sur navigateur mobile. Pour les inspections sur le terrain, l'interface mobile optimisee est recommandee.

**Q2 : Mon compte est-il partage entre plusieurs agents ?**
> R : **Non**. Chaque agent dispose d'un compte personnel unique pour des raisons de traçabilite et de securite. Le partage de compte est strictement interdit.

**Q3 : Puis-je deleguer mes taches a un collegue pendant mon absence ?**
> R : Oui, contactez le Super Administrateur pour une delegation temporaire. Les actions effectuees par votre delegue seront tracees sous son nom avec mention de la delegation.

### Tableau de bord et donnees

**Q4 : A quelle frequence les donnees du tableau de bord sont-elles actualisees ?**
> R : Les donnees sont actualisees en temps reel avec un cache de 5 minutes pour optimiser les performances. Le bouton "Actualiser" force le rafraichissement immediat.

**Q5 : Puis-je exporter les donnees du tableau de bord ?**
> R : Oui, cliquez sur l'icone "Exporter" pour telecharger au format Excel ou PDF. Les exports incluent les KPIs, les graphiques et les tableaux detailles.

### Agrements

**Q6 : Quel delai pour instruire une demande d'agrement ?**
> R : Le delai legal est de **30 jours** a compter de la reception d'un dossier complet. Le systeme genere une alerte si ce delai est depasse.

**Q7 : Une entreprise peut-elle exercer sans agrement ?**
> R : **Non**, l'exercice sans agrement constitue une infraction penale. Signalez toute activite non agreee via le module Fraude.

### Inspections

**Q8 : Combien d'inspections une entreprise doit-elle subir par an ?**
> R : Le nombre minimum est de **2 inspections par an** pour les detaillants et **4 pour les importateurs/distributeurs**. Les entreprises a risque peuvent en subir davantage.

**Q9 : L'inspecteur peut-il modifier ses notes apres soumission du rapport ?**
> R : Non, une fois soumis, le rapport d'inspection est verrouille. Seule une procedure d'annulation administrative avec justification peut invalider un rapport.

### Fraudes

**Q10 : Que faire si je decouvre une fraude en dehors de la plateforme ?**
> R : Vous pouvez creer une alerte manuelle via le bouton **"Nouvelle alerte manuelle""** dans le module Fraude. Renseignez toutes les informations dont vous disposez et l'alerte sera traitee comme une alerte automatique.

---

## Contact et support

Pour toute question ou assistance :

- **Email** : support@ireg-moto-bf.gov.bf
- **Telephone** : (+226) 25 XX XX XX (lun-ven, 8h-17h)
- **Chat securise** : Accessible dans l'application (conversations chiffrees)
- **Portail support** : https://support.ireg-moto-bf.gov.bf
