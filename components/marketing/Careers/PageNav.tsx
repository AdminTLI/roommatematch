'use client'

import Link from 'next/link'

const ITEMS = [
  { href: '#tracks', label: 'Tracks' },
  { href: '#roles', label: 'Roles' },
  { href: '#focus', label: 'Focus' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#apply', label: 'Apply' },
]

export function PageNav() {
  return (
    <nav className="sticky top-14 z-30">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 py-2 shadow-sm">
          <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}


