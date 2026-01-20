#!/usr/bin/env node

/**
 * Test script to verify MCP server connection
 * Run: node test-connection.js
 */

const WebSocket = require('ws');

const SERVER_URL = 'ws://localhost:3001';

console.log('🔍 Testing MCP Server Connection...');
console.log(`📡 Connecting to: ${SERVER_URL}\n`);

const ws = new WebSocket(SERVER_URL);

ws.on('open', () => {
  console.log('✅ Connected successfully!\n');
  
  // Request tools list
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };
  
  console.log('📤 Requesting tools list...');
  ws.send(JSON.stringify(request));
});

ws.on('message', (data) => {
  const response = JSON.parse(data.toString());
  console.log('📥 Received response:\n');
  
  if (response.result && response.result.tools) {
    console.log('✅ Available Tools:');
    response.result.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name}`);
      if (tool.description) {
        console.log(`      Description: ${tool.description}`);
      }
    });
    console.log('\n✅ Server is working correctly!');
  } else {
    console.log('❌ Unexpected response:', JSON.stringify(response, null, 2));
  }
  
  ws.close();
  process.exit(0);
});

ws.on('error', (error) => {
  console.error('❌ Connection Error:', error.message);
  console.error('\n💡 Make sure the MCP server is running:');
  console.error('   node example-server.js\n');
  process.exit(1);
});

ws.on('close', () => {
  console.log('\n🔌 Connection closed');
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('❌ Connection timeout');
  console.error('\n💡 Make sure the MCP server is running:');
  console.error('   node example-server.js\n');
  ws.terminate();
  process.exit(1);
}, 5000);

