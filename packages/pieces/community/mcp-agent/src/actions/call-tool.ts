import { createAction, Property, DynamicPropsValue } from "@activepieces/pieces-framework";
import { MCPClient } from "../mcp-client";

export const callMcpTool = createAction({
  name: 'call_mcp_tool',
  displayName: 'Call MCP Tool',
  description: 'Call a tool on an MCP server. Example server: ws://localhost:3001 (run: npx -y @modelcontextprotocol/server-everything)',
  props: {
    serverUrl: Property.ShortText({
      displayName: 'MCP Server URL',
      description: 'WebSocket URL of the MCP server (e.g., ws://localhost:3001)',
      required: true,
      defaultValue: 'ws://localhost:3001',
    }),
    toolName: Property.Dropdown({
      displayName: 'Tool Name',
      description: 'Select the tool to call',
      required: true,
      refreshers: ['serverUrl'],
      options: async ({ serverUrl }) => {
        if (!serverUrl) {
          return {
            disabled: true,
            placeholder: 'Enter server URL first (e.g., ws://localhost:3001)',
            options: [],
          };
        }

        let client: MCPClient | null = null;
        
        try {
          client = new MCPClient(serverUrl as string);
          await client.connect();
          const tools = await client.listTools();

          if (!tools || tools.length === 0) {
            return {
              disabled: true,
              placeholder: 'No tools found. Make sure the MCP server is running and exposing tools.',
              options: [],
            };
          }

          return {
            disabled: false,
            options: tools.map((tool) => ({
              label: `${tool.name}${tool.description ? ` - ${tool.description}` : ''}`,
              value: tool.name,
            })),
          };
        } catch (error) {
          const errorMessage = (error as Error).message;
          return {
            disabled: true,
            placeholder: errorMessage.length > 100 ? errorMessage.substring(0, 100) + '...' : errorMessage,
            options: [],
          };
        } finally {
          if (client) {
            try {
              client.disconnect();
            } catch (e) {
              // Ignore disconnect errors
            }
          }
        }
      },
    }),
    arguments: Property.Json({
      displayName: 'Arguments',
      description: 'JSON object with the arguments for the tool',
      required: false,
      defaultValue: {},
    }),
  },
  async run(ctx) {
    const { serverUrl, toolName, arguments: args } = ctx.propsValue;
    
    let client: MCPClient | null = null;
    
    try {
      client = new MCPClient(serverUrl);
      await client.connect();
      
      const result = await client.callTool(toolName as string, args || {});
      
      return {
        success: true,
        tool: toolName,
        result,
      };
    } catch (error) {
      return {
        success: false,
        tool: toolName,
        error: (error as Error).message,
      };
    } finally {
      if (client) {
        client.disconnect();
      }
    }
  },
});
