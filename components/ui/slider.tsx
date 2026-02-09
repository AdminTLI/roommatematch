"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    variant?: 'default' | 'institutional'
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative h-2 w-full grow overflow-hidden rounded-full",
        variant === 'institutional'
          ? "bg-white/20"
          : "bg-secondary"
      )}
    >
      <SliderPrimitive.Range
        className={cn(
          "absolute h-full",
          variant === 'institutional' ? "bg-indigo-500" : "bg-primary"
        )}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block h-5 w-5 rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing",
        "translate-x-[-50%]",
        variant === 'institutional'
          ? "border-white/30 bg-slate-800 ring-offset-slate-950 focus-visible:ring-white focus-visible:ring-offset-slate-950"
          : "border-primary bg-background ring-offset-background focus-visible:ring-ring"
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }