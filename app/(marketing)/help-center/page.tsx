import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'

export const metadata = { title: 'Help Center | Domu Match' }

const faqs = [
  { q: 'Getting started', a: 'Create an account, verify your identity, and complete the compatibility quiz.' },
  { q: 'Account & verification', a: 'We verify with government ID + selfie and university email for safety.' },
  { q: 'Matching & scores', a: 'Scores are based on 40+ factors. We show why you matched for transparency.' },
  { q: 'Safety & reporting', a: 'Report any concern from a profile or chat. Our team reviews every report.' }
]

export default function HelpCenterPage() {
  return (
    <main>
      <Section className="bg-white">
        <Container>
          <h1 className="text-4xl font-bold mb-6 text-brand-text">Help Center</h1>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((f, i) => (
              <div key={i} className="rounded-2xl border border-brand-border bg-white p-6">
                <h2 className="text-xl font-semibold mb-2">{f.q}</h2>
                <p className="text-brand-muted">{f.a}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}


