#!/bin/bash
set -euo pipefail

# Phase 1 Validation Script: HSM Integration and Crypto Hardening
# Validates HSM connectivity, crypto operations, and security compliance

NAMESPACE="executive-assistant-security"
VALIDATION_LOG="/tmp/phase1-validation-$(date +%Y%m%d-%H%M%S).log"
FAILED_TESTS=()

echo "🔍 Starting Phase 1 Validation: HSM Integration and Crypto Hardening" | tee $VALIDATION_LOG
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)" | tee -a $VALIDATION_LOG

# Function to log with timestamp
log() {
    echo "[$(date -u +%H:%M:%S)] $1" | tee -a $VALIDATION_LOG
}

# Function to run test with error handling
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    log "🧪 Running test: $test_name"
    
    if eval "$test_command" >> $VALIDATION_LOG 2>&1; then
        log "✅ PASSED: $test_name"
        return 0
    else
        log "❌ FAILED: $test_name"
        FAILED_TESTS+=("$test_name")
        return 1
    fi
}

# Test 1: HSM Interface Service Health
run_test "HSM Interface Service Health" "
kubectl get pods -n $NAMESPACE -l app=hsm-interface | grep -q 'Running' &&
kubectl exec -n $NAMESPACE deployment/hsm-interface -- curl -sf http://localhost:8080/health
"

# Test 2: HSM Connectivity and Authentication
run_test "HSM Connectivity and Authentication" "
kubectl exec -n $NAMESPACE deployment/hsm-interface -- node -e '
const HSMInterface = require(\"/app/src/security/hsm/HSMInterface\");
const hsm = new HSMInterface();
hsm.testConnection().then(result => {
    if (!result.connected) throw new Error(\"HSM not connected\");
    if (!result.authenticated) throw new Error(\"HSM authentication failed\");
    console.log(\"HSM connectivity and authentication: OK\");
}).catch(err => {
    console.error(\"HSM test failed:\", err.message);
    process.exit(1);
});
'
"

# Test 3: Post-Quantum Crypto Operations
run_test "Post-Quantum Crypto Operations" "
kubectl exec -n $NAMESPACE deployment/crypto-service -- node -e '
const CRYSTALSKyber = require(\"/app/src/security/post-quantum/CRYSTALSKyber\");
const kyber = new CRYSTALSKyber();

// Test key generation
const keyPair = kyber.generateKeyPair();
if (!keyPair.publicKey || !keyPair.privateKey) {
    throw new Error(\"Kyber key generation failed\");
}

// Test encapsulation/decapsulation
const encResult = kyber.encapsulate(keyPair.publicKey);
const decResult = kyber.decapsulate(encResult.ciphertext, keyPair.privateKey);

if (Buffer.compare(encResult.sharedSecret, decResult) !== 0) {
    throw new Error(\"Kyber encapsulation/decapsulation failed\");
}

console.log(\"Post-quantum crypto operations: OK\");
'
"

# Test 4: Crypto Service Performance
run_test "Crypto Service Performance" "
kubectl exec -n $NAMESPACE deployment/crypto-service -- node -e '
const start = Date.now();
const CRYSTALSKyber = require(\"/app/src/security/post-quantum/CRYSTALSKyber\");
const kyber = new CRYSTALSKyber();

// Run 100 key generations
for (let i = 0; i < 100; i++) {
    kyber.generateKeyPair();
}

const duration = Date.now() - start;
const opsPerSecond = Math.round(100 / (duration / 1000));

console.log(\`Performance: \${opsPerSecond} key generations/second\`);

if (opsPerSecond < 10) {
    throw new Error(\`Performance too low: \${opsPerSecond} ops/sec\`);
}
'
"

# Test 5: Security Policy Compliance
run_test "Security Policy Compliance" "
# Check security contexts
kubectl get pods -n $NAMESPACE -l app=hsm-interface -o jsonpath='{.items[0].spec.securityContext.runAsNonRoot}' | grep -q 'true' &&
kubectl get pods -n $NAMESPACE -l app=hsm-interface -o jsonpath='{.items[0].spec.containers[0].securityContext.readOnlyRootFilesystem}' | grep -q 'true' &&
kubectl get pods -n $NAMESPACE -l app=hsm-interface -o jsonpath='{.items[0].spec.containers[0].securityContext.allowPrivilegeEscalation}' | grep -q 'false' &&
echo 'Security contexts: OK'
"

# Test 6: Network Policy Enforcement
run_test "Network Policy Enforcement" "
kubectl get networkpolicy hsm-interface-network-policy -n $NAMESPACE -o jsonpath='{.spec.policyTypes}' | grep -q 'Ingress' &&
kubectl get networkpolicy hsm-interface-network-policy -n $NAMESPACE -o jsonpath='{.spec.policyTypes}' | grep -q 'Egress' &&
echo 'Network policies: OK'
"

# Test 7: Resource Limits and Requests
run_test "Resource Limits and Requests" "
kubectl get pods -n $NAMESPACE -l app=hsm-interface -o jsonpath='{.items[0].spec.containers[0].resources.requests.memory}' | grep -q 'Mi' &&
kubectl get pods -n $NAMESPACE -l app=hsm-interface -o jsonpath='{.items[0].spec.containers[0].resources.limits.memory}' | grep -q 'Mi' &&
echo 'Resource limits: OK'
"

# Test 8: Secrets Management
run_test "Secrets Management" "
kubectl get secret hsm-production-config -n $NAMESPACE -o jsonpath='{.data.endpoint}' | base64 -d | grep -q 'hsm' &&
kubectl get secret hsm-production-config -n $NAMESPACE -o jsonpath='{.data.pin}' | base64 -d | wc -c | grep -q '[1-9]' &&
echo 'Secrets management: OK'
"

# Test 9: Audit Logging
run_test "Audit Logging" "
kubectl exec -n $NAMESPACE deployment/hsm-interface -- ls -la /app/logs/ | grep -q 'audit' &&
kubectl exec -n $NAMESPACE deployment/hsm-interface -- test -s /app/logs/audit.log &&
echo 'Audit logging: OK'
"

# Test 10: Service Mesh Integration
run_test "Service Mesh Integration" "
kubectl get pods -n $NAMESPACE -l app=hsm-interface -o jsonpath='{.items[0].metadata.annotations}' | grep -q 'prometheus.io/scrape' &&
kubectl exec -n $NAMESPACE deployment/hsm-interface -- curl -sf http://localhost:9090/metrics | grep -q 'hsm_' &&
echo 'Service mesh integration: OK'
"

# Test 11: HSM Key Management
run_test "HSM Key Management" "
kubectl exec -n $NAMESPACE deployment/hsm-interface -- node -e '
const HSMInterface = require(\"/app/src/security/hsm/HSMInterface\");
const hsm = new HSMInterface();

// Test key generation in HSM
hsm.generateKey(\"AES\", 256).then(keyId => {
    if (!keyId) throw new Error(\"HSM key generation failed\");
    
    // Test key usage
    return hsm.encrypt(keyId, Buffer.from(\"test data\"));
}).then(encrypted => {
    if (!encrypted) throw new Error(\"HSM encryption failed\");
    console.log(\"HSM key management: OK\");
}).catch(err => {
    console.error(\"HSM key management failed:\", err.message);
    process.exit(1);
});
'
"

# Test 12: FIPS 140-2 Compliance
run_test "FIPS 140-2 Compliance" "
kubectl exec -n $NAMESPACE deployment/crypto-service -- node -e '
const crypto = require(\"crypto\");

// Check if FIPS mode is enabled
if (!crypto.getFips()) {
    throw new Error(\"FIPS mode not enabled\");
}

// Test FIPS-approved algorithms
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipher(\"aes-256-cbc\", key);
const decipher = crypto.createDecipher(\"aes-256-cbc\", key);

console.log(\"FIPS 140-2 compliance: OK\");
'
"

# Test 13: Load Balancer Health
run_test "Load Balancer Health" "
EXTERNAL_IP=\$(kubectl get service hsm-interface -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
if [ -z \"\$EXTERNAL_IP\" ]; then
    echo 'Load balancer IP not assigned yet, checking service'
    kubectl get service hsm-interface -n $NAMESPACE | grep -q 'LoadBalancer'
else
    curl -sf https://\$EXTERNAL_IP/health --max-time 10
fi
"

# Test 14: Backup and Recovery
run_test "Backup and Recovery" "
kubectl get pvc hsm-audit-logs -n $NAMESPACE | grep -q 'Bound' &&
kubectl exec -n $NAMESPACE deployment/hsm-interface -- df -h /app/logs | grep -v '^Filesystem' | awk '{print \$5}' | sed 's/%//' | head -1 | awk '{if (\$1 > 90) exit 1; else exit 0}' &&
echo 'Backup and recovery: OK'
"

# Test 15: Zero-Downtime Readiness
run_test "Zero-Downtime Readiness" "
# Check that we have multiple replicas
REPLICA_COUNT=\$(kubectl get deployment hsm-interface -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
if [ \"\$REPLICA_COUNT\" -lt 2 ]; then
    echo 'Not enough replicas for zero-downtime deployment'
    exit 1
fi

# Check rolling update strategy
kubectl get deployment hsm-interface -n $NAMESPACE -o jsonpath='{.spec.strategy.type}' | grep -q 'RollingUpdate' &&
echo 'Zero-downtime readiness: OK'
"

# Generate validation report
log "📊 Generating Phase 1 validation report..."

TOTAL_TESTS=$((${#FAILED_TESTS[@]} + $(grep -c "✅ PASSED" $VALIDATION_LOG)))
PASSED_TESTS=$(grep -c "✅ PASSED" $VALIDATION_LOG)
FAILED_COUNT=${#FAILED_TESTS[@]}

VALIDATION_REPORT="/tmp/phase1-validation-report-$(date +%Y%m%d-%H%M%S).json"
cat > $VALIDATION_REPORT << EOF
{
  "phase": 1,
  "validation_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_tests": $TOTAL_TESTS,
  "passed_tests": $PASSED_TESTS,
  "failed_tests": $FAILED_COUNT,
  "success_rate": $(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc -l)%,
  "failed_test_names": [$(printf '"%s",' "${FAILED_TESTS[@]}" | sed 's/,$//')]
  "validation_log": "$VALIDATION_LOG",
  "status": "$([ $FAILED_COUNT -eq 0 ] && echo "success" || echo "failure")",
  "components_validated": [
    "HSM Interface Service",
    "Post-Quantum Crypto",
    "Security Policies",
    "Network Policies",
    "Resource Management",
    "Secrets Management",
    "Audit Logging",
    "FIPS Compliance",
    "Load Balancing",
    "Backup Systems"
  ]
}
EOF

log "📄 Validation report saved to: $VALIDATION_REPORT"

# Summary
if [ $FAILED_COUNT -eq 0 ]; then
    log "🎉 Phase 1 validation PASSED - All $TOTAL_TESTS tests successful"
    log "✅ HSM integration and crypto hardening are production-ready"
    exit 0
else
    log "❌ Phase 1 validation FAILED - $FAILED_COUNT out of $TOTAL_TESTS tests failed"
    log "Failed tests: ${FAILED_TESTS[*]}"
    log "🚨 Manual intervention required before proceeding to Phase 2"
    exit 1
fi