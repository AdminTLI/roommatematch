# Fixing Chunk Load Errors in Next.js Development

If you're seeing errors like:
```
Loading chunk app/layout failed.
(timeout: http://localhost:3000/_next/static/chunks/app/layout.js)
```

This is a common Next.js development issue. Try these solutions in order:

## Quick Fixes

### 1. Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### 2. Hard Refresh Browser
- **Chrome/Edge**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Firefox**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache manually

### 3. Restart Dev Server
Simply stop (`Ctrl+C`) and restart:
```bash
npm run dev
```

## Advanced Fixes

### 4. Clear All Caches
```bash
# Remove Next.js cache
rm -rf .next

# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

### 5. Check for Port Conflicts
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process if needed
kill -9 <PID>
```

### 6. Update Next.js
If the issue persists, try updating Next.js:
```bash
npm install next@latest
```

### 7. Check Network Tab
Open browser DevTools → Network tab and check if chunks are actually failing to load or if it's a timeout issue.

## Common Causes

1. **Hot Module Replacement (HMR) issues**: Next.js dev server sometimes has issues with HMR
2. **Browser cache**: Stale cached chunks
3. **Network issues**: Slow connection or proxy issues
4. **File system watchers**: Too many files being watched (especially on macOS/Linux)

## Prevention

- Regularly clear `.next` folder during development
- Use a consistent Node.js version (use `.nvmrc` if available)
- Avoid editing files while the dev server is starting

## If Nothing Works

1. Check Next.js version compatibility
2. Check for any custom webpack configurations
3. Review recent changes to `next.config.js`
4. Check for any middleware or route handlers that might be interfering

This error is typically **not related to your application code** but rather a Next.js development server issue.

