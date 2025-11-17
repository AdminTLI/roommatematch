import { Metadata } from 'next'
import { BlogPostLayout } from '@/components/marketing/blog-post-layout'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Safety Checklist for Student Renters: Verification, Contracts & Best Practices | Domu Match',
  description: 'Protect yourself from rental scams and understand your tenant rights in the Netherlands. A comprehensive safety checklist for student renters with Dutch rental law guidance.',
  keywords: 'student rental safety Netherlands, rental scams, Dutch tenant rights, student housing safety, rental contract Netherlands, Good Landlordship Act',
  openGraph: {
    title: 'Safety Checklist for Student Renters',
    description: 'Verification, contracts, and best practices for safe living in the Netherlands.',
    type: 'article',
    publishedTime: '2025-11-10',
    authors: ['Domu Match Team'],
  },
}

export default function SafetyChecklistPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: 'Safety Checklist for Student Renters: Verification, Contracts & Best Practices',
        description: 'Protect yourself from rental scams and understand your tenant rights in the Netherlands. A comprehensive safety checklist for student renters with Dutch rental law guidance.',
        image: 'https://domumatch.vercel.app/images/logo.png',
        datePublished: '2025-11-10',
        dateModified: '2025-11-10',
        author: {
          '@type': 'Organization',
          name: 'Domu Match Team',
          url: 'https://domumatch.vercel.app',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Domu Match',
          logo: {
            '@type': 'ImageObject',
            url: 'https://domumatch.vercel.app/images/logo.png',
            width: 1200,
            height: 630,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': 'https://domumatch.vercel.app/blog/safety-checklist-for-student-renters',
        },
        articleSection: 'Safety',
        keywords: 'student rental safety Netherlands, rental scams, Dutch tenant rights, student housing safety',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://domumatch.vercel.app',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://domumatch.vercel.app/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Safety Checklist for Student Renters',
            item: 'https://domumatch.vercel.app/blog/safety-checklist-for-student-renters',
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
      <BlogPostLayout
      title="Safety Checklist for Student Renters"
      excerpt="Verification, contracts, and best practices for safe living in the Netherlands. Protect yourself from rental scams and understand your tenant rights."
      publishDate="2025-11-10"
      readTime="5 min read"
      relatedLinks={[
        {
          title: 'Get Verified',
          href: '/verify',
          description: 'Complete ID verification to ensure you and your potential roommates are verified students.',
        },
        {
          title: 'Safety & Security',
          href: '/safety',
          description: 'Learn more about our safety measures and verification processes.',
        },
        {
          title: 'Privacy Policy',
          href: '/privacy',
          description: 'Understand how we protect your personal information and data.',
        },
      ]}
      ctaTitle="Stay Safe with Verified Roommates"
      ctaDescription="Join a community of verified students. Our ID verification process ensures you're connecting with real students, not scammers."
      ctaHref="/verify"
      ctaText="Get Verified"
    >
      <div className="space-y-8">
        <p className="text-lg text-brand-muted leading-relaxed">
          The competitive Dutch student housing market creates opportunities for scammers and fraudulent landlords. With a shortage of 23,100 student accommodations across major cities and average rents reaching €683 per month (and €979 in Amsterdam), students are often desperate to secure housing quickly, making them vulnerable targets.
        </p>

        <p>
          Understanding Dutch rental law, recognizing red flags, and following proper verification procedures can protect you from financial loss, unsafe living conditions, and legal complications. This comprehensive checklist will help you navigate the rental process safely and confidently.
        </p>

        <h2>The Reality of Rental Fraud in the Netherlands</h2>

        <p>
          Rental scams are unfortunately common in the Dutch student housing market. Scammers take advantage of the housing shortage by creating fake listings, requesting deposits for properties they don't own, or using stolen identity documents to appear legitimate. The high demand and time pressure students face make them particularly vulnerable.
        </p>

        <p>
          The Dutch Authority for Consumers and Markets (ACM) and consumer organizations like Consumentenbond regularly warn students about rental fraud. Common tactics include:
        </p>

        <ul>
          <li>Fake listings on popular housing platforms</li>
          <li>Requests for upfront payments before viewing properties</li>
          <li>Landlords who claim to be abroad and can't meet in person</li>
          <li>Pressure to sign contracts quickly without proper review</li>
          <li>Requests for personal documents or financial information before verification</li>
        </ul>

        <h2>Pre-Rental Verification Checklist</h2>

        <h3>1. Verify the Landlord's Identity</h3>

        <p>
          Before committing to any rental agreement, verify that the person you're dealing with actually owns or has the legal right to rent the property:
        </p>

        <ul>
          <li><strong>Request official identification:</strong> Ask to see a valid ID (passport or Dutch ID card) and verify the name matches the property owner.</li>
          <li><strong>Check property ownership:</strong> In the Netherlands, you can verify property ownership through the Kadaster (Land Registry). Ask for the property's address and cross-reference it with public records if possible.</li>
          <li><strong>Meet in person:</strong> Insist on meeting the landlord or their authorized representative in person. Be wary of landlords who claim to be abroad and can only communicate via email or messaging apps.</li>
          <li><strong>Verify contact information:</strong> Use a phone number or email that's verifiable. Scammers often use temporary or unverifiable contact methods.</li>
        </ul>

        <h3>2. Inspect the Property Thoroughly</h3>

        <p>
          Never pay a deposit or sign a contract without viewing the property in person:
        </p>

        <ul>
          <li><strong>Schedule a viewing:</strong> Legitimate landlords will always allow property viewings. If someone refuses or makes excuses, it's a major red flag.</li>
          <li><strong>Check the address:</strong> Verify the property address matches the listing and that you're viewing the actual unit you'll be renting.</li>
          <li><strong>Inspect safety features:</strong> Check for smoke detectors, fire extinguishers, secure locks, and proper emergency exits. Dutch fire safety regulations are strict, and violations can have serious consequences.</li>
          <li><strong>Document the condition:</strong> Take photos or videos of the property's condition during the viewing. This protects you from false damage claims later.</li>
          <li><strong>Check for existing tenants:</strong> If the property is currently occupied, speak with current tenants if possible to verify the landlord's legitimacy.</li>
        </ul>

        <h3>3. Verify Your Potential Roommates</h3>

        <p>
          If you're joining an existing household or finding roommates, verify their identities too:
        </p>

        <ul>
          <li><strong>Meet in person:</strong> Always meet potential roommates face-to-face before committing to live together.</li>
          <li><strong>Request verification:</strong> Ask to see student ID or other verification documents. Legitimate students won't mind proving their identity.</li>
          <li><strong>Check references:</strong> If possible, speak with previous roommates or landlords.</li>
          <li><strong>Use verified platforms:</strong> Platforms like <Link href="/verify" className="text-brand-primary hover:underline">Domu Match</Link> verify all users through ID verification, ensuring you're connecting with real students.</li>
        </ul>

        <h2>Understanding Dutch Rental Contracts</h2>

        <p>
          The Netherlands has strong tenant protection laws, but you need to understand your contract to benefit from them. The Good Landlordship Act (Wet goed verhuurderschap), introduced in 2023, aims to promote fair rental practices and protect tenants from exploitation.
        </p>

        <h3>Essential Contract Elements</h3>

        <p>
          Your rental contract should clearly include:
        </p>

        <ul>
          <li><strong>Rent amount and payment terms:</strong> The exact monthly rent, when it's due, and acceptable payment methods.</li>
          <li><strong>Deposit details:</strong> The deposit amount (legally limited to a maximum of three months' rent for unfurnished properties), when it will be returned, and conditions for deductions.</li>
          <li><strong>Contract duration:</strong> Whether it's a fixed-term or indefinite contract, and notice periods for termination.</li>
          <li><strong>Included utilities:</strong> What's included in the rent (water, electricity, internet, etc.) and what you'll pay separately.</li>
          <li><strong>House rules:</strong> Any specific rules about guests, noise, pets, or other restrictions.</li>
          <li><strong>Maintenance responsibilities:</strong> Who's responsible for repairs and maintenance.</li>
        </ul>

        <h3>Red Flags in Rental Contracts</h3>

        <p>
          Watch out for these warning signs in contracts:
        </p>

        <ul>
          <li><strong>Illegal fees:</strong> Agency fees charged to tenants are prohibited when the intermediary acts for the landlord. You should not pay fees to rental agencies in most cases.</li>
          <li><strong>Unclear terms:</strong> Vague language about rent increases, deposit returns, or termination conditions.</li>
          <li><strong>Excessive restrictions:</strong> Unreasonable rules that limit your rights as a tenant.</li>
          <li><strong>Pressure to sign quickly:</strong> Legitimate landlords will give you time to review the contract and seek advice if needed.</li>
        </ul>

        <h3>Get Legal Review</h3>

        <p>
          If you're unsure about any contract terms, consider:
        </p>

        <ul>
          <li>Consulting your university's legal services or housing office</li>
          <li>Contacting the Housing Hotline (Woonlijn) for advice</li>
          <li>Reviewing resources from Consumentenbond or other consumer organizations</li>
        </ul>

        <h2>Financial Safety Measures</h2>

        <h3>Deposit Protection</h3>

        <p>
          Under Dutch law, deposits are limited and must be returned under specific conditions:
        </p>

        <ul>
          <li><strong>Maximum deposit:</strong> For unfurnished properties, the deposit cannot exceed three months' rent.</li>
          <li><strong>Deposit return:</strong> The landlord must return your deposit within 14 days after you move out, minus any legitimate deductions for damages beyond normal wear and tear.</li>
          <li><strong>Documentation:</strong> Keep records of all payments, including bank transfers or receipts. Never pay in cash without getting a receipt.</li>
        </ul>

        <h3>Payment Security</h3>

        <p>
          Protect yourself when making payments:
        </p>

        <ul>
          <li><strong>Use traceable methods:</strong> Bank transfers are preferred over cash payments, as they create a paper trail.</li>
          <li><strong>Never pay before viewing:</strong> Legitimate landlords will never ask for payment before you've seen the property and signed a contract.</li>
          <li><strong>Verify bank accounts:</strong> Ensure the bank account belongs to the landlord or a legitimate rental agency.</li>
          <li><strong>Keep all receipts:</strong> Maintain records of all payments, including rent, deposits, and utilities.</li>
        </ul>

        <h2>Safety When Meeting Potential Roommates</h2>

        <p>
          If you're meeting potential roommates for the first time:
        </p>

        <ul>
          <li><strong>Meet in public first:</strong> For initial meetings, choose a public place like a café or university campus.</li>
          <li><strong>Bring a friend:</strong> Having someone with you adds an extra layer of safety and provides a second opinion.</li>
          <li><strong>Inform others:</strong> Let friends or family know where you're going and when you expect to return.</li>
          <li><strong>Trust your instincts:</strong> If something feels off, don't ignore it. Your safety is more important than securing housing quickly.</li>
          <li><strong>Use verified platforms:</strong> Platforms that verify users reduce the risk of encountering fraudulent or dangerous individuals.</li>
        </ul>

        <h2>Municipal Registration Requirements</h2>

        <p>
          Dutch law requires all residents to register their address with the local municipality (gemeente). This registration:
        </p>

        <ul>
          <li>Is mandatory for legal residency</li>
          <li>Is necessary for obtaining a BSN (citizen service number), which you need for various administrative processes</li>
          <li>Must be done within five days of moving in</li>
          <li>Requires cooperation from your landlord, who must provide proof of residence</li>
        </ul>

        <p>
          If a landlord refuses to help with registration or makes excuses, it's a significant red flag. Legitimate landlords understand this is a legal requirement and will assist you.
        </p>

        <h2>Insurance Considerations</h2>

        <p>
          Protect yourself with appropriate insurance:
        </p>

        <ul>
          <li><strong>Liability insurance (aansprakelijkheidsverzekering):</strong> Covers damages you might accidentally cause to the property or others' belongings.</li>
          <li><strong>Contents insurance (inboedelverzekering):</strong> Protects your personal belongings against theft, fire, or water damage.</li>
          <li><strong>Check contract requirements:</strong> Some rental contracts require specific insurance coverage.</li>
        </ul>

        <h2>How Domu Match Protects You</h2>

        <p>
          At Domu Match, we understand the safety challenges students face in the Dutch rental market. That's why we've built verification and safety measures into our platform:
        </p>

        <ul>
          <li><strong>ID Verification:</strong> All users must complete ID verification, ensuring you're connecting with real students, not scammers or fraudulent accounts.</li>
          <li><strong>University Email Verification:</strong> We verify that users have valid university email addresses, adding an extra layer of authenticity.</li>
          <li><strong>Safe Communication:</strong> Our in-platform messaging system allows you to communicate with potential roommates without sharing personal contact information until you're ready.</li>
          <li><strong>Transparent Profiles:</strong> Verified users have clear profile indicators, so you know who you're dealing with.</li>
        </ul>

        <p>
          By using a platform that verifies all users, you significantly reduce your risk of encountering rental scams or fraudulent individuals. <Link href="/verify" className="text-brand-primary hover:underline">Complete your verification</Link> to join our community of verified students and start matching safely.
        </p>

        <h2>What to Do If You Suspect Fraud</h2>

        <p>
          If you encounter a potential scam or fraudulent listing:
        </p>

        <ul>
          <li><strong>Stop all communication:</strong> Don't provide any personal or financial information.</li>
          <li><strong>Report it:</strong> Report fraudulent listings to the platform where you found them, and consider reporting to the police if you've been defrauded.</li>
          <li><strong>Contact authorities:</strong> The Dutch police have a dedicated fraud reporting system. You can also contact the ACM or Consumentenbond for advice.</li>
          <li><strong>Warn others:</strong> If safe to do so, warn other students through social media groups or university forums.</li>
        </ul>

        <h2>Conclusion</h2>

        <p>
          Navigating the Dutch student rental market safely requires vigilance, knowledge of your rights, and proper verification procedures. The housing shortage creates pressure to act quickly, but taking time to verify landlords, review contracts, and protect yourself financially is essential.
        </p>

        <p>
          By following this checklist, understanding Dutch rental law, and using verified platforms, you can significantly reduce your risk of falling victim to rental scams. Remember: legitimate landlords and roommates will understand your need for verification and won't pressure you to make hasty decisions.
        </p>

        <p>
          Your safety and financial security are worth the extra time and effort. In a competitive market, being informed and cautious isn't just smart - it's essential. Take the time to verify, review, and protect yourself, and you'll find safe, legitimate housing that supports your university experience rather than complicating it.
        </p>
      </div>
    </BlogPostLayout>
    </>
  )
}

