"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-xl border border-line bg-bg-surface px-3 py-2 text-body-sm text-gray-900 dark:text-text-primary ring-offset-background placeholder:text-gray-600 dark:placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 [&>span]:text-gray-900 dark:[&>span]:text-text-primary [&>span[data-placeholder]]:text-gray-600 dark:[&>span[data-placeholder]]:text-text-muted",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  disableScrollLock?: boolean
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", disableScrollLock = false, ...props }, ref) => {
  // Aggressively prevent scroll lock when disableScrollLock is true
  React.useLayoutEffect(() => {
    if (!disableScrollLock) return

    // Store original methods
    const originalBodySetProperty = document.body.style.setProperty.bind(document.body.style)
    const originalHtmlSetProperty = document.documentElement.style.setProperty.bind(document.documentElement.style)

    const preventScrollLock = () => {
      // Force remove all scroll lock indicators immediately
      if (document.body.style.overflow === 'hidden' || document.body.style.overflow === 'clip') {
        document.body.style.overflow = ''
      }
      if (document.documentElement.style.overflow === 'hidden' || document.documentElement.style.overflow === 'clip') {
        document.documentElement.style.overflow = ''
      }
      document.body.style.paddingRight = ''
      document.body.style.marginRight = ''
      document.body.style.position = ''
      document.body.removeAttribute('data-scroll-locked')
      document.body.removeAttribute('data-radix-scroll-lock')
      
      document.documentElement.style.paddingRight = ''
      document.documentElement.removeAttribute('data-scroll-locked')
      document.documentElement.removeAttribute('data-radix-scroll-lock')
    }

    // Intercept setProperty to prevent overflow: hidden BEFORE it's applied
    const bodySetPropertyProxy = function(property: string, value: string, priority?: string) {
      if (property === 'overflow' && (value === 'hidden' || value === 'clip')) {
        // Block the scroll lock attempt
        return
      }
      return originalBodySetProperty(property, value, priority)
    }

    const htmlSetPropertyProxy = function(property: string, value: string, priority?: string) {
      if (property === 'overflow' && (value === 'hidden' || value === 'clip')) {
        // Block the scroll lock attempt
        return
      }
      return originalHtmlSetProperty(property, value, priority)
    }

    // Override the methods
    document.body.style.setProperty = bodySetPropertyProxy
    document.documentElement.style.setProperty = htmlSetPropertyProxy

    // Run immediately (synchronously)
    preventScrollLock()

    // Use requestAnimationFrame for continuous checking (runs before paint)
    let rafId: number
    const checkLoop = () => {
      preventScrollLock()
      rafId = requestAnimationFrame(checkLoop)
    }
    rafId = requestAnimationFrame(checkLoop)

    // Also use a very frequent interval as backup
    const interval = setInterval(preventScrollLock, 5)

    // MutationObserver to catch any attribute changes
    const observer = new MutationObserver(() => {
      preventScrollLock()
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'data-scroll-locked', 'data-radix-scroll-lock'],
      attributeOldValue: false
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-scroll-locked', 'data-radix-scroll-lock'],
      attributeOldValue: false
    })

    return () => {
      cancelAnimationFrame(rafId)
      clearInterval(interval)
      observer.disconnect()
      // Restore original methods
      document.body.style.setProperty = originalBodySetProperty
      document.documentElement.style.setProperty = originalHtmlSetProperty
      preventScrollLock()
    }
  }, [disableScrollLock])

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-[calc(100vh-8rem)] min-w-[8rem] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-border-subtle bg-bg-surface text-text-primary shadow-elev-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1 overflow-y-auto",
            position === "popper" &&
              "w-full min-w-[var(--radix-select-trigger-width)] max-h-[min(320px,var(--radix-select-content-available-height,70vh))]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-2 pr-2 text-sm outline-none min-h-[44px] focus:bg-bg-surface-alt focus:text-text-primary data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:font-bold",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-line", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
