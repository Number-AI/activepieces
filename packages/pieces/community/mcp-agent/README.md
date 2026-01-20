# MCP Agent Piece

Connect to Model Context Protocol (MCP) servers and call their tools from your ActivePieces workflows.

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to AI models. MCP servers expose tools that can be called by clients.

## Features

- 🔌 Connect to any MCP-compatible server via WebSocket
- 🛠️ Automatically discover available tools
- 📝 Dynamic dropdown to select tools
- ⚡ Call tools with custom arguments

## Quick Start

### Option 1: Use the Example Server

1. Start the example MCP server (included in this piece):

```bash
cd packages/pieces/community/mcp-agent
node example-server.js
```

2. In ActivePieces, use the MCP Agent piece with:
   - **Server URL**: `ws://localhost:3001`
   - **Tool Name**: Select from available tools (calculate, reverse_string, get_timestamp, echo)

### Option 2: Use Official MCP Servers

Install and run official MCP servers:

```bash
# Everything server (multiple tools)
npx -y @modelcontextprotocol/server-everything

# Filesystem server
npx -y @modelcontextprotocol/server-filesystem

# GitHub server
npx -y @modelcontextprotocol/server-github
```

## Example Tools

The included example server provides these tools:

### 1. **calculate**
Perform basic math operations
```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

### 2. **reverse_string**
Reverse any text
```json
{
  "text": "Hello World"
}
```

### 3. **get_timestamp**
Get current timestamp
```json
{
  "format": "iso"
}
```

### 4. **echo**
Echo back a message
```json
{
  "message": "Hello MCP!"
}
```

## Configuration

### Server URL
The WebSocket URL of your MCP server. Examples:
- Local: `ws://localhost:3001`
- Remote: `ws://your-server.com:3001`

### Tool Name
Automatically populated from the server. Select the tool you want to call.

### Arguments
JSON object with the tool's required arguments. The schema varies per tool.

## Creating Your Own MCP Server

See `example-server.js` for a simple implementation. Key points:

1. Implement `tools/list` to return available tools
2. Implement `tools/call` to execute tools
3. Follow the JSON-RPC 2.0 protocol
4. Use WebSocket for communication

## Links

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP GitHub](https://github.com/modelcontextprotocol)
- [Official MCP Servers](https://github.com/modelcontextprotocol/servers)
