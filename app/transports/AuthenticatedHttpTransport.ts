/**
 * Custom transport for connecting to MCP servers via HTTP with Entra ID authentication
 * This transport uses the authenticated user's token to connect to the weather MCP server
 * Implements the MCP Streamable HTTP transport specification
 */

import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { JSONRPCMessageSchema } from "@modelcontextprotocol/sdk/types.js";

export interface AuthenticatedHttpTransportOptions {
  /** The access token to use for authentication */
  accessToken: string;
  /** Optional custom headers */
  headers?: Record<string, string>;
}

export class AuthenticatedHttpTransport implements Transport {
  private _url: URL;
  private _accessToken: string;
  private _abortController?: AbortController;
  private _sessionId?: string;
  private _isConnected = false;
  private _endpoint?: URL;

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  constructor(url: string | URL, options: AuthenticatedHttpTransportOptions) {
    this._url = typeof url === 'string' ? new URL(url) : url;
    this._accessToken = options.accessToken;
  }

  async start(): Promise<void> {
    if (this._abortController) {
      throw new Error("Transport already started");
    }
    this._abortController = new AbortController();
    this._isConnected = true;
    
    return new Promise((resolve, reject) => {
      // Use fetch to establish SSE connection with proper authentication
      this._establishSseConnection(resolve, reject);
    });
  }

  private async _establishSseConnection(resolve: () => void, reject: (error: Error) => void): Promise<void> {
    try {
      const response = await fetch(this._url.href, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._accessToken}`,
          'Accept': 'text/event-stream',
          'MCP-Protocol-Version': '2025-06-18',
          'Cache-Control': 'no-cache'
        },
        signal: this._abortController?.signal
      });

      if (!response.ok) {
        throw new Error(`SSE connection failed: HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/event-stream')) {
        throw new Error(`Expected SSE stream, got: ${contentType}`);
      }

      // Handle the SSE stream
      this._handleSseStream(response, resolve, reject);

    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      reject(error as Error);
      this.onerror?.(error as Error);
    }
  }

  private async _handleSseStream(response: Response, resolve: () => void, reject: (error: Error) => void): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) {
      const error = new Error("No response body");
      reject(error);
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let endpointReceived = false;

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('SSE stream ended');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            const eventType = line.slice(7).trim();
            console.log('SSE event type:', eventType);
            continue;
          }
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            console.log('SSE data:', data);
            
            if (data === '' || data === '[DONE]') continue;

            // Check if this is an endpoint event
            if (!endpointReceived && (data.startsWith('/') || data.startsWith('http'))) {
              try {
                this._endpoint = new URL(data, this._url);
                if (this._endpoint.origin !== this._url.origin) {
                  throw new Error(`Endpoint origin does not match connection origin: ${this._endpoint.origin}`);
                }
                console.log('Endpoint discovered:', this._endpoint.toString());
                endpointReceived = true;
                resolve();
                continue;
              } catch (error) {
                console.error('Failed to parse endpoint:', error);
                reject(error as Error);
                return;
              }
            }

            // Try to parse as JSON-RPC message
            try {
              const parsedData = JSON.parse(data);
              const message = JSONRPCMessageSchema.parse(parsedData);
              console.log('Received MCP message:', message);
              this.onmessage?.(message);
            } catch (error) {
              console.warn('Failed to parse JSON-RPC message:', data, error);
              // Don't reject, continue processing other messages
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading SSE stream:', error);
      if (!endpointReceived) {
        reject(error as Error);
      }
      this.onerror?.(error as Error);
    } finally {
      reader.releaseLock();
    }

    // If we haven't received an endpoint after stream ends, that's an error
    if (!endpointReceived) {
      const error = new Error('SSE stream ended without receiving endpoint');
      reject(error);
      this.onerror?.(error);
    }
  }

  async close(): Promise<void> {
    this._isConnected = false;
    this._abortController?.abort();
    this.onclose?.();
  }

  async send(message: JSONRPCMessage): Promise<void> {
    if (!this._endpoint) {
      throw new Error("Not connected - no endpoint available");
    }
    
    if (!this._abortController || !this._isConnected) {
      throw new Error("Transport not started");
    }

    try {
      console.log('Sending MCP message to endpoint:', this._endpoint.toString(), message);
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this._accessToken}`,
        'Content-Type': 'application/json',
        'MCP-Protocol-Version': '2025-06-18'
      };
      
      if (this._sessionId) {
        headers['Mcp-Session-Id'] = this._sessionId;
      }

      const response = await fetch(this._endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(message),
        signal: this._abortController.signal
      });

      console.log('POST response:', { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        if (response.status === 404 && this._sessionId) {
          // Session expired, clear it
          this._sessionId = undefined;
        }
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Check for session ID in response
      const sessionId = response.headers.get('Mcp-Session-Id');
      if (sessionId && !this._sessionId) {
        console.log('Received session ID:', sessionId);
        this._sessionId = sessionId;
      }

    } catch (error) {
      console.error('Error sending message:', error);
      this.onerror?.(error as Error);
      throw error;
    }
  }
}
