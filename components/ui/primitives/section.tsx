import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export default function Section({ className = '', children }: SectionProps) {
  return (
    <section className={`relative z-0 py-12 md:py-16 lg:py-24 ${className}`}>
      {children}
    </section>
  )
}