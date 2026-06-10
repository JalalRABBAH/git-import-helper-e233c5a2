#!/bin/bash
# ============================================================================
# iReg Moto BF — Script de restauration PostgreSQL
# ============================================================================
# Usage :
#   ./restore-db.sh --file backup.sql.gz          # Restauration depuis fichier
#   ./restore-db.sh --s3 s3://bucket/backup.sql.gz # Depuis S3
#   ./restore-db.sh --latest                       # Dernier backup local
#   ./restore-db.sh --file backup.enc --decrypt    # Backup chiffré
#
# ⚠️  ATTENTION : Ce script DROP et recrée la base de données !
# ============================================================================

set -euo pipefail

# === Configuration ===
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="ireg-moto-bf"
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
ENCRYPTION_KEY="${ENCRYPTION_KEY:-}"

# PostgreSQL config
DB_HOST="${DB_HOST:-postgres-service}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ireg_moto_bf}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_ADMIN="${DB_ADMIN:-postgres}"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# === Logging ===
log() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $*"; }
warn() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARN:${NC} $*"; }
error() { echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*"; }

# === Parsing arguments ===
BACKUP_FILE=""
S3_PATH=""
USE_LATEST=false
DECRYPT=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --file) BACKUP_FILE="$2"; shift 2 ;;
        --s3) S3_PATH="$2"; shift 2 ;;
        --latest) USE_LATEST=true; shift ;;
        --decrypt) DECRYPT=true; shift ;;
        --dry-run) DRY_RUN=true; shift ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --file FILE       Chemin vers le fichier de backup"
            echo "  --s3 PATH         Chemin S3 (s3://bucket/key)"
            echo "  --latest          Utiliser le dernier backup local"
            echo "  --decrypt         Déchiffrer le backup avant restauration"
            echo "  --dry-run         Afficher les commandes sans exécuter"
            echo "  --help            Afficher cette aide"
            exit 0
            ;;
        *) error "Option inconnue: $1"; exit 1 ;;
    esac
done

# === Vérifications ===
if ! command -v psql &> /dev/null || ! command -v pg_restore &> /dev/null; then
    error "PostgreSQL client (psql, pg_restore) requis"
    exit 1
fi

if [[ -z "$DB_PASSWORD" ]]; then
    error "DB_PASSWORD ou PGPASSWORD requis"
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

# === Récupération du backup ===
RESTORE_FILE=""

if [[ "$USE_LATEST" == true ]]; then
    log "Recherche du dernier backup local..."
    RESTORE_FILE=$(find "$BACKUP_DIR" -type f -name "*.sql.gz*" -print | sort | tail -1)
    if [[ -z "$RESTORE_FILE" ]]; then
        error "Aucun backup trouvé dans $BACKUP_DIR"
        exit 1
    fi
    log "Dernier backup trouvé : $RESTORE_FILE"

elif [[ -n "$S3_PATH" ]]; then
    log "Téléchargement depuis S3..."
    RESTORE_FILE="/tmp/${PROJECT_NAME}_restore_$(date +%s).sql.gz"
    if command -v aws &> /dev/null; then
        aws s3 cp "$S3_PATH" "$RESTORE_FILE"
    elif command -v mc &> /dev/null; then
        mc cp "$S3_PATH" "$RESTORE_FILE"
    else
        error "AWS CLI ou MinIO client (mc) requis"
        exit 1
    fi
    log "Backup téléchargé : $RESTORE_FILE"

elif [[ -n "$BACKUP_FILE" ]]; then
    RESTORE_FILE="$BACKUP_FILE"
    if [[ ! -f "$RESTORE_FILE" ]]; then
        error "Fichier non trouvé : $RESTORE_FILE"
        exit 1
    fi
else
    error "Aucun backup spécifié. Utilisez --file, --s3 ou --latest"
    exit 1
fi

# === Déchiffrement ===
WORK_FILE="$RESTORE_FILE"
if [[ "$DECRYPT" == true || "$RESTORE_FILE" == *.enc ]]; then
    if [[ -z "$ENCRYPTION_KEY" ]]; then
        error "ENCRYPTION_KEY requis pour le déchiffrement"
        exit 1
    fi
    log "Déchiffrement du backup..."
    WORK_FILE="/tmp/${PROJECT_NAME}_restore_decrypted_$(date +%s).sql.gz"
    openssl enc -aes-256-cbc -d -in "$RESTORE_FILE" -out "$WORK_FILE" -k "$ENCRYPTION_KEY"
    log "✅ Backup déchiffré"
fi

# === Vérification du backup ===
log "Vérification du backup..."
if [[ "$WORK_FILE" == *.gz ]]; then
    if gunzip -t "$WORK_FILE" 2>/dev/null; then
        log "✅ Backup valide (gzip)"
    else
        error "❌ Backup corrompu ou non compressé"
        exit 1
    fi
fi

# === Confirmation ===
if [[ "$DRY_RUN" == false ]]; then
    echo ""
    warn "⚠️  CETTE OPÉRATION VA ÉCRASER LA BASE DE DONNÉES '${DB_NAME}' !"
    warn "   Host : ${DB_HOST}:${DB_PORT}"
    warn "   Backup : ${RESTORE_FILE}"
    echo ""
    read -p "Êtes-vous sûr de vouloir continuer ? (tapez 'OUI' pour confirmer) : " CONFIRM
    if [[ "$CONFIRM" != "OUI" ]]; then
        log "Restauration annulée"
        exit 0
    fi
fi

# === Restauration ===
log "Démarrage de la restauration..."

if [[ "$DRY_RUN" == true ]]; then
    log "[DRY-RUN] Commandes qui seraient exécutées :"
    echo "  1. DROP DATABASE IF EXISTS ${DB_NAME};"
    echo "  2. CREATE DATABASE ${DB_NAME};"
    echo "  3. gunzip < ${WORK_FILE} | psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}"
    exit 0
fi

# Créer une connexion de secours
log "Création d'une base temporaire..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN" -d postgres -c "
    SELECT pg_terminate_backend(pid) 
    FROM pg_stat_activity 
    WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();
" || true

# Supprimer et recréer la base
log "Suppression de la base existante..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN" -d postgres -c "DROP DATABASE IF EXISTS \"${DB_NAME}\";" || {
    error "Impossible de supprimer la base. Vérifiez les connexions actives."
    exit 1
}

log "Création de la nouvelle base..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN" -d postgres -c "CREATE DATABASE \"${DB_NAME}\" WITH OWNER = \"${DB_USER}\" ENCODING = 'UTF8';"

# Restaurer les données
log "Restauration des données (cela peut prendre plusieurs minutes)..."
START_TIME=$(date +%s)

if [[ "$WORK_FILE" == *.gz ]]; then
    gunzip < "$WORK_FILE" | \
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1
else
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 < "$WORK_FILE"
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# === Vérification post-restauration ===
log "Vérification post-restauration..."
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
ROW_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT SUM(n_live_tup) FROM pg_stat_user_tables;" | xargs)

log "========================================"
log "📦 RESTAURATION TERMINÉE"
log "========================================"
log "Base           : ${DB_NAME}"
log "Source         : ${RESTORE_FILE}"
log "Tables         : ${TABLE_COUNT}"
log "Lignes (est.)  : ${ROW_COUNT}"
log "Durée          : ${DURATION}s"
log "========================================"

# Nettoyage
if [[ -n "$S3_PATH" || "$WORK_FILE" != "$RESTORE_FILE" ]]; then
    rm -f "$WORK_FILE"
    log "Fichiers temporaires nettoyés"
fi

exit 0
