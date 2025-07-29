import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { AuthenticatedHttpTransport } from "../transports/AuthenticatedHttpTransport";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface MCPClientOptions {
  serverUrl: string;
  accessToken: string;
}

export class MCPClientService {
  private client: Client;
  private transport: AuthenticatedHttpTransport | null = null;
  private _isConnected = false;
  private _tools: Tool[] = [];

  constructor(private options: MCPClientOptions) {
    this.client = new Client({
      name: "chat-interface-client",
      version: "1.0.0"
    });
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  get tools(): Tool[] {
    return this._tools;
  }

  async connect(): Promise<void> {
    if (this._isConnected) {
      return;
    }

    try {
      this.transport = new AuthenticatedHttpTransport(this.options.serverUrl, {
        accessToken: this.options.accessToken
      });

      await this.client.connect(this.transport);
      this._isConnected = true;

      // Load available tools
      await this.loadTools();
      
      console.log("MCP Client connected successfully");
    } catch (error) {
      console.error("Failed to connect MCP client:", error);
      this._isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this._isConnected) {
      return;
    }

    try {
      await this.client.close();
      this.transport = null;
      this._isConnected = false;
      this._tools = [];
      console.log("MCP Client disconnected");
    } catch (error) {
      console.error("Error disconnecting MCP client:", error);
    }
  }

  
  private async loadTools(): Promise<void> {
    if (!this._isConnected) {
      throw new Error("Client not connected");
    }

    try {
      const result = await this.client.listTools();
      this._tools = result.tools;
      console.log(`Loaded ${this._tools.length} tools:`, this._tools.map(t => t.name));
    } catch (error) {
      console.error("Failed to load tools:", error);
      throw error;
    }
  }

  async callTool(toolName: string, arguments_: Record<string, any>): Promise<any> {
    if (!this._isConnected) {
      throw new Error("Client not connected");
    }

    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: arguments_
      });

      console.log(`Called tool ${toolName}:`, result);
      return result;
    } catch (error) {
      console.error(`Failed to call tool ${toolName}:`, error);
      throw error;
    }
  }

  async refreshTools(): Promise<void> {
    if (!this._isConnected) {
      throw new Error("Client not connected");
    }

    await this.loadTools();
  }
}
