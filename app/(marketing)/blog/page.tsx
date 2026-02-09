import { MarketingSubpageWrapper } from '../components/marketing-subpage-wrapper'
import { Metadata } from 'next'
import { BlogContent } from './blog-content'

export const metadata: Metadata = {
  title: 'Blog | Domu Match - Student Housing Insights & Tips',
  description: 'Explore articles on roommate compatibility, student renter safety, and explainable AI in housing. Your guide to harmonious student living in the Netherlands.',
  keywords: [
    'student housing blog',
    'roommate tips Netherlands',
    'rental safety guide',
    'explainable AI housing',
    'Domu Match blog',
    'Netherlands student life',
    'roommate compatibility tips',
    'student housing advice',
    'roommate matching blog',
  ],
  openGraph: {
    title: 'Blog | Domu Match - Student Housing Insights',
    description: 'Explore articles on roommate compatibility, student renter safety, and explainable AI in housing. Your guide to harmonious student living.',
    type: 'website',
    url: 'https://domumatch.com/blog',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Domu Match Blog - Student Housing Insights',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | Domu Match - Student Housing Insights',
    description: 'Explore articles on roommate compatibility, student renter safety, and explainable AI in housing.',
    images: ['https://domumatch.com/images/logo.png'],
  },
  alternates: {
    canonical: 'https://domumatch.com/blog',
  },
}

export default function BlogPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://domumatch.com' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://domumatch.com/blog' },
        ],
      },
      {
        '@type': 'CollectionPage',
        '@id': 'https://domumatch.com/blog/#webpage',
        url: 'https://domumatch.com/blog',
        name: 'Blog | Domu Match - Student Housing Insights & Tips',
        description:
          'Explore articles on roommate compatibility, cleaning expectations, guest policies, winter wellbeing, student renter safety and explainable AI in housing. Your guide to harmonious student living in the Netherlands.',
        hasPart: [
          {
            '@type': 'Article',
            name: 'Move-In Week Red Flags: Signs Your Living Situation Might Tank Your Semester',
            url: 'https://domumatch.com/blog/move-in-week-red-flags',
          },
          {
            '@type': 'Article',
            name: 'Group Chats, Ground Rules: Setting House Norms Without Killing the Vibe',
            url: 'https://domumatch.com/blog/group-chats-ground-rules',
          },
          {
            '@type': 'Article',
            name: 'When Dishes = Disrespect: How Tiny Tasks Turn Into Big Resentments',
            url: 'https://domumatch.com/blog/when-dishes-equal-disrespect',
          },
          {
            '@type': 'Article',
            name: 'Night Owl vs. 8 A.M. Lecture: Matching Sleep Schedules Before They Clash',
            url: 'https://domumatch.com/blog/night-owl-vs-8am-lecture',
          },
          {
            '@type': 'Article',
            name: 'Surviving the Winter Blues: Why Who You Live With Matters',
            url: 'https://domumatch.com/blog/surviving-the-winter-blues',
          },
          {
            '@type': 'Article',
            name: 'The Introvert’s Survival Guide to Shared Living',
            url: 'https://domumatch.com/blog/introverts-survival-guide-shared-living',
          },
          {
            '@type': 'Article',
            name: 'Why "I’m Clean" Is a Lie (And What to Ask Instead)',
            url: 'https://domumatch.com/blog/why-im-clean-is-a-lie',
          },
          {
            '@type': 'Article',
            name: 'The Hidden Cost of the Wrong Roommate (It’s Not Just Rent)',
            url: 'https://domumatch.com/blog/hidden-cost-of-wrong-roommate',
          },
          {
            '@type': 'Article',
            name: 'The "Third Wheel" Policy: Handling Significant Others in Shared Spaces',
            url: 'https://domumatch.com/blog/third-wheel-policy-significant-others',
          },
          {
            '@type': 'Article',
            name: 'The "Best Friend" Trap: Why Your Bestie Might Be Your Worst Roommate',
            url: 'https://domumatch.com/blog/best-friend-trap-worst-roommate',
          },
          {
            '@type': 'Article',
            name: 'How to Find a Great Roommate',
            url: 'https://domumatch.com/blog/how-to-find-a-great-roommate',
          },
          {
            '@type': 'Article',
            name: 'Safety Checklist for Student Renters',
            url: 'https://domumatch.com/blog/safety-checklist-for-student-renters',
          },
          {
            '@type': 'Article',
            name: 'Why Explainable AI Matters',
            url: 'https://domumatch.com/blog/why-explainable-ai-matters',
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingSubpageWrapper>
        <BlogContent />
      </MarketingSubpageWrapper>
    </>
  )
}
