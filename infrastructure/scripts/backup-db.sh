#!/bin/bash
# ============================================================================
# iReg Moto BF — Script de backup PostgreSQL
# ============================================================================
# Usage :
#   ./backup-db.sh                    # Backup local
#   ./backup-db.sh --s3               # Backup vers S3
#   ./backup-db.sh --retention 30     # 30 jours de rétention
#   ./backup-db.sh --full             # Backup full avec schéma + données
#
# Planification cron :
#   0 2 * * * /opt/irem-moto-bf/scripts/backup-db.sh --s3 --retention 30
# ============================================================================

set -euo pipefail

# === Configuration ===
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="ireg-moto-bf"
BACKUP_DIR="${BACKUP_DIR:-/backups/postgres}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)
HOSTNAME=$(hostname)
RETENTION_DAYS="${RETENTION_DAYS:-14}"
S3_BUCKET="${S3_BUCKET:-ireg-backups}"
S3_ENDPOINT="${S3_ENDPOINT:-}"
ENCRYPTION_KEY="${ENCRYPTION_KEY:-}"

# PostgreSQL config
DB_HOST="${DB_HOST:-postgres-service}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ireg_moto_bf}"
DB_USER="${DB_USER:-ireg_user}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_SCHEMA="${DB_SCHEMA:-public}"

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
S3_UPLOAD=false
FULL_BACKUP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --s3) S3_UPLOAD=true; shift ;;
        --retention) RETENTION_DAYS="$2"; shift 2 ;;
        --full) FULL_BACKUP=true; shift ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --s3              Upload vers S3 après backup"
            echo "  --retention N     Nombre de jours de rétention (défaut: 14)"
            echo "  --full            Backup complet (schéma + données)"
            echo "  --help            Afficher cette aide"
            exit 0
            ;;
        *) error "Option inconnue: $1"; exit 1 ;;
    esac
done

# === Vérifications ===
if ! command -v pg_dump &> /dev/null; then
    error "pg_dump n'est pas installé"
    exit 1
fi

if [[ -z "$DB_PASSWORD" ]]; then
    if [[ -n "${DATABASE_URL:-}" ]]; then
        # Extraire le password de DATABASE_URL
        DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    else
        error "DB_PASSWORD ou DATABASE_URL requis"
        exit 1
    fi
fi

export PGPASSWORD="$DB_PASSWORD"

# === Création répertoire backup ===
BACKUP_PATH="${BACKUP_DIR}/${DATE}"
mkdir -p "$BACKUP_PATH"

# === Backup ===
BACKUP_FILE="${BACKUP_PATH}/${PROJECT_NAME}_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
ENCRYPTED_FILE="${COMPRESSED_FILE}.enc"

log "Démarrage du backup de '${DB_NAME}'..."
log "Destination : $COMPRESSED_FILE"

if [[ "$FULL_BACKUP" == true ]]; then
    log "Mode : BACKUP COMPLET (schéma + données)"
    pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -n "$DB_SCHEMA" \
        --no-owner \
        --no-privileges \
        --clean \
        --if-exists \
        --create \
        --verbose \
        2>"${BACKUP_PATH}/backup_${TIMESTAMP}.log" | \
        gzip -9 > "$COMPRESSED_FILE"
else
    log "Mode : BACKUP DONNÉES uniquement"
    pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -n "$DB_SCHEMA" \
        --data-only \
        --no-owner \
        --no-privileges \
        --verbose \
        2>"${BACKUP_PATH}/backup_${TIMESTAMP}.log" | \
        gzip -9 > "$COMPRESSED_FILE"
fi

BACKUP_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
log "Backup terminé : $COMPRESSED_FILE ($BACKUP_SIZE)"

# === Chiffrement (AES-256) ===
if [[ -n "$ENCRYPTION_KEY" ]]; then
    log "Chiffrement du backup (AES-256)..."
    openssl enc -aes-256-cbc -salt -in "$COMPRESSED_FILE" \
        -out "$ENCRYPTED_FILE" -k "$ENCRYPTION_KEY"
    rm "$COMPRESSED_FILE"
    COMPRESSED_FILE="$ENCRYPTED_FILE"
    log "Backup chiffré : $ENCRYPTED_FILE"
fi

# === Vérification intégrité ===
log "Vérification de l'intégrité..."
if [[ "$COMPRESSED_FILE" == *.enc ]]; then
    openssl enc -aes-256-cbc -d -in "$COMPRESSED_FILE" -out /dev/null -k "$ENCRYPTION_KEY" 2>/dev/null
else
    gunzip -t "$COMPRESSED_FILE" 2>/dev/null
fi

if [[ $? -eq 0 ]]; then
    log "✅ Intégrité du backup vérifiée"
else
    error "❌ Le backup est corrompu !"
    exit 1
fi

# === Upload S3 ===
if [[ "$S3_UPLOAD" == true ]]; then
    if ! command -v aws &> /dev/null && ! command -v mc &> /dev/null; then
        error "AWS CLI ou MinIO client (mc) requis pour l'upload S3"
        exit 1
    fi

    log "Upload vers S3..."
    S3_KEY="postgres/${HOSTNAME}/${PROJECT_NAME}_${TIMESTAMP}.sql.gz"
    [[ "$COMPRESSED_FILE" == *.enc ]] && S3_KEY="${S3_KEY}.enc"

    if command -v mc &> /dev/null && [[ -n "$S3_ENDPOINT" ]]; then
        mc cp "$COMPRESSED_FILE" "backup-minio/${S3_BUCKET}/${S3_KEY}"
    else
        if [[ -n "$S3_ENDPOINT" ]]; then
            aws --endpoint-url "$S3_ENDPOINT" s3 cp "$COMPRESSED_FILE" "s3://${S3_BUCKET}/${S3_KEY}"
        else
            aws s3 cp "$COMPRESSED_FILE" "s3://${S3_BUCKET}/${S3_KEY}"
        fi
    fi

    if [[ $? -eq 0 ]]; then
        log "✅ Upload S3 réussi : s3://${S3_BUCKET}/${S3_KEY}"
    else
        error "❌ Échec de l'upload S3"
        exit 1
    fi
fi

# === Nettoyage (rétention) ===
log "Nettoyage des backups de plus de ${RETENTION_DAYS} jours..."
DELETED=$(find "$BACKUP_DIR" -type f -name "*.sql.gz*" -mtime +$RETENTION_DAYS -delete -print | wc -l)
log "✅ $DELETED ancien(s) backup(s) supprimé(s)"

# === Résumé ===
log "========================================"
log "📦 BACKUP TERMINÉ"
log "========================================"
log "Fichier      : $COMPRESSED_FILE"
log "Taille       : $BACKUP_SIZE"
log "Base         : $DB_NAME"
log "Host         : $DB_HOST"
log "Rétention    : ${RETENTION_DAYS} jours"
[[ "$S3_UPLOAD" == true ]] && log "S3           : s3://${S3_BUCKET}/${S3_KEY}"
[[ "$FULL_BACKUP" == true ]] && log "Type         : Complet (schéma + données)"
[[ -n "$ENCRYPTION_KEY" ]] && log "Chiffrement  : AES-256"
log "========================================"

# === Métriques Prometheus (optionnel) ===
if [[ -n "${PUSHGATEWAY_URL:-}" ]]; then
    echo "ireg_backup_last_success $(date +%s)" | \
        curl --data-binary @- "${PUSHGATEWAY_URL}/metrics/job/backup/instance/${HOSTNAME}"
fi

exit 0
