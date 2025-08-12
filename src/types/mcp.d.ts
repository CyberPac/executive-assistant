// Type definitions for Model Context Protocol SDK

// Base transport interface
export interface Transport {
  start(): Promise<void>;
  close(): Promise<void>;
}

export interface RequestParams {
  [key: string]: unknown;
}

export interface ServerResponse {
  [key: string]: unknown;
}

declare module '@modelcontextprotocol/sdk/types.js' {
  export interface Tool {
    name: string;
    description: string;
    inputSchema: {
      type: string;
      properties?: Record<string, unknown>;
      required?: string[];
    };
  }

  export interface CallToolRequest {
    method: string;
    params: {
      name: string;
      arguments?: Record<string, unknown>;
    };
  }

  export interface CallToolResult {
    content: Array<{
      type: string;
      text?: string;
    }>;
    isError?: boolean;
  }

  export interface ListToolsResult {
    tools: Tool[];
  }
}

declare module '@modelcontextprotocol/sdk/server/index.js' {
  import { Transport } from './mcp';

  export class Server {
    constructor();
    setRequestHandler<T>(method: string, handler: (request: T) => Promise<unknown>): void;
    connect(transport: Transport): Promise<void>;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor();
  }
}

declare module '@modelcontextprotocol/sdk/client/index.js' {
  import { Transport, RequestParams, ServerResponse } from './mcp';
  
  export class Client {
    constructor(config: { name: string; version: string });
    connect(transport: Transport): Promise<void>;
    request(method: string, params?: RequestParams): Promise<ServerResponse>;
    close(): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/client/stdio.js' {
  export class StdioClientTransport {
    constructor(config: { command: string; args?: string[]; env?: Record<string, string> });
  }
}
