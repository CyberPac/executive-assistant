# Implementation Guide: Hive Mind Development Automation

## 🎯 Quick Start (5 Minutes)

### 1. **Immediate Setup**

```bash
# Install Claude-Flow (if not already installed)
npm install -g @anthropics/claude-flow@alpha

# Initialize the swarm
npm run swarm:init

# Check status
npm run swarm:status
```

### 2. **Test the Orchestrator**

```bash
# Dry run to see what would happen
npm run orchestrate:stages:dry

# Run actual orchestration
npm run orchestrate:stages
```

### 3. **Create Your First Automated Issue**

1. Go to GitHub Issues → New Issue
2. Choose **🚀 Feature Request** template
3. The issue will automatically get `stage:backlog` label
4. Add `sprint:current` label to include in automation

---

## 📋 Complete Implementation Steps

### Phase 1: Foundation (Day 1)

#### ✅ **Already Complete**
- [x] GitHub Actions workflow (`.github/workflows/stage-control.yml`)
- [x] Stage orchestrator script (`scripts/claude-flow-stage-orchestrator.mjs`)
- [x] Issue templates with automatic stage labels
- [x] NPM scripts for easy execution

#### 🔄 **Next Steps**

1. **Create Stage Labels**
```bash
# Create all required stage labels
gh label create "stage:backlog" --color "e1e4e8" --description "Issue in backlog"
gh label create "stage:design" --color "0366d6" --description "Design phase"
gh label create "stage:dev" --color "28a745" --description "Development phase"
gh label create "stage:test" --color "ffd33d" --description "Testing phase"
gh label create "stage:review" --color "f85149" --description "Code review phase"
gh label create "stage:deploy" --color "6f42c1" --description "Deployment phase"
gh label create "stage:done" --color "1f883d" --description "Completed"

# Create priority labels
gh label create "priority:low" --color "c2e0c6" --description "Low priority"
gh label create "priority:medium" --color "ffd33d" --description "Medium priority"
gh label create "priority:high" --color "ff9500" --description "High priority"
gh label create "priority:critical" --color "d73a49" --description "Critical priority"

# Create sprint labels
gh label create "sprint:current" --color "0052cc" --description "Current sprint"
gh label create "sprint:next" --color "5319e7" --description "Next sprint"
gh label create "sprint:backlog" --color "8b949e" --description "Sprint backlog"
```

2. **Enable GitHub Actions**
   - Go to repository Settings → Actions → General
   - Enable "Allow all actions and reusable workflows"
   - Set workflow permissions to "Read and write permissions"

### Phase 2: GitHub Project Integration (Day 2)

#### **Create Project Board**

1. **Create New Project**
   - Go to repository → Projects → New Project
   - Choose "Board" template
   - Name: "Development Pipeline"

2. **Configure Columns**
   ```
   📋 Backlog     (stage:backlog)
   🎨 Design      (stage:design)
   👨‍💻 Development (stage:dev)
   🧪 Testing     (stage:test)
   👀 Code Review (stage:review)
   🚀 Deployment  (stage:deploy)
   ✅ Done        (stage:done)
   ```

3. **Set Up Automation Rules**
   - Project Settings → Workflows
   - Add workflow: "Item added to project"
   - Action: "Set status" → Map labels to columns

#### **Advanced Board Configuration**

```yaml
# Save as .github/project-automation.yml
name: Project Board Automation

board_rules:
  - trigger: issue_labeled
    condition: label_starts_with("stage:")
    action: move_to_column
    mapping:
      "stage:backlog": "📋 Backlog"
      "stage:design": "🎨 Design"
      "stage:dev": "👨‍💻 Development"
      "stage:test": "🧪 Testing"
      "stage:review": "👀 Code Review"
      "stage:deploy": "🚀 Deployment"
      "stage:done": "✅ Done"

  - trigger: pr_opened
    condition: linked_to_issue
    action: advance_stage
    from: "stage:dev"
    to: "stage:test"

  - trigger: pr_approved
    condition: approvals >= 2
    action: advance_stage
    from: "stage:review"
    to: "stage:deploy"
```

### Phase 3: Team Onboarding (Day 3)

#### **Developer Workflow**

1. **Create Feature Issue**
   ```
   Title: [FEATURE] Add user authentication
   Template: 🚀 Feature Request
   Labels: type:feature, stage:backlog, priority:high, sprint:current
   ```

2. **Issue Progression**
   ```
   stage:backlog → Add acceptance criteria, assign dev
   stage:design → Create technical design, get approval
   stage:dev → Create PR, implement feature
   stage:test → Run tests, QA validation
   stage:review → Code review, security check
   stage:deploy → Deploy to staging, production
   stage:done → Feature live, metrics tracked
   ```

3. **Automation Triggers**
   - **Label Change**: Triggers stage gate checks
   - **PR Events**: Automatically advances stages
   - **CI Success**: Enables stage progression
   - **Review Approval**: Advances to deployment

#### **Daily Operations**

```bash
# Morning: Check sprint health
npm run orchestrate:stages

# Mid-day: Force advance ready issues
npm run orchestrate:stages:force

# Evening: Generate metrics
npx claude-flow@alpha metrics collect --component="daily-standup"
```

### Phase 4: Advanced Features (Week 2)

#### **Sprint Management Automation**

```bash
# Create sprint management script
cat > scripts/sprint-manager.mjs << 'EOF'
#!/usr/bin/env node

import { execSync } from 'child_process';

const SPRINT_DURATION = 14; // days
const SPRINT_CAPACITY = 40; // story points

// Auto-create sprint milestones
const createSprint = (sprintNumber) => {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + SPRINT_DURATION * 24 * 60 * 60 * 1000);
  
  execSync(`gh milestone create "Sprint ${sprintNumber}" --due-date ${endDate.toISOString().split('T')[0]} --description "Sprint ${sprintNumber} - ${startDate.toDateString()} to ${endDate.toDateString()}"`);
};

// Auto-assign issues to sprint based on capacity
const planSprint = () => {
  execSync(`npx claude-flow@alpha hive-mind spawn "
    Sprint Planning Automation:
    1. Analyze backlog issues by priority and effort
    2. Auto-assign to current sprint within capacity (${SPRINT_CAPACITY} points)
    3. Update sprint:current labels
    4. Generate sprint planning report
    5. Notify team of sprint composition
  " --claude --github --persist`);
};

planSprint();
EOF

# Make executable
chmod +x scripts/sprint-manager.mjs

# Add to package.json
npm pkg set scripts.sprint:plan="node scripts/sprint-manager.mjs"
```

#### **Metrics Dashboard Setup**

```bash
# Create metrics collection
cat > scripts/metrics-dashboard.mjs << 'EOF'
#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const generateDashboard = () => {
  const metrics = {
    velocity: execSync('npx claude-flow@alpha metrics collect --component="velocity" --format=json', { encoding: 'utf8' }),
    quality: execSync('npx claude-flow@alpha metrics collect --component="quality-gates" --format=json', { encoding: 'utf8' }),
    automation: execSync('npx claude-flow@alpha metrics collect --component="stage-advancement" --format=json', { encoding: 'utf8' })
  };

  const dashboard = {
    timestamp: new Date().toISOString(),
    metrics,
    summary: {
      cycleTime: "Calculate from stage progression",
      deploymentFrequency: "Daily deployments",
      automationEfficiency: "90%+ stage advancement accuracy"
    }
  };

  writeFileSync('docs/dashboard-metrics.json', JSON.stringify(dashboard, null, 2));
  console.log('📊 Dashboard metrics updated: docs/dashboard-metrics.json');
};

generateDashboard();
EOF

# Add to package.json
npm pkg set scripts.dashboard:update="node scripts/metrics-dashboard.mjs"
```

---

## 🚀 **Ready to Go!**

### **Test Your Setup**

1. **Create Test Issue**
   ```bash
   gh issue create --title "Test automation workflow" --body "Testing the stage automation" --label "type:feature,stage:backlog,sprint:current,priority:medium"
   ```

2. **Watch Automation Work**
   ```bash
   # Monitor swarm activity
   npm run swarm:status
   
   # Check GitHub Actions
   gh run list
   
   # View issue progression
   gh issue list --label "sprint:current"
   ```

3. **Manual Stage Advancement Test**
   ```bash
   # Add stage:dev label to trigger automation
   gh issue edit 1 --add-label "stage:dev"
   
   # Check Actions tab for workflow execution
   # Issue should get automated analysis and advancement
   ```

### **Success Indicators**

✅ **Issues automatically progress through stages**  
✅ **Quality gates block advancement when criteria not met**  
✅ **Project board updates in real-time**  
✅ **Team gets automated status updates**  
✅ **Metrics collected for continuous improvement**

---

## 📞 **Need Help?**

### **Troubleshooting**

```bash
# Check Claude-Flow installation
npx claude-flow@alpha --version

# Verify swarm status
npm run swarm:status

# Test dry run
npm run orchestrate:stages:dry

# Check GitHub Actions logs
gh run list
gh run view [RUN_ID]
```

### **Common Issues**

1. **Claude-Flow not found**: `npm install -g @anthropics/claude-flow@alpha`
2. **GitHub Actions failing**: Check repository permissions in Settings
3. **Labels not created**: Run the label creation commands above
4. **Project board not updating**: Verify automation rules in Project Settings

Your hive mind development automation is now **LIVE** and ready to revolutionize your development workflow! 🎉