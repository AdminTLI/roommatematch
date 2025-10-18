import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        primary: "bg-brand-primary text-white shadow-elev-2 hover:bg-brand-primaryHover active:translate-y-[1px]",
        outline: "border border-brand-primary text-brand-primary hover:bg-brand-primary/5",
        ghost: "text-brand-primary hover:bg-brand-primary/5",
        destructive: "bg-red-600 text-white shadow-elev-2 hover:bg-red-700 active:translate-y-[1px]",
        secondary: "bg-brand-surface text-brand-text shadow-elev-1 hover:bg-brand-border",
      },
      size: {
        sm: "h-10 px-5 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
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