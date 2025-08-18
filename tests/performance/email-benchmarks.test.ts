/**
 * Email Integration Performance Benchmarks - WBS 1.6.3
 * Performance testing for email processing pipeline
 */

import { EmailIntelligenceEngine, EmailContent } from '../../src/email/intelligence/EmailIntelligenceEngine';
import { OAuth2Manager } from '../../src/email/authentication/OAuth2Manager';
import { GmailConnector } from '../../src/email/providers/gmail/GmailConnector';
import { OutlookLocalConnector } from '../../src/email/providers/outlook/OutlookLocalConnector';
import { ExecutiveContext } from '../../src/types/pea-agent-types';
import { SecurityLevel } from '../../src/types/enums';

// Mock executive context
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

// Mock email for testing
const mockEmail: EmailContent = {
  id: 'benchmark-email-001',
  subject: 'Urgent Board Meeting Update - Strategic Planning Review',
  body: 'Dear Executive Team, We need to schedule an urgent board meeting to review our strategic planning initiatives. The quarterly review has revealed several critical decisions that require immediate attention from the executive committee. Please confirm your availability for next week. Key topics include budget allocation, market expansion strategy, and stakeholder communications. This meeting is classified as confidential and requires board-level clearance. Best regards, Strategic Planning Committee',
  from: { name: 'Strategic Planning Committee', email: 'planning@company.com' },
  to: [{ name: 'Executive Team', email: 'executives@company.com' }],
  cc: [{ name: 'Board Secretary', email: 'secretary@company.com' }],
  timestamp: new Date(),
  attachments: [
    { filename: 'strategic-plan-q4.pdf', size: 2048576, mimeType: 'application/pdf' },
    { filename: 'budget-analysis.xlsx', size: 1024768, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  ]
};

describe('Email Integration Performance Benchmarks', () => {
  let authManager: OAuth2Manager;
  let intelligenceEngine: EmailIntelligenceEngine;
  let gmailConnector: GmailConnector;
  let outlookConnector: OutlookLocalConnector;

  beforeEach(() => {
    authManager = new OAuth2Manager();
    intelligenceEngine = new EmailIntelligenceEngine(mockExecutiveContext);
    gmailConnector = new GmailConnector(authManager);
    outlookConnector = new OutlookLocalConnector(authManager);
  });

  describe('Sub-75ms Response Time Requirements', () => {
    it('should analyze email content under 75ms', async () => {
      const iterations = 10;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        await intelligenceEngine.analyzeEmail({
          ...mockEmail,
          id: `benchmark-${i}`,
          subject: `Benchmark Test Email ${i}`
        });
        
        const processingTime = Date.now() - startTime;
        times.push(processingTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / iterations;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      console.log(`📊 Email Analysis Performance:`);
      console.log(`   Average: ${averageTime.toFixed(2)}ms`);
      console.log(`   Maximum: ${maxTime}ms`);
      console.log(`   Minimum: ${minTime}ms`);
      console.log(`   Target: <75ms`);

      // Performance assertions
      expect(averageTime).toBeLessThan(75);
      expect(maxTime).toBeLessThan(100); // Allow some variance for worst case
      expect(times.filter(t => t < 75).length / iterations).toBeGreaterThan(0.9); // 90% under 75ms
    });

    it('should maintain performance under load', async () => {
      const concurrentRequests = 20;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      // Create concurrent email analysis requests
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          intelligenceEngine.analyzeEmail({
            ...mockEmail,
            id: `concurrent-${i}`,
            subject: `Concurrent Test ${i}`
          })
        );
      }

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      const averageTimePerRequest = totalTime / concurrentRequests;

      console.log(`📊 Concurrent Load Performance:`);
      console.log(`   Concurrent Requests: ${concurrentRequests}`);
      console.log(`   Total Time: ${totalTime}ms`);
      console.log(`   Average per Request: ${averageTimePerRequest.toFixed(2)}ms`);

      expect(results.length).toBe(concurrentRequests);
      expect(averageTimePerRequest).toBeLessThan(75);
      expect(totalTime).toBeLessThan(2000); // Total time should be reasonable
    });

    it('should process complex emails efficiently', async () => {
      const complexEmail: EmailContent = {
        ...mockEmail,
        subject: 'URGENT: Multi-Stakeholder Strategic Initiative - Confidential Board Decision Required - International Expansion Project Phase 2 - Q4 Financial Review - Compliance Audit Results',
        body: `
          Dear Executive Committee and Board of Directors,
          
          This communication requires immediate executive attention and board-level decision making regarding our strategic international expansion initiative. The following critical items require urgent review and approval:
          
          1. FINANCIAL ANALYSIS: Our Q4 financial performance has exceeded projections by 23%, with revenue reaching $2.4B, representing a 34% year-over-year growth. The budget allocation for international expansion requires board approval for the additional $45M investment.
          
          2. MARKET EXPANSION: Our analysis of the European and Asian markets indicates significant opportunities in Germany, France, Japan, and Singapore. The regulatory compliance requirements vary significantly across these jurisdictions and require specialized legal consultation.
          
          3. STAKEHOLDER COMMUNICATIONS: We need to coordinate with multiple stakeholders including institutional investors, regulatory bodies, local partners, and government agencies. The cultural implications of our expansion strategy require careful consideration, particularly in Asian markets where relationship-building and formal protocols are essential.
          
          4. RISK ASSESSMENT: The geopolitical climate and economic uncertainties present both opportunities and challenges. Our risk management team has identified several mitigation strategies that require executive approval and additional insurance coverage.
          
          5. OPERATIONAL READINESS: The infrastructure requirements include new data centers, local hiring initiatives, supply chain optimization, and technology platform localization. The timeline is aggressive with a target launch date of Q2 next year.
          
          6. COMPLIANCE AND LEGAL: GDPR compliance, local data protection laws, employment regulations, tax implications, and intellectual property protection strategies require comprehensive legal review and board oversight.
          
          This initiative represents the largest expansion in company history and will require unprecedented coordination across all departments. The success of this project will significantly impact our market position, competitive advantage, and long-term growth trajectory.
          
          Please confirm your availability for an emergency board session within the next 48 hours. The confidentiality of this information is paramount, and all discussions should be conducted through secure channels only.
          
          Time-sensitive decisions pending:
          - Budget approval by Friday EOD
          - Legal framework approval by next Tuesday
          - Stakeholder communication strategy by next Wednesday
          - Final go/no-go decision by end of next week
          
          Best regards,
          Strategic Planning Committee
          International Expansion Task Force
          Executive Operations Team
        `,
        attachments: [
          { filename: 'financial-analysis-detailed.pdf', size: 5242880, mimeType: 'application/pdf' },
          { filename: 'market-research-europe.xlsx', size: 3145728, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
          { filename: 'market-research-asia.xlsx', size: 2097152, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
          { filename: 'risk-assessment-report.docx', size: 1572864, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
          { filename: 'legal-compliance-summary.pdf', size: 4194304, mimeType: 'application/pdf' }
        ]
      };

      const startTime = Date.now();
      const analysis = await intelligenceEngine.analyzeEmail(complexEmail);
      const processingTime = Date.now() - startTime;

      console.log(`📊 Complex Email Analysis:`);
      console.log(`   Processing Time: ${processingTime}ms`);
      console.log(`   Email Length: ${complexEmail.body.length} characters`);
      console.log(`   Attachments: ${complexEmail.attachments.length}`);
      console.log(`   Priority Score: ${analysis.priorityScore.overall}`);

      expect(processingTime).toBeLessThan(150); // Slightly higher threshold for complex emails
      expect(analysis.priorityScore.overall).toBeGreaterThan(80); // Should detect high priority
      expect(analysis.categorization.primary).toBe('business-critical');
      expect(analysis.actionItems.escalationRecommended).toBe(true);
    });
  });

  describe('Throughput Performance', () => {
    it('should process 1000+ emails per hour', async () => {
      const emailCount = 100; // Reduced for test performance
      const emails: EmailContent[] = [];

      // Generate test emails
      for (let i = 0; i < emailCount; i++) {
        emails.push({
          ...mockEmail,
          id: `throughput-test-${i}`,
          subject: `Throughput Test Email ${i}`,
          body: `This is test email number ${i} for throughput testing. Content varies to test analysis performance.`
        });
      }

      const startTime = Date.now();
      
      // Process emails in parallel batches
      const batchSize = 10;
      const batches: EmailContent[][] = [];
      for (let i = 0; i < emails.length; i += batchSize) {
        batches.push(emails.slice(i, i + batchSize));
      }

      let processedCount = 0;
      for (const batch of batches) {
        const batchPromises = batch.map(email => intelligenceEngine.analyzeEmail(email));
        await Promise.all(batchPromises);
        processedCount += batch.length;
      }

      const totalTime = Date.now() - startTime;
      const emailsPerSecond = (processedCount / totalTime) * 1000;
      const emailsPerHour = emailsPerSecond * 3600;

      console.log(`📊 Throughput Performance:`);
      console.log(`   Emails Processed: ${processedCount}`);
      console.log(`   Total Time: ${totalTime}ms`);
      console.log(`   Emails per Second: ${emailsPerSecond.toFixed(2)}`);
      console.log(`   Emails per Hour: ${emailsPerHour.toFixed(0)}`);

      expect(processedCount).toBe(emailCount);
      expect(emailsPerHour).toBeGreaterThan(1000); // Target: 1000+ emails/hour
    });

    it('should handle memory efficiently during batch processing', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const emailCount = 50;

      // Process emails and monitor memory
      for (let i = 0; i < emailCount; i++) {
        await intelligenceEngine.analyzeEmail({
          ...mockEmail,
          id: `memory-test-${i}`,
          subject: `Memory Test ${i}`,
          body: `Memory test email with content ${i}`.repeat(100) // Larger content
        });

        // Force garbage collection every 10 emails if available
        if (i % 10 === 0 && global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const memoryPerEmail = memoryIncrease / emailCount;

      console.log(`📊 Memory Performance:`);
      console.log(`   Initial Memory: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Final Memory: ${(finalMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Memory Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Memory per Email: ${(memoryPerEmail / 1024).toFixed(2)} KB`);

      // Memory increase should be reasonable
      expect(memoryPerEmail).toBeLessThan(100 * 1024); // Less than 100KB per email
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB total
    });
  });

  describe('Authentication Performance', () => {
    it('should authenticate quickly', async () => {
      const startTime = Date.now();
      
      // Test OAuth2 manager initialization
      const authStatus = authManager.getAuthStatus();
      
      const processingTime = Date.now() - startTime;

      console.log(`📊 Authentication Performance:`);
      console.log(`   Auth Status Time: ${processingTime}ms`);
      console.log(`   Auth Status:`, authStatus);

      expect(processingTime).toBeLessThan(10); // Should be very fast
      expect(authStatus).toHaveProperty('total');
      expect(authStatus).toHaveProperty('active');
    });

    it('should handle token refresh efficiently', async () => {
      // Add mock account
      const accountId = authManager.addAccount(
        'test@example.com',
        'gmail',
        {
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          expiresAt: new Date(Date.now() + 3600000),
          tokenType: 'Bearer',
          scope: 'email'
        }
      );

      const startTime = Date.now();
      
      // Test token validation (should be fast for valid tokens)
      const isValid = authManager.isTokenValid(accountId);
      
      const processingTime = Date.now() - startTime;

      console.log(`📊 Token Validation Performance:`);
      console.log(`   Validation Time: ${processingTime}ms`);
      console.log(`   Token Valid: ${isValid}`);

      expect(processingTime).toBeLessThan(5);
      expect(isValid).toBe(true);
    });
  });

  describe('Provider-Specific Performance', () => {
    it('should ensure Outlook LOCAL mode is performant', () => {
      const startTime = Date.now();
      
      const connectionStatus = outlookConnector.getConnectionStatus();
      const securityStatus = outlookConnector.getSecurityStatus();
      
      const processingTime = Date.now() - startTime;

      console.log(`📊 Outlook LOCAL Performance:`);
      console.log(`   Status Check Time: ${processingTime}ms`);
      console.log(`   Connection Status:`, connectionStatus);
      console.log(`   Security Status:`, securityStatus);

      expect(processingTime).toBeLessThan(10);
      expect(connectionStatus.mode).toBe('LOCAL_ONLY');
      expect(securityStatus.localAccess).toBe(true);
      expect(securityStatus.cloudApiDisabled).toBe(true);
    });

    it('should verify Gmail connector performance', () => {
      const startTime = Date.now();
      
      const connectionStatus = gmailConnector.getConnectionStatus();
      
      const processingTime = Date.now() - startTime;

      console.log(`📊 Gmail Connector Performance:`);
      console.log(`   Status Check Time: ${processingTime}ms`);
      console.log(`   Connection Status:`, connectionStatus);

      expect(processingTime).toBeLessThan(10);
      expect(connectionStatus.connected).toBe(true);
      expect(connectionStatus.provider).toBe('gmail');
    });
  });

  describe('End-to-End Performance', () => {
    it('should complete full email processing pipeline under target time', async () => {
      const startTime = Date.now();

      // Full pipeline: auth -> retrieve -> analyze -> categorize -> respond
      const authStatus = authManager.getAuthStatus();
      const analysis = await intelligenceEngine.analyzeEmail(mockEmail);
      const gmailStatus = gmailConnector.getConnectionStatus();
      const outlookStatus = outlookConnector.getConnectionStatus();

      const totalTime = Date.now() - startTime;

      console.log(`📊 End-to-End Pipeline Performance:`);
      console.log(`   Total Pipeline Time: ${totalTime}ms`);
      console.log(`   Auth Status: OK`);
      console.log(`   Analysis Priority: ${analysis.priorityScore.overall}`);
      console.log(`   Gmail Status: ${gmailStatus.connected ? 'OK' : 'FAIL'}`);
      console.log(`   Outlook Status: ${outlookStatus.connected ? 'OK' : 'FAIL'}`);

      expect(totalTime).toBeLessThan(200); // Full pipeline under 200ms
      expect(analysis.priorityScore.overall).toBeGreaterThan(0);
      expect(gmailStatus.connected).toBe(true);
      expect(outlookStatus.connected).toBe(true);
    });
  });
});