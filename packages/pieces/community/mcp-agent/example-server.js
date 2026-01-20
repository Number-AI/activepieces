#!/usr/bin/env node

/**
 * Example MCP Server for ActivePieces
 * 
 * This is a simple MCP server that provides utility tools.
 * Run with: node example-server.js
 * 
 * Then connect from ActivePieces using: ws://localhost:3001
 */

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3001 });

// Define available tools
const tools = [
  {
    name: 'calculate',
    description: 'Perform basic mathematical calculations',
    inputSchema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide'],
          description: 'The mathematical operation to perform'
        },
        a: {
          type: 'number',
          description: 'First number'
        },
        b: {
          type: 'number',
          description: 'Second number'
        }
      },
      required: ['operation', 'a', 'b']
    }
  },
  {
    name: 'reverse_string',
    description: 'Reverse a string',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to reverse'
        }
      },
      required: ['text']
    }
  },
  {
    name: 'get_timestamp',
    description: 'Get the current timestamp',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['unix', 'iso'],
          description: 'Format of the timestamp',
          default: 'iso'
        }
      }
    }
  },
  {
    name: 'echo',
    description: 'Echo back the input',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Message to echo'
        }
      },
      required: ['message']
    }
  }
];

// Tool implementations
const toolHandlers = {
  calculate: ({ operation, a, b }) => {
    switch (operation) {
      case 'add':
        return { result: a + b, operation, a, b };
      case 'subtract':
        return { result: a - b, operation, a, b };
      case 'multiply':
        return { result: a * b, operation, a, b };
      case 'divide':
        if (b === 0) throw new Error('Division by zero');
        return { result: a / b, operation, a, b };
      default:
        throw new Error('Unknown operation');
    }
  },
  
  reverse_string: ({ text }) => {
    return { reversed: text.split('').reverse().join(''), original: text };
  },
  
  get_timestamp: ({ format = 'iso' }) => {
    const now = new Date();
    if (format === 'unix') {
      return { timestamp: Math.floor(now.getTime() / 1000), format: 'unix' };
    }
    return { timestamp: now.toISOString(), format: 'iso' };
  },
  
  echo: ({ message }) => {
    return { echo: message, receivedAt: new Date().toISOString() };
  }
};

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    try {
      const request = JSON.parse(message.toString());
      console.log('Received request:', request.method);

      let response;

      switch (request.method) {
        case 'tools/list':
          response = {
            jsonrpc: '2.0',
            id: request.id,
            result: { tools }
          };
          break;

        case 'tools/call':
          const { name, arguments: args } = request.params;
          const handler = toolHandlers[name];
          
          if (!handler) {
            response = {
              jsonrpc: '2.0',
              id: request.id,
              error: {
                code: -32601,
                message: `Tool not found: ${name}`
              }
            };
          } else {
            try {
              const result = handler(args);
              response = {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                  content: [{
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                  }],
                  isError: false
                }
              };
            } catch (error) {
              response = {
                jsonrpc: '2.0',
                id: request.id,
                result: {
                  content: [{
                    type: 'text',
                    text: `Error: ${error.message}`
                  }],
                  isError: true
                }
              };
            }
          }
          break;

        default:
          response = {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: 'Method not found'
            }
          };
      }

      ws.send(JSON.stringify(response));
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error'
        }
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('🚀 MCP Server running on ws://localhost:3001');
console.log('📋 Available tools:');
tools.forEach(tool => {
  console.log(`  - ${tool.name}: ${tool.description}`);
});
console.log('\nConnect from ActivePieces using: ws://localhost:3001');

