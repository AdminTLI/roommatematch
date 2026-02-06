# Google Search Console Setup Instructions

This document explains how to verify your website with Google Search Console and complete the SEO setup.

## Step 1: Create Google Search Console Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Select **URL prefix** property type
4. Enter your domain: `https://domumatch.com`
5. Click "Continue"

## Step 2: Get Verification Code

Google will show you several verification methods. We recommend using the **HTML tag** method:

1. Select "HTML tag" from the verification methods
2. Google will provide a meta tag that looks like this:
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
   ```
3. Copy the code inside the `content` attribute (just the long string, not the quotes)

## Step 3: Add Verification Code to Website

1. Open `/app/layout.tsx` in your code editor
2. Find the `verification` section (around line 19-22)
3. Replace the commented line with your verification code:
   ```typescript
   verification: {
     google: 'YOUR_VERIFICATION_CODE_HERE',  // Paste your code here, removing the comment slashes
   },
   ```
4. Save the file
5. Deploy your changes to production (push to main branch if using Vercel auto-deploy)

## Step 4: Verify Ownership

1. Wait 2-3 minutes for your deployment to complete
2. Go back to Google Search Console
3. Click "Verify"
4. If verification succeeds, you'll see a success message
5. If it fails, wait a few more minutes and try again (DNS propagation can take time)

## Step 5: Submit Sitemap

Once verified:

1. In Google Search Console, go to "Sitemaps" in the left sidebar
2. Enter `sitemap.xml` in the "Add a new sitemap" field
3. Click "Submit"
4. Google will begin crawling your site (this can take 1-7 days to fully index)

## Step 6: Request Indexing for Key Pages

To speed up indexing:

1. In Google Search Console, go to "URL Inspection"
2. Enter your homepage URL: `https://domumatch.com`
3. Click "Request Indexing"
4. Repeat for these important pages:
   - `https://domumatch.com/how-it-works`
   - `https://domumatch.com/features`
   - `https://domumatch.com/universities`
   - `https://domumatch.com/blog`
   - Any new blog posts or city pages you create

## Step 7: Monitor Performance

After 2-3 days:

1. Check the "Performance" report to see search impressions and clicks
2. Review the "Coverage" report to see which pages are indexed
3. Check the "Enhancements" section for any structured data issues

## Troubleshooting

**Verification fails:**
- Ensure your custom domain (domumatch.com) is properly configured in Vercel
- Wait 5-10 minutes after deployment
- Clear your browser cache and check if the meta tag appears in the page source
- Make sure you're verifying the correct URL (with or without www)

**Sitemap not found:**
- Visit `https://domumatch.com/sitemap.xml` directly to confirm it loads
- Ensure your deployment was successful
- Check that robots.txt allows Googlebot access

**Pages not indexing:**
- Be patient - initial indexing can take 1-7 days
- Check that pages don't have `noindex` in robots meta tags
- Ensure content is substantial (not thin content)
- Request indexing manually for important pages

## Next Steps

Once Google Search Console is set up and your sitemap is submitted:

1. Continue with creating city-specific landing pages
2. Write new blog content regularly (2-3 posts per month minimum)
3. Build quality backlinks through partnerships
4. Monitor your rankings weekly
5. Adjust strategy based on Search Console data

---

For questions or issues, refer to [Google Search Console Help](https://support.google.com/webmasters).
