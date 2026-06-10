# iReg Moto BF — Manuel Utilisateur

> **Version:** 1.0.0 | **Langue:** Français
> **Public cible:** Importateurs, distributeurs, unités d'assemblage, détaillants, contrôleurs DRCTT

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Création de compte et connexion](#2-cration-de-compte-et-connexion)
3. [Tableau de bord](#3-tableau-de-bord)
4. [Gestion des acteurs économiques](#4-gestion-des-acteurs-économiques)
5. [Gestion des stocks et inventaire](#5-gestion-des-stocks-et-inventaire)
6. [Gestion clients et traçabilité](#6-gestion-clients-et-tracabilité)
7. [Gestion commerciale et facturation](#7-gestion-commerciale-et-facturation)
8. [Rapportage trimestriel](#8-rapportage-trimestriel)
9. [Conformité et auto-évaluation](#9-conformité-et-auto-évaluation)
10. [Sécurité et alertes](#10-sécurité-et-alertes)
11. [Portail ministère](#11-portail-ministère)
12. [FAQ](#12-faq)

---

## 1. Introduction

### 1.1 Qu'est-ce que iReg Moto BF ?

**iReg Moto BF** est la plateforme numérique officielle de conformité réglementaire pour le secteur des deux-roues motorisés au Burkina Faso. Établie par l'**arrêté ministériel 05/06/2026**, elle centralise l'ensemble des déclarations, rapports et contrôles imposés aux acteurs de la chaîne de valeur.

### 1.2 Qui doit utiliser cette plateforme ?

| Type d'acteur | Obligation | Modules utilisés |
|---------------|-----------|-----------------|
| **Importateur** | Déclarer tous les véhicules importés, soumettre les rapports trimestriels | A, B, C, D, E, F |
| **Distributeur** | Gérer les stocks, les ventes et la facturation | A, B, C, D, F |
| **Unité d'assemblage** | Déclarer la production, respecter le plan de contenu local | A, B, C, D, E, F |
| **Détaillant** | Enregistrer les ventes, faire le KYC client, lier engin-client | C, D, F |
| **Contrôleur DRCTT** | Inspecter, contrôler, sanctionner | H, F |

### 1.3 Avantages de la plateforme

- **Centralisation** : Toutes vos obligations réglementaires dans un seul outil
- **Automatisation** : Rapports trimestriels générés automatiquement (PDF + XML)
- **Conformité en temps réel** : Score calculé à chaque opération
- **Protection** : Évitez les sanctions (fermeture administrative de 3 mois à 1 an)
- **Traçabilité** : Historique complet de chaque véhicule
- **Mode offline** : Continuez à travailler sans connexion (synchro automatique)

### 1.4 Accéder à la plateforme

- **Web** : https://app.ireg-moto.bf (fonctionne sur tout navigateur moderne)
- **Mobile** : Application disponible sur Google Play Store (iReg Moto BF)
- **Version bureau** : La PWA peut être installée sur Windows/macOS/Linux

[Image: Page d'accueil de connexion iReg Moto BF avec logo et champs email/mot de passe]

---

## 2. Création de compte et connexion

### 2.1 Créer un compte

**Étape 1** — Cliquez sur « Créer un compte » depuis la page de connexion.

**Étape 2** — Renseignez les informations de votre entreprise :

| Champ | Description | Exemple |
|-------|-------------|---------|
| Type d'acteur | Votre position dans la chaîne | Importateur |
| Raison sociale | Nom officiel de l'entreprise | Société d'Importation Motos BF SA |
| NIF | Numéro d'Identification Fiscale | 000123456789 |
| RCCM | Registre du Commerce | BF-OUA-2024-12345 |
| Représentant légal | Nom du dirigeant | Amadou TRAORE |
| Email professionnel | Email de contact | contact@simobf.bf |
| Téléphone | Numéro principal | +226 70 12 34 56 |
| Adresse | Adresse complète | Avenue Kwame Nkrumah, Ouagadougou |
| Région | Région du Burkina Faso | CENTRE |

**Étape 3** — Téléchargez les documents requis :
- Registre de commerce (PDF ou photo)
- Attestation NIF
- Police d'assurance responsabilité civile
- Plan de contenu local (pour les assembleurs)

**Étape 4** — Créez votre mot de passe (minimum 8 caractères, dont 1 majuscule, 1 chiffre, 1 caractère spécial).

**Étape 5** — Validez. Votre compte est créé avec le statut **EN_ATTENTE**. Un email de confirmation vous est envoyé. L'équipe DRCTT validera votre inscription sous 48h ouvrées.

[Image: Formulaire de création de compte avec indicateurs de progression]

### 2.2 Se connecter

```
1. Rendez-vous sur https://app.ireg-moto.bf
2. Saisissez votre email professionnel
3. Saisissez votre mot de passe
4. Cliquez sur « Se connecter »
```

Si l'authentification à double facteur (MFA) est activée, saisissez le code à 6 chiffres généré par Google Authenticator ou Authy.

### 2.3 Mot de passe oublié

1. Cliquez sur « Mot de passe oublié ? »
2. Saisissez votre email
3. Recevez le lien de réinitialisation par email (valable 1 heure)
4. Créez un nouveau mot de passe sécurisé

### 2.4 Premier paramétrage

Après votre première connexion, configurez :

1. **Vos entrepôts** — Ajoutez chaque lieu de stockage (nom, adresse, coordonnées GPS)
2. **Vos utilisateurs** — Créez les comptes de vos collaborateurs avec les bons rôles
3. **Vos catégories de véhicules** — Sélectionnez les catégories que vous commercialisez
4. **La MFA** (recommandé) — Activez l'authentification à double facteur dans Paramètres > Sécurité

[Image: Écran de paramétrage initial avec checklist des étapes]

---

## 3. Tableau de bord

### 3.1 Vue d'ensemble

Le tableau de bord est votre écran d'accueil. Il présente en un coup d'œil :

**Cartes KPI (en haut)** :
- **Score de conformité** — Jauge colorée (vert > 80%, orange 50-80%, rouge < 50%)
- **Véhicules en stock** — Nombre total d'unités disponibles
- **Ventes du mois** — CA et nombre de ventes
- **Rapport trimestriel** — Jours restants avant échéance

**Alertes (à droite)** :
- Notifications de conformité
- Alertes de stock faible
- Messages du ministère

**Graphiques (au centre)** :
- Évolution des ventes (7 jours / 30 jours / 12 mois)
- Répartition des stocks par catégorie
- Historique du score de conformité

[Image: Tableau de bord principal avec KPIs, graphiques et alertes]

### 3.2 Navigation

La barre latérale gauche permet d'accéder aux modules :

```
DASHBOARD
├── Tableau de bord

ACTEURS
├── Mon entreprise
├── Mes utilisateurs
├── Mes entrepôts
└── Documents

STOCKS
├── Véhicules
├── Mouvements
└── Inventaires

CLIENTS
├── Registre clients
├── Vérifications KYC
└── Documents clients

COMMERCIAL
├── Ventes
├── Tarifs et marges
├── Factures
└── Anomalies

RAPPORTS
├── Rapport trimestriel
├── Historique
└── Échéances

CONFORMITÉ
├── Mon score
├── Auto-évaluation
├── Règles
└── Compte à rebours

SÉCURITÉ
├── Alertes
├── Liste noire
└── Signalements
```

### 3.3 Widget compte à rebours

En bas de la barre latérale, un widget affiche :
- Le nombre de jours restants avant la prochaine échéance réglementaire
- Une barre de progression colorée
- Le niveau d'alerte (vert > 90 jours, orange 30-90 jours, rouge < 30 jours)

[Image: Widget compte à rebours dans la barre latérale]

---

## 4. Gestion des acteurs économiques

### 4.1 Votre fiche entreprise

Accédez à **Acteurs > Mon entreprise** pour consulter et modifier vos informations.

**Informations affichées** :
- Raison sociale et NIF
- Type d'acteur et statut (ACTIF, SUSPENDU...)
- Représentant légal
- Score de conformité global
- Numéro et date d'expiration de l'agrément
- Coordonnées GPS de vos entrepôts

### 4.2 Modifier vos informations

1. Cliquez sur « Modifier » en haut à droite
2. Modifiez les champs nécessaires
3. Enregistrez

> **Attention** : Certaines modifications (NIF, type d'acteur) nécessitent une validation du ministère.

### 4.3 Gérer vos utilisateurs

Accédez à **Acteurs > Mes utilisateurs** pour ajouter des collaborateurs.

**Rôles disponibles** :

| Rôle | Permissions |
|------|------------|
| **Administrateur** | Toutes les permissions sur l'entreprise |
| **Gestionnaire de stock** | Gestion des véhicules et mouvements |
| **Commercial** | Ventes, clients, facturation |
| **Comptable** | Rapports, factures, pricing |
| **Lecteur** | Consultation uniquement |

**Pour ajouter un utilisateur** :
1. Cliquez sur « Ajouter un utilisateur »
2. Renseignez : nom, email, téléphone, rôle
3. Un email d'invitation est envoyé automatiquement

### 4.4 Gérer vos entrepôts

Accédez à **Acteurs > Mes entrepôts**.

**Pour ajouter un entrepôt** :
1. Cliquez sur « Ajouter un entrepôt »
2. Renseignez : nom, code interne, adresse complète
3. Positionnez sur la carte (cliquez ou saisissez les coordonnées GPS)
4. Indiquez la capacité et la surface
5. Définissez le niveau de sécurité (Standard, Renforcé, Haute)

[Image: Carte interactive avec les entrepôts positionnés]

### 4.5 Gérer vos documents

Accédez à **Acteurs > Documents** pour consulter et télécharger vos documents réglementaires.

**Types de documents acceptés** :
- Registre de commerce
- Attestation NIF
- Police d'assurance
- Certificat d'origine
- Contrat de distribution
- Certificat d'agrément
- Plan de contenu local

**Pour télécharger un document** :
1. Cliquez sur « Ajouter un document »
2. Sélectionnez le type de document
3. Glissez-déposez le fichier (PDF, JPG, PNG — max 10 Mo)
4. Indiquez la date d'émission et d'expiration
5. Validez

[Image: Interface de gestion des documents avec prévisualisation]

---

## 5. Gestion des stocks et inventaire

### 5.1 Enregistrer un véhicule (import)

Accédez à **Stocks > Véhicules > Ajouter**.

**Étape 1 — Informations du véhicule** :

| Champ | Obligatoire | Description | Exemple |
|-------|------------|-------------|---------|
| VIN | Oui | 17 caractères alphanumériques | JYARJ16E08A012345 |
| N° de chassis | Oui | Numéro sur le chassis | JYA-RJ16E-0A012345 |
| N° de moteur | Oui | Numéro gravé sur le moteur | E3TE123456 |
| Fabricant | Oui | Marque du véhicule | YAMAHA |
| Modèle | Oui | Modèle exact | YBR 125 |
| Année | Oui | Année de fabrication | 2024 |
| Catégorie | Oui | Classification réglementaire | Moto légère (≤ 125cc) |
| Carburant | Oui | Type de carburant | Essence |
| Cylindrée | Oui | En cm³ | 125 |
| Puissance | Non | En kW | 7.5 |
| Poids | Non | En kg | 128 |
| Couleur | Non | Couleur dominante | Noir |

**Étape 2 — Informations d'importation** :

| Champ | Obligatoire | Description | Exemple |
|-------|------------|-------------|---------|
| Pays d'origine | Oui | Code ISO du pays | JP |
| N° de déclaration | Oui | Déclaration en douane | DECL-2024-001234 |
| Date d'import | Oui | Date de déclaration | 15/03/2024 |
| Valeur douanière | Oui | En XOF | 850 000 |
| N° d'homologation | Oui | Certificat UEMOA | HOM-2024-56789 |
| Validité homologation | Oui | Date d'expiration | 31/12/2026 |

**Étape 3 — Validation**

Le système vérifie automatiquement :
- ✅ Le format du VIN (17 caractères, checksum)
- ✅ La catégorie est autorisée à l'importation
- ✅ L'homologation est valide
- ✅ Le véhicule n'est pas sur la liste noire

Si tout est conforme, le véhicule est enregistré avec le statut **EN_STOCK**.

[Image: Formulaire d'enregistrement de véhicule avec validation VIN en temps réel]

### 5.2 Consulter les véhicules

La liste des véhicules affiche :
- VIN, fabricant, modèle, catégorie
- Statut (EN_STOCK, RÉSERVÉ, VENDU, etc.)
- Entrepôt de localisation
- Score de conformité individuel
- QR code (cliquable pour télécharger)

**Filtres disponibles** : statut, catégorie, fabricant, entrepôt, date d'import

### 5.3 Scanner un QR code

Chaque véhicule dispose d'un QR code unique. Pour le scanner :
1. Utilisez la fonction « Scanner » sur l'app mobile
2. Pointez la caméra vers le QR code collé sur le véhicule
3. Les informations complètes s'affichent instantanément

[Image: Scan de QR code sur un véhicule avec l'app mobile]

### 5.4 Gérer les mouvements de stock

Accédez à **Stocks > Mouvements**.

**Types de mouvements** :

| Type | Description | Exemple |
|------|-------------|---------|
| **IMPORT** | Arrivée d'un véhicule importé | Container arrivé au port |
| **ASSEMBLAGE** | Véhicule assemblé localement | Sortie de chaîne |
| **TRANSFERT** | Déplacement entre entrepôts | Ouaga → Bobo |
| **VENTE** | Vente à un client | Vente finalisée |
| **RETOUR** | Retour client | Vente annulée |
| **AJUSTEMENT** | Correction d'inventaire | Écart constaté |
| **MISE AU REBUT** | Véhicule détruit | Accident irréparable |

**Pour enregistrer un mouvement** :
1. Cliquez sur « Nouveau mouvement »
2. Sélectionnez le type
3. Choisissez le véhicule (par VIN ou scan QR)
4. Renseignez les détails (entrepôt destination, document référence, notes)
5. Validez

### 5.5 Réaliser un inventaire

Accédez à **Stocks > Inventaires > Nouvel inventaire**.

**Étape 1** — Sélectionnez l'entrepôt et la date planifiée.

**Étape 2** — Le système génère la liste des véhicules attendus.

**Étape 3** — Au fur et à mesure de votre passage en entrepôt :
- Scannez le QR code de chaque véhicule
- Ou saisissez manuellement le VIN
- Le système coche automatiquement l'unité comme « trouvée »

**Étape 4** — À la fin, le système calcule :
- Unités attendues vs unités comptées
- Écarts éventuels
- Valeur des écarts en XOF

**Étape 5** — Générez le rapport d'inventaire (PDF) et archivez-le.

> **Mode offline** : L'inventaire peut être réalisé sans connexion. Les données se synchronisent automatiquement.

[Image: Écran d'inventaire avec liste de véhicules à scanner]

---

## 6. Gestion clients et traçabilité

### 6.1 Enregistrer un client (KYC)

Accédez à **Clients > Ajouter**.

**Étape 1 — Identité** :

| Champ | Obligatoire | Description | Exemple |
|-------|------------|-------------|---------|
| Prénom | Oui | Prénom(s) du client | Issouf |
| Nom | Oui | Nom de famille | KONATÉ |
| Type de pièce | Oui | CNI, Passeport, Permis... | CNI |
| N° de pièce | Oui | Numéro du document | B12345678901 |
| Délivré le | Oui | Date de délivrance | 15/03/2020 |
| Expire le | Oui | Date d'expiration | 14/03/2030 |
| Délivré par | Oui | Autorité | CECU-Ouagadougou |

**Étape 2 — Contact** :

| Champ | Obligatoire | Exemple |
|-------|------------|---------|
| Téléphone 1 | Oui | +226 70 98 76 54 |
| Téléphone 2 | Non | +226 50 12 34 56 |
| Email | Non | issouf.konate@email.bf |
| Adresse | Oui | Rue 10.123, secteur 7 |
| Ville | Oui | Ouagadougou |
| Région | Oui | CENTRE |

**Étape 3 — Documents KYC**

Téléchargez obligatoirement :
- CNI recto (photo ou scan)
- CNI verso
- Selfie du client (photo prise en direct)

[Image: Interface KYC avec capture selfie en direct]

### 6.2 Vérifier un KYC

Pour les clients en attente de vérification :
1. Accédez à **Clients > Vérifications KYC**
2. Sélectionnez le client
3. Comparez la photo du selfie avec la photo de la CNI
4. Vérifiez que les informations correspondent
5. Cliquez sur « KYC Vérifié » ou « KYC Rejeté »
6. Ajoutez des notes si nécessaire

> **Note** : Seuls les utilisateurs avec le rôle « Vérificateur KYC » peuvent valider.

### 6.3 Associer un véhicule à un client

L'association se fait automatiquement lors de la vente (voir section 7). Vous pouvez aussi l'effectuer manuellement :

1. Accédez au profil du client
2. Cliquez sur « Associer un véhicule »
3. Saisissez le VIN ou scannez le QR code
4. Validez

Le système génère automatiquement un **certificat de propriété** numérique.

### 6.4 Consulter l'historique d'un véhicule

Accédez à **Stocks > Véhicules**, recherchez le VIN, puis cliquez sur « Historique ».

L'historique affiche :
- Dates de chaque mouvement
- Propriétaires successifs
- Ventes et transferts
- Contrôles de conformité
- Alertes de sécurité

[Image: Page historique d'un véhicule avec timeline verticale]

---

## 7. Gestion commerciale et facturation

### 7.1 Enregistrer une vente

Accédez à **Commercial > Ventes > Nouvelle vente**.

**Étape 1 — Client**
- Sélectionnez un client existant (recherche par nom/téléphone)
- Ou créez un nouveau client (voir section 6)

**Étape 2 — Véhicules**
- Ajoutez un ou plusieurs véhicules par VIN ou scan QR
- Le prix unitaire s'affiche automatiquement (dernier prix enregistré)
- Modifiez le prix si nécessaire

**Étape 3 — Paiement**

| Mode de paiement | Description |
|------------------|-------------|
| Espèces | Paiement comptant |
| Virement bancaire | Virement sur compte bancaire |
| Mobile Money | Orange Money, Moov Money, Coris Money |
| Chèque | Chèque bancaire |
| Crédit | Vente à crédit |
| Échelonnement | Paiement en plusieurs fois |

**Étape 4 — Validation**

Avant validation, le système vérifie automatiquement :
- ✅ Le client a un KYC vérifié
- ✅ Le véhicule est bien en stock
- ✅ Le véhicule n'est pas sur la liste noire
- ✅ Le véhicule est conforme réglementairement
- ✅ La marge de vente est dans la fourchette acceptable

Si toutes les vérifications passent, la vente est enregistrée et la facture OHADA est générée automatiquement.

[Image: Écran de vente avec vérifications automatiques en temps réel]

### 7.2 Consulter les factures

Accédez à **Commercial > Factures**.

Chaque facture contient :
- Numéro de facture (format OHADA)
- Informations vendeur et acheteur
- Détails du (des) véhicule(s)
- Prix unitaire, quantité, total HT
- Taxes (TVA, DUTY)
- Total TTC
- Signature électronique DRCTT
- QR code de vérification

### 7.3 Télécharger une facture

1. Sélectionnez la facture
2. Cliquez sur « Télécharger PDF »
3. La facture est signée électroniquement et vérifiable

### 7.4 Analyse des marges

Accédez à **Commercial > Tarifs et marges**.

Le tableau affiche :
- Prix d'achat moyen par catégorie
- Prix de vente moyen par catégorie
- Taux de marge moyen
- Nombre de ventes
- Revenu total
- Nombre d'anomalies détectées

[Image: Graphique d'analyse des marges avec courbes d'évolution]

### 7.5 Anomalies de prix

Accédez à **Commercial > Anomalies**.

Le système détecte automatiquement :
- **Marge trop faible** : Vente en dessous du seuil de rentabilité
- **Marge trop élevée** : Vente avec marge supérieure à 150% de la moyenne du marché
- **Prix aberrant** : Écart de plus de 3 sigmas par rapport à la moyenne

Pour chaque anomalie, vous pouvez :
- Consulter les détails
- Ajouter une justification
- Corriger la vente si erreur

---

## 8. Rapportage trimestriel

### 8.1 Qu'est-ce que le rapport trimestriel ?

L'**arrêté ministériel 05/06/2026** impose à tous les importateurs, distributeurs et unités d'assemblage de soumettre un rapport trimestriel détaillé. Ce rapport comprend :

- Inventaire des véhicules au début et à la fin du trimestre
- Détail des importations/assemblages
- Détail des ventes (par catégorie, par fabricant)
- Calcul des marges
- État de conformité
- Taxes collectées et versées

### 8.2 Calendrier des échéances

| Trimestre | Période | Date limite de soumission |
|-----------|---------|--------------------------|
| T1 | Janvier — Mars | 15 Avril |
| T2 | Avril — Juin | 15 Juillet |
| T3 | Juillet — Septembre | 15 Octobre |
| T4 | Octobre — Décembre | 15 Janvier (année suivante) |

> **Pénalité de retard** : 100 000 FCFA par jour de retard, pouvant aller jusqu'à la suspension de l'agrément.

### 8.3 Générer le rapport — étape par étape

**Étape 1 — Accéder au module**

Rendez-vous à **Rapports > Rapport trimestriel**.

Le tableau de bord affiche :
- Le trimestre en cours
- Le nombre de jours restants
- Le statut (NON_COMMENCÉ, EN_COURS, PRÊT, SOUMIS)
- Le niveau d'alerte (vert, orange, rouge)

[Image: Tableau de bord du rapport trimestriel avec compte à rebours]

**Étape 2 — Lancer la génération**

1. Sélectionnez l'année et le trimestre
2. Cliquez sur « Générer le rapport »
3. Le système lance le calcul en arrière-plan (durée estimée : 5-15 minutes selon le volume)

**Étape 3 — Vérifier les données**

Une fois généré, le rapport affiche :
- **Récapitulatif** : Nombre de ventes, CA total, stock final
- **Tableau des ventes** : Détail par véhicule (VIN, catégorie, prix, date)
- **Tableau des importations** : Détail des arrivées
- **État de conformité** : Score et items à corriger
- **Taxes** : Total des taxes collectées

Vérifiez attentivement chaque section. Si vous constatez une erreur :
- Retournez dans le module concerné (Stocks, Ventes)
- Corrigez la donnée
- Revenez au rapport et cliquez sur « Recalculer »

[Image: Aperçu du rapport trimestriel avec données vérifiables]

**Étape 4 — Télécharger les fichiers**

Cliquez sur « Télécharger » pour obtenir :
- Le rapport au format **PDF** (signé électroniquement)
- Le fichier **XML** (format UEMOA pour transmission électronique)

**Étape 5 — Soumettre au ministère**

1. Vérifiez une dernière fois les données
2. Cliquez sur « Soumettre au ministère »
3. Confirmez la soumission
4. Le système génère un **numéro d'accusé de réception** (ex: RPT-2024-T2-0001234)
5. Conservez ce numéro — il est la preuve de votre soumission

**Reponse du ministère** :
- **APProuvé** : Le rapport est conforme
- **Rejeté** : Le rapport présente des erreurs graves
- **Modifications demandées** : Corrections partielles nécessaires

Vous recevrez une notification pour chaque changement de statut.

[Image: Confirmation de soumission avec numéro d'accusé de réception]

### 8.4 Consulter l'historique

Accédez à **Rapports > Historique** pour consulter tous vos rapports passés avec leur statut.

---

## 9. Conformité et auto-évaluation

### 9.1 Votre score de conformité

Le score de conformité est calculé automatiquement sur 100 points, répartis en 6 dimensions :

| Dimension | Points | Description |
|-----------|--------|-------------|
| **Documents** | 20 | Documents réglementaires à jour |
| **Véhicules** | 20 | Conformité des véhicules importés/vendus |
| **Prix** | 15 | Marges dans les fourchettes autorisées |
| **KYC** | 15 | Clients vérifiés et documentés |
| **Reporting** | 15 | Rapports trimestriels soumis à temps |
| **Stock** | 15 | Inventaires réguliers et exacts |

**Interprétation du score** :
- 🟢 **80-100** : Conforme — Aucun risque de sanction
- 🟡 **50-79** : Attention — Des correctifs sont nécessaires
- 🔴 **0-49** : Non conforme — Risque de sanction imminent

[Image: Jauge de score de conformité avec répartition par dimension]

### 9.2 Lancer une auto-évaluation

Accédez à **Conformité > Auto-évaluation > Nouvelle évaluation**.

1. Sélectionnez le type d'évaluation (Auto-évaluation, Inspection, Audit)
2. Le système génère une checklist personnalisée selon votre type d'acteur
3. Répondez à chaque item : **CONFORME**, **NON CONFORME**, ou **NON APPLICABLE**
4. Pour chaque item non conforme, ajoutez une note et téléchargez une preuve de correction si applicable
5. Validez l'évaluation

Le score est recalculé immédiatement.

### 9.3 Consulter les règles de conformité

Accédez à **Conformité > Règles**.

La liste affiche toutes les règles applicables avec :
- Le code et le nom de la règle
- Le type (Document, Véhicule, Prix, Stock, KYC, Timing, Douane, Fiscalité)
- La sévérité (Info, Warning, Critique, Bloquant)
- Le statut (Active / Inactive)
- La référence légale (article de l'arrêté)

### 9.4 Compte à rebours

Le widget « Compte à rebours » affiche :
- Le nombre de jours avant la prochaine échéance critique
- Le niveau d'alerte (vert > 90j, orange 30-90j, rouge < 30j)
- Les écheances à venir (rapport trimestriel, renouvellement d'agrément, etc.)

**Actions recommandées selon le niveau** :

| Niveau | Jours restants | Action |
|--------|---------------|--------|
| 🟢 Vert | > 90 | Surveillance normale |
| 🟡 Orange | 30-90 | Planifier les actions correctives |
| 🔴 Rouge | < 30 | Agir immédiatement — risque de sanction |

[Image: Widget compte à rebours avec alerte rouge et actions recommandées]

---

## 10. Sécurité et alertes

### 10.1 Vos alertes

Accédez à **Sécurité > Alertes** pour consulter les alertes vous concernant.

**Types d'alertes** :

| Type | Description | Action requise |
|------|-------------|---------------|
| Marge anormale | Vente avec marge hors fourchette | Justifier ou corriger |
| Stock faible | Moins de 10 unités en stock | Réapprovisionner |
| Document expirant | Document KYC qui expire dans 30j | Renouveler |
| KYC requis | Client non vérifié | Compléter la vérification |
| Compte à rebours | Échéance réglementaire proche | Agir avant la date |

### 10.2 Liste noire

Accédez à **Sécurité > Liste noire**.

La liste noire contient les véhicules, clients et acteurs signalés pour :
- Vol
- Fraude
- Contrefaçon
- Non-conformité critique
- Saisie administrative
- Sinistre total (assurance)

> **Important** : Un véhicule figurant sur la liste noire ne peut pas être vendu. Le système bloque automatiquement la vente.

### 10.3 Signaler un incident

Pour signaler un véhicule volé ou une fraude :

1. Accédez à **Sécurité > Signalements > Nouveau**
2. Sélectionnez le type d'incident
3. Saisissez le VIN ou scannez le QR code
4. Décrivez l'incident en détail
5. Téléchargez les preuves si disponibles (PV, photos)
6. Validez

Le signalement est transmis automatiquement à la DRCTT et au CNTI.

[Image: Formulaire de signalement d'incident avec upload de pièces jointes]

---

## 11. Portail ministère

> **Accès réservé aux contrôleurs et administrateurs DRCTT.**

### 11.1 Tableau de bord national

Le portail ministère offre une vue d'ensemble nationale du secteur :

- **Nombre d'acteurs** par type et par région
- **Conformité globale** — Taux de conformité national
- **Ventes mensuelles** — Évolution du marché
- **Alertes de sécurité** — Alertes actives par sévérité
- **Rapports trimestriels** — Statut de soumission par acteur

### 11.2 Gestion des agréments

Accédez à **Portail > Agréments**.

Fonctionnalités :
- Consulter les demandes d'agrément en attente
- Approuver ou rejeter une demande
- Renouveler un agrément expirant
- Suspendre ou révoquer un agrément
- Historique des décisions

### 11.3 Révision des rapports

Accédez à **Portail > Rapports soumis**.

Pour chaque rapport :
1. Consultez le résumé (score, CA, nombre de ventes)
2. Téléchargez le PDF et le XML
3. Vérifiez la cohérence des données
4. Prenez une décision : **Approuvé**, **Rejeté**, ou **Modifications demandées**
5. Ajoutez des notes pour l'acteur

### 11.4 Planification des inspections

Accédez à **Portail > Inspections**.

1. Créez une inspection (régulière, réclamation, aléatoire, suivi)
2. Sélectionnez l'acteur à inspecter
3. Assignez un contrôleur
4. Définissez la date
5. Le contrôleur reçoit la notification sur son app mobile

### 11.5 Agrégations nationales

Accédez à **Portail > Statistiques** pour consulter :
- Ventes par région et par trimestre
- Conformité par type d'acteur
- Évolution des stocks nationaux
- Tendances des fraudes
- Revenus fiscaux générés

[Image: Tableau de bord national avec carte du Burkina Faso et statistiques par région]

---

## 12. FAQ

### 12.1 Questions générales

**Q : Qui peut utiliser iReg Moto BF ?**
R : Tous les acteurs du secteur des deux-roues au Burkina Faso : importateurs, distributeurs, unités d'assemblage, détaillants, ainsi que les agents de la DRCTT et du CNTI.

**Q : Est-ce que la plateforme est gratuite ?**
R : L'inscription et l'utilisation de base sont gratuites pour les acteurs économiques. Certains services premium (rapports avancés, support prioritaire) peuvent être facturés.

**Q : Puis-je utiliser iReg Moto BF sans connexion Internet ?**
R : Oui ! L'application fonctionne en mode offline. Vos données sont stockées localement et se synchronisent automatiquement dès que la connexion est rétablie. Vous pouvez rester offline jusqu'à 72h sans perte de données.

### 12.2 Questions techniques

**Q : Quels navigateurs sont supportés ?**
R : Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Nous recommandons Chrome pour une expérience optimale.

**Q : Comment fonctionne la synchronisation offline ?**
R : Vos saisies (ventes, clients, mouvements de stock) sont enregistrées dans la mémoire de votre appareil. Lorsque la connexion revient, elles sont envoyées automatiquement au serveur. En cas de conflit, le système applique les règles métier définies (dernier écrit gagne pour les clients, alerte manuelle pour les ventes).

**Q : Mes données sont-elles sécurisées ?**
R : Oui. Les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256). L'authentification utilise des tokens JWT avec double facteur obligatoire pour les administrateurs. Toutes les actions sont tracées dans un audit trail immuable.

### 12.3 Questions réglementaires

**Q : Que se passe-t-il si je ne soumets pas mon rapport trimestriel ?**
R : Une amende de 100 000 FCFA par jour de retard est appliquée. Au-delà de 30 jours de retard, votre agrément peut être suspendu, vous interdisant toute activité d'importation ou de vente.

**Q : Comment est calculé mon score de conformité ?**
R : Le score est calculé sur 100 points répartis en 6 dimensions (Documents, Véhicules, Prix, KYC, Reporting, Stock). Il est mis à jour en temps réel à chaque opération (vente, import, vérification KYC).

**Q : Qu'est-ce qu'un « Bloquant » en conformité ?**
R : Un item « Bloquant » empêche toute opération (vente, import) jusqu'à sa résolution. Par exemple, un agrément expiré ou un véhicule sur liste noire.

**Q : Puis-je vendre un véhicule sans KYC client ?**
R : Non. La vente d'un véhicule à un client non vérifié KYC est bloquée par le système. Le KYC est obligatoire pour tout achat de deux-roues motorisé depuis l'arrêté 05/06/2026.

### 12.4 Questions pratiques

**Q : Comment ajouter un nouvel entrepôt ?**
R : Accédez à Acteurs > Mes entrepôts > Ajouter. Renseignez l'adresse et positionnez l'entrepôt sur la carte.

**Q : Comment modifier une vente déjà enregistrée ?**
R : Une vente ne peut être modifiée que si elle est au statut BROUILLON. Une fois finalisée, seule l'annulation est possible (avec justification obligatoire).

**Q : Comment contacter le support ?**
R : Par email : support@ireg-moto.bf | Par téléphone : +226 25 30 12 34 | Via le chat intégré (icône en bas à droite)

**Q : Comment réinitialiser mon mot de passe MFA ?**
R : Contactez votre administrateur entreprise ou le support technique. Une procédure de réinitialisation sécurisée sera initiée.

### 12.5 Glossaire

| Terme | Définition |
|-------|-----------|
| **VIN** | Vehicle Identification Number — Numéro d'identification unique du véhicule (17 caractères) |
| **KYC** | Know Your Customer — Processus de vérification d'identité du client |
| **MFA** | Multi-Factor Authentication — Authentification à double facteur |
| **OHADA** | Organisation pour l'Harmonisation en Afrique du Droit des Affaires — Normes comptables et fiscales |
| **DRCTT** | Direction de la Réglementation et du Contrôle des Transports Terrestres |
| **CNTI** | Centre National de Traitement de l'Information |
| **NIF** | Numéro d'Identification Fiscale |
| **RCCM** | Registre du Commerce et du Crédit Mobilier |
| **UEMOA** | Union Économique et Monétaire Ouest Africaine |
| **PWA** | Progressive Web App — Application web fonctionnant comme une app native |

---

**Support utilisateur**
- Email : support@ireg-moto.bf
- Téléphone : +226 25 30 12 34 (lundi-vendredi, 8h-17h)
- Chat en ligne : disponible dans l'application

**Mises à jour de ce manuel**
Ce manuel est mis à jour régulièrement. Version actuelle : 1.0.0 (Juillet 2024)

---

> *« iReg Moto BF — La conformité simplifiée pour tout le secteur des deux-roues au Burkina Faso. »*
