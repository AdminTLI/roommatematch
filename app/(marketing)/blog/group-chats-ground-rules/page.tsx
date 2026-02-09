import { Metadata } from 'next'
import { GroupChatsGroundRulesArticle } from './article-content'

export const metadata: Metadata = {
  title:
    'Group Chats, Ground Rules: Setting House Norms Without Killing the Vibe | Domu Match',
  description:
    'Avoid 1 a.m. passive-aggressive messages. Learn how to turn Domu Match’s behavioural questions into simple, shared house rules before conflicts start.',
  keywords:
    'house rules roommates, student flat group chat, roommate expectations, setting boundaries roommates, Domu Match house norms',
  openGraph: {
    title:
      'Group Chats, Ground Rules: Setting House Norms Without Killing the Vibe',
    description:
      'A practical guide to using clear agreements—not just group chats—to keep shared living healthy, with help from Domu Match.',
    type: 'article',
    publishedTime: '2026-02-02',
    authors: ['Domu Match Team'],
  },
}

export default function GroupChatsGroundRulesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline:
          'Group Chats, Ground Rules: Setting House Norms Without Killing the Vibe',
        description:
          'Explains how to set clear house norms around noise, guests and cleaning using Domu Match’s questions as a starting point, instead of relying on chaotic group chats.',
        image: 'https://domumatch.com/images/logo.png',
        datePublished: '2026-02-02',
        dateModified: '2026-02-02',
        author: {
          '@type': 'Organization',
          name: 'Domu Match Team',
          url: 'https://domumatch.com',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Domu Match',
          logo: {
            '@type': 'ImageObject',
            url: 'https://domumatch.com/images/logo.png',
            width: 1200,
            height: 630,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id':
            'https://domumatch.com/blog/group-chats-ground-rules',
        },
        articleSection: 'Boundaries',
        keywords:
          'house rules roommates, student flat group chat, roommate expectations, setting boundaries roommates, Domu Match house norms',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://domumatch.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://domumatch.com/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Group Chats, Ground Rules',
            item:
              'https://domumatch.com/blog/group-chats-ground-rules',
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GroupChatsGroundRulesArticle />
    </>
  )
}

