import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium rounded-2xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-elev-2 hover:bg-primary/90 dark:hover:bg-primary/80 active:translate-y-[1px]",
        outline: "border border-border-subtle dark:border-border text-text-primary dark:text-text-primary hover:bg-bg-surface-alt dark:hover:bg-bg-surface-alt hover:border-semantic-accent dark:hover:border-semantic-accent",
        ghost: "text-text-primary dark:text-text-primary hover:bg-bg-surface-alt dark:hover:bg-bg-surface-alt",
        destructive: "bg-destructive text-destructive-foreground shadow-elev-2 hover:bg-destructive/90 dark:hover:bg-destructive/80 active:translate-y-[1px]",
        secondary: "bg-secondary text-secondary-foreground shadow-elev-1 hover:bg-secondary/80 dark:hover:bg-secondary/70",
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