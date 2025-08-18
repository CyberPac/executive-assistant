/**
 * Historical Email Ingestion Engine - WBS 1.3.1
 * Processes historical emails to build executive knowledge base
 */

import { EmailIntelligenceEngine, EmailContent, IntelligenceAnalysis } from '../intelligence/EmailIntelligenceEngine';
import { ExecutiveContext } from '../../types/pea-agent-types';
import { OAuth2Manager } from '../authentication/OAuth2Manager';
import { GmailConnector } from '../providers/gmail/GmailConnector';
import { OutlookLocalConnector } from '../providers/outlook/OutlookLocalConnector';

export interface HistoricalScanOptions {
  startDate?: Date;
  endDate?: Date;
  maxEmails?: number;
  batchSize?: number;
  providers: ('gmail' | 'outlook-local')[];
  accounts: string[];
}

export interface IngestionProgress {
  totalEmails: number;
  processedEmails: number;
  successfulIngestions: number;
  errors: number;
  currentBatch: number;
  totalBatches: number;
  estimatedTimeRemaining: number;
  status: 'running' | 'paused' | 'completed' | 'error';
}

export interface KnowledgeExtraction {
  contactRelationships: Map<string, ContactRelationship>;
  communicationPatterns: CommunicationPattern[];
  projectTimelines: ProjectTimeline[];
  executivePreferences: ExecutivePreferences;
  decisionPatterns: DecisionPattern[];
}

export interface ContactRelationship {
  email: string;
  name?: string;
  relationship: 'board' | 'executive' | 'employee' | 'client' | 'partner' | 'vendor';
  frequency: number;
  lastContact: Date;
  importance: number;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface CommunicationPattern {
  timeOfDay: { hour: number; frequency: number }[];
  dayOfWeek: { day: string; frequency: number }[];
  responseTime: { average: number; median: number };
  preferredChannels: string[];
  communicationStyle: 'formal' | 'informal' | 'mixed';
}

export interface ProjectTimeline {
  projectName: string;
  startDate: Date;
  endDate?: Date;
  participants: string[];
  keyMilestones: { date: Date; event: string }[];
  status: 'active' | 'completed' | 'cancelled';
}

export interface ExecutivePreferences {
  preferredMeetingTimes: { day: string; time: string }[];
  communicationStyle: string;
  responseTimeExpectations: number;
  priorityKeywords: string[];
  delegationPatterns: { task: string; delegateTo: string }[];
}

export interface DecisionPattern {
  decisionType: string;
  typicalTimeframe: number;
  requiredInformation: string[];
  stakeholdersInvolved: string[];
  approvalProcess: string[];
}

/**
 * Historical Email Ingestion Engine
 * Processes historical emails to extract executive knowledge and patterns
 */
export class HistoricalEmailIngestion {
  private authManager: OAuth2Manager;
  private gmailConnector: GmailConnector;
  private outlookConnector: OutlookLocalConnector;
  private intelligenceEngine: EmailIntelligenceEngine;
  private executiveContext: ExecutiveContext;
  private knowledgeBase: Map<string, any> = new Map();
  private ingestionProgress: IngestionProgress;

  constructor(
    authManager: OAuth2Manager,
    intelligenceEngine: EmailIntelligenceEngine,
    executiveContext: ExecutiveContext
  ) {
    this.authManager = authManager;
    this.gmailConnector = new GmailConnector(authManager);
    this.outlookConnector = new OutlookLocalConnector(authManager);
    this.intelligenceEngine = intelligenceEngine;
    this.executiveContext = executiveContext;
    
    this.ingestionProgress = {
      totalEmails: 0,
      processedEmails: 0,
      successfulIngestions: 0,
      errors: 0,
      currentBatch: 0,
      totalBatches: 0,
      estimatedTimeRemaining: 0,
      status: 'completed'
    };
  }

  /**
   * Start historical email ingestion process
   */
  async startIngestion(options: HistoricalScanOptions): Promise<void> {
    console.log('📚 Starting historical email ingestion...');
    
    this.ingestionProgress.status = 'running';
    const startTime = Date.now();

    try {
      // Phase 1: Discover and count emails
      const emailDiscovery = await this.discoverEmails(options);
      this.ingestionProgress.totalEmails = emailDiscovery.totalCount;
      this.ingestionProgress.totalBatches = Math.ceil(emailDiscovery.totalCount / options.batchSize!);

      console.log(`📊 Discovered ${emailDiscovery.totalCount} emails across ${options.accounts.length} accounts`);

      // Phase 2: Process emails in batches
      await this.processBatches(emailDiscovery.emails, options.batchSize || 50);

      // Phase 3: Extract knowledge patterns
      const knowledge = await this.extractKnowledge();

      // Phase 4: Update executive profile
      await this.updateExecutiveProfile(knowledge);

      this.ingestionProgress.status = 'completed';
      const totalTime = Date.now() - startTime;
      
      console.log(`✅ Historical ingestion completed in ${totalTime}ms`);
      console.log(`📈 Processed: ${this.ingestionProgress.processedEmails} emails`);
      console.log(`✅ Successful: ${this.ingestionProgress.successfulIngestions}`);
      console.log(`❌ Errors: ${this.ingestionProgress.errors}`);

    } catch (error) {
      this.ingestionProgress.status = 'error';
      console.error('❌ Historical ingestion failed:', error);
      throw error;
    }
  }

  /**
   * Discover historical emails across all accounts
   */
  private async discoverEmails(options: HistoricalScanOptions): Promise<{
    totalCount: number;
    emails: { accountId: string; provider: string; emails: EmailContent[] }[];
  }> {
    const allEmails: { accountId: string; provider: string; emails: EmailContent[] }[] = [];
    let totalCount = 0;

    for (const accountId of options.accounts) {
      const account = this.authManager.getAccount(accountId);
      if (!account) continue;

      console.log(`🔍 Discovering emails for account: ${account.email} (${account.provider})`);

      let accountEmails: EmailContent[] = [];

      if (account.provider === 'gmail' && options.providers.includes('gmail')) {
        accountEmails = await this.discoverGmailEmails(accountId, options);
      } else if (account.provider === 'outlook-local' && options.providers.includes('outlook-local')) {
        accountEmails = await this.discoverOutlookEmails(accountId, options);
      }

      allEmails.push({
        accountId,
        provider: account.provider,
        emails: accountEmails
      });

      totalCount += accountEmails.length;
      console.log(`📧 Found ${accountEmails.length} emails in ${account.email}`);
    }

    return { totalCount, emails: allEmails };
  }

  /**
   * Discover Gmail historical emails
   */
  private async discoverGmailEmails(accountId: string, options: HistoricalScanOptions): Promise<EmailContent[]> {
    const emails: EmailContent[] = [];
    let pageToken: string | undefined;
    let totalFetched = 0;

    do {
      const result = await this.gmailConnector.getMessages(accountId, {
        maxResults: Math.min(100, (options.maxEmails || 1000) - totalFetched),
        pageToken
      });

      for (const gmailMessage of result.messages) {
        const emailContent = this.convertGmailToEmailContent(gmailMessage);
        
        // Filter by date range
        if (options.startDate && emailContent.timestamp < options.startDate) continue;
        if (options.endDate && emailContent.timestamp > options.endDate) continue;

        emails.push(emailContent);
        totalFetched++;

        if (options.maxEmails && totalFetched >= options.maxEmails) break;
      }

      pageToken = result.nextPageToken;
    } while (pageToken && (!options.maxEmails || totalFetched < options.maxEmails));

    return emails;
  }

  /**
   * Discover Outlook LOCAL historical emails
   */
  private async discoverOutlookEmails(accountId: string, options: HistoricalScanOptions): Promise<EmailContent[]> {
    console.log('🔒 SECURITY: Discovering Outlook emails via LOCAL access only');
    
    const emails: EmailContent[] = [];
    let totalFetched = 0;

    const result = await this.outlookConnector.getMessages(accountId, {
      top: Math.min(100, options.maxEmails || 1000)
    });

    for (const outlookMessage of result.messages) {
      const emailContent = this.convertOutlookToEmailContent(outlookMessage);
      
      // Filter by date range
      if (options.startDate && emailContent.timestamp < options.startDate) continue;
      if (options.endDate && emailContent.timestamp > options.endDate) continue;

      emails.push(emailContent);
      totalFetched++;

      if (options.maxEmails && totalFetched >= options.maxEmails) break;
    }

    console.log(`🔒 Retrieved ${emails.length} emails from LOCAL Outlook mailbox`);
    return emails;
  }

  /**
   * Process emails in batches for performance
   */
  private async processBatches(
    emailSources: { accountId: string; provider: string; emails: EmailContent[] }[],
    batchSize: number
  ): Promise<void> {
    const allEmails = emailSources.flatMap(source => source.emails);
    const batches = this.chunkArray(allEmails, batchSize);

    for (let i = 0; i < batches.length; i++) {
      this.ingestionProgress.currentBatch = i + 1;
      
      console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batches[i].length} emails)`);

      await this.processBatch(batches[i]);

      // Update estimated time remaining
      const processedRatio = (i + 1) / batches.length;
      const elapsed = Date.now();
      this.ingestionProgress.estimatedTimeRemaining = 
        Math.round((elapsed / processedRatio) - elapsed);
    }
  }

  /**
   * Process a single batch of emails
   */
  private async processBatch(emails: EmailContent[]): Promise<void> {
    const batchPromises = emails.map(async (email) => {
      try {
        const analysis = await this.intelligenceEngine.analyzeEmail(email);
        await this.storeEmailAnalysis(email, analysis);
        
        this.ingestionProgress.processedEmails++;
        this.ingestionProgress.successfulIngestions++;
      } catch (error) {
        this.ingestionProgress.errors++;
        console.error(`❌ Failed to process email ${email.id}:`, error);
      }
    });

    await Promise.all(batchPromises);
  }

  /**
   * Store email analysis in knowledge base
   */
  private async storeEmailAnalysis(email: EmailContent, analysis: IntelligenceAnalysis): Promise<void> {
    const key = `email_analysis_${email.id}`;
    
    this.knowledgeBase.set(key, {
      email,
      analysis,
      timestamp: new Date(),
      processed: true
    });
  }

  /**
   * Extract knowledge patterns from processed emails
   */
  private async extractKnowledge(): Promise<KnowledgeExtraction> {
    console.log('🧠 Extracting knowledge patterns from historical emails...');

    const contactRelationships = this.extractContactRelationships();
    const communicationPatterns = this.extractCommunicationPatterns();
    const projectTimelines = this.extractProjectTimelines();
    const executivePreferences = this.extractExecutivePreferences();
    const decisionPatterns = this.extractDecisionPatterns();

    return {
      contactRelationships,
      communicationPatterns,
      projectTimelines,
      executivePreferences,
      decisionPatterns
    };
  }

  /**
   * Extract contact relationships from email history
   */
  private extractContactRelationships(): Map<string, ContactRelationship> {
    const relationships = new Map<string, ContactRelationship>();

    for (const [_, data] of this.knowledgeBase) {
      if (!data.email || !data.analysis) continue;

      const email = data.email as EmailContent;
      const analysis = data.analysis as IntelligenceAnalysis;

      // Process sender
      this.updateContactRelationship(relationships, email.from.email, {
        name: email.from.name,
        email: email.from.email,
        lastContact: email.timestamp,
        topics: analysis.contentAnalysis.topics,
        sentiment: analysis.contentAnalysis.sentiment === 'urgent' ? 'positive' : analysis.contentAnalysis.sentiment
      });

      // Process recipients
      email.to.forEach(recipient => {
        this.updateContactRelationship(relationships, recipient.email, {
          name: recipient.name,
          email: recipient.email,
          lastContact: email.timestamp,
          topics: analysis.contentAnalysis.topics,
          sentiment: analysis.contentAnalysis.sentiment === 'urgent' ? 'positive' : analysis.contentAnalysis.sentiment
        });
      });
    }

    return relationships;
  }

  /**
   * Extract communication patterns
   */
  private extractCommunicationPatterns(): CommunicationPattern[] {
    const timeOfDay: { [hour: number]: number } = {};
    const dayOfWeek: { [day: string]: number } = {};
    const responseTimes: number[] = [];

    for (const [_, data] of this.knowledgeBase) {
      if (!data.email) continue;

      const email = data.email as EmailContent;
      const hour = email.timestamp.getHours();
      const day = email.timestamp.toLocaleDateString('en-US', { weekday: 'long' });

      timeOfDay[hour] = (timeOfDay[hour] || 0) + 1;
      dayOfWeek[day] = (dayOfWeek[day] || 0) + 1;
    }

    return [{
      timeOfDay: Object.entries(timeOfDay).map(([hour, frequency]) => ({ hour: parseInt(hour), frequency })),
      dayOfWeek: Object.entries(dayOfWeek).map(([day, frequency]) => ({ day, frequency })),
      responseTime: { average: 0, median: 0 }, // Would calculate from thread analysis
      preferredChannels: ['email'],
      communicationStyle: 'mixed'
    }];
  }

  /**
   * Extract project timelines from email threads
   */
  private extractProjectTimelines(): ProjectTimeline[] {
    // Implementation would analyze email threads for project references
    return [];
  }

  /**
   * Extract executive preferences from email patterns
   */
  private extractExecutivePreferences(): ExecutivePreferences {
    return {
      preferredMeetingTimes: [],
      communicationStyle: 'diplomatic',
      responseTimeExpectations: 3600000, // 1 hour
      priorityKeywords: ['urgent', 'board', 'strategic'],
      delegationPatterns: []
    };
  }

  /**
   * Extract decision patterns from email history
   */
  private extractDecisionPatterns(): DecisionPattern[] {
    return [];
  }

  /**
   * Update executive profile with extracted knowledge
   */
  private async updateExecutiveProfile(knowledge: KnowledgeExtraction): Promise<void> {
    console.log('👤 Updating executive profile with historical insights...');

    // Update stakeholders with relationship data
    for (const [email, relationship] of knowledge.contactRelationships) {
      const existingStakeholder = this.executiveContext.stakeholders.find(s => 
        s.name.toLowerCase().includes(email.toLowerCase()) ||
        email.toLowerCase().includes(s.name.toLowerCase())
      );

      if (existingStakeholder) {
        // Update existing stakeholder with historical data
        existingStakeholder.communicationHistory.push({
          timestamp: relationship.lastContact.toISOString(),
          type: 'email',
          sentiment: relationship.sentiment,
          effectiveness: relationship.importance,
          outcomes: relationship.topics
        });
      }
    }

    console.log(`✅ Updated profile with ${knowledge.contactRelationships.size} contact relationships`);
  }

  // Helper methods

  private convertGmailToEmailContent(gmailMessage: any): EmailContent {
    const content = this.gmailConnector.extractEmailContent(gmailMessage.payload);
    
    return {
      id: gmailMessage.id,
      subject: content.headers['subject'] || '',
      body: content.htmlContent || content.textContent || '',
      from: { 
        name: this.extractNameFromHeader(content.headers['from']),
        email: this.extractEmailFromHeader(content.headers['from'])
      },
      to: this.parseEmailHeaders(content.headers['to'] || ''),
      cc: this.parseEmailHeaders(content.headers['cc'] || ''),
      timestamp: new Date(parseInt(gmailMessage.internalDate)),
      attachments: this.extractAttachments(gmailMessage.payload)
    };
  }

  private convertOutlookToEmailContent(outlookMessage: any): EmailContent {
    return {
      id: outlookMessage.id,
      subject: outlookMessage.subject || '',
      body: outlookMessage.body?.content || outlookMessage.bodyPreview || '',
      from: {
        name: outlookMessage.from?.name,
        email: outlookMessage.from?.address
      },
      to: outlookMessage.toRecipients?.map((r: any) => ({ name: r.name, email: r.address })) || [],
      cc: outlookMessage.ccRecipients?.map((r: any) => ({ name: r.name, email: r.address })) || [],
      timestamp: new Date(outlookMessage.receivedDateTime),
      attachments: [] // Would extract from hasAttachments
    };
  }

  private updateContactRelationship(
    relationships: Map<string, ContactRelationship>,
    email: string,
    data: Partial<ContactRelationship>
  ): void {
    const existing = relationships.get(email);
    
    if (existing) {
      existing.frequency++;
      existing.lastContact = data.lastContact || existing.lastContact;
      if (data.topics) {
        existing.topics = [...new Set([...existing.topics, ...data.topics])];
      }
    } else {
      relationships.set(email, {
        email,
        name: data.name,
        relationship: 'partner',
        frequency: 1,
        lastContact: data.lastContact || new Date(),
        importance: 0.5,
        topics: data.topics || [],
        sentiment: data.sentiment || 'neutral'
      });
    }
  }

  private extractNameFromHeader(header: string): string | undefined {
    const match = header?.match(/^(.+?)\s*<.+>$/);
    return match ? match[1].trim().replace(/"/g, '') : undefined;
  }

  private extractEmailFromHeader(header: string): string {
    const match = header?.match(/<(.+)>$/);
    return match ? match[1] : header;
  }

  private parseEmailHeaders(header: string): { name?: string; email: string }[] {
    if (!header) return [];
    
    return header.split(',').map(addr => ({
      name: this.extractNameFromHeader(addr.trim()),
      email: this.extractEmailFromHeader(addr.trim())
    }));
  }

  private extractAttachments(payload: any): { filename: string; size: number; mimeType: string }[] {
    // Extract attachment information from Gmail payload
    return [];
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get ingestion progress
   */
  getProgress(): IngestionProgress {
    return { ...this.ingestionProgress };
  }

  /**
   * Get extracted knowledge base
   */
  getKnowledgeBase(): Map<string, any> {
    return this.knowledgeBase;
  }

  /**
   * Pause ingestion process
   */
  pause(): void {
    this.ingestionProgress.status = 'paused';
  }

  /**
   * Resume ingestion process
   */
  resume(): void {
    this.ingestionProgress.status = 'running';
  }
}