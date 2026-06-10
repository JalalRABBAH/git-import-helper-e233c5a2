#!/bin/bash
# ============================================================================
# iReg Moto BF — Script d'exécution des migrations
# ============================================================================
# Usage :
#   ./migrate.sh status              # Voir le statut des migrations
#   ./migrate.sh migrate             # Exécuter les migrations en attente
#   ./migrate.sh rollback            # Annuler la dernière migration
#   ./migrate.sh reset               # Reset complet (⚠️ perte de données)
#   ./migrate.sh seed                # Insérer les données de seed
#   ./migrate.sh generate <name>     # Générer une nouvelle migration
# ============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +'%H:%M:%S')] ✓${NC} $*"; }
info() { echo -e "${BLUE}[$(date +'%H:%M:%S')] ℹ${NC} $*"; }
warn() { echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $*"; }
error() { echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $*"; }

# === Vérifications ===
if [[ ! -d "$BACKEND_DIR" ]]; then
    error "Répertoire backend non trouvé : $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"

if [[ ! -f "package.json" ]]; then
    error "package.json non trouvé dans $BACKEND_DIR"
    exit 1
fi

# Vérifier que Prisma est installé
if ! npx prisma version &> /dev/null; then
    error "Prisma n'est pas installé. Exécutez 'npm ci' d'abord."
    exit 1
fi

# === Commande ===
COMMAND="${1:-status}"

case "$COMMAND" in
    status)
        info "Statut des migrations :"
        npx prisma migrate status
        ;;

    migrate|deploy)
        log "Exécution des migrations..."
        if [[ -n "${DATABASE_URL:-}" ]]; then
            npx prisma migrate deploy
        else
            warn "DATABASE_URL non définie, utilisation du .env"
            npx prisma migrate dev
        fi
        log "Migrations terminées"
        ;;

    dev)
        log "Mode développement — création/migration automatique"
        npx prisma migrate dev
        log "Migrations terminées"
        ;;

    rollback|resolve)
        warn "Résolution d'une migration en échec..."
        npx prisma migrate resolve --rolled-back "$2"
        ;;

    reset)
        warn "⚠️  CETTE OPÉRATION VA SUPPRIMER TOUTES LES DONNÉES !"
        read -p "Tapez 'RESET' pour confirmer : " CONFIRM
        if [[ "$CONFIRM" == "RESET" ]]; then
            log "Reset de la base de données..."
            npx prisma migrate reset --force --skip-generate
            log "Reset terminé"
        else
            info "Reset annulé"
        fi
        ;;

    generate)
        MIGRATION_NAME="${2:-migration_$(date +%Y%m%d_%H%M%S)}"
        info "Génération de la migration : $MIGRATION_NAME"
        npx prisma migrate dev --name "$MIGRATION_NAME" --create-only
        log "Migration créée : prisma/migrations/${MIGRATION_NAME}"
        ;;

    seed)
        log "Exécution des seeds..."
        if [[ -f "prisma/seed.ts" ]]; then
            npx ts-node prisma/seed.ts
        elif [[ -f "prisma/seed.js" ]]; then
            node prisma/seed.js
        else
            warn "Aucun fichier seed trouvé (prisma/seed.ts ou prisma/seed.js)"
        fi
        log "Seeds terminés"
        ;;

    validate)
        info "Validation du schéma Prisma..."
        npx prisma validate
        log "Schéma valide"
        ;;

    generate-client)
        log "Génération du client Prisma..."
        npx prisma generate
        log "Client généré"
        ;;

    studio)
        log "Lancement de Prisma Studio..."
        npx prisma studio
        ;;

    db-pull)
        info "Introspection de la base de données..."
        npx prisma db pull
        log "Schéma mis à jour depuis la base de données"
        ;;

    db-push)
        warn "Push du schéma vers la base de données (sans migration)..."
        npx prisma db push
        log "Schéma poussé"
        ;;

    format)
        log "Formatage du schéma Prisma..."
        npx prisma format
        log "Schéma formaté"
        ;;

    *)
        echo "Usage: $0 <command> [options]"
        echo ""
        echo "Commandes :"
        echo "  status           Voir le statut des migrations"
        echo "  migrate          Exécuter les migrations (production)"
        echo "  dev              Mode développement (avec prompts)"
        echo "  rollback <name>  Marquer une migration comme annulée"
        echo "  reset            ⚠️  Reset complet de la base"
        echo "  generate <name>  Créer une nouvelle migration"
        echo "  seed             Exécuter les seeds"
        echo "  validate         Valider le schéma"
        echo "  generate-client  Générer le client Prisma"
        echo "  studio           Lancer Prisma Studio (UI)"
        echo "  db-pull          Introspecter la base existante"
        echo "  db-push          Pousser le schéma (sans migration)"
        echo "  format           Formater le schéma"
        exit 1
        ;;
esac

exit 0
