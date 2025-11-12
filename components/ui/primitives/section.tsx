import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
}

export default function Section({ className = '', children }: SectionProps) {
  return (
    <section className={`relative z-0 py-9 md:py-12 lg:py-[72px] ${className}`}>
      {children}
    </section>
  )
}