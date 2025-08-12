/**
 * Comprehensive Unit Tests for DocumentIntelligenceAgent
 * Testing multi-modal analysis, knowledge extraction, and executive synthesis
 */

import { DocumentIntelligenceAgent, DocumentAnalysisRequest, DocumentAnalysisResult } from '../../../src/agents/document-intelligence/DocumentIntelligenceAgent';
import { PEAAgentType, AgentStatus, SecurityLevel } from '../../../src/types/enums';
import {
  createMockMCPIntegration,
  createMockExecutiveContext,
  createMockDocumentAnalysisRequest,
  createMockDocumentInput,
  createMockDocumentInputBatch,
  assertAgentInitialization,
  assertPerformanceMetrics,
  MockPerformanceTimer
} from '../../utils/test-factories';

describe('DocumentIntelligenceAgent', () => {
  let agent: DocumentIntelligenceAgent;
  let mockMcpIntegration: jest.Mocked<any>;
  let performanceTimer: MockPerformanceTimer;

  beforeEach(() => {
    mockMcpIntegration = createMockMCPIntegration();
    agent = new DocumentIntelligenceAgent(mockMcpIntegration);
    performanceTimer = new MockPerformanceTimer();
    
    // Mock console methods to reduce test output noise
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    performanceTimer.reset();
  });

  describe('Agent Initialization', () => {
    it('should initialize with correct agent type and properties', () => {
      expect(agent.id).toBe('document-intelligence-001');
      expect(agent.type).toBe(PEAAgentType.DOCUMENT_INTELLIGENCE);
      expect(agent.name).toBe('Document Intelligence');
      expect(agent.status).toBe(AgentStatus.INITIALIZING);
    });

    it('should have comprehensive capabilities', () => {
      const expectedCapabilities = [
        'multi_modal_analysis',
        'document_processing',
        'knowledge_extraction',
        'semantic_understanding',
        'executive_synthesis',
        'comparative_analysis',
        'risk_assessment',
        'decision_support'
      ];
      
      expect(agent.capabilities).toEqual(expect.arrayContaining(expectedCapabilities));
      expect(agent.capabilities.length).toBe(expectedCapabilities.length);
    });

    it('should initialize successfully with all components', async () => {
      performanceTimer.start();
      
      await agent.initialize();
      
      const initTime = performanceTimer.measure();
      
      assertAgentInitialization(agent, PEAAgentType.DOCUMENT_INTELLIGENCE);
      expect(initTime).toBeLessThan(5000); // Should initialize within 5 seconds
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        'pea-agents/document-intelligence/init',
        expect.stringContaining('document-intelligence-001'),
        'pea_foundation'
      );
    });

    it('should handle initialization failure gracefully', async () => {
      mockMcpIntegration.memoryUsage.mockRejectedValueOnce(new Error('Memory storage failed'));
      
      await expect(agent.initialize()).rejects.toThrow('Memory storage failed');
      expect(agent.status).toBe(AgentStatus.ERROR);
    });

    it('should set correct security level', async () => {
      await agent.initialize();
      expect(agent.securityLevel).toBe(SecurityLevel.OPERATIONAL);
    });
  });

  describe('Document Analysis', () => {
    let mockRequest: DocumentAnalysisRequest;
    let mockExecutiveContext: any;

    beforeEach(async () => {
      await agent.initialize();
      mockRequest = createMockDocumentAnalysisRequest();
      mockExecutiveContext = createMockExecutiveContext();
    });

    it('should analyze single document successfully', async () => {
      performanceTimer.start();
      
      const result = await agent.analyzeDocuments(
        mockRequest,
        'exec-001',
        mockExecutiveContext
      );
      
      const analysisTime = performanceTimer.measure();
      
      expect(result.success).toBe(true);
      expect(result.analysisId).toBe(mockRequest.id);
      expect(result.executiveSummary).toBeDefined();
      expect(result.keyInsights).toBeInstanceOf(Array);
      expect(result.actionItems).toBeInstanceOf(Array);
      expect(result.riskAssessment).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.confidenceScore).toBeGreaterThan(0);
      expect(result.processedDocuments).toBe(mockRequest.documents.length);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.multiModalFindings).toBeInstanceOf(Array);
      
      // Performance assertions
      expect(analysisTime).toBeLessThan(3000); // Should complete within 3 seconds
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0.8);
    });

    it('should handle multiple documents batch processing', async () => {
      const batchDocuments = createMockDocumentInputBatch(10);
      const batchRequest = createMockDocumentAnalysisRequest({
        documents: batchDocuments
      });
      
      performanceTimer.start();
      
      const result = await agent.analyzeDocuments(
        batchRequest,
        'exec-001',
        mockExecutiveContext
      );
      
      const batchAnalysisTime = performanceTimer.measure();
      
      expect(result.success).toBe(true);
      expect(result.processedDocuments).toBe(10);
      expect(result.multiModalFindings.length).toBeGreaterThan(0);
      
      // Batch processing should be efficient
      expect(batchAnalysisTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result.executionTime / result.processedDocuments).toBeLessThan(1000); // Avg < 1s per doc
    });

    it('should process different document types correctly', async () => {
      const mixedTypeRequest = createMockDocumentAnalysisRequest({
        documents: [
          createMockDocumentInput({ type: 'pdf', name: 'report.pdf' }),
          createMockDocumentInput({ type: 'docx', name: 'proposal.docx' }),
          createMockDocumentInput({ type: 'xlsx', name: 'data.xlsx' }),
          createMockDocumentInput({ type: 'pptx', name: 'presentation.pptx' })
        ]
      });
      
      const result = await agent.analyzeDocuments(
        mixedTypeRequest,
        'exec-001',
        mockExecutiveContext
      );
      
      expect(result.success).toBe(true);
      expect(result.processedDocuments).toBe(4);
      
      // Should have findings from different document types
      const findingTypes = result.multiModalFindings.map(f => f.type);
      expect(findingTypes).toContain('text');
    });

    it('should handle analysis type variations', async () => {
      const analysisTypes = ['summary', 'detailed', 'comparative', 'legal', 'financial', 'strategic'];
      
      for (const analysisType of analysisTypes) {
        const request = createMockDocumentAnalysisRequest({
          analysisType: analysisType as any
        });
        
        const result = await agent.analyzeDocuments(
          request,
          'exec-001',
          mockExecutiveContext
        );
        
        expect(result.success).toBe(true);
        expect(result.executiveSummary).toContain(analysisType);
      }
    });

    it('should respect security and confidentiality levels', async () => {
      const confidentialRequest = createMockDocumentAnalysisRequest({
        documents: [createMockDocumentInput({
          confidentialityLevel: 'restricted'
        })]
      });
      
      const result = await agent.analyzeDocuments(
        confidentialRequest,
        'exec-001',
        mockExecutiveContext
      );
      
      expect(result.success).toBe(true);
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.stringContaining('document_analysis'),
        expect.any(String),
        'pea_foundation'
      );
    });

    it('should update performance metrics during analysis', async () => {
      const initialMetrics = { ...agent.performanceMetrics };
      
      await agent.analyzeDocuments(
        mockRequest,
        'exec-001',
        mockExecutiveContext
      );
      
      assertPerformanceMetrics(agent.performanceMetrics, {
        responseTimeMs: 5000,
        accuracyScore: 0.8,
        errorRate: 0.1
      });
      
      expect(agent.performanceMetrics.throughputPerHour).toBeGreaterThan(initialMetrics.throughputPerHour);
    });

    it('should handle analysis failure and error reporting', async () => {
      // Mock a failure in multi-modal processing
      jest.spyOn(agent as any, 'multiModalProcessor', 'get').mockReturnValue({
        processDocuments: jest.fn().mockRejectedValue(new Error('Processing failed'))
      });
      
      await expect(
        agent.analyzeDocuments(mockRequest, 'exec-001', mockExecutiveContext)
      ).rejects.toThrow('Processing failed');
      
      // Should track error in performance metrics
      expect(agent.performanceMetrics.errorRate).toBeGreaterThan(0);
    });
  });

  describe('Comparative Analysis', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should perform comparative analysis across document sets', async () => {
      const documentSets = [
        [createMockDocumentInput({ name: 'option_a.pdf' })],
        [createMockDocumentInput({ name: 'option_b.pdf' })],
        [createMockDocumentInput({ name: 'option_c.pdf' })]
      ];
      
      const comparisonCriteria = ['cost', 'risk', 'timeline', 'strategic_value'];
      const mockExecutiveContext = createMockExecutiveContext();
      
      performanceTimer.start();
      
      const result = await agent.performComparativeAnalysis(
        documentSets,
        comparisonCriteria,
        'exec-001',
        mockExecutiveContext
      );
      
      const comparisonTime = performanceTimer.measure();
      
      expect(result.comparison_id).toBeDefined();
      expect(result.document_sets).toBe(3);
      expect(result.criteria).toEqual(comparisonCriteria);
      expect(result.results).toHaveLength(3);
      expect(result.executive_recommendation).toContain('Option');
      expect(result.decision_matrix).toBeDefined();
      expect(result.decision_matrix.criteria).toEqual(comparisonCriteria);
      expect(result.decision_matrix.options).toHaveLength(3);
      
      // Performance check for comparative analysis
      expect(comparisonTime).toBeLessThan(8000); // Should complete within 8 seconds
    });

    it('should generate meaningful decision matrix', async () => {
      const documentSets = [
        [createMockDocumentInput()],
        [createMockDocumentInput()]
      ];
      
      const result = await agent.performComparativeAnalysis(
        documentSets,
        ['cost', 'risk'],
        'exec-001',
        createMockExecutiveContext()
      );
      
      const decisionMatrix = result.decision_matrix;
      expect(decisionMatrix.options).toHaveLength(2);
      expect(decisionMatrix.options[0]).toHaveProperty('option');
      expect(decisionMatrix.options[0]).toHaveProperty('confidence');
      expect(decisionMatrix.options[0]).toHaveProperty('insights');
      expect(decisionMatrix.options[0]).toHaveProperty('risks');
      expect(decisionMatrix.options[0]).toHaveProperty('recommendations');
    });
  });

  describe('Document Monitoring', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should setup document monitoring configuration', async () => {
      const monitoringCriteria = {
        keywords: ['merger', 'acquisition', 'financial_crisis'],
        documentTypes: ['pdf', 'docx'],
        alertThresholds: { 
          mention_frequency: 3,
          sentiment_threshold: -0.5
        },
        stakeholders: ['CEO', 'CFO', 'Board']
      };
      
      await agent.setupDocumentMonitoring('exec-001', monitoringCriteria);
      
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        'document_monitoring/exec-001',
        expect.stringContaining('merger'),
        'pea_foundation'
      );
    });
  });

  describe('Actionable Intelligence Extraction', () => {
    let mockAnalysisResults: DocumentAnalysisResult[];
    let mockExecutiveContext: any;

    beforeEach(async () => {
      await agent.initialize();
      mockExecutiveContext = createMockExecutiveContext();
      
      // Create mock analysis results
      mockAnalysisResults = [
        {
          success: true,
          analysisId: 'analysis-001',
          executiveSummary: 'Strategic opportunity identified',
          keyInsights: ['Market expansion opportunity', 'Cost reduction potential'],
          actionItems: ['Immediate action: Market research', 'Schedule board meeting'],
          riskAssessment: ['Market volatility risk', 'Implementation complexity'],
          recommendations: ['Proceed with opportunity assessment', 'Engage strategic advisors'],
          confidenceScore: 0.9,
          processedDocuments: 3,
          executionTime: 2500,
          multiModalFindings: []
        }
      ];
    });

    it('should extract comprehensive actionable intelligence', async () => {
      const intelligence = await agent.extractActionableIntelligence(
        mockAnalysisResults,
        mockExecutiveContext
      );
      
      expect(intelligence).toHaveProperty('immediate_actions');
      expect(intelligence).toHaveProperty('strategic_insights');
      expect(intelligence).toHaveProperty('risk_factors');
      expect(intelligence).toHaveProperty('opportunity_analysis');
      expect(intelligence).toHaveProperty('stakeholder_impact');
      expect(intelligence).toHaveProperty('decision_readiness');
      
      expect(intelligence.immediate_actions).toBeInstanceOf(Array);
      expect(intelligence.strategic_insights).toBeInstanceOf(Array);
      expect(intelligence.risk_factors).toBeInstanceOf(Array);
    });

    it('should categorize actions by urgency', async () => {
      const intelligence = await agent.extractActionableIntelligence(
        mockAnalysisResults,
        mockExecutiveContext
      );
      
      // Should identify immediate actions containing urgent keywords
      expect(intelligence.immediate_actions.length).toBeGreaterThan(0);
      intelligence.immediate_actions.forEach((action: string) => {
        expect(action.toLowerCase()).toMatch(/immediate|urgent/);
      });
    });

    it('should assess decision readiness accurately', async () => {
      const intelligence = await agent.extractActionableIntelligence(
        mockAnalysisResults,
        mockExecutiveContext
      );
      
      expect(intelligence.decision_readiness).toHaveProperty('readiness_score');
      expect(intelligence.decision_readiness).toHaveProperty('missing_information');
      expect(intelligence.decision_readiness).toHaveProperty('recommendation');
      
      expect(intelligence.decision_readiness.readiness_score).toBeGreaterThanOrEqual(0);
      expect(intelligence.decision_readiness.readiness_score).toBeLessThanOrEqual(1);
    });
  });

  describe('Performance and Scalability', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should handle high-volume document processing efficiently', async () => {
      const largeDocumentBatch = createMockDocumentInputBatch(50);
      const largeRequest = createMockDocumentAnalysisRequest({
        documents: largeDocumentBatch
      });
      
      performanceTimer.start();
      
      const result = await agent.analyzeDocuments(
        largeRequest,
        'exec-001',
        createMockExecutiveContext()
      );
      
      const processingTime = performanceTimer.measure();
      
      expect(result.success).toBe(true);
      expect(result.processedDocuments).toBe(50);
      
      // Performance requirements for large batches
      const avgTimePerDocument = processingTime / 50;
      expect(avgTimePerDocument).toBeLessThan(500); // < 500ms per document on average
      expect(processingTime).toBeLessThan(25000); // Total < 25 seconds for 50 documents
    });

    it('should maintain consistent performance metrics', async () => {
      const requests = Array.from({ length: 5 }, () => 
        createMockDocumentAnalysisRequest({
          documents: createMockDocumentInputBatch(3)
        })
      );
      
      const results = [];
      const processingTimes = [];
      
      for (const request of requests) {
        performanceTimer.start();
        
        const result = await agent.analyzeDocuments(
          request,
          'exec-001',
          createMockExecutiveContext()
        );
        
        const time = performanceTimer.measure();
        
        results.push(result);
        processingTimes.push(time);
      }
      
      // All requests should succeed
      expect(results.every(r => r.success)).toBe(true);
      
      // Processing times should be consistent (within 50% variance)
      const avgTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
      const maxVariance = avgTime * 0.5;
      
      processingTimes.forEach(time => {
        expect(Math.abs(time - avgTime)).toBeLessThanOrEqual(maxVariance);
      });
    });

    it('should handle memory usage efficiently', async () => {
      // Test memory efficiency with multiple analysis cycles
      const initialMemoryUsage = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 10; i++) {
        const request = createMockDocumentAnalysisRequest({
          documents: createMockDocumentInputBatch(5)
        });
        
        await agent.analyzeDocuments(
          request,
          'exec-001',
          createMockExecutiveContext()
        );
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemoryUsage = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemoryUsage - initialMemoryUsage;
      
      // Memory increase should be reasonable (< 100MB for this test)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('Error Handling and Recovery', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should handle invalid document formats gracefully', async () => {
      const invalidRequest = createMockDocumentAnalysisRequest({
        documents: [createMockDocumentInput({
          type: 'invalid_type' as any,
          name: 'invalid.unknown'
        })]
      });
      
      const result = await agent.analyzeDocuments(
        invalidRequest,
        'exec-001',
        createMockExecutiveContext()
      );
      
      // Should still succeed but with appropriate warnings or reduced confidence
      expect(result.success).toBe(true);
      expect(result.processedDocuments).toBe(1);
    });

    it('should recover from memory storage failures', async () => {
      mockMcpIntegration.memoryUsage.mockRejectedValueOnce(new Error('Storage unavailable'));
      
      const request = createMockDocumentAnalysisRequest();
      
      // Should still complete analysis even if memory storage fails
      const result = await agent.analyzeDocuments(
        request,
        'exec-001',
        createMockExecutiveContext()
      );
      
      expect(result.success).toBe(true);
    });

    it('should track and report error rates accurately', async () => {
      const initialErrorRate = agent.performanceMetrics.errorRate;
      
      // Simulate some failures
      try {
        mockMcpIntegration.memoryUsage.mockRejectedValue(new Error('Persistent error'));
        await agent.analyzeDocuments(
          createMockDocumentAnalysisRequest(),
          'exec-001',
          createMockExecutiveContext()
        );
      } catch (_error) {
        // Expected to fail
      }
      
      expect(agent.performanceMetrics.errorRate).toBeGreaterThan(initialErrorRate);
    });
  });

  describe('Integration with MCP', () => {
    beforeEach(async () => {
      await agent.initialize();
    });

    it('should integrate with Claude Flow memory system', async () => {
      const request = createMockDocumentAnalysisRequest();
      
      await agent.analyzeDocuments(
        request,
        'exec-001',
        createMockExecutiveContext()
      );
      
      // Should store analysis results in memory
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.stringContaining('document_analysis'),
        expect.any(String),
        'pea_foundation'
      );
    });

    it('should coordinate with other agents through MCP', async () => {
      const _request = createMockDocumentAnalysisRequest({
        analysisType: 'comparative'
      });
      
      await agent.performComparativeAnalysis(
        [[createMockDocumentInput()]],
        ['strategic_value'],
        'exec-001',
        createMockExecutiveContext()
      );
      
      // Should store comparative analysis results for other agents
      expect(mockMcpIntegration.memoryUsage).toHaveBeenCalledWith(
        'store',
        expect.stringContaining('comparative_analysis'),
        expect.any(String),
        'pea_foundation'
      );
    });
  });
});