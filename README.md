# iReg Moto BF

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org)

> **Plateforme Reglementaire de Conformite Deux-Roues — Burkina Faso**
>
> Conforme a l'Arrete ministeriel 05/06/2026 du Ministere du Commerce

---

## Table des Matieres

- [Vue d'Ensemble](#vue-densemble)
- [Applications](#applications)
- [Architecture Technique](#architecture-technique)
- [Stack Technique](#stack-technique)
- [Installation Rapide](#installation-rapide)
- [Comptes de Test](#comptes-de-test)
- [Structure du Projet](#structure-du-projet)
- [Modules Fonctionnels](#modules-fonctionnels)
- [Conformite Reglementaire](#conformite-reglementaire)
- [Documentation](#documentation)
- [Equipe de Developpement](#equipe-de-developpement)
- [Licence](#licence)

---

## Vue d'Ensemble

**iReg Moto BF** est une plateforme SaaS complete de gestion reglementaire, tracabilite et reporting automatique pour le secteur des deux-roues au Burkina Faso. Elle garantit la conformite totale a l'arrete ministeriel du 05/06/2026 sous peine de fermeture administrative (3 mois a 1 an de delai).

La plateforme comprend **deux applications distinctes** :

| Application | Utilisateurs | URL |
|-------------|-------------|-----|
| **Espace Entreprises** | Importateurs, Distributeurs, Assembleurs, Detailants | `/apps/entreprises/` |
| **Espace Autorites** | Ministere du Commerce, CNTI, Controleurs terrain | `/apps/autorites/` |

**Fonctionnalites cles :**
- Enregistrement digital des acteurs economiques (RCCM, IFU, agrement)
- Suivi en temps reel des stocks avec VIN/numero de serie
- KYC renforce (CNIB, photo, empreinte digitale)
- Rapportage trimestriel automatique (XML + PDF signe)
- Detection de fraudes et signalement CNTI
- Vue nationale en temps reel pour les autorites
- Conformite reglementaire avec scoring sur 150 points

---

## Applications

### Espace Entreprises

Application pour les operateurs du secteur des deux-roues.

| Page | Module | Description |
|------|--------|-------------|
| Tableau de Bord | — | Vue d'ensemble, KPIs, conformite, alertes |
| Stocks et Inventaire | **B** | VIN, QR code, modeles interdits, reconciliation |
| Clientele | **C** | KYC, traçabilite acheteur-engin, historique |
| Gestion Commerciale | **D** | Prix, marges, facturation OHADA, export comptable |
| Rapportage Trimestriel | **E** | Generation XML/PDF, soumission au ministere |
| Conformite et Audit | **F** | Scoring 150 pts, checklist, plan d'action |
| Securite et Alertes | **G** | Blacklist, transactions suspectes, CNTI |
| Parametres | — | Utilisateurs, langues (FR/Moore/Dioula/Fula) |
| Aide | — | FAQ, tutoriels, documentation |

### Espace Autorites

Portail administratif pour les autorites de regulation.

| Page | Description |
|------|-------------|
| Tableau de Bord National | Vue nationale, carte Burkina Faso, KPIs |
| **Acteurs Economiques** | Registre national des 30+ acteurs du secteur |
| Analytiques | Detection ML d'anomalies, heatmap transactions |
| Rapports Nationaux | Statistiques annuelles, 6 graphiques, impact economique |
| Agrements | Workflow approbation/suspension/revocation |
| Inspections | Checklist 50 points, scoring temps reel |
| Rapports Trim. Reçus | Inbox ministeriel, validation, rejet |
| Fraude | Alertes, investigations Kanban, saisies |
| Interdictions | Blacklist modeles, zones, personnes |
| Publications | Arrete 05/06/2026, consultations publiques |
| Administration | Utilisateurs, regles, fiscalite, logs |

---

## Architecture Technique

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │  Entreprises │         │  Autorites   │                     │
│  │  React 19    │         │  React 19    │                     │
│  │  Tailwind    │         │  Tailwind    │                     │
│  │  Recharts    │         │  Recharts    │                     │
│  └──────┬───────┘         └──────┬───────┘                     │
│         │                         │                              │
│         └──────────┬──────────────┘                              │
│                    │ HTTPS / REST                                │
└────────────────────┼─────────────────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │    NestJS API Gateway  │
         │    JWT + OAuth2 + MFA  │
         │    RBAC (8 roles)      │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐  ┌──────▼──────┐  ┌─────▼─────┐
│PostgreSQL│  │    Redis    │  │  RabbitMQ  │
│ 45 tbl  │  │ Cache/Sess  │  │   Queue    │
└─────────┘  └─────────────┘  └────────────┘
    │
┌───▼─────────────┐
│     MinIO        │
│  S3-compatible   │
│ Docs, Photos     │
└──────────────────┘
```

---

## Stack Technique

### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 19 | Framework UI |
| TypeScript | 5.x | Typage statique |
| Vite | 7.x | Build tool |
| Tailwind CSS | 3.4 | Styling |
| shadcn/ui | latest | Composants UI |
| Recharts | 2.x | Graphiques |
| @tanstack/react-table | 8.x | Tableaux |
| Framer Motion | 11.x | Animations |
| React Router | 7.x | Routing |
| date-fns | 3.x | Manipulation dates |

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| NestJS | 10 | Framework API |
| TypeScript | 5.x | Typage |
| TypeORM | 0.3.x | ORM PostgreSQL |
| PostgreSQL | 15 | Base de donnees |
| Redis | 7 | Cache / Sessions |
| RabbitMQ | 3.12 | Message queue |
| MinIO | latest | Stockage S3 |
| Passport.js | latest | Authentification |
| JWT | 9.x | Tokens |
| speakeasy | latest | MFA TOTP |

### DevOps

| Technologie | Usage |
|-------------|-------|
| Docker | Conteneurisation |
| Kubernetes | Orchestration |
| GitHub Actions | CI/CD |
| Prometheus | Monitoring |
| Grafana | Dashboards |
| Nginx | Reverse proxy |

---

## Installation Rapide

### Prerequis

- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Cloner le projet

```bash
git clone https://github.com/your-org/ireg-moto-bf.git
cd ireg-moto-bf
```

### 2. Lancer avec Docker Compose

```bash
# Copier les variables d'environnement
cp backend/.env.example backend/.env

# Lancer toute la stack
docker-compose up -d
```

Services demarres :
- Frontend Entreprises : http://localhost:3001
- Frontend Autorites : http://localhost:3002
- Backend API : http://localhost:3000
- PostgreSQL : localhost:5432
- Redis : localhost:6379
- RabbitMQ Management : http://localhost:15672
- MinIO Console : http://localhost:9001

### 3. Initialiser la base de donnees

```bash
cd backend
npm run migration:run
npm run seed
```

### 4. Development mode

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run start:dev

# Terminal 2 — Frontend Entreprises
cd apps/entreprises
npm install
npm run dev

# Terminal 3 — Frontend Autorites
cd apps/autorites
npm install
npm run dev
```

---

## Comptes de Test

| Email | Role | Entreprise | Mot de passe | MFA |
|-------|------|------------|--------------|-----|
| superadmin@iregmoto.gov.bf | Super Admin | — | Test@2026!Admin | TOTP |
| inspector@iregmoto.gov.bf | Inspecteur | — | Test@2026!Insp | SMS |
| analyst@iregmoto.gov.bf | Analyste | — | Test@2026!Ana | Non |
| admin@fasomoto.bf | Admin Entreprise | Faso Moto SARL | Test@2026!Ent | TOTP |
| manager@fasomoto.bf | Manager | Faso Moto SARL | Test@2026!Man | Non |
| seller@fasomoto.bf | Vendeur | Faso Moto SARL | Test@2026!Sell | Non |
| compta@fasomoto.bf | Comptable | Faso Moto SARL | Test@2026!Compta | Non |
| admin@burkinawheels.bf | Admin Entreprise | Burkina Wheels SA | Test@2026!Velo | Non |
| auditor@externe.bf | Auditeur | — | Test@2026!Audit | Non |

> **Donnees de test :** 3 entreprises, 150+ engins, 50+ clients, 30+ transactions, 10 modeles interdits

---

## Structure du Projet

```
ireg-moto-bf/
├── apps/
│   ├── entreprises/          # React 19 — Portail Entreprises
│   │   ├── src/
│   │   │   ├── pages/        # 10 pages (Dashboard, Stocks, ...)
│   │   │   ├── components/   # Sidebar, Topbar, Layout, ...
│   │   │   └── ...
│   │   ├── package.json
│   │   └── tailwind.config.js
│   └──
│       ├── src/
│       │   ├── pages/        # 10 pages (Dashboard, Acteurs, ...)
│       │   ├── components/   # Sidebar, Topbar, BurkinaMap, ...
│       │   └── ...
│       ├── package.json
│       └── tailwind.config.js
├── backend/                  # NestJS 10 API
│   ├── src/
│   │   ├── modules/          # 18 modules (Auth, Stocks, Sales, ...)
│   │   ├── common/           # Guards, Interceptors, Pipes
│   │   ├── config/           # Configuration
│   │   └── seeds/            # Donnees de test
│   └── package.json
├── compliance-engine/        # Moteur de conformite
│   ├── regulatory-rules-engine.ts
│   ├── fraud-detection.ts
│   ├── audit-trail.ts
│   └── test/
├── architecture/
│   ├── SPEC.md               # Specification technique
│   ├── database-schema.sql   # 45 tables PostgreSQL
│   ├── ADR.md                # 12 decisions architecturales
│   └── api-contract-openapi.yaml
├── infrastructure/
│   ├── docker-compose.yml
│   ├── kubernetes/           # 31 manifests K8s
│   ├── monitoring/           # Prometheus + Grafana
│   └── scripts/              # Scripts utilitaires
├── documentation/            # Guides utilisateurs
├── qa/                       # Cas de test (350+)
├── seeds/                    # Seeders complets
├── README.md
├── LICENSE
└── .gitignore
```

---

## Modules Fonctionnels

### Module A — Acteurs Economiques (Autorites)

Enregistrement digital des importateurs, distributeurs, assembleurs et detailants avec classification par type d'activite, dossier numerique complet (RCCM, IFU, agrement, licences), geolocalisation des entrepots, alertes de renouvellement.

### Module B — Stocks et Inventaire

Suivi en temps reel des engins en stock avec VIN/numero de serie obligatoire, categorisation technique (cylindree, marque, modele, pays d'origine), flagging automatique des categories interdites, gestion des mouvements (entrees, sorties, transferts), inventaire physique avec QR code/RFID et reconciliation automatique.

### Module C — Clientele et Tracabilite

Registre clients exhaustif avec identite complete (CNIB/Passeport), photo de l'acheteur (KYC renforce), usage declare, liaison acheteur-engin irrevocable, historique de propriete, alertes automatiques pour zones a risque.

### Module D — Gestion Commerciale et Pricing

Enregistrement obligatoire des prix d'achat et de vente, historique des variations avec justification, controle des marges avec detection des prix anormaux (>20%), facturation normalisee OHADA/SYSCOHADA.

### Module E — Rapportage Trimestriel (CRITIQUE)

Generation automatique du rapport trimestriel exige par le Ministere du Commerce : tableau des stocks, liste exhaustive des clients, prix detailles, quantites par categorie et zone geographique. Format XML structure + PDF signe electroniquement. Portail ministeriel avec API securisee.

### Module F — Conformite Reglementaire

Moteur de regles integrant l'integralite du texte reglementaire (arrete 05/06/2026), checklist dynamique par type d'acteur, compte a rebours du delai de conformite (3 mois a 1 an) avec escalade automatique, simulation d'inspection avec scoring.

### Module G — Lutte contre l'Insecurite

Blacklist des modeles interdits, detection des transactions suspectes (achat multiple, zones frontalieres, paiement cash eleve), signalement automatique au CNTI, gestion des saisies avec chaine de custody.

### Module H — Portail Administratif

Vue nationale en temps reel avec stocks, ventes et flux par region, analyse predictive de detection des tendances anormales, gestion des agrements (delivrance, suspension, revocation), outils d'inspection mobile (mode offline).

---

## Conformite Reglementaire

| Exigence Arrete 05/06/2026 | Implementation |
|---------------------------|----------------|
| Enregistrement acteurs (RCCM, IFU, agrement) | Module A |
| VIN/numero de serie obligatoire | Module B |
| Registre clients trimestriel | Module C |
| Prix achat/vente declares | Module D |
| **Rapport trimestriel XML + PDF signe** | **Module E** |
| Checklist 150 points | Module F |
| Detection fraudes / CNTI | Module G |
| Vue nationale temps reel | Module H |
| Delais 3 mois — 1 an | Compte a rebours |
| Audit trail immuable | Chainage SHA-256 |

---

## Documentation

| Document | Description |
|----------|-------------|
| [GUIDE_UTILISATEUR_ENTREPRISE.md](documentation/GUIDE_UTILISATEUR_ENTREPRISE.md) | Guide complet pour les entreprises |
| [GUIDE_UTILISATEUR_AUTORITE.md](documentation/GUIDE_UTILISATEUR_AUTORITE.md) | Guide pour les autorites |
| [API_DOCUMENTATION.md](documentation/API_DOCUMENTATION.md) | Documentation API REST |
| [DEPLOIEMENT.md](documentation/DEPLOIEMENT.md) | Guide deploiement production |
| [architecture/SPEC.md](architecture/SPEC.md) | Specification technique |
| [architecture/database-schema.sql](architecture/database-schema.sql) | Schema PostgreSQL (45 tables) |
| [architecture/ADR.md](architecture/ADR.md) | 12 decisions architecturales |

---

## Equipe de Developpement

Produit par une equipe de **10 agents specialises** :

| # | Role | Responsabilite |
|---|------|---------------|
| 1 | Orchestrateur | Coordination globale, validation merges |
| 2 | Auditeur UI/UX | Audit frontend, accessibilite, responsive |
| 3 | Auditeur Backend | Audit API, securite, performance |
| 4 | Dev Frontend Entreprises | Interface Entreprises (9 pages) |
| 5 | Dev Frontend Autorites | Interface Autorites (10 pages) |
| 6 | Dev Backend Core | API NestJS, 18 modules, 50+ endpoints |
| 7 | Expert Auth/Securite | JWT, MFA, RBAC, audit trail |
| 8 | Integrateur DB | Migrations, seeders, fixtures |
| 9 | DevOps | Docker, K8s, CI/CD, monitoring |
| 10 | Documentaliste | Guides utilisateurs, tests E2E |

---

## Licence

[MIT](LICENSE) — Republique du Burkina Faso, Ministere du Commerce 2026.
