#!/bin/bash
set -euo pipefail

# Emergency Rollback Script for Executive Assistant Security
# This script performs immediate rollback of all security components

NAMESPACE="executive-assistant-security"
ROLLBACK_LOG="/tmp/emergency-rollback-$(date +%Y%m%d-%H%M%S).log"
BACKUP_NAMESPACE="executive-assistant-backup"

echo "🚨 EMERGENCY ROLLBACK INITIATED" | tee $ROLLBACK_LOG
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a $ROLLBACK_LOG
echo "Operator: ${GITHUB_ACTOR:-$(whoami)}" | tee -a $ROLLBACK_LOG

# Function to log with timestamp
log() {
    echo "[$(date -u +%H:%M:%S)] $1" | tee -a $ROLLBACK_LOG
}

# Function to rollback deployment
rollback_deployment() {
    local deployment=$1
    local namespace=${2:-$NAMESPACE}
    
    log "Rolling back deployment: $deployment"
    
    if kubectl get deployment $deployment -n $namespace &>/dev/null; then
        kubectl rollout undo deployment/$deployment -n $namespace
        kubectl rollout status deployment/$deployment -n $namespace --timeout=300s
        log "✅ Rollback completed for $deployment"
    else
        log "⚠️  Deployment $deployment not found in namespace $namespace"
    fi
}

# Function to restore from backup
restore_from_backup() {
    local service=$1
    
    log "Restoring $service from backup"
    
    if kubectl get deployment $service -n $BACKUP_NAMESPACE &>/dev/null; then
        kubectl get deployment $service -n $BACKUP_NAMESPACE -o yaml | \
        sed "s/namespace: $BACKUP_NAMESPACE/namespace: $NAMESPACE/" | \
        kubectl apply -f -
        log "✅ Restored $service from backup"
    else
        log "⚠️  No backup found for $service"
    fi
}

# Function to validate service health after rollback
validate_service() {
    local service=$1
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if kubectl get pods -n $NAMESPACE -l app=$service | grep -q "Running"; then
            log "✅ $service is healthy after rollback"
            return 0
        fi
        log "⏳ Waiting for $service to be healthy (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    log "❌ $service failed to become healthy after rollback"
    return 1
}

# Step 1: Stop all incoming traffic
log "🛑 Stopping incoming traffic"
kubectl patch service executive-assistant-gateway -n $NAMESPACE -p '{"spec":{"selector":{"app":"maintenance-page"}}}'

# Step 2: Create emergency backup of current state
log "💾 Creating emergency backup"
kubectl create namespace $BACKUP_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
kubectl get deployments -n $NAMESPACE -o yaml > /tmp/current-deployments-backup.yaml

# Step 3: Rollback Phase 5 - Optimization Services
log "🔄 Rolling back Phase 5: Optimization Services"
rollback_deployment "performance-monitor"
rollback_deployment "metrics-collector"
rollback_deployment "optimization-engine"

# Step 4: Rollback Phase 4 - AI Threat Detection
log "🔄 Rolling back Phase 4: AI Threat Detection"
rollback_deployment "ai-threat-detector"
rollback_deployment "behavior-analyzer"
rollback_deployment "executive-protection"

# Step 5: Rollback Phase 3 - Audit and SIEM
log "🔄 Rolling back Phase 3: Audit and SIEM"
rollback_deployment "audit-service"
rollback_deployment "siem-connector"
rollback_deployment "compliance-monitor"

# Step 6: Rollback Phase 2 - Zero Trust
log "🔄 Rolling back Phase 2: Zero Trust"
rollback_deployment "zero-trust-gateway"
rollback_deployment "continuous-verification"
rollback_deployment "policy-engine"

# Step 7: Rollback Phase 1 - HSM and Crypto (Critical)
log "🔄 Rolling back Phase 1: HSM and Crypto (CRITICAL)"
rollback_deployment "hsm-interface"
rollback_deployment "crypto-service"
rollback_deployment "crypto-validator"

# Step 8: Restore database to last known good state
log "🗄️  Restoring database to last known good state"
if kubectl get job audit-db-rollback -n $NAMESPACE &>/dev/null; then
    kubectl delete job audit-db-rollback -n $NAMESPACE
fi
kubectl apply -f deployment/rollback/audit-db-rollback-job.yaml

# Step 9: Restore configuration from backup
log "⚙️  Restoring configuration from backup"
kubectl apply -f deployment/rollback/config-backup.yaml

# Step 10: Validate all critical services
log "🔍 Validating critical services after rollback"
CRITICAL_SERVICES=("hsm-interface" "crypto-service" "zero-trust-gateway" "audit-service")
FAILED_SERVICES=()

for service in "${CRITICAL_SERVICES[@]}"; do
    if ! validate_service $service; then
        FAILED_SERVICES+=($service)
        # Try to restore from backup
        restore_from_backup $service
        if ! validate_service $service; then
            log "❌ CRITICAL: $service could not be restored"
        fi
    fi
done

# Step 11: Restore traffic only if critical services are healthy
if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
    log "✅ All critical services healthy - restoring traffic"
    kubectl patch service executive-assistant-gateway -n $NAMESPACE -p '{"spec":{"selector":{"app":"executive-assistant"}}}'
else
    log "❌ CRITICAL SERVICES FAILED: ${FAILED_SERVICES[*]}"
    log "🛑 Traffic remains blocked - manual intervention required"
fi

# Step 12: Run emergency health check
log "🏥 Running emergency health check"
./deployment/scripts/emergency-health-check.sh

# Step 13: Generate rollback report
log "📊 Generating rollback report"
ROLLBACK_REPORT="/tmp/rollback-report-$(date +%Y%m%d-%H%M%S).json"
cat > $ROLLBACK_REPORT << EOF
{
  "rollback_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "operator": "${GITHUB_ACTOR:-$(whoami)}",
  "failed_services": [$(printf '"%s",' "${FAILED_SERVICES[@]}" | sed 's/,$//')]
  "rollback_log": "$ROLLBACK_LOG",
  "status": "$([ ${#FAILED_SERVICES[@]} -eq 0 ] && echo "success" || echo "partial_failure")",
  "traffic_restored": $([ ${#FAILED_SERVICES[@]} -eq 0 ] && echo "true" || echo "false"),
  "manual_intervention_required": $([ ${#FAILED_SERVICES[@]} -gt 0 ] && echo "true" || echo "false")
}
EOF

# Step 14: Send emergency notifications
log "📢 Sending emergency notifications"
if [ -n "${EXECUTIVE_NOTIFICATION_WEBHOOK:-}" ]; then
    curl -X POST $EXECUTIVE_NOTIFICATION_WEBHOOK \
        -H "Content-Type: application/json" \
        -d @$ROLLBACK_REPORT
fi

if [ -n "${MONITORING_SLACK_WEBHOOK:-}" ]; then
    curl -X POST $MONITORING_SLACK_WEBHOOK \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"🚨 Emergency rollback completed. Status: $([ ${#FAILED_SERVICES[@]} -eq 0 ] && echo "✅ Success" || echo "⚠️ Partial failure - manual intervention required")\"}"
fi

log "🏁 Emergency rollback procedure completed"
log "📄 Rollback log saved to: $ROLLBACK_LOG"
log "📊 Rollback report saved to: $ROLLBACK_REPORT"

if [ ${#FAILED_SERVICES[@]} -eq 0 ]; then
    log "✅ ROLLBACK SUCCESSFUL - All services restored"
    exit 0
else
    log "⚠️  ROLLBACK PARTIALLY FAILED - Manual intervention required for: ${FAILED_SERVICES[*]}"
    exit 1
fi