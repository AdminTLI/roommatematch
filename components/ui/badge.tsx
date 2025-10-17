import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-600 text-white hover:bg-brand-700",
        secondary:
          "border-transparent bg-surface-2 text-ink-700 hover:bg-surface-3",
        destructive:
          "border-transparent bg-rose-600 text-white hover:bg-rose-700",
        outline: "text-ink-700 border-line",
        accent: "border-transparent bg-accent-600 text-white hover:bg-accent-700",
        mint: "border-transparent bg-mint-600 text-white hover:bg-mint-700",
        success: "border-transparent bg-mint-100 text-mint-800 border-mint-200",
        warning: "border-transparent bg-accent-100 text-accent-800 border-accent-200",
        error: "border-transparent bg-rose-100 text-rose-800 border-rose-200",
        info: "border-transparent bg-brand-100 text-brand-800 border-brand-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
