import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'

export const metadata = {
  title: 'About Us | Roommate Match'
}

export default function AboutPage() {
  return (
    <main>
      <Section className="bg-white">
        <Container>
          <h1 className="text-4xl font-bold mb-6 text-brand-text">About Roommate Match</h1>
          <p className="text-brand-muted max-w-3xl">Roommate Match helps students find compatible roommates using a science-driven compatibility model. We partner with universities and prioritize safety with government ID verification.</p>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            <div>
              <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
              <p className="text-brand-muted">Make student living safer, happier, and more compatible through transparent, explainable matching.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">What We Value</h2>
              <ul className="text-brand-muted list-disc pl-5 space-y-1">
                <li>Student safety above all</li>
                <li>Explainable technology</li>
                <li>Privacy-first design</li>
                <li>Partnership with universities</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Backed by Research</h2>
              <p className="text-brand-muted">Our model incorporates 40+ lifestyle and academic factors informed by social compatibility research and university housing best practices.</p>
            </div>
          </div>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}


