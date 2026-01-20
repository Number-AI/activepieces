# 🚀 Quick Test - 5 Minutes

## Step 1: Start Server (Terminal 1)
```bash
cd /Users/luckyyadav/WebstormProjects/activepieces/packages/pieces/community/mcp-agent
node example-server.js
```

**Wait for:**
```
🚀 MCP Server running on ws://localhost:3001
```

---

## Step 2: Test Connection (Terminal 2)
```bash
cd /Users/luckyyadav/WebstormProjects/activepieces/packages/pieces/community/mcp-agent
node test-connection.js
```

**Wait for:**
```
✅ Server is working correctly!
```

---

## Step 3: Create Flow in ActivePieces

### A. Go to ActivePieces
Open: `http://localhost:4200`

### B. Create New Flow
1. Click **"Create Flow"**
2. Name: `MCP Test`

### C. Add Trigger
1. Click **"Select Trigger"**
2. Choose **"Empty Trigger"**

### D. Add MCP Action
1. Click **"+"** button
2. Search: **"Sample MCP"**
3. Select: **"Call MCP Tool"**

### E. Configure
```
MCP Server URL: ws://localhost:3001
Tool Name: [Click dropdown, select "echo"]
Arguments: {"message": "Hello MCP!"}
```

### F. Test
1. Click **"Test"** button (top right)
2. Wait 2-3 seconds

---

## Step 4: Verify Result

### ✅ Success Looks Like:
```json
{
  "success": true,
  "tool": "echo",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"echo\":\"Hello MCP!\",\"receivedAt\":\"...\"}"
      }
    ],
    "isError": false
  }
}
```

### ❌ Failure Looks Like:
```json
{
  "success": false,
  "tool": "echo",
  "error": "Cannot connect to ws://localhost:3001..."
}
```

**If failed:** Go back to Step 1 and make sure server is running!

---

## 🎉 You're Done!

If you see `"success": true`, your MCP Agent is working perfectly! 

### Next Steps:
- Try other tools (calculate, reverse_string, get_timestamp)
- Create more complex flows
- Build your own MCP server

### Need Help?
- Check `TESTING-GUIDE.md` for detailed troubleshooting
- Check server terminal for error messages
- Run `node test-connection.js` to diagnose issues

---

## 📋 Troubleshooting Checklist

- [ ] Server is running (`node example-server.js`)
- [ ] Test connection passes (`node test-connection.js`)
- [ ] URL is exactly: `ws://localhost:3001` (not http://)
- [ ] Tool dropdown populated (wait 2-3 seconds)
- [ ] Arguments are valid JSON
- [ ] Backend restarted after building piece

---

## 🔧 Common Issues

### Issue: Dropdown is empty
**Fix:** Make sure server is running, wait 2-3 seconds after entering URL

### Issue: "WebSocket error"
**Fix:** Server not running. Run `node example-server.js`

### Issue: "success: false"
**Fix:** Check arguments format, check server terminal for errors

---

## 💡 Quick Reference

### All Available Tools:

1. **echo** - Simplest test
   ```json
   {"message": "test"}
   ```

2. **calculate** - Math operations
   ```json
   {"operation": "add", "a": 10, "b": 5}
   ```

3. **reverse_string** - Reverse text
   ```json
   {"text": "hello"}
   ```

4. **get_timestamp** - Current time
   ```json
   {"format": "iso"}
   ```

Test them all! 🎯

