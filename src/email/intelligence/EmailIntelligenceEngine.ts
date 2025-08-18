/**
 * Email Intelligence Engine - WBS 1.2.4
 * Advanced email content analysis and priority scoring
 */

import { SecurityLevel } from '../../types/enums';
import { ExecutiveContext, StakeholderContext } from '../../types/pea-agent-types';

export interface EmailContent {
  id: string;
  subject: string;
  body: string;
  from: { name?: string; email: string };
  to: { name?: string; email: string }[];
  cc?: { name?: string; email: string }[];
  timestamp: Date;
  attachments: { filename: string; size: number; mimeType: string }[];
}

export interface IntelligenceAnalysis {
  contentAnalysis: {
    sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
    topics: string[];
    keywords: string[];
    intent: string;
    language: string;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  priorityScore: {
    overall: number; // 0-100
    urgency: number;
    importance: number;
    executiveRelevance: number;
    businessImpact: number;
  };
  categorization: {
    primary: string;
    secondary: string[];
    businessType: 'internal' | 'external' | 'personal' | 'mixed';
    confidentiality: SecurityLevel;
  };
  stakeholderAnalysis: {
    knownStakeholders: StakeholderContext[];
    newContacts: { name?: string; email: string; estimatedRole?: string }[];
    relationshipStrength: number; // 0-1
  };
  actionItems: {
    suggestedResponses: string[];
    requiredActions: string[];
    deadline?: Date;
    escalationRecommended: boolean;
  };
  culturalIntelligence?: {
    senderCulture?: string;
    communicationStyle: 'formal' | 'informal' | 'diplomatic' | 'direct';
    culturalSensitivity: number; // 0-1
    appropriateResponse: string[];
  };
}

/**
 * Email Intelligence Engine
 * Provides advanced email analysis for executive decision support
 */
export class EmailIntelligenceEngine {
  private executiveContext: ExecutiveContext;
  private knowledgeBase: Map<string, any> = new Map();
  private learningData: Map<string, any> = new Map();

  constructor(executiveContext: ExecutiveContext) {
    this.executiveContext = executiveContext;
    this.initializeIntelligenceModels();
  }

  /**
   * Analyze email content comprehensively
   */
  async analyzeEmail(email: EmailContent): Promise<IntelligenceAnalysis> {
    const startTime = Date.now();

    // Parallel analysis for performance
    const [
      contentAnalysis,
      priorityScore,
      categorization,
      stakeholderAnalysis,
      actionItems,
      culturalIntelligence
    ] = await Promise.all([
      this.analyzeContent(email),
      this.calculatePriorityScore(email),
      this.categorizeEmail(email),
      this.analyzeStakeholders(email),
      this.generateActionItems(email),
      this.analyzeCulturalContext(email)
    ]);

    const processingTime = Date.now() - startTime;
    console.log(`📊 Email intelligence analysis completed in ${processingTime}ms`);

    return {
      contentAnalysis,
      priorityScore,
      categorization,
      stakeholderAnalysis,
      actionItems,
      culturalIntelligence
    };
  }

  /**
   * Analyze email content for sentiment, topics, and intent
   */
  private async analyzeContent(email: EmailContent): Promise<IntelligenceAnalysis['contentAnalysis']> {
    const combinedText = `${email.subject} ${email.body}`;
    
    // Sentiment analysis
    const sentiment = this.detectSentiment(combinedText);
    
    // Topic extraction
    const topics = this.extractTopics(combinedText);
    
    // Keyword extraction
    const keywords = this.extractKeywords(combinedText);
    
    // Intent detection
    const intent = this.detectIntent(combinedText, email.subject);
    
    // Language detection
    const language = this.detectLanguage(combinedText);
    
    // Complexity assessment
    const complexity = this.assessComplexity(combinedText);

    return {
      sentiment,
      topics,
      keywords,
      intent,
      language,
      complexity
    };
  }

  /**
   * Calculate comprehensive priority score
   */
  private async calculatePriorityScore(email: EmailContent): Promise<IntelligenceAnalysis['priorityScore']> {
    // Urgency indicators
    const urgency = this.calculateUrgencyScore(email);
    
    // Importance based on sender and content
    const importance = this.calculateImportanceScore(email);
    
    // Executive relevance
    const executiveRelevance = this.calculateExecutiveRelevance(email);
    
    // Business impact assessment
    const businessImpact = this.calculateBusinessImpact(email);
    
    // Overall weighted score
    const overall = Math.round(
      urgency * 0.3 +
      importance * 0.25 +
      executiveRelevance * 0.25 +
      businessImpact * 0.2
    );

    return {
      overall,
      urgency,
      importance,
      executiveRelevance,
      businessImpact
    };
  }

  /**
   * Categorize email by type and confidentiality
   */
  private async categorizeEmail(email: EmailContent): Promise<IntelligenceAnalysis['categorization']> {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();
    const combinedText = `${subject} ${body}`;

    // Primary category detection
    let primary = 'general';
    if (this.containsKeywords(combinedText, ['meeting', 'calendar', 'schedule', 'appointment'])) {
      primary = 'meeting';
    } else if (this.containsKeywords(combinedText, ['travel', 'flight', 'hotel', 'itinerary'])) {
      primary = 'travel';
    } else if (this.containsKeywords(combinedText, ['board', 'financial', 'budget', 'revenue'])) {
      primary = 'business-critical';
    } else if (this.containsKeywords(combinedText, ['urgent', 'asap', 'emergency', 'critical'])) {
      primary = 'urgent';
    } else if (this.containsKeywords(combinedText, ['legal', 'contract', 'compliance', 'audit'])) {
      primary = 'legal';
    }

    // Secondary categories
    const secondary: string[] = [];
    if (this.containsKeywords(combinedText, ['document', 'attachment', 'file'])) {
      secondary.push('document-sharing');
    }
    if (this.containsKeywords(combinedText, ['decision', 'approval', 'review'])) {
      secondary.push('decision-required');
    }
    if (this.containsKeywords(combinedText, ['strategic', 'planning', 'vision'])) {
      secondary.push('strategic');
    }

    // Business type
    const businessType = this.determineBusinessType(email);
    
    // Confidentiality level
    const confidentiality = this.assessConfidentiality(email);

    return {
      primary,
      secondary,
      businessType,
      confidentiality
    };
  }

  /**
   * Analyze stakeholders mentioned in email
   */
  private async analyzeStakeholders(email: EmailContent): Promise<IntelligenceAnalysis['stakeholderAnalysis']> {
    // Find known stakeholders
    const knownStakeholders = this.executiveContext.stakeholders.filter(stakeholder => {
      const emailAddresses = [email.from.email, ...email.to.map(addr => addr.email)];
      return emailAddresses.some(addr => 
        addr.toLowerCase().includes(stakeholder.name.toLowerCase()) ||
        email.body.toLowerCase().includes(stakeholder.name.toLowerCase())
      );
    });

    // Identify new contacts
    const newContacts = [email.from, ...email.to]
      .filter(addr => !this.isKnownStakeholder(addr.email))
      .map(addr => ({
        name: addr.name,
        email: addr.email,
        estimatedRole: this.estimateRole(addr.email, email.body)
      }));

    // Calculate relationship strength
    const relationshipStrength = this.calculateRelationshipStrength(email, knownStakeholders);

    return {
      knownStakeholders,
      newContacts,
      relationshipStrength
    };
  }

  /**
   * Generate actionable recommendations
   */
  private async generateActionItems(email: EmailContent): Promise<IntelligenceAnalysis['actionItems']> {
    const suggestedResponses: string[] = [];
    const requiredActions: string[] = [];
    let deadline: Date | undefined;
    let escalationRecommended = false;

    // Response suggestions based on content
    if (this.containsKeywords(email.body, ['meeting', 'schedule'])) {
      suggestedResponses.push('Check calendar availability');
      requiredActions.push('Schedule or confirm meeting');
    }

    if (this.containsKeywords(email.body, ['document', 'review', 'approval'])) {
      suggestedResponses.push('Review attached documents');
      requiredActions.push('Provide feedback or approval');
    }

    if (this.containsKeywords(email.body, ['urgent', 'asap', 'emergency'])) {
      escalationRecommended = true;
      requiredActions.push('Immediate response required');
    }

    // Deadline detection
    deadline = this.extractDeadline(email.body);

    return {
      suggestedResponses,
      requiredActions,
      deadline,
      escalationRecommended
    };
  }

  /**
   * Analyze cultural context for international communications
   */
  private async analyzeCulturalContext(email: EmailContent): Promise<IntelligenceAnalysis['culturalIntelligence']> {
    // Detect sender's cultural background
    const senderCulture = this.detectSenderCulture(email.from.email, email.body);
    
    // Analyze communication style
    const communicationStyle = this.analyzeCommunicationStyle(email.body);
    
    // Assess cultural sensitivity needed
    const culturalSensitivity = this.assessCulturalSensitivity(email.body, senderCulture);
    
    // Generate culturally appropriate response suggestions
    const appropriateResponse = this.generateCulturallyAppropriateResponses(
      senderCulture,
      communicationStyle
    );

    return {
      senderCulture,
      communicationStyle,
      culturalSensitivity,
      appropriateResponse
    };
  }

  // Helper methods for analysis

  private detectSentiment(text: string): 'positive' | 'neutral' | 'negative' | 'urgent' {
    const urgentWords = ['urgent', 'asap', 'emergency', 'critical', 'immediate'];
    const positiveWords = ['thank', 'pleased', 'excellent', 'great', 'appreciate'];
    const negativeWords = ['issue', 'problem', 'concern', 'disappointed', 'error'];

    if (this.containsKeywords(text, urgentWords)) return 'urgent';
    if (this.containsKeywords(text, positiveWords)) return 'positive';
    if (this.containsKeywords(text, negativeWords)) return 'negative';
    return 'neutral';
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const topicKeywords = {
      'meeting': ['meeting', 'conference', 'call', 'discussion'],
      'travel': ['travel', 'flight', 'hotel', 'trip'],
      'finance': ['budget', 'financial', 'revenue', 'cost'],
      'strategy': ['strategic', 'planning', 'vision', 'roadmap'],
      'legal': ['contract', 'legal', 'compliance', 'regulation']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (this.containsKeywords(text, keywords)) {
        topics.push(topic);
      }
    });

    return topics;
  }

  private extractKeywords(text: string): string[] {
    // Extract important words (simplified implementation)
    const words = text.toLowerCase().split(/\\W+/);
    const importantWords = words.filter(word => 
      word.length > 4 && 
      !this.isStopWord(word)
    );
    
    return [...new Set(importantWords)].slice(0, 10);
  }

  private detectIntent(body: string, subject: string): string {
    const combined = `${subject} ${body}`.toLowerCase();
    
    if (this.containsKeywords(combined, ['please', 'request', 'could you'])) {
      return 'request';
    } else if (this.containsKeywords(combined, ['inform', 'update', 'fyi'])) {
      return 'information';
    } else if (this.containsKeywords(combined, ['urgent', 'immediate', 'asap'])) {
      return 'urgent_action';
    } else if (this.containsKeywords(combined, ['meeting', 'schedule', 'calendar'])) {
      return 'scheduling';
    }
    
    return 'general';
  }

  private detectLanguage(text: string): string {
    // Simplified language detection
    return 'en'; // Default to English
  }

  private assessComplexity(text: string): 'simple' | 'moderate' | 'complex' {
    const sentenceCount = text.split(/[.!?]+/).length;
    const wordCount = text.split(/\\s+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;

    if (avgWordsPerSentence < 10) return 'simple';
    if (avgWordsPerSentence < 20) return 'moderate';
    return 'complex';
  }

  private calculateUrgencyScore(email: EmailContent): number {
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'immediate', 'deadline'];
    const text = `${email.subject} ${email.body}`.toLowerCase();
    
    let score = 0;
    urgentKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 20;
    });

    // Time-based urgency
    const age = Date.now() - email.timestamp.getTime();
    if (age < 3600000) score += 10; // Less than 1 hour old

    return Math.min(score, 100);
  }

  private calculateImportanceScore(email: EmailContent): number {
    let score = 0;
    
    // Known stakeholder importance
    const senderImportance = this.getSenderImportance(email.from.email);
    score += senderImportance * 30;

    // Content importance keywords
    const importantKeywords = ['board', 'strategic', 'financial', 'legal', 'executive'];
    const text = `${email.subject} ${email.body}`.toLowerCase();
    importantKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 15;
    });

    return Math.min(score, 100);
  }

  private calculateExecutiveRelevance(email: EmailContent): number {
    let score = 0;
    
    // Direct mention of executive
    if (email.body.toLowerCase().includes(this.executiveContext.executiveId.toLowerCase())) {
      score += 40;
    }

    // Executive topics
    const execKeywords = ['decision', 'approval', 'strategic', 'board', 'leadership'];
    const text = `${email.subject} ${email.body}`.toLowerCase();
    execKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 12;
    });

    return Math.min(score, 100);
  }

  private calculateBusinessImpact(email: EmailContent): number {
    let score = 0;
    
    const impactKeywords = ['revenue', 'budget', 'client', 'partnership', 'contract'];
    const text = `${email.subject} ${email.body}`.toLowerCase();
    impactKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 15;
    });

    return Math.min(score, 100);
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
  }

  private determineBusinessType(email: EmailContent): 'internal' | 'external' | 'personal' | 'mixed' {
    // Simplified business type detection
    const domain = email.from.email.split('@')[1];
    const recipientDomains = email.to.map(addr => addr.email.split('@')[1]);
    
    // This would be more sophisticated in production
    return 'external';
  }

  private assessConfidentiality(email: EmailContent): SecurityLevel {
    const confidentialKeywords = ['confidential', 'private', 'internal', 'board', 'strategic'];
    const text = `${email.subject} ${email.body}`.toLowerCase();
    
    if (this.containsKeywords(text, ['board', 'executive', 'strategic'])) {
      return SecurityLevel.EXECUTIVE_PERSONAL;
    } else if (this.containsKeywords(text, confidentialKeywords)) {
      return SecurityLevel.STRATEGIC_CONFIDENTIAL;
    }
    
    return SecurityLevel.BUSINESS_SENSITIVE;
  }

  private isKnownStakeholder(email: string): boolean {
    return this.executiveContext.stakeholders.some(s => 
      s.name.toLowerCase().includes(email.toLowerCase()) ||
      email.toLowerCase().includes(s.name.toLowerCase())
    );
  }

  private estimateRole(email: string, body: string): string | undefined {
    const domain = email.split('@')[1];
    if (domain.includes('board') || body.includes('board')) return 'board_member';
    if (email.includes('ceo') || email.includes('president')) return 'executive';
    if (email.includes('admin') || email.includes('assistant')) return 'support';
    return undefined;
  }

  private calculateRelationshipStrength(email: EmailContent, stakeholders: StakeholderContext[]): number {
    if (stakeholders.length === 0) return 0;
    
    // Calculate based on stakeholder priority and communication history
    const avgPriority = stakeholders.reduce((sum, s) => {
      const priority = s.priority === 'critical' ? 1 : s.priority === 'high' ? 0.8 : 0.5;
      return sum + priority;
    }, 0) / stakeholders.length;
    
    return avgPriority;
  }

  private extractDeadline(body: string): Date | undefined {
    // Simplified deadline extraction
    const deadlinePatterns = [
      /by (\w+day)/i,
      /deadline (\w+)/i,
      /due (\w+)/i
    ];
    
    // This would be more sophisticated in production
    return undefined;
  }

  private detectSenderCulture(email: string, body: string): string | undefined {
    // Simplified cultural detection based on domain and language patterns
    const domain = email.split('@')[1];
    if (domain.endsWith('.jp')) return 'japanese';
    if (domain.endsWith('.de')) return 'german';
    if (domain.endsWith('.fr')) return 'french';
    return undefined;
  }

  private analyzeCommunicationStyle(body: string): 'formal' | 'informal' | 'diplomatic' | 'direct' {
    if (body.includes('Dear') || body.includes('Sincerely')) return 'formal';
    if (body.includes('Hey') || body.includes('Thanks!')) return 'informal';
    if (body.includes('would appreciate') || body.includes('kindly')) return 'diplomatic';
    return 'direct';
  }

  private assessCulturalSensitivity(body: string, culture?: string): number {
    // Return higher sensitivity for certain cultures
    if (culture === 'japanese' || culture === 'german') return 0.8;
    return 0.5;
  }

  private generateCulturallyAppropriateResponses(culture?: string, style?: string): string[] {
    const responses = ['Acknowledge receipt promptly'];
    
    if (culture === 'japanese') {
      responses.push('Use formal honorifics');
      responses.push('Express gratitude explicitly');
    }
    
    if (style === 'formal') {
      responses.push('Maintain formal tone');
      responses.push('Use complete sentences');
    }
    
    return responses;
  }

  private getSenderImportance(email: string): number {
    const stakeholder = this.executiveContext.stakeholders.find(s => 
      email.toLowerCase().includes(s.name.toLowerCase())
    );
    
    if (!stakeholder) return 0;
    
    switch (stakeholder.priority) {
      case 'critical': return 1.0;
      case 'high': return 0.8;
      case 'medium': return 0.5;
      default: return 0.2;
    }
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
    return stopWords.includes(word);
  }

  private initializeIntelligenceModels(): void {
    // Initialize ML models and knowledge bases
    console.log('📊 Email Intelligence Engine initialized');
  }
}