import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 active:translate-y-[1px]",
        outline:
          "border border-border-subtle dark:border-border text-gray-900 dark:text-text-primary hover:bg-bg-surface-alt dark:hover:bg-bg-surface-alt hover:border-indigo-500 dark:hover:border-indigo-400",
        ghost: "text-gray-900 dark:text-text-primary hover:bg-bg-surface-alt dark:hover:bg-bg-surface-alt",
        destructive: "bg-destructive text-destructive-foreground shadow-elev-2 hover:bg-destructive/90 dark:hover:bg-destructive/80 active:translate-y-[1px]",
        secondary:
          "bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:bg-indigo-600 active:translate-y-[1px]",
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
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
