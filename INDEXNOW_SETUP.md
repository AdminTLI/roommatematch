# IndexNow Setup Instructions

IndexNow is a protocol that allows you to instantly notify search engines (Bing, Yandex) when your content changes, speeding up indexing from days to hours.

## Step 1: Generate an IndexNow Key

1. Generate a unique key (32-64 characters). You can use any random string generator, or run this in your terminal:
   ```bash
   openssl rand -hex 32
   ```
2. Copy the generated key (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`)

## Step 2: Add Key to Environment Variables

Add the key to your Vercel environment variables:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Name**: `INDEXNOW_KEY`
   - **Value**: Your generated key
   - **Environment**: Production, Preview, Development (select all)
4. Click "Save"
5. Redeploy your application for changes to take effect

## Step 3: Create Key Verification File

Create a file in your `public` folder:

**File**: `/public/indexnow-key.txt`
**Content**: Your IndexNow key (just the key, nothing else)

Example:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

## Step 4: Verify Setup

1. Deploy your changes
2. Visit `https://domumatch.com/indexnow-key.txt` - you should see your key
3. Visit `https://domumatch.com/api/indexnow` - you should see a JSON response confirming the service is operational

## Step 5: Using IndexNow

### Automatically Notify After Publishing Content

When you publish new blog posts or pages, call the IndexNow API:

```typescript
// Example: After publishing a new blog post
const response = await fetch('/api/indexnow', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    urls: [
      'https://domumatch.com/blog/new-article',
      'https://domumatch.com/blog', // Also notify the blog index page
    ],
  }),
})

const result = await response.json()
console.log('IndexNow result:', result)
```

### Manually Notify for Existing Pages

You can use curl to manually notify search engines:

```bash
curl -X POST https://domumatch.com/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://domumatch.com/amsterdam", "https://domumatch.com/rotterdam"]}'
```

### Notify All City Pages

```bash
curl -X POST https://domumatch.com/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://domumatch.com/amsterdam",
      "https://domumatch.com/rotterdam",
      "https://domumatch.com/utrecht",
      "https://domumatch.com/den-haag",
      "https://domumatch.com/eindhoven",
      "https://domumatch.com/groningen",
      "https://domumatch.com/leiden",
      "https://domumatch.com/nijmegen",
      "https://domumatch.com/faq"
    ]
  }'
```

## How It Works

1. You publish new content or update existing pages
2. Your application calls `/api/indexnow` with the changed URLs
3. The API notifies Bing, Yandex, and other participating search engines
4. Search engines crawl and index your content within hours (instead of days/weeks)

## Supported Search Engines

- ✅ **Bing** - Fully supported
- ✅ **Yandex** - Fully supported
- ✅ **Seznam** (Czech Republic) - Fully supported
- ⏳ **Google** - Not yet supported (use Google Search Console URL Inspection instead)

## Best Practices

1. **Only notify for significant changes** - Don't spam search engines with minor updates
2. **Batch notifications** - Include multiple URLs in one request when possible (up to 10,000 URLs per request)
3. **Notify immediately after publishing** - The faster you notify, the faster indexing happens
4. **Include related pages** - When publishing a new blog post, also notify the blog index page

## Troubleshooting

**"Failed to notify" errors:**
- Check that your INDEXNOW_KEY is set correctly in environment variables
- Verify the key file is accessible at /indexnow-key.txt
- Ensure URLs are absolute (start with https://domumatch.com)

**No indexing improvement:**
- Be patient - IndexNow speeds up discovery, but search engines still need to evaluate content quality
- Continue with other SEO best practices (good content, backlinks, technical SEO)
- Some search engines may take 24-48 hours even with IndexNow

## Monitoring

Check the API response for success/failure counts:

```json
{
  "message": "IndexNow notifications sent",
  "urls": ["https://domumatch.com/amsterdam"],
  "results": {
    "successes": 1,
    "failures": 0
  }
}
```

---

For more information, visit [IndexNow.org](https://www.indexnow.org/)
