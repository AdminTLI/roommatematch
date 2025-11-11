import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import { ChevronDown } from 'lucide-react'

export function FAQ() {
  const faqs = [
    {
      question: "How does the roommate matching algorithm work?",
      answer: "Our algorithm analyzes 40+ compatibility factors including study habits, cleanliness preferences, social activities, quiet hours, and lifestyle choices. It uses cosine similarity to predict compatibility and prevent conflicts before they start."
    },
    {
      question: "What's included in the free pilot?",
      answer: "The pilot includes up to 500 students, basic matching algorithm, email support, admin dashboard, basic analytics, and white-label branding. It's perfect for testing our platform with a small cohort for 30 days."
    },
    {
      question: "How do you ensure student safety and verification?",
      answer: "Every student must complete government ID + selfie verification before accessing the platform. All chat is text-only, rate-limited, and moderated. We provide escalation paths for any concerns and work closely with university housing teams."
    },
    {
      question: "Can we integrate with our existing housing management system?",
      answer: "Yes! Our Enterprise plan includes API access and custom integrations. We can connect with most housing management systems and student information systems to streamline your workflow."
    },
    {
      question: "What kind of analytics and reporting do you provide?",
      answer: "Our admin dashboard shows real-time analytics including signup rates by university, compatibility scores, dispute resolution metrics, and housing satisfaction trends. Enterprise customers get custom reporting and compliance documentation."
    },
    {
      question: "How quickly can we get started?",
      answer: "Pilot universities can be up and running within 1 week. We provide complete onboarding, training for your housing team, and ongoing support. Most universities see results within the first 30 days."
    },
    {
      question: "What happens if students aren't satisfied with their matches?",
      answer: "We have a satisfaction guarantee. If students aren't happy with their matches, we work with your housing team to find better alternatives. Our algorithm continuously learns and improves based on feedback."
    },
    {
      question: "Do you support international students and different languages?",
      answer: "Yes! Our platform supports multiple languages and we have experience working with international student populations. We can customize the experience for different cultural preferences and housing needs."
    }
  ]

  return (
    <Section className="bg-slate-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-brand-muted max-w-2xl mx-auto">
            Everything you need to know about Domu Match for universities
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="border-brand-border">
              <Collapsible>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="text-left">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-brand-text">
                        {faq.question}
                      </CardTitle>
                      <ChevronDown className="h-5 w-5 text-brand-muted transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="text-brand-muted leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-brand-muted mb-4">
            Still have questions?
          </p>
          <p className="text-sm text-brand-muted">
            Contact our team at{' '}
            <a href="mailto:universities@domumatch.com" className="text-brand-primary hover:underline">
              universities@domumatch.com
            </a>
          </p>
        </div>
      </Container>
    </Section>
  )
}
