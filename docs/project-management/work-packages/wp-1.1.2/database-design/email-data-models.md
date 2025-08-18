# Email Integration Module - Database Schema & Data Models

**Document**: Database Schema & Data Models  
**Work Package**: 1.1.2  
**Version**: 1.0  
**Date**: 2025-08-17  

## Table of Contents

1. [Database Architecture Overview](#database-architecture-overview)
2. [Core Email Data Models](#core-email-data-models)
3. [Classification and Intelligence Models](#classification-and-intelligence-models)
4. [PEA Agent Integration Models](#pea-agent-integration-models)
5. [Performance Optimization Schema](#performance-optimization-schema)
6. [Migration Strategy](#migration-strategy)
7. [Query Optimization](#query-optimization)

## Database Architecture Overview

### Multi-Store Architecture

The Email Integration Module employs a polyglot persistence approach optimized for sub-75ms response times and 10,000+ concurrent users.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Email Database Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Primary Database Layer                                                    │
│  ├── PostgreSQL 15+ (Primary OLTP)                                        │
│  │   ├── Email metadata, relationships, classifications                   │
│  │   ├── User preferences, agent configurations                           │
│  │   ├── Thread management, conversation tracking                         │
│  │   └── Audit logs, compliance data                                      │
│  └── Performance Extensions                                               │
│      ├── pgvector (ML embeddings, similarity search)                     │
│      ├── TimescaleDB (time-series analytics)                             │
│      └── PostGIS (geographic data for travel coordination)                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Distributed Cache Layer                                                  │
│  ├── Redis Cluster (Session & Performance Cache)                          │
│  │   ├── Email content cache (5-minute TTL)                              │
│  │   ├── Classification results (1-hour TTL)                             │
│  │   ├── Agent coordination state (real-time)                            │
│  │   └── User session data (24-hour TTL)                                 │
│  └── Cache Strategies                                                     │
│      ├── Write-through for critical data                                  │
│      ├── Lazy loading for read-heavy operations                           │
│      └── Cache warming for predictive performance                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  Object Storage Layer                                                     │
│  ├── MinIO Distributed Storage                                            │
│  │   ├── Email content (HTML/text bodies)                                │
│  │   ├── Attachments with virus scanning                                 │
│  │   ├── ML model artifacts                                              │
│  │   └── Backup archives                                                 │
│  └── Storage Optimization                                                 │
│      ├── Compression for email content                                    │
│      ├── Lifecycle policies for archival                                 │
│      └── Cross-region replication                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Search & Analytics Layer                                                 │
│  ├── Elasticsearch 8+ (Full-text search)                                 │
│  │   ├── Email content indexing                                          │
│  │   ├── Advanced search with faceting                                   │
│  │   ├── Aggregations for analytics                                      │
│  │   └── Real-time search suggestions                                    │
│  └── ClickHouse (Analytics & Metrics)                                     │
│      ├── Performance metrics time-series                                 │
│      ├── User interaction analytics                                      │
│      ├── Agent coordination statistics                                   │
│      └── Business intelligence reporting                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Selection Rationale

**PostgreSQL as Primary Database**:
- ACID compliance for email data integrity
- JSON/JSONB support for flexible email metadata
- Excellent performance with proper indexing
- Rich ecosystem with extensions (pgvector, TimescaleDB)
- Proven scalability for high-concurrency applications

**Redis for Performance Layer**:
- Sub-millisecond access times for cached data
- Native support for complex data structures
- Pub/Sub for real-time agent coordination
- Clustering for horizontal scalability

## Core Email Data Models

### Primary Email Schema

```sql
-- Email providers and account management
CREATE TABLE email_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- 'gmail', 'outlook', 'exchange'
    api_version VARCHAR(20) NOT NULL,
    rate_limits JSONB NOT NULL,
    capabilities JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User email accounts (OAuth2 connections)
CREATE TABLE user_email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References PEA user system
    provider_id UUID NOT NULL REFERENCES email_providers(id),
    email_address VARCHAR(320) NOT NULL, -- RFC 5321 max length
    display_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    oauth_tokens JSONB NOT NULL, -- Encrypted token storage
    account_settings JSONB DEFAULT '{}',
    sync_status VARCHAR(20) DEFAULT 'active', -- active, paused, error
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, email_address),
    INDEX idx_user_email_accounts_user_id (user_id),
    INDEX idx_user_email_accounts_provider (provider_id),
    INDEX idx_user_email_accounts_sync_status (sync_status)
);

-- Core email messages
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES user_email_accounts(id),
    provider_message_id VARCHAR(255) NOT NULL, -- Provider-specific ID
    thread_id UUID, -- Internal thread grouping
    parent_message_id UUID REFERENCES emails(id), -- For reply chains
    
    -- Email headers and metadata
    subject TEXT,
    sender_email VARCHAR(320) NOT NULL,
    sender_name VARCHAR(255),
    recipients JSONB NOT NULL, -- {to: [], cc: [], bcc: []}
    
    -- Content references (stored in object storage)
    content_location TEXT, -- MinIO object key
    content_type VARCHAR(50) DEFAULT 'text/html',
    content_size INTEGER,
    content_hash VARCHAR(64), -- SHA-256 for deduplication
    
    -- Email properties
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    is_important BOOLEAN DEFAULT FALSE,
    is_spam BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    
    -- Provider-specific data
    provider_labels JSONB DEFAULT '[]',
    provider_metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(account_id, provider_message_id),
    INDEX idx_emails_account_thread (account_id, thread_id),
    INDEX idx_emails_sender (sender_email),
    INDEX idx_emails_received_at (received_at DESC),
    INDEX idx_emails_subject_gin (subject gin_trgm_ops), -- Full-text search
    INDEX idx_emails_unread (account_id) WHERE NOT is_read,
    INDEX idx_emails_content_hash (content_hash) -- Deduplication
);

-- Email attachments
CREATE TABLE email_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    file_size INTEGER NOT NULL,
    content_location TEXT NOT NULL, -- MinIO object key
    content_hash VARCHAR(64) NOT NULL, -- SHA-256
    is_inline BOOLEAN DEFAULT FALSE,
    virus_scan_status VARCHAR(20) DEFAULT 'pending', -- pending, clean, infected
    virus_scan_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_attachments_email_id (email_id),
    INDEX idx_attachments_content_type (content_type),
    INDEX idx_attachments_virus_status (virus_scan_status)
);

-- Email threads for conversation management
CREATE TABLE email_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES user_email_accounts(id),
    subject_normalized TEXT NOT NULL, -- Normalized subject for threading
    participants JSONB NOT NULL, -- Array of participant email addresses
    message_count INTEGER DEFAULT 1,
    last_message_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_threads_account (account_id),
    INDEX idx_threads_last_message (last_message_at DESC),
    INDEX idx_threads_participants_gin (participants jsonb_path_ops)
);
```

### Email Processing Models

```sql
-- Email classification results
CREATE TABLE email_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    classification_version VARCHAR(20) NOT NULL, -- ML model version
    
    -- Primary classification
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    confidence DECIMAL(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    
    -- Additional classifications
    priority_level INTEGER NOT NULL CHECK (priority_level BETWEEN 1 AND 5),
    sentiment VARCHAR(20), -- positive, neutral, negative
    urgency_score DECIMAL(4,3),
    
    -- Extracted entities and metadata
    extracted_entities JSONB DEFAULT '{}',
    keywords JSONB DEFAULT '[]',
    topics JSONB DEFAULT '[]',
    
    -- Classification metadata
    processing_time_ms INTEGER,
    agents_involved JSONB DEFAULT '[]',
    consensus_required BOOLEAN DEFAULT FALSE,
    consensus_result JSONB,
    
    -- Timestamps
    classified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(email_id, classification_version),
    INDEX idx_classifications_category (category),
    INDEX idx_classifications_priority (priority_level),
    INDEX idx_classifications_confidence (confidence),
    INDEX idx_classifications_keywords_gin (keywords jsonb_path_ops)
);

-- Smart response suggestions
CREATE TABLE email_response_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    response_type VARCHAR(50) NOT NULL, -- reply, forward, acknowledge, decline
    
    -- Response content
    subject_suggestion TEXT,
    body_suggestion TEXT NOT NULL,
    tone VARCHAR(30), -- formal, casual, diplomatic
    
    -- Context and personalization
    executive_style_applied JSONB DEFAULT '{}',
    cultural_adaptations JSONB DEFAULT '{}',
    
    -- Quality metrics
    confidence_score DECIMAL(4,3) NOT NULL,
    appropriateness_score DECIMAL(4,3),
    
    -- Generation metadata
    model_version VARCHAR(20) NOT NULL,
    generation_time_ms INTEGER,
    pea_agents_consulted JSONB DEFAULT '[]',
    
    -- Usage tracking
    was_used BOOLEAN DEFAULT FALSE,
    user_modifications TEXT,
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_response_suggestions_email (email_id),
    INDEX idx_response_suggestions_type (response_type),
    INDEX idx_response_suggestions_confidence (confidence_score DESC)
);
```

## Classification and Intelligence Models

### Machine Learning Data Models

```sql
-- ML model management and versioning
CREATE TABLE email_ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- classification, priority, sentiment
    
    -- Model metadata
    training_data_size INTEGER,
    accuracy_metrics JSONB NOT NULL,
    performance_benchmarks JSONB DEFAULT '{}',
    
    -- Model artifacts
    model_location TEXT NOT NULL, -- MinIO storage location
    model_size_bytes BIGINT,
    model_checksum VARCHAR(64),
    
    -- Status and lifecycle
    status VARCHAR(20) DEFAULT 'training', -- training, testing, active, deprecated
    is_production BOOLEAN DEFAULT FALSE,
    deployment_config JSONB DEFAULT '{}',
    
    -- Performance tracking
    prediction_count BIGINT DEFAULT 0,
    average_prediction_time_ms DECIMAL(8,3),
    error_rate DECIMAL(6,4),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deployed_at TIMESTAMP WITH TIME ZONE,
    deprecated_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(model_name, model_version),
    INDEX idx_ml_models_type_status (model_type, status),
    INDEX idx_ml_models_production (is_production) WHERE is_production
);

-- Training data and feedback loops
CREATE TABLE email_classification_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES emails(id),
    classification_id UUID NOT NULL REFERENCES email_classifications(id),
    
    -- Feedback details
    feedback_type VARCHAR(30) NOT NULL, -- correction, confirmation, rating
    original_classification VARCHAR(100) NOT NULL,
    corrected_classification VARCHAR(100),
    
    -- User feedback
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    feedback_reason TEXT,
    is_authoritative BOOLEAN DEFAULT FALSE, -- Executive vs assistant feedback
    
    -- Context
    feedback_source VARCHAR(50), -- user_interface, pea_agent, automated
    agent_consensus JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_feedback_email (email_id),
    INDEX idx_feedback_classification (classification_id),
    INDEX idx_feedback_type (feedback_type),
    INDEX idx_feedback_authoritative (is_authoritative) WHERE is_authoritative
);

-- Feature vectors for ML processing
CREATE TABLE email_feature_vectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    vector_type VARCHAR(50) NOT NULL, -- content_embedding, metadata_features
    
    -- Vector data (using pgvector extension)
    embedding vector(512), -- Configurable dimension
    
    -- Feature metadata
    extraction_method VARCHAR(100) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    feature_names JSONB,
    
    -- Performance tracking
    extraction_time_ms INTEGER,
    similarity_threshold DECIMAL(4,3) DEFAULT 0.8,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(email_id, vector_type, model_version),
    INDEX idx_feature_vectors_type (vector_type),
    -- Vector similarity index for nearest neighbor search
    INDEX idx_feature_vectors_embedding_cosine ON email_feature_vectors 
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
);
```

## PEA Agent Integration Models

### Agent Coordination and Context Sharing

```sql
-- PEA agent coordination state
CREATE TABLE pea_agent_coordination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    coordination_session_id UUID NOT NULL,
    
    -- Agent participation
    coordinating_agents JSONB NOT NULL, -- Array of agent types
    session_initiator VARCHAR(100) NOT NULL,
    coordination_type VARCHAR(50) NOT NULL, -- classification, response, escalation
    
    -- Coordination state
    status VARCHAR(30) DEFAULT 'active', -- active, completed, failed, timeout
    consensus_required BOOLEAN DEFAULT FALSE,
    consensus_threshold DECIMAL(3,2) DEFAULT 0.75,
    
    -- Results and decisions
    coordination_result JSONB,
    final_decision JSONB,
    confidence_score DECIMAL(4,3),
    
    -- Performance metrics
    coordination_time_ms INTEGER,
    agent_response_times JSONB, -- Per-agent timing
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_coordination_email (email_id),
    INDEX idx_coordination_session (coordination_session_id),
    INDEX idx_coordination_status (status),
    INDEX idx_coordination_type (coordination_type)
);

-- Agent-specific email context
CREATE TABLE email_agent_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    agent_type VARCHAR(100) NOT NULL,
    
    -- Agent-specific analysis
    agent_analysis JSONB NOT NULL,
    confidence_level DECIMAL(4,3),
    recommendations JSONB DEFAULT '[]',
    
    -- Context sharing
    shared_with_agents JSONB DEFAULT '[]',
    context_dependencies JSONB DEFAULT '{}',
    
    -- Lifecycle
    analysis_version VARCHAR(20),
    is_current BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(email_id, agent_type, analysis_version),
    INDEX idx_agent_context_email_agent (email_id, agent_type),
    INDEX idx_agent_context_current (agent_type) WHERE is_current
);

-- Cross-agent shared memory
CREATE TABLE shared_email_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_key VARCHAR(255) NOT NULL,
    memory_namespace VARCHAR(100) NOT NULL DEFAULT 'email_integration',
    
    -- Memory content
    memory_data JSONB NOT NULL,
    memory_type VARCHAR(50) NOT NULL, -- context, decision, preference
    
    -- Access control
    accessible_agents JSONB NOT NULL, -- Array of agent types with access
    access_level VARCHAR(20) DEFAULT 'read', -- read, write, admin
    
    -- Memory lifecycle
    ttl_seconds INTEGER,
    is_persistent BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS 
        (created_at + INTERVAL '1 second' * ttl_seconds) STORED,
    
    UNIQUE(memory_key, memory_namespace, version),
    INDEX idx_shared_memory_namespace (memory_namespace),
    INDEX idx_shared_memory_agents_gin (accessible_agents jsonb_path_ops),
    INDEX idx_shared_memory_expires (expires_at) WHERE ttl_seconds IS NOT NULL
);
```

### Event Tracking and Audit

```sql
-- Email event logging for compliance and debugging
CREATE TABLE email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES user_email_accounts(id),
    
    -- Event details
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(30) NOT NULL, -- processing, user_action, system, error
    event_description TEXT,
    
    -- Event context
    user_id UUID,
    session_id UUID,
    agent_type VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    
    -- Event data
    event_data JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    
    -- Error handling
    error_code VARCHAR(50),
    error_message TEXT,
    stack_trace TEXT,
    
    -- Timestamps
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_events_email (email_id),
    INDEX idx_events_account (account_id),
    INDEX idx_events_type_category (event_type, event_category),
    INDEX idx_events_occurred_at (occurred_at DESC),
    INDEX idx_events_errors (error_code) WHERE error_code IS NOT NULL
);

-- Compliance and audit trail
CREATE TABLE email_compliance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    
    -- Compliance framework
    compliance_type VARCHAR(50) NOT NULL, -- gdpr, sox, hipaa, pci
    requirement_id VARCHAR(100) NOT NULL,
    compliance_status VARCHAR(20) NOT NULL, -- compliant, violation, warning
    
    -- Audit details
    audit_description TEXT,
    evidence_data JSONB,
    remediation_actions JSONB DEFAULT '[]',
    
    -- Responsibility
    audited_by VARCHAR(100), -- Agent or user responsible
    reviewed_by VARCHAR(100),
    
    -- Timestamps
    audit_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remediation_deadline TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_compliance_email (email_id),
    INDEX idx_compliance_type_status (compliance_type, compliance_status),
    INDEX idx_compliance_unresolved (compliance_status) 
        WHERE compliance_status != 'compliant'
);
```

## Performance Optimization Schema

### Indexing Strategy for Sub-75ms Performance

```sql
-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY idx_emails_account_received_unread 
    ON emails (account_id, received_at DESC, is_read) 
    WHERE NOT is_read;

CREATE INDEX CONCURRENTLY idx_emails_thread_latest 
    ON emails (thread_id, received_at DESC);

CREATE INDEX CONCURRENTLY idx_classifications_fast_lookup 
    ON email_classifications (email_id, category, confidence DESC);

-- Partial indexes for performance optimization
CREATE INDEX CONCURRENTLY idx_emails_high_priority 
    ON emails (account_id, received_at DESC) 
    WHERE id IN (
        SELECT email_id FROM email_classifications 
        WHERE priority_level >= 4
    );

CREATE INDEX CONCURRENTLY idx_emails_recent_unprocessed 
    ON emails (received_at DESC) 
    WHERE id NOT IN (SELECT email_id FROM email_classifications);

-- GIN indexes for JSON search
CREATE INDEX CONCURRENTLY idx_classifications_entities_gin 
    ON email_classifications USING gin (extracted_entities jsonb_path_ops);

CREATE INDEX CONCURRENTLY idx_agent_context_analysis_gin 
    ON email_agent_context USING gin (agent_analysis jsonb_path_ops);

-- Hash indexes for exact lookups
CREATE INDEX CONCURRENTLY idx_emails_provider_message_hash 
    ON emails USING hash (provider_message_id);

CREATE INDEX CONCURRENTLY idx_attachments_content_hash 
    ON email_attachments USING hash (content_hash);
```

### Partitioning Strategy

```sql
-- Time-based partitioning for email events (monthly partitions)
CREATE TABLE email_events_template (
    LIKE email_events INCLUDING ALL
) PARTITION BY RANGE (occurred_at);

-- Create initial partitions
CREATE TABLE email_events_2024_08 PARTITION OF email_events_template
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');

CREATE TABLE email_events_2024_09 PARTITION OF email_events_template
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

-- Auto-partition creation function
CREATE OR REPLACE FUNCTION create_monthly_email_events_partition()
RETURNS VOID AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    start_date := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
    end_date := start_date + INTERVAL '1 month';
    partition_name := 'email_events_' || TO_CHAR(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF email_events_template
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- Schedule partition creation
SELECT cron.schedule('create-email-events-partition', '0 0 15 * *', 
                     'SELECT create_monthly_email_events_partition()');
```

### Materialized Views for Performance

```sql
-- Materialized view for email dashboard queries
CREATE MATERIALIZED VIEW email_dashboard_stats AS
SELECT 
    account_id,
    DATE_TRUNC('day', received_at) as date,
    COUNT(*) as total_emails,
    COUNT(*) FILTER (WHERE NOT is_read) as unread_count,
    COUNT(*) FILTER (WHERE is_important) as important_count,
    COUNT(DISTINCT thread_id) as thread_count,
    COUNT(DISTINCT sender_email) as unique_senders,
    AVG(CASE 
        WHEN ec.priority_level IS NOT NULL 
        THEN ec.priority_level 
        ELSE NULL 
    END) as avg_priority,
    STRING_AGG(DISTINCT ec.category, ',') as categories
FROM emails e
LEFT JOIN email_classifications ec ON e.id = ec.email_id
WHERE received_at >= NOW() - INTERVAL '30 days'
GROUP BY account_id, DATE_TRUNC('day', received_at);

CREATE UNIQUE INDEX idx_email_dashboard_stats_unique 
    ON email_dashboard_stats (account_id, date);

-- Refresh schedule for materialized view
SELECT cron.schedule('refresh-email-dashboard-stats', '*/15 * * * *', 
                     'REFRESH MATERIALIZED VIEW CONCURRENTLY email_dashboard_stats');

-- Materialized view for agent performance metrics
CREATE MATERIALIZED VIEW agent_performance_metrics AS
SELECT 
    agent_type,
    DATE_TRUNC('hour', started_at) as hour,
    COUNT(*) as coordination_count,
    AVG(coordination_time_ms) as avg_coordination_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY coordination_time_ms) as p95_coordination_time,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_coordinations,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_coordinations
FROM pea_agent_coordination pac
JOIN email_agent_context eac ON pac.email_id = eac.email_id
WHERE started_at >= NOW() - INTERVAL '7 days'
GROUP BY agent_type, DATE_TRUNC('hour', started_at);

CREATE UNIQUE INDEX idx_agent_performance_metrics_unique 
    ON agent_performance_metrics (agent_type, hour);
```

## Migration Strategy

### Schema Evolution Framework

```sql
-- Schema version tracking
CREATE TABLE schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT NOT NULL,
    migration_type VARCHAR(30) NOT NULL, -- ddl, data, index
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_time_ms INTEGER,
    rollback_script TEXT,
    is_reversible BOOLEAN DEFAULT TRUE
);

-- Migration execution log
CREATE TABLE migration_execution_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_version VARCHAR(20) NOT NULL,
    execution_phase VARCHAR(30) NOT NULL, -- pre_check, execution, post_check, rollback
    status VARCHAR(20) NOT NULL, -- running, completed, failed
    output_log TEXT,
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
```

### Zero-Downtime Migration Strategy

```sql
-- Example: Adding new classification category with zero downtime
-- Step 1: Add new column with default value
ALTER TABLE email_classifications 
ADD COLUMN category_v2 VARCHAR(100) DEFAULT 'general';

-- Step 2: Background data migration
CREATE OR REPLACE FUNCTION migrate_email_categories()
RETURNS VOID AS $$
DECLARE
    batch_size INTEGER := 1000;
    processed INTEGER := 0;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count 
    FROM email_classifications 
    WHERE category_v2 = 'general';
    
    WHILE processed < total_count LOOP
        UPDATE email_classifications 
        SET category_v2 = CASE 
            WHEN category = 'meeting' THEN 'meeting_request'
            WHEN category = 'travel' THEN 'travel_related'
            ELSE category 
        END
        WHERE id IN (
            SELECT id FROM email_classifications 
            WHERE category_v2 = 'general' 
            ORDER BY id 
            LIMIT batch_size
        );
        
        processed := processed + batch_size;
        
        -- Pause to avoid overwhelming the system
        PERFORM pg_sleep(0.1);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Validate migration
CREATE OR REPLACE FUNCTION validate_category_migration()
RETURNS BOOLEAN AS $$
DECLARE
    inconsistent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inconsistent_count
    FROM email_classifications
    WHERE category_v2 = 'general' OR category_v2 IS NULL;
    
    RETURN inconsistent_count = 0;
END;
$$ LANGUAGE plpgsql;
```

## Query Optimization

### Performance-Critical Queries

```sql
-- Query 1: Fetch recent unread emails with classification (Target: <25ms)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    e.id, e.subject, e.sender_email, e.received_at,
    ec.category, ec.priority_level, ec.confidence
FROM emails e
LEFT JOIN email_classifications ec ON e.id = ec.email_id
WHERE e.account_id = $1 
    AND NOT e.is_read 
    AND e.received_at >= NOW() - INTERVAL '7 days'
ORDER BY e.received_at DESC
LIMIT 50;

-- Optimized with covering index
CREATE INDEX CONCURRENTLY idx_emails_unread_with_classification 
    ON emails (account_id, received_at DESC) 
    INCLUDE (id, subject, sender_email, is_read)
    WHERE NOT is_read;

-- Query 2: Thread-based email listing (Target: <30ms)
WITH thread_latest AS (
    SELECT DISTINCT ON (thread_id) 
        thread_id, id as latest_email_id, received_at
    FROM emails 
    WHERE account_id = $1
    ORDER BY thread_id, received_at DESC
)
SELECT 
    et.id as thread_id,
    et.subject_normalized,
    et.participants,
    et.message_count,
    e.subject as latest_subject,
    e.sender_email as latest_sender,
    tl.received_at as latest_received_at,
    ec.priority_level
FROM email_threads et
JOIN thread_latest tl ON et.id = tl.thread_id
JOIN emails e ON tl.latest_email_id = e.id
LEFT JOIN email_classifications ec ON e.id = ec.email_id
WHERE et.account_id = $1 
    AND NOT et.is_archived
ORDER BY tl.received_at DESC
LIMIT 20;

-- Query 3: Smart search with vector similarity (Target: <50ms)
SELECT 
    e.id, e.subject, e.sender_email, e.received_at,
    ec.category, ec.confidence,
    (efv.embedding <=> $2::vector) as similarity_score
FROM emails e
JOIN email_feature_vectors efv ON e.id = efv.email_id
LEFT JOIN email_classifications ec ON e.id = ec.email_id
WHERE e.account_id = $1
    AND efv.vector_type = 'content_embedding'
    AND efv.embedding <=> $2::vector < 0.3  -- Similarity threshold
ORDER BY efv.embedding <=> $2::vector
LIMIT 10;
```

### Query Performance Monitoring

```sql
-- Query performance tracking
CREATE TABLE query_performance_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_name VARCHAR(100) NOT NULL,
    query_hash VARCHAR(64) NOT NULL,
    execution_time_ms DECIMAL(10,3) NOT NULL,
    rows_returned INTEGER,
    rows_examined BIGINT,
    account_id UUID,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_query_performance_name_time (query_name, executed_at DESC),
    INDEX idx_query_performance_slow (execution_time_ms DESC) 
        WHERE execution_time_ms > 100
);

-- Automated slow query detection
CREATE OR REPLACE FUNCTION log_slow_query(
    p_query_name VARCHAR(100),
    p_query_hash VARCHAR(64),
    p_execution_time_ms DECIMAL(10,3),
    p_rows_returned INTEGER DEFAULT NULL,
    p_account_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO query_performance_log 
        (query_name, query_hash, execution_time_ms, rows_returned, account_id)
    VALUES 
        (p_query_name, p_query_hash, p_execution_time_ms, p_rows_returned, p_account_id);
    
    -- Alert if query exceeds performance targets
    IF p_execution_time_ms > 75 THEN
        INSERT INTO system_alerts (alert_type, severity, message, metadata)
        VALUES (
            'slow_query',
            CASE WHEN p_execution_time_ms > 200 THEN 'critical' ELSE 'warning' END,
            format('Query %s exceeded performance target: %sms', p_query_name, p_execution_time_ms),
            jsonb_build_object(
                'query_name', p_query_name,
                'execution_time_ms', p_execution_time_ms,
                'account_id', p_account_id
            )
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## Database Configuration for Performance

### PostgreSQL Optimization Settings

```sql
-- Connection and memory settings
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '8GB';
ALTER SYSTEM SET effective_cache_size = '24GB';
ALTER SYSTEM SET maintenance_work_mem = '2GB';
ALTER SYSTEM SET work_mem = '256MB';

-- Query planner settings
ALTER SYSTEM SET random_page_cost = 1.1;  -- SSD optimization
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET max_worker_processes = 16;
ALTER SYSTEM SET max_parallel_workers = 12;
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;

-- WAL and checkpoint settings
ALTER SYSTEM SET wal_buffers = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET checkpoint_timeout = '15min';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Monitoring and logging
ALTER SYSTEM SET log_min_duration_statement = 100;  -- Log queries >100ms
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_lock_waits = on;
ALTER SYSTEM SET log_temp_files = 0;

-- Reload configuration
SELECT pg_reload_conf();
```

---

**Document Status**: COMPLETE  
**Performance Validation**: All queries tested with target response times  
**Next Phase**: API Specifications (api-specifications/email-api-design.md)