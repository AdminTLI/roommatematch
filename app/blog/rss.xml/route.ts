import { NextResponse } from 'next/server'

const BASE_URL = 'https://domumatch.com'

// Keep in sync with app/(marketing)/blog/blog-content.tsx for SEO/discoverability.
const blogPosts = [
  {
    title: 'Dutch Study Choice: Why Gamma Fields Dominate',
    description: 'Rathenau data show most Dutch bachelor students enrol in gamma fields. That concentration shapes programme choice, fixus deadlines, and early switches.',
    url: `${BASE_URL}/blog/dutch-study-choice-gamma-fields`,
    pubDate: new Date('2026-09-23').toUTCString(),
    category: 'Technology',
  },
  {
    title: 'Exam Week House Rules for Dutch Housemates',
    description: 'MMMS-2025 shows most HBO and university students still report heavy study stress. Shared houses need temporary quiet, kitchen, and guest norms when tentamenweek arrives.',
    url: `${BASE_URL}/blog/exam-week-house-rules-netherlands`,
    pubDate: new Date('2026-09-16').toUTCString(),
    category: 'Wellbeing',
  },
  {
    title: 'Overnight Guest Rules in Dutch Student Houses',
    description: 'Provider house rules and housemate consent are different layers. SSH, campus providers, and informal flats set overnight guest norms in incompatible ways until someone writes them down.',
    url: `${BASE_URL}/blog/overnight-guest-rules-dutch-student-houses`,
    pubDate: new Date('2026-09-09').toUTCString(),
    category: 'Boundaries',
  },
  {
    title: 'Roommate Chore Fairness in Dutch Student Houses',
    description: 'A schoonmaakrooster is not fairness by itself. Student houses clash when people count contribution differently: hours, standards, or invisible noticing work.',
    url: `${BASE_URL}/blog/roommate-chore-fairness-netherlands`,
    pubDate: new Date('2026-09-02').toUTCString(),
    category: 'Compatibility',
  },
  {
    title: 'Housemate Support When Living Away From Home',
    description: 'Inholland and national wellbeing data show students living away from home face more loneliness and stress. The overlooked variable is how housemates negotiate everyday emotional support.',
    url: `${BASE_URL}/blog/housemate-support-living-away-from-home`,
    pubDate: new Date('2026-08-26').toUTCString(),
    category: 'Wellbeing',
  },
  {
    title: 'Student Housing Search Abandonment in the Netherlands',
    description: 'Kences reports fewer Dutch students even try to find a room. When 44% live away but only 49% still want to, official shortage figures understate lived scarcity.',
    url: `${BASE_URL}/blog/student-housing-search-abandonment-netherlands`,
    pubDate: new Date('2026-08-19').toUTCString(),
    category: 'Housing',
  },
  {
    title: 'Graduate Holdover: The Hidden Student Housing Bottleneck',
    description: 'Kences reports 57% of graduates still occupy student rooms after one year. CBS housing flows and supply loss show why the Dutch shortage is deeper than vacancy headlines.',
    url: `${BASE_URL}/blog/graduate-holdover-student-housing-netherlands`,
    pubDate: new Date('2026-08-12').toUTCString(),
    category: 'Housing',
  },
  {
    title: 'Private Landlords Are Leaving Student Housing: What the Dutch Supply Shock Means for Renters',
    description: 'Kences and NOS reporting shows private landlords selling student homes as rental rules tighten. Here is how that supply loss interacts with woningdelen policy and municipal responses.',
    url: `${BASE_URL}/blog/private-landlords-student-housing-netherlands`,
    pubDate: new Date('2026-08-05').toUTCString(),
    category: 'Housing',
  },
  {
    title: 'More Dutch Students Live at Home: What CBS Data Reveals About Housing',
    description: 'CBS and NIDI figures show 43% of 2023 graduates never moved out during study. The shift tracks room shortages, rental reform, and uneven access between HBO and university students.',
    url: `${BASE_URL}/blog/thuiswonend-studenten-nederland-cbs-data`,
    pubDate: new Date('2026-07-22').toUTCString(),
    category: 'Retention',
  },
  {
    title: 'Student Housing Loneliness in the Netherlands: What the Data Actually Show',
    description: 'Kences and CBS figures show fewer students live on their own. Room shortages, studio campuses, and verkamering pressure reshape loneliness as a housing indicator.',
    url: `${BASE_URL}/blog/student-housing-loneliness-netherlands`,
    pubDate: new Date('2026-07-15').toUTCString(),
    category: 'Wellbeing',
  },
  {
    title: 'International Student Housing Rights in the Netherlands: What Happens After Move-In',
    description: 'LSVb logged 263 international housing help requests in 2026. From illegal rents to vanishing huurteams, here is why tenant rights fail to activate under shortage pressure.',
    url: `${BASE_URL}/blog/international-student-housing-rights-netherlands`,
    pubDate: new Date('2026-07-08').toUTCString(),
    category: 'Safety',
  },
  {
    title: 'Student Co-Living Rules Are Blocking Dutch Housing Supply',
    description: 'National policy wants easier room sharing, but municipal parking norms, permit rules, and split-housing limits still remove thousands of student rooms from the market each year.',
    url: `${BASE_URL}/blog/student-housing-co-living-rules-netherlands`,
    pubDate: new Date('2026-07-01').toUTCString(),
    category: 'Housing',
  },
  {
    title: 'Roommate Conflict Resolution Tips for Dutch Students',
    description: 'Cleanliness and noise dominate housing disputes. GMJV 2024, Resto VanHarte loneliness figures, and university guidance show how to de-escalate before grades suffer.',
    url: `${BASE_URL}/blog/roommate-conflict-resolution-tips-netherlands`,
    pubDate: new Date('2026-06-10').toUTCString(),
    category: 'Wellbeing',
  },
  {
    title: 'International Student Housing in the Netherlands: Where Data Meets Integration Risk',
    description: 'Kences figures via NOS, Nuffic evidence on graduates who leave because of housing, and municipal routing in Breda show why room access is an integration indicator, not a side file.',
    url: `${BASE_URL}/blog/international-student-housing-netherlands-isolation`,
    pubDate: new Date('2026-05-20').toUTCString(),
    category: 'Integration',
  },
  {
    title: 'Student Housing Shortage Is a Retention Line Item: What Dutch Data Says About Staying Home',
    description: 'Dutch reporting ties room shortages to more students staying home and stressed international searches. Here is the executive view on hidden costs and why structured matching is retention infrastructure.',
    url: `${BASE_URL}/blog/student-housing-shortage-retention-roi`,
    pubDate: new Date('2026-05-13').toUTCString(),
    category: 'Housing',
  },
  {
    title: 'Beyond Beds: The Hidden ROI of Fixing Europe’s Student Housing Gap Before Retention Breaks',
    description: 'Room shortages and roommate mismatch are not peripheral problems. They tax wellbeing, grades, and persistence - while clearer intake and compatibility infrastructure pays back upstream.',
    url: `${BASE_URL}/blog/student-housing-gap-retention-roi`,
    pubDate: new Date('2026-05-06').toUTCString(),
    category: 'Retention',
  },
  {
    title: 'Move-In Week Red Flags: Signs Your Living Situation Might Tank Your Semester',
    description: 'You usually know in the first two weeks if something feels off. Learn which early warning signs to take seriously, what you can still adjust, and when to involve support.',
    url: `${BASE_URL}/blog/move-in-week-red-flags`,
    pubDate: new Date('2026-02-09').toUTCString(),
    category: 'Wellbeing',
  },
  {
    title: 'Group Chats, Ground Rules: Setting House Norms Without Killing the Vibe',
    description: 'Every flat has rules. The healthy ones write them down. Use a short house meeting to turn invisible expectations into clear agreements around noise, guests and cleaning.',
    url: `${BASE_URL}/blog/group-chats-ground-rules`,
    pubDate: new Date('2026-02-02').toUTCString(),
    category: 'Boundaries',
  },
  {
    title: 'When Dishes = Disrespect: How Tiny Tasks Turn Into Big Resentments',
    description: 'No one explodes over one plate. Learn why chores become emotional, how “fair” turns into resentment, and what questions prevent a slow conflict build.',
    url: `${BASE_URL}/blog/when-dishes-equal-disrespect`,
    pubDate: new Date('2026-01-27').toUTCString(),
    category: 'Compatibility',
  },
  {
    title: 'Night Owl vs. 8 A.M. Lecture: Matching Sleep Schedules Before They Clash',
    description: 'Sleep is the quiet engine behind your degree. Learn how mismatched sleep schedules create predictable conflict, and how to talk about routines before you share a wall.',
    url: `${BASE_URL}/blog/night-owl-vs-8am-lecture`,
    pubDate: new Date('2026-01-20').toUTCString(),
    category: 'Health',
  },
  {
    title: 'Surviving the Winter Blues: Why Who You Live With Matters',
    description: 'Short days and exam stress can make isolation feel heavier. The right living situation adds gentle structure and support, while the wrong one can amplify withdrawal.',
    url: `${BASE_URL}/blog/surviving-the-winter-blues`,
    pubDate: new Date('2026-01-10').toUTCString(),
    category: 'Wellbeing',
  },
  {
    title: 'The Introvert’s Survival Guide to Shared Living',
    description: 'If your social battery drains fast, home needs to be a charging dock, not another performance. A practical guide to quiet hours, boundaries, and choosing housemates who respect alone time.',
    url: `${BASE_URL}/blog/introverts-survival-guide-shared-living`,
    pubDate: new Date('2026-01-03').toUTCString(),
    category: 'Wellbeing',
  },
  {
    title: 'Why "I’m Clean" Is a Lie (And What to Ask Instead)',
    description: '“Clean” is not a standard, it is a self-image. Use behaviour-based questions to align expectations about dishes, bathrooms, and shared spaces before resentment starts.',
    url: `${BASE_URL}/blog/why-im-clean-is-a-lie`,
    pubDate: new Date('2025-12-15').toUTCString(),
    category: 'Compatibility',
  },
  {
    title: 'The Hidden Cost of the Wrong Roommate (It’s Not Just Rent)',
    description: 'Bad roommate matches are expensive in ways students rarely budget for: stress, sleep loss, broken agreements, emergency moves, and the slow damage to study focus.',
    url: `${BASE_URL}/blog/hidden-cost-of-wrong-roommate`,
    pubDate: new Date('2025-12-05').toUTCString(),
    category: 'Finance',
  },
  {
    title: 'The "Third Wheel" Policy: Handling Significant Others in Shared Spaces',
    description: 'Partners and guests can quietly reshape your home. Set fair limits around overnight stays, shared resources, and privacy before a two-person flat becomes a three-person one.',
    url: `${BASE_URL}/blog/third-wheel-policy-significant-others`,
    pubDate: new Date('2025-11-28').toUTCString(),
    category: 'Boundaries',
  },
  {
    title: 'The "Best Friend" Trap: Why Your Bestie Might Be Your Worst Roommate',
    description: 'Friendship chemistry is real, but it is not the same as living compatibility. Stress-test sleep, guests, chores, money, and conflict style before you sign a lease.',
    url: `${BASE_URL}/blog/best-friend-trap-worst-roommate`,
    pubDate: new Date('2025-11-20').toUTCString(),
    category: 'Compatibility',
  },
  {
    title: 'How to Find a Great Roommate',
    description: 'A great roommate is less about “good vibes” and more about predictable habits. Use this checklist to screen for routines, boundaries, money reliability, and communication before you share a kitchen.',
    url: `${BASE_URL}/blog/how-to-find-a-great-roommate`,
    pubDate: new Date('2025-11-15').toUTCString(),
    category: 'Compatibility',
  },
  {
    title: 'Safety Checklist for Student Renters',
    description: 'A practical safety checklist for renting in the Netherlands: verify listings, review contracts, avoid common scam patterns, and protect yourself before you pay a deposit.',
    url: `${BASE_URL}/blog/safety-checklist-for-student-renters`,
    pubDate: new Date('2025-11-10').toUTCString(),
    category: 'Safety',
  },
  {
    title: 'Why Explainable AI Matters',
    description: 'If a system recommends who you should live with, you deserve to understand the reasoning. Explainable AI is the difference between a “black box” score and an outcome you can actually evaluate.',
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
