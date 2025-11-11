import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'

export const metadata = { title: 'Blog | Domu Match' }

const posts = [
  { title: 'How to find a great roommate', excerpt: 'Evidence-based tips for compatibility and harmony in student housing.' },
  { title: 'Safety checklist for student renters', excerpt: 'Verification, contracts, and best practices for safe living.' },
  { title: 'Why explainable AI matters', excerpt: 'Understanding your matches builds trust and better decisions.' }
]

export default function BlogPage() {
  return (
    <main>
      <Section className="bg-white">
        <Container>
          <h1 className="text-4xl font-bold mb-6 text-brand-text">Blog</h1>
          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <article key={i} className="rounded-2xl border border-brand-border bg-white p-6">
                <h2 className="text-xl font-semibold mb-2">{p.title}</h2>
                <p className="text-brand-muted">{p.excerpt}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}


