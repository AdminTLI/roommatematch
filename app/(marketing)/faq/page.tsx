import { Metadata } from 'next'
import { MarketingSubpageWrapper } from '../components/marketing-subpage-wrapper'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Domu Match - Student Housing FAQ',
  description: 'Find answers to common questions about Domu Match roommate matching platform. Learn about verification, matching, safety, pricing, and student housing in the Netherlands.',
  keywords: [
    'Domu Match FAQ',
    'roommate matching questions',
    'student housing FAQ',
    'how does roommate matching work',
    'verification questions',
    'Netherlands student housing FAQ',
  ],
  openGraph: {
    title: 'Frequently Asked Questions | Domu Match',
    description: 'Find answers to common questions about Domu Match roommate matching platform.',
    type: 'website',
    url: 'https://domumatch.com/faq',
    siteName: 'Domu Match',
    images: [
      {
        url: 'https://domumatch.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Domu Match FAQ',
      },
    ],
  },
  alternates: {
    canonical: 'https://domumatch.com/faq',
  },
}

interface FAQItem {
  question: string
  answer: string
}

const faqData: { category: string; items: FAQItem[] }[] = [
  {
    category: 'Getting Started',
    items: [
      {
        question: 'Is Domu Match really free for students?',
        answer: 'Yes, Domu Match is completely free for all students in the Netherlands. There are no hidden fees, no premium tiers, and no charges for messaging or viewing matches. We believe finding a compatible roommate should be accessible to everyone.',
      },
      {
        question: 'Who can use Domu Match?',
        answer: 'Domu Match is available to students aged 17+ who are enrolled at Dutch universities and universities of applied sciences. You need a valid university email address to sign up and verify your student status.',
      },
      {
        question: 'How do I sign up?',
        answer: 'Simply click "Get Started" on our homepage, create an account with your university email, complete our compatibility questionnaire (takes about 10-15 minutes), and you\'ll start receiving matches immediately.',
      },
      {
        question: 'What universities does Domu Match work with?',
        answer: 'We partner with 50+ Dutch universities including UvA, VU Amsterdam, EUR, Utrecht University, TU Delft, Leiden University, Radboud University, and many more across the Netherlands.',
      },
      {
        question: 'Do I need to find housing first before using Domu Match?',
        answer: 'No! You can use Domu Match whether you\'re looking for roommates for an existing apartment or searching for housing together with potential matches. Many users find their roommate first, then search for housing together.',
      },
    ],
  },
  {
    category: 'Safety & Verification',
    items: [
      {
        question: 'How does Domu Match verify students?',
        answer: 'We verify all users through their university email address. This ensures that only legitimate students can access the platform. We also integrate with Dutch university systems where possible for additional verification.',
      },
      {
        question: 'Is my personal information safe?',
        answer: 'Yes. We\'re fully GDPR compliant and take data protection seriously. Your personal information is encrypted, never sold to third parties, and you have complete control over what information you share with matches.',
      },
      {
        question: 'Can I report suspicious behavior?',
        answer: 'Absolutely. Every profile has a report button. Our safety team reviews all reports within 24 hours and takes appropriate action, including account suspension or permanent bans for serious violations.',
      },
      {
        question: 'What information is visible to other users?',
        answer: 'Your first name, university, program, and the information you choose to share in your profile are visible to matches. Your email, phone number, and exact address are never shared unless you choose to share them directly.',
      },
      {
        question: 'Do you conduct background checks?',
        answer: 'We verify student status through university emails. We do not conduct criminal background checks, but we do have strict community guidelines and remove users who violate our terms of service.',
      },
    ],
  },
  {
    category: 'Matching Algorithm',
    items: [
      {
        question: 'How does the matching algorithm work?',
        answer: 'Our algorithm analyzes 40+ compatibility factors including sleep schedules, cleanliness preferences, social habits, study routines, noise tolerance, and personality traits. We use science-backed research on roommate compatibility to weight these factors appropriately.',
      },
      {
        question: 'What is a compatibility score?',
        answer: 'The compatibility score (0-100%) indicates how well you match with another student based on lifestyle factors. Scores above 70% indicate good compatibility, above 80% indicates excellent compatibility, and above 90% indicates exceptional compatibility.',
      },
      {
        question: 'Can I see why I was matched with someone?',
        answer: 'Yes! Unlike other platforms, we believe in explainable AI. When you view a match, you can see exactly which factors contributed to your compatibility score and which areas might require compromise.',
      },
      {
        question: 'Can I filter my matches?',
        answer: 'Yes. You can filter matches by university, program, gender (if relevant to your housing situation), location preferences, and move-in timeline. However, we encourage you to review all high-compatibility matches.',
      },
      {
        question: 'How often do I get new matches?',
        answer: 'New matches appear as new students complete their profiles. Most users receive 3-10 high-quality matches per week. The more complete your profile, the better matches you\'ll receive.',
      },
      {
        question: 'What if I have no matches?',
        answer: 'This is rare but can happen in smaller university cities or for very specific requirements. Try adjusting your filters, completing all profile sections, and ensuring your preferences aren\'t too restrictive. Contact support if you still have no matches after a week.',
      },
    ],
  },
  {
    category: 'Using the Platform',
    items: [
      {
        question: 'How do I message potential roommates?',
        answer: 'Once you have a match, simply click their profile and start a conversation through our secure in-app messaging. We provide conversation starters to break the ice!',
      },
      {
        question: 'Can I video call matches before meeting?',
        answer: 'Yes! We offer secure video chat within the platform so you can meet face-to-face before committing to meeting in person. This is especially helpful for international students.',
      },
      {
        question: 'What should I ask potential roommates?',
        answer: 'Focus on daily living habits: sleeping schedules, guests policies, cleaning routines, shared expenses expectations, and deal-breakers. Our platform provides suggested questions based on compatibility factors.',
      },
      {
        question: 'How many roommates can I match with at once?',
        answer: 'You can message unlimited matches simultaneously. We recommend having conversations with 3-5 potential roommates at a time to give each conversation proper attention.',
      },
      {
        question: 'Can I search for multiple roommates for a larger apartment?',
        answer: 'Yes! You can indicate you\'re looking for multiple roommates, and we\'ll match you with individuals or groups who are also seeking larger shared accommodation.',
      },
    ],
  },
  {
    category: 'Finding Housing',
    items: [
      {
        question: 'Does Domu Match provide housing listings?',
        answer: 'We focus on roommate matching, not housing listings. However, we provide resources and partnerships with housing platforms to help you find accommodation once you\'ve found compatible roommates.',
      },
      {
        question: 'What is the average rent in Amsterdam/Rotterdam/Utrecht?',
        answer: 'Amsterdam: €450-€1,200/month, Rotterdam: €350-€650/month, Utrecht: €450-€700/month. Prices vary significantly by neighborhood and room type (private vs. shared).',
      },
      {
        question: 'Should I sign a lease before finding roommates?',
        answer: 'We recommend finding compatible roommates first, then searching for housing together. This ensures all parties are committed and reduces the risk of incompatible living situations.',
      },
      {
        question: 'Can international students use Domu Match?',
        answer: 'Absolutely! Domu Match is perfect for international students. You just need to be enrolled at a Dutch university with a valid student email address.',
      },
    ],
  },
  {
    category: 'Account & Technical',
    items: [
      {
        question: 'How do I update my profile?',
        answer: 'Go to Settings > Profile and update any information. Your matches will automatically be recalculated if you change significant preferences.',
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes. Go to Settings > Privacy > Delete Account. Your data will be permanently deleted within 30 days in compliance with GDPR. You can reactivate within 7 days if you change your mind.',
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click "Forgot Password" on the login page. We\'ll send a reset link to your university email address. Links expire after 24 hours for security.',
      },
      {
        question: 'Is there a mobile app?',
        answer: 'Currently, Domu Match is a web application optimized for mobile browsers. A dedicated mobile app is planned for future release.',
      },
      {
        question: 'My university email changed. How do I update it?',
        answer: 'Contact support at support@domumatch.com with your old and new university email. We\'ll verify both emails and update your account within 24-48 hours.',
      },
    ],
  },
  {
    category: 'Pricing & Universities',
    items: [
      {
        question: 'Will Domu Match always be free?',
        answer: 'Yes. Domu Match is free for students and will always remain free. We may introduce premium features for universities in the future, but core student features will remain free.',
      },
      {
        question: 'How does Domu Match make money?',
        answer: 'We partner with universities and receive support from educational institutions who see value in reducing housing-related conflicts and improving student wellbeing.',
      },
      {
        question: 'My university isn\'t listed. Can I still use Domu Match?',
        answer: 'If you have a Dutch university email address (@*.nl), you can sign up. Contact us at info@domumatch.com to request official partnership with your institution.',
      },
    ],
  },
  {
    category: 'Troubleshooting',
    items: [
      {
        question: 'Why am I not receiving matches?',
        answer: 'Ensure your profile is 100% complete, your preferences aren\'t too restrictive, and your account is verified. Most users receive matches within 48 hours of completing their profile.',
      },
      {
        question: 'I can\'t verify my email address',
        answer: 'Check your spam folder. If you still don\'t see the email, request a new verification link from Settings. Use your official university email (@university.nl format).',
      },
      {
        question: 'Messages aren\'t sending',
        answer: 'Check your internet connection. If the problem persists, try logging out and back in. Contact support if issues continue.',
      },
      {
        question: 'How do I contact support?',
        answer: 'Email support@domumatch.com or use the in-app help center. We respond to all inquiries within 24 hours during business days.',
      },
    ],
  },
]

export default function FAQPage() {
  // Generate structured data for all FAQs
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        mainEntity: faqData.flatMap((category) =>
          category.items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          }))
        ),
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
            name: 'FAQ',
            item: 'https://domumatch.com/faq',
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
        <Section className="bg-slate-950">
          <Container>
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  Frequently Asked Questions
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Everything you need to know about finding compatible roommates with Domu Match
                </p>
              </div>

              {faqData.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-4">
                  <h2 className="text-2xl font-bold text-white border-b-2 border-violet-500/30 pb-2">
                    {category.category}
                  </h2>
                  <Accordion type="single" collapsible className="w-full">
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem key={itemIndex} value={`${categoryIndex}-${itemIndex}`} className="border-slate-700">
                        <AccordionTrigger className="text-left text-lg font-medium text-slate-200 hover:text-white hover:no-underline">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-400 leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center space-y-4 mt-12">
                <h2 className="text-2xl font-bold text-white">Still Have Questions?</h2>
                <p className="text-slate-400">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <a
                    href="mailto:support@domumatch.com"
                    className="inline-flex items-center justify-center px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors font-medium"
                  >
                    Email Support
                  </a>
                  <a
                    href="/help-center"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-slate-600 text-slate-200 rounded-lg hover:border-violet-500 hover:bg-violet-500/10 transition-colors font-medium"
                  >
                    Visit Help Center
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </MarketingSubpageWrapper>
    </>
  )
}
