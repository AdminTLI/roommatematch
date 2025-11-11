import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export default function Section({ className = '', children }: SectionProps) {
  return (
    <section className={`relative z-0 py-10 md:py-14 lg:py-20 ${className}`}>
      {children}
    </section>
  )
}