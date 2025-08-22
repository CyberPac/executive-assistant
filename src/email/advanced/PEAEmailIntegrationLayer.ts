/**
 * PEA Email Integration Layer - WBS 1.4.2
 * Integration bridge between email system and PEA agents
 */

import { EmailContent } from '../intelligence/EmailIntelligenceEngine';
import { UnifiedInboxManager, EmailThread } from './UnifiedInboxManager';
import { EmailThreadingEngine } from './EmailThreadingEngine';
import { PEAAgentType } from '../../types/pea-agent-types';
import { SecurityLevel } from '../../types/enums';

export interface PEAEmailContext {
  threadId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  stakeholders: string[];
  culturalContext?: string;
  actionItems: ActionItem[];
  deadlines: Deadline[];
  suggestedAgents: PEAAgentType[];
}

export interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  estimatedDuration?: number; // minutes
}

export interface Deadline {
  id: string;
  description: string;
  date: Date;
  type: 'meeting' | 'deliverable' | 'decision' | 'travel' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  stakeholders: string[];
}

export interface PEAAgentAssignment {
  agentType: PEAAgentType;
  taskDescription: string;
  priority: number;
  estimatedCompletionTime: number; // minutes
  dependencies: string[];
  context: any;
}

export interface EmailIntelligenceAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  complexity: 'simple' | 'moderate' | 'complex';
  timeframe: 'immediate' | 'today' | 'this_week' | 'flexible';
  stakeholderRoles: string[];
  businessImpact: 'low' | 'medium' | 'high' | 'critical';
  confidentialityLevel: SecurityLevel;
  suggestedResponse?: string;
}

/**
 * PEA Email Integration Layer
 * Bridges email processing with PEA agent coordination
 */
export class PEAEmailIntegrationLayer {
  private inboxManager: UnifiedInboxManager;
  private threadingEngine: EmailThreadingEngine;
  private agentAssignments: Map<string, PEAAgentAssignment[]> = new Map();
  private contextCache: Map<string, PEAEmailContext> = new Map();

  constructor(inboxManager: UnifiedInboxManager, threadingEngine: EmailThreadingEngine) {
    this.inboxManager = inboxManager;
    this.threadingEngine = threadingEngine;
  }

  /**
   * Process email thread and generate PEA context
   */
  async processEmailThread(threadId: string): Promise<PEAEmailContext> {
    const thread = this.threadingEngine.getThread(threadId);
    if (!thread) {
      throw new Error(`Thread not found: ${threadId}`);
    }

    console.log(`🤖 Processing email thread for PEA integration: ${threadId}`);
    
    const context = await this.analyzePEAContext(thread);
    this.contextCache.set(threadId, context);
    
    return context;
  }

  /**
   * Analyze email thread for PEA agent coordination
   */
  private async analyzePEAContext(thread: EmailThread): Promise<PEAEmailContext> {
    const latestMessage = thread.messages[thread.messages.length - 1];
    
    // Analyze email content for context extraction
    const intelligence = await this.analyzeEmailIntelligence(latestMessage);
    const actionItems = await this.extractActionItems(thread);
    const deadlines = await this.extractDeadlines(thread);
    const suggestedAgents = this.suggestPEAAgents(intelligence, actionItems, deadlines);

    return {
      threadId: thread.id,
      priority: this.determinePriority(intelligence, deadlines),
      stakeholders: thread.participants,
      culturalContext: await this.determineCulturalContext(thread.participants),
      actionItems,
      deadlines,
      suggestedAgents
    };
  }

  /**
   * Perform advanced email intelligence analysis
   */
  private async analyzeEmailIntelligence(email: EmailContent): Promise<EmailIntelligenceAnalysis> {
    const body = email.body.toLowerCase();
    const subject = email.subject.toLowerCase();
    const combinedText = `${subject} ${body}`;

    // Sentiment analysis
    const sentiment = this.analyzeSentiment(combinedText);
    
    // Complexity analysis
    const complexity = this.analyzeComplexity(combinedText, email);
    
    // Timeframe analysis
    const timeframe = this.analyzeTimeframe(combinedText);
    
    // Stakeholder role analysis
    const stakeholderRoles = this.analyzeStakeholderRoles(email);
    
    // Business impact assessment
    const businessImpact = this.assessBusinessImpact(combinedText, stakeholderRoles);
    
    // Confidentiality level
    const confidentialityLevel = this.assessConfidentiality(combinedText, email);

    return {
      sentiment,
      complexity,
      timeframe,
      stakeholderRoles,
      businessImpact,
      confidentialityLevel
    };
  }

  /**
   * Extract actionable items from email thread
   */
  private async extractActionItems(thread: EmailThread): Promise<ActionItem[]> {
    const actionItems: ActionItem[] = [];
    
    for (const message of thread.messages) {
      const items = this.extractActionItemsFromText(message.body);
      actionItems.push(...items);
    }

    return this.deduplicateActionItems(actionItems);
  }

  /**
   * Extract action items from email text using pattern matching
   */
  private extractActionItemsFromText(text: string): ActionItem[] {
    const actionItems: ActionItem[] = [];
    const _lowerText = text.toLowerCase();

    // Action patterns
    const actionPatterns = [
      /(?:please|can you|could you|need to|should|must|have to)\s+([^.!?]+)/gi,
      /(?:action item|todo|task|assignment):\s*([^.!?\n]+)/gi,
      /(?:follow up|follow-up)\s+(?:on|with|by)\s+([^.!?\n]+)/gi,
      /(?:schedule|arrange|set up|organize)\s+([^.!?\n]+)/gi,
      /(?:prepare|draft|create|develop|review)\s+([^.!?\n]+)/gi
    ];

    actionPatterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const description = match[1].trim();
        if (description.length > 10 && description.length < 200) {
          actionItems.push({
            id: `action_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            description,
            priority: this.determinePriorityFromText(description),
            status: 'pending',
            estimatedDuration: this.estimateTaskDuration(description)
          });
        }
      }
    });

    return actionItems;
  }

  /**
   * Extract deadlines from email thread
   */
  private async extractDeadlines(thread: EmailThread): Promise<Deadline[]> {
    const deadlines: Deadline[] = [];
    
    for (const message of thread.messages) {
      const extracted = this.extractDeadlinesFromText(message.body);
      deadlines.push(...extracted);
    }

    return this.sortDeadlinesByUrgency(deadlines);
  }

  /**
   * Extract deadlines from email text using date pattern matching
   */
  private extractDeadlinesFromText(text: string): Deadline[] {
    const deadlines: Deadline[] = [];
    
    // Date patterns
    const datePatterns = [
      /(?:by|before|due|deadline|until)\s+([^.!?\n,]{5,30})/gi,
      /(?:meeting|call|appointment)\s+(?:on|at)?\s*([^.!?\n,]{5,30})/gi,
      /(?:deliver|submit|complete|finish)\s+by\s+([^.!?\n,]{5,30})/gi
    ];

    datePatterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const dateText = match[1].trim();
        const parsedDate = this.parseDate(dateText);
        
        if (parsedDate) {
          deadlines.push({
            id: `deadline_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            description: `${match[0]}`,
            date: parsedDate,
            type: this.categorizeDeadline(match[0]),
            urgency: this.calculateUrgency(parsedDate),
            stakeholders: []
          });
        }
      }
    });

    return deadlines;
  }

  /**
   * Suggest appropriate PEA agents based on email context
   */
  private suggestPEAAgents(
    intelligence: EmailIntelligenceAnalysis,
    actionItems: ActionItem[],
    deadlines: Deadline[]
  ): PEAAgentType[] {
    const suggestedAgents: Set<PEAAgentType> = new Set();

    // Travel-related suggestions
    if (this.containsTravelKeywords(intelligence)) {
      suggestedAgents.add(PEAAgentType.TRAVEL_LOGISTICS);
    }

    // Financial-related suggestions
    if (this.containsFinancialKeywords(intelligence)) {
      suggestedAgents.add(PEAAgentType.FINANCIAL_MANAGEMENT);
    }

    // Calendar/scheduling suggestions
    if (deadlines.some(d => d.type === 'meeting') || this.containsSchedulingKeywords(intelligence)) {
      suggestedAgents.add(PEAAgentType.CALENDAR_INTELLIGENCE);
    }

    // Document-related suggestions
    if (this.containsDocumentKeywords(intelligence)) {
      suggestedAgents.add(PEAAgentType.DOCUMENT_INTELLIGENCE);
    }

    // Crisis management suggestions
    if (intelligence.businessImpact === 'critical' || intelligence.sentiment === 'urgent') {
      suggestedAgents.add(PEAAgentType.CRISIS_MANAGEMENT);
    }

    // Executive orchestrator for complex coordination
    if (actionItems.length > 3 || suggestedAgents.size > 2) {
      suggestedAgents.add(PEAAgentType.EXECUTIVE_ORCHESTRATOR);
    }

    return Array.from(suggestedAgents);
  }

  /**
   * Create agent assignments based on PEA context
   */
  async createAgentAssignments(context: PEAEmailContext): Promise<PEAAgentAssignment[]> {
    const assignments: PEAAgentAssignment[] = [];

    for (const agentType of context.suggestedAgents) {
      const assignment = await this.createSpecificAgentAssignment(agentType, context);
      assignments.push(assignment);
    }

    this.agentAssignments.set(context.threadId, assignments);
    console.log(`🎯 Created ${assignments.length} PEA agent assignments for thread ${context.threadId}`);

    return assignments;
  }

  /**
   * Create specific agent assignment
   */
  private async createSpecificAgentAssignment(
    agentType: PEAAgentType,
    context: PEAEmailContext
  ): Promise<PEAAgentAssignment> {
    const baseAssignment = {
      agentType,
      priority: this.convertPriorityToNumber(context.priority),
      dependencies: [],
      context: {
        threadId: context.threadId,
        stakeholders: context.stakeholders,
        culturalContext: context.culturalContext
      }
    };

    switch (agentType) {
      case PEAAgentType.TRAVEL_LOGISTICS:
        return {
          ...baseAssignment,
          taskDescription: 'Coordinate travel arrangements and logistics',
          estimatedCompletionTime: 45,
          context: {
            ...baseAssignment.context,
            actionItems: context.actionItems.filter(item => 
              item.description.toLowerCase().includes('travel') ||
              item.description.toLowerCase().includes('flight') ||
              item.description.toLowerCase().includes('hotel')
            )
          }
        };

      case PEAAgentType.CALENDAR_INTELLIGENCE:
        return {
          ...baseAssignment,
          taskDescription: 'Schedule meetings and manage calendar coordination',
          estimatedCompletionTime: 20,
          context: {
            ...baseAssignment.context,
            deadlines: context.deadlines.filter(d => d.type === 'meeting'),
            actionItems: context.actionItems.filter(item =>
              item.description.toLowerCase().includes('schedule') ||
              item.description.toLowerCase().includes('meeting')
            )
          }
        };

      case PEAAgentType.FINANCIAL_MANAGEMENT:
        return {
          ...baseAssignment,
          taskDescription: 'Handle financial analysis and budget coordination',
          estimatedCompletionTime: 60,
          context: {
            ...baseAssignment.context,
            actionItems: context.actionItems.filter(item =>
              item.description.toLowerCase().includes('budget') ||
              item.description.toLowerCase().includes('cost') ||
              item.description.toLowerCase().includes('financial')
            )
          }
        };

      case PEAAgentType.DOCUMENT_INTELLIGENCE:
        return {
          ...baseAssignment,
          taskDescription: 'Process and analyze document requirements',
          estimatedCompletionTime: 30,
          context: {
            ...baseAssignment.context,
            actionItems: context.actionItems.filter(item =>
              item.description.toLowerCase().includes('document') ||
              item.description.toLowerCase().includes('report') ||
              item.description.toLowerCase().includes('draft')
            )
          }
        };

      case PEAAgentType.CRISIS_MANAGEMENT:
        return {
          ...baseAssignment,
          taskDescription: 'Coordinate crisis response and stakeholder communication',
          estimatedCompletionTime: 15,
          priority: 5, // Highest priority
          context: {
            ...baseAssignment.context,
            urgentDeadlines: context.deadlines.filter(d => d.urgency === 'critical'),
            allActionItems: context.actionItems
          }
        };

      case PEAAgentType.EXECUTIVE_ORCHESTRATOR:
        return {
          ...baseAssignment,
          taskDescription: 'Orchestrate multi-agent coordination and oversight',
          estimatedCompletionTime: 25,
          dependencies: context.suggestedAgents.filter(agent => agent !== PEAAgentType.EXECUTIVE_ORCHESTRATOR),
          context: {
            ...baseAssignment.context,
            allActionItems: context.actionItems,
            allDeadlines: context.deadlines,
            coordinationNeeded: true
          }
        };

      default:
        return {
          ...baseAssignment,
          taskDescription: 'General task coordination',
          estimatedCompletionTime: 30
        };
    }
  }

  /**
   * Get PEA context for a thread
   */
  getPEAContext(threadId: string): PEAEmailContext | undefined {
    return this.contextCache.get(threadId);
  }

  /**
   * Get agent assignments for a thread
   */
  getAgentAssignments(threadId: string): PEAAgentAssignment[] {
    return this.agentAssignments.get(threadId) || [];
  }

  // Helper methods

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' | 'urgent' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'deadline'];
    const negativeKeywords = ['problem', 'issue', 'concern', 'delay', 'failed', 'error'];
    const positiveKeywords = ['thank', 'great', 'excellent', 'successful', 'completed'];

    if (urgentKeywords.some(keyword => text.includes(keyword))) return 'urgent';
    if (negativeKeywords.some(keyword => text.includes(keyword))) return 'negative';
    if (positiveKeywords.some(keyword => text.includes(keyword))) return 'positive';
    return 'neutral';
  }

  private analyzeComplexity(text: string, email: EmailContent): 'simple' | 'moderate' | 'complex' {
    const factors = [
      text.length > 500,
      email.to.length > 3,
      (email.cc?.length || 0) > 2,
      text.split('.').length > 10,
      /\b(?:coordinate|collaborate|multiple|various|several)\b/i.test(text)
    ];

    const complexityScore = factors.filter(Boolean).length;
    if (complexityScore >= 3) return 'complex';
    if (complexityScore >= 1) return 'moderate';
    return 'simple';
  }

  private analyzeTimeframe(text: string): 'immediate' | 'today' | 'this_week' | 'flexible' {
    if (/\b(?:now|asap|immediately|urgent|emergency)\b/i.test(text)) return 'immediate';
    if (/\b(?:today|end of day|eod)\b/i.test(text)) return 'today';
    if (/\b(?:this week|by friday|end of week)\b/i.test(text)) return 'this_week';
    return 'flexible';
  }

  private analyzeStakeholderRoles(email: EmailContent): string[] {
    const roles: string[] = [];
    const combinedText = `${email.subject} ${email.body}`.toLowerCase();

    const roleKeywords = {
      'executive': ['ceo', 'president', 'executive', 'director', 'vp', 'vice president'],
      'manager': ['manager', 'supervisor', 'lead', 'head of'],
      'finance': ['finance', 'accounting', 'budget', 'cost', 'financial'],
      'hr': ['hr', 'human resources', 'personnel', 'hiring'],
      'legal': ['legal', 'lawyer', 'attorney', 'counsel', 'compliance'],
      'technical': ['engineer', 'developer', 'technical', 'IT', 'system']
    };

    Object.entries(roleKeywords).forEach(([role, keywords]) => {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        roles.push(role);
      }
    });

    return roles;
  }

  private assessBusinessImpact(text: string, stakeholderRoles: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const highImpactKeywords = ['revenue', 'client', 'customer', 'contract', 'legal', 'compliance'];
    const criticalKeywords = ['crisis', 'emergency', 'critical', 'urgent', 'escalation'];

    if (criticalKeywords.some(keyword => text.includes(keyword))) return 'critical';
    if (stakeholderRoles.includes('executive') || 
        highImpactKeywords.some(keyword => text.includes(keyword))) return 'high';
    if (stakeholderRoles.length > 1) return 'medium';
    return 'low';
  }

  private assessConfidentiality(text: string, _email: EmailContent): SecurityLevel {
    const confidentialKeywords = ['confidential', 'private', 'internal', 'restricted'];
    const publicKeywords = ['public', 'announce', 'press', 'marketing'];

    if (confidentialKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return SecurityLevel.STRATEGIC_CONFIDENTIAL;
    }
    if (publicKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      return SecurityLevel.ADMINISTRATIVE;
    }
    return SecurityLevel.OPERATIONAL;
  }

  private determinePriority(intelligence: EmailIntelligenceAnalysis, deadlines: Deadline[]): 'low' | 'medium' | 'high' | 'urgent' {
    if (intelligence.sentiment === 'urgent' || intelligence.businessImpact === 'critical') return 'urgent';
    if (deadlines.some(d => d.urgency === 'critical')) return 'urgent';
    if (intelligence.businessImpact === 'high' || intelligence.timeframe === 'immediate') return 'high';
    if (intelligence.timeframe === 'today' || deadlines.some(d => d.urgency === 'high')) return 'medium';
    return 'low';
  }

  private async determineCulturalContext(participants: string[]): Promise<string | undefined> {
    // Simple cultural context detection based on email domains
    const domains = participants.map(email => email.split('@')[1]).filter(Boolean);
    const culturalHints = domains.map(domain => this.getCulturalHintFromDomain(domain)).filter(Boolean);
    
    return culturalHints.length > 0 ? culturalHints.join(', ') : undefined;
  }

  private getCulturalHintFromDomain(domain: string): string | undefined {
    const culturalMap: { [key: string]: string } = {
      '.jp': 'Japanese business culture',
      '.de': 'German business culture',
      '.fr': 'French business culture',
      '.uk': 'British business culture',
      '.cn': 'Chinese business culture',
      '.in': 'Indian business culture'
    };

    const hint = Object.entries(culturalMap).find(([suffix]) => domain.endsWith(suffix));
    return hint?.[1];
  }

  private determinePriorityFromText(text: string): 'low' | 'medium' | 'high' {
    const urgentKeywords = ['urgent', 'asap', 'critical', 'important'];
    if (urgentKeywords.some(keyword => text.toLowerCase().includes(keyword))) return 'high';
    
    const mediumKeywords = ['soon', 'priority', 'needed', 'required'];
    if (mediumKeywords.some(keyword => text.toLowerCase().includes(keyword))) return 'medium';
    
    return 'low';
  }

  private estimateTaskDuration(description: string): number {
    const complexity = description.length;
    if (complexity > 100) return 60; // 1 hour for complex tasks
    if (complexity > 50) return 30;  // 30 minutes for medium tasks
    return 15; // 15 minutes for simple tasks
  }

  private parseDate(dateText: string): Date | null {
    // Simple date parsing - in production, use a proper date parsing library
    const now = new Date();
    const lowerText = dateText.toLowerCase();

    if (lowerText.includes('today')) {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0); // 5 PM today
    }
    if (lowerText.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 17, 0);
    }
    if (lowerText.includes('next week')) {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }

    // Try to parse standard date formats
    const parsed = new Date(dateText);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private categorizeDeadline(text: string): 'meeting' | 'deliverable' | 'decision' | 'travel' | 'other' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('meeting') || lowerText.includes('call')) return 'meeting';
    if (lowerText.includes('deliver') || lowerText.includes('submit')) return 'deliverable';
    if (lowerText.includes('decide') || lowerText.includes('decision')) return 'decision';
    if (lowerText.includes('travel') || lowerText.includes('flight')) return 'travel';
    return 'other';
  }

  private calculateUrgency(date: Date): 'low' | 'medium' | 'high' | 'critical' {
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 4) return 'critical';
    if (hoursDiff < 24) return 'high';
    if (hoursDiff < 72) return 'medium';
    return 'low';
  }

  private deduplicateActionItems(items: ActionItem[]): ActionItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = item.description.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortDeadlinesByUrgency(deadlines: Deadline[]): Deadline[] {
    const urgencyOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return deadlines.sort((a, b) => {
      const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;
      return a.date.getTime() - b.date.getTime();
    });
  }

  private containsTravelKeywords(intelligence: EmailIntelligenceAnalysis): boolean {
    return intelligence.stakeholderRoles.some(role => 
      ['travel', 'logistics', 'transportation'].includes(role)
    );
  }

  private containsFinancialKeywords(intelligence: EmailIntelligenceAnalysis): boolean {
    return intelligence.stakeholderRoles.includes('finance');
  }

  private containsSchedulingKeywords(intelligence: EmailIntelligenceAnalysis): boolean {
    return intelligence.timeframe !== 'flexible';
  }

  private containsDocumentKeywords(intelligence: EmailIntelligenceAnalysis): boolean {
    return intelligence.stakeholderRoles.some(role => 
      ['legal', 'technical'].includes(role)
    );
  }

  private convertPriorityToNumber(priority: string): number {
    const priorityMap = { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 };
    return priorityMap[priority as keyof typeof priorityMap] || 2;
  }
}