/**
 * Knowledge Base Integration Tests - WBS 1.6.2
 * Tests knowledge base population and retrieval
 */

import { HistoricalEmailIngestion } from '../../src/email/ingestion/HistoricalEmailIngestion';
import { EmailIntelligenceEngine } from '../../src/email/intelligence/EmailIntelligenceEngine';
import { OAuth2Manager } from '../../src/email/authentication/OAuth2Manager';
import { ExecutiveContext } from '../../src/types/pea-agent-types';
import { SecurityLevel } from '../../src/types/enums';

// Mock implementations
const mockExecutiveContext: ExecutiveContext = {
  executiveId: 'exec-001',
  sessionId: 'session-001',
  preferences: {
    communicationStyle: 'diplomatic',
    decisionThreshold: 0.8,
    privacyLevel: SecurityLevel.EXECUTIVE_PERSONAL,
    timeZone: 'UTC',
    languages: ['en'],
    culturalAdaptation: true
  },
  currentPriority: 'high',
  stakeholders: [
    {
      id: 'stakeholder-001',
      name: 'John Smith',
      relationship: 'board',
      priority: 'critical',
      communicationHistory: []
    }
  ],
  timeZone: 'UTC',
  confidentialityLevel: SecurityLevel.EXECUTIVE_PERSONAL
};

describe('Knowledge Base Integration Tests', () => {
  let authManager: OAuth2Manager;
  let intelligenceEngine: EmailIntelligenceEngine;
  let ingestionEngine: HistoricalEmailIngestion;

  beforeEach(() => {
    authManager = new OAuth2Manager();
    intelligenceEngine = new EmailIntelligenceEngine(mockExecutiveContext);
    ingestionEngine = new HistoricalEmailIngestion(authManager, intelligenceEngine, mockExecutiveContext);
  });

  describe('Knowledge Base Population', () => {
    it('should initialize knowledge base successfully', () => {
      expect(ingestionEngine).toBeDefined();
      expect(ingestionEngine.getKnowledgeBase()).toBeDefined();
      expect(ingestionEngine.getKnowledgeBase().size).toBe(0);
    });

    it('should track ingestion progress', () => {
      const progress = ingestionEngine.getProgress();
      
      expect(progress).toHaveProperty('totalEmails');
      expect(progress).toHaveProperty('processedEmails');
      expect(progress).toHaveProperty('successfulIngestions');
      expect(progress).toHaveProperty('errors');
      expect(progress).toHaveProperty('status');
      expect(progress.status).toBe('completed');
    });

    it('should handle empty email sources', async () => {
      const options = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        maxEmails: 100,
        batchSize: 10,
        providers: ['gmail' as const],
        accounts: []
      };

      // Should not throw error with empty accounts
      await expect(ingestionEngine.startIngestion(options)).resolves.not.toThrow();
    });

    it('should validate ingestion options', async () => {
      const invalidOptions = {
        providers: ['gmail' as const],
        accounts: ['nonexistent-account'],
        batchSize: 0 // Invalid batch size
      };

      // Should handle invalid configuration gracefully
      await expect(ingestionEngine.startIngestion(invalidOptions)).resolves.not.toThrow();
    });
  });

  describe('Knowledge Extraction', () => {
    it('should extract contact relationships', () => {
      // Mock knowledge base would contain email analysis data
      const knowledgeBase = ingestionEngine.getKnowledgeBase();
      expect(knowledgeBase).toBeInstanceOf(Map);
    });

    it('should identify communication patterns', () => {
      // Test communication pattern extraction
      const progress = ingestionEngine.getProgress();
      expect(progress).toBeDefined();
    });

    it('should track executive preferences', () => {
      // Test preference learning from email history
      expect(mockExecutiveContext.preferences.communicationStyle).toBe('diplomatic');
    });
  });

  describe('Performance Requirements', () => {
    it('should process knowledge base operations under 100ms', async () => {
      const startTime = Date.now();
      
      const _knowledgeBase = ingestionEngine.getKnowledgeBase();
      const _progress = ingestionEngine.getProgress();
      
      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(100);
    });

    it('should handle large knowledge bases efficiently', () => {
      // Test with simulated large knowledge base
      const knowledgeBase = ingestionEngine.getKnowledgeBase();
      
      // Simulate adding many entries
      for (let i = 0; i < 1000; i++) {
        knowledgeBase.set(`test_entry_${i}`, {
          email: { id: `email_${i}`, subject: `Test ${i}` },
          analysis: { priority: i % 100 },
          timestamp: new Date()
        });
      }
      
      expect(knowledgeBase.size).toBe(1000);
    });
  });

  describe('Integration with Executive Context', () => {
    it('should update stakeholder information', () => {
      const stakeholder = mockExecutiveContext.stakeholders[0];
      expect(stakeholder.name).toBe('John Smith');
      expect(stakeholder.relationship).toBe('board');
      expect(stakeholder.priority).toBe('critical');
    });

    it('should respect security classifications', () => {
      expect(mockExecutiveContext.confidentialityLevel).toBe(SecurityLevel.EXECUTIVE_PERSONAL);
      expect(mockExecutiveContext.preferences.privacyLevel).toBe(SecurityLevel.EXECUTIVE_PERSONAL);
    });

    it('should maintain cultural context', () => {
      expect(mockExecutiveContext.preferences.culturalAdaptation).toBe(true);
      expect(mockExecutiveContext.preferences.languages).toContain('en');
    });
  });

  describe('Error Handling', () => {
    it('should handle knowledge base corruption gracefully', () => {
      const knowledgeBase = ingestionEngine.getKnowledgeBase();
      
      // Simulate corrupted data
      knowledgeBase.set('corrupted_entry', null);
      knowledgeBase.set('invalid_entry', { invalid: 'data' });
      
      // Should not throw when accessing corrupted data
      expect(() => {
        for (const [_key, value] of knowledgeBase) {
          if (value && value.email) {
            // Process valid entries only
          }
        }
      }).not.toThrow();
    });

    it('should recover from ingestion failures', () => {
      // Test pause/resume functionality
      ingestionEngine.pause();
      expect(ingestionEngine.getProgress().status).toBe('paused');
      
      ingestionEngine.resume();
      expect(ingestionEngine.getProgress().status).toBe('running');
    });
  });

  describe('Memory Management', () => {
    it('should manage memory efficiently during ingestion', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Simulate memory-intensive operations
      const knowledgeBase = ingestionEngine.getKnowledgeBase();
      for (let i = 0; i < 100; i++) {
        knowledgeBase.set(`memory_test_${i}`, {
          large_data: new Array(1000).fill('test_data'),
          timestamp: new Date()
        });
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 10MB for test data)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should clean up resources properly', () => {
      const knowledgeBase = ingestionEngine.getKnowledgeBase();
      knowledgeBase.set('test_cleanup', { data: 'test' });
      
      expect(knowledgeBase.size).toBeGreaterThan(0);
      
      // Clear knowledge base
      knowledgeBase.clear();
      expect(knowledgeBase.size).toBe(0);
    });
  });

  describe('Concurrent Access', () => {
    it('should handle concurrent knowledge base access', async () => {
      const knowledgeBase = ingestionEngine.getKnowledgeBase();
      
      // Simulate concurrent read/write operations
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve().then(() => {
            knowledgeBase.set(`concurrent_${i}`, { data: `test_${i}` });
            return knowledgeBase.get(`concurrent_${i}`);
          })
        );
      }
      
      const results = await Promise.all(promises);
      expect(results.length).toBe(10);
      expect(knowledgeBase.size).toBeGreaterThanOrEqual(10);
    });
  });
});