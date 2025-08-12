/**
 * Security Test Results Processor
 * Custom Jest results processor for security testing
 */

const fs = require('fs');
const path = require('path');

/**
 * Process Jest test results and generate security-specific reports
 * @param {Object} results - Jest test results
 * @returns {Object} - Processed results
 */
function processResults(results) {
  const timestamp = new Date().toISOString();
  const reportsDir = path.join(__dirname, '../../../reports/security');
  
  // Ensure reports directory exists
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Extract security-specific metrics
  const securityMetrics = extractSecurityMetrics(results);
  
  // Generate security summary report
  const summaryReport = generateSecuritySummary(securityMetrics, timestamp);
  
  // Generate compliance report
  const complianceReport = generateComplianceReport(securityMetrics, timestamp);
  
  // Generate vulnerability report
  const vulnerabilityReport = generateVulnerabilityReport(securityMetrics, timestamp);
  
  // Write reports to files
  writeReport(path.join(reportsDir, 'security-summary.json'), summaryReport);
  writeReport(path.join(reportsDir, 'compliance-report.json'), complianceReport);
  writeReport(path.join(reportsDir, 'vulnerability-report.json'), vulnerabilityReport);
  
  // Generate markdown summary
  const markdownSummary = generateMarkdownSummary(securityMetrics, timestamp);
  writeReport(path.join(reportsDir, 'security-test-summary.md'), markdownSummary);
  
  // Console output
  console.log('\n🔒 Security Test Results Summary:');
  console.log(`📊 Total Tests: ${securityMetrics.totalTests}`);
  console.log(`✅ Passed: ${securityMetrics.passedTests}`);
  console.log(`❌ Failed: ${securityMetrics.failedTests}`);
  console.log(`🚨 Critical Issues: ${securityMetrics.criticalIssues}`);
  console.log(`📈 Security Score: ${securityMetrics.securityScore.toFixed(1)}%`);
  console.log(`✔️ Compliance Score: ${securityMetrics.complianceScore.toFixed(1)}%`);
  
  if (securityMetrics.criticalIssues > 0) {
    console.log('\n🚨 CRITICAL SECURITY ISSUES DETECTED!');
    console.log('Please review the security reports and address critical vulnerabilities immediately.');
  }
  
  return results;
}

/**
 * Extract security-specific metrics from Jest results
 */
function extractSecurityMetrics(results) {
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let criticalIssues = 0;
  let vulnerabilities = [];
  let complianceTests = [];
  let testCategories = {};

  results.testResults.forEach(testFile => {
    if (testFile.testFilePath.includes('security')) {
      testFile.testResults.forEach(testCase => {
        totalTests++;
        
        if (testCase.status === 'passed') {
          passedTests++;
        } else if (testCase.status === 'failed') {
          failedTests++;
          
          // Check for critical security failures
          if (testCase.fullName.toLowerCase().includes('critical') ||
              testCase.fullName.toLowerCase().includes('authentication') ||
              testCase.fullName.toLowerCase().includes('sql injection') ||
              testCase.fullName.toLowerCase().includes('privilege escalation')) {
            criticalIssues++;
          }
          
          vulnerabilities.push({
            test: testCase.fullName,
            file: testFile.testFilePath,
            error: testCase.failureMessages[0] || 'Unknown failure',
            duration: testCase.duration
          });
        }
        
        // Categorize tests
        const category = categorizeSecurityTest(testCase.fullName);
        testCategories[category] = (testCategories[category] || 0) + 1;
        
        // Track compliance tests
        if (testCase.fullName.toLowerCase().includes('compliance') ||
            testCase.fullName.toLowerCase().includes('gdpr') ||
            testCase.fullName.toLowerCase().includes('ccpa') ||
            testCase.fullName.toLowerCase().includes('owasp')) {
          complianceTests.push({
            test: testCase.fullName,
            status: testCase.status,
            duration: testCase.duration
          });
        }
      });
    }
  });

  const securityScore = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  const complianceScore = complianceTests.length > 0 ? 
    (complianceTests.filter(t => t.status === 'passed').length / complianceTests.length) * 100 : 100;

  return {
    totalTests,
    passedTests,
    failedTests,
    criticalIssues,
    vulnerabilities,
    complianceTests,
    testCategories,
    securityScore,
    complianceScore,
    executionTime: results.testResults.reduce((sum, result) => sum + (result.perfStats?.end || 0), 0)
  };
}

/**
 * Categorize security test by name
 */
function categorizeSecurityTest(testName) {
  const name = testName.toLowerCase();
  
  if (name.includes('input') || name.includes('validation')) return 'Input Validation';
  if (name.includes('auth') || name.includes('login')) return 'Authentication';
  if (name.includes('api')) return 'API Security';
  if (name.includes('dependency') || name.includes('package')) return 'Dependency Security';
  if (name.includes('agent')) return 'Agent Security';
  if (name.includes('owasp') || name.includes('zap')) return 'OWASP';
  if (name.includes('monitoring')) return 'Security Monitoring';
  if (name.includes('compliance')) return 'Compliance';
  
  return 'General Security';
}

/**
 * Generate security summary report
 */
function generateSecuritySummary(metrics, timestamp) {
  return {
    timestamp,
    summary: {
      totalTests: metrics.totalTests,
      passedTests: metrics.passedTests,
      failedTests: metrics.failedTests,
      criticalIssues: metrics.criticalIssues,
      securityScore: metrics.securityScore,
      complianceScore: metrics.complianceScore,
      executionTime: metrics.executionTime
    },
    categories: metrics.testCategories,
    status: metrics.criticalIssues === 0 ? 'PASS' : 'FAIL',
    recommendations: generateRecommendations(metrics)
  };
}

/**
 * Generate compliance report
 */
function generateComplianceReport(metrics, timestamp) {
  return {
    timestamp,
    complianceScore: metrics.complianceScore,
    complianceTests: metrics.complianceTests,
    status: metrics.complianceScore >= 95 ? 'COMPLIANT' : 'NON-COMPLIANT',
    standards: {
      'OWASP Top 10': metrics.complianceTests.filter(t => t.test.includes('OWASP')),
      'GDPR': metrics.complianceTests.filter(t => t.test.includes('GDPR')),
      'CCPA': metrics.complianceTests.filter(t => t.test.includes('CCPA'))
    }
  };
}

/**
 * Generate vulnerability report
 */
function generateVulnerabilityReport(metrics, timestamp) {
  return {
    timestamp,
    totalVulnerabilities: metrics.vulnerabilities.length,
    criticalIssues: metrics.criticalIssues,
    vulnerabilities: metrics.vulnerabilities.map(vuln => ({
      ...vuln,
      severity: getSeverity(vuln.test),
      category: categorizeSecurityTest(vuln.test)
    })),
    summary: {
      critical: metrics.criticalIssues,
      high: metrics.vulnerabilities.filter(v => getSeverity(v.test) === 'high').length,
      medium: metrics.vulnerabilities.filter(v => getSeverity(v.test) === 'medium').length,
      low: metrics.vulnerabilities.filter(v => getSeverity(v.test) === 'low').length
    }
  };
}

/**
 * Get severity level for vulnerability
 */
function getSeverity(testName) {
  const name = testName.toLowerCase();
  
  if (name.includes('critical') || 
      name.includes('sql injection') ||
      name.includes('authentication bypass') ||
      name.includes('privilege escalation')) {
    return 'critical';
  }
  
  if (name.includes('xss') ||
      name.includes('command injection') ||
      name.includes('unauthorized access')) {
    return 'high';
  }
  
  if (name.includes('validation') ||
      name.includes('configuration')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(metrics) {
  const recommendations = [];
  
  if (metrics.criticalIssues > 0) {
    recommendations.push('Address critical security vulnerabilities immediately');
    recommendations.push('Implement emergency security patches');
    recommendations.push('Review and strengthen authentication mechanisms');
  }
  
  if (metrics.failedTests > 0) {
    recommendations.push('Fix failing security tests before deployment');
    recommendations.push('Review security test implementation');
  }
  
  if (metrics.securityScore < 90) {
    recommendations.push('Improve overall security test coverage');
    recommendations.push('Implement additional security controls');
  }
  
  if (metrics.complianceScore < 95) {
    recommendations.push('Address compliance gaps');
    recommendations.push('Review regulatory requirements');
  }
  
  recommendations.push('Schedule regular security assessments');
  recommendations.push('Implement continuous security monitoring');
  
  return recommendations;
}

/**
 * Generate markdown summary report
 */
function generateMarkdownSummary(metrics, timestamp) {
  const status = metrics.criticalIssues === 0 ? '✅ PASS' : '❌ FAIL';
  
  return `# Security Test Report

**Generated:** ${timestamp}
**Status:** ${status}

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | ${metrics.totalTests} |
| Passed Tests | ${metrics.passedTests} |
| Failed Tests | ${metrics.failedTests} |
| Critical Issues | ${metrics.criticalIssues} |
| Security Score | ${metrics.securityScore.toFixed(1)}% |
| Compliance Score | ${metrics.complianceScore.toFixed(1)}% |
| Execution Time | ${(metrics.executionTime / 1000).toFixed(1)}s |

## Test Categories

${Object.entries(metrics.testCategories)
  .map(([category, count]) => `- ${category}: ${count} tests`)
  .join('\n')}

## Vulnerabilities

${metrics.vulnerabilities.length === 0 ? '✅ No vulnerabilities detected' : 
  `⚠️ Found ${metrics.vulnerabilities.length} vulnerabilities:\n\n${
    metrics.vulnerabilities.map((vuln, index) => 
      `${index + 1}. **${categorizeSecurityTest(vuln.test)}** - ${vuln.test}\n   - File: ${vuln.file}\n   - Error: ${vuln.error.split('\n')[0]}`
    ).join('\n\n')
  }`
}

## Recommendations

${generateRecommendations(metrics).map(rec => `- ${rec}`).join('\n')}

## Compliance Status

${metrics.complianceScore >= 95 ? '✅' : '❌'} Compliance Score: ${metrics.complianceScore.toFixed(1)}%

${metrics.complianceTests.length > 0 ? 
  `### Compliance Tests\n\n${metrics.complianceTests.map(test => 
    `- ${test.status === 'passed' ? '✅' : '❌'} ${test.test}`
  ).join('\n')}` : 
  'No compliance tests found'
}

---

*Report generated by Executive Assistant Security Testing Framework*
`;
}

/**
 * Write report to file
 */
function writeReport(filepath, content) {
  try {
    const data = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    fs.writeFileSync(filepath, data);
    console.log(`📝 Report written: ${filepath}`);
  } catch (error) {
    console.error(`❌ Failed to write report: ${filepath}`, error.message);
  }
}

module.exports = processResults;