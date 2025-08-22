#!/bin/bash
set -euo pipefail

# Phase 1: HSM Production Integration and Core Crypto Hardening
# Deployment strategy: Blue-Green for zero downtime

DEPLOYMENT_TYPE=${1:-"blue-green"}
NAMESPACE="executive-assistant-security"
HSM_CONFIG_SECRET="hsm-production-config"

echo "🔐 Starting Phase 1 Deployment: HSM Production Integration"

# Function to check deployment health
check_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if kubectl get pods -n $NAMESPACE -l app=$service | grep -q "Running"; then
            echo "✅ $service is healthy"
            return 0
        fi
        echo "⏳ Waiting for $service to be ready (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    echo "❌ $service failed to become healthy"
    return 1
}

# Function to perform blue-green deployment
blue_green_deploy() {
    local service=$1
    local manifest=$2
    
    echo "🔄 Performing blue-green deployment for $service"
    
    # Determine current and new versions
    CURRENT_VERSION=$(kubectl get service $service -n $NAMESPACE -o jsonpath='{.spec.selector.version}' 2>/dev/null || echo "none")
    if [ "$CURRENT_VERSION" == "blue" ] || [ "$CURRENT_VERSION" == "none" ]; then
        NEW_VERSION="green"
        OLD_VERSION="blue"
    else
        NEW_VERSION="blue"
        OLD_VERSION="green"
    fi
    
    echo "📦 Deploying $service version: $NEW_VERSION"
    
    # Deploy new version
    sed "s/VERSION_PLACEHOLDER/$NEW_VERSION/g" $manifest | kubectl apply -f -
    
    # Wait for new version to be ready
    if check_health "$service-$NEW_VERSION"; then
        echo "🔀 Switching traffic to $NEW_VERSION"
        kubectl patch service $service -n $NAMESPACE -p "{\"spec\":{\"selector\":{\"version\":\"$NEW_VERSION\"}}}"
        
        # Wait a bit then cleanup old version
        sleep 30
        kubectl delete deployment $service-$OLD_VERSION -n $NAMESPACE --ignore-not-found=true
        echo "🗑️  Cleaned up old version: $OLD_VERSION"
    else
        echo "❌ New version failed health check, keeping current version"
        kubectl delete deployment $service-$NEW_VERSION -n $NAMESPACE --ignore-not-found=true
        exit 1
    fi
}

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Verify HSM connectivity before deployment
echo "🔍 Verifying HSM connectivity..."
if ! ./deployment/scripts/verify-hsm-connection.sh; then
    echo "❌ HSM connectivity check failed"
    exit 1
fi

# Deploy HSM Interface Service
blue_green_deploy "hsm-interface" "deployment/k8s/phase1/hsm-interface.yaml"

# Deploy Post-Quantum Crypto Services
blue_green_deploy "crypto-service" "deployment/k8s/phase1/crypto-service.yaml"

# Deploy Crypto Validation Service
blue_green_deploy "crypto-validator" "deployment/k8s/phase1/crypto-validator.yaml"

# Update secrets rotation job
kubectl apply -f deployment/k8s/phase1/secrets-rotation-job.yaml

# Verify all services are running
echo "🔍 Final health check for all Phase 1 services..."
for service in hsm-interface crypto-service crypto-validator; do
    if ! check_health $service; then
        echo "❌ Phase 1 deployment failed - $service unhealthy"
        exit 1
    fi
done

# Run post-deployment validation
echo "✅ Running Phase 1 validation tests..."
if ! ./deployment/validation/phase1-validation.sh; then
    echo "❌ Phase 1 validation failed"
    exit 1
fi

echo "🎉 Phase 1 deployment completed successfully!"
echo "📊 HSM services are now production-ready with zero downtime"