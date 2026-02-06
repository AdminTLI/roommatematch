# Content Creation Guide for Domu Match SEO

This guide provides templates and instructions for creating the remaining SEO content.

## 📸 Open Graph Images

### What Are OG Images?
Open Graph images appear when your pages are shared on social media (Facebook, LinkedIn, Twitter) and messaging apps (WhatsApp, Slack). Good OG images increase click-through rates by 2-3x.

### Specifications
- **Size**: 1200x630px (required)
- **Format**: PNG or JPG
- **File size**: < 1MB
- **Safe zone**: Keep text/logos at least 100px from edges

### Tools to Create OG Images

**Free Tools**:
1. **Canva** (recommended) - https://canva.com
   - Use template: "Facebook Post" (1200x630px)
   - Free OG image templates available

2. **Figma** - https://figma.com
   - Design system friendly
   - Reusable components

3. **Pablo by Buffer** - https://pablo.buffer.com
   - Quick and simple

### Images Needed

#### Homepage (`/public/images/og/home.png`)
- **Headline**: "Find Your Perfect Roommate in Netherlands"
- **Subtext**: "Science-backed matching | Free for students"
- **Visual**: Domu Match logo + illustration of roommates

#### City Pages (8 images)
Format: `/public/images/og/[city].png`
- Amsterdam, Rotterdam, Utrecht, Den Haag, Eindhoven, Groningen, Leiden, Nijmegen
- **Headline**: "Find Roommates in [City]"
- **Subtext**: "Verified students | Compatible matches"
- **Visual**: City silhouette or landmark

#### Feature Pages (3 images)
- `/public/images/og/how-it-works.png` - Process illustration
- `/public/images/og/features.png` - Feature icons grid
- `/public/images/og/faq.png` - FAQ icon

### Design Template

```
┌─────────────────────────────────────────────────┐
│ [Domu Match Logo]                               │
│                                                 │
│            [Main Headline]                       │
│            Science-Backed Matching              │
│                                                 │
│            [Visual Element]                      │
│                                                 │
│ domumatch.com                      Free 🎓      │
└─────────────────────────────────────────────────┘
```

### Brand Colors
- Primary: #7a3bb6 (purple)
- Accent: #f97316 (orange)
- Background: White or light gradient

### After Creating Images

Update metadata in each page:

```typescript
images: [
  {
    url: 'https://domumatch.com/images/og/[page-name].png',
    width: 1200,
    height: 630,
    alt: '[Page title] - Domu Match',
  },
]
```

---

## ✍️ Blog Content Creation

### Article Structure Template

```markdown
# [SEO-Optimized Title with Keywords]

[Engaging intro paragraph - 50-100 words]

## Table of Contents (for long articles)
- Key Point 1
- Key Point 2
- ...

## [H2: First Main Section]

[Content paragraph]

### [H3: Subsection if needed]

[Content]

## [H2: Second Main Section]

...

## Conclusion

[Summary + CTA to sign up or read related content]

---

**Related Articles:**
- [Link to related post 1]
- [Link to related post 2]
```

### Blog Post Topics & Outlines

#### 1. "10 Red Flags When Searching for a Roommate in Netherlands"

**Target keyword**: red flags roommate, warning signs roommate

**Outline**:
- Introduction: Why spotting red flags early matters
- Red Flag 1: Avoiding questions about cleaning habits
- Red Flag 2: Unclear about finances/rent splitting
- Red Flag 3: No references from previous roommates
- Red Flag 4: Pushing to skip rental agreement
- Red Flag 5: Dismissive about your concerns
- Red Flag 6: Inconsistent work/study schedule claims
- Red Flag 7: Vague about guests and parties
- Red Flag 8: Poor communication during search
- Red Flag 9: Unrealistic expectations
- Red Flag 10: Reluctant to meet in person/video
- What to do if you spot red flags
- How Domu Match helps avoid these issues
- CTA: Find verified roommates

#### 2. "Average Student Housing Costs in Amsterdam 2026"

**Target keywords**: Amsterdam student housing costs, rent prices Amsterdam students

**Outline**:
- Current market overview
- Average rent by area (table format):
  - Centrum: €800-1200
  - De Pijp: €650-900
  - Oost: €500-700
  - Noord: €450-650
  - Etc.
- Additional costs (utilities, internet, insurance)
- Cost-saving tips
- How to split costs fairly with roommates
- Affordable neighborhoods for students
- Housing subsidies and support
- CTA: Find cost-conscious roommates

#### 3. "How to Split Rent Fairly with Roommates: The Ultimate Guide"

**Target keywords**: split rent fairly, roommate rent calculator

**Outline**:
- Why rent splitting causes conflicts
- Method 1: Equal split (pros/cons)
- Method 2: Square footage-based
- Method 3: Amenity-weighted (better bedroom = more rent)
- Method 4: Income-based
- Tools and calculators
- Creating a rent agreement
- Handling utilities and other costs
- What to do when someone can't pay
- CTA: Find financially responsible roommates

#### 4. "International Student's Guide to Finding Housing in Netherlands"

**Target keywords**: international student housing Netherlands, study abroad Netherlands accommodation

**Outline**:
- Timeline: When to start searching (6 months before)
- Required documents for international students
- Understanding Dutch rental contracts
- Housing options: student residences vs. private market
- Budget expectations
- Avoiding scams (red flags for internationals)
- Cultural tips for living with Dutch roommates
- Support resources (university housing offices, ESN)
- Language barriers and solutions
- CTA: Join verified student community

### Word Count Guidelines
- Minimum: 1500 words
- Ideal: 2000-2500 words
- Maximum: 3500 words (break into series if longer)

### SEO Checklist for Each Post
- [ ] Target keyword in title (H1)
- [ ] Target keyword in first paragraph
- [ ] Target keyword in at least 2 H2 headings
- [ ] 3-5 internal links to product pages
- [ ] 2-3 external links to authoritative sources
- [ ] Featured image (16:9, at least 1200px wide)
- [ ] Meta description (150-160 characters)
- [ ] Alt text for all images
- [ ] Article structured data (add to page.tsx)
- [ ] Custom OG image

### Publishing Workflow

1. **Write post** in Markdown or doc
2. **Create file**: `app/(marketing)/blog/[slug]/page.tsx`
3. **Add article content**: Create `article-content.tsx` component
4. **Add metadata**: Title, description, keywords, OG tags
5. **Add structured data**: Article schema with author, dates, keywords
6. **Update RSS feed**: Add post to `app/blog/rss.xml/route.ts`
7. **Update sitemap**: Add URL to `app/sitemap.ts`
8. **Notify search engines**: Call `/api/indexnow` with new URL
9. **Share on social media**: LinkedIn, Instagram

---

## 📚 Resource Pages

### 1. Roommate Agreement Template

**File**: `app/(marketing)/resources/roommate-agreement-template/page.tsx`

**Content**:
- Introduction to why agreements matter
- Downloadable PDF template (create PDF in Canva/Figma)
- Sections to include:
  - Rent and utilities split
  - Cleaning schedule
  - Quiet hours
  - Guest policy
  - Food sharing
  - Maintenance responsibilities
  - Conflict resolution
- Legal considerations (mention it's not legally binding)
- CTA: Find compatible roommates first

### 2. Moving Checklist

**File**: `app/(marketing)/resources/moving-checklist/page.tsx`

**Content**:
- 3 months before: Start searching, budget planning
- 2 months before: Find roommates, view apartments
- 1 month before: Sign contracts, arrange utilities
- 2 weeks before: Packing, address changes
- Move-in day: Inspection, keys, first rent
- First week: Meet neighbors, learn area
- Downloadable PDF checklist
- CTA: Get matched with roommates

### 3. Student Housing Guide (Complete Resource)

**File**: `app/(marketing)/resources/student-housing-guide/page.tsx`

**Content** (comprehensive guide, 3000+ words):
- Understanding the Dutch housing market
- Your rights as a tenant
- Types of housing contracts
- What to look for in viewings
- Red flags in rental listings
- Setting up utilities
- House rules and etiquette
- Conflict resolution
- Moving out properly
- Resources and contacts

---

## 🔗 Link Building Outreach Templates

### University Housing Offices

**Subject**: Partnership Opportunity: Student Housing Resource

**Email**:
```
Dear [Housing Coordinator Name],

I'm reaching out from Domu Match, a science-backed roommate matching platform specifically designed for Dutch university students.

We've developed a free tool that helps students find compatible roommates through personality, lifestyle, and study habit matching – reducing housing conflicts by up to 60% based on our research.

We'd love to explore a partnership where:
1. Your students get free access to our verified platform
2. We can be listed as a resource on your housing webpage
3. We provide quarterly reports on student housing trends

Would you be open to a 15-minute call to discuss how we can support [University Name] students?

Best regards,
[Your Name]
Domu Match
```

### Student Association / ESN

**Subject**: Free Tool for Your Student Members

**Email**:
```
Hi [Contact Name],

I wanted to share a free resource that might help [Organization] members.

Domu Match is a roommate matching platform built specifically for Dutch university students. We use science-backed compatibility matching to help students find roommates they'll actually get along with.

Key benefits for your members:
- 100% free, verified students only
- Compatibility scores based on 40+ factors
- Safe, monitored platform
- Active at 50+ Dutch universities

Would you be interested in:
- Sharing with your members via newsletter/social
- Partnership for exclusive member benefits
- Guest blog post about student housing

Let me know if you'd like more information!

[Your Name]
```

### Tech/Education Press

**Subject**: Story Pitch: AI Solving Student Housing Conflicts

**Email**:
```
Hi [Journalist Name],

I'm reaching out with a potential story about how AI is being used to solve a common problem for Dutch students: finding compatible roommates.

**Story angle**: Student housing conflicts cost universities millions annually and cause significant stress. Domu Match uses explainable AI to match students based on lifestyle compatibility, reducing conflicts before they start.

**Why now**:
- Netherlands has ongoing student housing crisis
- 40% of student housing conflicts are due to incompatible personalities
- AI transparency is increasingly important (EU AI Act)

**Available for interview**:
- Founder [Name]
- Student success stories
- Data on compatibility factors

Would this fit your coverage?

[Your Name]
```

---

## 📊 Tracking & Monitoring Setup

### Google Search Console

**After verification, track**:
- Total clicks (goal: +20% month-over-month)
- Average position (goal: improve by 5 positions/month)
- Top queries (identify new keyword opportunities)
- Coverage issues (goal: 0 errors)
- Core Web Vitals (goal: all pages "Good")

**Review weekly**: Monday mornings, 30 minutes

### Google Analytics 4

**Events to track**:
- `page_view` - All pages
- `click_get_started` - CTA clicks
- `blog_read_time` - Time spent on blog
- `city_page_view` - City page views
- `faq_expand` - FAQ accordion opens

**Goals**:
- Organic traffic: +30% month 1, +100% month 3
- Blog traffic: +50% each month
- Conversion rate: 2% organic visitors to signups

### Keyword Rank Tracking

**Tools** (choose one):
- Ahrefs ($$$ - most comprehensive)
- SEMrush ($$ - good alternative)
- Google Search Console (free - basic tracking)

**Keywords to track** (check weekly):
- Brand: "domu match", "domu match netherlands"
- Primary: "roommate finder netherlands", "find roommate netherlands"
- Secondary: "student housing netherlands", "roommate app"
- City: "find roommate amsterdam", "find roommate rotterdam", etc.
- Long-tail: "how to find compatible roommate", "science-backed roommate matching"

---

## ✅ Quick Implementation Checklist

Week 1:
- [ ] Add Google Search Console verification code
- [ ] Submit sitemap
- [ ] Request indexing for top 10 pages
- [ ] Create 3 OG images (home, amsterdam, rotterdam)

Week 2:
- [ ] Write and publish 2 blog posts
- [ ] Create 5 more OG images
- [ ] Email 5 universities about partnerships

Week 3:
- [ ] Write and publish 2 more blog posts
- [ ] Create roommate agreement template
- [ ] Create moving checklist page

Week 4:
- [ ] Complete all OG images
- [ ] Email 10 more universities
- [ ] Reach out to 5 student organizations

Month 2-3:
- [ ] Publish 2-3 blog posts per month
- [ ] Acquire 5-10 backlinks
- [ ] Track and optimize based on GSC data

---

**Last Updated**: 2026-01-21
