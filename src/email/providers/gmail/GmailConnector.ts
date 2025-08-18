/**
 * Gmail API Connector - WBS 1.2.2.1
 * Gmail API integration with OAuth2 authentication
 */

import { OAuth2Manager } from '../../authentication/OAuth2Manager';

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: GmailPayload;
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
}

export interface GmailPayload {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailHeader[];
  body: GmailBody;
  parts?: GmailPayload[];
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailBody {
  attachmentId?: string;
  size: number;
  data?: string;
}

export interface GmailSearchOptions {
  query?: string;
  labelIds?: string[];
  maxResults?: number;
  pageToken?: string;
  includeSpamTrash?: boolean;
}

/**
 * Gmail API Connector
 * Provides Gmail API integration with rate limiting and error handling
 */
export class GmailConnector {
  private authManager: OAuth2Manager;
  private baseUrl = 'https://gmail.googleapis.com/gmail/v1';
  private rateLimitDelay = 100; // ms between requests
  private maxRetries = 3;

  constructor(authManager: OAuth2Manager) {
    this.authManager = authManager;
  }

  /**
   * Get Gmail messages with search options
   */
  async getMessages(
    accountId: string, 
    options: GmailSearchOptions = {}
  ): Promise<{ messages: GmailMessage[]; nextPageToken?: string }> {
    const accessToken = await this.authManager.getValidToken(accountId);
    
    const params = new URLSearchParams({
      maxResults: (options.maxResults || 50).toString(),
      includeSpamTrash: (options.includeSpamTrash || false).toString()
    });

    if (options.query) params.append('q', options.query);
    if (options.labelIds) params.append('labelIds', options.labelIds.join(','));
    if (options.pageToken) params.append('pageToken', options.pageToken);

    const url = `${this.baseUrl}/users/me/messages?${params.toString()}`;
    
    const response = await this.makeRequest(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    // Fetch full message details for each message
    const messages = await Promise.all(
      (data.messages || []).map((msg: { id: string }) => 
        this.getMessage(accountId, msg.id)
      )
    );

    return {
      messages,
      nextPageToken: data.nextPageToken
    };
  }

  /**
   * Get specific Gmail message by ID
   */
  async getMessage(accountId: string, messageId: string): Promise<GmailMessage> {
    const accessToken = await this.authManager.getValidToken(accountId);
    
    const url = `${this.baseUrl}/users/me/messages/${messageId}`;
    
    const response = await this.makeRequest(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return await response.json();
  }

  /**
   * Send email via Gmail API
   */
  async sendMessage(
    accountId: string, 
    to: string[], 
    subject: string, 
    body: string,
    _attachments?: { filename: string; content: Buffer; mimeType: string }[]
  ): Promise<GmailMessage> {
    const accessToken = await this.authManager.getValidToken(accountId);
    
    // Create RFC 2822 formatted message
    let message = '';
    message += `To: ${to.join(', ')}\n`;
    message += `Subject: ${subject}\n`;
    message += `Content-Type: text/html; charset=utf-8\n`;
    message += `\n`;
    message += body;

    // Base64 encode the message
    const encodedMessage = Buffer.from(message).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const url = `${this.baseUrl}/users/me/messages/send`;
    
    const response = await this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: encodedMessage
      })
    });

    return await response.json();
  }

  /**
   * Get Gmail labels
   */
  async getLabels(accountId: string): Promise<{ id: string; name: string; type: string }[]> {
    const accessToken = await this.authManager.getValidToken(accountId);
    
    const url = `${this.baseUrl}/users/me/labels`;
    
    const response = await this.makeRequest(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data.labels || [];
  }

  /**
   * Search emails with advanced query
   */
  async searchEmails(
    accountId: string, 
    query: string, 
    maxResults: number = 50
  ): Promise<GmailMessage[]> {
    const result = await this.getMessages(accountId, {
      query,
      maxResults
    });
    
    return result.messages;
  }

  /**
   * Get thread by ID
   */
  async getThread(accountId: string, threadId: string): Promise<{
    id: string;
    messages: GmailMessage[];
  }> {
    const accessToken = await this.authManager.getValidToken(accountId);
    
    const url = `${this.baseUrl}/users/me/threads/${threadId}`;
    
    const response = await this.makeRequest(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    return await response.json();
  }

  /**
   * Mark message as read/unread
   */
  async markAsRead(accountId: string, messageId: string, read: boolean = true): Promise<void> {
    const accessToken = await this.authManager.getValidToken(accountId);
    
    const url = `${this.baseUrl}/users/me/messages/${messageId}/modify`;
    
    const body = read 
      ? { removeLabelIds: ['UNREAD'] }
      : { addLabelIds: ['UNREAD'] };
    
    await this.makeRequest(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  }

  /**
   * Make HTTP request with rate limiting and retry logic
   */
  private async makeRequest(url: string, options: RequestInit, retryCount = 0): Promise<Response> {
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));

    try {
      const response = await fetch(url, options);
      
      if (response.status === 429 && retryCount < this.maxRetries) {
        // Rate limited - exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Gmail API rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(url, options, retryCount + 1);
      }
      
      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Gmail API request failed, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Extract email content from Gmail payload
   */
  extractEmailContent(payload: GmailPayload): {
    headers: Record<string, string>;
    textContent?: string;
    htmlContent?: string;
  } {
    const headers: Record<string, string> = {};
    payload.headers.forEach(header => {
      headers[header.name.toLowerCase()] = header.value;
    });

    let textContent: string | undefined;
    let htmlContent: string | undefined;

    const extractFromPart = (part: GmailPayload) => {
      if (part.mimeType === 'text/plain' && part.body.data) {
        textContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body.data) {
        htmlContent = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      
      if (part.parts) {
        part.parts.forEach(extractFromPart);
      }
    };

    extractFromPart(payload);

    return {
      headers,
      textContent,
      htmlContent
    };
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { connected: boolean; provider: string } {
    return {
      connected: true,
      provider: 'gmail'
    };
  }
}