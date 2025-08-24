/**
 * Unified Inbox Manager - WBS 1.4.1
 * Multi-Account Email Aggregation and Management
 */

import { EmailContent } from '../intelligence/EmailIntelligenceEngine';
import { OAuth2Manager } from '../authentication/OAuth2Manager';
import { GmailConnector } from '../providers/gmail/GmailConnector';
import { OutlookLocalConnector } from '../providers/outlook/OutlookLocalConnector';

export interface EmailAccount {
  id: string;
  type: 'gmail' | 'outlook-local';
  email: string;
  displayName: string;
  enabled: boolean;
  settings: AccountSettings;
}

export interface AccountSettings {
  syncEnabled: boolean;
  syncInterval: number; // minutes
  folderFilters: string[];
  priorityLevel: 'low' | 'medium' | 'high';
  notificationsEnabled: boolean;
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: string[];
  messages: EmailContent[];
  lastActivity: Date;
  status: 'active' | 'archived' | 'deleted';
  priority: number;
  accounts: string[]; // Account IDs where this thread appears
}

export interface UnifiedSearchOptions {
  query: string;
  accounts?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  senders?: string[];
  hasAttachments?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  limit?: number;
  offset?: number;
}

export interface UnifiedSearchResult {
  emails: EmailContent[];
  threads: EmailThread[];
  totalCount: number;
  searchTime: number;
  facets: {
    accounts: { [accountId: string]: number };
    senders: { [sender: string]: number };
    timeRanges: { [range: string]: number };
  };
}

/**
 * Unified Inbox Manager
 * Provides multi-account email aggregation and intelligent threading
 */
export class UnifiedInboxManager {
  private authManager: OAuth2Manager;
  private gmailConnector: GmailConnector;
  private outlookConnector: OutlookLocalConnector;
  private accounts: Map<string, EmailAccount> = new Map();
  private threads: Map<string, EmailThread> = new Map();
  private emailCache: Map<string, EmailContent> = new Map();

  constructor(authManager: OAuth2Manager) {
    this.authManager = authManager;
    this.gmailConnector = new GmailConnector(authManager);
    this.outlookConnector = new OutlookLocalConnector(authManager);
  }

  /**
   * Add email account to unified inbox
   */
  async addAccount(
    type: 'gmail' | 'outlook-local',
    email: string,
    displayName: string,
    settings?: Partial<AccountSettings>
  ): Promise<string> {
    const accountId = `${type}_${email}_${Date.now()}`;
    
    const defaultSettings: AccountSettings = {
      syncEnabled: true,
      syncInterval: 5, // 5 minutes
      folderFilters: ['INBOX', 'SENT'],
      priorityLevel: 'medium',
      notificationsEnabled: true,
      ...settings
    };

    const account: EmailAccount = {
      id: accountId,
      type,
      email,
      displayName,
      enabled: true,
      settings: defaultSettings
    };

    this.accounts.set(accountId, account);
    
    console.log(`📧 Added ${type} account: ${email} (${accountId})`);
    
    // Initialize sync for new account
    if (defaultSettings.syncEnabled) {
      await this.syncAccount(accountId);
    }

    return accountId;
  }

  /**
   * Remove account from unified inbox
   */
  async removeAccount(accountId: string): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    // Remove account from all threads
    for (const thread of this.threads.values()) {
      thread.accounts = thread.accounts.filter(id => id !== accountId);
      if (thread.accounts.length === 0) {
        this.threads.delete(thread.id);
      }
    }

    // Clear account emails from cache
    for (const [emailId, email] of this.emailCache) {
      if (email.id.startsWith(accountId)) {
        this.emailCache.delete(emailId);
      }
    }

    this.accounts.delete(accountId);
    console.log(`📧 Removed account: ${account.email} (${accountId})`);
  }

  /**
   * Sync emails from specific account
   */
  async syncAccount(accountId: string): Promise<number> {
    const account = this.accounts.get(accountId);
    if (!account || !account.enabled || !account.settings.syncEnabled) {
      return 0;
    }

    console.log(`🔄 Syncing account: ${account.email} (${account.type})`);
    
    const startTime = Date.now();
    let emails: EmailContent[] = [];

    try {
      switch (account.type) {
        case 'gmail':
          emails = await this.syncGmailAccount(accountId);
          break;
        case 'outlook-local':
          emails = await this.syncOutlookAccount(accountId);
          break;
        default:
          throw new Error(`Unsupported account type: ${account.type}`);
      }

      // Process emails into threads
      await this.processEmailsIntoThreads(emails, accountId);
      
      const syncTime = Date.now() - startTime;
      console.log(`✅ Synced ${emails.length} emails from ${account.email} in ${syncTime}ms`);
      
      return emails.length;
    } catch (error) {
      console.error(`❌ Failed to sync account ${account.email}:`, error);
      throw error;
    }
  }

  /**
   * Sync emails from Gmail account
   */
  private async syncGmailAccount(accountId: string): Promise<EmailContent[]> {
    const _account = this.accounts.get(accountId)!;
    
    const messages = await this.gmailConnector.getMessages(accountId, {
      maxResults: 100,
      query: 'in:inbox OR in:sent'
    });

    const emails: EmailContent[] = [];
    for (const gmailMessage of messages.messages) {
      const content = this.gmailConnector.extractEmailContent(gmailMessage.payload);
      
      const email: EmailContent = {
        id: `${accountId}_${gmailMessage.id}`,
        subject: content.headers['subject'] || '',
        body: content.htmlContent || content.textContent || '',
        from: (() => {
          const name = this.extractNameFromHeader(content.headers['from']);
          const email = this.extractEmailFromHeader(content.headers['from']);
          return name ? { name, email } : { email };
        })(),
        to: this.parseEmailHeaders(content.headers['to'] || ''),
        cc: this.parseEmailHeaders(content.headers['cc'] || ''),
        timestamp: new Date(parseInt(gmailMessage.internalDate)),
        attachments: []
      };

      emails.push(email);
      this.emailCache.set(email.id, email);
    }

    return emails;
  }

  /**
   * Sync emails from Outlook LOCAL account
   */
  private async syncOutlookAccount(accountId: string): Promise<EmailContent[]> {
    console.log('🔒 SECURITY: Syncing Outlook LOCAL account only');
    
    const _account = this.accounts.get(accountId)!;
    
    const messages = await this.outlookConnector.getMessages(accountId, {
      top: 100,
      filter: "receivedDateTime ge 2024-01-01T00:00:00Z"
    });

    const emails: EmailContent[] = [];
    for (const outlookMessage of messages.messages) {
      const email: EmailContent = {
        id: `${accountId}_${outlookMessage.id}`,
        subject: outlookMessage.subject || '',
        body: outlookMessage.body?.content || outlookMessage.bodyPreview || '',
        from: {
          ...(outlookMessage.from?.name && { name: outlookMessage.from.name }),
          email: outlookMessage.from?.address
        },
        to: outlookMessage.toRecipients?.map((r: any) => ({ 
          ...(r.name && { name: r.name }),
          email: r.address 
        })) || [],
        cc: outlookMessage.ccRecipients?.map((r: any) => ({ 
          ...(r.name && { name: r.name }),
          email: r.address 
        })) || [],
        timestamp: new Date(outlookMessage.receivedDateTime),
        attachments: []
      };

      emails.push(email);
      this.emailCache.set(email.id, email);
    }

    return emails;
  }

  /**
   * Process emails into conversation threads
   */
  private async processEmailsIntoThreads(emails: EmailContent[], accountId: string): Promise<void> {
    for (const email of emails) {
      const threadId = this.generateThreadId(email);
      
      let thread = this.threads.get(threadId);
      if (!thread) {
        thread = {
          id: threadId,
          subject: this.normalizeSubject(email.subject),
          participants: this.extractParticipants(email),
          messages: [],
          lastActivity: email.timestamp,
          status: 'active',
          priority: 0,
          accounts: []
        };
        this.threads.set(threadId, thread);
      }

      // Add email to thread
      thread.messages.push(email);
      thread.lastActivity = new Date(Math.max(
        thread.lastActivity.getTime(),
        email.timestamp.getTime()
      ));

      // Update participants
      thread.participants = [...new Set([
        ...thread.participants,
        ...this.extractParticipants(email)
      ])];

      // Add account to thread if not already present
      if (!thread.accounts.includes(accountId)) {
        thread.accounts.push(accountId);
      }

      // Sort messages by timestamp
      thread.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }
  }

  /**
   * Perform unified search across all accounts
   */
  async search(options: UnifiedSearchOptions): Promise<UnifiedSearchResult> {
    const startTime = Date.now();
    
    const searchAccounts = options.accounts || Array.from(this.accounts.keys());
    const results: EmailContent[] = [];
    const matchingThreads: EmailThread[] = [];
    const facets = {
      accounts: {} as { [accountId: string]: number },
      senders: {} as { [sender: string]: number },
      timeRanges: {} as { [range: string]: number }
    };

    // Search in cached emails
    for (const email of this.emailCache.values()) {
      const accountId = email.id.split('_')[0] + '_' + email.id.split('_')[1];
      
      if (!searchAccounts.includes(accountId)) continue;
      
      if (this.matchesSearchCriteria(email, options)) {
        results.push(email);
        
        // Update facets
        facets.accounts[accountId] = (facets.accounts[accountId] || 0) + 1;
        facets.senders[email.from.email] = (facets.senders[email.from.email] || 0) + 1;
        
        const timeRange = this.getTimeRange(email.timestamp);
        facets.timeRanges[timeRange] = (facets.timeRanges[timeRange] || 0) + 1;
      }
    }

    // Find matching threads
    for (const thread of this.threads.values()) {
      if (thread.messages.some(msg => results.includes(msg))) {
        matchingThreads.push(thread);
      }
    }

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const paginatedResults = results.slice(offset, offset + limit);

    const searchTime = Date.now() - startTime;
    
    console.log(`🔍 Search completed: ${results.length} results in ${searchTime}ms`);

    return {
      emails: paginatedResults,
      threads: matchingThreads,
      totalCount: results.length,
      searchTime,
      facets
    };
  }

  /**
   * Get all email threads
   */
  getThreads(accountIds?: string[]): EmailThread[] {
    const threads = Array.from(this.threads.values());
    
    if (!accountIds) {
      return threads;
    }
    
    return threads.filter(thread => 
      accountIds.some(accountId => thread.accounts.includes(accountId))
    );
  }

  /**
   * Get thread by ID
   */
  getThread(threadId: string): EmailThread | undefined {
    return this.threads.get(threadId);
  }

  /**
   * Get account settings
   */
  getAccountSettings(accountId: string): AccountSettings | undefined {
    const account = this.accounts.get(accountId);
    return account?.settings;
  }

  /**
   * Update account settings
   */
  async updateAccountSettings(
    accountId: string, 
    settings: Partial<AccountSettings>
  ): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    account.settings = {
      ...account.settings,
      ...settings
    };

    console.log(`⚙️ Updated settings for account: ${account.email}`);
  }

  /**
   * Get inbox statistics
   */
  getInboxStats(): {
    totalAccounts: number;
    totalEmails: number;
    totalThreads: number;
    accountBreakdown: { [accountId: string]: number };
  } {
    const accountBreakdown: { [accountId: string]: number } = {};
    
    for (const [accountId, _account] of this.accounts) {
      accountBreakdown[accountId] = 0;
    }

    for (const email of this.emailCache.values()) {
      const accountId = email.id.split('_')[0] + '_' + email.id.split('_')[1];
      if (accountBreakdown.hasOwnProperty(accountId)) {
        accountBreakdown[accountId]++;
      }
    }

    return {
      totalAccounts: this.accounts.size,
      totalEmails: this.emailCache.size,
      totalThreads: this.threads.size,
      accountBreakdown
    };
  }

  // Helper methods

  private generateThreadId(email: EmailContent): string {
    const normalizedSubject = this.normalizeSubject(email.subject);
    const participants = this.extractParticipants(email).sort().join(',');
    return `thread_${Buffer.from(normalizedSubject + participants).toString('base64')}`;
  }

  private normalizeSubject(subject: string): string {
    return subject
      .replace(/^(re:|fwd?:|fw:)\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  private extractParticipants(email: EmailContent): string[] {
    const participants = [email.from.email];
    participants.push(...email.to.map(addr => addr.email));
    if (email.cc) {
      participants.push(...email.cc.map(addr => addr.email));
    }
    return [...new Set(participants)];
  }

  private matchesSearchCriteria(email: EmailContent, options: UnifiedSearchOptions): boolean {
    // Query matching
    if (options.query) {
      const query = options.query.toLowerCase();
      const searchText = `${email.subject} ${email.body} ${email.from.email}`.toLowerCase();
      if (!searchText.includes(query)) {
        return false;
      }
    }

    // Date range filtering
    if (options.dateRange) {
      if (email.timestamp < options.dateRange.start || email.timestamp > options.dateRange.end) {
        return false;
      }
    }

    // Sender filtering
    if (options.senders && options.senders.length > 0) {
      if (!options.senders.includes(email.from.email)) {
        return false;
      }
    }

    // Attachment filtering
    if (options.hasAttachments !== undefined) {
      const hasAttachments = email.attachments && email.attachments.length > 0;
      if (options.hasAttachments !== hasAttachments) {
        return false;
      }
    }

    return true;
  }

  private getTimeRange(date: Date): string {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays <= 7) return 'this_week';
    if (diffDays <= 30) return 'this_month';
    if (diffDays <= 365) return 'this_year';
    return 'older';
  }

  private extractNameFromHeader(header: string): string | undefined {
    const match = header?.match(/^(.+?)\\s*<.+>$/);
    return match ? match[1].trim().replace(/"/g, '') : undefined;
  }

  private extractEmailFromHeader(header: string): string {
    const match = header?.match(/<(.+)>$/);
    return match ? match[1] : header;
  }

  private parseEmailHeaders(header: string): { name?: string; email: string }[] {
    if (!header) return [];
    
    return header.split(',').map(addr => {
      const name = this.extractNameFromHeader(addr.trim());
      const email = this.extractEmailFromHeader(addr.trim());
      return name ? { name, email } : { email };
    });
  }
}