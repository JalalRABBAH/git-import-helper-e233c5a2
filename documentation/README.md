# iReg Moto BF — Plateforme Réglementaire pour les Deux-Roues Motorisés au Burkina Faso

> **Version:** 1.0.0 | **Statut:** Production | **Arrêté ministériel:** 05/06/2026
> **Direction de la Réglementation et du Contrôle des Transports Terrestres (DRCTT)**
> **République du Burkina Faso**

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique complète](#2-stack-technique-complète)
3. [Architecture](#3-architecture)
4. [Modules fonctionnels (A-H)](#4-modules-fonctionnels-a-h)
5. [Guide de démarrage rapide](#5-guide-de-démarrage-rapide)
6. [Structure des répertoires](#6-structure-des-répertoires)
7. [Contribution et développement](#7-contribution-et-développement)
8. [Ressources](#8-ressources)

---

## 1. Vue d'ensemble

### 1.1 Contexte réglementaire

Le Burkina Faso impose, par l'**arrêté ministériel 05/06/2026**, de nouvelles conditions strictes aux acteurs de la chaîne de valeur des deux-roues motorisés. Cette réglementation touche :

- **Les importateurs** — Obligation de déclaration systématique des véhicules importés, conformité aux normes UEMOA, rapports trimestriels détaillés
- **Les distributeurs** — Traçabilité des stocks, marges encadrées, facturation OHADA
- **Les unités d'assemblage** — Plans de contenu local, conformité technique, reporting de production
- **Les détaillants** — Connaissance client (KYC), liaison engin-client, facturation normalisée
- **Les autorités** — Contrôle, inspection, agrément, sanctions administratives

### 1.2 Mission de la plateforme

**iReg Moto BF** constitue le canal numérique unique de conformité réglementaire pour le secteur des deux-roues au Burkina Faso. Elle interconnecte :

- Les **acteurs économiques** (importateurs, distributeurs, unités d'assemblage, détaillants)
- Les **contrôleurs du ministère** (DRCTT)
- Les **forces de sécurité** (CNTI, Police nationale)
- Les **partenaires institutionnels** (DGI, UEMOA — interopérabilité future)

### 1.3 Objectifs qualité (ISO 25010)

| Caracteristique | Cible | Strategie |
|----------------|-------|-----------|
| Disponibilite | 99.9% (SLA) | Clustering K8s, replication PostgreSQL, Redis Sentinel |
| Performance | p95 < 200ms (API) | Cache multi-niveaux, indexation, CQRS read-model |
| Securite | Niveau eIDAS « substantiel » | JWT+OAuth2+MFA, chiffrement AES-256, audit trail immuable |
| Maintenabilite | MTTR < 4h | Modularite stricte, tests > 80%, documentation vivante |
| Scalabilite | 10 000 utilisateurs simultanes | Horizontal pod autoscaling, partitionnement, read replicas |
| Compatibilite | Chrome 90+, Android 8+, iOS 14+ | PWA, API REST/GraphQL, i18n 4 langues |
| Resilience offline | 72h de continuite metier | PWA offline-first, sync differée, IndexedDB |

### 1.4 Benefices pour les acteurs

**Pour les commercants :**
- Centralisation de toute la conformite reglementaire en un seul outil
- Generation automatique des rapports trimestriels (XML/PDF)
- Suivi en temps reel du score de conformite
- Protection contre les sanctions administratives (fermeture 3 mois a 1 an)

**Pour le ministere :**
- Vision nationale en temps reel de l'ensemble du secteur
- Detection automatique des fraudes et anomalies
- Processus d'agrement digitalise
- Audit trail juridiquement irréfutable

**Pour les clients finaux :**
- Traçabilite complete de leur vehicule
- Garantie d'achat en conformite
- Protection contre les contrefaçons

---

## 2. Stack technique complète

### 2.1 Tableau recapitulatif

| Couche | Technologie | Version | Justification |
|--------|------------|---------|---------------|
| **Frontend** | React + TypeScript | 18.x | Ecosystem mature, PWA natif |
| | Tailwind CSS | 3.x | Styling utility-first, bundle leger |
| | Shadcn/ui | latest | Composants accessibles, personnalisables |
| | Workbox | 7.x | Service Worker, cache strategies |
| **Backend** | NestJS (Node.js) | 10.x | Pattern decorateurs, DI natif, modularite |
| | GraphQL (Apollo) | 4.x | Typage fort, queries flexibles |
| | TypeORM | 0.3.x | Migrations, relations, PostgreSQL driver |
| **Base de donnees** | PostgreSQL | 15.x | JSONB, partitionnement, Row Level Security |
| | Redis | 7.x | Cache, sessions, rate limiting, Pub/Sub |
| **Message Broker** | RabbitMQ | 3.12+ | Routing flexible, dead-letter, federation |
| **Stockage objet** | MinIO | latest | S3-compatible, on-premise possible |
| **Containeurisation** | Docker + Kubernetes | 1.28+ | Cloud-agnostic, scaling horizontal |
| **Reverse Proxy** | Traefik | 3.x | Ingress natif K8s, Let's Encrypt auto |
| **Monitoring** | Prometheus + Grafana | latest | Metriques temps reel, alerting |
| **Logs** | Loki + Grafana | latest | Centralisation logs, correlation |
| **Tracing** | Jaeger | latest | Distributed tracing OpenTelemetry |

### 2.2 Architecture hybride REST + GraphQL

L'API adopte une architecture hybride deliberée :

- **REST** (`/api/v1/*`) — Pour toutes les mutations metier (POST/PUT/DELETE), compatibles avec le mode offline-first de la PWA
- **GraphQL** (`/graphql`) — Pour les requetes analytiques complexes du portail administratif

Cette dualite permet de servir efficacement deux usages distincts : les operations metier quotidiennes (rapides, simples, robustes en offline) et l'analyse decisionnelle (flexible, relationnelle, aggregations).

---

## 3. Architecture

### 3.1 Architecture C4 — Niveau 1 (Contexte Systeme)

```
+-----------------------------------------------------------------------------+
|                              iReg Moto BF                                    |
|                     Plateforme Reglementaire 2R-Moto BF                      |
|                                                                              |
|  +--------------+  +--------------+  +--------------+  +--------------+   |
|  |Importateurs/ |  |  Unites d'   |  |  Detailants  |  | Controleurs  |   |
|  |Distributeurs |  |  assemblage  |  |              |  |   DRCTT      |   |
|  +------+-------+  +------+-------+  +------+-------+  +------+-------+   |
|         |                 |                 |                 |            |
|    [Web PWA]          [Web PWA]        [Web/Mobile PWA]   [App Mobile]    |
|         |                 |                 |                 |            |
|         +-----------------+-----------------+                 |            |
|                           |                                   |            |
|                           v                                   v            |
|              +------------------------+    +---------------------+         |
|              |   iReg Moto BF SaaS    |    |  Portail Admin Web  |         |
|              |   (React + NestJS)     |    |  (Analytics, BI)    |         |
|              +-----------+------------+    +---------------------+         |
|                          |                                                  |
+--------------------------+--------------------------------------------------+
                           |
              +------------+------------+------------+------------+
              v            v            v            v            v
       +----------+ +----------+ +----------+ +----------+ +----------+
       |PostgreSQL| |  Redis   | | RabbitMQ | |  MinIO   | |   SMTP   |
       |   15+    | |   7+     | |  3.12+   | |  (S3)    | |/SMS API  |
       +----------+ +----------+ +----------+ +----------+ +----------+

Systemes externes (futur) :
+----------+  +----------+  +----------+  +----------+  +----------+
|   DGI    |  |  Police  |  |   UEMOA  |  |  Token   |  |   CNSS   |
|   API    |  | Nationale|  |   API    |  | Service  |  |   API    |
+----------+  +----------+  +----------+  +----------+  +----------+
```

### 3.2 Architecture C4 — Niveau 2 (Conteneurs)

```
+------------------------------------------------------------------------------+
|                         iReg Moto BF — Conteneurs                             |
+------------------------------------------------------------------------------+
|                                                                              |
|  +---------------------------------------------------------------------+    |
|  |                        API GATEWAY (Traefik)                         |    |
|  |   - Rate limiting (Redis)                                            |    |
|  |   - SSL termination (Let's Encrypt)                                  |    |
|  |   - Routing /api/* -> NestJS | /graphql -> Apollo                      |    |
|  |   - WAF basique, IP filtering                                        |    |
|  +-------------+----------------------------------+--------------------+    |
|                |                                  |                         |
|  +-------------v--------------+    +--------------v-------------+          |
|  |     NESTJS API (Core)      |    |    NESTJS WORKERS          |          |
|  |    +----------------+      |    |  +----------------------+  |          |
|  |    | Module Auth    |      |    |  | Worker Reporting     |  |          |
|  |    | (JWT/OAuth2)   |      |    |  | (generation PDF/XML) |  |          |
|  |    +----------------+      |    |  +----------------------+  |          |
|  |    | Module Acteurs |      |    |  | Worker Notifications |  |          |
|  |    | (MODULE A)     |      |    |  | (email, SMS, push)   |  |          |
|  |    +----------------+      |    |  +----------------------+  |          |
|  |    | Module Stocks  |      |    |  | Worker Analytics     |  |          |
|  |    | (MODULE B)     |      |    |  | (aggregations, KPI)  |  |          |
|  |    +----------------+      |    |  +----------------------+  |          |
|  |    | Module Clients |      |    |  | Worker Compliance    |  |          |
|  |    | (MODULE C)     |      |    |  | (calcul score auto)  |  |          |
|  |    +----------------+      |    |  +----------------------+  |          |
|  |    | Module Ventes  |      |    |  | Worker Security      |  |          |
|  |    | (MODULE D)     |      |    |  | (detection fraude)   |  |          |
|  |    +----------------+      |    |  +----------------------+  |          |
|  |    | Module Rapports|      |    +---------------------------+          |
|  |    | (MODULE E)     |      |                                          |
|  |    +----------------+      |                                          |
|  |    | Module Conform.|      |                                          |
|  |    | (MODULE F)     |      |                                          |
|  |    +----------------+      |                                          |
|  |    | Module Securite|      |                                          |
|  |    | (MODULE G)     |      |                                          |
|  |    +----------------+      |                                          |
|  |    | Module Admin   |      |                                          |
|  |    | (MODULE H)     |      |                                          |
|  |    +----------------+      |                                          |
|  |         TypeORM              |                                          |
|  |    +----------------+      |                                          |
|  |    | Event Store    |<-----+------------------------------------------|
|  |    | (PostgreSQL)   |      |                                          |
|  |    +----------------+      |                                          |
|  +--------------+-------------+                                          |
|                 |                                                          |
|  +--------------v-------------+    +--------------+    +--------------+  |
|  |   REACT PWA (Frontend)    |    |   PostgreSQL  |    |    Redis     |  |
|  |  +--------------------+   |    |   (Primary +  |    |   (Cluster)  |  |
|  |  | Workbox SW         |   |    |    2 Replicas)|    |              |  |
|  |  | IndexedDB (local)  |   |    |   Partitionne |    |  - Sessions  |  |
|  |  | Background Sync    |   |    |   - 40+ tables|    |  - Cache     |  |
|  |  | i18n (fr/mos/dyula)|   |    |   - RLS       |    |  - Rate Limit|  |
|  |  +--------------------+   |    +--------------+    +--------------+  |
|  +---------------------------+                                            |
|                                                                              |
|  +---------------------------+    +--------------+    +--------------+     |
|  |   MinIO (Object Store)   |    |  RabbitMQ    |    |  Prometheus  |     |
|  |   - Documents KYC        |    |  - Exchanges |    |  + Grafana   |     |
|  |   - Photos engins        |    |  - Queues    |    |  + Loki      |     |
|  |   - Rapports PDF/XML     |    |  - DLX       |    |  + Jaeger    |     |
|  |   - Pieces d'identite    |    |  - Federation|    |              |     |
|  +---------------------------+    +--------------+    +--------------+     |
|                                                                              |
+------------------------------------------------------------------------------+
```

### 3.3 Patterns architecturaux

Le systeme implemente quatre patterns fondamentaux :

1. **API Gateway Pattern** — Traefik gere le routage, le rate limiting, la terminaison SSL et le filtrage IP
2. **CQRS (Command Query Responsibility Segregation)** — Separation des ecritures et lectures pour les modules de reporting (E) et analytics (H)
3. **Event Sourcing hybride** — Trail d'audit immuable avec chainage cryptographique SHA256
4. **Saga Pattern** — Orchestration des processus metier complexes (ex: vente d'un vehicule en 5 etapes avec compensation en cas d'echec)

### 3.4 Architecture modulaire (Modular Monolith)

Le backend adopte une architecture **modulaire monolithique** avec separation physique des bounded contexts. Cette decision (ADR-002) privilegie le time-to-market (3-4 mois MVP) tout en preservant la capacite d'extraire progressivement vers des microservices sur 18-24 mois.

**Feuille de route d'evolution :**
- **Phase 1 (0-6 mois)** : Modular Monolith complet — MVP, 100-500 utilisateurs
- **Phase 2 (6-12 mois)** : Extraction Module G (Securite) si volume critique (> 1000 alertes/jour)
- **Phase 3 (12-18 mois)** : Extraction Module E (Reporting) si charge CPU severe
- **Phase 4 (18-24 mois)** : Extraction Module H (Admin) si equipe ministere dediee

---

## 4. Modules fonctionnels (A-H)

### Module A — Gestion des acteurs economiques

**Responsabilite :** Enregistrement et gestion de tous les acteurs de la chaine de valeur.

**Fonctionnalites cles :**
- Creation de fiche acteur avec NIF, RCCM, representant legal
- Upload de documents KYC (registre de commerce, NIF, assurance, certificat d'origine)
- Geolocalisation des entrepots et points de vente (GPS)
- Workflow d'agrement ministériel (BROUILON → SOUMIS → EN_REVISION → APPROUVE)
- Suivi des agréments avec dates d'expiration et alertes

**Acteurs concernes :** Tous

### Module B — Stocks et inventaire

**Responsabilite :** Traçabilite complete des vehicules de l'importation a la vente.

**Fonctionnalites cles :**
- Enregistrement des vehicules par VIN (17 caracteres alphanumeriques)
- Classification par categorie reglementaire (cyclomoteur 50cc, moto legere 125cc, moto lourde, tricycle, electrique)
- Verification automatique de la liste noire (vol, fraude, contrefacon)
- Gestion des mouvements de stock (import, assemblage, transfert, vente, retour, ajustement)
- Inventaires physiques avec reconciliation automatique
- Generation de QR codes par vehicule

**Acteurs concernes :** Importateurs, distributeurs, unites d'assemblage, detaillants

### Module C — Clients et traçabilite

**Responsabilite :** Connaissance client (KYC) et liaison engin-acheteur.

**Fonctionnalites cles :**
- Enregistrement client avec piece d'identite (CNI, passeport, permis)
- Verification KYC avec upload de documents (CNI recto/verso, selfie, justificatif de domicile)
- Biometrie (enregistrement facial pour verification)
- Historique de propriete de chaque vehicule
- Liaison automatique engin-client lors de la vente

**Acteurs concernes :** Tous les acteurs commerciaux

### Module D — Gestion commerciale et facturation

**Responsabilite :** Ventes, pricing, marges et facturation conforme OHADA.

**Fonctionnalites cles :**
- Enregistrement des ventes avec verification automatique (blacklist, conformite, stock)
- Facturation au format OHADA avec taxes automatiques
- Gestion des prix d'achat avec conversion devise (EUR/USD → XOF)
- Calcul des marges par categorie, fabricant et periode
- Detection automatique des anomalies de prix
- Support des paiements (especes, virement, mobile money, cheque, credit)

**Acteurs concernes :** Tous les acteurs commerciaux

### Module E — Rapportage trimestriel

**Responsabilite :** Generation et soumission des rapports reglementaires obligatoires.

**Fonctionnalites cles :**
- Generation asynchrone des rapports trimestriels (PDF + XML schema UEMOA)
- Agregation automatique des ventes, achats, stocks et conformite
- Signature electronique avec certificat DRCTT
- Portail de soumission au ministere avec suivi du statut
- Gestion des echeances avec compte a rebours
- Historique des rapports soumis avec numero d'accuse de reception

**Acteurs concernes :** Importateurs, distributeurs, unites d'assemblage

### Module F — Conformite et auto-evaluation

**Responsabilite :** Moteur de conformite reglementaire avec scoring automatique.

**Fonctionnalites cles :**
- Moteur de regles parametrables (8 types : document, vehicule, pricing, stock, KYC, timing, douane, fiscalite)
- Scoring automatique par dimension (documents, vehicules, prix, KYC, reporting, stock)
- Checklist d'auto-evaluation avec items PASS/FAIL/NA
- Compte a rebours avant sanction administrative
- Plan d'action correctif avec priorisation
- Calcul de conformite en temps reel sur chaque transaction

**Acteurs concernes :** Tous

### Module G — Securite et detection de fraude

**Responsabilite :** Lutte contre l'insecurite, detection des fraudes et signalement.

**Fonctionnalites cles :**
- Detection automatique des transactions suspectes (prix anormal, volume, circuit ferme)
- Liste noire des vehicules, clients et acteurs signales
- Alertes de securite avec niveaux de severite (LOW, MEDIUM, HIGH, CRITICAL)
- Verification VIN rapide pour les controleurs terrain
- Signalement CNTI/Police nationale
- Investigation et resolution des alertes

**Acteurs concernes :** Controleurs DRCTT, agents CNTI/Police

### Module H — Portail administratif

**Responsabilite :** Vue nationale, analytics et configuration pour le ministere.

**Fonctionnalites cles :**
- Tableau de bord national avec KPIs (acteurs, conformite, ventes, alertes)
- Vue par region avec cartographie interactive
- Gestion des agrements (approbation, suspension, revocation)
- Revision des rapports trimestriels soumis (approbation, rejet, demande de modification)
- Planning des inspections terrain
- Agrégations nationales par dimension (ventes par region, conformite par type d'acteur, evolution des stocks)
- Gestion des webhooks et integrations externes

**Acteurs concernes :** Administrateurs DRCTT, controleurs

---

## 5. Guide de demarrage rapide

### 5.1 Prerequis

- **Docker** 24.0+ et Docker Compose v2+
- **Node.js** 18.x+ (pour le developpement local)
- **npm** 9.x+ ou **yarn** 1.22+
- **kubectl** 1.28+ (pour le deploiement Kubernetes)
- **Git**

### 5.2 Démarrage en mode developpement (Docker Compose)

```bash
# 1. Cloner le repository
git clone https://github.com/drctt/ireg-moto-bf.git
cd ireg-moto-bf

# 2. Copier les variables d'environnement
cp .env.example .env
# Editer .env avec vos configurations locales

# 3. Lancer l'infrastructure (bases de donnees, cache, message broker)
docker-compose -f docker-compose.dev.yml up -d

# 4. Installer les dependances du backend
cd backend
npm install

# 5. Executer les migrations de base de donnees
npx typeorm migration:run

# 6. Charger les donnees de reference (regles de conformite, categories de vehicules)
npm run seed

# 7. Lancer le backend en mode watch
npm run start:dev

# 8. Dans un autre terminal, lancer le frontend
cd ../frontend
npm install
npm run dev
```

L'application est accessible a :
- **Frontend PWA** : http://localhost:5173
- **API Backend** : http://localhost:3000/api/v1
- **Documentation Swagger** : http://localhost:3000/api/docs
- **GraphQL Playground** : http://localhost:3000/graphql

### 5.3 Démarrage en production (Docker Compose)

```bash
# 1. Configurer les variables d'environnement de production
cp .env.production.example .env
# Editer .env avec les secrets de production (JWT, DB, S3, etc.)

# 2. Construire et lancer
docker-compose -f docker-compose.yml up -d --build

# 3. Executer les migrations
docker-compose exec backend npx typeorm migration:run

# 4. Verifier la sante des services
docker-compose ps
curl http://localhost:3000/health
```

### 5.4 Démarrage en production (Kubernetes)

Voir le [deployment-guide.md](./deployment-guide.md) pour les details complets.

```bash
# 1. Configurer le namespace et les secrets
kubectl apply -f infrastructure/kubernetes/namespace.yaml
kubectl apply -f infrastructure/kubernetes/secret.yaml

# 2. Deployer la base de donnees et les services d'infrastructure
kubectl apply -f infrastructure/kubernetes/postgres-deployment.yaml
kubectl apply -f infrastructure/kubernetes/redis-deployment.yaml
kubectl apply -f infrastructure/kubernetes/rabbitmq-deployment.yaml
kubectl apply -f infrastructure/kubernetes/minio-deployment.yaml

# 3. Deployer l'application
kubectl apply -f infrastructure/kubernetes/backend-deployment.yaml
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml

# 4. Configurer l'ingress
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

---

## 6. Structure des répertoires

```
ireg-moto-bf/
├── README.md                          # Ce fichier
├── docker-compose.yml                 # Orchestration production
├── docker-compose.dev.yml             # Orchestration developpement
├── .env.example                       # Variables d'environnement exemple
├── .github/
│   └── workflows/
│       ├── ci.yml                     # CI — Tests et build
│       ├── cd-staging.yml             # CD — Deploiement staging
│       └── cd-production.yml          # CD — Deploiement production
│
├── architecture/
│   ├── SPEC.md                        # Specification technique globale
│   ├── ADR.md                         # Architecture Decision Records (12 ADRs)
│   └── api-contract-openapi.yaml      # Contrat API OpenAPI 3.0
│
├── backend/                           # Application NestJS
│   ├── src/
│   │   ├── main.ts                    # Point d'entree
│   │   ├── app.module.ts              # Module racine
│   │   ├── config/                    # Configuration centralisee
│   │   │   ├── app.config.ts
│   │   │   ├── auth.config.ts
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── minio.config.ts
│   │   │   └── rabbitmq.config.ts
│   │   ├── shared/                    # Kernel partage
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── filters/
│   │   │   ├── pipes/
│   │   │   └── services/
│   │   └── modules/                   # Modules fonctionnels A-H
│   │       ├── auth/
│   │       ├── actors/                # MODULE A
│   │       ├── stocks/                # MODULE B
│   │       ├── clients/               # MODULE C
│   │       ├── sales/                 # MODULE D
│   │       ├── reporting/             # MODULE E
│   │       ├── compliance/            # MODULE F
│   │       ├── security/              # MODULE G
│   │       └── admin/                 # MODULE H
│   ├── test/                          # Tests E2E
│   ├── Dockerfile
│   └── package.json
│
├── compliance-engine/                 # Moteur de conformite
│   ├── regulatory-rules-engine.ts
│   ├── compliance-scoring.ts
│   ├── compliance-checklist.ts
│   ├── compliance-countdown.ts
│   ├── fraud-detection.ts
│   ├── blacklist-manager.ts
│   ├── audit-trail.ts
│   ├── ohada-tax-engine.ts
│   └── report-generator.ts
│
├── frontend/                          # Application React PWA
│   ├── src/
│   │   ├── pages/                     # Pages publiques (landing)
│   │   ├── app/                       # Interface SaaS (dashboard)
│   │   ├── components/                # Composants partages
│   │   ├── hooks/                     # Hooks React personnalises
│   │   ├── stores/                    # Zustand state management
│   │   ├── services/                  # API clients
│   │   ├── lib/                       # Utilitaires
│   │   ├── i18n/                      # Traductions (fr, mos, dyu, ff)
│   │   └── workers/                   # Service Workers (Workbox)
│   ├── public/
│   ├── index.html
│   ├── Dockerfile
│   └── package.json
│
├── infrastructure/                    # Infrastructure as Code
│   ├── kubernetes/                    # Manifests K8s
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── postgres-deployment.yaml
│   │   ├── redis-deployment.yaml
│   │   ├── rabbitmq-deployment.yaml
│   │   ├── minio-deployment.yaml
│   │   ├── ingress.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   └── ...
│   ├── monitoring/                    # Prometheus, Grafana, Loki
│   └── docker/                        # Dockerfiles supplementaires
│
├── documentation/                     # Documentation du projet
│   ├── README.md                      # Ce fichier
│   ├── api-documentation.md           # Documentation API detaillee
│   ├── user-guide-fr.md              # Manuel utilisateur (français)
│   ├── compliance-guide-fr.md        # Guide de conformite reglementaire
│   ├── installation-guide.md         # Guide d'installation
│   ├── deployment-guide.md           # Guide de deploiement
│   ├── security-guide.md             # Guide de securite
│   └── mobile-inspection-guide.md    # Guide d'inspection terrain
│
└── design/                            # Design system
    ├── design.md                      # Document de design global
    ├── home.md                        # Landing page
    ├── dashboard.md                   # Tableau de bord
    └── app-*.md                       # Modules de l'application
```

---

## 7. Contribution et développement

### 7.1 Standards de code

- **TypeScript strict** — Aucune valeur `any`, typage exhaustif
- **Linting** — ESLint avec configuration Airbnb + Prettier
- **Tests** — Couverture minimale 80% (Jest, Supertest pour les tests E2E)
- **Commits** — Convention Angular (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)
- **Branches** — `main` (production), `staging`, `feature/*`, `fix/*`

### 7.2 Workflow de contribution

```bash
# 1. Creer une branche feature
git checkout -b feature/module-x-nouvelle-fonction

# 2. Developper avec tests
npm run test:watch

# 3. Verifier le linting et le typage
npm run lint
npm run typecheck

# 4. Soumettre une Pull Request
git push origin feature/module-x-nouvelle-fonction
# Creer la PR sur GitHub avec description detaillee
```

### 7.3 Tests

```bash
# Tests unitaires
npm run test

# Tests avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e

# Tests specifiques a un module
npm run test -- --testPathPattern=compliance
```

### 7.4 Documentation vivante

La documentation est generee automatiquement :
- **Swagger/OpenAPI** : http://localhost:3000/api/docs (genere depuis les decorateurs NestJS)
- **ADR** : Toutes les decisions architecturales sont documentees dans `architecture/ADR.md`
- **Changelog** : Genere automatiquement depuis les messages de commit

---

## 8. Ressources

### Documentation associee

| Document | Description | Public cible |
|----------|-------------|--------------|
| [api-documentation.md](./api-documentation.md) | Documentation complete de l'API | Developpeurs, integrateurs |
| [user-guide-fr.md](./user-guide-fr.md) | Manuel utilisateur en français | Commercants, operateurs |
| [compliance-guide-fr.md](./compliance-guide-fr.md) | Guide de conformite reglementaire | Commercants, responsables conformite |
| [installation-guide.md](./installation-guide.md) | Guide d'installation detaille | Administrateurs systeme, DevOps |
| [deployment-guide.md](./deployment-guide.md) | Guide de deploiement production | DevOps, equipe infra |
| [security-guide.md](./security-guide.md) | Guide de securite | RSSI, equipe securite |
| [mobile-inspection-guide.md](./mobile-inspection-guide.md) | Guide d'inspection terrain | Controleurs DRCTT |

### Contacts

- **Support technique** : tech@ireg-moto.bf
- **Support utilisateur** : support@ireg-moto.bf
- **Securite** : security@ireg-moto.bf
- **Direction DRCTT** : drctt@transport.bf

### Licences

© 2026 Direction de la Reglementation et du Contrôle des Transports Terrestres (DRCTT) — Republique du Burkina Faso. Tous droits reserves.

---

> *« La conformite n'est pas une contrainte, c'est un levier de confiance pour tout le secteur des deux-roues au Burkina Faso. »*
