import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-pill text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 button-hover",
  {
    variants: {
      variant: {
        default: "bg-brand-600 text-white shadow-md hover:bg-brand-700 hover:shadow-elev-2",
        destructive:
          "bg-rose-600 text-white shadow-md hover:bg-rose-700 hover:shadow-elev-2",
        outline:
          "border border-line bg-surface-0 text-ink-900 shadow-sm hover:bg-surface-1 hover:shadow-elev-1",
        secondary:
          "bg-surface-2 text-ink-900 shadow-sm hover:bg-surface-3 hover:shadow-elev-1",
        ghost: "text-ink-700 hover:bg-surface-1 hover:text-ink-900",
        link: "text-brand-600 underline-offset-4 hover:underline hover:text-brand-700",
        accent: "bg-accent-600 text-white shadow-md hover:bg-accent-700 hover:shadow-elev-2",
        mint: "bg-mint-600 text-white shadow-md hover:bg-mint-700 hover:shadow-elev-2",
      },
      size: {
        default: "h-10 px-5 py-3",
        sm: "h-8 px-3 py-2 text-xs",
        lg: "h-12 px-6 py-4 text-base",
        xl: "h-14 px-8 py-5 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
