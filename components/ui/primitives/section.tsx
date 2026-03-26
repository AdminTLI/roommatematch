import { cn } from "@/lib/utils"

type SectionProps = React.ComponentPropsWithoutRef<'section'>

export default function Section({ className = '', children, ...props }: SectionProps) {
  return (
    <section
      {...props}
      className={cn('relative z-0 py-9 md:py-12 lg:py-[72px]', className)}
    >
      {children}
    </section>
  )
}