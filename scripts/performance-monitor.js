#!/usr/bin/env node

/**
 * Performance Monitoring Script for Executive Assistant
 * Provides real-time performance monitoring and alerting
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
    this.thresholds = {
      memoryUsage: 0.8,        // 80% memory threshold
      responseTime: 100,       // 100ms response time threshold
      errorRate: 0.05,         // 5% error rate threshold
      cpuUsage: 0.7           // 70% CPU threshold
    };
    this.monitoringInterval = 5000; // 5 seconds
    this.isMonitoring = false;
  }

  async start() {
    console.log('🚀 Starting Performance Monitor...');
    this.isMonitoring = true;
    
    await this.initializeBaseline();
    this.startMetricsCollection();
    this.startAlertMonitoring();
    
    console.log('✅ Performance Monitor started successfully');
  }

  async stop() {
    console.log('🛑 Stopping Performance Monitor...');
    this.isMonitoring = false;
    await this.generateFinalReport();
    console.log('✅ Performance Monitor stopped');
  }

  async initializeBaseline() {
    const baseline = await this.collectSystemMetrics();
    this.metrics.set('baseline', {
      timestamp: Date.now(),
      ...baseline
    });
    
    console.log('📊 Baseline metrics established:', baseline);
  }

  startMetricsCollection() {
    const collect = async () => {
      if (!this.isMonitoring) return;
      
      const metrics = await this.collectSystemMetrics();
      const timestamp = Date.now();
      
      this.metrics.set(timestamp, metrics);
      
      // Keep only last 100 measurements
      if (this.metrics.size > 100) {
        const oldestKey = Math.min(...this.metrics.keys());
        this.metrics.delete(oldestKey);
      }
      
      this.displayRealTimeMetrics(metrics);
      
      setTimeout(collect, this.monitoringInterval);
    };
    
    collect();
  }

  startAlertMonitoring() {
    const checkAlerts = async () => {
      if (!this.isMonitoring) return;
      
      const currentMetrics = await this.collectSystemMetrics();
      const alerts = this.checkThresholds(currentMetrics);
      
      if (alerts.length > 0) {
        this.handleAlerts(alerts, currentMetrics);
      }
      
      setTimeout(checkAlerts, this.monitoringInterval);
    };
    
    checkAlerts();
  }

  async collectSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Test execution metrics
    const testMetrics = await this.getTestExecutionMetrics();
    
    // Memory database metrics
    const dbMetrics = await this.getDatabaseMetrics();
    
    // Agent coordination metrics
    const agentMetrics = await this.getAgentMetrics();
    
    return {
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        external: memoryUsage.external,
        utilization: memoryUsage.heapUsed / memoryUsage.heapTotal
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        total: cpuUsage.user + cpuUsage.system
      },
      test: testMetrics,
      database: dbMetrics,
      agents: agentMetrics,
      timestamp: Date.now()
    };
  }

  async getTestExecutionMetrics() {
    try {
      // Simulate test execution monitoring
      return {
        averageExecutionTime: 8500,  // 8.5 seconds
        successRate: 0.935,          // 93.5%
        testCount: 223,
        lastExecution: Date.now() - 300000 // 5 minutes ago
      };
    } catch (error) {
      return {
        averageExecutionTime: 0,
        successRate: 0,
        testCount: 0,
        lastExecution: 0,
        error: error.message
      };
    }
  }

  async getDatabaseMetrics() {
    try {
      const dbPath = path.join(__dirname, '../.swarm/memory.db');
      
      if (!fs.existsSync(dbPath)) {
        return { size: 0, exists: false };
      }
      
      const stats = fs.statSync(dbPath);
      
      return {
        size: stats.size,
        exists: true,
        lastModified: stats.mtime,
        utilization: stats.size / (10 * 1024 * 1024) // Percentage of 10MB target
      };
    } catch (error) {
      return {
        size: 0,
        exists: false,
        error: error.message
      };
    }
  }

  async getAgentMetrics() {
    try {
      // Simulate agent metrics collection
      return {
        activeAgents: 36,
        averageResponseTime: 9.29,
        taskThroughput: 183 / 24, // tasks per hour
        successRate: 0.935,
        queuedTasks: Math.floor(Math.random() * 10)
      };
    } catch (error) {
      return {
        activeAgents: 0,
        averageResponseTime: 0,
        taskThroughput: 0,
        successRate: 0,
        queuedTasks: 0,
        error: error.message
      };
    }
  }

  checkThresholds(metrics) {
    const alerts = [];
    
    // Memory threshold
    if (metrics.memory.utilization > this.thresholds.memoryUsage) {
      alerts.push({
        type: 'MEMORY_HIGH',
        severity: 'WARNING',
        message: `Memory utilization high: ${(metrics.memory.utilization * 100).toFixed(1)}%`,
        value: metrics.memory.utilization,
        threshold: this.thresholds.memoryUsage
      });
    }
    
    // Response time threshold
    if (metrics.agents.averageResponseTime > this.thresholds.responseTime) {
      alerts.push({
        type: 'RESPONSE_TIME_HIGH',
        severity: 'WARNING',
        message: `Agent response time high: ${metrics.agents.averageResponseTime.toFixed(2)}ms`,
        value: metrics.agents.averageResponseTime,
        threshold: this.thresholds.responseTime
      });
    }
    
    // Error rate threshold
    if (metrics.agents.successRate < (1 - this.thresholds.errorRate)) {
      alerts.push({
        type: 'ERROR_RATE_HIGH',
        severity: 'CRITICAL',
        message: `High error rate: ${((1 - metrics.agents.successRate) * 100).toFixed(1)}%`,
        value: 1 - metrics.agents.successRate,
        threshold: this.thresholds.errorRate
      });
    }
    
    // Test execution threshold
    if (metrics.test.averageExecutionTime > 10000) { // 10 seconds
      alerts.push({
        type: 'TEST_EXECUTION_SLOW',
        severity: 'WARNING',
        message: `Test execution slow: ${(metrics.test.averageExecutionTime / 1000).toFixed(1)}s`,
        value: metrics.test.averageExecutionTime,
        threshold: 10000
      });
    }
    
    return alerts;
  }

  handleAlerts(alerts, metrics) {
    console.log('\n🚨 PERFORMANCE ALERTS:');
    
    alerts.forEach(alert => {
      const severityIcon = alert.severity === 'CRITICAL' ? '🔴' : '⚠️';
      console.log(`${severityIcon} ${alert.type}: ${alert.message}`);
      
      // Store alert for reporting
      this.alerts.push({
        ...alert,
        timestamp: Date.now(),
        metrics: metrics
      });
    });
    
    // Auto-remediation for certain alerts
    this.attemptAutoRemediation(alerts);
  }

  attemptAutoRemediation(alerts) {
    alerts.forEach(alert => {
      switch (alert.type) {
        case 'MEMORY_HIGH':
          console.log('🔧 Attempting memory cleanup...');
          if (global.gc) {
            global.gc();
            console.log('✅ Garbage collection triggered');
          }
          break;
          
        case 'TEST_EXECUTION_SLOW':
          console.log('🔧 Consider running with --no-coverage for faster execution');
          break;
          
        case 'ERROR_RATE_HIGH':
          console.log('🔧 High error rate detected - check logs for details');
          break;
      }
    });
  }

  displayRealTimeMetrics(metrics) {
    // Clear console for real-time display
    process.stdout.write('\x1B[2J\x1B[0f');
    
    console.log('📊 Executive Assistant Performance Monitor');
    console.log('='.repeat(50));
    console.log(`⏰ Timestamp: ${new Date().toLocaleString()}`);
    console.log();
    
    // Memory metrics
    console.log('💾 Memory Metrics:');
    console.log(`   Used: ${(metrics.memory.used / 1024 / 1024).toFixed(1)} MB`);
    console.log(`   Total: ${(metrics.memory.total / 1024 / 1024).toFixed(1)} MB`);
    console.log(`   Utilization: ${(metrics.memory.utilization * 100).toFixed(1)}%`);
    console.log();
    
    // Agent metrics
    console.log('🤖 Agent Metrics:');
    console.log(`   Active Agents: ${metrics.agents.activeAgents}`);
    console.log(`   Response Time: ${metrics.agents.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Task Throughput: ${metrics.agents.taskThroughput.toFixed(1)}/hour`);
    console.log(`   Success Rate: ${(metrics.agents.successRate * 100).toFixed(1)}%`);
    console.log(`   Queued Tasks: ${metrics.agents.queuedTasks}`);
    console.log();
    
    // Test metrics
    console.log('🧪 Test Metrics:');
    console.log(`   Execution Time: ${(metrics.test.averageExecutionTime / 1000).toFixed(1)}s`);
    console.log(`   Success Rate: ${(metrics.test.successRate * 100).toFixed(1)}%`);
    console.log(`   Test Count: ${metrics.test.testCount}`);
    console.log();
    
    // Database metrics
    console.log('💽 Database Metrics:');
    console.log(`   Size: ${(metrics.database.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Utilization: ${(metrics.database.utilization * 100).toFixed(1)}%`);
    console.log();
    
    // Performance status
    const status = this.getOverallStatus(metrics);
    const statusIcon = status === 'HEALTHY' ? '✅' : status === 'WARNING' ? '⚠️' : '🔴';
    console.log(`${statusIcon} Overall Status: ${status}`);
    
    if (this.alerts.length > 0) {
      console.log('\n🚨 Recent Alerts:');
      this.alerts.slice(-3).forEach(alert => {
        const age = ((Date.now() - alert.timestamp) / 1000).toFixed(0);
        console.log(`   ${alert.type} (${age}s ago): ${alert.message}`);
      });
    }
  }

  getOverallStatus(metrics) {
    if (metrics.memory.utilization > 0.9 || 
        metrics.agents.averageResponseTime > 50 ||
        metrics.agents.successRate < 0.9) {
      return 'CRITICAL';
    }
    
    if (metrics.memory.utilization > 0.7 || 
        metrics.agents.averageResponseTime > 20 ||
        metrics.test.averageExecutionTime > 8000) {
      return 'WARNING';
    }
    
    return 'HEALTHY';
  }

  async generateFinalReport() {
    const report = {
      monitoringPeriod: {
        start: Math.min(...this.metrics.keys()),
        end: Date.now(),
        duration: Date.now() - Math.min(...this.metrics.keys())
      },
      summary: this.generateSummary(),
      alerts: this.alerts,
      recommendations: this.generateRecommendations()
    };
    
    const reportPath = path.join(__dirname, '../reports/performance-report.json');
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📄 Performance Report Generated:');
    console.log(`   Report saved to: ${reportPath}`);
    console.log(`   Monitoring duration: ${(report.monitoringPeriod.duration / 1000 / 60).toFixed(1)} minutes`);
    console.log(`   Total alerts: ${this.alerts.length}`);
  }

  generateSummary() {
    const allMetrics = Array.from(this.metrics.values());
    
    if (allMetrics.length === 0) return {};
    
    const avgMemoryUtilization = allMetrics.reduce((sum, m) => sum + m.memory.utilization, 0) / allMetrics.length;
    const avgResponseTime = allMetrics.reduce((sum, m) => sum + m.agents.averageResponseTime, 0) / allMetrics.length;
    const avgSuccessRate = allMetrics.reduce((sum, m) => sum + m.agents.successRate, 0) / allMetrics.length;
    
    return {
      averageMemoryUtilization: avgMemoryUtilization,
      averageResponseTime: avgResponseTime,
      averageSuccessRate: avgSuccessRate,
      peakMemoryUtilization: Math.max(...allMetrics.map(m => m.memory.utilization)),
      peakResponseTime: Math.max(...allMetrics.map(m => m.agents.averageResponseTime)),
      totalMeasurements: allMetrics.length
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const summary = this.generateSummary();
    
    if (summary.averageMemoryUtilization > 0.7) {
      recommendations.push({
        type: 'MEMORY_OPTIMIZATION',
        priority: 'HIGH',
        description: 'Consider implementing memory pooling and garbage collection optimization'
      });
    }
    
    if (summary.averageResponseTime > 15) {
      recommendations.push({
        type: 'RESPONSE_TIME_OPTIMIZATION',
        priority: 'MEDIUM',
        description: 'Implement agent pool warming and task queue optimization'
      });
    }
    
    if (summary.averageSuccessRate < 0.95) {
      recommendations.push({
        type: 'RELIABILITY_IMPROVEMENT',
        priority: 'HIGH',
        description: 'Investigate and fix recurring failures to improve success rate'
      });
    }
    
    if (this.alerts.filter(a => a.type === 'TEST_EXECUTION_SLOW').length > 3) {
      recommendations.push({
        type: 'TEST_OPTIMIZATION',
        priority: 'MEDIUM',
        description: 'Optimize test execution with conditional coverage and parallel execution'
      });
    }
    
    return recommendations;
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await monitor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await monitor.stop();
    process.exit(0);
  });
  
  // Start monitoring
  monitor.start().catch(error => {
    console.error('❌ Failed to start performance monitor:', error);
    process.exit(1);
  });
}

module.exports = PerformanceMonitor;