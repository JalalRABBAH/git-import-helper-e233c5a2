# iReg Moto BF — Guide d'Inspection Terrain

> **Version:** 1.0.0 | **Public cible:** Controleurs DRCTT, agents CNTI, inspecteurs du ministere

---

## Table des matieres

1. [Installation de l'app mobile](#1-installation-de-lapp-mobile)
2. [Utilisation en mode offline](#2-utilisation-en-mode-offline)
3. [Checklist d'inspection](#3-checklist-dinspection)
4. [Synchronisation des donnees](#4-synchronisation-des-donnees)
5. [Signalement des non-conformites](#5-signalement-des-non-conformites)

---

## 1. Installation de l'app mobile

### 1.1 Telechargement

L'application d'inspection terrain iReg Moto BF est disponible sur :

| Plateforme | Methode | Lien |
|------------|---------|------|
| **Android** | Google Play Store | « iReg Moto BF Inspection » |
| **Android** | APK direct (fallback) | https://ireg-moto.bf/download/apk |
| **iOS** | App Store | « iReg Moto BF Inspection » |

### 1.2 Configuration minimale requise

| Caracteristique | Minimum | Recommande |
|----------------|---------|------------|
| Systeme | Android 8.0+ / iOS 14+ | Android 12+ / iOS 16+ |
| Espace libre | 500 Mo | 1 Go |
| RAM | 2 Go | 4 Go |
| Camera | 8 MP | 12 MP+ |
| GPS | Oui (precision < 10m) | Oui (precision < 5m) |
| Connexion | 3G minimum | 4G / WiFi |

### 1.3 Premiere installation

**Etape 1 — Telecharger l'application**

Ouvrez le Google Play Store (ou App Store) et recherchez « iReg Moto BF Inspection ». L'icone officielle est le logo iReg Moto BF avec un badge « Inspection ».

[Image: Page Google Play Store de l'app iReg Moto BF Inspection]

**Etape 2 — Autorisations necessaires**

L'application necessite les autorisations suivantes :

| Autorisation | Usage | Obligatoire |
|-------------|-------|-------------|
| **Camera** | Scanner les QR codes, prendre des photos | Oui |
| **GPS / Localisation** | Enregistrer la position de l'inspection | Oui |
| **Stockage** | Sauvegarder les donnees en mode offline | Oui |
| **Internet** | Synchroniser avec le serveur | Recommande |
| **Telephone** | Appeler l'acteur ou le support | Non |

**Etape 3 — Connexion**

1. Ouvrez l'application
2. Saisissez votre identifiant controleur (fourni par la DRCTT)
3. Saisissez votre mot de passe
4. Saisissez le code MFA (Google Authenticator obligatoire pour les controleurs)

**Etape 4 — Synchronisation initiale**

A la premiere connexion, l'application telecharge :
- La liste des acteurs de votre zone de controle
- La liste noire des vehicules (mise a jour quotidienne)
- Vos inspections planifiees
- Les regles de conformite

Cette synchronisation initiale peut prendre 5 a 15 minutes selon votre connexion.

[Image: Ecran de connexion de l'app mobile avec logo DRCTT]

### 1.4 Interface principale

L'interface de l'application se compose de 5 onglets :

```
+------------------+------------------+------------------+------------------+------------------+
|   ACCUEIL        |   INSPECTION     |   SCANNER        |   LISTE NOIRE    |   PARAMETRES     |
+------------------+------------------+------------------+------------------+------------------+
| - Planning du    | - Nouvelle       | - Scan QR code   | - Recherche VIN  | - Compte         |
|   jour           |   inspection     | - Scan VIN       | - Vehicules      | - Mode offline   |
| - Inspections    | - Inspections    | - Verif. rapide  |   signales       | - Synchroniser   |
|   en cours       |   en cours       |                  | - Acteurs        | - Aide           |
| - Alertes        | - Historique     |                  |   signales       | - Deconnexion    |
+------------------+------------------+------------------+------------------+------------------+
```

[Image: Ecran d'accueil de l'app mobile avec planning du jour]

---

## 2. Utilisation en mode offline

### 2.1 Contexte

Les controleurs terrain operent frequemment dans des zones a connectivite limitee (zones rurales, coupures reseau). L'application iReg Moto BF Inspection est concue pour fonctionner **100% en mode offline**.

### 2.2 Donnees disponibles offline

| Donnee | Disponible offline | Mise a jour |
|--------|-------------------|-------------|
| Liste des acteurs de la zone | Oui | Quotidienne (sync) |
| Liste noire vehicules | Oui | Quotidienne (sync) |
| Liste noire clients | Oui | Quotidienne (sync) |
| Regles de conformite | Oui | A chaque sync |
| Checklist d'inspection | Oui | A chaque sync |
| Formulaire d'inspection | Oui | Permanent |
| Photos prises | Oui (stockage local) | A la sync |
| Rapports d'inspection | Oui (file d'attente) | A la sync |

### 2.3 Fonctionnement en mode offline

**Lorsque vous etes offline** :
- L'icone « Offline » s'affiche en haut de l'ecran (couleur orange)
- Toutes les fonctions restent operationnelles
- Les donnees saisies sont stockees dans la memoire de l'appareil
- Les photos sont stockees localement
- La verification VIN fonctionne avec la liste noire telechargee

**File d'attente de synchronisation** :
- Les inspections terminees sont mises en file d'attente
- Un compteur indique le nombre d'elements en attente
- Lors de la reconnexion, la synchronisation se fait automatiquement

### 2.4 Synchronisation manuelle

Pour forcer la synchronisation :
1. Assurez-vous d'avoir une connexion (WiFi ou mobile)
2. Allez dans l'onglet « Parametres »
3. Cliquez sur « Synchroniser maintenant »
4. Attendez la confirmation (barre de progression)

**Ordre de synchronisation** :
1. Envoi des inspections terminees (prioritaire)
2. Envoi des photos prises
3. Envoi des signalements
4. Telechargement des mises a jour (acteurs, liste noire)

### 2.5 Gestion du stockage offline

| Type de donnee | Espace estimé | Limite |
|---------------|--------------|--------|
| Base acteurs (zone) | 10-50 Mo | - |
| Liste noire | 5-20 Mo | - |
| Photos (100 inspections) | 200-500 Mo | configurable |
| Rapports | 1-5 Mo | - |
| **Total** | **216-575 Mo** | **1 Go max** |

> **Conseil** : Synchronisez-vous au moins une fois par jour pour eviter de saturer le stockage.

### 2.6 File d'attente et conflits

En cas de conflit (donnee modifiee sur le serveur et sur l'appareil) :
- **Inspection** : La version du controleur gagne (priorite terrain)
- **Photo** : Les deux versions sont conservees
- **Signalement** : La version du controleur gagne

Un rapport de conflit est genere et envoye a l'administrateur.

[Image: Ecran de synchronisation avec file d'attente et barre de progression]

---

## 3. Checklist d'inspection

### 3.1 Types d'inspection

| Type | Code | Description | Frequence |
|------|------|-------------|-----------|
| **Reguliere** | REG | Inspection planifiee programmee | Trimestrielle |
| **Reclamation** | REC | Inspection suite a une reclamation | Sur demande |
| **Aleatoire** | ALE | Inspection ciblee aleatoire | Mensuelle |
| **Suivi** | SUI | Inspection de suivi post-sanction | Sur demande |
| **Vente** | VEN | Controle lors d'une vente (terrain) | Aleatoire |

### 3.2 Preparation de l'inspection

Avant de partir sur le terrain :

1. **Consultez votre planning** (onglet Accueil)
2. **Synchronisez** vos donnees (si connexion disponible)
3. **Verifiez votre materiel** :
   - Telephone charge (> 50%)
   - Appareil photo fonctionnel
   - GPS actif
   - Liste noire a jour
4. **Preparez vos documents** :
   - Badge de controleur
   - Formulaire papier (backup)
   - Lettre de mission (si necessaire)

### 3.3 Checklist complete d'inspection

#### Section A — Identification de l'acteur

| # | Point de controle | Methode | Critere |
|---|------------------|---------|---------|
| A1 | Presence du panneau d'affichage | Visuel | Panneau visible avec RCCM et agrement |
| A2 | Validite de l'agrement DRCTT | Scan QR + verif. app | Agrement actif et non expire |
| A3 | Correspondance identite | CNI + registre | Personne rencontree = representant legal |
| A4 | Coordonnees GPS | GPS app | Localisation correspond a la declaration |

#### Section B — Documents reglementaires

| # | Point de controle | Document | Critere |
|---|------------------|----------|---------|
| B1 | Registre de commerce | RCCM | Valide et a jour |
| B2 | Attestation NIF | NIF | Correspond a la raison sociale |
| B3 | Assurance RC | Police | Non expiree, couverture adequate |
| B4 | Contrat de distribution | Contrat | Signe, fabricant agre |
| B5 | Plan de contenu local | Plan | Assembleurs uniquement, ≥ 40% |
| B6 | Certificats d'homologation | Homologation | UEMOA valide par modele |

#### Section C — Stocks et vehicules

| # | Point de controle | Methode | Critere |
|---|------------------|---------|---------|
| C1 | Correspondance stock declare | Comptage physique | Ecart < 5% |
| C2 | VIN enregistres | Scan QR + verif. app | Tous les vehicules scannes et conformes |
| C3 | Etiquetage QR code | Visuel | Chaque vehicule a son QR code iReg |
| C4 | Categories autorisees | Visuel + app | Aucun vehicule interdit |
| C5 | Etat des vehicules | Visuel | Neufs, non accidentes, conformes |
| C6 | Liste noire | Verif. app | Aucun vehicule signale |

#### Section D — Ventes et facturation

| # | Point de controle | Methode | Critere |
|---|------------------|---------|---------|
| D1 | Factures OHADA | Echantillon (10 factures) | Format conforme, taxes correctes |
| D2 | KYC clients | Echantillon (10 dossiers) | CNI verifiee, selfie present |
| D3 | Marges commerciales | Calcul + verif. app | Dans les seuils autorises |
| D4 | Registre des ventes | Verif. app | Toutes les ventes enregistrees |
| D5 | Certificats de propriete | Echantillon | Delivres aux clients |

#### Section E — Conformite generale

| # | Point de controle | Methode | Critere |
|---|------------------|---------|---------|
| E1 | Score de conformite | App iReg | ≥ 50/100 (attention si < 80) |
| E2 | Rapport trimestriel | Verif. app | Soumis dans les delais |
| E3 | Conditions des locaux | Visuel | Securite, surface, ventilation |
| E4 | Affichage obligatoire | Visuel | Prix, horaires, agrement visible |

[Image: Ecran de checklist d'inspection dans l'app avec cases a cocher]

### 3.4 Notation de l'inspection

Chaque point de controle est note :

| Resultat | Code | Impact score |
|----------|------|-------------|
| **Conforme** | C | +1 point |
| **Non conforme mineur** | NCM | -1 point (correctif 30 jours) |
| **Non conforme majeur** | NCMA | -3 points (correctif 15 jours) |
| **Non conforme critique** | NCC | -5 points (mesure immediate) |
| **Non verifiable** | NV | 0 (manque d'acces) |

**Seuils de decision** :

| Score | Decision | Action |
|-------|----------|--------|
| 85-100 | CONFORME | Aucune action, prochaine inspection dans 3 mois |
| 70-84 | CONFORME AVEC RESERVES | Recommandations, suivi dans 1 mois |
| 50-69 | NON CONFORME | Mise en demeure, correctif sous 30 jours |
| 0-49 | NON CONFORME CRITIQUE | Suspension possible, mesures immediates |

### 3.5 Cas particuliers

**Acteur absent** :
- Prenez une photo du local ferme avec geolocalisation
- Notez l'heure de passage
- Laissez un avis de passage si possible
- Signalez dans l'app « Acteur absent »

**Refus d'inspection** :
- Restez courtois et professionnel
- Rappelez l'obligation legale (arrete 05/06/2026)
- Notez le refus dans l'app
- Prenez une photo du representant si possible
- Signalez immédiatement a la DRCTT

**Fuite ou dissimulation** :
- Ne poursuivez pas seul
- Notez les faits objectivement
- Signalez a la DRCTT et au CNTI
- Ne vous mettez pas en danger

[Image: Controleur en inspection avec tablette, photo illustrative]

---

## 4. Synchronisation des donnees

### 4.1 Synchronisation automatique

L'application synchronise automatiquement lorsque :
- Vous ouvrez l'application (si connexion disponible)
- Vous terminez une inspection
- Vous passez de offline a online
- Vous cliquez sur « Synchroniser »

### 4.2 Etat de la synchronisation

| Icone | Signification | Action |
|-------|--------------|--------|
| 🟢 Vert | Tout est synchronise | Aucune action |
| 🟡 Orange | Synchronisation en cours | Attendre |
| 🔴 Rouge | Erreur de synchronisation | Verifier connexion, reessayer |
| ⬜ Gris | Mode offline | Synchronisation impossible |

### 4.3 Historique des synchronisations

Accedez a Parametres > Historique de synchronisation pour consulter :
- Date et heure de chaque synchronisation
- Nombre d'elements synchronises
- Duree de la synchronisation
- Erreurs eventuelles

### 4.4 Resoudre les problemes de synchronisation

| Probleme | Cause probable | Solution |
|----------|---------------|----------|
| Sync bloquee a 0% | Pas de connexion | Activer WiFi ou donnees mobiles |
| Sync bloquee a 50% | Serveur indisponible | Attendre 10 min, reessayer |
| Erreur « Auth failed » | Session expiree | Se reconnecter |
| Erreur « Quota exceeded » | Stockage local plein | Supprimer anciennes photos |
| Photos non envoyees | Fichiers trop gros | Compresser ou envoyer via WiFi |

[Image: Ecran de diagnostic de synchronisation avec indicateurs de statut]

---

## 5. Signalement des non-conformites

### 5.1 Types de signalements

| Type | Description | Exemple |
|------|-------------|---------|
| **VEHICULE_VOLE** | Vehicule declare vole | VIN apparaissant sur une liste |
| **CONTREFACON** | Vehicule ou piece contrefaite | Marque falsifiee, numero moteur altere |
| **FRAUDE_DOCUMENT** | Document falsifie | Fausse homologation, faux RCCM |
| **VENTE_SANS_KYC** | Vente sans verification client | Client non enregistre |
| **MARGE_ILLEGALE** | Marge excessive | Marge > 200% sur un vehicule |
| **NON_AGRE** | Acteur exercant sans agrement | Commerce non declare |
| **STOCK_DISPARU** | Ecart important inventaire | > 20% d'ecart entre declare et reel |
| **NON_RESPECT_CONTENU_LOCAL** | Taux de contenu local insuffisant | < 40% pour un assembleur |

### 5.2 Procedure de signalement

**Etape 1 — Documenter**

1. Ouvrez l'app et allez dans l'onglet « Signalement »
2. Selectionnez le type de signalement
3. Saisissez le VIN (si vehicule concerne) ou l'identifiant acteur
4. Le systeme verifie automatiquement les informations connues

**Etape 2 — Prendre des preuves**

- **Photos** : Minimum 3 photos (contexte, detail, preuve)
- **Geolocalisation** : Position GPS automatique
- **Notes** : Description factuelle et objective
- **Temoins** : Nom et contact des temoins si applicable

**Etape 3 — Classifier**

| Niveau | Description | Delai de traitement |
|--------|-------------|---------------------|
| **1 — Info** | Anomalie mineure, pas d'urgence | 7 jours |
| **2 — Warning** | Non-conformite a suivre | 3 jours |
| **3 — Critique** | Infraction grave, action rapide requise | 24 heures |
| **4 — Urgence** | Danger immediat (securite) | Immediate |

**Etape 4 — Soumettre**

1. Verifiez les informations saisies
2. Cliquez sur « Soumettre »
3. Le signalement est transmis :
   - Au serveur central (si online)
   - Mis en file d'attente (si offline)
   - Au CNTI si niveau 3-4
   - A la DRCTT dans tous les cas

**Etape 5 — Suivi**

Apres soumission, vous pouvez suivre l'etat de votre signalement :
- **SOUMIS** → Signalement recu
- **EN_COURS** → Investigation en cours
- **CONFIRME** → Infraction confirmee, mesures prises
- **REJETE** — Infraction non confirmee
- **CLOS** → Dossier clos

[Image: Formulaire de signalement dans l'app avec upload de photos]

### 5.3 Signalement rapide (verification VIN)

Lors d'un controle, vous pouvez verifier instantanement un VIN :

1. Allez dans l'onglet « Scanner »
2. Scannez le QR code ou saisissez le VIN manuellement
3. Le resultat s'affiche en 1-2 secondes :

```
+----------------------------------+
| VERIFICATION VIN                 |
+----------------------------------+
| VIN : JYARJ16E08A012345         |
|                                  |
| Statut : ENREGISTRE ✅           |
| Fabricant : YAMAHA               |
| Modele : YBR 125                 |
| Proprietaire : SIMOBF SA         |
|                                  |
| Liste noire : NON ✅             |
| Conformite : OUI ✅              |
|                                  |
| Dernier controle : 15/03/2024   |
+----------------------------------+
```

Si le vehicule est sur la liste noire :

```
+----------------------------------+
| ⚠️ ALERTE LISTE NOIRE ⚠️        |
+----------------------------------+
| VIN : JYARJ16E08A012345         |
|                                  |
| Statut : SIGNALE 🔴              |
| Raison : VOLE                    |
| Signale le : 10/06/2024          |
| Source : Police Nationale        |
|                                  |
| ⚠️ NE PAS LAISSER PARTIR        |
| 📞 Appeler CNTI : 17             |
| 📸 Documenter la situation       |
+----------------------------------+
```

### 5.4 Signalement d'urgence

En cas de danger immediat ou de flagrant delit :

1. **Appuyez sur le bouton rouge « URGENCE »** (ecran d'accueil)
2. Le systeme envoie automatiquement :
   - Votre position GPS
   - L'heure et la date
   - Un message d'alerte au CNTI et a la DRCTT
3. **Appelez le 17** (police) ou le **18** (gendarmerie)
4. **Restez en securite** — ne vous mettez pas en danger

[Image: Bouton d'urgence rouge sur l'ecran d'accueil de l'app]

### 5.5 Rapport d'inspection final

Apres chaque inspection, un rapport est genere automatiquement :

```
=================================================================
RAPPORT D'INSPECTION #INS-2024-001567
=================================================================
Date : 16/07/2024
Heure : 10:30 - 12:15
Inspecteur : Amadou KONATE (CNT-001234)

ACTEUR INSPECTE
Nom : SARL Moto Express BF
Type : Detailiant
Agrement : AGR-DET-2024-005678
Adresse : Avenue de l'Independance, Ouagadougou
GPS : 12.3714, -1.5197

TYPE D'INSPECTION : Reguliere trimestrielle

RESULTATS
A - Identification        : 4/4 conforme
B - Documents             : 5/6 non conforme mineur (B5: assurance expiree)
C - Stocks et vehicules   : 6/6 conforme
D - Ventes et facturation : 4/5 non conforme mineur (D2: 2 KYC incomplets)
E - Conformite generale   : 4/5 conforme

SCORE GLOBAL : 78/100 (CONFORME AVEC RESERVES)

NON-CONFORMITES
- B5 : Police d'assurance expiree depuis 15/06/2024
       Correctif sous 15 jours
- D2 : 2 dossiers KYC incomplets (clients non verifies)
       Correctif sous 30 jours

RECOMMANDATIONS
- Renouveler l'assurance immediatement
- Verifier systematiquement le KYC avant vente

PROCHAIN INSPECTION : 16/10/2024

Signature inspecteur : [signe numeriquement]
=================================================================
```

Ce rapport est :
- Stocke dans l'app (accessible hors ligne)
- Synchronise avec le serveur central
- Transmis a l'acteur (email)
- Archive dans le dossier de l'acteur (portail DRCTT)

---

## Annexes

### A. Materiel recommande

| Item | Recommandation | Prix indicatif |
|------|---------------|----------------|
| Smartphone robuste | Samsung Galaxy XCover 7 | 250 000 FCFA |
| Tablette 10" | Samsung Galaxy Tab Active 5 | 350 000 FCFA |
| Batterie externe | Anker 20 000 mAh | 25 000 FCFA |
| Etancheite | Housse waterproof universelle | 5 000 FCFA |
| Support vehicule | Support grille ventilation | 3 000 FCFA |

### B. Contacts d'urgence

| Service | Numero | Usage |
|---------|--------|-------|
| Police secours | 17 | Danger immediat, flagrant delit |
| Gendarmerie | 18 | Zones rurales, appui |
| Sapeurs-pompiers | 18 | Incendie, accident |
| CNTI | +226 25 XX XX XX | Signalement securite |
| DRCTT | +226 25 30 12 34 | Support inspection |
| Support app | +226 70 XX XX XX | Probleme technique |

### C. Glossaire terrain

| Terme | Definition |
|-------|-----------|
| **CNT** | Controleur — Agent charge des inspections |
| **KYC** | Know Your Customer — Verification d'identite client |
| **QR Code iReg** | Code unique attribue a chaque vehicule enregistre |
| **VIN** | Vehicle Identification Number — Numero d'identification du vehicule |
| **RCCM** | Registre du Commerce et du Credit Mobilier |
| **CNTI** | Centre National de Traitement de l'Information |
| **DRCTT** | Direction de la Reglementation et du Controle des Transports Terrestres |
| **Sync** | Synchronisation — Echange de donnees entre l'app et le serveur |

### D. Mise a jour de l'application

L'application se met a jour automatiquement :
- **Majeure** : Notification + telechargement WiFi obligatoire
- **Mineure** : Telechargement silencieux en arriere-plan
- **Securite** : Telechargement force sous 24h

Verifiez votre version : Parametres > A propos > Version actuelle

---

**Support technique mobile** : mobile-support@ireg-moto.bf
**Formation terrain** : formation@ireg-moto.bf

> *« L'inspection terrain est le garant de la conformite. Chaque controle contribue a securiser le marche des deux-roues au Burkina Faso. »*
