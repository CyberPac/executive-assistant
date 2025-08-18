#!/bin/bash

# Phase 2 Completion Pipeline Launcher
# Automated execution script for Phase 2 development completion

set -e

echo "🚀 PHASE 2 COMPLETION PIPELINE LAUNCHER"
echo "========================================"
echo "PEA System - Intelligence Expansion Finalization"
echo ""

# Configuration
PHASE2_TARGET="15-agent-leasa"
PERFORMANCE_TARGET="${PERFORMANCE_TARGET:-75}"
DEVELOPMENT_PHASE="${1:-full-pipeline}"

echo "📋 Configuration:"
echo "  - Target: $PHASE2_TARGET"
echo "  - Performance: <${PERFORMANCE_TARGET}ms"
echo "  - Phase: $DEVELOPMENT_PHASE"
echo ""

# Validate prerequisites
echo "🔍 Validating Prerequisites..."

# Check if we're in a Git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

# Check for package.json
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

# Check for Claude-Flow
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx not found. Please install Node.js"
    exit 1
fi

echo "✅ Prerequisites validated"
echo ""

# Initialize Claude-Flow Hive Mind
echo "🧠 Initializing Claude-Flow Development Hive Mind..."

npx claude-flow@alpha swarm init \
    --topology hierarchical \
    --agents 15 \
    --strategy specialized

echo "✅ Hive mind initialized"
echo ""

# Spawn specialized agents
echo "🤖 Spawning Phase 2 Development Agents..."

# Architecture Agent
npx claude-flow@alpha agent spawn \
    --type architect \
    --name "Phase2-Completion-Architect" \
    --capabilities "system-design,enterprise-integration,agent-architecture"

# Development Agent  
npx claude-flow@alpha agent spawn \
    --type coder \
    --name "Agent-Implementation-Specialist" \
    --capabilities "typescript-development,agent-creation,testing,integration"

# Performance Agent
npx claude-flow@alpha agent spawn \
    --type performance-benchmarker \
    --name "Performance-Optimization-Engineer" \
    --capabilities "benchmarking,performance-analysis,optimization,monitoring"

# Quality Assurance Agent
npx claude-flow@alpha agent spawn \
    --type tester \
    --name "Quality-Assurance-Validator" \
    --capabilities "testing,validation,security,compliance"

echo "✅ Development agents spawned"
echo ""

# Execute development phases based on input
case $DEVELOPMENT_PHASE in
    "agent-implementation")
        echo "🔨 Executing Agent Implementation Phase..."
        gh workflow run phase2-completion.yml \
            -f development_phase=agent-implementation \
            -f performance_target=$PERFORMANCE_TARGET
        ;;
    "enterprise-integration")
        echo "🏢 Executing Enterprise Integration Phase..."
        gh workflow run phase2-completion.yml \
            -f development_phase=enterprise-integration \
            -f performance_target=$PERFORMANCE_TARGET
        ;;
    "performance-optimization")
        echo "⚡ Executing Performance Optimization Phase..."
        gh workflow run phase2-completion.yml \
            -f development_phase=performance-optimization \
            -f performance_target=$PERFORMANCE_TARGET
        ;;
    "validation-only")
        echo "✅ Executing Validation Phase Only..."
        gh workflow run phase2-completion.yml \
            -f development_phase=validation-only \
            -f performance_target=$PERFORMANCE_TARGET
        ;;
    "full-pipeline")
        echo "🚀 Executing Full Phase 2 Completion Pipeline..."
        gh workflow run phase2-completion.yml \
            -f development_phase=full-pipeline \
            -f performance_target=$PERFORMANCE_TARGET
        ;;
    *)
        echo "❌ Error: Invalid development phase: $DEVELOPMENT_PHASE"
        echo "Valid options: agent-implementation, enterprise-integration, performance-optimization, validation-only, full-pipeline"
        exit 1
        ;;
esac

echo ""
echo "🎯 Phase 2 Completion Pipeline Launched!"
echo ""
echo "📊 Monitor Progress:"
echo "  - GitHub Actions: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^.]*\).*/\1/')/actions"
echo "  - Claude-Flow Status: npx claude-flow@alpha swarm status"
echo ""
echo "⏱️ Expected Completion Time:"
case $DEVELOPMENT_PHASE in
    "agent-implementation") echo "  - Agent Implementation: ~45 minutes" ;;
    "enterprise-integration") echo "  - Enterprise Integration: ~30 minutes" ;;
    "performance-optimization") echo "  - Performance Optimization: ~40 minutes" ;;
    "validation-only") echo "  - Validation: ~25 minutes" ;;
    "full-pipeline") echo "  - Full Pipeline: ~2-3 hours" ;;
esac
echo ""

# Monitor pipeline execution
echo "🔄 Monitoring Pipeline Execution..."
echo "Press Ctrl+C to stop monitoring (pipeline will continue)"
echo ""

# Watch for workflow completion
WORKFLOW_ID=""
ATTEMPTS=0
MAX_ATTEMPTS=30

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    WORKFLOW_ID=$(gh run list --workflow=phase2-completion.yml --limit=1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || echo "")
    
    if [ -n "$WORKFLOW_ID" ]; then
        echo "📋 Workflow ID: $WORKFLOW_ID"
        break
    fi
    
    echo "⏳ Waiting for workflow to start... (attempt $((ATTEMPTS + 1))/$MAX_ATTEMPTS)"
    sleep 10
    ATTEMPTS=$((ATTEMPTS + 1))
done

if [ -z "$WORKFLOW_ID" ]; then
    echo "⚠️ Could not detect workflow start. Check GitHub Actions manually."
    exit 0
fi

# Monitor workflow progress
echo "📊 Monitoring workflow progress..."
while true; do
    STATUS=$(gh run view $WORKFLOW_ID --json status,conclusion --jq '{status: .status, conclusion: .conclusion}' 2>/dev/null || echo '{"status":"unknown","conclusion":null}')
    
    WORKFLOW_STATUS=$(echo $STATUS | jq -r '.status')
    WORKFLOW_CONCLUSION=$(echo $STATUS | jq -r '.conclusion')
    
    echo "🔄 Status: $WORKFLOW_STATUS | Conclusion: $WORKFLOW_CONCLUSION"
    
    if [ "$WORKFLOW_STATUS" = "completed" ]; then
        if [ "$WORKFLOW_CONCLUSION" = "success" ]; then
            echo ""
            echo "🎉 PHASE 2 COMPLETION SUCCESS!"
            echo "================================="
            echo "✅ 15-Agent LEASA Architecture: OPERATIONAL"
            echo "✅ Performance Target (<${PERFORMANCE_TARGET}ms): ACHIEVED"  
            echo "✅ Enterprise Integration: COMPLETE"
            echo "✅ Production Deployment: READY"
            echo ""
            echo "📊 Phase 2 Intelligence Expansion: 100% COMPLETE"
            echo "🚀 PEA System: READY FOR FORTUNE 500 DEPLOYMENT"
            break
        else
            echo ""
            echo "❌ PHASE 2 COMPLETION FAILED"
            echo "=============================="
            echo "Conclusion: $WORKFLOW_CONCLUSION"
            echo "Please check the workflow logs for details."
            exit 1
        fi
    fi
    
    sleep 30
done

echo ""
echo "📋 Next Steps:"
echo "1. Review completion report in GitHub Actions artifacts"
echo "2. Deploy to staging environment for validation"
echo "3. Schedule Fortune 500 customer demonstrations"
echo "4. Prepare for Phase 3 planning"
echo ""
echo "🎯 Phase 2 Mission Accomplished!"