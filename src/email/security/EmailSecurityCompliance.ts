/**
 * Email Security & Compliance - WBS 1.5
 * Advanced security measures and compliance monitoring for email systems
 */

import { EmailContent } from '../intelligence/EmailIntelligenceEngine';

export interface SecurityScanResult {
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  detectedThreats: SecurityThreat[];
  complianceScore: number; // 0-100
  recommendations: SecurityRecommendation[];
  scanTimestamp: Date;
  scanDuration: number;
}

export interface SecurityThreat {
  id: string;
  type: 'phishing' | 'malware' | 'spam' | 'data_leak' | 'social_engineering' | 'suspicious_attachment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number; // 0-1
  evidence: string[];
  mitigation: string;
}

export interface SecurityRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action: string;
  reason: string;
  estimatedImplementationTime: number; // minutes
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  regulation: 'GDPR' | 'HIPAA' | 'SOX' | 'PCI-DSS' | 'CCPA' | 'INTERNAL';
  mandatory: boolean;
  validator: (email: EmailContent) => Promise<ComplianceResult>;
}

export interface ComplianceResult {
  compliant: boolean;
  violations: ComplianceViolation[];
  score: number; // 0-100
  requiredActions: string[];
}

export interface ComplianceViolation {
  ruleId: string;
  severity: 'minor' | 'major' | 'critical';
  description: string;
  remediation: string;
}

/**
 * Email Security & Compliance Engine
 * Provides comprehensive security scanning and compliance monitoring
 */
export class EmailSecurityCompliance {
  private securityRules: Map<string, (email: EmailContent) => Promise<SecurityThreat[]>> = new Map();
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private scanHistory: SecurityScanResult[] = [];
  private threatDatabase: Map<string, SecurityThreat> = new Map();

  constructor() {
    this.initializeSecurityRules();
    this.initializeComplianceRules();
    console.log('🔒 Email Security & Compliance Engine initialized');
  }

  /**
   * Perform comprehensive security scan on email
   */
  async performSecurityScan(email: EmailContent): Promise<SecurityScanResult> {
    const startTime = Date.now();
    
    console.log(`🔍 Performing security scan on email: ${email.id}`);
    
    const detectedThreats: SecurityThreat[] = [];
    
    // Run all security rule checks in parallel
    const securityChecks = Array.from(this.securityRules.entries()).map(
      async ([ruleName, ruleFunction]) => {
        try {
          const threats = await ruleFunction(email);
          return threats;
        } catch (error) {
          console.warn(`Security rule ${ruleName} failed:`, error);
          return [];
        }
      }
    );

    const threatResults = await Promise.all(securityChecks);
    threatResults.forEach(threats => detectedThreats.push(...threats));

    // Calculate threat level
    const threatLevel = this.calculateThreatLevel(detectedThreats);
    
    // Run compliance check
    const complianceScore = await this.checkCompliance(email);
    
    // Generate recommendations
    const recommendations = this.generateSecurityRecommendations(detectedThreats, complianceScore);
    
    const scanDuration = Date.now() - startTime;
    
    const result: SecurityScanResult = {
      threatLevel,
      detectedThreats,
      complianceScore,
      recommendations,
      scanTimestamp: new Date(),
      scanDuration
    };

    // Store scan history
    this.scanHistory.push(result);
    this.limitScanHistory();

    console.log(`✅ Security scan completed: ${threatLevel} threat level, ${complianceScore}% compliance, ${scanDuration}ms`);
    
    return result;
  }

  /**
   * Check email compliance against all applicable rules
   */
  async checkCompliance(email: EmailContent): Promise<number> {
    const complianceResults: ComplianceResult[] = [];
    
    const complianceChecks = Array.from(this.complianceRules.values()).map(
      async (rule) => {
        try {
          return await rule.validator(email);
        } catch (error) {
          console.warn(`Compliance rule ${rule.id} failed:`, error);
          return {
            compliant: false,
            violations: [{
              ruleId: rule.id,
              severity: 'major' as const,
              description: `Rule validation failed: ${error}`,
              remediation: 'Review rule implementation'
            }],
            score: 0,
            requiredActions: ['Investigate compliance rule failure']
          };
        }
      }
    );

    const results = await Promise.all(complianceChecks);
    complianceResults.push(...results);

    // Calculate overall compliance score
    const totalScore = complianceResults.reduce((sum, result) => sum + result.score, 0);
    return complianceResults.length > 0 ? totalScore / complianceResults.length : 100;
  }

  /**
   * Initialize security detection rules
   */
  private initializeSecurityRules(): void {
    // Phishing detection
    this.securityRules.set('phishing_detection', async (email: EmailContent) => {
      const threats: SecurityThreat[] = [];
      
      const phishingIndicators = [
        'urgent action required',
        'verify account',
        'suspend account',
        'click here immediately',
        'confirm identity',
        'security alert'
      ];

      const suspiciousPatterns = phishingIndicators.filter(indicator =>
        email.body.toLowerCase().includes(indicator) ||
        email.subject.toLowerCase().includes(indicator)
      );

      if (suspiciousPatterns.length > 0) {
        threats.push({
          id: `phishing_${Date.now()}`,
          type: 'phishing',
          severity: suspiciousPatterns.length > 2 ? 'high' : 'medium',
          description: 'Potential phishing attempt detected',
          confidence: Math.min(suspiciousPatterns.length * 0.3, 0.9),
          evidence: suspiciousPatterns,
          mitigation: 'Quarantine email and notify user'
        });
      }

      return threats;
    });

    // Malware attachment detection
    this.securityRules.set('malware_detection', async (email: EmailContent) => {
      const threats: SecurityThreat[] = [];
      
      if (email.attachments && email.attachments.length > 0) {
        const dangerousExtensions = ['.exe', '.scr', '.vbs', '.js', '.jar', '.bat', '.cmd'];
        
        const suspiciousAttachments = email.attachments.filter(attachment =>
          dangerousExtensions.some(ext => attachment.filename?.toLowerCase().endsWith(ext))
        );

        if (suspiciousAttachments.length > 0) {
          threats.push({
            id: `malware_${Date.now()}`,
            type: 'malware',
            severity: 'high',
            description: 'Potentially dangerous attachment detected',
            confidence: 0.8,
            evidence: suspiciousAttachments.map(a => a.filename || 'unnamed'),
            mitigation: 'Quarantine attachment and scan with antivirus'
          });
        }
      }

      return threats;
    });

    // Data leak detection
    this.securityRules.set('data_leak_detection', async (email: EmailContent) => {
      const threats: SecurityThreat[] = [];
      
      const sensitivePatterns = [
        /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card numbers
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
        /\b[A-Z]{2}\d{2}[A-Z]{2}\d{2}[A-Z0-9]{12}\b/, // IBAN pattern
        /password\s*[:=]\s*\S+/i, // Password disclosure
        /api[_-]?key\s*[:=]\s*\S+/i // API key disclosure
      ];

      const detectedPatterns = sensitivePatterns.filter(pattern =>
        pattern.test(email.body) || pattern.test(email.subject)
      );

      if (detectedPatterns.length > 0) {
        threats.push({
          id: `data_leak_${Date.now()}`,
          type: 'data_leak',
          severity: 'critical',
          description: 'Sensitive data detected in email content',
          confidence: 0.95,
          evidence: [`${detectedPatterns.length} sensitive patterns detected`],
          mitigation: 'Immediately encrypt email and notify data protection officer'
        });
      }

      return threats;
    });

    // Spam detection
    this.securityRules.set('spam_detection', async (email: EmailContent) => {
      const threats: SecurityThreat[] = [];
      
      const spamIndicators = [
        'free money',
        'guaranteed income',
        'no obligation',
        'act now',
        'limited time',
        'congratulations you have won'
      ];

      const spamScore = spamIndicators.filter(indicator =>
        email.body.toLowerCase().includes(indicator)
      ).length;

      if (spamScore > 2) {
        threats.push({
          id: `spam_${Date.now()}`,
          type: 'spam',
          severity: 'low',
          description: 'Email classified as spam',
          confidence: Math.min(spamScore * 0.2, 0.9),
          evidence: [`Spam score: ${spamScore}`],
          mitigation: 'Move to spam folder'
        });
      }

      return threats;
    });

    // Social engineering detection
    this.securityRules.set('social_engineering_detection', async (email: EmailContent) => {
      const threats: SecurityThreat[] = [];
      
      const socialEngineeringTactics = [
        'urgent',
        'confidential',
        'do not share',
        'immediate action',
        'deadline today',
        'ceo request',
        'wire transfer'
      ];

      const tacticCount = socialEngineeringTactics.filter(tactic =>
        email.body.toLowerCase().includes(tactic) ||
        email.subject.toLowerCase().includes(tactic)
      ).length;

      if (tacticCount > 1) {
        threats.push({
          id: `social_eng_${Date.now()}`,
          type: 'social_engineering',
          severity: tacticCount > 3 ? 'high' : 'medium',
          description: 'Potential social engineering attempt',
          confidence: Math.min(tacticCount * 0.25, 0.85),
          evidence: [`${tacticCount} social engineering tactics detected`],
          mitigation: 'Flag for manual review and user education'
        });
      }

      return threats;
    });
  }

  /**
   * Initialize compliance rules
   */
  private initializeComplianceRules(): void {
    // GDPR Compliance
    this.complianceRules.set('gdpr_data_protection', {
      id: 'gdpr_data_protection',
      name: 'GDPR Data Protection',
      description: 'Ensures email handling complies with GDPR requirements',
      regulation: 'GDPR',
      mandatory: true,
      validator: async (email: EmailContent) => {
        const violations: ComplianceViolation[] = [];
        
        // Check for personal data without proper protection
        const personalDataPatterns = [
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
          /\b\d{1,2}\/\d{1,2}\/\d{4}\b/, // Birth dates
          /\b\d{3}-\d{2}-\d{4}\b/ // SSN or similar ID numbers
        ];

        const hasPersonalData = personalDataPatterns.some(pattern =>
          pattern.test(email.body)
        );

        if (hasPersonalData && !email.body.includes('encrypted')) {
          violations.push({
            ruleId: 'gdpr_data_protection',
            severity: 'major',
            description: 'Personal data transmitted without encryption indication',
            remediation: 'Ensure personal data is encrypted in transit and at rest'
          });
        }

        return {
          compliant: violations.length === 0,
          violations,
          score: violations.length === 0 ? 100 : 60,
          requiredActions: violations.map(v => v.remediation)
        };
      }
    });

    // PCI-DSS Compliance
    this.complianceRules.set('pci_dss_compliance', {
      id: 'pci_dss_compliance',
      name: 'PCI-DSS Compliance',
      description: 'Ensures payment card data is properly protected',
      regulation: 'PCI-DSS',
      mandatory: true,
      validator: async (email: EmailContent) => {
        const violations: ComplianceViolation[] = [];
        
        // Check for credit card numbers
        const cardNumberPattern = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/;
        
        if (cardNumberPattern.test(email.body)) {
          violations.push({
            ruleId: 'pci_dss_compliance',
            severity: 'critical',
            description: 'Credit card number detected in email content',
            remediation: 'Remove or encrypt credit card data immediately'
          });
        }

        return {
          compliant: violations.length === 0,
          violations,
          score: violations.length === 0 ? 100 : 0,
          requiredActions: violations.map(v => v.remediation)
        };
      }
    });

    // Internal data classification compliance
    this.complianceRules.set('internal_classification', {
      id: 'internal_classification',
      name: 'Internal Data Classification',
      description: 'Ensures proper data classification and handling',
      regulation: 'INTERNAL',
      mandatory: true,
      validator: async (email: EmailContent) => {
        const violations: ComplianceViolation[] = [];
        
        const classificationKeywords = ['confidential', 'restricted', 'internal', 'public'];
        const hasClassification = classificationKeywords.some(keyword =>
          email.subject.toLowerCase().includes(keyword) ||
          email.body.toLowerCase().includes(keyword)
        );

        // Check for sensitive content without proper classification
        const sensitiveKeywords = ['financial', 'legal', 'strategic', 'merger', 'acquisition'];
        const hasSensitiveContent = sensitiveKeywords.some(keyword =>
          email.body.toLowerCase().includes(keyword)
        );

        if (hasSensitiveContent && !hasClassification) {
          violations.push({
            ruleId: 'internal_classification',
            severity: 'major',
            description: 'Sensitive content without proper classification',
            remediation: 'Add appropriate data classification to email'
          });
        }

        return {
          compliant: violations.length === 0,
          violations,
          score: violations.length === 0 ? 100 : 70,
          requiredActions: violations.map(v => v.remediation)
        };
      }
    });
  }

  /**
   * Calculate overall threat level from detected threats
   */
  private calculateThreatLevel(threats: SecurityThreat[]): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (threats.length === 0) return 'none';
    
    const maxSeverity = Math.max(...threats.map(threat => {
      switch (threat.severity) {
        case 'low': return 1;
        case 'medium': return 2;
        case 'high': return 3;
        case 'critical': return 4;
        default: return 0;
      }
    }));

    switch (maxSeverity) {
      case 4: return 'critical';
      case 3: return 'high';
      case 2: return 'medium';
      case 1: return 'low';
      default: return 'none';
    }
  }

  /**
   * Generate security recommendations based on threats and compliance
   */
  private generateSecurityRecommendations(
    threats: SecurityThreat[],
    complianceScore: number
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // Critical threat recommendations
    const criticalThreats = threats.filter(t => t.severity === 'critical');
    if (criticalThreats.length > 0) {
      recommendations.push({
        id: 'critical_threat_response',
        priority: 'urgent',
        action: 'Immediately quarantine email and notify security team',
        reason: `${criticalThreats.length} critical security threats detected`,
        estimatedImplementationTime: 5
      });
    }

    // Compliance recommendations
    if (complianceScore < 80) {
      recommendations.push({
        id: 'compliance_improvement',
        priority: 'high',
        action: 'Review and improve compliance procedures',
        reason: `Compliance score below threshold: ${complianceScore}%`,
        estimatedImplementationTime: 30
      });
    }

    // General security improvements
    if (threats.length > 2) {
      recommendations.push({
        id: 'security_training',
        priority: 'medium',
        action: 'Conduct additional security awareness training',
        reason: 'Multiple security threats detected indicating possible security gaps',
        estimatedImplementationTime: 60
      });
    }

    return recommendations;
  }

  /**
   * Get security scan history
   */
  getScanHistory(limit: number = 50): SecurityScanResult[] {
    return this.scanHistory.slice(-limit);
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics(): {
    totalScans: number;
    threatsDetected: number;
    averageComplianceScore: number;
    commonThreatTypes: { [type: string]: number };
  } {
    const totalScans = this.scanHistory.length;
    const threatsDetected = this.scanHistory.reduce((sum, scan) => sum + scan.detectedThreats.length, 0);
    const averageComplianceScore = totalScans > 0 
      ? this.scanHistory.reduce((sum, scan) => sum + scan.complianceScore, 0) / totalScans 
      : 100;

    const threatTypeCounts: { [type: string]: number } = {};
    this.scanHistory.forEach(scan => {
      scan.detectedThreats.forEach(threat => {
        threatTypeCounts[threat.type] = (threatTypeCounts[threat.type] || 0) + 1;
      });
    });

    return {
      totalScans,
      threatsDetected,
      averageComplianceScore,
      commonThreatTypes: threatTypeCounts
    };
  }

  /**
   * Add custom security rule
   */
  addCustomSecurityRule(
    name: string, 
    rule: (email: EmailContent) => Promise<SecurityThreat[]>
  ): void {
    this.securityRules.set(name, rule);
    console.log(`🔧 Added custom security rule: ${name}`);
  }

  /**
   * Add custom compliance rule
   */
  addCustomComplianceRule(rule: ComplianceRule): void {
    this.complianceRules.set(rule.id, rule);
    console.log(`📋 Added custom compliance rule: ${rule.name}`);
  }

  /**
   * Limit scan history to prevent memory issues
   */
  private limitScanHistory(): void {
    const maxHistory = 1000;
    if (this.scanHistory.length > maxHistory) {
      this.scanHistory = this.scanHistory.slice(-maxHistory);
    }
  }

  /**
   * Clear all scan history
   */
  clearScanHistory(): void {
    this.scanHistory = [];
    console.log('🗑️ Security scan history cleared');
  }
}