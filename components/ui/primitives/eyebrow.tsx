import { cn } from "@/lib/utils"

interface EyebrowProps {
  children: React.ReactNode
  className?: string
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <div className={cn("text-sm font-medium text-slate-600 uppercase tracking-wide", className)}>
      {children}
    </div>
  )
}
