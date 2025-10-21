import Container from "@/components/ui/primitives/container"
import Link from "next/link"
import { Twitter, Linkedin, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#0B1220] text-slate-300">
      <Container className="py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-white text-xl font-semibold">Roommate Match</h3>
            <p className="text-slate-400 max-w-prose">The smartest way to find compatible roommates. Join thousands who found their perfect match.</p>
            <div className="flex items-center gap-3">
              <a aria-label="Twitter" className="rounded-full p-2 bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary"><Twitter size={18}/></a>
              <a aria-label="LinkedIn" className="rounded-full p-2 bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary"><Linkedin size={18}/></a>
              <a aria-label="Instagram" className="rounded-full p-2 bg-white/5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary"><Instagram size={18}/></a>
            </div>
          </div>

          {/* Columns */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-slate-400">
              <li><Link href="/how-it-works" className="hover:text-white">How it works</Link></li>
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/universities" className="hover:text-white">Universities</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3 text-slate-400">
              <li><a className="hover:text-white">About us</a></li>
              <li><a className="hover:text-white">Blog</a></li>
              <li><a className="hover:text-white">Careers</a></li>
              <li><a className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-slate-400">
              <li><a className="hover:text-white">Help center</a></li>
              <li><a className="hover:text-white">Safety</a></li>
              <li><a className="hover:text-white">Privacy policy</a></li>
              <li><a className="hover:text-white">Terms of service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Roommate Match. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <a className="hover:text-white">Cookies</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}