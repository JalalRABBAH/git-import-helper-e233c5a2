# iReg Moto BF — Guide d'Installation

> **Version:** 1.0.0 | **Public cible:** Administrateurs systeme, DevOps, equipe technique

---

## Table des matieres

1. [Prerequis systeme](#1-prerequis-systeme)
2. [Installation locale (Docker Compose)](#2-installation-locale-docker-compose)
3. [Installation production (Kubernetes)](#3-installation-production-kubernetes)
4. [Configuration des variables d'environnement](#4-configuration-des-variables-denvironnement)
5. [Migrations de base de donnees](#5-migrations-de-base-de-donnees)
6. [Creation du premier administrateur](#6-creation-du-premier-administrateur)

---

## 1. Prerequis systeme

### 1.1 Environnement de developpement

| Composant | Version minimale | Recommande | Notes |
|-----------|-----------------|------------|-------|
| Docker | 24.0.0 | 25.0.0+ | Docker Desktop pour Windows/Mac |
| Docker Compose | v2.20+ | v2.24+ | Inclus dans Docker Desktop |
| Node.js | 18 LTS | 20 LTS | Pour le developpement local |
| npm | 9.x | 10.x | Inclus avec Node.js |
| Git | 2.40+ | 2.43+ | Pour le clonage |
| Make | 4.3+ | 4.4+ | Optionnel, pour les scripts |

### 1.2 Environnement de production

| Composant | Specification minimale | Specification recommandee |
|-----------|----------------------|--------------------------|
| **Cluster Kubernetes** | 3 nœuds (4 vCPU, 8 Go RAM) | 5 nœuds (8 vCPU, 16 Go RAM) |
| **Stockage** | 100 Go SSD | 500 Go NVMe SSD |
| **Bande passante** | 100 Mbps symetrique | 1 Gbps symetrique |
| **OS nœuds** | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| **Kubernetes** | 1.28+ | 1.29+ |
| **Conteneur runtime** | containerd 1.7+ | containerd 1.7+ |
| **CNI** | Calico ou Cilium | Cilium |

### 1.3 Ressources par service (production)

| Service | CPU request | CPU limit | RAM request | RAM limit | Replicas |
|---------|------------|-----------|-------------|-----------|----------|
| Backend API | 250m | 1000m | 256 Mi | 1 Gi | 3 |
| Frontend PWA | 100m | 500m | 128 Mi | 512 Mi | 2 |
| PostgreSQL | 500m | 2000m | 512 Mi | 2 Gi | 1 (StatefulSet) |
| Redis | 200m | 500m | 256 Mi | 512 Mi | 3 (Sentinel) |
| RabbitMQ | 250m | 1000m | 256 Mi | 1 Gi | 3 (cluster) |
| MinIO | 500m | 1000m | 512 Mi | 1 Gi | 4 (distributed) |
| Nginx/Treafik | 100m | 500m | 128 Mi | 256 Mi | 2 |

### 1.4 Ports requis

| Port | Service | Description |
|------|---------|-------------|
| 80 | Nginx/Treafik | HTTP (redirection HTTPS) |
| 443 | Nginx/Treafik | HTTPS |
| 5432 | PostgreSQL | Base de donnees (interne uniquement) |
| 6379 | Redis | Cache/Sessions (interne uniquement) |
| 5672 | RabbitMQ | AMQP (interne uniquement) |
| 15672 | RabbitMQ | Management UI (interne uniquement) |
| 9000 | MinIO | API S3 (interne uniquement) |
| 9001 | MinIO | Console admin (interne uniquement) |
| 9090 | Prometheus | Metriques (interne uniquement) |
| 3000 | Grafana | Tableaux de bord (interne uniquement) |

---

## 2. Installation locale (Docker Compose)

### 2.1 Cloner le repository

```bash
git clone https://github.com/drctt/ireg-moto-bf.git
cd ireg-moto-bf
```

### 2.2 Configurer les variables d'environnement

```bash
cp .env.example .env
```

Editez le fichier `.env` avec vos valeurs :

```env
# ==========================================
# ENVIRONNEMENT
# ==========================================
NODE_ENV=development
TZ=Africa/Ouagadougou

# ==========================================
# APPLICATION
# ==========================================
APP_NAME=iReg Moto BF
APP_URL=http://localhost:5173
API_URL=http://localhost:3000

# ==========================================
# BASE DE DONNEES (PostgreSQL)
# ==========================================
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ireg_moto_bf
DB_USER=ireg_user
DB_PASSWORD=votre_mot_de_passe_securise
DB_SSL_MODE=disable

# ==========================================
# CACHE (Redis)
# ==========================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=votre_mot_de_passe_redis

# ==========================================
# MESSAGE BROKER (RabbitMQ)
# ==========================================
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=ireg_mq_user
RABBITMQ_PASSWORD=votre_mot_de_passe_mq
RABBITMQ_VHOST=/

# ==========================================
# STOCKAGE OBJET (MinIO)
# ==========================================
S3_ENDPOINT=minio:9000
S3_ACCESS_KEY=minio_access_key
S3_SECRET_KEY=minio_secret_key
S3_BUCKET=ireg-documents
S3_REGION=af-west-1
S3_USE_SSL=false

# ==========================================
# SECURITE (JWT)
# ==========================================
JWT_SECRET=votre_cle_jwt_super_secrete_64_caracteres_min
JWT_REFRESH_SECRET=votre_cle_refresh_super_secrete_64_caracteres_min
JWT_EXPIRATION=1h
REFRESH_TOKEN_EXPIRY=7d
BCRYPT_ROUNDS=12

# ==========================================
# FONCTIONNALITES
# ==========================================
ENABLE_SWAGGER=true
ENABLE_METRICS=true
ENABLE_MFA=true
ENABLE_AUDIT=true
```

### 2.3 Lancer l'infrastructure

```bash
docker-compose -f docker-compose.dev.yml up -d
```

Cette commande demarre :
- PostgreSQL 15 avec les extensions necessaires
- Redis 7 (mode standalone)
- RabbitMQ 3.12 avec management plugin
- MinIO (stockage objet S3-compatible)

### 2.4 Verifier l'etat des services

```bash
docker-compose -f docker-compose.dev.yml ps
```

Attendez que tous les services soient en etat `healthy` :

```
NAME                STATUS
ireg-postgres       Up (healthy)
ireg-redis          Up (healthy)
ireg-rabbitmq       Up (healthy)
ireg-minio          Up (healthy)
```

### 2.5 Initialiser MinIO

```bash
# Creer les buckets
docker-compose -f docker-compose.dev.yml exec minio mc alias set local http://localhost:9000 minio_access_key minio_secret_key
docker-compose -f docker-compose.dev.yml exec minio mc mb local/ireg-documents
docker-compose -f docker-compose.dev.yml exec minio mc mb local/ireg-kyc-documents
docker-compose -f docker-compose.dev.yml exec minio mc mb local/ireg-reports
docker-compose -f docker-compose.dev.yml exec minio mc mb local/ireg-invoices
docker-compose -f docker-compose.dev.yml exec minio mc mb local/ireg-temp-uploads
```

### 2.6 Installer et demarrer le backend

```bash
cd backend
npm install
```

### 2.7 Executer les migrations

```bash
npx typeorm migration:run -d src/config/data-source.ts
```

### 2.8 Charger les donnees de reference (seed)

```bash
npm run seed
```

Cette commande cree :
- Les categories de vehicules reglementaires
- Les regles de conformite par defaut
- Les regions et villes du Burkina Faso
- Les types de documents
- Les parametres systeme

### 2.9 Demarrer le backend

```bash
npm run start:dev
```

Le backend demarre sur `http://localhost:3000`.

### 2.10 Installer et demarrer le frontend

```bash
cd ../frontend
npm install
npm run dev
```

Le frontend demarre sur `http://localhost:5173`.

### 2.11 Acceder a l'application

| Service | URL |
|---------|-----|
| Application PWA | http://localhost:5173 |
| API Backend | http://localhost:3000/api/v1 |
| Swagger UI | http://localhost:3000/api/docs |
| GraphQL Playground | http://localhost:3000/graphql |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |
| MinIO Console | http://localhost:9001 |

[Image: Page d'accueil de iReg Moto BF en environnement local]

### 2.12 Arreter les services

```bash
# Arreter tout
docker-compose -f docker-compose.dev.yml down

# Arreter et supprimer les volumes (remise a zero)
docker-compose -f docker-compose.dev.yml down -v
```

---

## 3. Installation production (Kubernetes)

### 3.1 Prerequis cluster Kubernetes

```bash
# Verifier la connectivite au cluster
kubectl cluster-info

# Creer le namespace
kubectl create namespace ireg-moto-bf-prod

# Configurer le contexte
kubectl config set-context --current --namespace=ireg-moto-bf-prod
```

### 3.2 Creer les secrets

```bash
# Encoder les secrets en base64
echo -n 'votre_mot_de_passe_db' | base64
echo -n 'votre_cle_jwt' | base64
# ... pour chaque secret
```

Editez `infrastructure/kubernetes/secret.yaml` :

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ireg-backend-secrets
  namespace: ireg-moto-bf-prod
type: Opaque
data:
  database-url: <base64>
  db-password: <base64>
  redis-password: <base64>
  s3-access-key: <base64>
  s3-secret-key: <base64>
  rabbitmq-user: <base64>
  rabbitmq-password: <base64>
  jwt-secret: <base64>
  jwt-refresh-secret: <base64>
  encryption-key: <base64>
```

Appliquez :

```bash
kubectl apply -f infrastructure/kubernetes/secret.yaml
```

### 3.3 Deployer l'infrastructure

```bash
# ConfigMaps
kubectl apply -f infrastructure/kubernetes/configmap.yaml

# PostgreSQL
kubectl apply -f infrastructure/kubernetes/postgres-pvc.yaml
kubectl apply -f infrastructure/kubernetes/postgres-deployment.yaml

# Redis
kubectl apply -f infrastructure/kubernetes/redis-deployment.yaml

# RabbitMQ
kubectl apply -f infrastructure/kubernetes/rabbitmq-deployment.yaml

# MinIO
kubectl apply -f infrastructure/kubernetes/minio-pvc.yaml
kubectl apply -f infrastructure/kubernetes/minio-deployment.yaml
```

### 3.4 Verifier l'infrastructure

```bash
kubectl get pods -n ireg-moto-bf-prod
kubectl get pvc -n ireg-moto-bf-prod
kubectl get svc -n ireg-moto-bf-prod
```

### 3.5 Deployer l'application

```bash
# Backend
kubectl apply -f infrastructure/kubernetes/backend-deployment.yaml
kubectl apply -f infrastructure/kubernetes/backend-hpa.yaml

# Frontend
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml

# Ingress
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

### 3.6 Executer les migrations

```bash
# Attendre que le pod backend soit pret
kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=backend -n ireg-moto-bf-prod --timeout=120s

# Executer les migrations
kubectl exec -it deployment/backend -n ireg-moto-bf-prod -- npx typeorm migration:run -d dist/config/data-source.js

# Charger les donnees de reference
kubectl exec -it deployment/backend -n ireg-moto-bf-prod -- npm run seed:prod
```

### 3.7 Verifier le deploiement

```bash
# Pods
kubectl get pods -n ireg-moto-bf-prod

# Services
kubectl get svc -n ireg-moto-bf-prod

# Ingress
kubectl get ingress -n ireg-moto-bf-prod

# Logs backend
kubectl logs -l app.kubernetes.io/name=backend -n ireg-moto-bf-prod --tail=100
```

### 3.8 Configurer le DNS

Pointez votre nom de domaine vers l'adresse IP de l'ingress controller :

```
app.ireg-moto.bf    A    <IP_INGRESS>
api.ireg-moto.bf    A    <IP_INGRESS>
```

### 3.9 Configurer TLS (Let's Encrypt)

L'ingress utilise Treafik avec cert-manager pour le TLS automatique. Verifiez que le certificat est emis :

```bash
kubectl get certificate -n ireg-moto-bf-prod
kubectl describe certificate ireg-moto-tls -n ireg-moto-bf-prod
```

---

## 4. Configuration des variables d'environnement

### 4.1 Tableau complet des variables

#### Variables d'application

| Variable | Description | Valeur par defaut | Obligatoire |
|----------|-------------|-------------------|-------------|
| `NODE_ENV` | Environnement | `development` | Oui |
| `TZ` | Fuseau horaire | `Africa/Ouagadougou` | Oui |
| `PORT` | Port API | `3000` | Oui |
| `API_PREFIX` | Prefixe API | `api` | Oui |
| `API_VERSION` | Version API | `v1` | Oui |
| `LOG_LEVEL` | Niveau de log | `info` | Non |
| `LOG_FORMAT` | Format de log | `json` (prod), `pretty` (dev) | Non |

#### Variables base de donnees

| Variable | Description | Exemple | Obligatoire |
|----------|-------------|---------|-------------|
| `DB_HOST` | Hote PostgreSQL | `postgres` | Oui |
| `DB_PORT` | Port PostgreSQL | `5432` | Oui |
| `DB_NAME` | Nom de la base | `ireg_moto_bf` | Oui |
| `DB_USER` | Utilisateur | `ireg_user` | Oui |
| `DB_PASSWORD` | Mot de passe | — | Oui |
| `DB_POOL_MIN` | Connexions min | `5` | Non |
| `DB_POOL_MAX` | Connexions max | `20` | Non |
| `DB_SSL_MODE` | Mode SSL | `require` (prod) | Oui |

#### Variables Redis

| Variable | Description | Exemple | Obligatoire |
|----------|-------------|---------|-------------|
| `REDIS_HOST` | Hote Redis | `redis` | Oui |
| `REDIS_PORT` | Port Redis | `6379` | Oui |
| `REDIS_PASSWORD` | Mot de passe | — | Oui (prod) |
| `REDIS_KEY_PREFIX` | Prefixe cles | `ireg:` | Non |

#### Variables RabbitMQ

| Variable | Description | Exemple | Obligatoire |
|----------|-------------|---------|-------------|
| `RABBITMQ_HOST` | Hote | `rabbitmq` | Oui |
| `RABBITMQ_PORT` | Port | `5672` | Oui |
| `RABBITMQ_USER` | Utilisateur | `ireg_mq` | Oui |
| `RABBITMQ_PASSWORD` | Mot de passe | — | Oui |
| `RABBITMQ_VHOST` | Virtual host | `/` | Non |

#### Variables MinIO/S3

| Variable | Description | Exemple | Obligatoire |
|----------|-------------|---------|-------------|
| `S3_ENDPOINT` | Endpoint | `minio:9000` | Oui |
| `S3_ACCESS_KEY` | Cle d'acces | — | Oui |
| `S3_SECRET_KEY` | Cle secrete | — | Oui |
| `S3_BUCKET` | Bucket principal | `ireg-documents` | Oui |
| `S3_REGION` | Region | `af-west-1` | Non |
| `S3_USE_SSL` | SSL | `false` (dev), `true` (prod) | Non |

#### Variables securite

| Variable | Description | Exemple | Obligatoire |
|----------|-------------|---------|-------------|
| `JWT_SECRET` | Cle JWT (min 64 car.) | — | Oui |
| `JWT_REFRESH_SECRET` | Cle refresh JWT | — | Oui |
| `JWT_EXPIRATION` | Duree token | `1h` | Non |
| `REFRESH_TOKEN_EXPIRY` | Duree refresh | `7d` | Non |
| `BCRYPT_ROUNDS` | Cout bcrypt | `12` | Non |
| `ENCRYPTION_KEY` | Cle chiffrement AES | — | Oui (prod) |

### 4.2 Generation des secrets

```bash
# Generer un JWT secret (64 caracteres)
openssl rand -base64 48

# Generer une cle de chiffrement AES-256
openssl rand -hex 32

# Generer un mot de passe PostgreSQL securise
openssl rand -base64 24
```

---

## 5. Migrations de base de donnees

### 5.1 Principe

Le projet utilise TypeORM avec le pattern "migrations versionnees". Chaque changement de schema est un fichier de migration numerote, garantissant la reproductibilite et la tracabilite.

### 5.2 Workflow des migrations

```
Modifier une entite (entity/*.entity.ts)
         |
         v
  npx typeorm migration:generate -d src/config/data-source.ts src/migrations/NomMigration
         |
         v
  Verifier le fichier genere
         |
         v
  npx typeorm migration:run -d src/config/data-source.ts
```

### 5.3 Commandes disponibles

```bash
# Generer une migration depuis les entites
npx typeorm migration:generate -d src/config/data-source.ts src/migrations/AjoutTableExemple

# Executer les migrations en attente
npx typeorm migration:run -d src/config/data-source.ts

# Revenir en arriere d'une migration
npx typeorm migration:revert -d src/config/data-source.ts

# Afficher l'etat des migrations
npx typeorm migration:show -d src/config/data-source.ts

# Creer une migration vide (manuelle)
npx typeorm migration:create src/migrations/MigrationManuelle
```

### 5.4 Migrations de production (Kubernetes)

```bash
# Executer dans le pod backend
kubectl exec -it deployment/backend -n ireg-moto-bf-prod -- npx typeorm migration:run -d dist/config/data-source.js

# Verifier l'etat
kubectl exec -it deployment/backend -n ireg-moto-bf-prod -- npx typeorm migration:show -d dist/config/data-source.js
```

### 5.5 Seeder les donnees de reference

```bash
# Developpement
npm run seed

# Production
npm run seed:prod
```

Les donnees referencees seedees incluent :
- Categories de vehicules (C50, M125, M125+, TM, QM, E50, E125, E125+)
- Regles de conformite (48 regles par defaut)
- Regions du Burkina Faso (13 regions)
- Types de documents
- Parametres systeme

### 5.6 Sauvegarde et restauration PostgreSQL

```bash
# Sauvegarde
pg_dump -h postgres-service -U ireg_user -d ireg_moto_bf -F custom > backup_$(date +%Y%m%d).dump

# Restauration
pg_restore -h postgres-service -U ireg_user -d ireg_moto_bf --clean backup_20240716.dump

# Sauvegarde avec Docker
docker exec ireg-postgres pg_dump -U ireg_user -d ireg_moto_bf > backup.sql
```

---

## 6. Creation du premier administrateur

### 6.1 Via la ligne de commande (CLI)

```bash
# Developpement
npm run create:admin

# Production (Kubernetes)
kubectl exec -it deployment/backend -n ireg-moto-bf-prod -- npm run create:admin
```

Le script interactif demande :
- Email
- Mot de passe (validation de complexite)
- Prenom
- Nom
- Telephone

### 6.2 Via l'API (premiere installation uniquement)

```bash
# Endpoint special pour la premiere installation
curl -X POST http://localhost:3000/api/v1/setup/first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@drctt.bf",
    "password": "AdminSecure123!",
    "firstName": "Administrateur",
    "lastName": "DRCTT",
    "phone": "+226 25 30 12 34"
  }'
```

> **Securite** : Cet endpoint est desactive apres creation du premier admin.

### 6.3 Configuration MFA pour l'administrateur

1. Connectez-vous a l'application
2. Accedez a **Parametres > Securite > Authentification a double facteur**
3. Scannez le QR code avec Google Authenticator
4. Saisissez le code de verification
5. Conservez les codes de secours dans un endroit sur

[Image: Ecran de configuration MFA avec QR code et codes de secours]

### 6.4 Verification de l'installation

```bash
# Verifier la sante de l'API
curl http://localhost:3000/health

# Verifier la sante detaillee
curl http://localhost:3000/health/detailed

# Verifier l'authentification
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@drctt.bf", "password": "votre_mot_de_passe"}'
```

### 6.5 Checklist post-installation

- [ ] Base de donnees initialisee avec les migrations
- [ ] Donnees de reference seedees
- [ ] Premier administrateur cree
- [ ] MFA configure pour l'administrateur
- [ ] Buckets MinIO crees
- [ ] Health checks repondent correctement
- [ ] Swagger UI accessible
- [ ] Connexion authentifiee fonctionnelle

[Image: Checklist post-installation avec indicateurs de statut]

---

## Annexes

### A. Depannage

#### Probleme : PostgreSQL ne demarre pas

```bash
# Verifier les logs
docker logs ireg-postgres

# Verifier les permissions du volume
docker exec ireg-postgres ls -la /var/lib/postgresql/data

# Reinitialiser (perte de donnees)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

#### Probleme : Redis connection refused

```bash
# Verifier le statut
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping

# Si PONG n'est pas retourne
docker-compose -f docker-compose.dev.yml restart redis
```

#### Probleme : Migrations en echec

```bash
# Verifier l'etat
npx typeorm migration:show -d src/config/data-source.ts

# Reinitialiser (developpement uniquement)
npx typeorm schema:drop -d src/config/data-source.ts
npx typeorm migration:run -d src/config/data-source.ts
npm run seed
```

### B. Commandes utiles

```bash
# Logs en temps reel
docker-compose -f docker-compose.dev.yml logs -f backend

# Shell dans un container
docker-compose -f docker-compose.dev.yml exec backend sh

# Redemarrer un service
docker-compose -f docker-compose.dev.yml restart backend

# Mettre a jour les images
docker-compose -f docker-compose.dev.yml pull
docker-compose -f docker-compose.dev.yml up -d
```

### C. Mise a jour de l'application

```bash
# 1. Recuperer les derniers changements
git pull origin main

# 2. Mettre a jour les dependances
cd backend && npm install
cd ../frontend && npm install

# 3. Executer les nouvelles migrations
cd ../backend
npx typeorm migration:run -d src/config/data-source.ts

# 4. Redemarrer
docker-compose -f docker-compose.dev.yml restart
```

---

> **Support technique** : tech@ireg-moto.bf
> **Documentation API** : http://localhost:3000/api/docs (apres installation)
