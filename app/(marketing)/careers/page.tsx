import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'

export const metadata = { title: 'Careers | Roommate Match' }

export default function CareersPage() {
  return (
    <main>
      <Section className="bg-white">
        <Container>
          <h1 className="text-4xl font-bold mb-6 text-brand-text">Careers</h1>
          <p className="text-brand-muted max-w-3xl">We’re building safer, happier student housing. Join an early team shipping research-backed products for real impact across campuses.</p>

          <div className="grid md:grid-cols-3 gap-8 mt-10">
            <div>
              <h2 className="text-xl font-semibold mb-2">Benefits</h2>
              <ul className="text-brand-muted list-disc pl-5 space-y-1">
                <li>Remote-first, flexible hours</li>
                <li>Learning & conference stipend</li>
                <li>Meaningful equity for early hires</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Values</h2>
              <ul className="text-brand-muted list-disc pl-5 space-y-1">
                <li>User trust and safety</li>
                <li>Evidence over opinions</li>
                <li>Accessible, inclusive design</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Open Roles</h2>
              <p className="text-brand-muted">No open roles yet. Send us a note describing your superpower and we’ll reach out.</p>
            </div>
          </div>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}


