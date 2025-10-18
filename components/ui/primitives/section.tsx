import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
  background?: "white" | "tinted"
}

export function Section({ children, className, background = "white" }: SectionProps) {
  return (
    <section 
      className={cn(
        "py-14 md:py-20 lg:py-28",
        background === "tinted" ? "bg-brand-surface" : "bg-white",
        className
      )}
    >
      {children}
    </section>
  )
}
