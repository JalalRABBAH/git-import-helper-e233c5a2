# Guide de Deploiement — iReg Moto BF

Ce document presente les procedures de deploiement de la plateforme iReg Moto BF, de l'environnement de developpement local a la production Kubernetes en passant par le staging.

---

## Table des matieres

1. [Prerequis](#1-prerequis)
2. [Deploiement Docker Compose (Developpement)](#2-deploiement-docker-compose-developpement)
3. [Deploiement Kubernetes (Production)](#3-deploiement-kubernetes-production)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [SSL et Let's Encrypt](#5-ssl-et-lets-encrypt)
6. [Monitoring](#6-monitoring)
7. [Backup et Restore](#7-backup-et-restore)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequis

### 1.1 Materiel

| Environnement | CPU | RAM | Disque | Reseau |
|---|---|---|---|---|
| **Developpement (local)** | 4 cores | 8 Go | 50 Go SSD | 10 Mbps |
| **Staging** | 4 cores | 8 Go | 100 Go SSD | 100 Mbps |
| **Production (minimum)** | 8 cores | 16 Go | 200 Go SSD | 1 Gbps |
| **Production (recommande)** | 16 cores | 32 Go | 500 Go SSD | 1 Gbps |

### 1.2 Logiciels

| Composant | Version minimum | Verification |
|---|---|---|
| Docker Engine | 24.0.0 | `docker --version` |
| Docker Compose | 2.20.0 | `docker compose version` |
| Kubernetes (kubectl) | 1.28.0 | `kubectl version --client` |
| Helm | 3.13.0 | `helm version` |
| Git | 2.40.0 | `git --version` |
| OpenSSL | 3.0.0 | `openssl version` |

### 1.3 Acces requis

| Ressource | Description |
|---|---|
| Registry Docker | Acces au registry prive (`registry.ireg-moto-bf.gov.bf`) |
| Repository Git | Acces en lecture au repository `gouv-bf/ireg-moto-bf` |
| Serveurs cibles | Acces SSH aux noeuds Kubernetes |
| DNS | Gestion des enregistrements DNS pour les domaines |
| Cloud provider | Acces au compte cloud (si applicable) |

---

## 2. Deploiement Docker Compose (Developpement)

### 2.1 Architecture Docker Compose dev

```
+--------------------------------------------------------------+
|                    DOCKER COMPOSE DEV                         |
|                                                               |
|  +------------------+  +------------------+  +-------------+ |
|  |  frontend-entre  |  |  frontend-autorite|  |   backend   | |
|  |  Port : 3001     |  |  Port : 3002     |  |  Port : 3000| |
|  |  React + Vite    |  |  React + Vite    |  |  NestJS     | |
|  +--------+---------+  +--------+---------+  +------+------+ |
|           |                     |                    |        |
|           +----------+----------+--------------------+        |
|                      |                                        |
|           +----------v----------+  +------------------+      |
|           |    traefik :80/443  |  |   redis :6379    |      |
|           |    (reverse proxy)  |  |   (cache/queues) |      |
|           +----------+----------+  +------------------+      |
|                      |                                        |
|           +----------v----------+  +------------------+      |
|           |  postgres :5432     |  |  minio :9000/9001|      |
|           |  (PostgreSQL 15)    |  |  (stockage S3)   |      |
|           +---------------------+  +------------------+      |
|                                                               |
|  +------------------+  +------------------+                  |
|  |  mailhog :8025   |  |  prometheus :9090|                  |
|  |  (capture email) |  |  (metriques)     |                  |
|  +------------------+  +------------------+                  |
|                                                               |
+--------------------------------------------------------------+
```

### 2.2 Procedure d'installation

**Etape 1 — Cloner le repository**

```bash
git clone https://github.com/gouv-bf/ireg-moto-bf.git
cd ireg-moto-bf
```

**Etape 2 — Configurer les variables d'environnement**

```bash
cp .env.example .env
```

Editer le fichier `.env` avec les valeurs appropriees (voir section 4).

**Etape 3 — Lancer la stack**

```bash
# Premier lancement (construit les images)
docker compose -f docker-compose.yml up -d --build

# Lancements ulterieurs (images deja construites)
docker compose -f docker-compose.yml up -d
```

**Etape 4 — Executer les migrations**

```bash
# Attendre que PostgreSQL soit pret (verification)
docker compose exec postgres pg_isready -U ireg_user

# Executer les migrations
docker compose exec backend npm run migration:run
```

**Etape 5 — Charger les donnees de seed**

```bash
# Charger les donnees de reference et les comptes de test
docker compose exec backend npm run seed:all
```

**Etape 6 — Verifier l'etat des services**

```bash
# Etat des conteneurs
docker compose ps

# Logs en temps reel
docker compose logs -f --tail=100

# Logs d'un service specifique
docker compose logs -f backend
docker compose logs -f postgres
```

### 2.3 Services et ports exposes

| Service | URL locale | Description |
|---|---|---|
| Application Entreprises | `https://entreprise.localhost` | Portail entreprises |
| Application Autorites | `https://autorite.localhost` | Portail autorites |
| API Backend | `https://api.localhost` | API REST |
| Swagger UI | `https://api.localhost/docs` | Documentation API interactive |
| Traefik Dashboard | `https://traefik.localhost` | Interface Traefik |
| MailHog UI | `http://localhost:8025` | Interface de capture d'emails |
| PostgreSQL | `localhost:5432` | Base de donnees |
| Redis | `localhost:6379` | Cache et sessions |
| MinIO Console | `https://minio.localhost` | Console de gestion S3 |
| Prometheus | `http://localhost:9090` | Metriques systeme |

### 2.4 Commandes utiles

```bash
# Redemarrer un service specifique
docker compose restart backend

# Reconstruire un service apres modification du code
docker compose up -d --build backend

# Entrer dans un conteneur
docker compose exec backend bash
docker compose exec postgres psql -U ireg_user -d ireg_moto_bf

# Voir les ressources utilisees
docker stats

# Arreter tous les services
docker compose down

# Arreter et supprimer les volumes (PERTE DE DONNEES)
docker compose down -v

# Forcer la recreation des conteneurs
docker compose up -d --force-recreate
```

### 2.5 Fichier docker-compose.yml (reference)

```yaml
version: '3.8'

services:
  # --- PostgreSQL ---
  postgres:
    image: postgres:15-alpine
    container_name: ireg-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-ireg_moto_bf}
      POSTGRES_USER: ${DB_USER:-ireg_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-ireg_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/src/database/migrations:/docker-entrypoint-initdb.d/migrations
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-ireg_user} -d ${DB_NAME:-ireg_moto_bf}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ireg-network

  # --- Redis ---
  redis:
    image: redis:7-alpine
    container_name: ireg-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ireg-network

  # --- MinIO (S3) ---
  minio:
    image: minio/minio:RELEASE.2024-latest
    container_name: ireg-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:-minioadmin}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - ireg-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

  # --- Backend API ---
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/backend.Dockerfile
      target: development
    container_name: ireg-backend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-ireg_moto_bf}
      DB_USER: ${DB_USER:-ireg_user}
      DB_PASSWORD: ${DB_PASSWORD:-ireg_password}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:-}
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY:-minioadmin}
      JWT_SECRET: ${JWT_SECRET:-dev-secret-change-in-production}
    volumes:
      - ./backend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    networks:
      - ireg-network

  # --- Frontend Entreprises ---
  frontend-enterprise:
    build:
      context: ./frontend-enterprise
      dockerfile: ../docker/frontend-enterprise.Dockerfile
      target: development
    container_name: ireg-frontend-enterprise
    restart: unless-stopped
    environment:
      VITE_API_URL: https://api.localhost
    volumes:
      - ./frontend-enterprise:/app
      - /app/node_modules
    networks:
      - ireg-network

  # --- Frontend Autorites ---
  frontend-autorite:
    build:
      context: ./frontend-autorite
      dockerfile: ../docker/frontend-autorite.Dockerfile
      target: development
    container_name: ireg-frontend-autorite
    restart: unless-stopped
    environment:
      VITE_API_URL: https://api.localhost
    volumes:
      - ./frontend-autorite:/app
      - /app/node_modules
    networks:
      - ireg-network

  # --- Traefik (Reverse Proxy) ---
  traefik:
    image: traefik:v3.0
    container_name: ireg-traefik
    restart: unless-stopped
    command:
      - "--api.insecure=true"
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--entrypoints.web.http.redirections.entryPoint.to=websecure"
      - "--entrypoints.web.http.redirections.entryPoint.scheme=https"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL:-admin@ireg-moto-bf.gov.bf}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--log.level=INFO"
      - "--accesslog=true"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt_data:/letsencrypt
    networks:
      - ireg-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.localhost`)"
      - "traefik.http.routers.traefik.service=api@internal"
      - "traefik.http.routers.traefik.tls=true"

  # --- MailHog (capture emails dev) ---
  mailhog:
    image: mailhog/mailhog:latest
    container_name: ireg-mailhog
    restart: unless-stopped
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - ireg-network

  # --- Prometheus ---
  prometheus:
    image: prom/prometheus:v2.48
    container_name: ireg-prometheus
    restart: unless-stopped
    volumes:
      - ./docker/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - ireg-network

volumes:
  postgres_data:
  redis_data:
  minio_data:
  letsencrypt_data:
  prometheus_data:

networks:
  ireg-network:
    driver: bridge
```

---

## 3. Deploiement Kubernetes (Production)

### 3.1 Architecture Kubernetes production

```
+------------------------------------------------------------------+
|                     KUBERNETES CLUSTER                           |
|                                                                  |
|  +----------------------------------------------------------+   |
|  |  INGRESS CONTROLLER (Traefik)                             |   |
|  |  - TLS termination  - Rate limiting  - WAF rules          |   |
|  +--------+---------+----------------+----------+----------+   |
|           |                   |                |                |
|  +--------v-----+  +----------v--------+  +----v----------+    |
|  |  Frontend    |  |  Frontend Autorite|  |  Backend API  |    |
|  |  Entreprises |  |                   |  |  (3 replicas) |    |
|  |  (2 replicas)|  |  (2 replicas)     |  |               |    |
|  +--------------+  +-------------------+  +-------+-------+    |
|                                                  |               |
|  +------------------+  +-----------------+  +----v--------+     |
|  |  PostgreSQL      |  |  Redis Cluster  |  |  MinIO      |     |
|  |  (StatefulSet)   |  |  (3 masters)    |  |  (4 nodes)  |     |
|  |  + replication   |  |  + replication  |  |             |     |
|  +------------------+  +-----------------+  +-------------+     |
|                                                                  |
|  +------------------+  +-----------------+  +-------------+     |
|  |  Prometheus      |  |  Grafana        |  |  ELK Stack  |     |
|  |  (monitoring)    |  |  (dashboards)   |  |  (logs)     |     |
|  +------------------+  +-----------------+  +-------------+     |
|                                                                  |
|  +------------------+  +----------------------------------+     |
|  |  Cert-Manager    |  |  Vault (secrets)                 |     |
|  |  (Let's Encrypt) |  |                                  |     |
|  +------------------+  +----------------------------------+     |
|                                                                  |
+------------------------------------------------------------------+
```

### 3.2 Prerequis Kubernetes

```bash
# Verifier la connexion au cluster
kubectl cluster-info

# Verifier les noeuds disponibles
kubectl get nodes

# Creer les namespaces
kubectl apply -f kubernetes/namespace.yml
```

### 3.3 Fichier namespace.yml

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ireg-moto-bf
  labels:
    app: ireg-moto-bf
    env: production
---
apiVersion: v1
kind: Namespace
metadata:
  name: ireg-moto-bf-monitoring
  labels:
    app: ireg-moto-bf
    component: monitoring
```

### 3.4 Secrets et ConfigMaps

**Etape 1 — Creer les secrets**

```bash
# Encoder les valeurs sensibles en base64
echo -n 'votre_mot_de_passe_postgres' | base64
echo -n 'votre_secret_jwt' | base64
echo -n 'votre_mfa_secret' | base64

# Appliquer les secrets
kubectl apply -f kubernetes/secret.yml
```

**Fichier secret.yml** :

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ireg-backend-secrets
  namespace: ireg-moto-bf
type: Opaque
data:
  DB_PASSWORD: cG9zdGdyZXNfcGFzc3dvcmQ=
  JWT_SECRET: eW91cl9qd3Rfc2VjcmV0X2hlcmU=
  REDIS_PASSWORD: cmVkaXNfcGFzc3dvcmQ=
  MINIO_SECRET_KEY: bWluaW9fc2VjcmV0X2tleQ==
  SMTP_PASSWORD: c210cF9wYXNzd29yZA==
  SMS_AUTH_TOKEN: c21zX2F1dGhfdG9rZW4=
---
apiVersion: v1
kind: Secret
metadata:
  name: ireg-tls
  namespace: ireg-moto-bf
type: kubernetes.io/tls
data:
  tls.crt: ""  # Cert-manager remplit automatiquement
  tls.key: ""
```

**Etape 2 — Appliquer les ConfigMaps**

```bash
kubectl apply -f kubernetes/configmap.yml
```

**Fichier configmap.yml** :

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ireg-backend-config
  namespace: ireg-moto-bf
data:
  NODE_ENV: "production"
  APP_PORT: "3000"
  APP_URL: "https://api.ireg-moto-bf.gov.bf"
  FRONTEND_ENTERPRISE_URL: "https://entreprise.ireg-moto-bf.gov.bf"
  FRONTEND_AUTORITY_URL: "https://autorite.ireg-moto-bf.gov.bf"
  DB_HOST: "postgres.ireg-moto-bf.svc.cluster.local"
  DB_PORT: "5432"
  DB_NAME: "ireg_moto_bf"
  DB_USER: "ireg_user"
  DB_SSL: "true"
  REDIS_HOST: "redis.ireg-moto-bf.svc.cluster.local"
  REDIS_PORT: "6379"
  MINIO_ENDPOINT: "minio.ireg-moto-bf.svc.cluster.local"
  MINIO_PORT: "9000"
  MINIO_BUCKET: "ireg-moto-documents"
  MINIO_USE_SSL: "true"
  MFA_ISSUER: "iRegMotoBF"
  MFA_ENABLED: "true"
  SMTP_HOST: "smtp.votredomaine.bf"
  SMTP_PORT: "587"
  SMTP_USER: "noreply@ireg-moto-bf.gov.bf"
  SMTP_FROM: "iReg Moto BF <noreply@ireg-moto-bf.gov.bf>"
  SMS_PROVIDER: "twilio"
  SMS_FROM_NUMBER: "+226XXXXXXXX"
  LOG_LEVEL: "info"
  LOG_FORMAT: "json"
  RATE_LIMIT_WINDOW_MS: "60000"
  RATE_LIMIT_MAX_REQUESTS: "100"
```

### 3.5 Deploiement PostgreSQL (StatefulSet)

```bash
kubectl apply -f kubernetes/postgres/
```

**Fichier postgres/statefulset.yml** :

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: ireg-moto-bf
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              valueFrom:
                configMapKeyRef:
                  name: ireg-backend-config
                  key: DB_NAME
            - name: POSTGRES_USER
              valueFrom:
                configMapKeyRef:
                  name: ireg-backend-config
                  key: DB_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: ireg-backend-secrets
                  key: DB_PASSWORD
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "2Gi"
              cpu: "1000m"
          livenessProbe:
            exec:
              command:
                - pg_isready
                - -U
                - ireg_user
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            exec:
              command:
                - pg_isready
                - -U
                - ireg_user
            initialDelaySeconds: 5
            periodSeconds: 5
  volumeClaimTemplates:
    - metadata:
        name: postgres-storage
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 50Gi
```

### 3.6 Deploiement Redis

```bash
kubectl apply -f kubernetes/redis/
```

### 3.7 Deploiement Backend

```bash
# Construire et pousser l'image
docker build -t registry.ireg-moto-bf.gov.bf/ireg-backend:v1.0.0 -f docker/backend.Dockerfile ./backend
docker push registry.ireg-moto-bf.gov.bf/ireg-backend:v1.0.0

# Appliquer le deploiement
kubectl apply -f kubernetes/backend/
```

**Fichier backend/deployment.yml** :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ireg-backend
  namespace: ireg-moto-bf
  labels:
    app: ireg-backend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ireg-backend
  template:
    metadata:
      labels:
        app: ireg-backend
    spec:
      containers:
        - name: backend
          image: registry.ireg-moto-bf.gov.bf/ireg-backend:v1.0.0
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: ireg-backend-config
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: ireg-backend-secrets
                  key: DB_PASSWORD
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: ireg-backend-secrets
                  key: JWT_SECRET
            - name: REDIS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: ireg-backend-secrets
                  key: REDIS_PASSWORD
            - name: MINIO_SECRET_KEY
              valueFrom:
                secretKeyRef:
                  name: ireg-backend-secrets
                  key: MINIO_SECRET_KEY
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /health/live
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ireg-backend
  namespace: ireg-moto-bf
spec:
  selector:
    app: ireg-backend
  ports:
    - port: 3000
      targetPort: 3000
  type: ClusterIP
```

### 3.8 Deploiement des Frontends

```bash
# Construire et pousser les images
docker build -t registry.ireg-moto-bf.gov.bf/ireg-frontend-enterprise:v1.0.0 -f docker/frontend-enterprise.Dockerfile ./frontend-enterprise
docker push registry.ireg-moto-bf.gov.bf/ireg-frontend-enterprise:v1.0.0

docker build -t registry.ireg-moto-bf.gov.bf/ireg-frontend-autorite:v1.0.0 -f docker/frontend-autorite.Dockerfile ./frontend-autorite
docker push registry.ireg-moto-bf.gov.bf/ireg-frontend-autorite:v1.0.0

# Appliquer les deploiements
kubectl apply -f kubernetes/frontend-enterprise/
kubectl apply -f kubernetes/frontend-autorite/
```

### 3.9 Ingress et certificats TLS

```bash
# Installer cert-manager (si non installe)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Appliquer les certificats et ingress
kubectl apply -f kubernetes/traefik/certificate.yml
kubectl apply -f kubernetes/traefik/ingress.yml
```

**Fichier traefik/ingress.yml** :

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ireg-ingress
  namespace: ireg-moto-bf
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
    traefik.ingress.kubernetes.io/router.tls: "true"
    traefik.ingress.kubernetes.io/router.tls.certresolver: letsencrypt
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    traefik.ingress.kubernetes.io/router.middlewares: "ireg-moto-bf-rate-limit@kubernetescrd"
spec:
  tls:
    - hosts:
        - api.ireg-moto-bf.gov.bf
        - entreprise.ireg-moto-bf.gov.bf
        - autorite.ireg-moto-bf.gov.bf
      secretName: ireg-tls
  rules:
    - host: api.ireg-moto-bf.gov.bf
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ireg-backend
                port:
                  number: 3000
    - host: entreprise.ireg-moto-bf.gov.bf
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ireg-frontend-enterprise
                port:
                  number: 80
    - host: autorite.ireg-moto-bf.gov.bf
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ireg-frontend-autorite
                port:
                  number: 80
```

### 3.10 Migrations en production

```bash
# Executer les migrations (job Kubernetes)
kubectl apply -f kubernetes/backend/migration-job.yml

# Verifier le statut du job
kubectl get jobs -n ireg-moto-bf
kubectl logs job/ireg-migration -n ireg-moto-bf

# Si le job reussit, supprimer le job
kubectl delete job ireg-migration -n ireg-moto-bf
```

### 3.11 Verifier le deploiement

```bash
# Lister tous les pods
kubectl get pods -n ireg-moto-bf

# Verifier les services
kubectl get svc -n ireg-moto-bf

# Verifier les ingress
kubectl get ingress -n ireg-moto-bf

# Verifier les certificats
kubectl get certificates -n ireg-moto-bf

# Logs d'un pod specifique
kubectl logs -f deployment/ireg-backend -n ireg-moto-bf

# Shell dans un pod
kubectl exec -it deployment/ireg-backend -n ireg-moto-bf -- /bin/sh
```

### 3.12 Mise a jour (rolling update)

```bash
# Mettre a jour l'image du backend
kubectl set image deployment/ireg-backend backend=registry.ireg-moto-bf.gov.bf/ireg-backend:v1.0.1 -n ireg-moto-bf

# Surveiller le rolling update
kubectl rollout status deployment/ireg-backend -n ireg-moto-bf

# En cas de probleme, rollback
kubectl rollout undo deployment/ireg-backend -n ireg-moto-bf

# Historique des revisions
kubectl rollout history deployment/ireg-backend -n ireg-moto-bf
```

---

## 4. Variables d'environnement

### 4.1 Table complete des variables

| Variable | Obligatoire | Defaut | Description |
|---|---|---|---|
| `NODE_ENV` | Oui | `development` | Environnement (`development`, `staging`, `production`) |
| `APP_PORT` | Oui | `3000` | Port d'ecoute du backend |
| `APP_URL` | Oui | — | URL publique de l'API |
| `FRONTEND_ENTERPRISE_URL` | Oui | — | URL de l'app entreprises |
| `FRONTEND_AUTORITY_URL` | Oui | — | URL de l'app autorites |
| `DB_HOST` | Oui | `postgres` | Hote PostgreSQL |
| `DB_PORT` | Oui | `5432` | Port PostgreSQL |
| `DB_NAME` | Oui | `ireg_moto_bf` | Nom de la base |
| `DB_USER` | Oui | `ireg_user` | Utilisateur PostgreSQL |
| `DB_PASSWORD` | Oui | — | Mot de passe PostgreSQL |
| `DB_SSL` | Non | `false` | SSL pour PostgreSQL |
| `REDIS_HOST` | Oui | `redis` | Hote Redis |
| `REDIS_PORT` | Oui | `6379` | Port Redis |
| `REDIS_PASSWORD` | Non | — | Mot de passe Redis |
| `JWT_SECRET` | Oui | — | Secret JWT (min 64 caracteres) |
| `JWT_EXPIRATION` | Non | `15m` | Duree de validite du token |
| `JWT_REFRESH_EXPIRATION` | Non | `7d` | Duree du refresh token |
| `MFA_ISSUER` | Non | `iRegMotoBF` | Nom de l'emetteur MFA |
| `MFA_ENABLED` | Non | `true` | Activation MFA |
| `MINIO_ENDPOINT` | Oui | `minio` | Hote MinIO |
| `MINIO_PORT` | Oui | `9000` | Port MinIO |
| `MINIO_ACCESS_KEY` | Oui | — | Cle d'acces MinIO |
| `MINIO_SECRET_KEY` | Oui | — | Cle secrete MinIO |
| `MINIO_BUCKET` | Non | `ireg-moto-documents` | Bucket par defaut |
| `MINIO_USE_SSL` | Non | `false` | SSL pour MinIO |
| `SMTP_HOST` | Oui (prod) | — | Serveur SMTP |
| `SMTP_PORT` | Non | `587` | Port SMTP |
| `SMTP_USER` | Oui (prod) | — | Utilisateur SMTP |
| `SMTP_PASSWORD` | Oui (prod) | — | Mot de passe SMTP |
| `SMTP_FROM` | Oui (prod) | — | Adresse d'expedition |
| `SMS_PROVIDER` | Non | — | Fournisseur SMS |
| `SMS_ACCOUNT_SID` | Non | — | SID compte SMS |
| `SMS_AUTH_TOKEN` | Non | — | Token SMS |
| `SMS_FROM_NUMBER` | Non | — | Numero d'expedition |
| `LOG_LEVEL` | Non | `info` | Niveau de log |
| `LOG_FORMAT` | Non | `json` | Format (`json`, `pretty`) |
| `RATE_LIMIT_WINDOW_MS` | Non | `60000` | Fenetre rate limit (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | Non | `100` | Max requetes par fenetre |

### 4.2 Variables par environnement

#### Developpement (.env.development)

```env
NODE_ENV=development
DB_SSL=false
MINIO_USE_SSL=false
MFA_ENABLED=true
LOG_FORMAT=pretty
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=1000
```

#### Production (.env.production)

```env
NODE_ENV=production
DB_SSL=true
MINIO_USE_SSL=true
MFA_ENABLED=true
LOG_FORMAT=json
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 5. SSL et Let's Encrypt

### 5.1 Configuration Let's Encrypt

**Etape 1 — Installer cert-manager**

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Verifier l'installation
kubectl get pods -n cert-manager
```

**Etape 2 — Creer le ClusterIssuer**

```bash
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@ireg-moto-bf.gov.bf
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: traefik
EOF
```

**Etape 3 — Verifier les certificats**

```bash
# Lister les certificats
kubectl get certificates -n ireg-moto-bf

# Details d'un certificat
kubectl describe certificate ireg-tls -n ireg-moto-bf

# Verifier la validite SSL
openssl s_client -connect api.ireg-moto-bf.gov.bf:443 -servername api.ireg-moto-bf.gov.bf
```

### 5.2 Renouvellement automatique

Les certificats Let's Encrypt sont valides 90 jours. Cert-manager renouvelle automatiquement les certificats 30 jours avant expiration.

```bash
# Forcer le renouvellement (test)
kubectl cert-manager renew ireg-tls -n ireg-moto-bf

# Verifier la date d'expiration
echo | openssl s_client -servername api.ireg-moto-bf.gov.bf -connect api.ireg-moto-bf.gov.bf:443 2>/dev/null | openssl x509 -noout -dates
```

### 5.3 Certificat personnalise (optionnel)

Si vous utilisez un certificat delivre par une autorite commerciale :

```bash
# Creer le secret TLS manuellement
kubectl create secret tls ireg-tls-custom \
  --cert=certificat.crt \
  --key=cle-privee.key \
  -n ireg-moto-bf
```

---

## 6. Monitoring

### 6.1 Stack de monitoring

| Composant | Role | URL |
|---|---|---|
| **Prometheus** | Collecte des metriques | `http://prometheus.ireg-moto-bf.gov.bf` |
| **Grafana** | Dashboards de visualisation | `https://grafana.ireg-moto-bf.gov.bf` |
| **AlertManager** | Gestion des alertes | Integre a Prometheus |
| **Loki** | Agregation des logs | `http://loki.ireg-moto-bf.gov.bf` |

### 6.2 Installation de Prometheus

```bash
# Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Installation
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace ireg-moto-bf-monitoring \
  --create-namespace \
  --set grafana.enabled=true \
  --set grafana.adminPassword='votre_mot_de_passe_grafana'
```

### 6.3 Metriques cles a surveiller

| Metrique | Seuil d'alerte | Description |
|---|---|---|
| `ireg_api_requests_total` | — | Nombre total de requetes |
| `ireg_api_request_duration_seconds` | P95 > 500ms | Latence des requetes |
| `ireg_api_errors_total` | Taux > 1% | Taux d'erreur |
| `ireg_active_users` | — | Utilisateurs actifs |
| `ireg_sales_total` | — | Ventes enregistrees |
| `container_cpu_usage` | > 80% | CPU conteneurs |
| `container_memory_usage` | > 85% | Memoire conteneurs |
| `postgres_connections_active` | > 80 | Connexions PostgreSQL |
| `redis_memory_used_bytes` | > 80% | Memoire Redis |
| `node_disk_io_time` | > 90% | I/O disque |

### 6.4 Regles d'alerte (Prometheus)

```yaml
groups:
  - name: ireg-alerts
    rules:
      - alert: BackendHighErrorRate
        expr: rate(ireg_api_errors_total[5m]) / rate(ireg_api_requests_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Taux d'erreur eleve sur l'API"
          description: "Le taux d'erreur est de {{ $value }}% sur les 5 dernieres minutes"

      - alert: BackendHighLatency
        expr: histogram_quantile(0.95, rate(ireg_api_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Latence elevee sur l'API"
          description: "P95 de latence : {{ $value }}s"

      - alert: DatabaseConnectionsHigh
        expr: postgres_connections_active / postgres_connections_max > 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Connexions PostgreSQL elevees"
          description: "{{ $value }}% des connexions utilisees"

      - alert: SSLCertificateExpiringSoon
        expr: (certmanager_certificate_expiration_timestamp_seconds - time()) / 86400 < 15
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Certificat SSL expirant bientot"
          description: "Le certificat expire dans {{ $value }} jours"
```

### 6.5 Dashboards Grafana recommandes

| Dashboard | ID Grafana | Description |
|---|---|---|
| **API Overview** | Custom | Requetes, latence, erreurs, utilisateurs |
| **Node Exporter** | 1860 | Ressources systeme (CPU, memoire, disque) |
| **PostgreSQL** | 9628 | Metriques base de donnees |
| **Redis** | 763 | Metriques Redis |
| **Kubernetes Cluster** | 7249 | Ressources cluster K8s |

---

## 7. Backup et Restore

### 7.1 Strategie de sauvegarde

| Composant | Frequence | Retention | Methode |
|---|---|---|---|
| PostgreSQL | Quotidienne (02:00 UTC) | 30 jours | `pg_dump` + compression |
| PostgreSQL | Hebdomadaire (dimanche) | 12 semaines | `pg_dump` complet |
| MinIO (documents) | Quotidienne | 30 jours | `mc mirror` |
| Redis | Quotidienne | 7 jours | `BGSAVE` + RDB |
| Configurations K8s | A chaque changement | Illimitee | Git + `kubectl get` |

### 7.2 Script de backup PostgreSQL

```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Variables
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ireg_moto_bf"
RETENTION_DAYS=30

# Creer le repertoire de backup
mkdir -p "$BACKUP_DIR"

# Backup avec pg_dump
echo "[$(date)] Demarrage du backup PostgreSQL..."
docker compose exec -T postgres pg_dump -U ireg_user -d "$DB_NAME" \
  --format=custom \
  --verbose \
  > "$BACKUP_DIR/backup_${DB_NAME}_${DATE}.dump"

# Compression
echo "[$(date)] Compression du backup..."
gzip "$BACKUP_DIR/backup_${DB_NAME}_${DATE}.dump"

# Verification
echo "[$(date)] Verification de l'integrite..."
gunzip -t "$BACKUP_DIR/backup_${DB_NAME}_${DATE}.dump.gz"

# Suppression des anciens backups
echo "[$(date)] Suppression des backups de plus de ${RETENTION_DAYS} jours..."
find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.dump.gz" -mtime +$RETENTION_DAYS -delete

# Upload vers stockage distant (optionnel)
# aws s3 cp "$BACKUP_DIR/backup_${DB_NAME}_${DATE}.dump.gz" s3://ireg-moto-bf-backups/

echo "[$(date)] Backup termine : backup_${DB_NAME}_${DATE}.dump.gz"
echo "[$(date)] Taille : $(du -h "$BACKUP_DIR/backup_${DB_NAME}_${DATE}.dump.gz" | cut -f1)"
```

### 7.3 Script de restore PostgreSQL

```bash
#!/bin/bash
# scripts/restore.sh

set -e

# Variables
BACKUP_DIR="/backups/postgres"
DB_NAME="ireg_moto_bf"

# Lister les backups disponibles
echo "Backups disponibles :"
ls -lt "$BACKUP_DIR"/backup_${DB_NAME}_*.dump.gz 2>/dev/null | head -20

# Demander le fichier a restaurer
read -p "Nom du fichier de backup a restaurer : " BACKUP_FILE

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "Erreur : Fichier non trouve"
    exit 1
fi

echo ""
echo "ATTENTION : Cette operation va ecraser la base de donnees actuelle !"
read -p "Tapez 'RESTAURER' pour confirmer : " CONFIRM

if [ "$CONFIRM" != "RESTAURER" ]; then
    echo "Restauration annulee."
    exit 0
fi

# Decompresser
echo "[$(date)] Decompression du backup..."
gunzip -c "$BACKUP_DIR/$BACKUP_FILE" > "/tmp/restore_${DB_NAME}.dump"

# Restaurer
echo "[$(date)] Restauration de la base de donnees..."
docker compose exec -T postgres pg_restore \
  -U ireg_user \
  -d "$DB_NAME" \
  --clean \
  --if-exists \
  --verbose \
  < "/tmp/restore_${DB_NAME}.dump"

# Netoyer
rm -f "/tmp/restore_${DB_NAME}.dump"

echo "[$(date)] Restauration terminee avec succes !"
```

### 7.4 Backup MinIO (documents)

```bash
#!/bin/bash
# Backup des documents MinIO

echo "[$(date)] Backup des documents MinIO..."

# Utiliser mc (MinIO Client)
mc mirror --overwrite \
  minio/ireg-moto-documents \
  /backups/minio/ireg-moto-documents-$(date +%Y%m%d)

# Compression et rotation
tar czf "/backups/minio/minio_backup_$(date +%Y%m%d).tar.gz" \
  -C /backups/minio "ireg-moto-documents-$(date +%Y%m%d)"

rm -rf "/backups/minio/ireg-moto-documents-$(date +%Y%m%d)"

# Suppression des anciens backups
find /backups/minio -name "minio_backup_*.tar.gz" -mtime +30 -delete

echo "[$(date)] Backup MinIO termine"
```

### 7.5 Cron jobs (programmation automatique)

```bash
# Editer le crontab
crontab -e

# Ajouter les lignes suivantes :
# Backup PostgreSQL quotidien a 02:00
0 2 * * * /opt/ireg-moto-bf/scripts/backup.sh >> /var/log/ireg/backup.log 2>&1

# Backup MinIO quotidien a 03:00
0 3 * * * /opt/ireg-moto-bf/scripts/backup-minio.sh >> /var/log/ireg/backup-minio.log 2>&1

# Verification des certificats SSL (tous les lundis a 09:00)
0 9 * * 1 /opt/ireg-moto-bf/scripts/check-ssl.sh >> /var/log/ireg/ssl-check.log 2>&1

# Nettoyage des logs (tous les jours a 04:00)
0 4 * * * find /var/log/ireg -name "*.log" -mtime +30 -delete
```

---

## 8. Troubleshooting

### 8.1 Problemes courants

| Symptome | Cause probable | Solution |
|---|---|---|
| **Backend ne demarre pas** | PostgreSQL ou Redis non pret | Verifier `docker compose ps`, attendre que les services soient healthy |
| **Erreur 502 Bad Gateway** | Backend down ou Traefik mal configure | Verifier les logs backend, verifier les labels Traefik |
| **Erreur 503 Service Unavailable** | Pods Kubernetes en CrashLoopBackOff | `kubectl describe pod`, verifier les ressources et les logs |
| **Migrations echouent** | Schema existant incompatible | Backup, suppression du schema, re-execution des migrations |
| **Emails non envoyes** | SMTP mal configure ou MailHog en dev | Verifier les variables SMTP, consulter MailHog en dev |
| **QR codes non generes** | MinIO inaccessible | Verifier la connexion MinIO, les credentials |
| **Latence elevee** | CPU ou memoire insuffisants | Augmenter les ressources, verifier les requetes lentes PostgreSQL |
| **Sessions expirent rapidement** | Horloge desynchronisee | Synchroniser NTP sur tous les noeuds |
| **Certificat SSL invalide** | Cert-manager non fonctionnel | Verifier cert-manager, forcer le renouvellement |
| **Fuite memoire** | Cache non invalide | Verifier Redis, augmenter les limites memoire |

### 8.2 Commandes de diagnostic

```bash
# Verifier l'etat des services (Docker)
docker compose ps
docker compose logs --tail=100 backend

# Verifier les pods (Kubernetes)
kubectl get pods -n ireg-moto-bf
kubectl describe pod <pod-name> -n ireg-moto-bf
kubectl logs -f <pod-name> -n ireg-moto-bf

# Verifier les ressources
kubectl top nodes
kubectl top pods -n ireg-moto-bf

# Verifier la base de donnees
docker compose exec postgres psql -U ireg_user -d ireg_moto_bf -c "\dt"
docker compose exec postgres psql -U ireg_user -d ireg_moto_bbf -c "SELECT COUNT(*) FROM vehicle;"

# Verifier Redis
docker compose exec redis redis-cli info

# Verifier les certificats
echo | openssl s_client -connect api.ireg-moto-bf.gov.bf:443 2>/dev/null | openssl x509 -noout -text

# Tracer une requete HTTP
curl -v -H "Authorization: Bearer <token>" https://api.ireg-moto-bf.gov.bf/api/v1/health
```

### 8.3 Health checks

L'API expose deux endpoints de sante :

```http
GET /health/live     # Liveness probe — le service est en cours d'execution
GET /health/ready    # Readiness probe — le service est pret a recevoir du trafic
```

**Reponse attendue (200 OK)** :

```json
{
  "status": "ok",
  "timestamp": "2026-06-25T10:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "minio": "connected"
  }
}
```

### 8.4 Contacts d'urgence

| Situation | Contact | Delai de reponse |
|---|---|---|
| Panne production | devops-oncall@ireg-moto-bf.gov.bf | 15 minutes |
| Probleme de securite | security@ireg-moto-bf.gov.bf | 30 minutes |
| Question generale | support@ireg-moto-bf.gov.bf | 4 heures |

---

<p align="center">
  <em>Document mis a jour le 25 juin 2026 — Version 1.0</em>
</p>
