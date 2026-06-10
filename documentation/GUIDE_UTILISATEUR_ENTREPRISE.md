# Guide Utilisateur — Application Entreprises

**iReg Moto BF — Plateforme de Gestion Reglementaire**

Ce guide presente l'ensemble des fonctionnalites de l'application **Entreprises** destinee aux acteurs du secteur des deux-roues motorises au Burkina Faso : importateurs, distributeurs, assembleurs et detaillants.

---

## Table des matieres

1. [Premiere connexion](#1-premiere-connexion)
2. [Tableau de bord](#2-tableau-de-bord)
3. [Gestion des stocks](#3-gestion-des-stocks)
4. [Gestion des clients](#4-gestion-des-clients)
5. [Enregistrer une vente](#5-enregistrer-une-vente)
6. [Generer le rapport trimestriel](#6-generer-le-rapport-trimestriel)
7. [Verifier sa conformite](#7-verifier-sa-conformite)
8. [Parametres](#8-parametres)
9. [FAQ](#9-faq)

---

## 1. Premiere connexion

### 1.1 Acceder a la plateforme

1. Ouvrez votre navigateur web (Chrome, Firefox, Edge — version recente recommandee)
2. Saisissez l'URL de l'application Entreprises : `https://entreprise.ireg-moto-bf.gov.bf`
3. La page de connexion s'affiche :

```
+------------------------------------------+
|           iReg Moto BF                    |
|       Portail Entreprises                |
|                                          |
|  Email : [____________________]          |
|                                          |
|  Mot de passe : [________________]       |
|                                          |
|  [x] Se souvenir de moi                 |
|                                          |
|  [       SE CONNECTER        ]           |
|                                          |
|  Mot de passe oublie ? | Aide            |
+------------------------------------------+
```

### 1.2 Saisir ses identifiants

1. Saisissez votre **adresse email** professionnelle (ex: `importateur@suzuki-bf.bf`)
2. Saisissez votre **mot de passe** (fourni par l'administrateur ou reset par email)
3. Cochez la case **"Se souvenir de moi"** pour rester connecte 7 jours (optionnel)
4. Cliquez sur **"Se connecter"**

### 1.3 Configuration du MFA (premiere connexion uniquement)

Lors de votre premiere connexion, la plateforme vous demande de configurer l'authentification multi-facteurs (MFA) obligatoire :

**Etape 1 — Telecharger une application d'authentification**

Si vous n'en avez pas deja une, telechargez l'une des applications suivantes sur votre smartphone :
- **Google Authenticator** (iOS / Android)
- **Microsoft Authenticator** (iOS / Android)
- **Authy** (iOS / Android)

**Etape 2 — Scanner le QR code**

1. Un QR code s'affiche a l'ecran
2. Ouvrez votre application d'authentification
3. Selectionnez "Ajouter un compte" ou l'icone "+"
4. Scannez le QR code affiche
5. Un compte **"iRegMotoBF"** apparait dans l'application avec un code a 6 chiffres

**Etape 3 — Verifier la configuration**

1. Saisissez le code a 6 chiffres affiche dans votre application
2. Cliquez sur **"Verifier"**
3. En cas de succes, vos **codes de secours** s'affichent

**Etape 4 — Conserver les codes de secours**

- Les codes de secours vous permettent de vous connecter si vous perdez l'acces a votre telephone
- **Imprimez-les** ou copiez-les dans un endroit sur
- Chaque code ne peut etre utilise qu'une seule fois
- Ils ne seront **plus jamais affiches** apres cette etape

### 1.4 Connexion avec MFA (connexions ulterieures)

1. Saisissez votre email et mot de passe
2. Un ecran **"Verification en deux etapes"** apparait
3. Ouvrez votre application d'authentification
4. Saisissez le code a 6 chiffres actuel
5. Cliquez sur **"Verifier"**
6. Vous etes connecte a votre tableau de bord

### 1.5 Mot de passe oublie

1. Sur la page de connexion, cliquez sur **"Mot de passe oublie ?"**
2. Saisissez votre adresse email
3. Cliquez sur **"Envoyer le lien de reinitialisation"**
4. Consultez votre boite de reception (verifiez aussi les spams)
5. Cliquez sur le lien recu (valable 1 heure)
6. Saisissez votre **nouveau mot de passe** (minimum 12 caracteres, majuscule, minuscule, chiffre, caractere special)
7. Confirmez le nouveau mot de passe
8. Cliquez sur **"Reinitialiser"**

> **Conseil de securite** : Ne partagez jamais votre mot de passe ni vos codes de secours. Utilisez un gestionnaire de mots de passe si possible.

---

## 2. Tableau de bord

Apres connexion, le **tableau de bord** s'affiche. C'est votre centre de commande quotidien.

### 2.1 Vue d'ensemble du tableau de bord

```
+-----------------------------------------------------------------------+
|  iReg Moto BF    [Tableau de bord] [Stocks] [Clients] [Ventes] ...   |
+-----------------------------------------------------------------------+
|                                                                       |
|  +----------------+  +----------------+  +-------------------------+ |
|  | VEHICULES EN   |  | VENTES DU MOIS |  | SCORING CONFORMITE      | |
|  | STOCK          |  |                |  |                         | |
|  |     247        |  |      18        |  |    142 / 150 pts        | |
|  | [+5% vs mois   |  | [+12% vs      |  |    [=======] 94.7%      | |
|  |  precedent]    |  |  mois prec.]   |  |    Statut : VERT        | |
|  +----------------+  +----------------+  +-------------------------+ |
|                                                                       |
|  +----------------+  +----------------+  +-------------------------+ |
|  | CLIENTS ACTIFS |  | ALERTES EN     |  | PROCHAIN RAPPORT        | |
|  |                |  | ATTENTE        |  | TRIMESTRIEL             | |
|  |     156        |  |       2        |  |                         | |
|  | [+3 nouveaux]  |  | [A traiter]    |  |    Q2 2026              | |
|  |                |  |                |  |    Echeance : 15/07     | |
|  +----------------+  +----------------+  +-------------------------+ |
|                                                                       |
|  +---------------------------------------------------------------+   |
|  |                    EVOLUTION DES VENTES                        |   |
|  |     [Graphique en courbe : janvier -> juin 2026]              |   |
|  |                                                                |   |
|  |  25 |                                          *               |   |
|  |  20 |                              *        *     *            |   |
|  |  15 |                  *        *     *  *                    |   |
|  |  10 |       *       *     *  *                                |   |
|  |   5 |    *     *  *                                            |   |
|  |   0 +----+----+----+----+----+----+----+                       |   |
|  |      Jan  Fev  Mar  Avr  Mai  Juin  Juil                      |   |
|  +---------------------------------------------------------------+   |
|                                                                       |
|  +-------------------------+  +-----------------------------------+  |
|  |    ALERTES RECENTES      |  |      ACTIVITE RECENTE            |  |
|  |                          |  |                                  |  |
|  |  ! Stock critique :      |  | - Vente #1847 enregistree        |  |
|  |    Scooter YBR 125 (3u)  |  |   il y a 2 heures               |  |
|  |    [Voir le stock]       |  | - Client KABORE Sophie ajoute    |  |
|  |                          |  |   il y a 5 heures               |  |
|  |  ! Rapport Q1 2026 :     |  | - Transfert #452 receptionne     |  |
|  |    Validation en attente |  |   il y a 1 jour                 |  |
|  |    [Voir le rapport]     |  | - Stock import CSV (50 unites)   |  |
|  |                          |  |   il y a 2 jours                |  |
|  +-------------------------+  +-----------------------------------+  |
|                                                                       |
+-----------------------------------------------------------------------+
```

### 2.2 Les indicateurs cles (KPIs)

| KPI | Description | Action recommandee |
|---|---|---|
| **Vehicules en stock** | Nombre total d'unites en stock actuellement | Verifier si < seuil critique |
| **Ventes du mois** | Nombre de ventes enregistrees ce mois-ci | Comparer avec l'objectif |
| **Scoring conformite** | Score sur 150 points (seuil : 120) | Ameliorer si < 120 |
| **Clients actifs** | Nombre de clients avec au moins un achat | Fideliser les inactifs |
| **Alertes en attente** | Notifications requérant votre attention | Traiter imperativement |
| **Prochain rapport trim.** | Date limite de soumission du rapport | Anticiper la preparation |

### 2.3 Les alertes

Les alertes apparaissent en **rouge** ou **orange** dans le panneau "Alertes Recentes". Elles necessitent une action de votre part :

**Types d'alertes** :

| Type | Severite | Description | Action |
|---|---|---|---|
| Stock critique | Haute | Stock inferieur au seuil minimum | Reapprovisionner |
| Rapport en retard | Haute | Date limite de rapport depassee | Generer et soumettre |
| Conformite faible | Haute | Score < 120/150 | Corriger les ecarts |
| QR code invalide | Critique | Code scane non reconnu | Verifier la source |
| Agrement expirant | Moyenne | Agrement valide < 30 jours | Renouveler |
| KYC incomplet | Moyenne | Fiche client incomplete | Completer |

Pour marquer une alerte comme traitee, cliquez sur **"Marquer comme lu"** ou effectuez l'action corrective correspondante.

---

## 3. Gestion des stocks

La gestion des stocks est au coeur de la traçabilite reglementaire. Chaque vehicule doit etre enregistre avec son VIN unique et son QR code.

### 3.1 Consulter le stock

1. Dans le menu lateral, cliquez sur **"Stocks"**
2. La page de stock s'affiche avec :
   - **Filtres** : par marque, modele, categorie, statut, date d'entree
   - **Tableau** : liste des vehicules avec VIN, marque, modele, couleur, date d'entree, statut
   - **Pagination** : navigation par pages (25/50/100 lignes par page)
   - **Export** : telechargement en CSV ou Excel

| Colonne | Description |
|---|---|
| QR Code | Code unique scannable |
| VIN | Numero d'identification du vehicule |
| Marque | Ex: Yamaha, Suzuki, Honda |
| Modele | Ex: YBR 125, GN 125 |
| Categorie | Moto, Scooter, Tricycle |
| Couleur | Couleur du vehicule |
| Date entree | Date d'arrivee en stock |
| Statut | Disponible, Reserve, Vendu, En transit |

### 3.2 Ajouter un vehicule manuellement

1. Cliquez sur le bouton **"+ Ajouter un vehicule"**
2. Le formulaire d'ajout s'affiche :

**Onglet "Informations generales"** :

| Champ | Obligatoire | Description |
|---|---|---|
| VIN | Oui | 17 caracteres alphanumeriques |
| Marque | Oui | Selection dans la liste ou saisie |
| Modele | Oui | Selection selon la marque choisie |
| Categorie | Oui | Moto / Scooter / Tricycle |
| Type moteur | Oui | 2-temps / 4-temps / Electrique |
| Cylindree | Oui | En cm3 (ex: 125) |
| Couleur | Oui | Selection dans la palette |
| Annee fabrication | Oui | Annee de production |
| Pays d'origine | Oui | Pays de fabrication |
| Numero moteur | Oui | Numero unique du moteur |

**Onglet "Documents"** :

| Champ | Obligatoire | Description |
|---|---|---|
| Certificat d'origine | Oui | Document scanne (PDF, JPG, PNG) |
| Facture d'achat | Oui | Document justificatif |
| Certificat de conformite | Oui | Attestation du fabricant |
| Autres documents | Non | Assurances, garanties |

3. Cliquez sur **"Generer le QR code"** — un QR code unique est genere automatiquement
4. Cliquez sur **"Enregistrer"**
5. Le vehicule est ajoute au stock avec le statut **"Disponible"**

### 3.3 Importer un lot de vehicules (CSV)

Pour importer plusieurs vehicules en une seule operation :

1. Cliquez sur **"Importer CSV"**
2. Telechargez le **modele de fichier CSV** en cliquant sur "Telecharger le modele"
3. Remplissez le fichier CSV avec vos donnees :

```csv
vin,marque,modele,categorie,type_moteur,cylindree,couleur,annee_fabrication,pays_origine,numero_moteur
titre_fabrication
ML8DCRKP0N0001234,YAMAHA,YBR 125,Moto,4-temps,125,Rouge,2025,Japon,ET1234567890,CF-2025-001
ML8DCRKP0N0001235,YAMAHA,YBR 125,Moto,4-temps,125,Bleu,2025,Japon,ET1234567891,CF-2025-002
ML8DCRKP0N0001236,HONDA,WAVE 110,Moto,4-temps,110,Noir,2025,Thailande,TH9876543210,CF-2025-003
```

4. Glissez-deposez le fichier ou cliquez sur **"Parcourir"**
5. La plateforme valide le fichier ligne par ligne :
   - ✅ Ligne valide — prete a l'import
   - ⚠️ Ligne avec avertissement — importable mais verification recommandee
   - ❌ Ligne invalide — import bloquee, correction necessaire
6. Corrigez les lignes en erreur directement dans l'interface
7. Cliquez sur **"Confirmer l'import"**
8. Les QR codes sont generes automatiquement pour chaque vehicule valide
9. Un **rapport d'import** resume l'operation (succes, echecs, avertissements)

> **Conseil** : Pour les imports de plus de 500 lignes, divisez le fichier en plusieurs lots de 500.

### 3.4 Scanner un QR code

Le scanner QR permet d'identifier rapidement un vehicule en stock :

1. Cliquez sur **"Scanner QR"** (ou utilisez l'icone camera)
2. Autorisez l'acces a la camera si demande
3. Cadrez le QR code dans le viseur
4. Le vehicule est identifie automatiquement et sa fiche s'affiche

**Resultat du scan** :
- ✅ **Vehicule reconnu** — La fiche detaillee s'affiche avec toutes les informations
- ⚠️ **QR code non attribue** — Le code existe mais n'est pas associe a un vehicule
- ❌ **QR code inconnu** — Le code n'existe pas dans la base (possible fraude)

**Actions possibles apres scan** :
- Consulter la fiche vehicule complete
- Modifier les informations
- Enregistrer une vente (lien direct vers le wizard)
- Verifier l'historique du vehicule
- Signaler une anomalie

### 3.5 Modifier ou supprimer un vehicule

1. Dans la liste des stocks, cliquez sur **l'icone "Voir"** (oeil) pour le vehicule concerne
2. La fiche detaillee s'affiche
3. Cliquez sur **"Modifier"** pour editer les informations
4. Ou cliquez sur **"Supprimer"** pour retirer le vehicule (avec confirmation)

> **Note** : Un vehicule **vendu** ne peut pas etre supprime. Seul l'administrateur peut effectuer une suppression forcee avec justification.

---

## 4. Gestion des clients

La gestion des clients (KYC — Know Your Customer) est obligatoire conformement a l'arrete 05/06/2026. Chaque acheteur doit avoir une fiche complete avant toute vente.

### 4.1 Consulter la liste des clients

1. Dans le menu lateral, cliquez sur **"Clients"**
2. La liste des clients s'affiche avec :
   - **Recherche** : par nom, telephone, numero de piece
   - **Filtres** : par date d'ajout, nombre d'achats, statut KYC
   - **Tableau** : nom, prenom, telephone, type de piece, nombre d'achats, statut

### 4.2 Ajouter un nouveau client (KYC complet)

1. Cliquez sur **"+ Nouveau client"**
2. Le formulaire KYC s'affiche en plusieurs etapes :

**Etape 1 — Informations d'identite**

| Champ | Obligatoire | Description |
|---|---|---|
| Nom | Oui | Nom de famille |
| Prenom(s) | Oui | Prenom(s) complet(s) |
| Date de naissance | Oui | JJ/MM/AAAA |
| Lieu de naissance | Oui | Ville, Pays |
| Nationalite | Oui | Selection dans la liste |
| Sexe | Oui | M / F |

**Etape 2 — Piece d'identite**

| Champ | Obligatoire | Description |
|---|---|---|
| Type de piece | Oui | CNIB / Passeport / Permis de conduire / Carte consulaire |
| Numero de piece | Oui | Numero exact de la piece |
| Date d'emission | Oui | JJ/MM/AAAA |
| Date d'expiration | Oui | JJ/MM/AAAA |
| Autorite d'emission | Oui | Ex: CNIB Burkina Faso |
| Photo de la piece (recto) | Oui | Scan ou photo nette (PDF, JPG, PNG) |
| Photo de la piece (verso) | Oui | Scan ou photo nette |
| Photo du titulaire | Oui | Photo recente du client |

**Etape 3 — Coordonnees**

| Champ | Obligatoire | Description |
|---|---|---|
| Telephone principal | Oui | Format : +226 XX XX XX XX |
| Telephone secondaire | Non | Numero alternatif |
| Email | Non | Adresse email si disponible |
| Adresse residence | Oui | Quartier, Ville |
| Region | Oui | Selection : Boucle du Mouhoun, Cascades, Centre, etc. |
| Province | Oui | Selection selon la region |
| Profession | Non | Metier du client |

**Etape 4 — Validation**

1. Verifiez le resume des informations saisies
2. Corrigez si necessaire
3. Cochez la case **"Je certifie l'exactitude des informations"**
4. Cliquez sur **"Enregistrer le client"**

Le client est enregistre avec un **statut KYC** :

| Statut | Description |
|---|---|
| **Complet** | Toutes les informations obligatoires sont fournies |
| **Incomplet** | Des informations obligatoires manquent |
| **En attente** | Verification en cours (document flou, etc.) |
| **Rejete** | Documents non conformes ou suspects |

### 4.3 Consulter la fiche client

1. Dans la liste, cliquez sur le nom du client
2. La fiche complete s'affiche avec :
   - **Onglet "Informations"** : Donnees KYC completes
   - **Onglet "Achats"** : Historique des vehicules achetes
   - **Onglet "Documents"** : Pieces d'identite, factures, attestations
   - **Onglet "Activite"** : Journal des actions sur ce client

### 4.4 Modifier un client

1. Ouvrez la fiche client
2. Cliquez sur **"Modifier"**
3. Apportez vos modifications
4. Cliquez sur **"Enregistrer les modifications"**

> **Important** : La modification de la piece d'identite ou du numero genere une alerte de securite enregistree dans le journal d'audit.

---

## 5. Enregistrer une vente

L'enregistrement d'une vente se fait via un **wizard en 4 etapes** obligatoires. Ce processus garantit la traçabilite complete et la conformite reglementaire.

### 5.1 Acceder au wizard de vente

1. Dans le menu lateral, cliquez sur **"Ventes"**
2. Cliquez sur **"+ Nouvelle vente"**
3. Le wizard de vente s'ouvre

### 5.2 Etape 1 — Selection du vehicule

```
+---------------------------------------------------------------+
|  NOUVELLE VENTE          Etape 1/4 : Selection du vehicule   |
|                                                               |
|  Rechercher un vehicule :                                     |
|  [________________________________________] [Rechercher]      |
|                                                               |
|  OU scanner le QR code :                                      |
|  [       SCANNER LE QR CODE        ]                          |
|                                                               |
|  Resultats (247 vehicules disponibles) :                      |
|  +------------+--------+-------+-------+----------+--------+ |
|  | Selection  | Marque | Modele|Couleur| Cylindree|  VIN   | |
|  +------------+--------+-------+-------+----------+--------+ |
|  | (*)        | YAMAHA |YBR 125| Rouge |   125    |ML8D... | |
|  | ( )        | HONDA  |WAVE 110| Noir |   110    |JH2C... | |
|  | ( )        | SUZUKI |GN 125 | Bleu  |   125    |JS1D... | |
|  +------------+--------+-------+-------+----------+--------+ |
|                                                               |
|  Vehicule selectionne :                                       |
|  YAMAHA YBR 125 - Rouge - 125cc - VIN: ML8DCRKP0N0001234   |
|                                                               |
|  [                   SUIVANT : SELECTIONNER LE CLIENT         |
+---------------------------------------------------------------+
```

**Methodes de recherche** :
- **Recherche textuelle** : Saisissez le VIN, la marque, le modele ou le numero de QR code
- **Scan QR** : Utilisez la camera pour scanner le QR code du vehicule
- **Liste** : Parcourez la liste des vehicules disponibles

Une fois le vehicule selectionne, cliquez sur **"Suivant"**.

### 5.3 Etape 2 — Selection du client

```
+---------------------------------------------------------------+
|  NOUVELLE VENTE          Etape 2/4 : Selection du client     |
|                                                               |
|  Le client existe-t-il deja ?                                 |
|                                                               |
|  [Rechercher un client existant]  [+ Creer un nouveau client] |
|                                                               |
|  Recherche : [________________________] [Rechercher]         |
|                                                               |
|  Resultats :                                                  |
|  +----------------+----------------+------------+-----------+ |
|  | Nom            | Telephone      | Nb achats  | Selection | |
|  +----------------+----------------+------------+-----------+ |
|  | KABORE Sophie  | +226 70 11 22 33|     1      |   (*)     | |
|  | OUEDRAOGO Ali  | +226 71 22 33 44|     0      |   ( )     | |
|  +----------------+----------------+------------+-----------+ |
|                                                               |
|  [                   SUIVANT : DETAILS DE LA VENTE            |
+---------------------------------------------------------------+
```

- Si le client **existe deja** : Recherchez-le et selectionnez-le
- Si le client est **nouveau** : Cliquez sur "+ Creer un nouveau client" — le formulaire KYC s'ouvre dans une fenetre modale

### 5.4 Etape 3 — Details de la vente

```
+---------------------------------------------------------------+
|  NOUVELLE VENTE          Etape 3/4 : Details de la vente     |
|                                                               |
|  Date de vente : [25/06/2026]             (auto : aujourd'hui)|
|                                                               |
|  Prix de vente (FCFA) : [1 250 000]                          |
|                                                               |
|  Mode de paiement :                                           |
|  ( ) Espaces    ( ) Virement   ( ) Mobile Money              |
|  ( ) Cheque     (*) Espece                                    |
|                                                               |
|  Si cheque :                                                  |
|  Numero cheque : [__________]  Banque : [__________]         |
|  Date encaissement : [__________]                             |
|                                                               |
|  Remise eventuelle (FCFA) : [0]                              |
|                                                               |
|  Montant total TTC : 1 250 000 FCFA                          |
|                                                               |
|  Commentaires : [________________________]                    |
|                                                               |
|  [                   SUIVANT : RECAPITULATIF                  |
+---------------------------------------------------------------+
```

| Champ | Obligatoire | Description |
|---|---|---|
| Date de vente | Oui | Par defaut : date du jour (modifiable) |
| Prix de vente | Oui | Montant en FCFA |
| Mode de paiement | Oui | Espaces / Virement / Mobile Money / Cheque / Espece |
| Numero de cheque | Si cheque | Numero du cheque |
| Banque | Si cheque | Nom de la banque |
| Date d'encaissement | Si cheque | Date prevue d'encaissement |
| Remise | Non | Montant de la remise accordee |
| Commentaires | Non | Notes libres sur la vente |

### 5.5 Etape 4 — Recapitulatif et validation

```
+---------------------------------------------------------------+
|  NOUVELLE VENTE          Etape 4/4 : Recapitulatif           |
|                                                               |
|  +-------------------+  +-------------------+                |
|  |   VEHICULE        |  |     CLIENT        |                |
|  |   YAMAHA YBR 125  |  |   KABORE Sophie   |                |
|  |   Rouge - 125cc   |  |   CNIB : B00123456|                |
|  |   VIN: ML8D...    |  |   +226 70 11 22 33|                |
|  +-------------------+  +-------------------+                |
|                                                               |
|  +---------------------------------------------------------+ |
|  |  DETAILS DE LA VENTE                                    | |
|  |  Date : 25/06/2026                                      | |
|  |  Prix : 1 250 000 FCFA                                  | |
|  |  Mode : Espece                                          | |
|  |  Total TTC : 1 250 000 FCFA                             | |
|  +---------------------------------------------------------+ |
|                                                               |
|  [         PRECEDENT    ]    [       VALIDER LA VENTE        |
+---------------------------------------------------------------+
```

1. Verifiez l'ensemble des informations
2. Cliquez sur **"Valider la vente"**
3. La vente est enregistree et les documents sont generes automatiquement :
   - **Facture PDF** (telechargeable)
   - **Attestation d'immatriculation** (QR code a coller sur le vehicule)
   - **Certificat de garantie** (si applicable)
   - **Recu de vente** (pour le client)

> **Important** : Une vente validee est **definitive** et ne peut pas etre annulee par le detaillant. En cas d'erreur, contactez l'administrateur ou le support.

---

## 6. Generer le rapport trimestriel

Chaque entreprise doit soumettre un **rapport trimestriel** au Ministere du Commerce. Le wizard de generation guide l'utilisateur en 4 etapes.

### 6.1 Acceder au wizard de rapport

1. Dans le menu lateral, cliquez sur **"Rapports"**
2. Cliquez sur **"+ Nouveau rapport trimestriel"**
3. Le wizard s'ouvre

### 6.2 Etape 1 — Selection de la periode

```
+---------------------------------------------------------------+
|  RAPPORT TRIMESTRIEL     Etape 1/4 : Periode                 |
|                                                               |
|  Selectionnez le trimestre :                                  |
|                                                               |
|  [2026]                                                       |
|                                                               |
|  [ T1 ]   (janv-mars)                                        |
|  [ T2 ]   (avr-juin)     <- Selectionne                      |
|  [ T3 ]   (juil-sept)                                        |
|  [ T4 ]   (oct-dec)                                         |
|                                                               |
|  Periode selectionnee : 1er avril 2026 au 30 juin 2026      |
|                                                               |
|  [                   SUIVANT : STOCK ET VENTES                |
+---------------------------------------------------------------+
```

Selectionnez l'annee et le trimestre concernes, puis cliquez sur **"Suivant"**.

### 6.3 Etape 2 — Synthese stock et ventes

Cette etape est **pre-remplie automatiquement** par la plateforme avec les donnees du trimestre :

```
+---------------------------------------------------------------+
|  RAPPORT TRIMESTRIEL     Etape 2/4 : Stock et Ventes         |
|                                                               |
|  +------------------------+  +---------------------------+   |
|  |  STOCK INITIAL (T1)    |  |  STOCK FINAL (T2)        |   |
|  |  215 vehicules         |  |  198 vehicules            |   |
|  +------------------------+  +---------------------------+   |
|                                                               |
|  +------------------------+  +---------------------------+   |
|  |  VENTES DU TRIMESTRE   |  |  TRANSFERTS RECUS        |   |
|  |  42 vehicules          |  |  25 vehicules             |   |
|  |  CA : 42 500 000 FCFA  |  |                           |   |
|  +------------------------+  +---------------------------+   |
|                                                               |
|  Ventes par categorie :                                      |
|  - Motos : 30 (71%)                                         |
|  - Scooters : 10 (24%)                                      |
|  - Tricycles : 2 (5%)                                       |
|                                                               |
|  Ventes par marque :                                         |
|  - YAMAHA : 20 | HONDA : 12 | SUZUKI : 8 | Autres : 2     |
|                                                               |
|  [         MODIFIER MANUELLEMENT ] [ SUIVANT : CONFORMITE   |
+---------------------------------------------------------------+
```

Verifiez les donnees pre-remplies. Si des donnees sont incorrectes (ex: stock physique different du stock informatique), cliquez sur **"Modifier manuellement"** pour ajuster les chiffres avec justification.

### 6.4 Etape 3 — Conformite et incidents

```
+---------------------------------------------------------------+
|  RAPPORT TRIMESTRIEL     Etape 3/4 : Conformite              |
|                                                               |
|  Scoring de conformite actuel : 142 / 150 pts (94.7%)        |
|                                                               |
|  Incidents survenus pendant le trimestre :                    |
|                                                               |
|  [+ Ajouter un incident]                                     |
|                                                               |
|  Incidents declares :                                         |
|  | # | Date       | Type               | Statut    | Action  | |
|  |---|------------|--------------------|-----------|---------| |
|  | 1 | 15/04/2026 | Retard livraison   | Resolu    | [Voir]  | |
|  | 2 | 02/05/2026 | Piece defectueuse  | En cours  | [Voir]  | |
|                                                               |
|  Mesures correctives prises :                                 |
|  [______________________________________________________]     |
|  (Changement de fournisseur, renforcement controle qualite)    |
|                                                               |
|  [                   SUIVANT : VALIDATION                     |
+---------------------------------------------------------------+
```

Declarez les incidents eventuels et les mesures correctives associees.

### 6.5 Etape 4 — Validation et soumission

```
+---------------------------------------------------------------+
|  RAPPORT TRIMESTRIEL     Etape 4/4 : Validation              |
|                                                               |
|  RECAPITULATIF DU RAPPORT T2 2026                            |
|                                                               |
|  Entreprise : Suzuki Burkina Faso                             |
|  Periode : 1er avril au 30 juin 2026                         |
|                                                               |
|  +---------------------------------------------------------+ |
|  |  VENTES      : 42 vehicules | 42 500 000 FCFA          | |
|  |  STOCK FINAL : 198 vehicules                            | |
|  |  CONFORMITE  : 142/150 pts (94.7%)                      | |
|  |  INCIDENTS   : 2 (1 resolu, 1 en cours)                 | |
|  +---------------------------------------------------------+ |
|                                                               |
|  Documents joints :                                           |
|  [ ] Bilan comptable trimestriel (obligatoire)               |
|  [ ] Inventaire physique signe                                |
|  [ ] Attestations de conformite CNTI                          |
|                                                               |
|  [+ Ajouter un document]                                     |
|                                                               |
|  Je certifie l'exactitude des informations : [x]              |
|                                                               |
|  [     ENREGISTRER EN BROUILLON  ]  [   SOUMETTRE AU MINISTERE |
+---------------------------------------------------------------+
```

A cette etape, vous pouvez :
- **Enregistrer en brouillon** : Le rapport est sauvegarde mais non soumis. Vous pouvez le modifier plus tard.
- **Soumettre au Ministere** : Le rapport est transmis pour validation. Il n'est plus modifiable.

Apres soumission, vous recevez une **confirmation par email** avec le numero de reference du rapport.

---

## 7. Verifier sa conformite

Le **scoring de conformite** evalue votre entreprise sur 150 points repartis en 12 criteres. Le seuil minimal est de **120 points** (80%).

### 7.1 Acceder au scoring

1. Dans le menu lateral, cliquez sur **"Conformite"**
2. Le tableau de scoring s'affiche

### 7.2 Les 12 criteres de conformite

```
+---------------------------------------------------------------+
|  SCORING DE CONFORMITE — 142 / 150 pts (94.7%) — STATUT VERT |
|                                                               |
|  Criteres d'evaluation :                                      |
|                                                               |
|  1. Agrement en cours de validite          15/15 pts  [====] |
|  2. Enregistrement des stocks (complet)    12/15 pts  [=== ] |
|  3. Ventes declarees en temps reel         15/15 pts  [====] |
|  4. KYC clients (completude)               13/15 pts  [=== ] |
|  5. Rapports trimestriels (ponctualite)    15/15 pts  [====] |
|  6. Conformite technique CNTI              15/15 pts  [====] |
|  7. Marquage QR code (tous vehicules)      15/15 pts  [====] |
|  8. Facturation reguliere                  10/10 pts  [====] |
|  9. Garanties et SAV                       10/10 pts  [====] |
|  10. Formations du personnel                8/10 pts  [=== ] |
|  11. Conditions de stockage                 9/10 pts  [=== ] |
|  12. Signalements et reclamations           5/5  pts  [====] |
|                                                               |
|  [===========] 142/150 pts — CONFORME (seuil : 120 pts)     |
|                                                               |
|  Historique du scoring :                                      |
|  [Graphique en courbe sur 12 mois]                           |
+---------------------------------------------------------------+
```

| # | Critere | Points | Seuil | Description |
|---|---|---|---|---|
| 1 | Agrement valide | 15 | 15 | Agrement en cours de validite |
| 2 | Stocks complets | 15 | 12 | Tous les vehicules enregistres avec VIN |
| 3 | Ventes declarees | 15 | 12 | Toutes les ventes enregistrees dans les 48h |
| 4 | KYC clients | 15 | 12 | Toutes les fiches clients completes |
| 5 | Rapports trimestriels | 15 | 12 | Soumission dans les delais |
| 6 | Conformite CNTI | 15 | 12 | Controles techniques a jour |
| 7 | QR codes | 15 | 12 | Tous les vehicules marques |
| 8 | Facturation | 10 | 8 | Factures emises pour chaque vente |
| 9 | Garanties SAV | 10 | 8 | Garanties honorees, SAV operationnel |
| 10 | Formations | 10 | 6 | Personnel forme aux procedures |
| 11 | Stockage | 10 | 7 | Conditions securisees et conformes |
| 12 | Reclamations | 5 | 4 | Traitement des reclamations |

### 7.3 Interpretation du score

| Score | Statut | Couleur | Signification |
|---|---|---|---|
| 135 — 150 | Exemplaire | 🟢 Vert fonce | Conformite optimale |
| 120 — 134 | Conforme | 🟢 Vert | Conformite satisfaisante |
| 100 — 119 | A surveiller | 🟡 Orange | Ameliorations necessaires |
| 80 — 99 | Non conforme | 🟠 Orange fonce | Action corrective urgente |
| 0 — 79 | Non conforme critique | 🔴 Rouge | Risque de sanction |

### 7.4 Plan d'action

Si votre score est inferieur au seuil, un **plan d'action** est genere automatiquement :

1. Cliquez sur **"Voir le plan d'action"**
2. Les ecarts sont listes avec des recommandations
3. Suivez les etapes suggerees pour ameliorer votre score
4. Revalidez votre conformite apres corrections

---

## 8. Parametres

### 8.1 Acceder aux parametres

1. Cliquez sur votre **nom d'utilisateur** en haut a droite
2. Selectionnez **"Parametres"** dans le menu deroulant

### 8.2 Langue

La plateforme supporte deux langues :

| Langue | Code | Statut |
|---|---|---|
| **Francais** | `fr` | Langue par defaut |
| **Anglais** | `en` | Disponible |

Pour changer de langue :
1. Allez dans **Parametres > Langue**
2. Selectionnez la langue souhaitee
3. La page se recharge automatiquement dans la nouvelle langue

### 8.3 Gestion des utilisateurs de l'entreprise

Si vous etes administrateur de votre entreprise, vous pouvez gerer les utilisateurs :

1. Allez dans **Parametres > Utilisateurs**
2. La liste des utilisateurs de votre entreprise s'affiche

| Action | Description |
|---|---|
| **+ Ajouter un utilisateur** | Cree un nouveau compte pour un collaborateur |
| **Modifier** | Change les informations ou le role d'un utilisateur |
| **Desactiver** | Desactive temporairement un compte |
| **Reinitialiser le MFA** | Regenere la configuration MFA |
| **Supprimer** | Supprime definitivement un compte |

**Roles disponibles au sein d'une entreprise** :

| Role | Description |
|---|---|
| **Administrateur** | Acces complet, gestion des utilisateurs |
| **Gerant** | Gestion des stocks, ventes, clients |
| **Vendeur** | Enregistrement des ventes, scan QR |
| **Comptable** | Rapports trimestriels, facturation |
| **Observateur** | Lecture seule (tableau de bord, stocks) |

### 8.4 Profil utilisateur

1. Allez dans **Parametres > Mon profil**
2. Modifiez vos informations personnelles :
   - Nom, prenom
   - Email
   - Telephone
   - Photo de profil
3. Cliquez sur **"Enregistrer les modifications"**

### 8.5 Securite

1. Allez dans **Parametres > Securite**
2. Vous pouvez :
   - **Changer votre mot de passe** (ancien + nouveau)
   - **Reconfigurer le MFA** (avec les codes de secours)
   - **Consulter les sessions actives** et les deconnecter
   - **Consulter l'historique de connexion**

---

## 9. FAQ

### Connexion et compte

**Q1 : J'ai oublie mon mot de passe, que faire ?**
> R : Cliquez sur "Mot de passe oublie ?" sur la page de connexion. Saisissez votre email et suivez les instructions. Le lien de reinitialisation est valable 1 heure. Si vous n'avez pas recu l'email, verifiez votre dossier spam ou contactez le support.

**Q2 : Je n'ai plus acces a mon telephone (MFA), comment me connecter ?**
> R : Utilisez l'un de vos **codes de secours** a la place du code MFA. Si vous n'avez plus de codes de secours, contactez le support technique pour une reinitialisation manuelle (delai : 24-48h, verification d'identite requise).

**Q3 : Puis-je rester connecte plus longtemps ?**
> R : Oui, cochez "Se souvenir de moi" lors de la connexion. Votre session restera active 7 jours. Pour des raisons de securite, la deconnexion automatique a 15 minutes d'inactivite reste active.

**Q4 : Mon compte est bloque apres plusieurs tentatives de connexion.**
> R : Pour des raisons de securite, votre compte est bloque pendant 30 minutes apres 5 tentatives echouees. Attendez ce delai ou contactez le support pour un deblocage immediat.

### Stocks

**Q5 : Puis-je importer un fichier Excel au lieu de CSV ?**
> R : Non, seul le format CSV est accepte pour l'import en masse. Vous pouvez facilement convertir un fichier Excel en CSV via Fichier > Enregistrer sous > CSV dans Excel ou LibreOffice Calc.

**Q6 : Le QR code ne se scanne pas, que faire ?**
> R : Verifiez les points suivants : (1) Eclairage suffisant, (2) QR code propre et non abime, (3) Camera fonctionnelle, (4) Autorisation camera accordee au navigateur. Si le probleme persiste, saisissez manuellement le numero du QR code.

**Q7 : Puis-je modifier le VIN d'un vehicule apres enregistrement ?**
> R : Non, le VIN est un identifiant immuable pour garantir la traçabilite. En cas d'erreur de saisie, contactez le support avec la preuve du VIN correct (certificat d'origine).

**Q8 : Combien de vehicules puis-je importer en une seule fois ?**
> R : La limite est de **500 vehicules** par fichier CSV. Pour des volumes superieurs, divisez vos donnees en plusieurs fichiers et effectuez les imports successivement.

### Ventes

**Q9 : Puis-je annuler une vente apres validation ?**
> R : Non, une vente validee est definitive pour garantir la traçabilite. En cas d'erreur (mauvais vehicule, mauvais client), contactez immediatement le support avec la justification. Une procedure d'annulation administrative peut etre engagee.

**Q10 : Le client n'a pas de piece d'identite valide, puis-je quand meme vendre ?**
> R : **Non**. La vente sans KYC complet est interdite par l'arrete 05/06/2026. Le systeme bloquera la validation de la vente tant que la fiche client n'est pas complete. Encouragez le client a obtenir une piece d'identite valide.

**Q11 : Puis-je enregistrer une vente retroactive ?**
> R : Oui, vous pouvez modifier la date de vente lors de l'etape 3 du wizard. Cependant, toute vente datee de plus de 7 jours genere une alerte de retard de declaration qui impacte votre scoring de conformite.

### Rapports trimestriels

**Q12 : Que se passe-t-il si je ne soumets pas mon rapport a temps ?**
> R : Le retard de soumission entraine une penalite sur votre scoring de conformite (-3 points par semaine de retard) et peut faire l'objet d'une mise en demeure par le Ministere du Commerce. Au-dela de 30 jours de retard, une sanction financiere peut etre appliquee.

**Q13 : Puis-je modifier un rapport deja soumis ?**
> R : Non, un rapport soumis n'est plus modifiable par l'entreprise. Si vous constatez une erreur, contactez votre controleur pour demander une rectification avec justification.

**Q14 : Les donnees pre-remplies dans le rapport sont incorrectes.**
> R : Les donnees sont generees automatiquement a partir de vos saisies dans la plateforme. Verifiez que toutes vos ventes et mouvements de stock ont ete correctement enregistres. Vous pouvez ajuster manuellement les chiffres avec justification a l'etape 2.

### Conformite

**Q15 : Comment puis-je ameliorer mon scoring de conformite ?**
> R : Consultez le detail de vos criteres dans l'onglet "Conformite". Chaque critere sous-seuil est accompagne de recommandations. Les actions les plus impactantes sont : (1) Tenir vos stocks a jour, (2) Declarer vos ventes dans les 48h, (3) Completer les fiches KYC, (4) Soumettre vos rapports dans les delais.

---

## Assistance

Pour toute question non traitee dans cette FAQ :

- **Email** : support@ireg-moto-bf.gov.bf
- **Telephone** : (+226) 25 XX XX XX (lun-ven, 8h-17h)
- **Chat en ligne** : Disponible dans l'application (icone bulle en bas a droite)
- **Portail support** : https://support.ireg-moto-bf.gov.bf
