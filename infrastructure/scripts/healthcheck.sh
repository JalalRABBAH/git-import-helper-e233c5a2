#!/bin/bash
# ============================================================================
# iReg Moto BF — Healthcheck complet de la stack
# ============================================================================
# Usage :
#   ./healthcheck.sh              # Check complet
#   ./healthcheck.sh --quick      # Check rapide (30s max)
#   ./healthcheck.sh --json       # Sortie JSON
#   ./healthcheck.sh --k8s        # Mode Kubernetes
# ============================================================================

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
INFRA_DIR="${PROJECT_ROOT}/infrastructure"

# Configuration
TIMEOUT="${TIMEOUT:-10}"
QUICK=false
JSON=false
K8S=false
NAMESPACE="${NAMESPACE:-ireg-moto-bf-prod}"

# Résultats
declare -A RESULTS
FAILED=0
TOTAL=0

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

# === Parsing arguments ===
while [[ $# -gt 0 ]]; do
    case $1 in
        --quick) QUICK=true; shift ;;
        --json) JSON=true; shift ;;
        --k8s) K8S=true; shift ;;
        --namespace) NAMESPACE="$2"; shift 2 ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo "Options :"
            echo "  --quick        Check rapide (services essentiels uniquement)"
            echo "  --json         Sortie au format JSON"
            echo "  --k8s          Mode Kubernetes (vérifie les pods)"
            echo "  --namespace N  Namespace Kubernetes (défaut: ireg-moto-bf-prod)"
            exit 0
            ;;
        *) echo "Option inconnue: $1"; exit 1 ;;
    esac
done

# === Helpers ===
check_service() {
    local name="$1"
    local check_cmd="$2"
    local type="${3:-docker}"

    TOTAL=$((TOTAL + 1))

    if eval "$check_cmd" > /dev/null 2>&1; then
        RESULTS["$name"]="OK"
        return 0
    else
        RESULTS["$name"]="FAIL"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

print_result() {
    local name="$1"
    local status="${RESULTS[$name]}"
    if [[ "$status" == "OK" ]]; then
        echo -e "  ${GREEN}✓${NC} $name"
    else
        echo -e "  ${RED}✗${NC} $name"
    fi
}

# === Header ===
if [[ "$JSON" == false ]]; then
    echo -e "${CYAN}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════╗
║         iReg Moto BF — Healthcheck Stack                  ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
fi

START_TIME=$(date +%s)

# ============================================================================
# MODE KUBERNETES
# ============================================================================
if [[ "$K8S" == true ]]; then
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}kubectl n'est pas installé${NC}"
        exit 1
    fi

    echo -e "${BOLD}Vérification des pods Kubernetes (namespace: $NAMESPACE)${NC}"

    # Récupérer tous les pods
    PODS=$(kubectl get pods -n "$NAMESPACE" -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.status.phase}{"\n"}{end}' 2>/dev/null)

    if [[ -z "$PODS" ]]; then
        echo -e "${RED}Aucun pod trouvé dans le namespace $NAMESPACE${NC}"
        exit 1
    fi

    while IFS=' ' read -r pod phase; do
        TOTAL=$((TOTAL + 1))
        if [[ "$phase" == "Running" ]]; then
            # Vérifier que le pod est ready
            READY=$(kubectl get pod "$pod" -n "$NAMESPACE" -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null)
            if [[ "$READY" == "True" ]]; then
                RESULTS["$pod"]="OK"
            else
                RESULTS["$pod"]="FAIL"
                FAILED=$((FAILED + 1))
            fi
        else
            RESULTS["$pod"]="FAIL ($phase)"
            FAILED=$((FAILED + 1))
        fi
    done <<< "$PODS"

    for pod in "${!RESULTS[@]}"; do
        print_result "$pod"
    done

    # Services
    echo -e "\n${BOLD}Services :${NC}"
    SERVICES=$(kubectl get svc -n "$NAMESPACE" -o jsonpath='{range .items[*]}{.metadata.name}{" "}{.spec.clusterIP}{"\n"}{end}')
    while IFS=' ' read -r svc ip; do
        if [[ "$ip" != "None" ]]; then
            echo -e "  ${GREEN}✓${NC} $svc ($ip)"
        else
            echo -e "  ${YELLOW}⚠${NC} $svc (headless)"
        fi
    done <<< "$SERVICES"

    # Ingress
    echo -e "\n${BOLD}Ingress :${NC}"
    kubectl get ingress -n "$NAMESPACE" --no-headers 2>/dev/null | while read -r line; do
        echo -e "  ${GREEN}✓${NC} $line"
    done || echo -e "  ${YELLOW}⚠${NC} Aucun ingress"

# ============================================================================
# MODE DOCKER COMPOSE
# ============================================================================
else
    # === Docker ===
    echo -e "${BOLD}1. Services Docker${NC}"

    SERVICES=("ireg-postgres" "ireg-redis" "ireg-minio" "ireg-rabbitmq" "ireg-backend" "ireg-nginx")
    [[ "$QUICK" == false ]] && SERVICES+=("ireg-prometheus" "ireg-grafana" "ireg-loki")

    for svc in "${SERVICES[@]}"; do
        check_service "$svc" "docker compose -f ${INFRA_DIR}/docker-compose.yml ps $svc | grep -q 'Up'"
        print_result "$svc"
    done

    # === Endpoints HTTP ===
    echo -e "\n${BOLD}2. Endpoints HTTP${NC}"

    check_service "API Health" "curl -sf --max-time ${TIMEOUT} http://localhost:3000/health"
    print_result "API Health"

    check_service "Frontend" "curl -sf --max-time ${TIMEOUT} http://localhost:80/ > /dev/null"
    print_result "Frontend"

    if [[ "$QUICK" == false ]]; then
        check_service "Prometheus" "curl -sf --max-time ${TIMEOUT} http://localhost:9090/-/healthy"
        print_result "Prometheus"

        check_service "Grafana" "curl -sf --max-time ${TIMEOUT} http://localhost:3003/api/health"
        print_result "Grafana"

        check_service "RabbitMQ" "curl -sf --max-time ${TIMEOUT} http://localhost:15672 > /dev/null"
        print_result "RabbitMQ"

        check_service "MinIO" "curl -sf --max-time ${TIMEOUT} http://localhost:9000/minio/health/live"
        print_result "MinIO"
    fi

    # === Bases de données ===
    echo -e "\n${BOLD}3. Bases de données${NC}"

    check_service "PostgreSQL" "docker compose -f ${INFRA_DIR}/docker-compose.yml exec -T postgres pg_isready -U ireg_user > /dev/null 2>&1"
    print_result "PostgreSQL"

    check_service "Redis" "docker compose -f ${INFRA_DIR}/docker-compose.yml exec -T redis redis-cli -a ireg_redis_dev ping | grep -q PONG"
    print_result "Redis"

    # === Fonctionnalités critiques (si --quick) ===
    if [[ "$QUICK" == false ]]; then
        echo -e "\n${BOLD}4. Fonctionnalités critiques${NC}"

        # Test API endpoints
        API_RESPONSE=$(curl -sf --max-time "$TIMEOUT" http://localhost:3000/health 2>/dev/null || echo "FAIL")
        if [[ "$API_RESPONSE" != "FAIL" ]]; then
            echo -e "  ${GREEN}✓${NC} API répond correctement"
        else
            echo -e "  ${RED}✗${NC} API ne répond pas"
            FAILED=$((FAILED + 1))
        fi

        # Test MinIO bucket
        BUCKET_CHECK=$(curl -sf --max-time "$TIMEOUT" -u minioadmin:minioadmin123 \
            http://localhost:9000/ireg-documents/ 2>/dev/null || echo "FAIL")
        if [[ "$BUCKET_CHECK" != "FAIL" ]]; then
            echo -e "  ${GREEN}✓${NC} Bucket MinIO accessible"
        else
            echo -e "  ${YELLOW}⚠${NC} Bucket MinIO non accessible (peut être normal au premier démarrage)"
        fi
    fi
fi

# ============================================================================
# RÉSULTAT
# ============================================================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [[ "$JSON" == true ]]; then
    # Sortie JSON
    echo "{"
    echo "  \"timestamp\": \"$(date -Iseconds)\","
    echo "  \"duration_seconds\": $DURATION,"
    echo "  \"total_checks\": $TOTAL,"
    echo "  \"passed\": $((TOTAL - FAILED)),"
    echo "  \"failed\": $FAILED,"
    echo "  \"healthy\": $([[ $FAILED -eq 0 ]] && echo "true" || echo "false"),"
    echo "  \"checks\": {"
    FIRST=true
    for key in "${!RESULTS[@]}"; do
        [[ "$FIRST" == true ]] || echo ","
        FIRST=false
        echo -n "    \"$key\": \"${RESULTS[$key]}\""
    done
    echo ""
    echo "  }"
    echo "}"
else
    # Sortie texte
    echo ""
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    if [[ $FAILED -eq 0 ]]; then
        echo -e "${GREEN}${BOLD}  ✅ TOUS LES CHECKS SONT PASSÉS${NC}"
    else
        echo -e "${RED}${BOLD}  ❌ $FAILED/$TOTAL CHECKS EN ÉCHEC${NC}"
    fi
    echo -e "${BOLD}  Durée : ${DURATION}s${NC}"
    echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

exit $FAILED
