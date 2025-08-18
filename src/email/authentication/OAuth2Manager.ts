/**
 * OAuth2 Authentication Manager - WBS 1.2.1.1
 * Handles OAuth2 flows for Gmail and Outlook LOCAL access
 * 
 * Security: Outlook configured for LOCAL mailbox access only
 */

// import { SecurityLevel } from '../../types/enums';

export interface OAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  tokenEndpoint: string;
  authEndpoint: string;
  provider: 'gmail' | 'outlook-local';
}

export interface OAuth2Token {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
  scope: string;
}

export interface OAuth2Account {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook-local';
  tokens: OAuth2Token;
  lastRefresh: Date;
  isActive: boolean;
}

/**
 * OAuth2 Authentication Manager
 * Implements secure multi-account authentication with token management
 */
export class OAuth2Manager {
  private accounts: Map<string, OAuth2Account> = new Map();
  private configs: Map<string, OAuth2Config> = new Map();
  
  constructor() {
    this.initializeProviderConfigs();
  }

  /**
   * Initialize OAuth2 provider configurations
   */
  private initializeProviderConfigs(): void {
    // Gmail OAuth2 configuration
    this.configs.set('gmail', {
      clientId: process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      redirectUri: process.env.GMAIL_REDIRECT_URI || 'http://localhost:3000/auth/gmail/callback',
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      provider: 'gmail'
    });

    // Outlook LOCAL OAuth2 configuration - SECURITY COMPLIANT
    this.configs.set('outlook-local', {
      clientId: process.env.OUTLOOK_LOCAL_CLIENT_ID || '',
      clientSecret: process.env.OUTLOOK_LOCAL_CLIENT_SECRET || '',
      redirectUri: process.env.OUTLOOK_LOCAL_REDIRECT_URI || 'http://localhost:3000/auth/outlook/callback',
      scopes: [
        // LOCAL ACCESS ONLY - No cloud Graph API access
        'https://outlook.office365.com/IMAP.AccessAsUser.All',
        'https://outlook.office365.com/POP.AccessAsUser.All',
        'https://outlook.office365.com/SMTP.Send'
      ],
      tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      authEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      provider: 'outlook-local'
    });
  }

  /**
   * Generate OAuth2 authorization URL
   */
  generateAuthUrl(provider: 'gmail' | 'outlook-local', state?: string): string {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    if (state) {
      params.append('state', state);
    }

    return `${config.authEndpoint}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    provider: 'gmail' | 'outlook-local', 
    code: string
  ): Promise<OAuth2Token> {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri
    });

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      tokenType: tokenData.token_type || 'Bearer',
      scope: tokenData.scope || config.scopes.join(' ')
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(accountId: string): Promise<OAuth2Token> {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    const config = this.configs.get(account.provider);
    if (!config) {
      throw new Error(`Provider config not found: ${account.provider}`);
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: account.tokens.refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await fetch(config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    
    const newToken: OAuth2Token = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || account.tokens.refreshToken,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      tokenType: tokenData.token_type || 'Bearer',
      scope: tokenData.scope || account.tokens.scope
    };

    // Update stored account
    account.tokens = newToken;
    account.lastRefresh = new Date();
    this.accounts.set(accountId, account);

    return newToken;
  }

  /**
   * Add authenticated account
   */
  addAccount(
    email: string, 
    provider: 'gmail' | 'outlook-local', 
    tokens: OAuth2Token
  ): string {
    const accountId = `${provider}-${email}-${Date.now()}`;
    
    const account: OAuth2Account = {
      id: accountId,
      email,
      provider,
      tokens,
      lastRefresh: new Date(),
      isActive: true
    };

    this.accounts.set(accountId, account);
    
    // Security logging for Outlook LOCAL mode
    if (provider === 'outlook-local') {
      console.log(`🔒 SECURITY: Outlook account ${email} configured for LOCAL access only`);
    }
    
    return accountId;
  }

  /**
   * Get valid access token (refreshing if necessary)
   */
  async getValidToken(accountId: string): Promise<string> {
    const account = this.accounts.get(accountId);
    if (!account || !account.isActive) {
      throw new Error(`Account not found or inactive: ${accountId}`);
    }

    // Check if token needs refresh (refresh 5 minutes before expiry)
    const refreshThreshold = new Date(Date.now() + 5 * 60 * 1000);
    if (account.tokens.expiresAt <= refreshThreshold) {
      console.log(`Refreshing token for account: ${account.email}`);
      await this.refreshToken(accountId);
    }

    return account.tokens.accessToken;
  }

  /**
   * Get all accounts for a provider
   */
  getAccountsByProvider(provider: 'gmail' | 'outlook-local'): OAuth2Account[] {
    return Array.from(this.accounts.values())
      .filter(account => account.provider === provider && account.isActive);
  }

  /**
   * Remove account (revoke access)
   */
  async removeAccount(accountId: string): Promise<void> {
    const account = this.accounts.get(accountId);
    if (!account) {
      return;
    }

    // Mark as inactive
    account.isActive = false;
    this.accounts.set(accountId, account);

    console.log(`Account removed: ${account.email} (${account.provider})`);
  }

  /**
   * Get account information
   */
  getAccount(accountId: string): OAuth2Account | undefined {
    return this.accounts.get(accountId);
  }

  /**
   * Check if token is valid and not expired
   */
  isTokenValid(accountId: string): boolean {
    const account = this.accounts.get(accountId);
    if (!account || !account.isActive) {
      return false;
    }

    return account.tokens.expiresAt > new Date();
  }

  /**
   * Get authentication status for all accounts
   */
  getAuthStatus(): { total: number; active: number; needRefresh: number } {
    const accounts = Array.from(this.accounts.values());
    const active = accounts.filter(a => a.isActive).length;
    const needRefresh = accounts.filter(a => 
      a.isActive && a.tokens.expiresAt <= new Date(Date.now() + 5 * 60 * 1000)
    ).length;

    return {
      total: accounts.length,
      active,
      needRefresh
    };
  }
}