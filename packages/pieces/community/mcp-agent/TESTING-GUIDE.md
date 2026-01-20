# Testing MCP Agent in ActivePieces - Complete Guide

## 🎯 Goal
Create a simple flow to test if the MCP Agent piece is working correctly.

---

## 📋 Prerequisites

### 1. Start the MCP Server
```bash
cd /Users/luckyyadav/WebstormProjects/activepieces/packages/pieces/community/mcp-agent
node example-server.js
```

**Expected Output:**
```
🚀 MCP Server running on ws://localhost:3001
📋 Available tools:
  - calculate: Perform basic mathematical calculations
  - reverse_string: Reverse a string
  - get_timestamp: Get the current timestamp
  - echo: Echo back the input
```

### 2. Verify Server is Running
In another terminal:
```bash
cd /Users/luckyyadav/WebstormProjects/activepieces/packages/pieces/community/mcp-agent
node test-connection.js
```

**Expected Output:**
```
✅ Connected successfully!
✅ Available Tools:
   1. calculate
   2. reverse_string
   3. get_timestamp
   4. echo
✅ Server is working correctly!
```

---

## 🧪 Test 1: Simple Echo Test (Easiest)

### Step 1: Create a New Flow
1. Go to `http://localhost:4200`
2. Click **"Create Flow"**
3. Name it: `Test MCP Echo`

### Step 2: Add a Trigger
1. Click **"Select Trigger"**
2. Choose **"Schedule"** → **"Every Hour"** (or any trigger)
3. Or use **"Empty Trigger"** for manual testing

### Step 3: Add MCP Agent Action
1. Click the **"+"** button to add an action
2. Search for **"Sample MCP"** or **"MCP"**
3. Select **"Sample MCP"** piece
4. Select **"Call MCP Tool"** action

### Step 4: Configure the Action
Fill in these fields:

**MCP Server URL:**
```
ws://localhost:3001
```

**Tool Name:**
- Click the dropdown
- Wait 2-3 seconds for it to load
- Select **"echo - Echo back the input"**

**Arguments:**
```json
{
  "message": "Hello from ActivePieces!"
}
```

### Step 5: Test the Flow
1. Click **"Test"** button (top right)
2. Wait for execution
3. Check the result

**Expected Success Output:**
```json
{
  "success": true,
  "tool": "echo",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ \"echo\": \"Hello from ActivePieces!\", \"receivedAt\": \"2025-01-21T...\" }"
      }
    ],
    "isError": false
  }
}
```

✅ **If you see this, MCP is working!**

---

## 🧪 Test 2: Calculator Test (More Complex)

### Step 1: Add Another Action
1. Click **"+"** after the first action
2. Add another **"Sample MCP"** action

### Step 2: Configure Calculator
**MCP Server URL:**
```
ws://localhost:3001
```

**Tool Name:**
```
calculate - Perform basic mathematical calculations
```

**Arguments:**
```json
{
  "operation": "multiply",
  "a": 25,
  "b": 4
}
```

### Step 3: Test
Click **"Test"** again

**Expected Output:**
```json
{
  "success": true,
  "tool": "calculate",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ \"result\": 100, \"operation\": \"multiply\", \"a\": 25, \"b\": 4 }"
      }
    ],
    "isError": false
  }
}
```

---

## 🧪 Test 3: All Tools Test (Complete Validation)

Create a flow that tests all 4 tools in sequence:

### Flow Structure:
```
Trigger (Empty Trigger)
    ↓
Action 1: Echo Tool
    ↓
Action 2: Calculate Tool
    ↓
Action 3: Reverse String Tool
    ↓
Action 4: Get Timestamp Tool
```

### Action 1: Echo
```json
{
  "message": "Testing MCP Integration"
}
```

### Action 2: Calculate
```json
{
  "operation": "add",
  "a": 100,
  "b": 50
}
```

### Action 3: Reverse String
```json
{
  "text": "ActivePieces MCP"
}
```

### Action 4: Get Timestamp
```json
{
  "format": "iso"
}
```

### Test All
Click **"Test"** and verify all 4 actions succeed!

---

## 🔍 Debugging - What to Check

### ❌ Issue: "Tool Name dropdown is empty"

**Check:**
1. Is the server running? → `node example-server.js`
2. Is the URL correct? → `ws://localhost:3001` (not `http://`)
3. Did you wait 2-3 seconds after entering the URL?
4. Check browser console for errors (F12)

**Solution:**
```bash
# Restart the server
cd packages/pieces/community/mcp-agent
node example-server.js
```

---

### ❌ Issue: "Error: Cannot connect to ws://localhost:3001"

**Check:**
1. Server is running in another terminal
2. No firewall blocking port 3001
3. Test with: `node test-connection.js`

**Solution:**
```bash
# Check if port is in use
lsof -i :3001

# Kill any process using port 3001
kill -9 <PID>

# Restart server
node example-server.js
```

---

### ❌ Issue: "success: false" in result

**Check the error message in the result:**
```json
{
  "success": false,
  "tool": "calculate",
  "error": "..."
}
```

**Common causes:**
- Wrong argument format
- Missing required fields
- Server crashed (check server terminal)

**Solution:**
- Verify arguments match the tool's schema
- Check server terminal for errors
- Restart the server if needed

---

## ✅ Success Indicators

### 1. **Dropdown Populates**
When you enter the server URL, the Tool Name dropdown shows:
- ✅ calculate - Perform basic mathematical calculations
- ✅ reverse_string - Reverse a string
- ✅ get_timestamp - Get the current timestamp
- ✅ echo - Echo back the input

### 2. **Test Execution Succeeds**
The test result shows:
```json
{
  "success": true,
  "tool": "...",
  "result": { ... }
}
```

### 3. **Server Logs Show Activity**
In the server terminal, you see:
```
Client connected
Received request: tools/list
Received request: tools/call
```

---

## 🎉 Advanced Testing

### Test with Dynamic Data

Use the output from one MCP call as input to another:

**Action 1: Get Timestamp**
```json
{
  "format": "unix"
}
```

**Action 2: Echo (using previous result)**
In the Arguments field, reference the previous step:
```json
{
  "message": "The timestamp is: {{step_1.result.content[0].text}}"
}
```

This tests that MCP results can be used in subsequent steps!

---

## 📊 Expected Test Results Summary

| Test | Tool | Input | Expected Result |
|------|------|-------|-----------------|
| 1 | echo | `{"message": "test"}` | `{"echo": "test", "receivedAt": "..."}` |
| 2 | calculate | `{"operation": "add", "a": 10, "b": 5}` | `{"result": 15, ...}` |
| 3 | reverse_string | `{"text": "hello"}` | `{"reversed": "olleh", ...}` |
| 4 | get_timestamp | `{"format": "iso"}` | `{"timestamp": "2025-...", ...}` |

---

## 🚀 Production Testing Checklist

- [ ] Server starts without errors
- [ ] Test connection script passes
- [ ] Dropdown populates with tools
- [ ] Echo test succeeds
- [ ] Calculator test succeeds
- [ ] Reverse string test succeeds
- [ ] Timestamp test succeeds
- [ ] Flow can be published
- [ ] Flow can be enabled
- [ ] Flow runs successfully when triggered

---

## 💡 Pro Tips

1. **Keep server running** in a separate terminal while testing
2. **Check server logs** to see what requests are being made
3. **Use Echo tool first** - it's the simplest and best for initial testing
4. **Test one tool at a time** before creating complex flows
5. **Save successful configurations** for reuse

---

## 🎯 Quick Test Command

Run this all-in-one test:

```bash
# Terminal 1: Start server
cd packages/pieces/community/mcp-agent && node example-server.js

# Terminal 2: Test connection
cd packages/pieces/community/mcp-agent && node test-connection.js
```

If both succeed, your MCP Agent is ready to use in ActivePieces! 🎉

