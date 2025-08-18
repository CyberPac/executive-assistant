/**
 * Email Threading Engine - WBS 1.4.1.2
 * Advanced conversation detection and thread organization
 */

import { EmailContent } from '../intelligence/EmailIntelligenceEngine';
import { EmailThread } from './UnifiedInboxManager';

export interface ThreadDetectionOptions {
  strictMode: boolean; // Require exact subject match or allow fuzzy matching
  timeWindowHours: number; // Max time between emails to consider same thread
  participantThreshold: number; // Min overlap of participants (0-1)
  subjectSimilarityThreshold: number; // Min subject similarity (0-1)
}

export interface ThreadAnalytics {
  conversationDepth: number;
  averageResponseTime: number; // in hours
  participantEngagement: { [email: string]: number };
  threadVelocity: number; // messages per day
  lastActivity: Date;
  threadHealth: 'active' | 'stale' | 'dead';
}

export interface CrossPlatformThread {
  id: string;
  platforms: ('gmail' | 'outlook-local')[];
  unifiedSubject: string;
  participants: string[];
  messages: EmailContent[];
  analytics: ThreadAnalytics;
  conflictResolution: ConflictResolution[];
}

export interface ConflictResolution {
  type: 'duplicate' | 'subject_mismatch' | 'participant_mismatch' | 'timestamp_conflict';
  description: string;
  resolution: string;
  confidence: number;
  timestamp: Date;
}

/**
 * Email Threading Engine
 * Provides intelligent conversation detection and cross-platform thread linking
 */
export class EmailThreadingEngine {
  private threads: Map<string, EmailThread> = new Map();
  private crossPlatformThreads: Map<string, CrossPlatformThread> = new Map();
  private messageToThread: Map<string, string> = new Map();
  
  private defaultOptions: ThreadDetectionOptions = {
    strictMode: false,
    timeWindowHours: 168, // 7 days
    participantThreshold: 0.6,
    subjectSimilarityThreshold: 0.8
  };

  /**
   * Process emails into conversation threads
   */
  async processEmails(
    emails: EmailContent[], 
    options: Partial<ThreadDetectionOptions> = {}
  ): Promise<EmailThread[]> {
    const opts = { ...this.defaultOptions, ...options };
    
    console.log(`🧵 Processing ${emails.length} emails into threads...`);
    const startTime = Date.now();

    // Sort emails by timestamp for chronological processing
    const sortedEmails = emails.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    for (const email of sortedEmails) {
      await this.processEmailIntoThread(email, opts);
    }

    // Optimize and merge threads
    await this.optimizeThreads(opts);
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Thread processing complete: ${this.threads.size} threads in ${processingTime}ms`);

    return Array.from(this.threads.values());
  }

  /**
   * Process single email into appropriate thread
   */
  private async processEmailIntoThread(
    email: EmailContent,
    options: ThreadDetectionOptions
  ): Promise<void> {
    // Check if email already belongs to a thread
    const existingThreadId = this.messageToThread.get(email.id);
    if (existingThreadId) {
      const thread = this.threads.get(existingThreadId);
      if (thread) {
        this.updateThreadWithEmail(thread, email);
        return;
      }
    }

    // Find matching thread
    const matchingThread = await this.findMatchingThread(email, options);
    
    if (matchingThread) {
      this.addEmailToThread(matchingThread, email);
    } else {
      // Create new thread
      this.createNewThread(email);
    }
  }

  /**
   * Find existing thread that matches the email
   */
  private async findMatchingThread(
    email: EmailContent,
    options: ThreadDetectionOptions
  ): Promise<EmailThread | null> {
    const candidates: { thread: EmailThread; score: number }[] = [];

    for (const thread of this.threads.values()) {
      const score = this.calculateThreadMatchScore(email, thread, options);
      if (score > 0.5) { // Minimum threshold
        candidates.push({ thread, score });
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    // Return thread with highest score
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].thread;
  }

  /**
   * Calculate how well an email matches an existing thread
   */
  private calculateThreadMatchScore(
    email: EmailContent,
    thread: EmailThread,
    options: ThreadDetectionOptions
  ): number {
    let score = 0;
    const weights = {
      subject: 0.4,
      participants: 0.3,
      time: 0.2,
      references: 0.1
    };

    // Subject similarity
    const subjectScore = this.calculateSubjectSimilarity(
      email.subject,
      thread.subject
    );
    score += subjectScore * weights.subject;

    // Participant overlap
    const emailParticipants = this.extractParticipants(email);
    const participantOverlap = this.calculateParticipantOverlap(
      emailParticipants,
      thread.participants
    );
    score += participantOverlap * weights.participants;

    // Time proximity
    const timeScore = this.calculateTimeProximityScore(
      email.timestamp,
      thread.lastActivity,
      options.timeWindowHours
    );
    score += timeScore * weights.time;

    // In-Reply-To and References headers (if available)
    const referencesScore = this.calculateReferencesScore(email, thread);
    score += referencesScore * weights.references;

    return Math.min(score, 1.0);
  }

  /**
   * Calculate subject similarity using Levenshtein distance
   */
  private calculateSubjectSimilarity(subject1: string, subject2: string): number {
    const normalized1 = this.normalizeSubject(subject1);
    const normalized2 = this.normalizeSubject(subject2);

    if (normalized1 === normalized2) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    
    return maxLength === 0 ? 1.0 : 1 - (distance / maxLength);
  }

  /**
   * Calculate participant overlap between email and thread
   */
  private calculateParticipantOverlap(participants1: string[], participants2: string[]): number {
    const set1 = new Set(participants1.map(p => p.toLowerCase()));
    const set2 = new Set(participants2.map(p => p.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Calculate time proximity score
   */
  private calculateTimeProximityScore(
    emailTime: Date,
    threadTime: Date,
    timeWindowHours: number
  ): number {
    const timeDiffHours = Math.abs(emailTime.getTime() - threadTime.getTime()) / (1000 * 60 * 60);
    
    if (timeDiffHours > timeWindowHours) {
      return 0;
    }
    
    return 1 - (timeDiffHours / timeWindowHours);
  }

  /**
   * Calculate references score (email headers like In-Reply-To)
   */
  private calculateReferencesScore(_email: EmailContent, _thread: EmailThread): number {
    // This would check In-Reply-To and References headers if available
    // For now, return 0 as we don't have these headers in our EmailContent interface
    return 0;
  }

  /**
   * Create new thread for email
   */
  private createNewThread(email: EmailContent): EmailThread {
    const threadId = this.generateThreadId(email);
    
    const thread: EmailThread = {
      id: threadId,
      subject: this.normalizeSubject(email.subject),
      participants: this.extractParticipants(email),
      messages: [email],
      lastActivity: email.timestamp,
      status: 'active',
      priority: 0,
      accounts: [this.extractAccountId(email.id)]
    };

    this.threads.set(threadId, thread);
    this.messageToThread.set(email.id, threadId);
    
    return thread;
  }

  /**
   * Add email to existing thread
   */
  private addEmailToThread(thread: EmailThread, email: EmailContent): void {
    thread.messages.push(email);
    this.updateThreadWithEmail(thread, email);
    this.messageToThread.set(email.id, thread.id);
  }

  /**
   * Update thread properties with new email
   */
  private updateThreadWithEmail(thread: EmailThread, email: EmailContent): void {
    // Update last activity
    if (email.timestamp > thread.lastActivity) {
      thread.lastActivity = email.timestamp;
    }

    // Update participants
    const emailParticipants = this.extractParticipants(email);
    thread.participants = [...new Set([...thread.participants, ...emailParticipants])];

    // Update accounts
    const accountId = this.extractAccountId(email.id);
    if (!thread.accounts.includes(accountId)) {
      thread.accounts.push(accountId);
    }

    // Sort messages by timestamp
    thread.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Optimize threads by merging similar ones
   */
  private async optimizeThreads(_options: ThreadDetectionOptions): Promise<void> {
    const threadsArray = Array.from(this.threads.values());
    const mergedThreadIds: Set<string> = new Set();

    for (let i = 0; i < threadsArray.length; i++) {
      if (mergedThreadIds.has(threadsArray[i].id)) continue;

      for (let j = i + 1; j < threadsArray.length; j++) {
        if (mergedThreadIds.has(threadsArray[j].id)) continue;

        const similarity = this.calculateThreadSimilarity(threadsArray[i], threadsArray[j]);
        
        if (similarity > 0.85) { // High similarity threshold for merging
          await this.mergeThreads(threadsArray[i], threadsArray[j]);
          mergedThreadIds.add(threadsArray[j].id);
        }
      }
    }
  }

  /**
   * Calculate similarity between two threads
   */
  private calculateThreadSimilarity(thread1: EmailThread, thread2: EmailThread): number {
    const subjectSimilarity = this.calculateSubjectSimilarity(thread1.subject, thread2.subject);
    const participantOverlap = this.calculateParticipantOverlap(thread1.participants, thread2.participants);
    
    return (subjectSimilarity * 0.6) + (participantOverlap * 0.4);
  }

  /**
   * Merge two threads
   */
  private async mergeThreads(targetThread: EmailThread, sourceThread: EmailThread): Promise<void> {
    console.log(`🔗 Merging thread ${sourceThread.id} into ${targetThread.id}`);

    // Merge messages
    targetThread.messages.push(...sourceThread.messages);
    targetThread.messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Update thread properties
    targetThread.participants = [...new Set([...targetThread.participants, ...sourceThread.participants])];
    targetThread.accounts = [...new Set([...targetThread.accounts, ...sourceThread.accounts])];
    targetThread.lastActivity = new Date(Math.max(
      targetThread.lastActivity.getTime(),
      sourceThread.lastActivity.getTime()
    ));

    // Update message mappings
    for (const message of sourceThread.messages) {
      this.messageToThread.set(message.id, targetThread.id);
    }

    // Remove source thread
    this.threads.delete(sourceThread.id);
  }

  /**
   * Create cross-platform thread linking
   */
  async linkCrossPlatformThreads(): Promise<CrossPlatformThread[]> {
    const crossPlatformThreads: CrossPlatformThread[] = [];
    const processedThreads = new Set<string>();

    for (const thread of this.threads.values()) {
      if (processedThreads.has(thread.id)) continue;

      const linkedThreads = this.findLinkedThreads(thread);
      
      if (linkedThreads.length > 1) {
        const crossPlatformThread = this.createCrossPlatformThread(linkedThreads);
        crossPlatformThreads.push(crossPlatformThread);
        this.crossPlatformThreads.set(crossPlatformThread.id, crossPlatformThread);

        linkedThreads.forEach(t => processedThreads.add(t.id));
      }
    }

    console.log(`🔗 Created ${crossPlatformThreads.length} cross-platform thread links`);
    return crossPlatformThreads;
  }

  /**
   * Find threads that should be linked across platforms
   */
  private findLinkedThreads(thread: EmailThread): EmailThread[] {
    const linkedThreads = [thread];
    
    for (const otherThread of this.threads.values()) {
      if (otherThread.id === thread.id) continue;
      
      // Check if threads share significant participant overlap and similar subjects
      const participantOverlap = this.calculateParticipantOverlap(
        thread.participants,
        otherThread.participants
      );
      const subjectSimilarity = this.calculateSubjectSimilarity(
        thread.subject,
        otherThread.subject
      );
      
      if (participantOverlap > 0.8 && subjectSimilarity > 0.9) {
        linkedThreads.push(otherThread);
      }
    }
    
    return linkedThreads;
  }

  /**
   * Create cross-platform thread from linked threads
   */
  private createCrossPlatformThread(threads: EmailThread[]): CrossPlatformThread {
    const allMessages = threads.flatMap(t => t.messages);
    allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const allParticipants = [...new Set(threads.flatMap(t => t.participants))];
    const platforms = [...new Set(threads.flatMap(t => t.accounts.map(acc => 
      acc.includes('gmail') ? 'gmail' as const : 'outlook-local' as const
    )))];

    const analytics = this.calculateThreadAnalytics(allMessages, allParticipants);

    return {
      id: `cross_platform_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platforms,
      unifiedSubject: threads[0].subject,
      participants: allParticipants,
      messages: allMessages,
      analytics,
      conflictResolution: []
    };
  }

  /**
   * Calculate thread analytics
   */
  private calculateThreadAnalytics(messages: EmailContent[], participants: string[]): ThreadAnalytics {
    if (messages.length === 0) {
      return {
        conversationDepth: 0,
        averageResponseTime: 0,
        participantEngagement: {},
        threadVelocity: 0,
        lastActivity: new Date(),
        threadHealth: 'dead'
      };
    }

    const sortedMessages = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const firstMessage = sortedMessages[0];
    const lastMessage = sortedMessages[sortedMessages.length - 1];

    // Calculate response times
    const responseTimes: number[] = [];
    for (let i = 1; i < sortedMessages.length; i++) {
      const timeDiff = sortedMessages[i].timestamp.getTime() - sortedMessages[i - 1].timestamp.getTime();
      responseTimes.push(timeDiff / (1000 * 60 * 60)); // Convert to hours
    }

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Calculate participant engagement
    const participantEngagement: { [email: string]: number } = {};
    participants.forEach(p => participantEngagement[p] = 0);
    
    messages.forEach(msg => {
      participantEngagement[msg.from.email] = (participantEngagement[msg.from.email] || 0) + 1;
    });

    // Calculate thread velocity (messages per day)
    const timeSpanDays = (lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const threadVelocity = timeSpanDays > 0 ? messages.length / timeSpanDays : 0;

    // Determine thread health
    const daysSinceLastActivity = (Date.now() - lastMessage.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    let threadHealth: 'active' | 'stale' | 'dead';
    
    if (daysSinceLastActivity < 7) {
      threadHealth = 'active';
    } else if (daysSinceLastActivity < 30) {
      threadHealth = 'stale';
    } else {
      threadHealth = 'dead';
    }

    return {
      conversationDepth: messages.length,
      averageResponseTime,
      participantEngagement,
      threadVelocity,
      lastActivity: lastMessage.timestamp,
      threadHealth
    };
  }

  /**
   * Get thread by ID
   */
  getThread(threadId: string): EmailThread | undefined {
    return this.threads.get(threadId);
  }

  /**
   * Get all threads
   */
  getAllThreads(): EmailThread[] {
    return Array.from(this.threads.values());
  }

  /**
   * Get cross-platform thread
   */
  getCrossPlatformThread(threadId: string): CrossPlatformThread | undefined {
    return this.crossPlatformThreads.get(threadId);
  }

  /**
   * Get all cross-platform threads
   */
  getAllCrossPlatformThreads(): CrossPlatformThread[] {
    return Array.from(this.crossPlatformThreads.values());
  }

  // Helper methods

  private generateThreadId(email: EmailContent): string {
    const normalizedSubject = this.normalizeSubject(email.subject);
    const participants = this.extractParticipants(email).sort().join(',');
    const hash = Buffer.from(normalizedSubject + participants).toString('base64');
    return `thread_${hash}`;
  }

  private normalizeSubject(subject: string): string {
    return subject
      .replace(/^(re:|fwd?:|fw:)\\s*/i, '')
      .replace(/\\s+/g, ' ')
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

  private extractAccountId(emailId: string): string {
    const parts = emailId.split('_');
    return `${parts[0]}_${parts[1]}`;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}