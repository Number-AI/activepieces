# Quick Start Guide - MCP Agent

## Step 1: Start the Example Server

Open a new terminal and run:

```bash
cd /Users/luckyyadav/WebstormProjects/activepieces/packages/pieces/community/mcp-agent
node example-server.js
```

You should see:
```
🚀 MCP Server running on ws://localhost:3001
📋 Available tools:
  - calculate: Perform basic mathematical calculations
  - reverse_string: Reverse a string
  - get_timestamp: Get the current timestamp
  - echo: Echo back the input
```

## Step 2: Refresh Your ActivePieces Frontend

Refresh your browser at `http://localhost:4200`

## Step 3: Create a Flow

1. Create a new flow in ActivePieces
2. Add the **MCP Agent** piece
3. Configure it:
   - **MCP Server URL**: `ws://localhost:3001`
   - **Tool Name**: The dropdown will automatically populate with available tools
   - **Arguments**: Enter JSON arguments for the tool

## Example Configurations

### Example 1: Calculator
```
Tool Name: calculate
Arguments:
{
  "operation": "add",
  "a": 100,
  "b": 50
}
```

### Example 2: Reverse String
```
Tool Name: reverse_string
Arguments:
{
  "text": "Hello ActivePieces!"
}
```

### Example 3: Get Timestamp
```
Tool Name: get_timestamp
Arguments:
{
  "format": "iso"
}
```

### Example 4: Echo
```
Tool Name: echo
Arguments:
{
  "message": "This is a test message"
}
```

## Expected Output

The action will return:
```json
{
  "success": true,
  "tool": "calculate",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ \"result\": 150, \"operation\": \"add\", \"a\": 100, \"b\": 50 }"
      }
    ],
    "isError": false
  }
}
```

## Troubleshooting

### "Connection timeout" error
- Make sure the example server is running
- Check that the URL is correct: `ws://localhost:3001`

### "No tools found on server"
- Restart the example server
- Check the server console for errors

### Tool dropdown is empty
- Click on the Server URL field first
- Wait a moment for the dropdown to refresh
- Make sure the server URL is valid

## Next Steps

- Try creating your own MCP server
- Use official MCP servers from npm
- Chain multiple MCP tools in a workflow

