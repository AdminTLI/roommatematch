import { NextResponse } from 'next/server'

const BASE_URL = 'https://domumatch.com'

// Blog posts data
const blogPosts = [
  {
    title: 'How to Find a Great Roommate: Evidence-Based Tips for Student Housing',
    description: 'Learn evidence-based strategies for finding compatible roommates in the Netherlands. Navigate the Dutch student housing market with confidence using data-driven compatibility tips.',
    url: `${BASE_URL}/blog/how-to-find-a-great-roommate`,
    pubDate: new Date('2025-11-15').toUTCString(),
    category: 'Compatibility',
  },
  {
    title: 'Safety Checklist for Student Renters: Verification, Contracts & Best Practices',
    description: 'Protect yourself from rental scams and understand your tenant rights in the Netherlands. A comprehensive safety checklist for student renters with Dutch rental law guidance.',
    url: `${BASE_URL}/blog/safety-checklist-for-student-renters`,
    pubDate: new Date('2025-11-10').toUTCString(),
    category: 'Safety',
  },
  {
    title: 'Why Explainable AI Matters: Transparency, Trust & Your Rights',
    description: 'Understanding explainable AI and why transparency in matching algorithms matters. Learn how EU AI Act and GDPR protect your rights in algorithmic decision-making.',
    url: `${BASE_URL}/blog/why-explainable-ai-matters`,
    pubDate: new Date('2025-11-05').toUTCString(),
    category: 'Technology',
  },
]

function generateRSS() {
  const rssItems = blogPosts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.description}]]></description>
      <link>${post.url}</link>
      <guid isPermaLink="true">${post.url}</guid>
      <pubDate>${post.pubDate}</pubDate>
      <category>${post.category}</category>
    </item>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Domu Match Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Student housing insights, roommate compatibility tips, and housing safety guides for students in the Netherlands</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/images/logo.png</url>
      <title>Domu Match</title>
      <link>${BASE_URL}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`
}

export async function GET() {
  const rss = generateRSS()

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  })
}
