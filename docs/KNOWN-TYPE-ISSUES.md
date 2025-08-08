# Known TypeScript Type Issues

This document tracks the remaining TypeScript type issues that need to be resolved to restore full type safety to the project.

## Current Status

- **Environment Synchronization**: ✅ Complete (Node.js 18, npm ci, etc.)
- **Basic Type Infrastructure**: ✅ Complete (AgentState, AgentStatus, etc.)
- **Agent Class Hierarchy**: ❌ Needs Work
- **Module Dependencies**: ❌ Missing Modules
- **TypeScript Strict Mode**: ❌ Temporarily Disabled

## High Priority Issues

### 1. Agent Class Hierarchy Problems

**Issue**: Many agents don't properly extend from PEAAgentBase
**Files Affected**:
- `src/agents/travel-logistics/TravelLogisticsAgent.ts`
- `src/agents/financial-intelligence/FinancialIntelligenceAgent.ts`
- `src/agents/crisis-management/CrisisManagementAgent.ts`
- `src/agents/phase2/crisis-management/*.ts`

**Error Examples**:
```
Argument of type 'FinancialIntelligenceAgent' is not assignable to parameter of type 'PEAAgentBase'.
Type 'FinancialIntelligenceAgent' is missing the following properties from type 'PEAAgentBase': id, name, type, status, and 10 more.
```

**Resolution Strategy**:
1. Ensure all agents properly extend PEAAgentBase
2. Implement required abstract methods
3. Call super() constructor correctly
4. Add missing properties (id, name, type, status, etc.)

### 2. Missing Module Dependencies

**Issue**: Several modules reference non-existent dependencies
**Files Affected**:
- `src/agents/travel-logistics/TravelLogisticsAgent.ts`
- `src/agents/phase2/crisis-management/*.ts`

**Missing Modules**:
- `../../cultural-intelligence/models/cultural-analyzer`
- `../../cultural-intelligence/database/cultural-database`
- `../../types/pea-agent-types` (incorrect path, should be `../../src/types/pea-agent-types`)

**Resolution Strategy**:
1. Create missing cultural-intelligence modules
2. Fix import paths to correct locations
3. Implement stub classes if modules don't exist yet

### 3. Agent Manager Type Mismatches

**Issue**: Complex type mismatches in agent-manager.ts
**File**: `src/agents/agent-manager.ts`

**Problems**:
- AgentCapabilities properties don't match interface (`codeReview`, `research`, etc.)
- AgentWorkload and AgentHealth used as numbers instead of objects
- AgentError interface extensions not properly implemented
- Memory storage type parameter mismatches

**Resolution Strategy**:
1. Align AgentCapabilities properties with actual interface
2. Update AgentWorkload and AgentHealth to use proper object types
3. Fix AgentError inheritance chain
4. Correct memory storage parameter types

### 4. Enum Usage Inconsistencies

**Issue**: AgentStatus enum used inconsistently
**Files Affected**: Multiple agent files

**Problems**:
- String literals like `'active'`, `'failed'` instead of `AgentStatus.ACTIVE`, `AgentStatus.ERROR`
- Missing enum values in AgentStatus definition

**Resolution Strategy**:
1. Use AgentStatus enum constants consistently
2. Add missing status values to enum
3. Update all string literal usages

## Medium Priority Issues

### 5. Interface Property Alignment

**Issue**: Object literal properties don't match interface definitions
**Examples**:
- `responseImplemented` property not in SecurityThreat interface
- `resolved` property not in AgentError interface
- Various capability properties missing from AgentCapabilities

**Resolution Strategy**:
1. Add missing properties to interfaces
2. Remove unused properties from implementations
3. Ensure consistent property naming

### 6. Parameter Type Mismatches

**Issue**: Function calls with incorrect parameter types
**Examples**:
- AgentId used as object vs string inconsistently
- Memory storage parameters type mismatches

**Resolution Strategy**:
1. Standardize AgentId type usage (string vs object)
2. Fix memory storage parameter types
3. Align function signatures with usage

## Low Priority Issues

### 7. Implicit Any Types

**Issue**: Parameters with implicit `any` types
**Files**: Various agent files

**Resolution Strategy**:
1. Add explicit type annotations
2. Enable noImplicitAny gradually
3. Fix parameter type definitions

## Resolution Timeline

### Phase 1: Critical Infrastructure (1-2 days)
- [ ] Fix agent class hierarchy (extend PEAAgentBase properly)
- [ ] Create missing module stubs
- [ ] Fix major import path issues

### Phase 2: Type Alignment (2-3 days)  
- [ ] Align all interface properties
- [ ] Fix enum usage inconsistencies
- [ ] Resolve parameter type mismatches

### Phase 3: Strict Mode Restoration (1 day)
- [ ] Re-enable TypeScript strict mode
- [ ] Fix remaining implicit any types
- [ ] Validate full type safety

## Current Workaround

TypeScript strict mode has been temporarily disabled in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false,
    "noImplicitReturns": false
  }
}
```

**Goal**: Restore full strict mode once type issues are resolved.

## Testing Strategy

1. **Incremental Fixes**: Fix issues in small, testable chunks
2. **CI Validation**: Each fix should pass GitHub Actions CI
3. **Type Safety**: Gradually re-enable strict mode options
4. **Regression Prevention**: Add type tests for critical interfaces

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PEA Agent Type Definitions](src/types/pea-agent-types.ts)
- [Swarm Type Definitions](src/swarm/types.ts)

---

**Note**: This document should be updated as issues are resolved. Remove completed items and add new issues as they're discovered.