import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export default function Section({ className = '', children }: SectionProps) {
  return (
    <section className={`relative z-0 py-14 md:py-20 lg:py-28 ${className}`}>
      {children}
    </section>
  )
}