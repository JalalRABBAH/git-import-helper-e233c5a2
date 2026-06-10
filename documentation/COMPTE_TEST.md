# Comptes de Test — iReg Moto BF

Ce document presente l'ensemble des **9 comptes de test** pre-configures sur la plateforme iReg Moto BF. Ces comptes permettent de tester l'integralite des fonctionnalites pour chaque profil metier, de l'importateur au super administrateur.

> **Attention** : Ces comptes sont **strictement reserves aux environnements de developpement et de recette**. Ils sont automatiquement desactives en production.

---

## Table complete des comptes

| # | Email | Role | Entreprise / Organisme | Mot de passe | MFA | Acces |
|---|---|---|---|---|---|---|
| 1 | `importateur@suzuki-bf.bf` | **Importateur** | Suzuki Burkina Faso | `Test@123456` | TOTP | App Entreprises |
| 2 | `distributeur@yamaha-bf.bf` | **Distributeur** | Yamaha Burkina | `Test@123456` | TOTP | App Entreprises |
| 3 | `assembleur@moto-afrique.bf` | **Assembleur** | Moto Afrique SA | `Test@123456` | TOTP | App Entreprises |
| 4 | `detail@boutique-moto-ouaga.bf` | **Detallant** | Boutique Moto Ouaga | `Test@123456` | TOTP | App Entreprises |
| 5 | `admin@mincommerce.gov.bf` | **Administrateur Commerce** | Ministere du Commerce | `Test@123456` | TOTP | App Autorites |
| 6 | `inspecteur@cnti.gov.bf` | **Inspecteur CNTI** | Centre National des Transports et de l'Inspection (CNTI) | `Test@123456` | TOTP | App Autorites |
| 7 | `controleur@mincommerce.gov.bf` | **Controleur** | Ministere du Commerce | `Test@123456` | TOTP | App Autorites |
| 8 | `superadmin@ireg-moto-bf.gov.bf` | **Super Administrateur** | iReg Moto BF (Plateforme) | `Test@123456` | TOTP | App Autorites |
| 9 | `support@ireg-moto-bf.gov.bf` | **Support Technique** | iReg Moto BF (Plateforme) | `Test@123456` | TOTP | App Autorites |

---

## Fiches detaillees par compte

### 1. Importateur — `importateur@suzuki-bf.bf`

**Profil** : Represente une entreprise d'importation de vehicules deux-roues au Burkina Faso.

| Champ | Valeur |
|---|---|
| **Nom complet** | Amadou KONE |
| **Poste** | Directeur des Operations |
| **Entreprise** | Suzuki Burkina Faso |
| **NIF** | 0001234567890 |
| **RCCM** | BF-OUA-2023-1234 |
| **Adresse** | Avenue de l'Independance, Ouagadougou |
| **Telephone** | +226 70 12 34 56 |
| **Statut agrement** | Actif (valide jusqu'au 31/12/2026) |

**Permissions disponibles** :

- Consulter le tableau de bord (KPIs, alertes)
- Gerer les stocks d'importation (ajout manuel, import CSV)
- Scanner les QR codes des vehicules
- Gerer les clients (KYC)
- Enregistrer des ventes (wizard 4 etapes)
- Generer les rapports trimestriels
- Verifier son scoring de conformite (150 points)
- Gerer les utilisateurs de son entreprise
- Consulter l'historique des transactions
- Telecharger les attestations et certificats

**Scenario de test recommande** :

1. Connexion avec email + mot de passe + MFA
2. Ajouter un lot de 50 motos au stock (import CSV)
3. Scanner les QR codes des vehicules
4. Enregistrer 3 ventes avec KYC client complet
5. Generer le rapport trimestriel Q1 2026
6. Verifier le scoring de conformite

---

### 2. Distributeur — `distributeur@yamaha-bf.bf`

**Profil** : Represente un distributeur national de vehicules deux-roues.

| Champ | Valeur |
|---|---|
| **Nom complet** | Fatima OUEDRAOGO |
| **Poste** | Responsable Distribution |
| **Entreprise** | Yamaha Burkina |
| **NIF** | 0009876543210 |
| **RCCM** | BF-BOB-2023-5678 |
| **Adresse** | Boulevard de la Revolution, Bobo-Dioulasso |
| **Telephone** | +226 71 23 45 67 |
| **Statut agrement** | Actif (valide jusqu'au 31/12/2026) |

**Permissions disponibles** :

- Toutes les permissions de l'importateur
- Receptionner des transferts de stock depuis les importateurs
- Transferer du stock vers les detaillants
- Consulter les statistiques de vente par region
- Gerer les commandes des detaillants
- Suivre les livraisons en cours

**Scenario de test recommande** :

1. Connexion avec MFA
2. Visualiser le stock actuel (transferts en attente)
3. Receptionner un transfert de 30 scooters
4. Transferer 15 unites vers 3 detaillants differents
5. Consulter les statistiques de vente par region
6. Verifier les alertes de stock critique

---

### 3. Assembleur — `assembleur@moto-afrique.bf`

**Profil** : Represente une unite d'assemblage de vehicules deux-roues sur le territoire.

| Champ | Valeur |
|---|---|
| **Nom complet** | Issouf SANOU |
| **Poste** | Chef d'Atelier |
| **Entreprise** | Moto Afrique SA |
| **NIF** | 0004567891234 |
| **RCCM** | BF-OUA-2023-9012 |
| **Adresse** | Zone Industrielle de Kossodo, Ouagadougou |
| **Telephone** | +226 72 34 56 78 |
| **Statut agrement** | Actif (valide jusqu'au 31/12/2026) |

**Permissions disponibles** :

- Toutes les permissions de l'importateur
- Gerer les nomenclatures de montage (BOM)
- Enregistrer les pieces detachees recues
- Suivre les chaines de montage
- Enregistrer les vehicules assembles
- Gerer la qualite et les controles internes
- Produire les certificats de conformite interne

**Scenario de test recommande** :

1. Connexion avec MFA
2. Consulter les nomenclatures de montage actives
3. Enregistrer la reception de pieces detachees
4. Lancer une chaine de montage (10 unites)
5. Effectuer les controles qualite
6. Enregistrer les vehicules assembles dans le stock
7. Generer les certificats de conformite interne

---

### 4. Detallant — `detail@boutique-moto-ouaga.bf`

**Profil** : Represente une boutique de vente au detail de motos.

| Champ | Valeur |
|---|---|
| **Nom complet** | Pascal ZONGO |
| **Poste** | Gerant |
| **Entreprise** | Boutique Moto Ouaga |
| **NIF** | 0007891234567 |
| **RCCM** | BF-OUA-2024-3456 |
| **Adresse** | Rue du Marche, secteur 10, Ouagadougou |
| **Telephone** | +226 73 45 67 89 |
| **Statut agrement** | Actif (valide jusqu'au 31/12/2026) |

**Permissions disponibles** :

- Consulter le tableau de bord (ventes du jour, mois)
- Gerer le stock en boutique (reception, ajustement)
- Scanner les QR codes des vehicules
- Gerer les clients (KYC complet)
- Enregistrer des ventes (wizard 4 etapes)
- Consulter l'historique des ventes
- Imprimer les factures et attestations
- Verifier son scoring de conformite

**Scenario de test recommande** :

1. Connexion avec MFA
2. Receptionner un transfert de 5 motos du distributeur
3. Scanner le QR code d'une moto
4. Enregistrer une vente avec KYC client (nouveau client)
5. Imprimer la facture et l'attestation d'immatriculation
6. Consulter les statistiques de vente du mois

---

### 5. Administrateur Commerce — `admin@mincommerce.gov.bf`

**Profil** : Represente le Ministere du Commerce, responsable de la regulation du secteur.

| Champ | Valeur |
|---|---|
| **Nom complet** | Aminata TRAORE |
| **Poste** | Directrice du Commerce Interieur |
| **Organisme** | Ministere du Commerce, de l'Industrie et de l'Artisanat |
| **Matricule** | MCIA-2015-0042 |
| **Telephone** | +226 25 30 12 34 |
| **Niveau d'acces** | National |

**Permissions disponibles** :

- Consulter le tableau de bord national (carte, KPIs agreges)
- Gerer les demandes d'agrement (approuver, rejeter, suspendre)
- Valider les rapports trimestriels des entreprises
- Planifier des inspections
- Consulter les alertes de fraude
- Gerer les interdictions de vente (blacklist)
- Publier des textes reglementaires
- Consulter les statistiques nationales
- Exporter des rapports au format Excel/PDF
- Gerer les utilisateurs du Ministere

**Scenario de test recommande** :

1. Connexion avec MFA
2. Consulter le tableau de bord national (volume de ventes, entreprises actives)
3. Traiter 3 demandes d'agrement en attente (approuver 2, rejeter 1)
4. Valider les rapports trimestriels soumis par les entreprises
5. Planifier une inspection chez un detaillant
6. Consulter les alertes de fraude et lancer une investigation
7. Publier une mise a jour reglementaire

---

### 6. Inspecteur CNTI — `inspecteur@cnti.gov.bf`

**Profil** : Represente le Centre National des Transports et de l'Inspection, responsable des controles techniques.

| Champ | Valeur |
|---|---|
| **Nom complet** | Moussa COMPAORE |
| **Poste** | Inspecteur Principal |
| **Organisme** | CNTI (Centre National des Transports et de l'Inspection) |
| **Matricule** | CNTI-2018-0015 |
| **Telephone** | +226 25 31 23 45 |
| **Niveau d'acces** | National — Controle technique |

**Permissions disponibles** :

- Consulter les inspections planifiees pour sa zone
- Effectuer des controles techniques sur site
- Rediger des rapports d'inspection
- Attribuer des scores de conformite
- Recommander des sanctions
- Consulter l'historique des inspections
- Gerer les grilles d'evaluation
- Signaler des anomalies techniques

**Scenario de test recommande** :

1. Connexion avec MFA
2. Consulter le planning des inspections de la semaine
3. Effectuer un controle technique chez un assembleur
4. Remplir la grille d'evaluation (150 points)
5. Rediger le rapport d'inspection avec recommandations
6. Attribuer un score de conformite
7. Signaler une anomalie critique (freins defectueux)

---

### 7. Controleur — `controleur@mincommerce.gov.bf`

**Profil** : Represente un agent de controle du Ministere du Commerce en charge des verifications sur le terrain.

| Champ | Valeur |
|---|---|
| **Nom complet** | Rose Marie ILBOUDO |
| **Poste** | Controleuse Economique |
| **Organisme** | Ministere du Commerce |
| **Matricule** | MCIA-2020-0028 |
| **Telephone** | +226 25 32 34 56 |
| **Niveau d'acces** | Regional (Centre) |

**Permissions disponibles** :

- Consulter les controles planifies pour sa region
- Effectuer des controles inopines sur le terrain
- Verifier les stocks et les documents de conformite
- Remplir des constats de non-conformite
- Emettre des mises en demeure
- Consulter les alertes de fraude de sa region
- Verifier la validite des agrements
- Produire des rapports de controle

**Scenario de test recommande** :

1. Connexion avec MFA
2. Consulter les controles planifies pour la region Centre
3. Effectuer un controle inopine chez un detaillant
4. Verifier la conformite des stocks (QR codes, documents)
5. Remplir un constat de non-conformite
6. Emettre une mise en demeure avec delai de correction
7. Consulter les alertes de fraude de la region

---

### 8. Super Administrateur — `superadmin@ireg-moto-bf.gov.bf`

**Profil** : Administrateur technique de la plateforme avec acces illimite.

| Champ | Valeur |
|---|---|
| **Nom complet** | System Administrator |
| **Poste** | Super Administrateur |
| **Organisme** | iReg Moto BF (Plateforme) |
| **Matricule** | SYS-ADMIN-001 |
| **Telephone** | +226 25 33 45 67 |
| **Niveau d'acces** | Global (tous les tenants) |

**Permissions disponibles** :

- **Acces total** a toutes les fonctionnalites des deux applications
- Gerer les tenants (entreprises et organismes)
- Gerer tous les utilisateurs de la plateforme
- Configurer les parametres systeme
- Gerer les roles et permissions (RBAC)
- Consulter les logs d'audit complets
- Gerer les sauvegardes et restaurations
- Configurer les notifications systeme
- Gerer les webhooks
- Acceder aux metriques et monitoring
- Effectuer des operations de maintenance

**Scenario de test recommande** :

1. Connexion avec MFA
2. Consulter les metriques systeme (CPU, memoire, requetes/seconde)
3. Gerer les utilisateurs (creer, modifier, desactiver)
4. Consulter les logs d'audit des 7 derniers jours
5. Configurer une nouvelle regle de notification
6. Verifier l'etat des sauvegardes automatiques
7. Exporter un rapport global de la plateforme

---

### 9. Support Technique — `support@ireg-moto-bf.gov.bf`

**Profil** : Equipe support pour assister les utilisateurs de la plateforme.

| Champ | Valeur |
|---|---|
| **Nom complet** | Sophie KABORE |
| **Poste** | Agent Support Niveau 2 |
| **Organisme** | iReg Moto BF (Plateforme) |
| **Matricule** | SUP-2023-007 |
| **Telephone** | +226 25 34 56 78 |
| **Niveau d'acces** | Lecture globale, modifications limitees |

**Permissions disponibles** :

- Consulter les comptes utilisateurs (lecture)
- Reinitialiser les mots de passe
- Desactiver/reactiver des comptes bloques
- Consulter les tickets de support
- Repondre aux demandes d'assistance
- Consulter les logs d'erreur
- Escalader les incidents vers les equipes techniques
- Consulter les statistiques d'utilisation
- Generer des rapports d'incidents

**Scenario de test recommande** :

1. Connexion avec MFA
2. Consulter les tickets de support en attente
3. Reinitialiser le mot de passe d'un utilisateur bloque
4. Consulter les logs d'erreur des 24 dernieres heures
5. Repondre a une demande d'assistance sur l'import CSV
6. Escalader un incident technique vers l'equipe DevOps
7. Generer un rapport d'incidents hebdomadaire

---

## Configuration MFA (TOTP)

Tous les comptes utilisent l'authentification multi-facteurs (MFA) via TOTP (Time-based One-Time Password). Lors de la premiere connexion, un QR code est affiche a scanner avec une application d'authentification :

| Application compatible | Plateforme |
|---|---|
| Google Authenticator | iOS / Android |
| Microsoft Authenticator | iOS / Android |
| Authy | iOS / Android / Desktop |
| 1Password | iOS / Android / Desktop |

**Procedure d'activation MFA** :

1. Se connecter avec email et mot de passe
2. Scanner le QR code affiche avec l'application
3. Saisir le code a 6 chiffres genere
4. Conserver les codes de secours dans un endroit sur

---

## Donnees de test associees

Chaque compte de test est accompagne de donnees de demonstration pre-chargees :

| Type de donnees | Quantite | Description |
|---|---|---|
| Vehicules en stock | 500+ | Motos, scooters, tricycles de marques variees |
| Clients (KYC) | 200+ | Fiches clients completes avec pieces d'identite |
| Ventes enregistrees | 1 500+ | Historique de ventes sur 12 mois |
| Rapports trimestriels | 12 | Rapports Q1-Q4 2024 et Q1-Q4 2025 |
| Demandes d'agrement | 15 | En attente, approuvees, rejetees |
| Inspections | 25 | Planifiees, realisees, avec rapports |
| Alertes de fraude | 8 | Detectees, en investigation, resolues |
| Textes reglementaires | 5 | Arretes, circulaires, notes de service |

---

## Notes importantes

1. **Mots de passe** : Tous les comptes partagent le meme mot de passe `Test@123456` en environnement de developpement. En staging, les mots de passe sont differents et communiques separement.

2. **MFA** : Chaque compte doit configurer son MFA lors de la premiere connexion. Les codes de secours sont affiches une seule fois.

3. **Sessions** : Les sessions expirent apres **15 minutes d'inactivite** (JWT) ou **7 jours** (refresh token).

4. **Rate limiting** : Les comptes de test sont soumis aux memes limites de requetes que les comptes de production (100 req/minute).

5. **Reset des donnees** : Les donnees de test sont reinitialisees chaque nuit a 02:00 UTC via le script `seed:all`.

6. **Emails** : Aucun email n'est reellement envoye en environnement de developpement. Les emails sont captures par MailHog accessible sur `http://localhost:8025`.

---

## Problemes connus et solutions

| Probleme | Cause | Solution |
|---|---|---|
| "Compte non trouve" apres seed | Migration non executee | Lancer `npm run migration:run` avant le seed |
| MFA deja configure | Compte utilise precedemment | Utiliser les codes de secours ou contacter le support |
| Session expiree rapidement | Horloge systeme desynchronisee | Verifier la synchronisation NTP |
| QR code non scannable | Resolution d'ecran | Zoomer sur la page ou rafraichir |
