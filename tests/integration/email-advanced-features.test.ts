/**
 * Advanced Email Features Integration Tests - WBS 1.4 Testing
 * Comprehensive testing for unified inbox, threading, and PEA integration
 */

import { describe, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { UnifiedInboxManager, EmailThread } from '../../src/email/advanced/UnifiedInboxManager';
import { EmailThreadingEngine } from '../../src/email/advanced/EmailThreadingEngine';
import { PEAEmailIntegrationLayer, PEAEmailContext } from '../../src/email/advanced/PEAEmailIntegrationLayer';
import { EmailPerformanceOptimizer } from '../../src/email/advanced/EmailPerformanceOptimizer';
import { OAuth2Manager } from '../../src/email/authentication/OAuth2Manager';
import { EmailContent } from '../../src/email/intelligence/EmailIntelligenceEngine';
import { PEAAgentType } from '../../src/types/pea-agent-types';

describe('Advanced Email Features Integration', () => {
  let authManager: OAuth2Manager;
  let inboxManager: UnifiedInboxManager;
  let threadingEngine: EmailThreadingEngine;
  let integrationLayer: PEAEmailIntegrationLayer;
  let performanceOptimizer: EmailPerformanceOptimizer;

  const mockEmails: EmailContent[] = [
    {
      id: 'email_1',
      subject: 'Project Kickoff Meeting',
      body: 'We need to schedule a project kickoff meeting for next week. Please coordinate with the team.',
      from: { name: 'John Doe', email: 'john@company.com' },
      to: [{ name: 'Jane Smith', email: 'jane@company.com' }],
      cc: [],
      timestamp: new Date('2024-08-15T10:00:00Z'),
      attachments: []
    },
    {
      id: 'email_2',
      subject: 'Re: Project Kickoff Meeting',
      body: 'I can schedule the meeting for Tuesday at 2 PM. Please confirm availability.',
      from: { name: 'Jane Smith', email: 'jane@company.com' },
      to: [{ name: 'John Doe', email: 'john@company.com' }],
      cc: [],
      timestamp: new Date('2024-08-15T11:00:00Z'),
      attachments: []
    },
    {
      id: 'email_3',
      subject: 'Urgent: Budget Review Required',
      body: 'The quarterly budget needs immediate review. This is critical for our Q4 planning.',
      from: { name: 'Finance Director', email: 'finance@company.com' },
      to: [{ name: 'CEO', email: 'ceo@company.com' }],
      cc: [{ name: 'CFO', email: 'cfo@company.com' }],
      timestamp: new Date('2024-08-15T12:00:00Z'),
      attachments: []
    }
  ];

  beforeEach(() => {
    // Initialize components
    authManager = new OAuth2Manager();
    inboxManager = new UnifiedInboxManager(authManager);
    threadingEngine = new EmailThreadingEngine();
    integrationLayer = new PEAEmailIntegrationLayer(inboxManager, threadingEngine);
    performanceOptimizer = new EmailPerformanceOptimizer({
      performanceTarget: 50, // 50ms target for tests
      maxCacheSize: 100
    });

    // Mock external dependencies
    jest.clearAllMocks();
  });

  afterEach(() => {
    performanceOptimizer.clearCache();
  });

  describe('UnifiedInboxManager Integration', () => {
    it('should manage multiple email accounts', async () => {
      // Add Gmail account
      const gmailAccountId = await inboxManager.addAccount(
        'gmail',
        'test@gmail.com',
        'Test Gmail Account'
      );

      expect(gmailAccountId).toBeDefined();
      expect(gmailAccountId).toContain('gmail_test@gmail.com');

      // Add Outlook account
      const outlookAccountId = await inboxManager.addAccount(
        'outlook-local',
        'test@outlook.com',
        'Test Outlook Account'
      );

      expect(outlookAccountId).toBeDefined();
      expect(outlookAccountId).toContain('outlook-local_test@outlook.com');

      // Verify account statistics
      const stats = inboxManager.getInboxStats();
      expect(stats.totalAccounts).toBe(2);
      expect(stats.accountBreakdown).toHaveProperty(gmailAccountId);
      expect(stats.accountBreakdown).toHaveProperty(outlookAccountId);
    });

    it('should handle account settings updates', async () => {
      const accountId = await inboxManager.addAccount(
        'gmail',
        'test@gmail.com',
        'Test Account'
      );

      // Update settings
      await inboxManager.updateAccountSettings(accountId, {
        syncInterval: 10,
        priorityLevel: 'high',
        notificationsEnabled: false
      });

      const settings = inboxManager.getAccountSettings(accountId);
      expect(settings?.syncInterval).toBe(10);
      expect(settings?.priorityLevel).toBe('high');
      expect(settings?.notificationsEnabled).toBe(false);
    });

    it('should perform unified search across accounts', async () => {
      const accountId = await inboxManager.addAccount(
        'gmail',
        'test@gmail.com',
        'Test Account'
      );

      // Mock search functionality (in real implementation, would search actual emails)
      const searchResult = await inboxManager.search({
        query: 'project',
        accounts: [accountId],
        limit: 10
      });

      expect(searchResult).toBeDefined();
      expect(searchResult.totalCount).toBeGreaterThanOrEqual(0);
      expect(searchResult.facets).toBeDefined();
      expect(searchResult.searchTime).toBeGreaterThan(0);
    });
  });

  describe('EmailThreadingEngine Integration', () => {
    it('should process emails into conversation threads', async () => {
      const threads = await threadingEngine.processEmails(mockEmails);

      expect(threads).toBeDefined();
      expect(threads.length).toBeGreaterThan(0);

      // Verify thread structure
      const projectThread = threads.find(t => 
        t.subject.toLowerCase().includes('project kickoff')
      );
      expect(projectThread).toBeDefined();
      expect(projectThread!.messages.length).toBe(2); // Original + reply
      expect(projectThread!.participants).toContain('john@company.com');
      expect(projectThread!.participants).toContain('jane@company.com');
    });

    it('should calculate thread analytics', async () => {
      await threadingEngine.processEmails(mockEmails);
      const threads = threadingEngine.getAllThreads();

      expect(threads.length).toBeGreaterThan(0);

      // Verify thread has proper analytics through cross-platform linking
      const crossPlatformThreads = await threadingEngine.linkCrossPlatformThreads();
      if (crossPlatformThreads.length > 0) {
        const analytics = crossPlatformThreads[0].analytics;
        expect(analytics.conversationDepth).toBeGreaterThan(0);
        expect(analytics.participantEngagement).toBeDefined();
        expect(analytics.threadHealth).toMatch(/^(active|stale|dead)$/);
      }
    });

    it('should merge similar threads', async () => {
      // Create emails with similar content that should be merged
      const similarEmails: EmailContent[] = [
        {
          ...mockEmails[0],
          id: 'similar_1',
          subject: 'Project Kickoff Meeting - Updated'
        },
        {
          ...mockEmails[1],
          id: 'similar_2',
          subject: 'Re: Project Kickoff Meeting - Updated'
        }
      ];

      const allEmails = [...mockEmails, ...similarEmails];
      const threads = await threadingEngine.processEmails(allEmails);

      // Should merge similar threads
      const projectThreads = threads.filter(t => 
        t.subject.toLowerCase().includes('project kickoff')
      );
      
      // Expect fewer threads than if they weren't merged
      expect(projectThreads.length).toBeLessThanOrEqual(2);
    });
  });

  describe('PEAEmailIntegrationLayer Integration', () => {
    it('should process email thread and generate PEA context', async () => {
      // First process emails into threads
      const threads = await threadingEngine.processEmails(mockEmails);
      const testThread = threads[0];

      // Process thread for PEA integration
      const context = await integrationLayer.processEmailThread(testThread.id);

      expect(context).toBeDefined();
      expect(context.threadId).toBe(testThread.id);
      expect(context.priority).toMatch(/^(low|medium|high|urgent)$/);
      expect(context.stakeholders).toContain('john@company.com');
      expect(context.actionItems.length).toBeGreaterThanOrEqual(0);
      expect(context.suggestedAgents.length).toBeGreaterThan(0);
    });

    it('should suggest appropriate PEA agents based on content', async () => {
      const threads = await threadingEngine.processEmails(mockEmails);
      
      // Test budget-related email
      const budgetThread = threads.find(t => 
        t.subject.toLowerCase().includes('budget')
      );
      
      if (budgetThread) {
        const context = await integrationLayer.processEmailThread(budgetThread.id);
        expect(context.suggestedAgents).toContain(PEAAgentType.FINANCIAL_INTELLIGENCE);
        expect(context.priority).toMatch(/^(high|urgent)$/); // Budget is marked urgent
      }

      // Test meeting-related email
      const meetingThread = threads.find(t => 
        t.subject.toLowerCase().includes('meeting')
      );
      
      if (meetingThread) {
        const context = await integrationLayer.processEmailThread(meetingThread.id);
        expect(context.suggestedAgents).toContain(PEAAgentType.CALENDAR_INTELLIGENCE);
      }
    });

    it('should create appropriate agent assignments', async () => {
      const threads = await threadingEngine.processEmails(mockEmails);
      const testThread = threads[0];
      
      const context = await integrationLayer.processEmailThread(testThread.id);
      const assignments = await integrationLayer.createAgentAssignments(context);

      expect(assignments).toBeDefined();
      expect(assignments.length).toBeGreaterThan(0);

      assignments.forEach(assignment => {
        expect(assignment.agentType).toBeDefined();
        expect(assignment.taskDescription).toBeTruthy();
        expect(assignment.priority).toBeGreaterThan(0);
        expect(assignment.estimatedCompletionTime).toBeGreaterThan(0);
        expect(assignment.context).toBeDefined();
      });
    });

    it('should extract action items from email content', async () => {
      const actionEmailContent: EmailContent = {
        id: 'action_email',
        subject: 'Action Items from Meeting',
        body: 'Please schedule a follow-up meeting with the client. Can you also prepare the quarterly report by Friday? We need to review the budget proposal and arrange travel for the conference.',
        from: { name: 'Manager', email: 'manager@company.com' },
        to: [{ name: 'Assistant', email: 'assistant@company.com' }],
        cc: [],
        timestamp: new Date(),
        attachments: []
      };

      const threads = await threadingEngine.processEmails([actionEmailContent]);
      const context = await integrationLayer.processEmailThread(threads[0].id);

      expect(context.actionItems.length).toBeGreaterThan(0);
      
      const actionDescriptions = context.actionItems.map(item => item.description.toLowerCase());
      expect(actionDescriptions.some(desc => desc.includes('schedule'))).toBe(true);
      expect(actionDescriptions.some(desc => desc.includes('prepare'))).toBe(true);
    });
  });

  describe('EmailPerformanceOptimizer Integration', () => {
    it('should optimize email processing with caching', async () => {
      const processor = jest.fn().mockImplementation(async (_email: EmailContent) => {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 10));
        return { processed: true, emailId: email.id };
      });

      // First processing - should call processor for each email
      const result1 = await performanceOptimizer.optimizeEmailProcessing(
        mockEmails,
        processor,
        'test_cache_key'
      );

      expect(result1.length).toBe(mockEmails.length);
      expect(processor).toHaveBeenCalledTimes(mockEmails.length);

      // Second processing with same cache key - should use cache
      processor.mockClear();
      const result2 = await performanceOptimizer.optimizeEmailProcessing(
        mockEmails,
        processor,
        'test_cache_key'
      );

      expect(result2.length).toBe(mockEmails.length);
      expect(processor).not.toHaveBeenCalled(); // Should use cache
    });

    it('should track performance metrics', async () => {
      const processor = jest.fn().mockImplementation(async (_email: EmailContent) => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return { processed: true };
      });

      await performanceOptimizer.optimizeEmailProcessing(mockEmails, processor);

      const metrics = performanceOptimizer.getPerformanceMetrics();
      expect(metrics.processingTime).toBeGreaterThan(0);
      expect(metrics.throughput).toBeGreaterThan(0);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });

    it('should optimize thread processing with predictive prefetching', async () => {
      const threads = await threadingEngine.processEmails(mockEmails);
      
      const processor = jest.fn().mockImplementation(async (thread: EmailThread) => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return {
          threadId: thread.id,
          priority: 'medium',
          stakeholders: thread.participants,
          actionItems: [],
          deadlines: [],
          suggestedAgents: [PEAAgentType.CALENDAR_INTELLIGENCE]
        } as PEAEmailContext;
      });

      const results = await performanceOptimizer.optimizeThreadProcessing(threads, processor);

      expect(results.length).toBe(threads.length);
      expect(processor).toHaveBeenCalledTimes(threads.length);

      const metrics = performanceOptimizer.getPerformanceMetrics();
      expect(metrics.processingTime).toBeLessThan(100); // Should be optimized
    });

    it('should provide performance trends analysis', async () => {
      const processor = jest.fn().mockImplementation(async (_email: EmailContent) => {
        return { processed: true };
      });

      // Process multiple batches to generate trend data
      for (let i = 0; i < 5; i++) {
        await performanceOptimizer.optimizeEmailProcessing(
          mockEmails.slice(0, 1),
          processor
        );
      }

      const trends = performanceOptimizer.getPerformanceTrends();
      expect(trends.averageProcessingTime).toBeGreaterThan(0);
      expect(trends.cacheEfficiency).toBeGreaterThanOrEqual(0);
      expect(trends.reliabilityScore).toBeGreaterThanOrEqual(0);
      expect(trends.reliabilityScore).toBeLessThanOrEqual(100);
    });
  });

  describe('End-to-End Integration Flow', () => {
    it('should process complete email workflow with all components', async () => {
      // Step 1: Add email accounts
      const _gmailAccount = await inboxManager.addAccount(
        'gmail',
        'executive@company.com',
        'Executive Gmail'
      );

      // Step 2: Process emails into threads with optimization
      const processor = jest.fn().mockImplementation(async (_email: EmailContent) => {
        return email; // Simple passthrough for testing
      });

      const optimizedEmails = await performanceOptimizer.optimizeEmailProcessing(
        mockEmails,
        processor,
        'workflow_test'
      );

      // Step 3: Create conversation threads
      const threads = await threadingEngine.processEmails(optimizedEmails);
      expect(threads.length).toBeGreaterThan(0);

      // Step 4: Generate PEA context for each thread
      const contexts: PEAEmailContext[] = [];
      for (const thread of threads) {
        const context = await integrationLayer.processEmailThread(thread.id);
        contexts.push(context);
      }

      // Step 5: Create agent assignments
      const allAssignments = [];
      for (const context of contexts) {
        const assignments = await integrationLayer.createAgentAssignments(context);
        allAssignments.push(...assignments);
      }

      // Verify complete workflow
      expect(contexts.length).toBe(threads.length);
      expect(allAssignments.length).toBeGreaterThan(0);
      
      // Verify performance targets met
      const metrics = performanceOptimizer.getPerformanceMetrics();
      expect(metrics.processingTime).toBeLessThan(100); // Under 100ms for test data
      
      // Verify intelligent agent suggestions
      const suggestedAgentTypes = new Set(allAssignments.map(a => a.agentType));
      expect(suggestedAgentTypes.size).toBeGreaterThan(0);
    });

    it('should handle error scenarios gracefully', async () => {
      // Test error handling in processing
      const errorProcessor = jest.fn().mockRejectedValue(new Error('Processing failed'));

      await expect(
        performanceOptimizer.optimizeEmailProcessing(mockEmails, errorProcessor)
      ).rejects.toThrow('Processing failed');

      // Verify error metrics are tracked
      const metrics = performanceOptimizer.getPerformanceMetrics();
      expect(metrics.errorRate).toBeGreaterThan(0);
    });

    it('should maintain data consistency across components', async () => {
      // Process emails and create threads
      const threads = await threadingEngine.processEmails(mockEmails);
      
      // Verify thread data consistency
      for (const thread of threads) {
        expect(thread.messages.length).toBeGreaterThan(0);
        expect(thread.participants.length).toBeGreaterThan(0);
        expect(thread.lastActivity).toBeInstanceOf(Date);
        
        // Verify PEA context can be generated
        const context = await integrationLayer.processEmailThread(thread.id);
        expect(context.threadId).toBe(thread.id);
        expect(context.stakeholders).toEqual(thread.participants);
      }
    });
  });
});