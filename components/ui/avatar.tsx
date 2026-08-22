"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

/**
 * Sticky avatar image layered above AvatarFallback.
 *
 * Important: do not use Radix Avatar.Image for the visible photo. When `src`
 * changes it unmounts while status === "loading", which either flashes
 * initials or — if a custom img is also mounted — shows two flex children
 * side-by-side inside the circle.
 */
const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, src, alt, onLoadingStatusChange, onError, ...props }, ref) => {
  const [displaySrc, setDisplaySrc] = React.useState<string | undefined>(() =>
    typeof src === "string" && src.length > 0 ? src : undefined,
  )
  const displaySrcRef = React.useRef(displaySrc)
  displaySrcRef.current = displaySrc
  const lastGoodSrcRef = React.useRef(displaySrc)
  const srcRef = React.useRef(src)
  srcRef.current = src
  const onStatusRef = React.useRef(onLoadingStatusChange)
  onStatusRef.current = onLoadingStatusChange

  React.useEffect(() => {
    const next = typeof src === "string" && src.length > 0 ? src : undefined

    // Refetch gaps: keep the last good photo; never flash initials.
    if (!next) return
    if (next === displaySrcRef.current) return

    let cancelled = false
    const probe = new window.Image()
    probe.decoding = "async"
    probe.onload = () => {
      if (cancelled) return
      const commit = () => {
        if (cancelled) return
        setDisplaySrc(next)
        lastGoodSrcRef.current = next
        onStatusRef.current?.("loaded")
      }
      if (typeof probe.decode === "function") {
        probe.decode().then(commit).catch(commit)
      } else {
        commit()
      }
    }
    probe.onerror = () => {
      // Keep showing whatever already works; ignore failed candidates.
      if (cancelled || lastGoodSrcRef.current) return
      onStatusRef.current?.("error")
    }
    probe.src = next

    return () => {
      cancelled = true
    }
  }, [src])

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    onError?.(event)
    const latest =
      typeof srcRef.current === "string" && srcRef.current.length > 0
        ? srcRef.current
        : undefined
    const lastGood = lastGoodSrcRef.current

    // Prefer a fresher prop URL, then revert to the last good photo — never clear
    // to undefined while we still have something that loaded successfully.
    if (latest && latest !== displaySrcRef.current) {
      setDisplaySrc(latest)
      return
    }
    if (lastGood && lastGood !== displaySrcRef.current) {
      setDisplaySrc(lastGood)
      return
    }
    onStatusRef.current?.("error")
  }

  if (!displaySrc) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element -- signed/API avatar URLs; next/image not appropriate
    <img
      ref={ref}
      src={displaySrc}
      alt={alt ?? ""}
      className={cn(
        "absolute inset-0 z-[1] h-full w-full object-cover object-center",
        className,
      )}
      draggable={false}
      {...props}
      onError={handleError}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, delayMs = 0, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    delayMs={delayMs}
    className={cn(
      // Underlay: stays mounted under the sticky image so initials never replace a photo.
      "flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-ink-700 font-medium",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
