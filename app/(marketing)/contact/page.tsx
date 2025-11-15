import Container from '@/components/ui/primitives/container'
import Section from '@/components/ui/primitives/section'
import Footer from '@/components/site/footer'
import { Navbar } from '@/components/site/navbar'

export const metadata = { title: 'Contact | Domu Match' }

export default function ContactPage() {
  return (
    <main>
      <Navbar />
      <Section className="bg-white">
        <Container>
          <h1 className="text-4xl font-bold mb-6 text-brand-text">Contact</h1>
          <p className="text-brand-muted mb-8 max-w-2xl">Questions or feedback? Use the form below or email us at <span className="font-medium">support@domumatch.app</span>.</p>

          <form className="grid gap-4 max-w-xl">
            <input className="border rounded-md px-4 py-3" placeholder="Your name" />
            <input className="border rounded-md px-4 py-3" placeholder="Email" type="email" />
            <textarea className="border rounded-md px-4 py-3 h-40" placeholder="How can we help?" />
            <button className="bg-brand-600 text-white px-5 py-3 rounded-md">Send</button>
          </form>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}


