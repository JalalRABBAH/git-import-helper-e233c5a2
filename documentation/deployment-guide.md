# iReg Moto BF — Guide de Deploiement

> **Version:** 1.0.0 | **Public cible:** DevOps, equipe infrastructure, administrateurs systeme

---

## Table des matieres

1. [Deploiement Docker Compose](#1-deploiement-docker-compose)
2. [Deploiement Kubernetes](#2-deploiement-kubernetes)
3. [CI/CD GitHub Actions](#3-cicd-github-actions)
4. [Monitoring et alerting](#4-monitoring-et-alerting)
5. [Backup et restore](#5-backup-et-restore)
6. [Scaling](#6-scaling)

---

## 1. Deploiement Docker Compose

### 1.1 Vue d'ensemble

Le deploiement Docker Compose est recommande pour :
- Les environnements de developpement
- Les deploiements de petite taille (< 100 utilisateurs)
- Les environnements de demonstration
- Les premiers tests en production (phase pilote)

### 1.2 Architecture Docker Compose

```
+------------------------------------------------------------------+
|                    Docker Compose Production                      |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  |   Nginx (reverse |  |   Backend API    |  |   Frontend PWA   | |
|  |    proxy + SSL)  |  |    (NestJS)      |  |    (React)       | |
|  |    Port: 443     |  |    Port: 3000    |  |    Port: 80      | |
|  +--------+---------+  +--------+---------+  +--------+---------+ |
|           |                     |                     |           |
|           +---------------------+---------------------+           |
|                                 |                                 |
|  +------------------+  +--------+---------+  +------------------+ |
|  |   PostgreSQL 15  |  |     Redis 7      |  |   RabbitMQ 3.12  | |
|  |   (volume pers.) |  |   (cache, sessions|  |   (messaging)    | |
|  |    Port: 5432    |  |    Port: 6379    |  |   Port: 5672     | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                   |
|  +------------------+  +------------------+                       |
|  |   MinIO (S3)     |  |  Prometheus +    |                       |
|  |   (stockage obj.)|  |  Grafana         |                       |
|  |    Port: 9000    |  |  (monitoring)    |                       |
|  +------------------+  +------------------+                       |
|                                                                   |
+------------------------------------------------------------------+
```

### 1.3 Configuration production

```bash
# 1. Cloner le repository
git clone https://github.com/drctt/ireg-moto-bf.git
cd ireg-moto-bf

# 2. Configurer les variables d'environnement
cp .env.production.example .env
# Editer .env avec les secrets de production

# 3. Construire les images
docker-compose -f docker-compose.yml build

# 4. Demarrer les services
docker-compose -f docker-compose.yml up -d

# 5. Executer les migrations
docker-compose -f docker-compose.yml exec backend npx typeorm migration:run -d dist/config/data-source.js

# 6. Charger les donnees de reference
docker-compose -f docker-compose.yml exec backend npm run seed:prod

# 7. Verifier la sante
curl https://api.ireg-moto.bf/health
```

### 1.4 docker-compose.yml (production)

```yaml
version: "3.8"

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - frontend_build:/usr/share/nginx/html:ro
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
    networks:
      - ireg-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - RABBITMQ_HOST=rabbitmq
      - S3_ENDPOINT=minio:9000
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - ireg-network
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    env_file:
      - .env
    restart: unless-stopped
    networks:
      - ireg-network
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ireg_moto_bf
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ireg_moto_bf"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - ireg-network
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - ireg-network

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - ireg-network

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - ireg-network

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    restart: unless-stopped
    networks:
      - ireg-network

  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana-dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana-datasources.yml:/etc/grafana/provisioning/datasources/datasources.yml:ro
    depends_on:
      - prometheus
    restart: unless-stopped
    networks:
      - ireg-network

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  minio_data:
  prometheus_data:
  grafana_data:
  frontend_build:

networks:
  ireg-network:
    driver: bridge
```

### 1.5 SSL/TLS avec Let's Encrypt

```bash
# Installer certbot
docker run -it --rm \
  -v $(pwd)/nginx/ssl:/etc/letsencrypt \
  -v $(pwd)/nginx/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d api.ireg-moto.bf -d app.ireg-moto.bf

# Renouvellement automatique (cron)
0 3 * * * docker run -it --rm -v $(pwd)/nginx/ssl:/etc/letsencrypt certbot/certbot renew --quiet
```

### 1.6 Mise a jour

```bash
# 1. Recuperer les derniers changements
git pull origin main

# 2. Reconstruire les images
docker-compose -f docker-compose.yml build --no-cache

# 3. Redemarrer sans coupure (rolling update)
docker-compose -f docker-compose.yml up -d

# 4. Executer les migrations si necessaire
docker-compose -f docker-compose.yml exec backend npx typeorm migration:run -d dist/config/data-source.js

# 5. Verifier
docker-compose -f docker-compose.yml ps
curl https://api.ireg-moto.bf/health
```

---

## 2. Deploiement Kubernetes

### 2.1 Vue d'ensemble

Le deploiement Kubernetes est recommande pour :
- Les environnements de production a grande echelle
- La haute disponibilite (99.9% SLA)
- Le scaling automatique
- Les deploiements zero-downtime

### 2.2 Architecture Kubernetes

```
+---------------------------------------------------------------+
|                     Cluster Kubernetes                         |
|                                                                |
|  +----------------+     +----------------+     +-----------+  |
|  |  Ingress       |     |  Namespace     |     |  Service  |  |
|  |  Controller    |---->|  ireg-moto-bf  |<----|  Mesh     |  |
|  |  (Traefik)     |     |  -prod         |     |  (Cilium) |  |
|  +----------------+     +----------------+     +-----------+  |
|                                |                               |
|         +----------------------+----------------------+       |
|         |                      |                      |       |
|         v                      v                      v       |
|  +-------------+       +-------------+       +-------------+ |
|  |  Backend    |       |  Frontend   |       |  Workers    | |
|  |  Deployment |       |  Deployment |       |  (Reporting | |
|  |  3 replicas |       |  2 replicas |       |  Compliance | |
|  |  HPA: 3-10  |       |  HPA: 2-5   |       |  Security)  | |
|  +-------------+       +-------------+       +-------------+ |
|         |                      |                      |       |
|         +----------------------+----------------------+       |
|                                |                               |
|  +-------------+  +-----------+-----------+  +-------------+  |
|  | PostgreSQL  |  |  Redis Sentinel       |  |  RabbitMQ   |  |
|  | StatefulSet |  |  3 pods               |  |  Cluster    |  |
|  | 1 primary   |  |  (1 master + 2 rep.)  |  | 3 pods      |  |
|  | 2 replicas  |  |                       |  |             |  |
|  +-------------+  +-----------------------+  +-------------+  |
|                                                                |
|  +-------------+  +-------------+  +-------------+             |
|  |  MinIO      |  |  Prometheus |  |  Grafana    |             |
|  | StatefulSet |  | + Loki      |  | + AlertMgr  |             |
|  | 4 pods      |  | + Jaeger    |  |             |             |
|  +-------------+  +-------------+  +-------------+             |
|                                                                |
+---------------------------------------------------------------+
```

### 2.3 Deploiement etape par etape

#### Etape 1 — Infrastructure de base

```bash
# Namespace
kubectl create namespace ireg-moto-bf-prod
kubectl config set-context --current --namespace=ireg-moto-bf-prod

# Secrets
kubectl apply -f infrastructure/kubernetes/secret.yaml

# ConfigMaps
kubectl apply -f infrastructure/kubernetes/configmap.yaml
```

#### Etape 2 — Bases de donnees et cache

```bash
# PostgreSQL
kubectl apply -f infrastructure/kubernetes/postgres-pvc.yaml
kubectl apply -f infrastructure/kubernetes/postgres-deployment.yaml
kubectl wait --for=condition=ready pod -l app=postgres --timeout=120s

# Redis
kubectl apply -f infrastructure/kubernetes/redis-deployment.yaml
kubectl wait --for=condition=ready pod -l app=redis --timeout=120s

# RabbitMQ
kubectl apply -f infrastructure/kubernetes/rabbitmq-deployment.yaml
kubectl wait --for=condition=ready pod -l app=rabbitmq --timeout=120s

# MinIO
kubectl apply -f infrastructure/kubernetes/minio-pvc.yaml
kubectl apply -f infrastructure/kubernetes/minio-deployment.yaml
kubectl wait --for=condition=ready pod -l app=minio --timeout=120s
```

#### Etape 3 — Application

```bash
# Backend
kubectl apply -f infrastructure/kubernetes/backend-deployment.yaml
kubectl apply -f infrastructure/kubernetes/backend-hpa.yaml

# Frontend
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml

# Ingress
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

#### Etape 4 — Monitoring

```bash
# Prometheus
kubectl apply -f infrastructure/kubernetes/prometheus-configmap.yaml
kubectl apply -f infrastructure/kubernetes/prometheus-deployment.yaml

# Grafana
kubectl apply -f infrastructure/kubernetes/grafana-deployment.yaml

# Network Policies
kubectl apply -f infrastructure/kubernetes/network-policies.yaml
```

#### Etape 5 — Migrations et seed

```bash
# Migrations
kubectl exec -it deployment/backend -- npx typeorm migration:run -d dist/config/data-source.js

# Seed
kubectl exec -it deployment/backend -- npm run seed:prod
```

### 2.4 Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: ireg-moto-bf-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

### 2.5 Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-network-policy
  namespace: ireg-moto-bf-prod
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: nginx
      ports:
        - protocol: TCP
          port: 3000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
    - to:
        - podSelector:
            matchLabels:
              app: rabbitmq
      ports:
        - protocol: TCP
          port: 5672
    - to:
        - podSelector:
            matchLabels:
              app: minio
      ports:
        - protocol: TCP
          port: 9000
```

[Image: Architecture Kubernetes complete avec flux de donnees]

---

## 3. CI/CD GitHub Actions

### 3.1 Pipeline CI

```yaml
# .github/workflows/ci.yml
name: CI — Tests et Qualite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies (backend)
        working-directory: ./backend
        run: npm ci
        
      - name: Lint
        working-directory: ./backend
        run: npm run lint
        
      - name: Type check
        working-directory: ./backend
        run: npm run typecheck
        
      - name: Unit tests
        working-directory: ./backend
        run: npm run test:cov
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
```

### 3.2 Pipeline CD — Staging

```yaml
# .github/workflows/cd-staging.yml
name: CD — Deploiement Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ghcr.io/drctt/ireg-moto-bf/backend:staging
            ghcr.io/drctt/ireg-moto-bf/backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          
      - name: Deploy to staging cluster
        run: |
          kubectl set image deployment/backend \
            backend=ghcr.io/drctt/ireg-moto-bf/backend:${{ github.sha }} \
            -n ireg-moto-bf-staging
          kubectl rollout status deployment/backend -n ireg-moto-bf-staging --timeout=300s
```

### 3.3 Pipeline CD — Production

```yaml
# .github/workflows/cd-production.yml
name: CD — Deploiement Production

on:
  release:
    types: [published]

jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3
        
      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ghcr.io/drctt/ireg-moto-bf/backend:${{ github.ref_name }}
            ghcr.io/drctt/ireg-moto-bf/backend:latest
            
      - name: Deploy to production (blue-green)
        run: |
          # Blue-green deployment
          kubectl apply -f k8s/backend-deployment-green.yaml
          kubectl rollout status deployment/backend-green -n ireg-moto-bf-prod --timeout=300s
          
          # Switch traffic
          kubectl patch service backend -p '{"spec":{"selector":{"version":"green"}}}'
          
          # Cleanup old blue
          kubectl scale deployment backend-blue --replicas=0 -n ireg-moto-bf-prod
```

### 3.4 Strategie de deploiement

| Environnement | Strategie | Declencheur | Duree |
|---------------|-----------|-------------|-------|
| Developpement | Direct | Push sur feature/* | < 5 min |
| Staging | Rolling | Push sur develop | < 10 min |
| Production | Blue-Green | Release GitHub | < 15 min |

[Image: Pipeline CI/CD avec les 3 environnements et leurs connexions]

---

## 4. Monitoring et alerting

### 4.1 Stack de monitoring

| Composant | Fonction | URL interne |
|-----------|----------|-------------|
| **Prometheus** | Collecte metriques | http://prometheus:9090 |
| **Grafana** | Visualisation | http://grafana:3000 |
| **Loki** | Agregation logs | http://loki:3100 |
| **Jaeger** | Distributed tracing | http://jaeger:16686 |
| **AlertManager** | Gestion alertes | http://alertmanager:9093 |

### 4.2 Dashboards Grafana

| Dashboard | Description | Source |
|-----------|-------------|--------|
| **API Performance** | Latence, taux d'erreur, throughput | Prometheus |
| **Infrastructure** | CPU, RAM, disque, reseau | Node Exporter |
| **Database** | Requetes lentes, connexions, locks | PostgreSQL Exporter |
| **Business Metrics** | Ventes, conformite, acteurs | Custom metrics |
| **Security** | Alertes fraude, tentatives connexion | Custom metrics |

### 4.3 Alertes principales

```yaml
# infrastructure/monitoring/alertmanager/alert-rules.yml
groups:
  - name: ireg-moto-bf
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Taux d'erreur eleve sur {{ $labels.service }}"
          description: "Taux d'erreur 5xx : {{ $value }}%"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Latence P95 elevee"
          description: "P95 : {{ $value }}s"

      - alert: DatabaseConnectionsHigh
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Connexions PostgreSQL elevees"
          description: "{{ $value }} connexions actives"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Espace disque faible sur {{ $labels.instance }}"
          description: "{{ $value | humanizePercentage }} restant"

      - alert: ComplianceScoreLow
        expr: ireg_business_compliance_score < 50
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Score de conformite faible pour {{ $labels.actor }}"
          description: "Score : {{ $value }}/100"

      - alert: SSLCertificateExpiring
        expr: (ssl_certificate_expiry_seconds - time()) / 86400 < 30
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Certificat SSL expirant dans {{ $value }} jours"
```

### 4.4 Canaux de notification

| Canal | Usage | Configuration |
|-------|-------|---------------|
| **Email** | Alertes critiques | SMTP interne |
| **SMS** | Urgences (outage) | Africa's Talking API |
| **Slack** | Alertes equipe | Webhook Slack |
| **PagerDuty** | Escalade nocturne | Integration PagerDuty |

### 4.5 Health checks

```
GET /health/live          → Liveness probe (Kubernetes)
GET /health/ready         → Readiness probe (DB, Redis, RabbitMQ OK)
GET /health/startup       → Startup probe (migrations effectuees)
GET /health/detailed      → Check detaille de tous les services
```

**Exemple de reponse `/health/detailed`** :

```json
{
  "status": "healthy",
  "timestamp": "2024-07-16T10:30:00Z",
  "version": "1.0.0",
  "uptime": "72h15m30s",
  "checks": {
    "database": { "status": "up", "latency": "2ms" },
    "redis": { "status": "up", "latency": "1ms" },
    "rabbitmq": { "status": "up", "latency": "3ms" },
    "minio": { "status": "up", "latency": "5ms" }
  }
}
```

[Image: Dashboard Grafana montrant les metriques cles en temps reel]

---

## 5. Backup et restore

### 5.1 Politique de sauvegarde

| Donnee | Frequence | Retention | Methode |
|--------|-----------|-----------|---------|
| PostgreSQL (base) | Quotidienne 2h00 | 30 jours | pg_dump + MinIO |
| PostgreSQL (WAL) | Continue | 7 jours | wal-g |
| Redis (RDB) | Toutes les heures | 7 jours | BGSAVE + MinIO |
| MinIO (objets) | Continue | 30 jours | Erasure coding + replica |
| Configs K8s | Quotidienne | 90 jours | Velero |

### 5.2 Script de backup PostgreSQL

```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="ireg_moto_bf"
DB_USER="ireg_user"

# Backup complet
pg_dump -h postgres-service -U $DB_USER -d $DB_NAME \
  -F custom -f $BACKUP_DIR/backup_$DATE.dump

# Upload vers MinIO
mc cp $BACKUP_DIR/backup_$DATE.dump local/backups/postgres/

# Nettoyage (garder 30 jours)
find $BACKUP_DIR -name "backup_*.dump" -mtime +30 -delete
mc rm --recursive --force local/backups/postgres/ --older-than 30d

echo "Backup termine : backup_$DATE.dump"
```

### 5.3 Script de restauration

```bash
#!/bin/bash
# restore-postgres.sh

BACKUP_FILE=$1  # Ex: backup_20240716_020000.dump
DB_NAME="ireg_moto_bf"
DB_USER="ireg_user"

# Telecharger depuis MinIO si necessaire
if [ ! -f "$BACKUP_FILE" ]; then
  mc cp local/backups/postgres/$BACKUP_FILE /tmp/$BACKUP_FILE
  BACKUP_FILE="/tmp/$BACKUP_FILE"
fi

# Restaurer
pg_restore -h postgres-service -U $DB_USER -d $DB_NAME \
  --clean --if-exists $BACKUP_FILE

echo "Restauration terminee depuis : $BACKUP_FILE"
```

### 5.4 Backup Kubernetes (Velero)

```bash
# Installer Velero
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.8.0 \
  --bucket ireg-k8s-backups \
  --secret-file ./velero-credentials \
  --backup-location-config region=af-west-1,s3ForcePathStyle=true,s3Url=https://minio.ireg-moto.bf \
  --snapshot-location-config region=af-west-1

# Backup quotidien
velero backup create ireg-daily-$(date +%Y%m%d) \
  --include-namespaces ireg-moto-bf-prod \
  --schedule="0 2 * * *" \
  --ttl 720h0m0s

# Restauration
velero restore create --from-backup ireg-daily-20240716
```

### 5.5 Plan de reprise d'activite (PRA)

| Scenario | RTO | RPO | Procedure |
|----------|-----|-----|-----------|
| Perte d'un pod backend | < 30s | 0 | HPA remplace automatiquement |
| Perte d'un nœud K8s | < 5 min | 0 | Pods reschedule sur autre nœud |
| Corruption base de donnees | < 30 min | < 1h | Restauration depuis dernier backup |
| Perte complete datacenter | < 4h | < 1h | Restauration Velero + replication MinIO |
| Ransomware / attaque | < 8h | < 1h | Restauration depuis backup air-gapped |

[Image: Schema du plan de reprise d'activite avec les differents scenarios]

---

## 6. Scaling

### 6.1 Scaling horizontal automatique

L'application supporte le scaling horizontal automatique via Kubernetes HPA :

```bash
# Verifier l'etat du HPA
kubectl get hpa -n ireg-moto-bf-prod

# Resultat attendu
NAME          REFERENCE            TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
backend-hpa   Deployment/backend   45%/70%   3         10        3          7d
frontend-hpa  Deployment/frontend  30%/70%   2         5         2          7d
```

### 6.2 Scaling manuel

```bash
# Scaling manuel du backend
kubectl scale deployment backend --replicas=5 -n ireg-moto-bf-prod

# Scaling de PostgreSQL (read replicas)
kubectl scale statefulset postgres-replica --replicas=2 -n ireg-moto-bf-prod
```

### 6.3 Seuils de scaling

| Metric | Seuil scale-up | Seuil scale-down | Max replicas |
|--------|---------------|------------------|--------------|
| CPU | 70% | 30% | 10 |
| Memory | 80% | 40% | 10 |
| Requêtes/s | 1000/s | 200/s | 10 |
| Latence P95 | 500ms | 200ms | 10 |

### 6.4 Capacites attendues

| Configuration | Utilisateurs simultanes | Requetes/s | Latence P95 |
|--------------|------------------------|------------|-------------|
| **Minimal** (3 pods) | 500 | 200 | < 200ms |
| **Standard** (5 pods) | 2 000 | 800 | < 200ms |
| **Large** (10 pods) | 10 000 | 3 000 | < 200ms |
| **XL + read replicas DB** | 50 000 | 10 000 | < 300ms |

### 6.5 Optimisations de performance

```yaml
# Backend deployment — optimisations
spec:
  template:
    spec:
      containers:
        - name: backend
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          env:
            - name: UV_THREADPOOL_SIZE
              value: "128"
            - name: NODE_OPTIONS
              value: "--max-old-space-size=768"
```

### 6.6 Scaling de la base de donnees

Pour les charges elevees, PostgreSQL peut etre configure avec :
- **1 primary** pour les ecritures
- **2 read replicas** pour les lectures analytiques
- **PgBouncer** pour le connection pooling
- **Partitionnement mensuel** pour les tables volumineuses (domain_events, stock_movements)

```yaml
# PostgreSQL primary + replicas
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-replica
spec:
  replicas: 2
  template:
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          env:
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
            - name: POSTGRES_REPLICA_ROLE
              value: replica
          command:
            - bash
            - -c
            - |
              pg_basebackup -h postgres-primary -D $PGDATA -U replicator -v -P -W
              echo "standby_mode = on" >> $PGDATA/recovery.conf
              echo "primary_conninfo = 'host=postgres-primary port=5432 user=replicator'" >> $PGDATA/recovery.conf
              postgres
```

[Image: Graphe de scaling automatique montrant l'evolution du nombre de pods]

---

## Annexes

### A. Commandes de diagnostic

```bash
# Etat des pods
kubectl get pods -n ireg-moto-bf-prod -o wide

# Logs d'un pod
kubectl logs -f deployment/backend -n ireg-moto-bf-prod --tail=200

# Logs precedents (pod redemarre)
kubectl logs -f deployment/backend -n ireg-moto-bf-prod --previous

# Shell dans un pod
kubectl exec -it deployment/backend -n ireg-moto-bf-prod -- /bin/sh

# Description detaillee d'un pod
kubectl describe pod <pod-name> -n ireg-moto-bf-prod

# Evenements du namespace
kubectl get events -n ireg-moto-bf-prod --sort-by=.lastTimestamp

# Ressources utilisees
kubectl top pods -n ireg-moto-bf-prod
kubectl top nodes

# Endpoints services
kubectl get endpoints -n ireg-moto-bf-prod
```

### B. Points de controle post-deploiement

- [ ] Tous les pods sont en statut `Running`
- [ ] Les health checks repondent `200 OK`
- [ ] Les migrations sont a jour
- [ ] Les donnees de reference sont chargees
- [ ] Le SSL est actif et valide
- [ ] Les alertes monitoring sont configurees
- [ ] Les backups sont planifies
- [ ] La documentation est a jour

### C. Contacts escalation

| Niveau | Contact | Delai |
|--------|---------|-------|
| 1 — Support | support@ireg-moto.bf | 15 min |
| 2 — Technique | tech@ireg-moto.bf | 1 heure |
| 3 — On-call | +226 70 XX XX XX | 30 min |
| 4 — Direction | drctt@transport.bf | 2 heures |

---

> **Version:** 1.0.0 | **Mise a jour:** Juillet 2024
> **Support:** tech@ireg-moto.bf
