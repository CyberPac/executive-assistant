---
name: Quality Gate Failure
about: Report a failure in the CI/CD quality gates
title: '[QUALITY-GATE] Quality gate failure: '
labels: 'quality-gate-failure, needs-investigation, blocking'
assignees: ''
---

## Quality Gate Failure Report

**Pipeline:** [CI/Build/Test/Lint/TypeCheck]
**Branch:** 
**Commit:** 
**Timestamp:** 

### Failure Details
<!-- Describe what quality gate failed -->

### Error Messages
```
<!-- Paste error messages here -->
```

### Impact Assessment
- [ ] Blocking deployments
- [ ] Blocking PR merges  
- [ ] Affecting development workflow
- [ ] Security implications
- [ ] Performance implications

### Immediate Actions Taken
- [ ] Reverted problematic changes
- [ ] Blocked further deployments
- [ ] Notified development team
- [ ] Investigated root cause

### Root Cause Analysis
<!-- Describe the underlying cause -->

### Prevention Measures
<!-- What can be done to prevent this in the future -->

### Resolution Plan
- [ ] Fix underlying issue
- [ ] Update quality gates if needed
- [ ] Verify all gates pass
- [ ] Re-enable blocked processes

### Verification Checklist
- [ ] TypeScript compilation passes
- [ ] ESLint check passes with zero errors
- [ ] All tests pass
- [ ] Type checking passes
- [ ] Security audit passes

---
**Priority:** [High/Critical/Blocker]
**Estimated Resolution Time:** 
**Assigned Engineer:** 