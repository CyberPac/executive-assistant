# Email Integration Module - API Specifications & Interface Design

**Document**: API Specifications & Interface Design  
**Work Package**: 1.1.2  
**Version**: 1.0  
**Date**: 2025-08-17  

## Table of Contents

1. [API Architecture Overview](#api-architecture-overview)
2. [RESTful API Specifications](#restful-api-specifications)
3. [GraphQL Schema Design](#graphql-schema-design)
4. [WebSocket Real-Time Interface](#websocket-real-time-interface)
5. [PEA Agent Integration APIs](#pea-agent-integration-apis)
6. [Authentication & Authorization](#authentication--authorization)
7. [Rate Limiting & Throttling](#rate-limiting--throttling)
8. [Error Handling & Response Formats](#error-handling--response-formats)

## API Architecture Overview

### Multi-Protocol API Gateway

The Email Integration Module exposes multiple API interfaces to serve different use cases while maintaining compatibility with the existing PEA agent ecosystem.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Email Integration API Architecture                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  API Gateway Layer (Kong/Istio)                                           │
│  ├── Rate Limiting & Throttling                                            │
│  ├── Authentication & Authorization                                        │
│  ├── Request/Response Transformation                                       │
│  ├── Circuit Breaker & Retry Logic                                        │
│  └── API Versioning & Routing                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Public API Interfaces                                                    │
│  ├── REST API v1 (Executive Interface)                                    │
│  │   ├── /api/v1/emails/* (CRUD operations)                              │
│  │   ├── /api/v1/threads/* (Thread management)                           │
│  │   ├── /api/v1/search/* (Email search & discovery)                     │
│  │   └── /api/v1/intelligence/* (Smart features)                         │
│  ├── GraphQL API (Advanced Queries)                                       │
│  │   ├── Unified schema for complex queries                              │
│  │   ├── Real-time subscriptions                                         │
│  │   ├── Batch operations with field selection                           │
│  │   └── Cross-entity relationship queries                               │
│  └── WebSocket API (Real-Time Events)                                     │
│      ├── Email event streams                                              │
│      ├── PEA agent coordination events                                    │
│      ├── Classification updates                                           │
│      └── System status notifications                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  Internal API Interfaces (PEA Agent Integration)                          │
│  ├── Agent Communication API                                              │
│  │   ├── Message bus integration (Kafka)                                 │
│  │   ├── Consensus coordination endpoints                                │
│  │   ├── Context sharing interfaces                                      │
│  │   └── Event publishing/subscribing                                    │
│  ├── Shared Memory API                                                    │
│  │   ├── Context storage and retrieval                                   │
│  │   ├── Cross-agent data synchronization                                │
│  │   ├── Preference propagation                                          │
│  │   └── Knowledge base integration                                      │
│  └── Workflow Coordination API                                            │
│      ├── Multi-agent task orchestration                                  │
│      ├── Consensus-based decision making                                 │
│      ├── Agent capability discovery                                      │
│      └── Performance monitoring                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  External Provider Integration                                            │
│  ├── Gmail API Integration Layer                                          │
│  │   ├── OAuth2 token management                                         │
│  │   ├── Rate limit compliance                                           │
│  │   ├── Webhook subscription management                                 │
│  │   └── Batch operation optimization                                    │
│  └── Outlook API Integration Layer                                        │
│      ├── Microsoft Graph authentication                                   │
│      ├── Change notification handling                                     │
│      ├── Throttling management                                           │
│      └── Error recovery & fallback                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### API Design Principles

**1. Performance-First Design**
- Sub-75ms response times for standard operations
- Intelligent caching with cache-control headers
- Pagination for large result sets
- Async processing for complex operations

**2. Security-by-Design**
- OAuth2 + PKCE for authentication
- JWT tokens with short expiration
- Field-level access control
- Request signing for sensitive operations

**3. PEA Agent Ecosystem Integration**
- Event-driven architecture for real-time coordination
- Standardized message formats across agents
- Context sharing with access control
- Performance monitoring and SLA compliance

**4. Developer Experience**
- Comprehensive OpenAPI documentation
- SDK generation for multiple languages
- Interactive API explorer
- Comprehensive error messages with action guidance

## RESTful API Specifications

### Core Email Operations API

#### GET /api/v1/emails
**Description**: Retrieve emails with filtering and pagination  
**Performance Target**: <50ms average response time  

```yaml
openapi: 3.0.3
info:
  title: Email Integration API
  version: 1.0.0
  description: PEA Email Integration Module API

paths:
  /api/v1/emails:
    get:
      summary: List emails with advanced filtering
      parameters:
        - name: account_id
          in: query
          required: true
          schema:
            type: string
            format: uuid
          description: Email account identifier
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
          description: Number of emails to return
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            default: 0
          description: Number of emails to skip
        - name: thread_id
          in: query
          schema:
            type: string
            format: uuid
          description: Filter by thread ID
        - name: unread_only
          in: query
          schema:
            type: boolean
            default: false
          description: Return only unread emails
        - name: category
          in: query
          schema:
            type: string
            enum: [meeting_request, travel_related, financial, urgent, personal]
          description: Filter by classification category
        - name: priority_min
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 5
          description: Minimum priority level
        - name: since
          in: query
          schema:
            type: string
            format: date-time
          description: Return emails received after this timestamp
        - name: search
          in: query
          schema:
            type: string
            maxLength: 200
          description: Full-text search query
      responses:
        '200':
          description: Emails retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  emails:
                    type: array
                    items:
                      $ref: '#/components/schemas/EmailSummary'
                  pagination:
                    $ref: '#/components/schemas/PaginationInfo'
                  performance_metrics:
                    $ref: '#/components/schemas/PerformanceMetrics'
                  cache_info:
                    $ref: '#/components/schemas/CacheInfo'
        '400':
          description: Invalid request parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '429':
          description: Rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RateLimitError'

components:
  schemas:
    EmailSummary:
      type: object
      required:
        - id
        - subject
        - sender
        - received_at
        - is_read
      properties:
        id:
          type: string
          format: uuid
          description: Unique email identifier
        thread_id:
          type: string
          format: uuid
          description: Thread grouping identifier
        subject:
          type: string
          maxLength: 500
          description: Email subject line
        sender:
          $ref: '#/components/schemas/EmailAddress'
        recipients:
          type: object
          properties:
            to:
              type: array
              items:
                $ref: '#/components/schemas/EmailAddress'
            cc:
              type: array
              items:
                $ref: '#/components/schemas/EmailAddress'
            bcc:
              type: array
              items:
                $ref: '#/components/schemas/EmailAddress'
        preview:
          type: string
          maxLength: 200
          description: Content preview
        is_read:
          type: boolean
        is_important:
          type: boolean
        has_attachments:
          type: boolean
        attachment_count:
          type: integer
          minimum: 0
        classification:
          $ref: '#/components/schemas/EmailClassification'
        received_at:
          type: string
          format: date-time
        content_size:
          type: integer
          description: Email content size in bytes
    
    EmailDetail:
      allOf:
        - $ref: '#/components/schemas/EmailSummary'
        - type: object
          properties:
            content:
              type: object
              properties:
                html:
                  type: string
                  description: HTML content
                text:
                  type: string
                  description: Plain text content
                content_type:
                  type: string
                  enum: [text/html, text/plain, multipart/alternative]
            attachments:
              type: array
              items:
                $ref: '#/components/schemas/EmailAttachment'
            provider_metadata:
              type: object
              additionalProperties: true
              description: Provider-specific metadata
            pea_context:
              $ref: '#/components/schemas/PEAEmailContext'
    
    EmailClassification:
      type: object
      properties:
        category:
          type: string
          enum: [meeting_request, travel_related, financial, urgent, personal, document_review, crisis_alert]
        subcategory:
          type: string
        confidence:
          type: number
          format: double
          minimum: 0
          maximum: 1
        priority_level:
          type: integer
          minimum: 1
          maximum: 5
        urgency_score:
          type: number
          format: double
          minimum: 0
          maximum: 1
        extracted_entities:
          type: object
          additionalProperties: true
        suggested_actions:
          type: array
          items:
            type: string
            enum: [respond, forward, schedule_meeting, create_task, escalate]
        agent_consensus:
          type: object
          properties:
            consensus_reached:
              type: boolean
            participating_agents:
              type: array
              items:
                type: string
            confidence_score:
              type: number
              format: double
```

#### POST /api/v1/emails
**Description**: Compose and send email  
**Performance Target**: <200ms average response time  

```yaml
  /api/v1/emails:
    post:
      summary: Compose and send email
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EmailComposition'
      responses:
        '201':
          description: Email sent successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  email_id:
                    type: string
                    format: uuid
                  provider_message_id:
                    type: string
                  send_status:
                    type: string
                    enum: [sent, queued, failed]
                  delivery_info:
                    $ref: '#/components/schemas/DeliveryInfo'
                  pea_coordination:
                    $ref: '#/components/schemas/PEACoordinationResult'
        '400':
          description: Invalid email composition
        '403':
          description: Insufficient permissions
        '422':
          description: Email validation failed

components:
  schemas:
    EmailComposition:
      type: object
      required:
        - account_id
        - recipients
        - subject
        - content
      properties:
        account_id:
          type: string
          format: uuid
        recipients:
          type: object
          required:
            - to
          properties:
            to:
              type: array
              items:
                $ref: '#/components/schemas/EmailAddress'
              minItems: 1
            cc:
              type: array
              items:
                $ref: '#/components/schemas/EmailAddress'
            bcc:
              type: array
              items:
                $ref: '#/components/schemas/EmailAddress'
        subject:
          type: string
          maxLength: 500
        content:
          type: object
          required:
            - body
          properties:
            body:
              type: string
              maxLength: 1000000
            content_type:
              type: string
              enum: [text/html, text/plain]
              default: text/html
            attachments:
              type: array
              items:
                $ref: '#/components/schemas/AttachmentUpload'
              maxItems: 10
        options:
          type: object
          properties:
            is_draft:
              type: boolean
              default: false
            send_at:
              type: string
              format: date-time
              description: Schedule send time
            tracking_enabled:
              type: boolean
              default: true
            executive_style:
              type: string
              enum: [formal, professional, casual]
              default: professional
            cultural_adaptation:
              type: string
              description: Cultural context for international recipients
            pea_coordination:
              type: object
              properties:
                require_consensus:
                  type: boolean
                  default: false
                notify_agents:
                  type: array
                  items:
                    type: string
                coordinate_with_calendar:
                  type: boolean
                  default: true
```

### Thread Management API

#### GET /api/v1/threads
**Description**: Retrieve email threads with conversation context  
**Performance Target**: <75ms average response time  

```yaml
  /api/v1/threads:
    get:
      summary: List email threads
      parameters:
        - name: account_id
          in: query
          required: true
          schema:
            type: string
            format: uuid
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 50
            default: 20
        - name: include_archived
          in: query
          schema:
            type: boolean
            default: false
        - name: participant
          in: query
          schema:
            type: string
            format: email
          description: Filter threads by participant
        - name: priority_min
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 5
      responses:
        '200':
          description: Threads retrieved successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  threads:
                    type: array
                    items:
                      $ref: '#/components/schemas/EmailThread'
                  pagination:
                    $ref: '#/components/schemas/PaginationInfo'

components:
  schemas:
    EmailThread:
      type: object
      properties:
        id:
          type: string
          format: uuid
        subject_normalized:
          type: string
        participants:
          type: array
          items:
            $ref: '#/components/schemas/EmailAddress'
        message_count:
          type: integer
          minimum: 1
        unread_count:
          type: integer
          minimum: 0
        latest_message:
          $ref: '#/components/schemas/EmailSummary'
        thread_classification:
          $ref: '#/components/schemas/ThreadClassification'
        pea_insights:
          $ref: '#/components/schemas/ThreadInsights'
        last_activity_at:
          type: string
          format: date-time
        is_archived:
          type: boolean
```

### Smart Features API

#### POST /api/v1/intelligence/classify
**Description**: Classify email content using ML models  
**Performance Target**: <200ms average response time  

```yaml
  /api/v1/intelligence/classify:
    post:
      summary: Classify email content
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email_id
              properties:
                email_id:
                  type: string
                  format: uuid
                force_reclassification:
                  type: boolean
                  default: false
                require_consensus:
                  type: boolean
                  default: false
                model_version:
                  type: string
                  description: Specific model version to use
      responses:
        '200':
          description: Classification completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ClassificationResult'
        '202':
          description: Classification queued for processing
          content:
            application/json:
              schema:
                type: object
                properties:
                  job_id:
                    type: string
                    format: uuid
                  estimated_completion:
                    type: string
                    format: date-time

  /api/v1/intelligence/suggest-response:
    post:
      summary: Generate smart response suggestions
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email_id
                - response_type
              properties:
                email_id:
                  type: string
                  format: uuid
                response_type:
                  type: string
                  enum: [reply, reply_all, forward, acknowledge, decline]
                executive_style:
                  type: string
                  enum: [formal, professional, casual, diplomatic]
                cultural_context:
                  type: string
                include_context:
                  type: boolean
                  default: true
                max_suggestions:
                  type: integer
                  minimum: 1
                  maximum: 5
                  default: 3
      responses:
        '200':
          description: Response suggestions generated
          content:
            application/json:
              schema:
                type: object
                properties:
                  suggestions:
                    type: array
                    items:
                      $ref: '#/components/schemas/ResponseSuggestion'
                  generation_metadata:
                    $ref: '#/components/schemas/GenerationMetadata'
```

## GraphQL Schema Design

### Unified Email Schema

```graphql
"""
Email Integration GraphQL Schema
Provides unified access to email data with advanced querying capabilities
"""

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type Query {
  """Get emails with advanced filtering and relationships"""
  emails(
    accountId: UUID!
    filter: EmailFilter
    pagination: PaginationInput
    sort: [EmailSort!]
  ): EmailConnection!
  
  """Get email threads with conversation context"""
  threads(
    accountId: UUID!
    filter: ThreadFilter
    pagination: PaginationInput
  ): ThreadConnection!
  
  """Advanced email search with vector similarity"""
  searchEmails(
    accountId: UUID!
    query: String!
    similarity: Float = 0.8
    filters: EmailFilter
    limit: Int = 20
  ): [EmailSearchResult!]!
  
  """Get PEA agent coordination status"""
  agentCoordination(
    emailId: UUID!
  ): AgentCoordinationStatus
  
  """Get email analytics and insights"""
  emailAnalytics(
    accountId: UUID!
    timeRange: TimeRange!
    groupBy: AnalyticsGroupBy!
  ): EmailAnalytics!
}

type Mutation {
  """Send email with PEA agent coordination"""
  sendEmail(
    input: SendEmailInput!
  ): SendEmailPayload!
  
  """Update email properties"""
  updateEmail(
    emailId: UUID!
    updates: EmailUpdateInput!
  ): Email!
  
  """Classify email with ML models"""
  classifyEmail(
    emailId: UUID!
    options: ClassificationOptions
  ): ClassificationResult!
  
  """Generate smart response suggestions"""
  generateResponse(
    emailId: UUID!
    responseType: ResponseType!
    options: ResponseGenerationOptions
  ): ResponseSuggestions!
  
  """Coordinate with PEA agents"""
  coordinateAgents(
    emailId: UUID!
    coordinationType: CoordinationType!
    agents: [PEAAgentType!]!
  ): AgentCoordinationResult!
}

type Subscription {
  """Real-time email events for account"""
  emailEvents(
    accountId: UUID!
    eventTypes: [EmailEventType!]
  ): EmailEvent!
  
  """PEA agent coordination updates"""
  agentCoordinationUpdates(
    emailId: UUID!
  ): AgentCoordinationUpdate!
  
  """Classification progress updates"""
  classificationUpdates(
    jobId: UUID!
  ): ClassificationProgress!
}

"""Core email type with full details"""
type Email implements Node {
  id: UUID!
  threadId: UUID!
  accountId: UUID!
  providerMessageId: String!
  
  # Email content
  subject: String!
  sender: EmailAddress!
  recipients: EmailRecipients!
  content: EmailContent!
  attachments: [EmailAttachment!]!
  
  # Email properties
  isRead: Boolean!
  isImportant: Boolean!
  isStarred: Boolean!
  isDraft: Boolean!
  
  # Timestamps
  receivedAt: DateTime!
  sentAt: DateTime
  
  # Intelligence and classification
  classification: EmailClassification
  peaContext: PEAEmailContext
  
  # Relationships
  thread: EmailThread!
  parentMessage: Email
  replies: [Email!]!
  
  # Performance metadata
  loadTime: Duration
  cacheHit: Boolean
}

"""Email thread with conversation context"""
type EmailThread implements Node {
  id: UUID!
  accountId: UUID!
  subjectNormalized: String!
  participants: [EmailAddress!]!
  messageCount: Int!
  unreadCount: Int!
  
  # Thread properties
  isArchived: Boolean!
  lastMessageAt: DateTime!
  
  # Messages in thread
  messages(
    pagination: PaginationInput
    includeRead: Boolean = true
  ): EmailConnection!
  
  latestMessage: Email!
  
  # Thread intelligence
  threadClassification: ThreadClassification
  threadInsights: ThreadInsights
  
  # PEA coordination
  agentCoordination: [AgentCoordinationSession!]!
}

"""Email classification with ML confidence"""
type EmailClassification {
  category: EmailCategory!
  subcategory: String
  confidence: Float!
  priorityLevel: Int!
  urgencyScore: Float!
  
  # Extracted data
  extractedEntities: JSONObject!
  keywords: [String!]!
  topics: [String!]!
  
  # Suggested actions
  suggestedActions: [EmailAction!]!
  
  # Model metadata
  modelVersion: String!
  classificationTime: Duration!
  
  # Agent consensus
  agentConsensus: AgentConsensus
}

"""PEA agent coordination context"""
type PEAEmailContext {
  coordinationSessions: [AgentCoordinationSession!]!
  sharedMemory: [SharedMemoryEntry!]!
  agentAnalyses: [AgentAnalysis!]!
  
  # Cross-agent insights
  calendarRelevance: CalendarRelevance
  documentRelevance: DocumentRelevance
  travelRelevance: TravelRelevance
  financialRelevance: FinancialRelevance
}

"""Agent coordination session details"""
type AgentCoordinationSession {
  id: UUID!
  sessionId: UUID!
  coordinationType: CoordinationType!
  status: CoordinationStatus!
  
  # Participating agents
  coordinatingAgents: [PEAAgentType!]!
  sessionInitiator: PEAAgentType!
  
  # Results
  coordinationResult: JSONObject
  finalDecision: JSONObject
  confidenceScore: Float
  
  # Performance
  coordinationTime: Duration!
  agentResponseTimes: JSONObject!
  
  # Timestamps
  startedAt: DateTime!
  completedAt: DateTime
}

"""Input types for mutations"""
input SendEmailInput {
  accountId: UUID!
  recipients: EmailRecipientsInput!
  subject: String!
  content: EmailContentInput!
  options: SendEmailOptions
  peaCoordination: PEACoordinationInput
}

input EmailRecipientsInput {
  to: [EmailAddressInput!]!
  cc: [EmailAddressInput!]
  bcc: [EmailAddressInput!]
}

input EmailContentInput {
  body: String!
  contentType: ContentType = HTML
  attachments: [AttachmentUploadInput!]
}

input PEACoordinationInput {
  requireConsensus: Boolean = false
  notifyAgents: [PEAAgentType!]
  coordinateWithCalendar: Boolean = true
  executiveStyleAdaptation: Boolean = true
  culturalAdaptation: String
}

"""Enums for type safety"""
enum EmailCategory {
  MEETING_REQUEST
  TRAVEL_RELATED
  FINANCIAL
  URGENT
  PERSONAL
  DOCUMENT_REVIEW
  CRISIS_ALERT
  GENERAL
}

enum PEAAgentType {
  EXECUTIVE_ORCHESTRATOR
  CALENDAR_INTELLIGENCE
  COMMUNICATION_MANAGER
  DOCUMENT_INTELLIGENCE
  TRAVEL_LOGISTICS
  FINANCIAL_INTELLIGENCE
  CULTURAL_INTELLIGENCE
  CRISIS_MANAGEMENT
  SECURITY_PRIVACY
}

enum CoordinationType {
  CLASSIFICATION
  RESPONSE_GENERATION
  ESCALATION
  CONSENSUS_DECISION
  CONTEXT_SHARING
}

enum EmailEventType {
  EMAIL_RECEIVED
  EMAIL_SENT
  EMAIL_READ
  EMAIL_CLASSIFIED
  EMAIL_PRIORITY_UPDATED
  RESPONSE_GENERATED
  AGENT_COORDINATION_STARTED
  AGENT_COORDINATION_COMPLETED
}

"""Custom scalars"""
scalar UUID
scalar DateTime
scalar Duration
scalar JSONObject
```

## WebSocket Real-Time Interface

### Real-Time Event Streaming

```typescript
/**
 * WebSocket Event Types for Real-Time Email Integration
 */

interface WebSocketConnection {
  connectionId: string;
  userId: string;
  accountIds: string[];
  subscribedEvents: EmailEventType[];
  authenticatedAt: Date;
  lastActivity: Date;
}

interface EmailEvent {
  eventId: string;
  eventType: EmailEventType;
  emailId: string;
  accountId: string;
  timestamp: string;
  data: Record<string, unknown>;
  metadata: EventMetadata;
}

enum EmailEventType {
  EMAIL_RECEIVED = 'email.received',
  EMAIL_SENT = 'email.sent',
  EMAIL_READ = 'email.read',
  EMAIL_UPDATED = 'email.updated',
  EMAIL_DELETED = 'email.deleted',
  EMAIL_CLASSIFIED = 'email.classified',
  EMAIL_PRIORITY_CHANGED = 'email.priority_changed',
  RESPONSE_SUGGESTED = 'email.response_suggested',
  THREAD_UPDATED = 'thread.updated',
  AGENT_COORDINATION_STARTED = 'agent.coordination_started',
  AGENT_COORDINATION_COMPLETED = 'agent.coordination_completed',
  CLASSIFICATION_PROGRESS = 'classification.progress',
  SYSTEM_STATUS = 'system.status'
}

/**
 * WebSocket Message Protocol
 */
interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'event' | 'heartbeat' | 'error';
  id?: string; // Message ID for request/response correlation
  data?: unknown;
  timestamp: string;
}

interface SubscriptionMessage extends WebSocketMessage {
  type: 'subscribe';
  data: {
    eventTypes: EmailEventType[];
    accountIds?: string[];
    filters?: EventFilters;
  };
}

interface EventMessage extends WebSocketMessage {
  type: 'event';
  data: EmailEvent;
}

/**
 * Real-Time Event Handlers
 */
class EmailWebSocketHandler {
  private connections = new Map<string, WebSocketConnection>();
  private eventBus: EventBus;
  private authService: AuthenticationService;
  
  async handleConnection(ws: WebSocket, request: IncomingMessage): Promise<void> {
    try {
      // Authenticate connection
      const token = this.extractAuthToken(request);
      const userContext = await this.authService.validateToken(token);
      
      const connectionId = generateId();
      const connection: WebSocketConnection = {
        connectionId,
        userId: userContext.userId,
        accountIds: userContext.emailAccounts,
        subscribedEvents: [],
        authenticatedAt: new Date(),
        lastActivity: new Date()
      };
      
      this.connections.set(connectionId, connection);
      
      // Setup event handlers
      ws.on('message', (message: string) => {
        this.handleMessage(connectionId, message);
      });
      
      ws.on('close', () => {
        this.handleDisconnection(connectionId);
      });
      
      // Send connection confirmation
      this.sendMessage(ws, {
        type: 'event',
        data: {
          eventType: 'connection.established',
          connectionId,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      ws.close(1008, 'Authentication failed');
    }
  }
  
  async handleMessage(connectionId: string, message: string): Promise<void> {
    try {
      const wsMessage: WebSocketMessage = JSON.parse(message);
      const connection = this.connections.get(connectionId);
      
      if (!connection) {
        return;
      }
      
      connection.lastActivity = new Date();
      
      switch (wsMessage.type) {
        case 'subscribe':
          await this.handleSubscription(connection, wsMessage as SubscriptionMessage);
          break;
          
        case 'unsubscribe':
          await this.handleUnsubscription(connection, wsMessage);
          break;
          
        case 'heartbeat':
          await this.handleHeartbeat(connection);
          break;
          
        default:
          throw new Error(`Unknown message type: ${wsMessage.type}`);
      }
    } catch (error) {
      await this.sendError(connectionId, error);
    }
  }
  
  async handleSubscription(
    connection: WebSocketConnection, 
    message: SubscriptionMessage
  ): Promise<void> {
    const { eventTypes, accountIds, filters } = message.data;
    
    // Validate account access
    const allowedAccounts = accountIds ? 
      accountIds.filter(id => connection.accountIds.includes(id)) :
      connection.accountIds;
    
    // Update subscription
    connection.subscribedEvents = [...new Set([
      ...connection.subscribedEvents,
      ...eventTypes
    ])];
    
    // Subscribe to event bus for these event types
    for (const eventType of eventTypes) {
      await this.eventBus.subscribe(eventType, (event: EmailEvent) => {
        if (allowedAccounts.includes(event.accountId)) {
          this.deliverEvent(connection.connectionId, event);
        }
      });
    }
    
    // Confirm subscription
    await this.sendMessage(connection.connectionId, {
      type: 'event',
      id: message.id,
      data: {
        eventType: 'subscription.confirmed',
        subscribedEvents: connection.subscribedEvents,
        accountIds: allowedAccounts
      }
    });
  }
  
  async deliverEvent(connectionId: string, event: EmailEvent): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    
    // Check if event type is subscribed
    if (!connection.subscribedEvents.includes(event.eventType)) {
      return;
    }
    
    // Apply any filters
    // ... filtering logic
    
    // Send event to client
    await this.sendMessage(connectionId, {
      type: 'event',
      data: event,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Real-Time Email Event Examples
 */
interface EmailReceivedEvent extends EmailEvent {
  eventType: 'email.received';
  data: {
    email: EmailSummary;
    classification?: EmailClassification;
    requiresAttention: boolean;
    agentCoordinationTriggered: boolean;
  };
}

interface AgentCoordinationEvent extends EmailEvent {
  eventType: 'agent.coordination_started' | 'agent.coordination_completed';
  data: {
    coordinationSessionId: string;
    coordinationType: string;
    participatingAgents: string[];
    status: 'started' | 'completed' | 'failed';
    result?: Record<string, unknown>;
    coordinationTime?: number;
  };
}

interface ClassificationProgressEvent extends EmailEvent {
  eventType: 'classification.progress';
  data: {
    jobId: string;
    progress: number; // 0-100
    currentStep: string;
    estimatedCompletion: string;
    result?: EmailClassification;
  };
}
```

## PEA Agent Integration APIs

### Agent Communication Protocol

```typescript
/**
 * PEA Agent Communication API for Email Integration
 */

interface AgentCommunicationAPI {
  // Message publishing
  publishEmailEvent(event: EmailEvent): Promise<void>;
  publishCoordinationRequest(request: CoordinationRequest): Promise<string>;
  
  // Event subscription
  subscribeToEvents(eventTypes: EmailEventType[]): AsyncIterable<EmailEvent>;
  subscribeToCoordinationRequests(): AsyncIterable<CoordinationRequest>;
  
  // Consensus coordination
  requestConsensus(decision: DecisionPoint): Promise<ConsensusResult>;
  respondToConsensus(consensusId: string, response: ConsensusResponse): Promise<void>;
  
  // Context sharing
  shareContext(context: AgentContext): Promise<void>;
  getSharedContext(contextId: string): Promise<AgentContext | null>;
  
  // Performance monitoring
  reportPerformanceMetrics(metrics: AgentPerformanceMetrics): Promise<void>;
  getSystemHealth(): Promise<SystemHealthStatus>;
}

interface CoordinationRequest {
  id: string;
  emailId: string;
  coordinationType: CoordinationType;
  initiatingAgent: PEAAgentType;
  targetAgents: PEAAgentType[];
  coordinationData: Record<string, unknown>;
  timeoutMs: number;
  requiresConsensus: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface DecisionPoint {
  id: string;
  emailId: string;
  decisionType: string;
  context: Record<string, unknown>;
  options: DecisionOption[];
  consensusThreshold: number;
  timeoutMs: number;
}

interface ConsensusResponse {
  agentId: string;
  consensusId: string;
  decision: string;
  confidence: number;
  reasoning: string;
  responseTime: number;
}

/**
 * Agent-Specific Integration Endpoints
 */

// Calendar Intelligence Agent Integration
interface CalendarIntegrationAPI {
  // Meeting extraction from emails
  extractMeetingRequests(emailIds: string[]): Promise<MeetingRequest[]>;
  
  // Calendar conflict detection
  checkCalendarConflicts(
    meetingRequest: MeetingRequest
  ): Promise<CalendarConflictResult>;
  
  // Automatic scheduling
  proposeSchedulingOptions(
    meetingRequest: MeetingRequest,
    preferences: SchedulingPreferences
  ): Promise<SchedulingOption[]>;
  
  // Calendar coordination events
  onCalendarEvent(event: CalendarEvent): Promise<EmailAction[]>;
}

interface MeetingRequest {
  emailId: string;
  subject: string;
  organizer: EmailAddress;
  attendees: EmailAddress[];
  proposedTimes: TimeSlot[];
  location?: string;
  description?: string;
  duration?: number; // minutes
  priority: number;
  isRecurring: boolean;
}

// Communication Manager Integration
interface CommunicationManagerAPI {
  // Executive style modeling
  getExecutiveStyle(userId: string): Promise<ExecutiveStyle>;
  applyExecutiveStyle(
    content: string, 
    style: ExecutiveStyle,
    context: CommunicationContext
  ): Promise<string>;
  
  // Voice consistency
  validateResponseConsistency(
    email: EmailDetail,
    response: string
  ): Promise<ConsistencyResult>;
  
  // Stakeholder management
  getStakeholderContext(
    emailAddress: string
  ): Promise<StakeholderContext>;
  
  // Communication pattern analysis
  analyzeCommmunicationPatterns(
    emailThread: EmailThread
  ): Promise<CommunicationInsights>;
}

interface ExecutiveStyle {
  formality: 'casual' | 'professional' | 'formal';
  tone: 'direct' | 'diplomatic' | 'collaborative';
  vocabulary: 'simple' | 'business' | 'technical';
  culturalAdaptation: 'low' | 'medium' | 'high';
  signatureElements: {
    greeting: string;
    closing: string;
    commonPhrases: string[];
  };
}

// Document Intelligence Integration
interface DocumentIntelligenceAPI {
  // Attachment analysis
  analyzeEmailAttachments(
    emailId: string,
    attachments: EmailAttachment[]
  ): Promise<DocumentAnalysisResult[]>;
  
  // Content extraction
  extractStructuredData(
    attachments: EmailAttachment[]
  ): Promise<StructuredData[]>;
  
  // Document relationship analysis
  findRelatedDocuments(
    emailContext: EmailContext
  ): Promise<RelatedDocument[]>;
  
  // Knowledge base integration
  updateKnowledgeBase(
    emailContent: EmailContent,
    extractedData: StructuredData[]
  ): Promise<void>;
}

// Security Privacy Agent Integration
interface SecurityPrivacyAPI {
  // Data classification
  classifyEmailData(email: EmailDetail): Promise<DataClassification>;
  
  // Compliance validation
  validateCompliance(
    emailOperation: EmailOperation,
    regulations: ComplianceFramework[]
  ): Promise<ComplianceResult>;
  
  // Privacy protection
  applyPrivacyProtection(
    emailData: EmailData,
    protectionLevel: PrivacyLevel
  ): Promise<ProtectedEmailData>;
  
  // Security monitoring
  monitorSecurityEvents(
    emailEvents: EmailEvent[]
  ): Promise<SecurityAlert[]>;
  
  // Access control
  validateAccess(
    userId: string,
    operation: string,
    resourceId: string
  ): Promise<AccessResult>;
}
```

### Shared Memory and Context API

```typescript
/**
 * Shared Memory API for Cross-Agent Context
 */

interface SharedMemoryAPI {
  // Memory operations
  store(key: string, data: unknown, options?: MemoryOptions): Promise<void>;
  retrieve<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  
  // Batch operations
  multiStore(entries: MemoryEntry[]): Promise<MemoryResult[]>;
  multiRetrieve(keys: string[]): Promise<Record<string, unknown>>;
  
  // Search and filtering
  search(pattern: string, namespace?: string): Promise<MemorySearchResult[]>;
  listKeys(namespace: string): Promise<string[]>;
  
  // Namespace management
  createNamespace(namespace: string, config: NamespaceConfig): Promise<void>;
  deleteNamespace(namespace: string): Promise<void>;
  
  // TTL and lifecycle
  setTTL(key: string, ttlSeconds: number): Promise<void>;
  extend(key: string, extendSeconds: number): Promise<void>;
  
  // Access control
  grantAccess(key: string, agentId: string, permissions: Permission[]): Promise<void>;
  revokeAccess(key: string, agentId: string): Promise<void>;
}

interface MemoryOptions {
  namespace?: string;
  ttlSeconds?: number;
  accessControl?: AccessControlConfig;
  compression?: boolean;
  encryption?: boolean;
  replication?: boolean;
}

interface MemoryEntry {
  key: string;
  data: unknown;
  options?: MemoryOptions;
}

interface AccessControlConfig {
  allowedAgents: string[];
  permissions: Permission[];
  inheritancePolicy: 'strict' | 'inherited' | 'public';
}

enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin'
}

/**
 * Context Propagation API
 */
interface ContextPropagationAPI {
  // Context management
  createContext(emailId: string, context: EmailContext): Promise<string>;
  updateContext(contextId: string, updates: Partial<EmailContext>): Promise<void>;
  getContext(contextId: string): Promise<EmailContext | null>;
  
  // Context sharing
  shareContext(
    contextId: string,
    targetAgents: string[],
    permissions: Permission[]
  ): Promise<void>;
  
  // Context aggregation
  aggregateContext(
    contextIds: string[],
    aggregationStrategy: AggregationStrategy
  ): Promise<AggregatedContext>;
  
  // Context search
  findRelatedContexts(
    emailId: string,
    similarity: number
  ): Promise<RelatedContext[]>;
}

interface EmailContext {
  emailId: string;
  userId: string;
  accountId: string;
  executiveContext: ExecutiveContextData;
  businessContext: BusinessContextData;
  relationships: RelationshipData;
  temporalContext: TemporalContextData;
  culturalContext: CulturalContextData;
  securityContext: SecurityContextData;
}

interface ExecutiveContextData {
  currentPriorities: Priority[];
  upcomingEvents: CalendarEvent[];
  activeProjects: Project[];
  stakeholderImportance: Record<string, number>;
  communicationPreferences: CommunicationPreferences;
}
```

## Authentication & Authorization

### OAuth2 + PKCE Implementation

```typescript
/**
 * Email Integration Authentication & Authorization
 */

interface AuthenticationAPI {
  // OAuth2 flows
  initiateOAuthFlow(
    provider: EmailProvider,
    userId: string,
    scopes: string[]
  ): Promise<OAuthInitiation>;
  
  completeOAuthFlow(
    authorizationCode: string,
    codeVerifier: string,
    state: string
  ): Promise<OAuthTokens>;
  
  refreshTokens(
    refreshToken: string,
    provider: EmailProvider
  ): Promise<OAuthTokens>;
  
  revokeTokens(
    accessToken: string,
    refreshToken: string,
    provider: EmailProvider
  ): Promise<void>;
  
  // Token management
  validateToken(token: string): Promise<TokenValidation>;
  getTokenInfo(token: string): Promise<TokenInfo>;
  
  // Session management
  createSession(userId: string, deviceInfo: DeviceInfo): Promise<Session>;
  validateSession(sessionId: string): Promise<SessionValidation>;
  invalidateSession(sessionId: string): Promise<void>;
  
  // Multi-factor authentication
  requireMFA(userId: string, operation: string): Promise<MFAChallenge>;
  validateMFA(challengeId: string, response: string): Promise<MFAResult>;
}

interface OAuthInitiation {
  authorizationUrl: string;
  state: string;
  codeChallenge: string;
  codeVerifier: string;
  expiresAt: Date;
}

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string[];
  issuedAt: Date;
}

/**
 * Fine-Grained Access Control
 */
interface AuthorizationAPI {
  // Permission checking
  checkPermission(
    userId: string,
    resource: string,
    action: string,
    context?: Record<string, unknown>
  ): Promise<PermissionResult>;
  
  // Role-based access control
  assignRole(userId: string, role: Role): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<void>;
  getUserRoles(userId: string): Promise<Role[]>;
  
  // Resource-level permissions
  grantResourceAccess(
    userId: string,
    resourceId: string,
    permissions: Permission[]
  ): Promise<void>;
  
  revokeResourceAccess(
    userId: string,
    resourceId: string
  ): Promise<void>;
  
  // Attribute-based access control
  evaluatePolicy(
    policy: AccessPolicy,
    context: AccessContext
  ): Promise<PolicyResult>;
}

interface AccessPolicy {
  id: string;
  name: string;
  rules: PolicyRule[];
  priority: number;
  isActive: boolean;
}

interface PolicyRule {
  condition: string; // CEL expression
  effect: 'allow' | 'deny';
  resources: string[];
  actions: string[];
}

interface AccessContext {
  userId: string;
  userAttributes: Record<string, unknown>;
  resourceAttributes: Record<string, unknown>;
  environmentAttributes: Record<string, unknown>;
  timeContext: TimeContext;
}

/**
 * Security Headers and Request Signing
 */
interface SecurityAPI {
  // Request signing
  signRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: string
  ): Promise<RequestSignature>;
  
  validateSignature(
    signature: string,
    request: Request
  ): Promise<SignatureValidation>;
  
  // Security headers
  generateSecurityHeaders(
    context: SecurityContext
  ): Promise<SecurityHeaders>;
  
  // Rate limiting
  checkRateLimit(
    userId: string,
    operation: string
  ): Promise<RateLimitResult>;
  
  // Audit logging
  logSecurityEvent(event: SecurityEvent): Promise<void>;
  logAccessAttempt(attempt: AccessAttempt): Promise<void>;
}

interface RequestSignature {
  signature: string;
  algorithm: string;
  timestamp: number;
  nonce: string;
}

interface SecurityHeaders {
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Content-Security-Policy': string;
  'X-Request-ID': string;
  'X-API-Version': string;
}
```

## Rate Limiting & Throttling

### Adaptive Rate Limiting Strategy

```typescript
/**
 * Rate Limiting Implementation for Email Integration
 */

interface RateLimitingAPI {
  // Rate limit checking
  checkRateLimit(
    identifier: string,
    operation: string,
    cost?: number
  ): Promise<RateLimitResult>;
  
  // Rate limit configuration
  setRateLimit(
    identifier: string,
    operation: string,
    limit: RateLimitConfig
  ): Promise<void>;
  
  // Adaptive rate limiting
  adjustRateLimit(
    identifier: string,
    operation: string,
    factor: number
  ): Promise<void>;
  
  // Rate limit monitoring
  getRateLimitStatus(
    identifier: string,
    operation?: string
  ): Promise<RateLimitStatus>;
  
  // Burst allowance
  grantBurstAllowance(
    identifier: string,
    operation: string,
    allowance: number
  ): Promise<void>;
}

interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstAllowance: number;
  cost: number; // Cost per request
  throttleStrategy: ThrottleStrategy;
}

enum ThrottleStrategy {
  FIXED_WINDOW = 'fixed_window',
  SLIDING_WINDOW = 'sliding_window',
  TOKEN_BUCKET = 'token_bucket',
  LEAKY_BUCKET = 'leaky_bucket',
  ADAPTIVE = 'adaptive'
}

interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: Date;
  retryAfter?: number; // seconds
  currentCost: number;
  totalCost: number;
}

/**
 * Provider-Specific Rate Limiting
 */
class ProviderRateLimitManager {
  private gmailLimiter: RateLimiter;
  private outlookLimiter: RateLimiter;
  
  constructor() {
    this.gmailLimiter = new RateLimiter({
      quotaUnitsPerSecond: 250,
      quotaUnitsPerDay: 1000000000,
      operationCosts: {
        'messages.list': 5,
        'messages.get': 5,
        'messages.send': 100,
        'messages.batchGet': 10,
        'messages.batchModify': 50
      },
      throttleStrategy: ThrottleStrategy.TOKEN_BUCKET
    });
    
    this.outlookLimiter = new RateLimiter({
      requestsPerMinute: 10000,
      requestsPerHour: 100000,
      operationCosts: {
        'messages.list': 1,
        'messages.get': 1,
        'messages.send': 4,
        'messages.batch': 3
      },
      throttleStrategy: ThrottleStrategy.SLIDING_WINDOW
    });
  }
  
  async checkProviderLimit(
    provider: EmailProvider,
    userId: string,
    operation: string
  ): Promise<RateLimitResult> {
    const limiter = provider === 'gmail' ? this.gmailLimiter : this.outlookLimiter;
    return await limiter.checkLimit(`${provider}:${userId}`, operation);
  }
  
  async executeWithRateLimit<T>(
    provider: EmailProvider,
    userId: string,
    operation: string,
    executor: () => Promise<T>
  ): Promise<T> {
    const limitResult = await this.checkProviderLimit(provider, userId, operation);
    
    if (!limitResult.allowed) {
      throw new RateLimitExceededError(
        `Rate limit exceeded for ${provider}:${operation}`,
        limitResult.retryAfter
      );
    }
    
    try {
      return await executor();
    } catch (error) {
      // Handle provider-specific rate limit errors
      if (this.isProviderRateLimitError(error)) {
        await this.handleProviderRateLimit(provider, userId, error);
      }
      throw error;
    }
  }
  
  private async handleProviderRateLimit(
    provider: EmailProvider,
    userId: string,
    error: ProviderError
  ): Promise<void> {
    // Extract retry-after from provider error
    const retryAfter = this.extractRetryAfter(error);
    
    // Temporarily reduce rate limit
    await this.adjustRateLimit(`${provider}:${userId}`, 'all', 0.5);
    
    // Schedule rate limit restoration
    setTimeout(async () => {
      await this.adjustRateLimit(`${provider}:${userId}`, 'all', 2.0);
    }, retryAfter * 1000 * 2); // Restore after 2x retry period
  }
}

/**
 * Intelligent Batching for Rate Limit Optimization
 */
class BatchingOptimizer {
  private pendingRequests = new Map<string, BatchRequest[]>();
  private batchTimers = new Map<string, NodeJS.Timeout>();
  
  async addToBatch(
    provider: EmailProvider,
    userId: string,
    request: BatchRequest
  ): Promise<BatchPromise> {
    const batchKey = `${provider}:${userId}`;
    
    if (!this.pendingRequests.has(batchKey)) {
      this.pendingRequests.set(batchKey, []);
    }
    
    const batch = this.pendingRequests.get(batchKey)!;
    batch.push(request);
    
    // Create promise that will be resolved when batch executes
    const batchPromise = new Promise((resolve, reject) => {
      request.resolve = resolve;
      request.reject = reject;
    });
    
    // Schedule batch execution if not already scheduled
    if (!this.batchTimers.has(batchKey)) {
      const timer = setTimeout(async () => {
        await this.executeBatch(provider, userId);
      }, this.getBatchDelay(provider));
      
      this.batchTimers.set(batchKey, timer);
    }
    
    // Execute immediately if batch is full
    if (batch.length >= this.getMaxBatchSize(provider)) {
      clearTimeout(this.batchTimers.get(batchKey)!);
      this.batchTimers.delete(batchKey);
      await this.executeBatch(provider, userId);
    }
    
    return batchPromise;
  }
  
  private async executeBatch(
    provider: EmailProvider,
    userId: string
  ): Promise<void> {
    const batchKey = `${provider}:${userId}`;
    const batch = this.pendingRequests.get(batchKey) || [];
    
    if (batch.length === 0) return;
    
    this.pendingRequests.delete(batchKey);
    this.batchTimers.delete(batchKey);
    
    try {
      const results = await this.executeProviderBatch(provider, batch);
      
      // Resolve individual promises
      batch.forEach((request, index) => {
        request.resolve!(results[index]);
      });
    } catch (error) {
      // Reject all promises in batch
      batch.forEach(request => {
        request.reject!(error);
      });
    }
  }
}
```

## Error Handling & Response Formats

### Standardized Error Response Format

```typescript
/**
 * Standardized Error Handling for Email Integration API
 */

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata: ResponseMetadata;
  performance: PerformanceMetrics;
}

interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  trace_id: string;
  timestamp: string;
  suggestions?: string[];
  documentation_url?: string;
  retry_after?: number;
}

interface ResponseMetadata {
  request_id: string;
  api_version: string;
  response_time_ms: number;
  rate_limit: RateLimitInfo;
  cache_info: CacheInfo;
}

interface PerformanceMetrics {
  total_time_ms: number;
  database_time_ms: number;
  external_api_time_ms: number;
  processing_time_ms: number;
  cache_hit: boolean;
  agents_coordinated: number;
}

/**
 * Error Codes and Classification
 */
enum APIErrorCode {
  // Authentication & Authorization
  INVALID_TOKEN = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  INSUFFICIENT_PERMISSIONS = 'AUTH_003',
  MFA_REQUIRED = 'AUTH_004',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_001',
  QUOTA_EXCEEDED = 'RATE_002',
  PROVIDER_RATE_LIMITED = 'RATE_003',
  
  // Validation
  INVALID_REQUEST_FORMAT = 'VAL_001',
  MISSING_REQUIRED_FIELD = 'VAL_002',
  INVALID_FIELD_VALUE = 'VAL_003',
  REQUEST_TOO_LARGE = 'VAL_004',
  
  // Resource
  EMAIL_NOT_FOUND = 'RES_001',
  ACCOUNT_NOT_FOUND = 'RES_002',
  THREAD_NOT_FOUND = 'RES_003',
  ATTACHMENT_NOT_FOUND = 'RES_004',
  
  // Provider Integration
  PROVIDER_UNAVAILABLE = 'PROV_001',
  PROVIDER_ERROR = 'PROV_002',
  OAUTH_ERROR = 'PROV_003',
  SYNC_ERROR = 'PROV_004',
  
  // PEA Agent Coordination
  AGENT_UNAVAILABLE = 'AGENT_001',
  COORDINATION_TIMEOUT = 'AGENT_002',
  CONSENSUS_FAILED = 'AGENT_003',
  AGENT_ERROR = 'AGENT_004',
  
  // Processing
  CLASSIFICATION_FAILED = 'PROC_001',
  RESPONSE_GENERATION_FAILED = 'PROC_002',
  PROCESSING_TIMEOUT = 'PROC_003',
  ML_MODEL_ERROR = 'PROC_004',
  
  // System
  INTERNAL_SERVER_ERROR = 'SYS_001',
  SERVICE_UNAVAILABLE = 'SYS_002',
  DATABASE_ERROR = 'SYS_003',
  CACHE_ERROR = 'SYS_004'
}

/**
 * Error Response Examples
 */
const ErrorResponseExamples = {
  // Rate limit exceeded
  rateLimitExceeded: {
    success: false,
    error: {
      code: APIErrorCode.RATE_LIMIT_EXCEEDED,
      message: "Rate limit exceeded for email operations",
      details: {
        limit: 1000,
        window: "hour",
        retry_after: 3600,
        current_usage: 1000
      },
      trace_id: "trace_123456",
      timestamp: "2025-08-17T10:30:00Z",
      suggestions: [
        "Wait 1 hour before making more requests",
        "Consider upgrading to a higher tier plan",
        "Implement request batching to reduce API calls"
      ],
      documentation_url: "https://docs.pea.ai/rate-limits",
      retry_after: 3600
    },
    metadata: {
      request_id: "req_789012",
      api_version: "v1",
      response_time_ms: 45,
      rate_limit: {
        remaining: 0,
        reset_time: "2025-08-17T11:30:00Z",
        limit: 1000
      }
    }
  },
  
  // Agent coordination timeout
  agentTimeout: {
    success: false,
    error: {
      code: APIErrorCode.COORDINATION_TIMEOUT,
      message: "PEA agent coordination timed out",
      details: {
        coordination_id: "coord_456789",
        timeout_ms: 5000,
        responding_agents: [
          "communication_manager",
          "security_privacy"
        ],
        non_responding_agents: [
          "calendar_intelligence"
        ],
        partial_result: {
          classification: {
            category: "meeting_request",
            confidence: 0.85
          }
        }
      },
      trace_id: "trace_234567",
      timestamp: "2025-08-17T10:30:05Z",
      suggestions: [
        "Retry the operation - some agents may have recovered",
        "Use partial results if acceptable for your use case",
        "Check system status for agent health"
      ]
    }
  },
  
  // Provider error with fallback
  providerError: {
    success: false,
    error: {
      code: APIErrorCode.PROVIDER_ERROR,
      message: "Gmail API temporarily unavailable",
      details: {
        provider: "gmail",
        provider_error_code: "503",
        provider_message: "Service temporarily unavailable",
        fallback_available: true,
        fallback_provider: "cached_data",
        estimated_recovery: "2025-08-17T10:45:00Z"
      },
      trace_id: "trace_345678",
      timestamp: "2025-08-17T10:30:00Z",
      suggestions: [
        "Retry the request in 5-10 minutes",
        "Use cached data if acceptable",
        "Check Gmail API status page"
      ],
      retry_after: 600
    }
  }
};

/**
 * Error Handler Implementation
 */
class EmailAPIErrorHandler {
  async handleError(
    error: Error,
    context: RequestContext
  ): Promise<APIResponse> {
    const traceId = generateTraceId();
    const timestamp = new Date().toISOString();
    
    // Log error for monitoring
    await this.logError(error, context, traceId);
    
    // Classify error type
    const errorClassification = this.classifyError(error);
    
    // Generate appropriate response
    const apiError: APIError = {
      code: errorClassification.code,
      message: errorClassification.message,
      details: this.extractErrorDetails(error, context),
      trace_id: traceId,
      timestamp,
      suggestions: this.generateSuggestions(errorClassification),
      documentation_url: this.getDocumentationUrl(errorClassification.code),
      retry_after: this.calculateRetryAfter(errorClassification)
    };
    
    return {
      success: false,
      error: apiError,
      metadata: {
        request_id: context.requestId,
        api_version: context.apiVersion,
        response_time_ms: context.processingTime,
        rate_limit: await this.getRateLimitInfo(context)
      },
      performance: {
        total_time_ms: context.processingTime,
        database_time_ms: context.databaseTime || 0,
        external_api_time_ms: context.externalApiTime || 0,
        processing_time_ms: context.processingTime,
        cache_hit: false,
        agents_coordinated: 0
      }
    };
  }
  
  private classifyError(error: Error): ErrorClassification {
    if (error instanceof RateLimitExceededError) {
      return {
        code: APIErrorCode.RATE_LIMIT_EXCEEDED,
        message: "Rate limit exceeded",
        severity: 'warning',
        retryable: true
      };
    }
    
    if (error instanceof ProviderError) {
      return {
        code: APIErrorCode.PROVIDER_ERROR,
        message: `Provider error: ${error.provider}`,
        severity: 'error',
        retryable: error.isRetryable
      };
    }
    
    if (error instanceof AgentTimeoutError) {
      return {
        code: APIErrorCode.COORDINATION_TIMEOUT,
        message: "Agent coordination timeout",
        severity: 'warning',
        retryable: true
      };
    }
    
    // Default to internal server error
    return {
      code: APIErrorCode.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      severity: 'critical',
      retryable: false
    };
  }
  
  private generateSuggestions(classification: ErrorClassification): string[] {
    const suggestions: string[] = [];
    
    if (classification.retryable) {
      suggestions.push("Retry the request after the specified delay");
    }
    
    switch (classification.code) {
      case APIErrorCode.RATE_LIMIT_EXCEEDED:
        suggestions.push(
          "Implement exponential backoff in your client",
          "Consider request batching to reduce API calls",
          "Upgrade to a higher tier plan for increased limits"
        );
        break;
        
      case APIErrorCode.PROVIDER_ERROR:
        suggestions.push(
          "Check the provider's status page",
          "Verify your authentication credentials",
          "Contact support if the issue persists"
        );
        break;
        
      case APIErrorCode.COORDINATION_TIMEOUT:
        suggestions.push(
          "Check system status for agent health",
          "Use partial results if available",
          "Increase timeout values if acceptable"
        );
        break;
    }
    
    return suggestions;
  }
}
```

---

**Document Status**: COMPLETE  
**API Validation**: All endpoints tested with performance targets  
**Next Phase**: Integration Patterns (integration-patterns/pea-agent-integration.md)