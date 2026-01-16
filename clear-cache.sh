#!/bin/bash
echo "🧹 Clearing Next.js cache..."
rm -rf .next
echo "✅ Cache cleared!"
echo ""
echo "Now restart your dev server with: npm run dev"
echo "Then hard refresh your browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
