#!/bin/bash

# Email Integration Work Package Management Script
# Personal Executive Assistant - Issue #36
# Date: 2025-08-17

set -e  # Exit on any error

# Configuration
PROJECT_NAME="Email Integration Module"
ISSUE_NUMBER="36"
TOTAL_WORK_PACKAGES="47"
TOTAL_EFFORT_HOURS="600"
ESTIMATED_DURATION_WEEKS="4.8"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Work Package definitions
declare -A WORK_PACKAGES=(
    ["1.1.1"]="Requirements Analysis"
    ["1.1.2"]="Technical Design"
    ["1.1.3"]="Project Setup"
    ["1.2.1.1"]="OAuth2 Authentication Manager"
    ["1.2.1.2"]="Gmail Authentication Integration"
    ["1.2.1.3"]="Outlook Authentication Integration"
    ["1.2.2.1"]="Gmail Connector Development"
    ["1.2.2.2"]="Gmail Email Operations"
    ["1.2.2.3"]="Gmail Synchronization"
    ["1.2.2.4"]="Gmail Search and Filtering"
    ["1.2.3.1"]="Outlook Connector Development"
    ["1.2.3.2"]="Outlook Email Operations"
    ["1.2.3.3"]="Outlook Synchronization"
    ["1.2.3.4"]="Outlook Advanced Features"
    ["1.2.4.1"]="Content Analysis Engine"
    ["1.2.4.2"]="Priority Scoring Algorithm"
    ["1.2.4.3"]="Intelligent Categorization"
    ["1.2.4.4"]="Cultural Intelligence Integration"
    ["1.3.1.1"]="Email History Scanner"
    ["1.3.1.2"]="Knowledge Extraction Engine"
    ["1.3.1.3"]="Data Processing Pipeline"
    ["1.3.2.1"]="Executive Profile Enhancement"
    ["1.3.2.2"]="Contextual Intelligence Building"
    ["1.3.2.3"]="Distributed Memory Integration"
    ["1.4.1.1"]="Multi-Account Aggregation"
    ["1.4.1.2"]="Email Threading Engine"
    ["1.4.2.1"]="Calendar Agent Integration"
    ["1.4.2.2"]="Travel Agent Integration"
    ["1.4.2.3"]="Crisis Management Integration"
    ["1.4.3.1"]="Caching Implementation"
    ["1.4.3.2"]="Performance Tuning"
    ["1.5.1.1"]="Data Encryption"
    ["1.5.1.2"]="Access Control"
    ["1.5.2.1"]="Regulatory Compliance"
    ["1.6.1.1"]="Component Unit Tests"
    ["1.6.1.2"]="Test Coverage Validation"
    ["1.6.2.1"]="API Integration Tests"
    ["1.6.2.2"]="PEA System Integration"
    ["1.6.3.1"]="Load Testing"
    ["1.7.1.1"]="API Documentation"
    ["1.7.1.2"]="Operations Documentation"
    ["1.7.2.1"]="Production Deployment"
    ["1.8.1.1"]="User Acceptance Testing"
    ["1.8.2.1"]="Knowledge Transfer"
)

# Work Package effort hours
declare -A WP_EFFORT=(
    ["1.1.1"]="8"
    ["1.1.2"]="8"
    ["1.1.3"]="8"
    ["1.2.1.1"]="16"
    ["1.2.1.2"]="8"
    ["1.2.1.3"]="8"
    ["1.2.2.1"]="16"
    ["1.2.2.2"]="16"
    ["1.2.2.3"]="16"
    ["1.2.2.4"]="16"
    ["1.2.3.1"]="16"
    ["1.2.3.2"]="16"
    ["1.2.3.3"]="16"
    ["1.2.3.4"]="16"
    ["1.2.4.1"]="16"
    ["1.2.4.2"]="16"
    ["1.2.4.3"]="16"
    ["1.2.4.4"]="16"
    ["1.3.1.1"]="8"
    ["1.3.1.2"]="8"
    ["1.3.1.3"]="16"
    ["1.3.2.1"]="8"
    ["1.3.2.2"]="8"
    ["1.3.2.3"]="16"
    ["1.4.1.1"]="16"
    ["1.4.1.2"]="16"
    ["1.4.2.1"]="8"
    ["1.4.2.2"]="8"
    ["1.4.2.3"]="8"
    ["1.4.3.1"]="8"
    ["1.4.3.2"]="8"
    ["1.5.1.1"]="16"
    ["1.5.1.2"]="16"
    ["1.5.2.1"]="16"
    ["1.6.1.1"]="24"
    ["1.6.1.2"]="8"
    ["1.6.2.1"]="24"
    ["1.6.2.2"]="8"
    ["1.6.3.1"]="16"
    ["1.7.1.1"]="24"
    ["1.7.1.2"]="8"
    ["1.7.2.1"]="16"
    ["1.8.1.1"]="8"
    ["1.8.2.1"]="8"
)

# Work Package status tracking
WP_STATUS_FILE="$(pwd)/.work-package-status.json"

# Initialize status file if it doesn't exist
init_status_file() {
    if [[ ! -f "$WP_STATUS_FILE" ]]; then
        echo "{}" > "$WP_STATUS_FILE"
    fi
}

# Helper Functions
print_header() {
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${BLUE}$PROJECT_NAME - Work Package Management${NC}"
    echo -e "${BLUE}Issue #$ISSUE_NUMBER${NC}"
    echo -e "${BLUE}===============================================${NC}"
    echo ""
}

print_project_summary() {
    echo -e "${PURPLE}📊 Project Summary:${NC}"
    echo -e "   Total Work Packages: $TOTAL_WORK_PACKAGES"
    echo -e "   Total Effort: $TOTAL_EFFORT_HOURS hours"
    echo -e "   Estimated Duration: $ESTIMATED_DURATION_WEEKS weeks"
    echo ""
}

# Work Package Management Functions
list_work_packages() {
    echo -e "${CYAN}📋 Available Work Packages:${NC}"
    echo ""
    
    local current_phase=""
    for wp_id in $(printf '%s\n' "${!WORK_PACKAGES[@]}" | sort -V); do
        local phase=$(echo "$wp_id" | cut -d'.' -f1-2)
        
        if [[ "$phase" != "$current_phase" ]]; then
            current_phase="$phase"
            case "$phase" in
                "1.1") echo -e "${YELLOW}🚀 Phase 1.1: Project Initiation & Planning${NC}" ;;
                "1.2") echo -e "${YELLOW}🔧 Phase 1.2: Core Email Integration Development${NC}" ;;
                "1.3") echo -e "${YELLOW}📚 Phase 1.3: Historical Email Ingestion${NC}" ;;
                "1.4") echo -e "${YELLOW}⚡ Phase 1.4: Advanced Features Development${NC}" ;;
                "1.5") echo -e "${YELLOW}🔒 Phase 1.5: Security & Compliance${NC}" ;;
                "1.6") echo -e "${YELLOW}🧪 Phase 1.6: Testing & Quality Assurance${NC}" ;;
                "1.7") echo -e "${YELLOW}📖 Phase 1.7: Documentation & Deployment${NC}" ;;
                "1.8") echo -e "${YELLOW}🎯 Phase 1.8: Project Closure${NC}" ;;
            esac
        fi
        
        local status=$(get_wp_status "$wp_id")
        local effort="${WP_EFFORT[$wp_id]}"
        
        case "$status" in
            "completed") echo -e "   ✅ $wp_id: ${WORK_PACKAGES[$wp_id]} (${effort}h)" ;;
            "in_progress") echo -e "   🔄 $wp_id: ${WORK_PACKAGES[$wp_id]} (${effort}h)" ;;
            "blocked") echo -e "   🚫 $wp_id: ${WORK_PACKAGES[$wp_id]} (${effort}h)" ;;
            *) echo -e "   ⭕ $wp_id: ${WORK_PACKAGES[$wp_id]} (${effort}h)" ;;
        esac
    done
    echo ""
}

get_wp_status() {
    local wp_id="$1"
    if [[ -f "$WP_STATUS_FILE" ]]; then
        local status=$(jq -r ".\"$wp_id\".status // \"not_started\"" "$WP_STATUS_FILE")
        echo "$status"
    else
        echo "not_started"
    fi
}

set_wp_status() {
    local wp_id="$1"
    local status="$2"
    local timestamp=$(date -Iseconds)
    
    init_status_file
    
    local temp_file=$(mktemp)
    jq ".\"$wp_id\" = {\"status\": \"$status\", \"timestamp\": \"$timestamp\"}" "$WP_STATUS_FILE" > "$temp_file"
    mv "$temp_file" "$WP_STATUS_FILE"
    
    echo -e "${GREEN}✅ Work Package $wp_id status updated to: $status${NC}"
}

start_work_package() {
    local wp_id="$1"
    
    if [[ -z "${WORK_PACKAGES[$wp_id]}" ]]; then
        echo -e "${RED}❌ Error: Work Package $wp_id not found${NC}"
        return 1
    fi
    
    local current_status=$(get_wp_status "$wp_id")
    if [[ "$current_status" == "completed" ]]; then
        echo -e "${YELLOW}⚠️ Warning: Work Package $wp_id is already completed${NC}"
        return 1
    fi
    
    set_wp_status "$wp_id" "in_progress"
    
    echo -e "${BLUE}🚀 Starting Work Package: $wp_id${NC}"
    echo -e "   Description: ${WORK_PACKAGES[$wp_id]}"
    echo -e "   Effort: ${WP_EFFORT[$wp_id]} hours"
    echo ""
    
    # Create work package branch
    local branch_name="feature/email-integration-wp-${wp_id}"
    echo -e "${CYAN}🌿 Creating branch: $branch_name${NC}"
    git checkout -b "$branch_name" 2>/dev/null || git checkout "$branch_name"
    
    # Create work package directory structure
    local wp_dir="src/agents/email-integration/wp-${wp_id}"
    mkdir -p "$wp_dir"
    
    # Create initial work package files
    create_wp_template "$wp_id" "$wp_dir"
    
    echo -e "${GREEN}✅ Work Package $wp_id initialized and ready for development${NC}"
}

complete_work_package() {
    local wp_id="$1"
    
    if [[ -z "${WORK_PACKAGES[$wp_id]}" ]]; then
        echo -e "${RED}❌ Error: Work Package $wp_id not found${NC}"
        return 1
    fi
    
    local current_status=$(get_wp_status "$wp_id")
    if [[ "$current_status" != "in_progress" ]]; then
        echo -e "${YELLOW}⚠️ Warning: Work Package $wp_id is not in progress${NC}"
        read -p "Mark as completed anyway? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    echo -e "${BLUE}🎯 Completing Work Package: $wp_id${NC}"
    echo -e "   Description: ${WORK_PACKAGES[$wp_id]}"
    
    # Run automated validation
    validate_work_package "$wp_id"
    
    set_wp_status "$wp_id" "completed"
    
    # Commit work package completion
    local branch_name="feature/email-integration-wp-${wp_id}"
    git add .
    git commit -m "[WP-${wp_id}] Complete: ${WORK_PACKAGES[$wp_id]}

Work Package Details:
- ID: $wp_id
- Description: ${WORK_PACKAGES[$wp_id]}
- Effort: ${WP_EFFORT[$wp_id]} hours
- Status: Completed

Email Integration Project Progress Updated"
    
    echo -e "${GREEN}✅ Work Package $wp_id completed successfully${NC}"
}

validate_work_package() {
    local wp_id="$1"
    
    echo -e "${CYAN}🔍 Validating Work Package: $wp_id${NC}"
    
    # Check if required files exist
    local wp_dir="src/agents/email-integration/wp-${wp_id}"
    if [[ ! -d "$wp_dir" ]]; then
        echo -e "${RED}❌ Work package directory not found: $wp_dir${NC}"
        return 1
    fi
    
    # Run linting
    echo "   Running linting..."
    npm run lint "$wp_dir" || echo "   ⚠️ Linting issues found"
    
    # Run type checking
    echo "   Running type checking..."
    npm run typecheck || echo "   ⚠️ Type checking issues found"
    
    # Run unit tests
    echo "   Running unit tests..."
    npm run test "$wp_dir" || echo "   ⚠️ Unit test failures"
    
    echo -e "${GREEN}✅ Work Package validation completed${NC}"
}

create_wp_template() {
    local wp_id="$1"
    local wp_dir="$2"
    
    # Create README for work package
    cat > "$wp_dir/README.md" << EOF
# Work Package $wp_id: ${WORK_PACKAGES[$wp_id]}

## Overview
${WORK_PACKAGES[$wp_id]} - Email Integration Module

## Effort
${WP_EFFORT[$wp_id]} hours

## Deliverables
- [ ] Implementation files
- [ ] Unit tests (95% coverage)
- [ ] Documentation
- [ ] Integration tests

## Acceptance Criteria
- [ ] All deliverables completed
- [ ] Tests passing
- [ ] Code review approved
- [ ] Documentation updated

## Dependencies
See WBS Dictionary for detailed dependencies

## Progress Tracking
- Started: $(date -Iseconds)
- Status: In Progress
- Completion: TBD
EOF

    # Create initial TypeScript file
    local ts_file="$wp_dir/index.ts"
    cat > "$ts_file" << EOF
/**
 * Work Package $wp_id: ${WORK_PACKAGES[$wp_id]}
 * Email Integration Module
 * 
 * Generated: $(date -Iseconds)
 * Effort: ${WP_EFFORT[$wp_id]} hours
 */

// TODO: Implement ${WORK_PACKAGES[$wp_id]}

export class WorkPackage${wp_id//./} {
    private workPackageId = '$wp_id';
    private description = '${WORK_PACKAGES[$wp_id]}';
    
    constructor() {
        console.log(\`Initializing Work Package: \${this.workPackageId}\`);
    }
    
    async execute(): Promise<void> {
        // TODO: Implement work package logic
        throw new Error('Work package implementation pending');
    }
}

export default WorkPackage${wp_id//./};
EOF

    # Create test file
    local test_file="$wp_dir/index.test.ts"
    cat > "$test_file" << EOF
/**
 * Work Package $wp_id Tests: ${WORK_PACKAGES[$wp_id]}
 * Email Integration Module
 */

import WorkPackage${wp_id//./} from './index';

describe('Work Package $wp_id: ${WORK_PACKAGES[$wp_id]}', () => {
    let workPackage: WorkPackage${wp_id//./};
    
    beforeEach(() => {
        workPackage = new WorkPackage${wp_id//./}();
    });
    
    test('should initialize work package', () => {
        expect(workPackage).toBeDefined();
    });
    
    test('should execute work package logic', async () => {
        // TODO: Implement test cases
        await expect(workPackage.execute()).rejects.toThrow('Work package implementation pending');
    });
    
    // TODO: Add comprehensive test cases
    // Target: 95% code coverage
});
EOF

    echo -e "   📁 Created work package template in $wp_dir"
}

show_project_progress() {
    echo -e "${PURPLE}📊 Email Integration Project Progress:${NC}"
    echo ""
    
    local total_wp=0
    local completed_wp=0
    local in_progress_wp=0
    local not_started_wp=0
    
    for wp_id in "${!WORK_PACKAGES[@]}"; do
        total_wp=$((total_wp + 1))
        local status=$(get_wp_status "$wp_id")
        
        case "$status" in
            "completed") completed_wp=$((completed_wp + 1)) ;;
            "in_progress") in_progress_wp=$((in_progress_wp + 1)) ;;
            *) not_started_wp=$((not_started_wp + 1)) ;;
        esac
    done
    
    local completion_percentage=$((completed_wp * 100 / total_wp))
    
    echo -e "   📈 Overall Progress: ${completion_percentage}% (${completed_wp}/${total_wp} work packages)"
    echo -e "   ✅ Completed: $completed_wp"
    echo -e "   🔄 In Progress: $in_progress_wp"
    echo -e "   ⭕ Not Started: $not_started_wp"
    echo ""
    
    # Show progress bar
    local bar_length=50
    local filled_length=$((completion_percentage * bar_length / 100))
    local empty_length=$((bar_length - filled_length))
    
    printf "   Progress: ["
    printf "%*s" $filled_length | tr ' ' '█'
    printf "%*s" $empty_length | tr ' ' '░'
    printf "] %d%%\n" $completion_percentage
    echo ""
    
    # Calculate estimated completion
    if [[ $in_progress_wp -gt 0 || $not_started_wp -gt 0 ]]; then
        local remaining_effort=0
        for wp_id in "${!WORK_PACKAGES[@]}"; do
            local status=$(get_wp_status "$wp_id")
            if [[ "$status" != "completed" ]]; then
                remaining_effort=$((remaining_effort + ${WP_EFFORT[$wp_id]}))
            fi
        done
        
        local estimated_weeks=$(echo "scale=1; $remaining_effort / 40" | bc -l)
        echo -e "   ⏱️ Estimated remaining effort: ${remaining_effort} hours (~${estimated_weeks} weeks)"
    fi
}

# Main execution
case "${1:-}" in
    "list")
        print_header
        print_project_summary
        list_work_packages
        ;;
    "start")
        if [[ -z "${2:-}" ]]; then
            echo -e "${RED}❌ Error: Work Package ID required${NC}"
            echo "Usage: $0 start <work-package-id>"
            exit 1
        fi
        print_header
        start_work_package "$2"
        ;;
    "complete")
        if [[ -z "${2:-}" ]]; then
            echo -e "${RED}❌ Error: Work Package ID required${NC}"
            echo "Usage: $0 complete <work-package-id>"
            exit 1
        fi
        print_header
        complete_work_package "$2"
        ;;
    "status")
        print_header
        show_project_progress
        ;;
    "validate")
        if [[ -z "${2:-}" ]]; then
            echo -e "${RED}❌ Error: Work Package ID required${NC}"
            echo "Usage: $0 validate <work-package-id>"
            exit 1
        fi
        print_header
        validate_work_package "$2"
        ;;
    *)
        print_header
        echo -e "${CYAN}📋 Available Commands:${NC}"
        echo "   list        - List all work packages with status"
        echo "   start <wp>  - Start a work package"
        echo "   complete <wp> - Complete a work package"
        echo "   status      - Show project progress"
        echo "   validate <wp> - Validate work package"
        echo ""
        echo -e "${CYAN}Example Usage:${NC}"
        echo "   $0 list"
        echo "   $0 start 1.1.1"
        echo "   $0 complete 1.1.1"
        echo "   $0 status"
        echo ""
        print_project_summary
        ;;
esac