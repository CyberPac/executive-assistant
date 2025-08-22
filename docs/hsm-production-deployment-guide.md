# HSM Production Deployment Guide

## Executive Assistant HSM Integration - WBS 2.2

**SECURITY CLASSIFICATION: EXECUTIVE_PERSONAL**

This guide provides comprehensive instructions for deploying the production-ready HSM integration for the Executive Assistant system.

## Overview

The HSM Production Integration implements enterprise-grade hardware security module capabilities with:

- **Multi-vendor support**: Thales, AWS CloudHSM, Azure Dedicated HSM
- **Post-quantum cryptography**: CRYSTALS-Kyber, CRYSTALS-Dilithium, SPHINCS+
- **Executive-grade security**: FIPS 140-2 Level 3 compliance
- **High availability**: Automatic failover and load balancing
- **Comprehensive auditing**: SOX, HIPAA, PCI-DSS compliance

## Prerequisites

### Hardware Requirements

- **HSM Hardware**: Thales nShield Connect/Solo/Edge or equivalent
- **CPU**: Minimum 8 cores, 16 recommended for production
- **Memory**: Minimum 16GB RAM, 32GB recommended
- **Storage**: SSD with 100GB+ for logs and certificates
- **Network**: Redundant network connections for HA deployment

### Software Requirements

- **Node.js**: v18.0.0 or higher
- **Operating System**: Linux (RHEL 8+, Ubuntu 20.04+)
- **HSM Client Software**: Vendor-specific HSM client libraries
- **Certificates**: X.509 certificates for HSM authentication

## Installation

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install HSM-specific dependencies
npm install --save @types/node crypto-js
```

### 2. HSM Client Setup

#### Thales nShield Setup
```bash
# Install Thales nShield client software
sudo rpm -ivh nshield-11.72.0-linux-x86_64.rpm

# Configure nShield environment
sudo /opt/nfast/bin/config-serviced --help
sudo /opt/nfast/sbin/install-config-serviced
```

#### AWS CloudHSM Setup
```bash
# Install AWS CloudHSM client
wget https://s3.amazonaws.com/cloudhsmv2-software/CloudHsmClient/EL7/cloudhsm-client-latest.el7.x86_64.rpm
sudo yum install -y ./cloudhsm-client-latest.el7.x86_64.rpm

# Configure CloudHSM client
sudo /opt/cloudhsm/bin/configure -a <cluster-id>
```

### 3. Certificate Configuration

```bash
# Create certificate directory
sudo mkdir -p /opt/certs/hsm
sudo chmod 750 /opt/certs/hsm

# Generate or install client certificates
# Example for self-signed development certificates:
openssl genrsa -out /opt/certs/hsm/client-key.pem 4096
openssl req -new -x509 -key /opt/certs/hsm/client-key.pem \
    -out /opt/certs/hsm/client-cert.pem -days 365 \
    -subj "/CN=Executive-Assistant-HSM/O=Executive-Office"

# Set secure permissions
sudo chmod 600 /opt/certs/hsm/client-key.pem
sudo chmod 644 /opt/certs/hsm/client-cert.pem
```

## Configuration

### 1. Environment Variables

Create production environment configuration:

```bash
# /etc/environment or production .env file
export NODE_ENV=production
export HSM_ENDPOINT=https://hsm-executive.internal:9000
export HSM_CLIENT_CERT_PATH=/opt/certs/hsm/client-cert.pem
export HSM_CLIENT_KEY_PATH=/opt/certs/hsm/client-key.pem
export HSM_CA_CERT_PATH=/opt/certs/hsm/ca-cert.pem
export HSM_PRIMARY_ENDPOINT=https://hsm-1.internal:9000
export HSM_SECONDARY_ENDPOINT=https://hsm-2.internal:9000
export HSM_TERTIARY_ENDPOINT=https://hsm-3.internal:9000
```

### 2. Application Configuration

```typescript
// src/config/hsm-config.ts
import { ProductionHSMConfigFactory } from '../security/hsm/config/production-hsm-config';

// Production configuration
export const hsmConfig = ProductionHSMConfigFactory.createExecutiveConfig();

// High-availability configuration
export const hsmHAConfig = ProductionHSMConfigFactory.createHAConfig();

// Compliance-specific configuration
export const hsmSOXConfig = ProductionHSMConfigFactory.createComplianceConfig('sox');
```

### 3. Logging Configuration

```bash
# Create log directories
sudo mkdir -p /var/log/executive-assistant/hsm
sudo mkdir -p /var/log/executive-assistant/audit
sudo chown -R app:app /var/log/executive-assistant
sudo chmod 750 /var/log/executive-assistant/hsm
```

## Deployment

### 1. Validation

```bash
# Validate configuration before deployment
npm run hsm:validate-config

# Run HSM connectivity tests
npm run hsm:test-connection

# Perform security compliance check
npm run hsm:security-check
```

### 2. Production Deployment

```typescript
// src/app.ts
import { HSMInterface } from './security/hsm/HSMInterface';
import { ProductionHSMConfig } from './security/hsm/config/production-hsm-config';

async function initializeHSM() {
  try {
    // Validate configuration
    const validation = validateHSMConfig(ProductionHSMConfig);
    if (!validation.valid) {
      throw new Error(`HSM configuration invalid: ${validation.errors.join(', ')}`);
    }

    // Initialize HSM interface
    const hsm = new HSMInterface(ProductionHSMConfig);
    await hsm.initialize();

    console.log('✅ HSM Production Interface initialized successfully');
    return hsm;

  } catch (error) {
    console.error('❌ HSM initialization failed:', error);
    throw error;
  }
}

// Application startup
initializeHSM().then(hsm => {
  // Application ready with HSM integration
}).catch(error => {
  console.error('Application startup failed:', error);
  process.exit(1);
});
```

### 3. High Availability Setup

```yaml
# docker-compose.ha.yml
version: '3.8'
services:
  executive-assistant-primary:
    image: executive-assistant:latest
    environment:
      - NODE_ENV=production
      - HSM_ENDPOINT=https://hsm-1.internal:9000
      - DEPLOYMENT_ROLE=primary
    volumes:
      - /opt/certs:/opt/certs:ro
    networks:
      - hsm-network

  executive-assistant-secondary:
    image: executive-assistant:latest
    environment:
      - NODE_ENV=production
      - HSM_ENDPOINT=https://hsm-2.internal:9000
      - DEPLOYMENT_ROLE=secondary
    volumes:
      - /opt/certs:/opt/certs:ro
    networks:
      - hsm-network

networks:
  hsm-network:
    driver: bridge
```

## Security Hardening

### 1. File System Security

```bash
# Secure certificate files
sudo chmod 600 /opt/certs/hsm/*-key.pem
sudo chmod 644 /opt/certs/hsm/*-cert.pem
sudo chown root:hsm-users /opt/certs/hsm/
sudo chmod 750 /opt/certs/hsm/

# Secure log files
sudo chmod 640 /var/log/executive-assistant/hsm/*.log
sudo chmod 640 /var/log/executive-assistant/audit/*.log
```

### 2. Network Security

```bash
# Configure firewall rules
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="10.0.0.0/8" port protocol="tcp" port="9000" accept'
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.0.0/16" port protocol="tcp" port="9000" accept'
sudo firewall-cmd --reload

# Configure SELinux policies (if applicable)
sudo setsebool -P httpd_can_network_connect 1
```

### 3. Application Security

```typescript
// Security middleware
app.use((req, res, next) => {
  // Security headers
  res.setHeader('X-HSM-Request-ID', generateSecureRequestId());
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Request validation
app.use('/api/hsm', hsmAuthMiddleware);
app.use('/api/hsm', rateLimitMiddleware);
```

## Monitoring and Alerting

### 1. Health Monitoring

```typescript
// Health check endpoint
app.get('/health/hsm', async (req, res) => {
  try {
    const status = await hsm.getComprehensiveStatus();
    
    res.json({
      status: status.health.status,
      timestamp: new Date().toISOString(),
      details: {
        pool: status.pool,
        cluster: status.cluster,
        performance: status.performance.slice(-10),
        audit: {
          totalOperations: status.audit.totalOperations,
          successRate: status.audit.successRate,
          complianceStatus: status.audit.complianceStatus
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});
```

### 2. Alerting Configuration

```bash
# Prometheus alerting rules
groups:
  - name: hsm-alerts
    rules:
      - alert: HSMConnectionFailure
        expr: hsm_connection_status != 1
        for: 30s
        labels:
          severity: critical
        annotations:
          summary: "HSM connection failure detected"
          
      - alert: HSMHighErrorRate
        expr: hsm_error_rate > 0.01
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "HSM error rate exceeds threshold"
          
      - alert: HSMPerformanceDegradation
        expr: hsm_operation_duration_p95 > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "HSM performance degradation detected"
```

## Testing

### 1. Unit Tests

```bash
# Run HSM unit tests
npm run test:hsm

# Run security compliance tests
npm run test:security

# Run performance tests
npm run test:performance
```

### 2. Integration Tests

```bash
# Run HSM integration tests (requires test HSM)
npm run test:integration:hsm

# Run end-to-end tests
npm run test:e2e
```

### 3. Load Testing

```bash
# Install load testing tools
npm install -g artillery

# Run HSM load tests
artillery run tests/load/hsm-load-test.yml
```

## Maintenance

### 1. Certificate Rotation

```bash
#!/bin/bash
# cert-rotation.sh

# Backup current certificates
cp /opt/certs/hsm/client-cert.pem /opt/certs/hsm/backup/client-cert-$(date +%Y%m%d).pem

# Generate new certificate
openssl genrsa -out /opt/certs/hsm/client-key-new.pem 4096
openssl req -new -x509 -key /opt/certs/hsm/client-key-new.pem \
    -out /opt/certs/hsm/client-cert-new.pem -days 365

# Update application configuration
systemctl reload executive-assistant

# Verify new certificate
npm run hsm:verify-cert
```

### 2. Log Rotation

```bash
# /etc/logrotate.d/executive-assistant-hsm
/var/log/executive-assistant/hsm/*.log {
    daily
    rotate 90
    compress
    delaycompress
    missingok
    create 640 app app
    postrotate
        systemctl reload executive-assistant
    endscript
}
```

### 3. Performance Tuning

```typescript
// Performance monitoring
setInterval(async () => {
  const metrics = hsm.getPerformanceMetrics(100);
  const avgLatency = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
  
  if (avgLatency > 100) {
    console.warn(`HSM performance degradation: ${avgLatency}ms average latency`);
    // Trigger optimization procedures
    await hsm.optimizePerformance();
  }
}, 60000); // Check every minute
```

## Troubleshooting

### Common Issues

1. **Certificate Authentication Failures**
   ```bash
   # Check certificate validity
   openssl x509 -in /opt/certs/hsm/client-cert.pem -text -noout
   
   # Verify certificate chain
   openssl verify -CAfile /opt/certs/hsm/ca-cert.pem /opt/certs/hsm/client-cert.pem
   ```

2. **Connection Pool Exhaustion**
   ```typescript
   // Monitor pool status
   const poolStatus = hsm.connectionPool.getStatus();
   console.log(`Pool: ${poolStatus.available}/${poolStatus.size} available`);
   
   // Increase pool size if needed
   hsm.connectionPool.resize(50);
   ```

3. **Performance Issues**
   ```bash
   # Check HSM hardware status
   /opt/nfast/bin/enquiry
   
   # Monitor system resources
   top -p $(pgrep node)
   iostat -x 1
   ```

### Emergency Procedures

1. **HSM Failover**
   ```typescript
   // Manual failover to secondary HSM
   await hsm.clusterManager.failover('hsm-secondary');
   ```

2. **Emergency Key Recovery**
   ```bash
   # Access emergency key backup (if configured)
   sudo /opt/nfast/bin/key-recovery --emergency
   ```

## Compliance and Auditing

### SOX Compliance

- All HSM operations are logged with comprehensive audit trails
- Key generation and usage is tracked with user attribution
- Integrity checks are performed on all operations
- Regular compliance reports are generated

### HIPAA Compliance

- PHI encryption keys are generated and stored in HSM hardware
- Access controls prevent unauthorized key access
- Audit logs include all key access attempts
- Key escrow policies implemented as required

### PCI-DSS Compliance

- Payment processing keys never leave HSM hardware
- Key rotation is automated and audited
- Access is restricted to authorized personnel only
- Comprehensive logging of all payment key operations

## Contact and Support

For technical support and emergency assistance:

- **Primary**: Executive Assistant Technical Team
- **Secondary**: HSM Vendor Support (Thales/AWS/Azure)
- **Emergency**: 24/7 Security Operations Center

---

**Document Classification**: EXECUTIVE_PERSONAL  
**Last Updated**: 2025-01-20  
**Version**: 1.0.0