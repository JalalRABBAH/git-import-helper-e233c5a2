# iReg Moto BF — Architecture Decision Records (ADR)

> **Statut :** Approuvé | **Date :** 2025-06-10 | **Version :** 1.0.0
> **Auteur :** Architecte Solution iReg Moto BF
> **Révision :** Comité Technique DRCTT

---

## Table des matières

- [ADR-001 : NestJS vs FastAPI comme framework backend](#adr-001)
- [ADR-002 : Architecture modulaire monolithique vs microservices](#adr-002)
- [ADR-003 : CQRS pour le reporting](#adr-003)
- [ADR-004 : Event Sourcing pour l'audit trail](#adr-004)
- [ADR-005 : RabbitMQ vs Apache Kafka](#adr-005)
- [ADR-006 : Stratégie de partitionnement PostgreSQL](#adr-006)
- [ADR-007 : Offline-first et synchronisation PWA](#adr-007)
- [ADR-008 : MinIO vs AWS S3 pour le stockage objet](#adr-008)
- [ADR-009 : JWT + OAuth2 + MFA pour l'authentification](#adr-009)
- [ADR-010 : Blockchain légère vs logs signés pour l'audit immuable](#adr-010)
- [ADR-011 : TypeORM vs Prisma comme ORM](#adr-011)
- [ADR-012 : GraphQL + REST hybride vs REST uniquement](#adr-012)

---

## ADR-001 : NestJS vs FastAPI comme framework backend {#adr-001}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-01 |
| **Décideurs** | Architecte Solution, Lead Backend, CTO |

### Contexte
Le backend doit supporter 8 modules fonctionnels complexes, avec des exigences de modularité, injection de dépendances, et un écosystème mature pour l'interconnexion avec des services tiers (DGI, Police, UEMOA). Le choix se porte entre NestJS (TypeScript/Node.js) et FastAPI (Python).

### Options considérées

1. **NestJS** (Node.js / TypeScript) — Framework Angular-inspired, pattern décorateurs, DI natif
2. **FastAPI** (Python) — Framework moderne Python, async natif, Pydantic

### Critères d'évaluation

| Critère | Pondération | NestJS | FastAPI |
|---------|------------|--------|---------|
| Écosystème TypeScript frontend (partage DTO) | Élevée | **10** | 4 |
| Maturité ORM relationnel (PostgreSQL) | Élevée | **9** (TypeORM/Prisma) | 7 (SQLAlchemy) |
| Modularité / Bounded Contexts | Élevée | **10** (modules natifs) | 6 (routers) |
| CQRS / Event Sourcing support | Élevée | **9** (@nestjs/cqrs) | 5 (libs tierces) |
| Performance async / throughput | Moyenne | 8 | **9** |
| Courbe d'apprentissage équipe | Moyenne | 7 | **8** |
| Disponibilité développeurs Burkina | Élevée | **8** (JS/TS dominant) | 5 (Python moins répandu) |
| Intégration GraphQL | Moyenne | **10** (@nestjs/graphql) | 6 (strawberry) |
| Support offline-first / PWA | Moyenne | **9** (même écosystème) | 5 |
| Testing (unit, int, e2e) | Élevée | **9** (Jest intégré) | 7 (pytest) |

### Décision
**NestJS** est sélectionné comme framework backend principal.

### Justification
- **Alignement écosystème** : Le partage de types TypeScript entre frontend (React) et backend (NestJS) élimine toute incohérence de contrat API et réduit les bugs de sérialisation.
- **Modularité** : Le système de modules NestJS permet une séparation claire des bounded contexts (A-H) tout en conservant la cohérence transactionnelle ACID d'un monolithe. Chaque module dispose de ses propres controllers, services, entities et peut être extrait en microservice indépendant si nécessaire.
- **CQRS natif** : Le package `@nestjs/cqrs` fournit CommandBus, QueryBus, EventBus et Saga support — éléments architecturaux critiques pour les modules E (reporting) et F (conformité).
- **Marché local** : Les développeurs TypeScript/JavaScript sont plus nombreux en Afrique de l'Ouest francophone, facilitant le recrutement et la maintenance.
- **GraphQL** : L'intégration native Apollo Server permet d'exposer les API REST pour les clients offline-first (PWA) et GraphQL pour le portail administratif (requêtes analytiques complexes).

### Conséquences
- **Positives** : Productivité accrue via le partage de types, architecture DDD facilitée, écosystème mature.
- **Négatives** : Overhead mémoire plus élevé que FastAPI (~150MB vs ~50MB par instance), latence légèrement supérieure sur les opérations I/O-bound (compensée par le cache Redis).
- **Risque** : Couplage fort entre modules si les barrières d'import ne sont pas respectées. Mise en place de lint rules pour empêcher les imports croisés entre modules.

### Métriques de revue
- Temps moyen de développement d'un endpoint CRUD < 30 min
- Couverture de tests > 80%
- Startup time conteneur < 10 secondes

---

## ADR-002 : Architecture modulaire monolithique vs microservices {#adr-002}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-02 |
| **Décideurs** | Architecte Solution, CTO, Lead DevOps |

### Contexte
La plateforme compte 8 modules fonctionnels interconnectés. Il faut choisir entre une architecture microservices (déploiements indépendants, base de données par service) et un modulaire monolithique (codebase unique, modules isolés, base partagée).

### Options considérées

1. **Microservices complets** : 8+ services indépendants, chacun avec sa base de données, communication par message broker
2. **Modular Monolith** : Codebase unique NestJS, modules strictement isolés, base PostgreSQL partagée avec schémas séparés
3. **Hybrid (Modular → Microservices)** : Démarrage monolithique, extraction progressive des modules à forte charge

### Décision
**Option 3 — Hybrid : Modular Monolith pour le MVP, extraction progressive.**

Le démarrage se fait en **Modular Monolith** strict avec une feuille de route d'extraction vers microservices sur 18 mois.

### Justification détaillée

**Contraintes spécifiques au Burkina Faso :**
- **Connectivité** : Les coupures Internet fréquentes (maintenance fibres, instabilité réseau) rendent les appels inter-services HTTP fragiles. Un monolithe minimise les dépendances réseau internes.
- **Bande passante** : Les échanges JSON entre microservices consomment significativement. Un monolithe utilise des appels mémoire (µs) plutôt que réseau (ms).
- **Ressources DevOps** : L'exploitation d'un cluster Kubernetes avec service mesh (Istio/Linkerd) dépasse les compétences disponibles localement. Un monolithe + workers asynchrones réduit la complexité opérationnelle.
- **Cohérence transactionnelle** : Les modules A (Acteurs), B (Stocks), C (Clients), D (Ventes) partagent des données fortement couplées (un acteur a des stocks, des clients, des ventes). Les transactions distribuées Saga complexifient inutilement le MVP.

**Feuille de route d'extraction :**

| Phase | Délais | Extraction | Déclencheur |
|-------|--------|-----------|-------------|
| 1 | 0-6 mois | Aucune — Modular Monolith complet | MVP, 100-500 utilisateurs |
| 2 | 6-12 mois | Module G (Sécurité/Fraude) | > 1000 alertes/jour, scoring complexe |
| 3 | 12-18 mois | Module E (Reporting) | Génération PDF/XML > 30s, charge CPU |
| 4 | 18-24 mois | Module H (Portail Admin) | Besoin d'équipe dédiée ministère |

### Conséquences
- **Positives** : Time-to-market réduit (3-4 mois vs 6+ mois), débogage simplifié, tests E2E rapides, déploiement unique.
- **Négatives** : Risque de couplage fort si les frontières de modules ne sont pas respectées. Solution : lint rules eslint interdisant les imports inter-modules non autorisés.
- **Positives (extraction)** : Chaque module dispose d'une interface publique claire (DTOs, events), facilitant l'extraction future sans réécriture.

### Métriques de revue (tous les 3 mois)
- Temps de build CI/CD < 15 min
- Temps de déploiement < 5 min
- Taux de couplage inter-module (imports croisés) = 0%
- Latence p95 API < 200ms

---

## ADR-003 : CQRS pour le reporting {#adr-003}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-03 |
| **Décideurs** | Architecte Solution, Lead Backend |

### Contexte
Les modules E (Rapportage trimestriel) et H (Portail administratif avec analytics) nécessitent des requêtes complexes d'agrégation sur de grands volumes de données (ventes, stocks, conformité). Ces requêtes peuvent dégrader les performances des opérations transactionnelles (write).

### Options considérées

1. **Single Model** : Une seule base PostgreSQL, requêtes d'agrégation directes sur les tables transactionnelles
2. **CQRS avec Read Models** : Séparation commandes (write) et requêtes (read), modèles de lecture matérialisés dénormalisés
3. **CQRS avec Elasticsearch** : Indexation des données dans Elasticsearch pour les recherches analytiques

### Décision
**Option 2 — CQRS avec Read Models matérialisés dans PostgreSQL.**

### Justification
- **Simplicité opérationnelle** : Pas d'ajout d'une base Elasticsearch (complexité DevOps, ressources serveur). Les Materialized Views PostgreSQL sont natives et performantes.
- **Coût** : Économie d'une infrastructure supplémentaire. Le Burkina Faso a des contraintes budgétaires et d'infrastructure.
- **Cohérence éventuelle acceptable** : Les rapports trimestriels n'ont pas besoin d'une cohérence temps réel stricte. Un délai de 1-5 minutes entre l'événement et la mise à jour du read model est acceptable.
- **Refresh intelligent** : `REFRESH MATERIALIZED VIEW CONCURRENTLY` sur événement RabbitMQ, sans bloquer les lectures.

**Read Models définis :**

```sql
-- Vue trimestrielle pour rapports
CREATE MATERIALIZED VIEW mv_quarterly_report_summary AS
SELECT 
    a.id as actor_id,
    a.name as actor_name,
    date_trunc('quarter', s.sale_date) as quarter,
    COUNT(DISTINCT s.id) as total_sales,
    SUM(s.total_amount) as total_revenue,
    SUM(s.total_taxes) as total_taxes,
    COUNT(DISTINCT v.id) as vehicles_sold,
    cs.score as compliance_score
FROM actors a
LEFT JOIN sales s ON s.actor_id = a.id
LEFT JOIN sale_items si ON si.sale_id = s.id
LEFT JOIN vehicles v ON si.vehicle_id = v.id
LEFT JOIN compliance_scores cs ON cs.actor_id = a.id
GROUP BY a.id, a.name, date_trunc('quarter', s.sale_date), cs.score;

CREATE UNIQUE INDEX idx_mv_qrs_actor_quarter ON mv_quarterly_report_summary(actor_id, quarter);
```

**Architecture CQRS :**
- **Write Side** : NestJS Controllers → Services → TypeORM Repository → PostgreSQL (tables transactionnelles)
- **Event Projection** : Domain Event émis → RabbitMQ → Worker projection → `REFRESH MATERIALIZED VIEW CONCURRENTLY`
- **Read Side** : NestJS Query Handlers → Lecture Materialized View (indexée) → Réponse API

### Conséquences
- **Positives** : Isolation des charges, performances de lecture optimisées, scalabilité indépendante du read side.
- **Négatives** : Cohérence éventuelle (1-5 min), complexité supplémentaire des projections, espace disque des vues matérialisées (~30% supplémentaire).
- **Mitigation** : Les mutations critiques (vente, conformité) émettent un event immédiatement, le worker de projection traite en quelques secondes.

---

## ADR-004 : Event Sourcing pour l'audit trail {#adr-004}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-03 |
| **Décideurs** | Architecte Solution, RSSI, Lead Backend |

### Contexte
L'arrêté ministériel 05/06/2026 impose une traçabilité complète de toutes les actions réglementaires (création acteur, vente, modification conformité, signalement). Les sanctions peuvent aller jusqu'à la fermeture administrative (3 mois à 1 an). L'audit trail doit être **inaltérable** et **prouvable juridiquement**.

### Options considérées

1. **Table d'audit classique** : Table `audit_logs` avec INSERT à chaque opération, sans mécanisme d'immuabilité
2. **Event Sourcing complet** : Toutes les mutations passent par un event store, reconstruction de l'état par replay
3. **Event Sourcing hybride** : Modèles transactionnels classiques (état courant) + Event Store parallèle pour l'audit

### Décision
**Option 3 — Event Sourcing hybride.**

L'état courant est stocké dans les tables transactionnelles PostgreSQL classiques (performances de lecture). Les événements de domaine sont stockés dans une table `domain_events` avec chaînage cryptographique pour l'immuabilité.

### Justification
- **Performance** : Les lectures métier (80% du trafic) utilisent les tables classiques optimisées (indexes, relations). Pas de reconstruction systématique par event replay.
- **Immuabilité** : Chaque événement est signé avec `SHA256(payload + previous_event_hash + timestamp)`. Toute modification détectable par recalcul.
- **Légal** : Le chaînage cryptographique fournit une preuve d'intégrité acceptable pour une procédure administrative.
- **Pragmatisme** : L'event sourcing complet impose une refonte radicale de toute l'architecture. L'approche hybride ajoute l'audit sans réécrire la logique métier.

**Schéma de la table domain_events :**

```sql
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(64) NOT NULL,     -- 'vehicle', 'actor', 'sale', 'client'
    aggregate_id VARCHAR(128) NOT NULL,       -- VIN, actor_id, sale_id
    event_type VARCHAR(128) NOT NULL,         -- 'VehicleCreated', 'SaleRecorded'
    payload JSONB NOT NULL,
    previous_hash VARCHAR(64),                -- Hash de l'événement précédent (chaînage)
    event_hash VARCHAR(64) NOT NULL,          -- Hash SHA256 de cet événement
    actor_user_id UUID REFERENCES users(id),
    actor_ip_address INET,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sequence_number BIGSERIAL,                -- Numéro de séquence global
    
    CONSTRAINT valid_chain CHECK (event_hash IS NOT NULL)
);

-- Index pour recherches par agrégat (replay)
CREATE INDEX idx_domain_events_aggregate ON domain_events(aggregate_type, aggregate_id, timestamp);
-- Index pour vérification d'intégrité (séquence)
CREATE INDEX idx_domain_events_sequence ON domain_events(sequence_number);
-- Partitionnement par mois pour volumes
```

**Vérification d'intégrité :**

```typescript
async function verifyChainIntegrity(): Promise<boolean> {
    const events = await repository.find({ order: { sequenceNumber: 'ASC' }});
    
    for (let i = 1; i < events.length; i++) {
        const current = events[i];
        const previous = events[i - 1];
        
        // Vérifier que previous_hash correspond au hash précédent
        if (current.previousHash !== previous.eventHash) {
            await alertSecurityTeam(`Chain break at sequence ${current.sequenceNumber}`);
            return false;
        }
        
        // Recalculer le hash pour détecter toute modification
        const calculatedHash = sha256(
            JSON.stringify(current.payload) + 
            current.previousHash + 
            current.timestamp.toISOString()
        );
        
        if (calculatedHash !== current.eventHash) {
            await alertSecurityTeam(`Hash mismatch at sequence ${current.sequenceNumber}`);
            return false;
        }
    }
    return true;
}
```

### Conséquences
- **Positives** : Audit trail juridiquement solide, chaînage détecte toute altération, replay possible pour forensics.
- **Négatives** : Volume de stockage supplémentaire (~20-30% de la base), surcharge d'écriture (~5ms par événement), complexité de vérification périodique.
- **Mitigation** : Partitionnement mensuel de `domain_events`, snapshots quotidiens, vérification d'intégrité en tâche de fond (nuit).

---

## ADR-005 : RabbitMQ vs Apache Kafka {#adr-005}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-04 |
| **Décideurs** | Architecte Solution, Lead Backend, Lead DevOps |

### Contexte
La plateforme nécessite un message broker pour : traitement asynchrone des rapports (PDF/XML), notifications (email/SMS), projections CQRS, détection fraude, et synchronisation inter-module. Le choix se porte entre RabbitMQ et Apache Kafka.

### Options considérées

1. **RabbitMQ** — Message broker traditionnel, exchanges/routings flexibles, AMQP
2. **Apache Kafka** — Distributed log, haut débit, rétention longue, stream processing
3. **Redis Pub/Sub + Streams** — Solution légère, déjà présent dans la stack

### Décision
**RabbitMQ** comme broker principal, **Redis Pub/Sub** pour les notifications temps réel (WebSocket push).

### Justification

| Critère | RabbitMQ | Kafka | Redis |
|---------|----------|-------|-------|
| Complexité opérationnelle | **Faible** | Élevée | Nulle (déjà déployé) |
| Routing flexible (exchanges, topics) | **Excellente** | Moyenne | Faible |
| Dead Letter Exchange | **Natif** | Via configuration | Non |
| Message TTL | **Natif** | Via rétention | Oui |
| Priorité messages | **Oui** | Non | Non |
| Débit (msg/s) | 50K+ | **1M+** | 100K+ |
| Ressources mémoire/CPU | **Modérées** | Élevées | Faibles |
| Federation (multi-site) | **Oui** | MirrorMaker complexe | Non |
| Stream processing | Non | **Kafka Streams** | Redis Streams limité |
| Maturité librarie Node.js | **Excellente** (amqplib) | Bonne (kafka-js) | Excellente |

**Arguments décisifs pour RabbitMQ :**
- **Complexité opérationnelle** : RabbitMQ s'administre avec 3 nodes en cluster. Kafka nécessite ZooKeeper/KRaft, plus de tuning, plus de surveillance.
- **Routing** : Les exchanges (direct, topic, fanout, headers) permettent un routing flexible par type d'événement sans création de topics statiques.
- **Dead Letter Exchange (DLX)** : Essentiel pour la fiabilité. Les messages en échec sont redirigés automatiquement vers une queue de retry.
- **Federation** : Permet une future réplication inter-sites (Ouagadougou + Bobo-Dioulasso) sans complexité.
- **Débit suffisant** : 50K msg/s est largement suffisant pour 10 000 utilisateurs simultanés (estimation : < 1000 msg/s en pointe).

**Architecture des exchanges et queues :**

```
Exchanges :
├── ireg.events.topic (topic)     → Événements métier (routing key: module.entity.action)
├── ireg.delayed.direct (direct)  → Messages retardés (TTL pour retry)
├── ireg.fanout (fanout)          → Broadcast (cache invalidation)

Queues principales :
├── q.reporting.generate          → Génération PDF/XML (MODULE E)
├── q.notification.email          → Notifications email
├── q.notification.sms            → Notifications SMS
├── q.projection.refresh          → Refresh Materialized Views (CQRS)
├── q.compliance.check            → Calcul score conformité (MODULE F)
├── q.security.fraud              → Détection fraude (MODULE G)
├── q.sync.push                   → Push sync vers devices PWA
├── q.webhook.deliver             → Delivery webhooks externes
├── q.dlq.main                    → Dead Letter Queue (analyse + retry)
```

### Conséquences
- **Positives** : Fiabilité message delivery (ack/nack), routing flexible, administration simple, excellente documentation.
- **Négatives** : Pas de rétention longue native (contrairement à Kafka), pas de replay d'événements passés. Mitigé par l'Event Store PostgreSQL qui conserve l'historique.
- **Redis complement** : Utilisé uniquement pour les notifications push temps réel (WebSocket → browser) et le Pub/Sub cache invalidation.

---

## ADR-006 : Stratégie de partitionnement PostgreSQL {#adr-006}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-04 |
| **Décideurs** | Architecte Solution, Lead Backend, DBA |

### Contexte
Les tables `audit_logs`, `domain_events` (Event Sourcing) et `stock_movements` vont accumuler des millions de lignes. Sans partitionnement, les requêtes et la maintenance (VACUUM, REINDEX) deviennent prohibitifs.

### Options considérées

1. **Partitionnement par range (mois)** — Partition PostgreSQL native, une partition par mois
2. **Partitionnement par hash** — Répartition uniforme sur N partitions
3. **Partitionnement par list (année)** — Une partition par année
4. **Aucun partitionnement** — Indexes seuls, archivage manuel

### Décision
**Partitionnement par RANGE sur TIMESTAMP, avec granularité mensuelle.**

### Justification

**Tables partitionnées et stratégie :**

| Table | Colonne de partition | Granularité | Retention | Estimation volume |
|-------|---------------------|-------------|-----------|-------------------|
| `domain_events` | `timestamp` | Mensuelle | 7 ans (obligation légale) | ~2M lignes/mois |
| `audit_logs` | `created_at` | Mensuelle | 3 ans | ~5M lignes/mois |
| `stock_movements` | `movement_date` | Mensuelle | 5 ans | ~1M lignes/mois |
| `fraud_alerts` | `created_at` | Mensuelle | 10 ans | ~100K lignes/mois |

**Pourquoi RANGE mensuel :**
- **Requêtes temporelles** : 95% des requêtes sur ces tables incluent un filtre temporel (`WHERE timestamp BETWEEN '2026-01-01' AND '2026-03-31'`). Le partition exclusion élimine automatiquement les partitions hors range.
- **Maintenance** : `VACUUM`, `REINDEX`, et `TRUNCATE` sur des partitions individuelles sont rapides. Une partition de 2M lignes se VACUUM en minutes, vs heures pour une table de 100M+ lignes.
- **Archivage** : Les partitions anciennes (au-delà de la rétention) peuvent être détachées (`DETACH PARTITION`) et archivées sur MinIO (cold storage), puis supprimées.
- **PostgreSQL natif** : Déclarative partitioning (PG 10+), pas d'extension tierce. Gestion automatique via `pg_partman`.

**Exemple de création :**

```sql
-- Table partitionnée domain_events
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(64) NOT NULL,
    aggregate_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(128) NOT NULL,
    payload JSONB NOT NULL,
    previous_hash VARCHAR(64),
    event_hash VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    sequence_number BIGSERIAL
) PARTITION BY RANGE (timestamp);

-- Partitions mensuelles (pré-créées pour 6 mois)
CREATE TABLE domain_events_2026_01 PARTITION OF domain_events
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE domain_events_2026_02 PARTITION OF domain_events
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... etc

-- Index par partition (B-tree sur aggregate pour replay rapide)
CREATE INDEX idx_de_2026_01_aggregate ON domain_events_2026_01 (aggregate_type, aggregate_id, timestamp);

-- BRIN index sur timestamp pour les requêtes de range (léger, petit)
CREATE INDEX idx_de_2026_01_brin ON domain_events_2026_01 USING BRIN (timestamp);
```

**Automatisation avec pg_partman :**
```sql
-- Création automatique des partitions futures
SELECT partman.create_parent('public.domain_events', 'timestamp', 'native', 'monthly');
SELECT partman.run_maintenance();  -- À exécuter via cron/pg_cron tous les jours
```

### Conséquences
- **Positives** : Requêtes temporelles rapides (partition exclusion), maintenance simple, archivage automatisable.
- **Négatives** : Complexité des requêtes cross-partition (requièrent l'union), contraintes d'unicité doivent inclure la clé de partition, `UPDATE` déplaçant une ligne vers une autre partition sont coûteux.
- **Mitigation** : Les requêtes cross-partition sont rares (analytics annuels uniquement, servis par les read models CQRS).

---

## ADR-007 : Offline-first et synchronisation PWA {#adr-007}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-05 |
| **Décideurs** | Architecte Solution, Lead Frontend, Lead Backend |

### Contexte
Le Burkina Faso connaît des coupures d'Internet fréquentes (instabilité des fournisseurs, maintenance réseau, coupure électrique). Les détaillants en zone rurale peuvent être offline plusieurs heures par jour. La plateforme doit permettre la saisie de ventes, clients, et consultations de stock en mode offline, avec synchronisation transparente à la reconnexion.

### Options considérées

1. **Application mobile native (React Native / Flutter)** — Offline via SQLite local, sync manuelle
2. **PWA offline-first** — Service Worker + IndexedDB + Background Sync API
3. **Architecture hybride** — PWA pour le web + APK wrapper (TWA) pour le Play Store
4. **Application desktop (Electron)** — Offline complet, lourd à déployer

### Décision
**Option 3 — PWA offline-first avec Trusted Web Activity (TWA) pour distribution Play Store.**

### Justification

**Pourquoi PWA plutôt que native :**
- **Déploiement** : Pas de validation App Store/Google Play pour les mises à jour. Le déploiement est instantané (CDN).
- **Cross-platform** : Une seule codebase pour web, Android, iOS. Le Burkina Faso a une pénétration Android > 80%, iOS < 5%.
- **Poids** : PWA < 2MB initial (vs 20-50MB pour une app native). Critique pour les connexions 3G/4G limitées.
- **Background Sync API** : Permet de mettre en file d'attente les mutations (POST/PUT) et de les exécuter automatiquement à la reconnexion.
- **IndexedDB** : Stockage local de ~50MB+ pour les données métier (clients, stocks, catalogues).

**Pourquoi TWA (Trusted Web Activity) :**
- Permet de distribuer la PWA sur le Google Play Store Burkinabé
- Navigation Chrome sans UI browser (expérience native)
- Push notifications natives via Firebase Cloud Messaging

**Architecture de synchronisation :**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OFFLINE-FIRST SYNC PROTOCOL                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CLIENT (PWA)                          SERVEUR (NestJS)              │
│  ┌──────────────────┐                 ┌──────────────────┐          │
│  │ IndexedDB        │                 │ PostgreSQL       │          │
│  │ (Dexie.js)       │                 │ + Event Store    │          │
│  │                  │                 │                  │          │
│  │ - actors_sync    │◄───────────────►│ - actors         │          │
│  │ - clients_sync   │   Delta Sync    │ - clients        │          │
│  │ - sales_queue    │   (bidirectionnel)│ - sales         │          │
│  │ - vehicles_sync  │                 │ - domain_events  │          │
│  │ - documents_blob │                 │                  │          │
│  └──────────────────┘                 └──────────────────┘          │
│                                                                      │
│  Protocole :                                                         │
│  1. Client envoie : lastSyncTimestamp + changes[]                    │
│  2. Serveur compare avec serverTimestamp                             │
│  3. Serveur retourne : serverChanges[] + conflicts[]                 │
│  4. Client merge + met à jour lastSyncTimestamp                      │
│                                                                      │
│  Conflits : Last-Write-Wins avec règles métier                      │
│  - Ventes : jamais merge, alerte manuelle                            │
│  - Stock : event sourcing merge                                      │
│  - Clients/Acteurs : timestamp gagne                                 │
│                                                                      │
│  Retry : exponentiel backoff (5s, 15s, 1min, 5min)                  │
│  File locale FIFO : max 500 opérations                              │
│  Documents : upload différé (multipart pour >5MB)                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**IndexedDB Schema (Dexie.js) :**
```typescript
const db = new Dexie('iRegMotoLocal');
db.version(1).stores({
    actors_sync: '++localId, serverId, syncStatus, updatedAt',
    clients_sync: '++localId, serverId, syncStatus, updatedAt',
    sales_queue: '++localId, serverId, status, retryCount, createdAt',
    vehicles_sync: 'vin, serverId, syncStatus, updatedAt',
    documents_blob: '++localId, relatedEntity, uploadStatus, blob',
    sync_meta: 'key'  // lastSyncTimestamp, deviceId
});
```

### Conséquences
- **Positives** : Continuité métier 72h offline, expérience utilisateur fluide, pas de perte de données.
- **Négatives** : Complexité du protocole de sync, risque de conflits, stockage local limité (IndexedDB ~50-100MB selon navigateur), debugging difficile des erreurs de sync.
- **Mitigation** : Tests E2E avec simulation de déconnexion, dashboard de monitoring des sync errors, file d'attente locale avec garde-fou (max 500 ops, alerte si > 100 en attente).

---

## ADR-008 : MinIO vs AWS S3 pour le stockage objet {#adr-008}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-05 |
| **Décideurs** | Architecte Solution, CTO, Lead DevOps |

### Contexte
La plateforme stocke des documents KYC (CNI, passeports), photos de véhicules, pièces d'identité biométriques, rapports PDF/XML signés, et factures OHADA. Le volume estimé est de 500GB à 2TB sur 3 ans. Il faut choisir entre un stockage cloud public (AWS S3) et une solution on-premise / cloud privé (MinIO).

### Options considérées

1. **AWS S3 (Région Afrique)** — Stockage cloud public, haute durabilité, prix à l'usage
2. **MinIO auto-hébergé** — S3-compatible open source, déploiement local ou cloud privé
3. **Google Cloud Storage** — Alternative cloud, moins de points de présence en Afrique
4. **Wasabi** — S3-compatible, prix fixe, peu de présence en Afrique

### Décision
**MinIO auto-hébergé sur Kubernetes, avec réplication vers AWS S3 comme cold backup (optionnel).**

### Justification

**Pourquoi MinIO plutôt que AWS S3 direct :**
- **Souveraineté des données** : Les documents KYC et données biométriques sont des données personnelles sensibles. Le stockage sur infrastructure nationale (ou cloud privé) respecte mieux les cadres de protection des données UEMOA.
- **Latence** : MinIO déployé dans un datacenter d'Ouagadougou (ou cloud régional) offre une latence < 10ms. AWS S3 Afrique (Afrique du Sud) = 150-300ms de latence.
- **Coût** : MinIO = coût hardware seul (pas de frais de sortie/entrée). AWS S3 = $0.023/GB/mois + frais de requête + frais de sortie (significatifs en cas de migration).
- **Offline capability** : MinIO peut fonctionner en mode standalone sur un site local si la connexion Internet est coupée. AWS S3 nécessite impérativement une connexion.
- **S3-compatible** : L'API AWS S3 est universellement supportée. La migration vers S3 (ou l'inverse) est transparente pour l'application (SDK AWS).

**Architecture MinIO :**
```
Mode : Distributed (4 nodes minimum pour HA)
       ┌──────────┐
       │  NGINX   │  (Load balancer)
       └────┬─────┘
    ┌───────┼───────┐
    ▼       ▼       ▼
┌───────┐┌───────┐┌───────┐┌───────┐
│MinIO  ││MinIO  ││MinIO  ││MinIO  │
│Node 1 ││Node 2 ││Node 3 ││Node 4 │
└───────┘└───────┘└───────┘└───────┘
   ERASURE CODE (parity = 2, data = 2)
   → Tolérance : 2 disques/nodes en panne
   → Redondance : chaque objet sur N/2 nodes
```

**Buckets définis :**
| Bucket | Contenu | Règles lifecycle | Encryption |
|--------|---------|-----------------|------------|
| `ireg-kyc-documents` | CNI, passeports, biométrie | 90 jours → cold | AES-256-SSE |
| `ireg-vehicle-photos` | Photos 2R (import/vente) | 7 ans | AES-256-SSE |
| `ireg-reports` | Rapports PDF/XML signés | 10 ans (légal) | AES-256-SSE |
| `ireg-invoices` | Factures OHADA | 10 ans (légal) | AES-256-SSE |
| `ireg-temp-uploads` | Uploads en cours | 24h → suppression auto | AES-256-SSE |

### Conséquences
- **Positives** : Souveraineté, faible latence, pas de lock-in cloud, coût prévisible, résilience offline.
- **Négatives** : Responsabilité de l'exploitation (backup, monitoring, mises à jour), capacité de stockage limitée par le hardware.
- **Mitigation** : Backup quotidien vers un second cluster MinIO (site distant) ou AWS S3 Glacier (optionnel, coût minimal). Monitoring Prometheus + alertes espace disque.

---

## ADR-009 : JWT + OAuth2 + MFA pour l'authentification {#adr-009}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-06 |
| **Décideurs** | Architecte Solution, RSSI, Lead Backend |

### Contexte
La plateforme manipule des données réglementaires sensibles et est soumise à des obligations de conformité. Plusieurs profils d'utilisateurs coexistent : importateurs/distributeurs (comptes entreprise), contrôleurs ministère (accès sensible), et administrateurs DRCTT (accès critique). L'authentification doit être sécurisée, multi-facteur pour les profils sensibles, et simple pour les profils standards.

### Options considérées

1. **JWT uniquement** — Simple, stateless, pas de MFA natif
2. **JWT + OAuth2 (Google, Microsoft)** — Social login, pas de MFA obligatoire
3. **JWT + OAuth2 + MFA (TOTP/SMS)** — Multi-facteur pour admin, JWT classique pour autres
4. **SAML 2.0 + IdP externe** — Enterprise SSO, trop lourd pour les acteurs économiques
5. **Auth0 / Keycloak** — Solution IAM complète, dépendance externe

### Décision
**Option 3 — JWT + OAuth2 + MFA, avec implémentation interne (pas de dépendance SaaS externe).**

### Justification

**Architecture d'authentification :**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FLUX STANDARD (Acteurs économiques) :                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ Client   │───►│ POST     │───►│ Validate │───►│ JWT      │      │
│  │ (PWA)    │    │ /auth/   │    │ email/   │    │ Access   │      │
│  │          │    │ login    │    │ password │    │ + Refresh│      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│                                                                      │
│  FLUX MFA (Administrateurs, Contrôleurs) :                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ Client   │───►│ POST     │───►│ TOTP     │───►│ POST     │      │
│  │ (PWA)    │    │ /auth/   │    │ QR Code  │    │ /auth/   │      │
│  │          │    │ login    │    │ (Google   │    │ mfa/     │      │
│  │          │    │          │    │  Auth.)   │    │ verify   │      │
│  └──────────┘    └──────────┘    └──────────┘    └────┬─────┘      │
│                                                       │              │
│                                                       ▼              │
│                                                 ┌──────────┐         │
│                                                 │ JWT + MFA│         │
│                                                 │ claim    │         │
│                                                 └──────────┘         │
│                                                                      │
│  FLUX OAUTH2 (optionnel) :                                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ Client   │───►│ Redirect │───►│ Google/  │───►│ Callback │      │
│  │          │    │ OAuth    │    │ Microsoft│    │ + création│     │
│  │          │    │ provider │    │          │    │ compte   │      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│                                                                      │
│  SÉCURITÉ JWT :                                                      │
│  - Algorithme : RS256 (clé privée serveur, publique client)         │
│  - Access Token : 15 minutes (bref, réduit surface attaque)         │
│  - Refresh Token : 7 jours, rotation (nouveau RT à chaque refresh)  │
│  - Stockage : httpOnly secure cookies (pas de localStorage)         │
│  - Revocation : Redis blacklist (jusqu'à expiration naturelle)      │
│                                                                      │
│  MFA :                                                               │
│  - TOTP (RFC 6238) via Google Authenticator / Authy                 │
│  - Backup codes (10 codes à usage unique)                           │
│  - SMS fallback (API Twilio / Africa's Talking)                     │
│  - Obligatoire pour : ADMIN, SUPER_ADMIN, CONTROLEUR                │
│  - Optionnel pour : IMPORTATEUR, DISTRIBUTEUR, DETAILLANT           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Structure des tokens :**
```typescript
interface AccessTokenPayload {
    sub: string;           // user UUID
    email: string;
    role: 'IMPORTATEUR' | 'DISTRIBUTEUR' | 'DETAILLANT' | 'CONTROLEUR' | 'ADMIN' | 'SUPER_ADMIN';
    actorId: string;       // Référence acteur économique (si applicable)
    permissions: string[]; // Permissions granulaires (calculées à l'auth)
    mfaVerified: boolean;  // true si MFA validé dans la session
    iat: number;
    exp: number;
    jti: string;           // JWT ID unique (pour revocation)
}
```

### Conséquences
- **Positives** : Sécurité élevée avec MFA pour les profils critiques, flexibilité (OAuth2 optionnel), pas de dépendance externe (Auth0 = lock-in + coût récurrent).
- **Négatives** : Complexité d'implémentation du MFA (génération TOTP, QR codes, backup codes), gestion des tokens (rotation refresh, blacklist Redis).
- **Mitigation** : Librairie `speakeasy` pour TOTP, `qrcode` pour génération QR, tests de sécurité automatisés (brute force, token replay).

---

## ADR-010 : Blockchain légère vs logs signés pour l'audit immuable {#adr-010}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-06 |
| **Décideurs** | Architecte Solution, RSSI, CTO |

### Contexte
L'audit trail des actions réglementaires doit être **juridiquement irréfutable** et **techniquement inaltérable**. En cas de litige (fermeture administrative contestée), le ministère doit prouver l'intégrité des données. Deux approches : blockchain décentralisée ou chaînage cryptographique de logs.

### Options considérées

1. **Blockchain publique (Ethereum)** — Immuabilité absolue, coût par transaction, dépendance réseau
2. **Blockchain privée (Hyperledger Fabric)** — Contrôle complet, complexité opérationnelnelle élevée
3. **Logs signés avec chaînage cryptographique (Merkle tree + SHA256)** — Simple, vérifiable, pas de dépendance externe
4. **Logs signés + ancrage blockchain périodique** — Combinaison 2 et 3, ancrage Merkle root sur blockchain publique

### Décision
**Option 3 — Logs signés avec chaînage cryptographique (SHA256) + ancrage périodique optionnel sur blockchain publique (futur).**

### Justification

| Critère | Blockchain publique | Blockchain privée | Logs signés |
|---------|-------------------|-------------------|-------------|
| Immuabilité | **Absolue** | Forte | Forte (détectable) |
| Complexité opérationnelle | Élevée | **Élevée** | **Faible** |
| Coût | ~$0.01-1/tx | Hardware | **Négligeable** |
| Débit (tx/s) | 15-30 | 1000+ | **Illimité (local)** |
| Latence | 12s-10min | ~1s | **< 1ms** |
| Vérifiabilité sans infra externe | Non | Non | **Oui** |
| Reconnaissance juridique | Émergente | Émergente | **Établie** (signature électronique) |
| Offline | Non | Non | **Oui** |

**Arguments décisifs pour les logs signés :**
- **Contexte africain** : Une blockchain nécessite une connectivité permanente et des ressources opérationnelles que le contexte local ne garantit pas. Les logs signés fonctionnent offline.
- **Reconnaissance juridique** : Le chaînage cryptographique (preuve de chaîne intacte) est reconnu par les tribunaux OHADA comme preuve d'intégrité de données informatiques.
- **Simplicité** : Implémentation en quelques centaines de lignes TypeScript, pas d'infrastructure blockchain à maintenir.
- **Évolutivité** : Un ancrage périodique (quotidien) du Merkle root sur une blockchain publique peut être ajouté ultérieurement pour renforcer la preuve.

**Mécanisme de chaînage :**

```
Événement 1 : { payload: {...}, prev_hash: "0", timestamp: "2026-01-01T00:00:00Z" }
              → hash_1 = SHA256(payload_1 + "0" + timestamp_1)

Événement 2 : { payload: {...}, prev_hash: hash_1, timestamp: "2026-01-01T00:00:01Z" }
              → hash_2 = SHA256(payload_2 + hash_1 + timestamp_2)

Événement 3 : { payload: {...}, prev_hash: hash_2, timestamp: "2026-01-01T00:00:02Z" }
              → hash_3 = SHA256(payload_3 + hash_2 + timestamp_3)

Vérification : Re-calculer tous les hashes, comparer aux valeurs stockées.
Si un payload est modifié → hash différent → chaîne brisée → alerte.
```

**Merkle Tree pour preuve d'appartenance :**
```
Pour prouver qu'un événement spécifique fait partie de l'audit trail :
- Construire un Merkle tree sur un batch d'événements (ex: journalier)
- Stocker le Merkle root signé
- Fournir un Merkle proof (chemin de hachage) pour vérifier un événement
- Cohérence : O(log n) vs O(n) pour la vérification complète
```

### Conséquences
- **Positives** : Immuabilité vérifiable offline, complexité faible, coût négligeable, reconnaissance juridique établie.
- **Négatives** : L'immuabilité repose sur la sécurité de la base PostgreSQL (si un DBA malveillant supprime des lignes, la chaîne est brisée — mais c'est détectable). Pas de preuve distribuée comme une blockchain.
- **Mitigation** : Backup quotidien chiffré des logs vers MinIO (air-gapped), vérification d'intégrité automatisée (tâche nuit), ancrage blockchain optionnel pour les cas critiques.

---

## ADR-011 : TypeORM vs Prisma comme ORM {#adr-011}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-07 |
| **Décideurs** | Architecte Solution, Lead Backend |

### Contexte
La base PostgreSQL compte 40+ tables avec des relations complexes. L'ORM doit supporter le partitionnement, les types ENUM PostgreSQL, les JSONB queries, et les migrations versionnées.

### Décision
**TypeORM** (avec DataSource configuration manuelle pour le partitionnement).

### Justification
- **Intégration NestJS** : `@nestjs/typeorm` est officiellement maintenu par l'équipe NestJS. La décoration `@Entity()`, `@Column()`, `@Relation()` s'intègre parfaitement avec le système de modules.
- **Migrations** : CLI TypeORM pour générer et exécuter les migrations (`typeorm migration:generate`, `typeorm migration:run`).
- **Partitionnement** : TypeORM supporte les partitions PostgreSQL via l'option `partitionBy` dans `@Entity()` (PG 10+).
- **JSONB** : Support natif des opérateurs PostgreSQL JSONB (`@Column({ type: 'jsonb' })`).
- **Raw queries** : Possibilité d'exécuter des requêtes SQL brutes pour les cas complexes (read models, analytics).

**Prisma a été écarté car :**
- Moins mature sur les migrations complexes (partitionnement)
- Client Prisma généré — moins flexible pour les requêtes dynamiques
- Intégration NestJS moins native (pas de décorateur officiel)

---

## ADR-012 : GraphQL + REST hybride vs REST uniquement {#adr-012}

| Métadonnée | Valeur |
|-----------|--------|
| **Statut** | Accepté |
| **Date** | 2025-06-07 |
| **Décideurs** | Architecte Solution, Lead Frontend, Lead Backend |

### Décision
**Architecture hybride : REST pour les mutations métier (PWA offline-first), GraphQL pour les requêtes analytiques (Portail Admin).**

### Justification
- **REST pour les mutations** : La PWA offline-first repose sur un protocole de sync REST simple (POST/PUT/DELETE avec file d'attente). GraphQL mutations sont plus complexes à mettre en file d'attente offline.
- **GraphQL pour les queries analytiques** : Le portail administratif (MODULE H) nécessite des requêtes flexibles (agrégations, filtres dynamiques, relations profondes). GraphQL permet au frontend de définir précisément les champs nécessaires sans créer N endpoints REST.
- **Coexistence** : Apollo Server NestJS expose `/graphql`. Les controllers NestJS exposent `/api/v1/*`. Pas de conflit.

---

## Synthèse des décisions

| # | Décision | Statut | Impact |
|---|---------|--------|--------|
| ADR-001 | NestJS | Accepté | Fondation backend, écosystème TS |
| ADR-002 | Modular Monolith → Microservices | Accepté | Time-to-market, évolutivité |
| ADR-003 | CQRS avec Read Models PostgreSQL | Accepté | Performance reporting |
| ADR-004 | Event Sourcing hybride | Accepté | Audit trail immuable |
| ADR-005 | RabbitMQ + Redis Pub/Sub | Accepté | Messaging fiable, simple |
| ADR-006 | Partitionnement RANGE mensuel | Accepté | Scalabilité données |
| ADR-007 | PWA offline-first TWA | Accepté | Résilience connectivité |
| ADR-008 | MinIO auto-hébergé | Accepté | Souveraineté, latence |
| ADR-009 | JWT + OAuth2 + MFA interne | Accepté | Sécurité, pas de lock-in |
| ADR-010 | Logs signés SHA256 (pas blockchain) | Accepté | Simplicité, juridique |
| ADR-011 | TypeORM | Accepté | Intégration NestJS |
| ADR-012 | REST + GraphQL hybride | Accepté | Flexibilité frontend |

---

> **Processus de révision** : Les ADRs sont révisables tous les 6 mois ou sur décision du comité technique. Toute révision doit être documentée comme nouvelle version de l'ADR concerné avec la date et les décideurs.
