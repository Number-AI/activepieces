#!/bin/bash

echo "🔄 Restarting ActivePieces Backend..."
echo ""

# Clear caches
echo "1️⃣ Clearing caches..."
rm -rf ~/.activepieces/cache 2>/dev/null
rm -rf dist/packages/pieces/mcp-agent 2>/dev/null
echo "   ✅ Caches cleared"
echo ""

# Rebuild the piece
echo "2️⃣ Rebuilding MCP Agent piece..."
cd /Users/luckyyadav/WebstormProjects/activepieces
npx nx build pieces-mcp-agent --skip-nx-cache
echo "   ✅ Piece rebuilt"
echo ""

echo "3️⃣ Now restart your backend:"
echo ""
echo "   Stop the current backend (Ctrl+C in the terminal running it)"
echo "   Then run: npm run dev:backend"
echo ""
echo "4️⃣ After backend restarts:"
echo "   - Refresh your browser (F5)"
echo "   - Open your flow"
echo "   - The dropdown should now work!"
echo ""
echo "✨ Done! Follow the steps above to complete the restart."

