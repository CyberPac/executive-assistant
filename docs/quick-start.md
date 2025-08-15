# 🚀 Quick Start: Hive Mind Development Automation

## ✅ **What We've Built (Ready Now)**

You now have a complete **GitHub-native automation system** that's ready to use:

### 1. **GitHub Actions Workflow** 
- **File**: `.github/workflows/stage-control.yml`
- **Triggers**: When issues get stage labels (`stage:dev`, `stage:test`, etc.)
- **Actions**: Runs quality checks, analyzes readiness, advances stages
- **Status**: ✅ **READY TO USE**

### 2. **Issue Templates with Auto-Labels**
- **Files**: `.github/ISSUE_TEMPLATE/feature.yml` and `bug.yml`
- **Auto-assigns**: `stage:backlog`, priority, and type labels
- **Status**: ✅ **READY TO USE**

### 3. **Stage Orchestrator Script**
- **File**: `scripts/claude-flow-stage-orchestrator.mjs`
- **Purpose**: Batch process issues for stage advancement
- **Status**: ✅ **FRAMEWORK READY** (simulates until MCP configured)

### 4. **NPM Scripts**
- `npm run orchestrate:stages` - Run stage processing
- `npm run orchestrate:stages:dry` - Test run (safe)
- `npm run swarm:status` - Check system status
- **Status**: ✅ **READY TO USE**

---

## 🎯 **Test It Right Now (2 Minutes)**

### Step 1: **Create Labels**
```bash
# Create the stage labels (run once)
gh label create "stage:backlog" --color "e1e4e8" --description "Issue in backlog" || true
gh label create "stage:design" --color "0366d6" --description "Design phase" || true
gh label create "stage:dev" --color "28a745" --description "Development phase" || true
gh label create "stage:test" --color "ffd33d" --description "Testing phase" || true
gh label create "stage:review" --color "f85149" --description "Code review phase" || true
gh label create "stage:deploy" --color "6f42c1" --description "Deployment phase" || true
gh label create "stage:done" --color "1f883d" --description "Completed" || true
gh label create "sprint:current" --color "0052cc" --description "Current sprint" || true
```

### Step 2: **Test Orchestrator**
```bash
# Test the framework
npm run orchestrate:stages:dry
```

### Step 3: **Create Test Issue**
```bash
# Create a test issue through GitHub UI or CLI
gh issue create \
  --title "Test automation workflow" \
  --body "Testing the hive mind stage automation system" \
  --label "type:feature,stage:backlog,sprint:current,priority:medium"
```

### Step 4: **Trigger Stage Advancement**
```bash
# Move issue to development stage (triggers automation)
gh issue edit 1 --add-label "stage:dev"

# Watch GitHub Actions run
gh run list
```

---

## 📊 **What Happens When You Add Stage Labels**

### **Automatic Quality Checks**
When you add `stage:dev` label:
1. **GitHub Action triggers** (`.github/workflows/stage-control.yml`)
2. **Runs quality gates**: `npm run lint`, `npm run build`, `npm run test`
3. **Analyzes results**: Pass/fail determines advancement
4. **Comments on issue** with status and next steps

### **Stage Progression Flow**
```
stage:backlog → stage:design → stage:dev → stage:test → stage:review → stage:deploy → stage:done
     ↓              ↓            ↓           ↓            ↓             ↓            ↓
  Add criteria   Design doc   Create PR   Run tests   Code review   Deploy      Complete
```

### **Smart Advancement Logic**
- ✅ **Quality gates pass** → Advances automatically
- ❌ **Quality gates fail** → Blocks advancement, posts blockers
- 🔄 **Partial success** → Provides specific remediation steps

---

## 🏆 **Success Indicators**

You'll know it's working when:

1. **Issues get automatic comments** when stage labels change
2. **GitHub Actions run** and show stage-specific checks
3. **Quality failures block advancement** with specific feedback
4. **Project boards update** automatically (once configured)
5. **Metrics are collected** in `docs/orchestration-metrics.json`

---

## 🔧 **Next: Enable Full Hive Mind (Optional)**

### **For Full AI-Powered Intelligence**

1. **Configure MCP Claude-Flow Integration**
   ```bash
   # Add Claude-Flow MCP server (when available)
   claude mcp add claude-flow npx claude-flow@alpha mcp start
   ```

2. **Enable GitHub Project Board**
   - Go to repository → Projects → New Project
   - Choose "Board" template
   - Set up column automation rules

3. **Advanced Features**
   - Sprint planning automation
   - Metrics dashboard
   - Cross-repository coordination

---

## 💡 **How to Use Daily**

### **Developer Workflow**
1. **Create issue** using templates (auto-gets `stage:backlog`)
2. **Add acceptance criteria** and assign developer
3. **Move to `stage:design`** when ready for technical design
4. **Move to `stage:dev`** when ready to code (triggers quality checks)
5. **Create PR** linked to issue
6. **Automation handles** the rest of the stage progression

### **Team Lead Workflow**
```bash
# Morning: Check all issues in current sprint
gh issue list --label "sprint:current" --state open

# Process any ready for advancement
npm run orchestrate:stages

# Review automation results
gh run list --limit 5
```

### **Weekly Sprint Workflow**
```bash
# Sprint planning: Move issues to current sprint
gh issue edit [ISSUE_ID] --add-label "sprint:current"

# Sprint review: Check completed work
gh issue list --label "stage:done,sprint:current"
```

---

## 🆘 **Troubleshooting**

### **Common Issues**

1. **GitHub Actions not running**
   - Check Settings → Actions → General
   - Enable "Allow all actions and reusable workflows"

2. **Labels not found**
   - Run the label creation commands above
   - Verify in Issues → Labels

3. **Quality checks failing**
   - Check the specific error in Actions tab
   - Fix linting/build/test issues first

4. **Orchestrator script fails**
   - Currently runs in simulation mode (this is expected)
   - Real MCP integration comes later

### **Get Help**
```bash
# Check system status
npm run orchestrate:stages:dry

# View recent workflow runs
gh run list

# Check issue labels
gh issue list --label "sprint:current"
```

---

## 🎉 **You're Ready!**

Your **Hive Mind Development Automation** is now operational at the GitHub Actions level. The system will:

- ✅ **Automatically check quality gates** when issues advance
- ✅ **Block problematic advances** with specific feedback  
- ✅ **Provide clear next steps** for developers
- ✅ **Track progress** through comprehensive metrics
- ✅ **Scale to multiple issues** and team members

**The foundation is solid.** Advanced AI features can be added incrementally as you need them!

---

*Start using it immediately by creating issues with the templates and watching the automation work!* 🚀