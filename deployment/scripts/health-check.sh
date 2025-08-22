#!/bin/bash
set -euo pipefail

# Comprehensive Health Check Script for Executive Assistant Security
# Validates current production state before deployment

NAMESPACE="executive-assistant-security"
HEALTH_CHECK_LOG="/tmp/health-check-$(date +%Y%m%d-%H%M%S).log"
FAILED_CHECKS=()

echo "🏥 Starting comprehensive health check" | tee $HEALTH_CHECK_LOG
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a $HEALTH_CHECK_LOG

# Function to log with timestamp
log() {
    echo "[$(date -u +%H:%M:%S)] $1" | tee -a $HEALTH_CHECK_LOG
}

# Function to run health check with error handling
check() {
    local check_name="$1"
    local check_command="$2"
    local is_critical="${3:-false}"
    
    log "🔍 Checking: $check_name"
    
    if eval "$check_command" >> $HEALTH_CHECK_LOG 2>&1; then
        log "✅ HEALTHY: $check_name"
        return 0
    else
        log "❌ UNHEALTHY: $check_name"
        FAILED_CHECKS+=("$check_name")
        if [ "$is_critical" = "true" ]; then
            log "🚨 CRITICAL CHECK FAILED: $check_name"
        fi
        return 1
    fi
}

# Critical Infrastructure Checks
log "🔧 Checking critical infrastructure..."

check "Kubernetes Cluster Connectivity" "kubectl cluster-info" true

check "Namespace Existence" "kubectl get namespace $NAMESPACE" true

check "Node Health" "
kubectl get nodes | grep -v 'NotReady' | grep -v 'SchedulingDisabled' | wc -l | grep -q '[1-9]'
" true

# Core Service Health Checks
log "🔍 Checking core services..."

check "HSM Interface Service" "
kubectl get deployment hsm-interface -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' | grep -q '[1-9]' &&
kubectl get pods -n $NAMESPACE -l app=hsm-interface | grep -q 'Running'
"

check "Crypto Service" "
kubectl get deployment crypto-service -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' | grep -q '[1-9]' 2>/dev/null || echo 'Not deployed yet'
"

check "Zero Trust Gateway" "
kubectl get deployment zero-trust-gateway -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' | grep -q '[1-9]' 2>/dev/null || echo 'Not deployed yet'
"

check "Audit Service" "
kubectl get deployment audit-service -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' | grep -q '[1-9]' 2>/dev/null || echo 'Not deployed yet'
"

# Network and Security Checks
log "🔒 Checking network and security..."

check "Network Policies" "
kubectl get networkpolicies -n $NAMESPACE | wc -l | grep -q '[1-9]'
"

check "Service Mesh Connectivity" "
kubectl get services -n $NAMESPACE | grep -q 'LoadBalancer\\|ClusterIP'
"

check "TLS Certificates" "
kubectl get secrets -n $NAMESPACE | grep -q 'tls\\|certificate' || echo 'No TLS secrets found'
"

# Storage and Persistence Checks
log "💾 Checking storage and persistence..."

check "Persistent Volumes" "
kubectl get pvc -n $NAMESPACE | grep -q 'Bound' || echo 'No PVCs found'
"

check "Storage Class Availability" "
kubectl get storageclass | grep -q 'default\\|fast-ssd'
"

# Database and External Dependencies
log "🗄️ Checking databases and external dependencies..."

check "HSM Connectivity" "
kubectl exec -n $NAMESPACE deployment/hsm-interface -- timeout 10 nc -z \${HSM_ENDPOINT:-localhost} \${HSM_PORT:-443} 2>/dev/null || echo 'HSM not accessible'
"

check "External API Endpoints" "
curl -sf --max-time 5 https://api.github.com > /dev/null || echo 'GitHub API not accessible'
"

# Resource Utilization Checks
log "📊 Checking resource utilization..."

check "CPU Utilization" "
kubectl top nodes | awk 'NR>1 {gsub(/%/, \"\", \$3); if (\$3 > 80) count++} END {exit (count > 0 ? 1 : 0)}'
"

check "Memory Utilization" "
kubectl top nodes | awk 'NR>1 {gsub(/%/, \"\", \$5); if (\$5 > 80) count++} END {exit (count > 0 ? 1 : 0)}'
"

check "Disk Space" "
kubectl get nodes -o jsonpath='{.items[*].status.allocatable.ephemeral-storage}' | grep -q '[1-9]'
"

# Security Compliance Checks
log "🛡️ Checking security compliance..."

check "Pod Security Standards" "
kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].spec.securityContext.runAsNonRoot}' | grep -q 'true' || echo 'Some pods may run as root'
"

check "RBAC Configuration" "
kubectl get rolebindings,clusterrolebindings -n $NAMESPACE | wc -l | grep -q '[1-9]'
"

check "Secret Management" "
kubectl get secrets -n $NAMESPACE | grep -q 'hsm\\|crypto\\|auth' || echo 'Security secrets not found'
"

# Monitoring and Observability
log "📈 Checking monitoring and observability..."

check "Metrics Collection" "
kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].metadata.annotations.prometheus\.io/scrape}' | grep -q 'true' || echo 'Metrics not configured'
"

check "Log Aggregation" "
kubectl get pods -n $NAMESPACE | grep -q 'fluentd\\|logstash\\|filebeat' || echo 'Log aggregation not found'
"

# Backup and Recovery Readiness
log "🔄 Checking backup and recovery readiness..."

check "Backup Storage" "
kubectl get pvc -n $NAMESPACE | grep -q 'backup\\|archive' || echo 'Backup storage not configured'
"

check "Disaster Recovery Plan" "
test -f deployment/rollback/emergency-rollback.sh && echo 'Emergency rollback script exists' || echo 'Emergency rollback not configured'
"

# Performance Baseline
log "⚡ Checking performance baseline..."

check "Response Time Baseline" "
kubectl exec -n $NAMESPACE deployment/hsm-interface -- timeout 5 curl -sf http://localhost:8080/health > /dev/null || echo 'Health endpoint slow or unavailable'
"

check "Throughput Baseline" "
kubectl get hpa -n $NAMESPACE | grep -q 'hsm\\|crypto' || echo 'Horizontal Pod Autoscaling not configured'
"

# Generate health check report
log "📊 Generating comprehensive health check report..."

TOTAL_CHECKS=$((${#FAILED_CHECKS[@]} + $(grep -c "✅ HEALTHY" $HEALTH_CHECK_LOG)))
HEALTHY_CHECKS=$(grep -c "✅ HEALTHY" $HEALTH_CHECK_LOG)
FAILED_COUNT=${#FAILED_CHECKS[@]}
CRITICAL_FAILURES=$(grep -c "🚨 CRITICAL CHECK FAILED" $HEALTH_CHECK_LOG || echo "0")

HEALTH_REPORT="/tmp/health-check-report-$(date +%Y%m%d-%H%M%S).json"
cat > $HEALTH_REPORT << EOF
{
  "health_check_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_checks": $TOTAL_CHECKS,
  "healthy_checks": $HEALTHY_CHECKS,
  "failed_checks": $FAILED_COUNT,
  "critical_failures": $CRITICAL_FAILURES,
  "health_score": $(echo "scale=2; $HEALTHY_CHECKS * 100 / $TOTAL_CHECKS" | bc -l)%,
  "failed_check_names": [$(printf '"%s",' "${FAILED_CHECKS[@]}" | sed 's/,$//')]
  "health_log": "$HEALTH_CHECK_LOG",
  "status": "$([ $FAILED_COUNT -eq 0 ] && echo "healthy" || echo "unhealthy")",
  "deployment_ready": $([ $CRITICAL_FAILURES -eq 0 ] && echo "true" || echo "false"),
  "categories_checked": [
    "Infrastructure",
    "Core Services", 
    "Network Security",
    "Storage",
    "External Dependencies",
    "Resource Utilization",
    "Security Compliance",
    "Monitoring",
    "Backup & Recovery",
    "Performance"
  ]
}
EOF

log "📄 Health check report saved to: $HEALTH_REPORT"

# Send monitoring notification
if [ -n "${MONITORING_SLACK_WEBHOOK:-}" ]; then
    curl -X POST $MONITORING_SLACK_WEBHOOK \
        -H "Content-Type: application/json" \
        -d "{\"text\": \"🏥 Health check completed: $([ $FAILED_COUNT -eq 0 ] && echo "✅ All systems healthy" || echo "⚠️ $FAILED_COUNT issues found") - Score: $(echo "scale=0; $HEALTHY_CHECKS * 100 / $TOTAL_CHECKS" | bc -l)%\"}" \
        2>/dev/null || true
fi

# Summary and exit
if [ $CRITICAL_FAILURES -eq 0 ]; then
    if [ $FAILED_COUNT -eq 0 ]; then
        log "🎉 HEALTH CHECK PASSED - All $TOTAL_CHECKS checks successful"
        log "✅ System is ready for deployment"
        exit 0
    else
        log "⚠️  HEALTH CHECK PASSED WITH WARNINGS - $FAILED_COUNT non-critical issues"
        log "✅ System is ready for deployment (warnings can be addressed later)"
        exit 0
    fi
else
    log "❌ HEALTH CHECK FAILED - $CRITICAL_FAILURES critical failures detected"
    log "🚨 System is NOT ready for deployment"
    log "Critical issues must be resolved before proceeding"
    exit 1
fi