import WebSocket from "ws";

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

export class MCPClient {
  private ws!: WebSocket;
  private pending = new Map<number, { resolve: (result: any) => void; reject: (error: any) => void }>();
  private messageId = 1;

  constructor(private url: string) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        const timeout = setTimeout(() => {
          if (this.ws) {
            this.ws.terminate();
          }
          reject(new Error(`Connection timeout to ${this.url}. Make sure the MCP server is running.`));
        }, 5000);

        this.ws.on("open", () => {
          clearTimeout(timeout);
          resolve();
        });

        this.ws.on("error", (error: any) => {
          clearTimeout(timeout);
          const errorMsg = error.message || error.code || 'Unknown error';
          reject(new Error(`Cannot connect to ${this.url}. Error: ${errorMsg}. Make sure the MCP server is running.`));
        });

        this.ws.on("message", (msg: any) => {
          try {
            const data = JSON.parse(msg.toString());
            const pending = this.pending.get(data.id);
            
            if (pending) {
              if (data.error) {
                pending.reject(new Error(data.error.message || "MCP Server Error"));
              } else {
                pending.resolve(data.result);
              }
              this.pending.delete(data.id);
            }
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        });
      } catch (error: any) {
        reject(new Error(`Failed to create WebSocket: ${error.message}`));
      }
    });
  }

  private request(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = this.messageId++;
      const message = {
        jsonrpc: "2.0",
        id,
        method,
        params,
      };

      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request timeout for method: ${method}`));
      }, 30000);

      this.pending.set(id, {
        resolve: (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      });

      this.ws.send(JSON.stringify(message));
    });
  }

  async listTools(): Promise<MCPTool[]> {
    const response = await this.request("tools/list");
    return response.tools || [];
  }

  async callTool(name: string, args: any): Promise<any> {
    const response = await this.request("tools/call", {
      name,
      arguments: args,
    });
    return response;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}
