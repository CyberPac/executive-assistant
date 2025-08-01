# Contributing to Personal Executive Assistant (PEA) System

Thank you for your interest in contributing to the PEA system! This document provides guidelines and information for contributors.

## 🎯 **Project Overview**

The Personal Executive Assistant (PEA) is a sophisticated multi-agent AI system designed for executive assistance using the LEASA (LocalExecutive AI Swarm Architecture) framework with Claude Flow v2.0+ integration.

## 🏗️ **Development Process**

### **Getting Started**

1. **Fork the repository**
   ```bash
   git clone https://github.com/YourUsername/executive-assistant.git
   cd executive-assistant
   ```

2. **Set up development environment**
   ```bash
   npm install
   npm run setup-dev
   ```

3. **Initialize Claude Flow MCP**
   ```bash
   npx claude-flow@alpha mcp start
   npm run swarm:init
   ```

4. **Run tests to ensure everything works**
   ```bash
   npm test
   npm run test:executive-scenarios
   ```

### **Development Workflow**

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards (see below)
   - Write comprehensive tests
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run test:performance
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: description of your feature"
   ```

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🤖 **Agent Development Guidelines**

### **LEASA Architecture Compliance**

All agents must follow the LEASA (LocalExecutive AI Swarm Architecture) patterns:

1. **Hierarchical Structure**
   - Tier 1: Executive Orchestration (1 agent)
   - Tier 2: Core Intelligence (8 agents)
   - Tier 3: Specialized Intelligence (4 agents)
   - Tier 4: System & Security (3 agents)

2. **Byzantine Fault Tolerance**
   - Implement consensus mechanisms
   - Handle up to 4 faulty agents
   - Maintain 70% consensus threshold

3. **Performance Requirements**
   - Sub-50ms response times for routine operations
   - Sub-2s for complex multi-agent consensus
   - 99.9% successful coordination rate

### **Agent Implementation Template**

```typescript
import { PEAAgentBase, PEAAgentType, AgentStatus } from '@/types';

export class YourAgent extends PEAAgentBase {
  constructor(id: string, mcpIntegration: ClaudeFlowMCPIntegration) {
    super(id, PEAAgentType.YOUR_AGENT_TYPE, 'Your Agent Name', mcpIntegration);
    this.capabilities = ['capability1', 'capability2'];
  }

  async initialize(): Promise<void> {
    this.status = AgentStatus.INITIALIZING;
    
    // Initialize agent-specific resources
    await this.setupAgentResources();
    
    // Store initialization in memory for coordination
    await this.storeActivity('initialization', {
      agentType: this.type,
      capabilities: this.capabilities,
      timestamp: new Date().toISOString()
    });
    
    this.status = AgentStatus.ACTIVE;
  }

  // Implement agent-specific methods
  private async setupAgentResources(): Promise<void> {
    // Agent initialization logic
  }
}
```

### **Cultural Intelligence Requirements**

If contributing to cultural intelligence features:

1. **Country Coverage**
   - Support for 35+ countries
   - Business protocol awareness
   - Cultural communication adaptation
   - 96% appropriateness target

2. **Validation**
   - Native cultural expert review
   - Executive scenario testing
   - Cross-cultural communication validation

## 📋 **Coding Standards**

### **TypeScript Guidelines**

1. **Type Safety**
   ```typescript
   // Good: Explicit types
   interface ExecutiveRequest {
     id: string;
     type: TaskType;
     priority: 'low' | 'medium' | 'high' | 'critical';
   }

   // Avoid: Any types
   function processRequest(request: any) { ... }
   ```

2. **Error Handling**
   ```typescript
   // Good: Comprehensive error handling
   try {
     const result = await agent.process(request);
     return result;
   } catch (error) {
     logger.error(`Agent processing failed: ${error.message}`);
     throw new AgentProcessingError(`Failed to process: ${error.message}`);
   }
   ```

3. **Performance Considerations**
   ```typescript
   // Good: Async/await with proper error handling
   async function processMultipleAgents(requests: Request[]): Promise<Result[]> {
     const results = await Promise.allSettled(
       requests.map(request => agent.process(request))
     );
     return results.filter(r => r.status === 'fulfilled').map(r => r.value);
   }
   ```

### **Testing Requirements**

1. **Unit Tests**
   ```typescript
   describe('CrisisManagementAgent', () => {
     it('should detect crisis within 30 seconds', async () => {
       const agent = new CrisisManagementAgent('test-id', mockMcp);
       const startTime = Date.now();
       
       const result = await agent.detectCrisis(mockCrisisEvent);
       const detectionTime = Date.now() - startTime;
       
       expect(detectionTime).toBeLessThan(30000);
       expect(result.detected).toBe(true);
     });
   });
   ```

2. **Integration Tests**
   ```typescript
   describe('Multi-Agent Coordination', () => {
     it('should achieve consensus with 15 agents', async () => {
       const orchestrator = new ExecutiveOrchestrator('test', mockMcp);
       const consensus = await orchestrator.requestConsensus(decisionPoint);
       
       expect(consensus.success).toBe(true);
       expect(consensus.agentVotes.length).toBe(15);
       expect(consensus.confidence).toBeGreaterThan(0.7);
     });
   });
   ```

3. **Executive Scenarios**
   ```typescript
   describe('Executive Scenarios', () => {
     it('should handle international meeting coordination', async () => {
       const scenario = new InternationalMeetingScenario();
       const result = await peaSystem.handleExecutiveRequest(scenario.request);
       
       expect(result.culturalAdaptation).toBe(true);
       expect(result.appropriatenessScore).toBeGreaterThan(0.96);
     });
   });
   ```

## 🚨 **Security Guidelines**

### **Data Classification**

Always respect data classification levels:

1. **EXECUTIVE_PERSONAL**: Local only, HSM encryption
2. **STRATEGIC_CONFIDENTIAL**: Local primary, encrypted cloud backup
3. **BUSINESS_SENSITIVE**: Hybrid processing allowed
4. **OPERATIONAL**: Cloud processing allowed

### **Security Implementation**

```typescript
// Good: Proper data classification
async function processExecutiveData(data: ExecutiveData): Promise<Result> {
  const classification = await classifyData(data);
  
  if (classification >= DataClassification.EXECUTIVE_PERSONAL) {
    return await processLocally(data);
  } else {
    return await processWithCloudSupport(data);
  }
}
```

## 📊 **Performance Guidelines**

### **Response Time Targets**

- **Immediate acknowledgment**: <10ms
- **Routine operations**: <50ms
- **Complex analysis**: <2s
- **Multi-agent consensus**: <5s

### **Performance Testing**

```typescript
describe('Performance Tests', () => {
  it('should respond within 50ms for routine operations', async () => {
    const startTime = process.hrtime.bigint();
    
    await agent.processRoutineRequest(request);
    
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to ms
    
    expect(duration).toBeLessThan(50);
  });
});
```

## 🔄 **Pull Request Process**

### **PR Requirements**

1. **Title Format**: Use conventional commits
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `test:` for testing improvements
   - `perf:` for performance improvements

2. **Description Template**
   ```markdown
   ## Summary
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Agent Impact
   - [ ] Affects agent coordination
   - [ ] Modifies consensus mechanisms
   - [ ] Changes performance characteristics
   - [ ] Updates cultural intelligence

   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Executive scenarios validated
   - [ ] Performance benchmarks met

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No breaking changes (or properly documented)
   ```

### **Review Process**

1. **Automated Checks**
   - CI/CD pipeline passes
   - All tests pass
   - Performance benchmarks met
   - Security scans clean

2. **Code Review**
   - At least 2 reviewers required
   - Architecture team approval for agent changes
   - Security team approval for security-related changes

3. **Executive Validation**
   - Executive scenarios tested
   - Cultural intelligence validated (if applicable)
   - Performance targets met

## 🌍 **Cultural Intelligence Contributions**

### **Adding New Countries**

1. **Research Requirements**
   - Business protocols and etiquette
   - Communication styles and preferences
   - Meeting customs and expectations
   - Relationship building approaches

2. **Implementation**
   ```typescript
   export const CountryProtocols: Record<string, CulturalProtocol> = {
     'US': {
       businessEtiquette: ['direct_communication', 'punctuality'],
       meetingStyle: 'informal_but_structured',
       relationshipBuilding: 'task_oriented',
       appropriatenessThreshold: 0.85
     }
   };
   ```

3. **Validation**
   - Native expert review required
   - Executive scenario testing
   - Appropriateness scoring validation

## 🎯 **Issue Reporting**

### **Bug Reports**

Use the bug report template with:
- Clear reproduction steps
- Expected vs actual behavior
- Environment details
- Agent coordination logs (if applicable)

### **Feature Requests**

Use the feature request template with:
- Clear use case description
- Executive impact assessment
- LEASA architecture considerations
- Performance implications

## 📞 **Getting Help**

- **Documentation**: Check `docs/` directory
- **Discussions**: Use GitHub Discussions
- **Issues**: Create issues for bugs or questions
- **Discord**: Join our developer community

## 🏆 **Recognition**

Contributors will be recognized in:
- Release notes
- Contributors list
- Annual contributor report
- Executive advisory board (for significant contributions)

Thank you for contributing to the future of executive AI assistance!