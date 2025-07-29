/**
 * React context and hooks for MCP client functionality
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';
import { MCPClientService } from '../services/MCPClientService';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { AuthenticationResult } from '@azure/msal-browser';

interface MCPContextType {
  client: MCPClientService | null;
  isConnected: boolean;
  isConnecting: boolean;
  tools: Tool[];
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  callTool: (toolName: string, arguments_: Record<string, any>) => Promise<any>;
  refreshTools: () => Promise<void>;
}

const MCPContext = createContext<MCPContextType | undefined>(undefined);

interface MCPProviderProps {
  children: ReactNode;
  serverUrl?: string;
}

export function MCPProvider({ children, serverUrl }: MCPProviderProps) {
  // Use environment variable or provided serverUrl or fallback
  const mcpServerUrl = serverUrl || import.meta.env.VITE_MCP_SERVER_URL;
  const { instance, accounts } = useMsal();
  const [client, setClient] = useState<MCPClientService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = accounts.length > 0;

  // Initialize client when authenticated
  useEffect(() => {
    if (isAuthenticated && !client) {
      initializeClient();
    } else if (!isAuthenticated && client) {
      // Clean up when logged out
      handleDisconnect();
    }
  }, [isAuthenticated]);

  const initializeClient = async () => {
    try {
      const result = await acquireTokenSilent();
      const accessToken = result?.accessToken;
      if (!accessToken) {
        throw new Error('Failed to acquire access token for weather API');
      }
      
      const newClient = new MCPClientService({
        serverUrl: mcpServerUrl,
        accessToken
      });
      setClient(newClient);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize client');
    }
  };

  const handleConnect = async (): Promise<void> => {
    if (!client || isConnecting || isConnected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      await client.connect();
      setIsConnected(true);
      setTools(client.tools);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to MCP server';
      setError(errorMessage);
      console.error('MCP connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (): Promise<void> => {
    if (!client) {
      return;
    }

    try {
      await client.disconnect();
    } catch (err) {
      console.error('Error disconnecting:', err);
    } finally {
      setClient(null);
      setIsConnected(false);
      setTools([]);
      setError(null);
    }
  };

  const handleCallTool = async (toolName: string, arguments_: Record<string, any>): Promise<any> => {
    if (!client || !isConnected) {
      throw new Error('Client not connected');
    }

    try {
      setError(null);
      return await client.callTool(toolName, arguments_);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to call tool';
      setError(errorMessage);
      throw err;
    }
  };

  const handleRefreshTools = async (): Promise<void> => {
    if (!client || !isConnected) {
      return;
    }

    try {
      setError(null);
      await client.refreshTools();
      setTools(client.tools);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh tools';
      setError(errorMessage);
    }
  };

  const acquireTokenSilent = async (): Promise<AuthenticationResult | null> => {
      const currentAccount = accounts[0] || null;

      if (!currentAccount) {
          throw new Error('No account found in cache');
      }

      return await instance.acquireTokenSilent({
          scopes: ['api://037a01d5-c16f-42dd-94b9-5cec9de374c5/.default'],
          account: currentAccount,
      });
  }

  const contextValue: MCPContextType = {
    client,
    isConnected,
    isConnecting,
    tools,
    error,
    connect: handleConnect,
    disconnect: handleDisconnect,
    callTool: handleCallTool,
    refreshTools: handleRefreshTools
  };

  return (
    <MCPContext.Provider value={contextValue}>
      {children}
    </MCPContext.Provider>
  );
}

export function useMCP(): MCPContextType {
  const context = useContext(MCPContext);
  if (!context) {
    throw new Error('useMCP must be used within an MCPProvider');
  }
  return context;
}
