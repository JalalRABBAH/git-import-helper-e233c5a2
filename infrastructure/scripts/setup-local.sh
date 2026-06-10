#!/bin/bash
# ============================================================================
# iReg Moto BF — Script de setup environnement de développement local
# ============================================================================
# Usage : ./setup-local.sh
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
INFRA_DIR="${PROJECT_ROOT}/infrastructure"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')] ✓${NC} $*"; }
info() { echo -e "${BLUE}[$(date +'%H:%M:%S')] ℹ${NC} $*"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $*"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $*"; }
step() { echo -e "\n${BOLD}${CYAN}━━━ $* ━━━${NC}\n"; }

# === Bannière ===
echo -e "${CYAN}"
cat << 'EOF'
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     iReg Moto BF — Setup Environnement de Développement   ║
║     Plateforme réglementaire de conformité deux-roues     ║
║                    Burkina Faso                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# === Prérequis ===
step "Vérification des prérequis"

check_command() {
    if command -v "$1" &> /dev/null; then
        VERSION=$($2 2>/dev/null | head -1 || echo "installé")
        log "$1 : $VERSION"
    else
        error "$1 n'est pas installé"
        MISSING=1
    fi
}

MISSING=0
check_command "docker" "docker --version"
check_command "docker compose" "docker compose version"
check_command "node" "node --version"
check_command "npm" "npm --version"
check_command "git" "git --version"
check_command "kubectl" "kubectl version --client"
check_command "helm" "helm version --short"

if [[ "$MISSING" == 1 ]]; then
    error "Certains prérequis sont manquants. Veuillez les installer."
    exit 1
fi

# === Structure des répertoires ===
step "Vérification de la structure du projet"

dirs=("backend" "frontend")
for dir in "${dirs[@]}"; do
    if [[ -d "${PROJECT_ROOT}/${dir}" ]]; then
        log "Répertoire ${dir}/ trouvé"
    else
        warn "Répertoire ${dir}/ manquant — création..."
        mkdir -p "${PROJECT_ROOT}/${dir}"
    fi
done

# === Fichiers d'environnement ===
step "Configuration des variables d'environnement"

# Backend .env
if [[ ! -f "${PROJECT_ROOT}/backend/.env" ]]; then
    info "Création de backend/.env..."
    cat > "${PROJECT_ROOT}/backend/.env" << 'EOF'
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
TZ=Africa/Ouagadougou

# Base de données
DATABASE_URL=postgresql://ireg_user:ireg_dev_password@localhost:5432/ireg_moto_bf?schema=public
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ireg_moto_bf
DB_USER=ireg_user
DB_PASSWORD=ireg_dev_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=ireg_redis_dev

# MinIO
S3_ENDPOINT=localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin123
S3_BUCKET=ireg-documents
S3_REGION=us-east-1
S3_USE_SSL=false

# RabbitMQ
RABBITMQ_URL=amqp://ireg_mq_user:ireg_mq_dev@localhost:5672
RABBITMQ_QUEUE=rapports-conformite
RABBITMQ_EXCHANGE=ireg.events

# Sécurité
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=10

# Features
ENABLE_SWAGGER=true
ENABLE_METRICS=true
LOG_LEVEL=debug
EOF
    log "backend/.env créé"
else
    log "backend/.env existe déjà"
fi

# Frontend .env
if [[ ! -f "${PROJECT_ROOT}/frontend/.env" ]]; then
    info "Création de frontend/.env..."
    cat > "${PROJECT_ROOT}/frontend/.env" << 'EOF'
REACT_APP_API_URL=http://localhost/api/v1
REACT_APP_ENV=development
REACT_APP_S3_ENDPOINT=http://localhost:9000
REACT_APP_RABBITMQ_WS_URL=ws://localhost:15674/ws
REACT_APP_VERSION=1.0.0
PORT=3001
BROWSER=none
WDS_SOCKET_PORT=0
EOF
    log "frontend/.env créé"
else
    log "frontend/.env existe déjà"
fi

# === Démarrage Docker Compose ===
step "Démarrage de l'infrastructure (Docker Compose)"

cd "$INFRA_DIR"

info "Construction et démarrage des services..."
docker compose up -d --build

# === Attente des services ===
step "Attente de la disponibilité des services"

wait_for_service() {
    local name="$1"
    local url="$2"
    local max_attempts="${3:-30}"
    local attempt=0

    info "Attente de $name..."
    while ! curl -sf "$url" > /dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [[ $attempt -ge $max_attempts ]]; then
            error "$name n'est pas disponible après ${max_attempts} tentatives"
            return 1
        fi
        sleep 2
    done
    log "$name est prêt !"
}

wait_for_service "PostgreSQL" "localhost:5432" 30 || true
wait_for_service "Redis" "localhost:6379" 20 || true
wait_for_service "MinIO" "http://localhost:9000/minio/health/live" 30
wait_for_service "RabbitMQ" "http://localhost:15672" 30
wait_for_service "API Backend" "http://localhost:3000/health" 60
wait_for_service "Frontend" "http://localhost:3001" 30
wait_for_service "Prometheus" "http://localhost:9090/-/healthy" 20
wait_for_service "Grafana" "http://localhost:3003/api/health" 30

# === Migrations ===
step "Exécution des migrations"

if [[ -d "${PROJECT_ROOT}/backend/prisma" ]]; then
    cd "${PROJECT_ROOT}/backend"
    info "Installation des dépendances backend..."
    npm ci
    info "Génération du client Prisma..."
    npx prisma generate
    info "Exécution des migrations..."
    npx prisma migrate dev --name init
    log "Migrations terminées"
else
    warn "Dossier prisma/ non trouvé — migrations ignorées"
fi

# === Installation frontend ===
step "Installation du frontend"

if [[ -f "${PROJECT_ROOT}/frontend/package.json" ]]; then
    cd "${PROJECT_ROOT}/frontend"
    info "Installation des dépendances frontend..."
    npm ci
    log "Frontend installé"
else
    warn "package.json frontend non trouvé"
fi

# === Résumé ===
step "Setup terminé !"

echo -e "${GREEN}"
cat << EOF
╔═══════════════════════════════════════════════════════════╗
║  🎉 Environnement de développement prêt !                 ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  📱 Application       : http://localhost:80               ║
║  🔧 API Backend       : http://localhost:3000             ║
║  💻 Frontend Dev      : http://localhost:3001             ║
║  📊 Prometheus        : http://localhost:9090             ║
║  📈 Grafana           : http://localhost:3003 (admin/admin123)║
║  🗄️  RabbitMQ UI      : http://localhost:15672            ║
║     (user: ireg_mq_user / pass: ireg_mq_dev)              ║
║  📦 MinIO Console     : http://localhost:9001             ║
║     (user: minioadmin / pass: minioadmin123)              ║
║  🗄️  PostgreSQL       : localhost:5432                    ║
║  💾 Redis             : localhost:6379                    ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║  Commandes utiles :                                       ║
║    cd infrastructure && docker compose logs -f [service]  ║
║    cd infrastructure && docker compose ps                 ║
║    cd infrastructure && docker compose down               ║
║    cd backend && npm run start:dev                        ║
║    cd frontend && npm start                               ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

exit 0
