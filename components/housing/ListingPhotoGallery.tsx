'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Home, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListingPhotoGalleryProps {
  photos: string[]
  title: string
  /** Fill parent height (for side-by-side rent pane layout) */
  fill?: boolean
  className?: string
}

export function ListingPhotoGallery({
  photos,
  title,
  fill = false,
  className,
}: ListingPhotoGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const lightboxScrollerRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const titleId = useId()
  const count = photos.length

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToIndex = useCallback(
    (next: number, target?: HTMLDivElement | null) => {
      const el = target ?? scrollerRef.current
      if (!el || count === 0) return
      const clamped = ((next % count) + count) % count
      const width = el.clientWidth
      el.scrollTo({ left: clamped * width, behavior: 'smooth' })
      setIndex(clamped)
    },
    [count]
  )

  const openLightbox = useCallback(
    (atIndex: number) => {
      setIndex(atIndex)
      setLightboxOpen(true)
    },
    []
  )

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
    // Keep inline gallery in sync with lightbox position
    requestAnimationFrame(() => {
      scrollToIndex(index, scrollerRef.current)
    })
  }, [index, scrollToIndex])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const onScroll = () => {
      if (lightboxOpen) return
      const width = el.clientWidth || 1
      const next = Math.round(el.scrollLeft / width)
      setIndex(Math.max(0, Math.min(count - 1, next)))
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [count, lightboxOpen])

  // On open: jump lightbox scroller to the clicked photo once
  useEffect(() => {
    if (!lightboxOpen) return
    const raf = requestAnimationFrame(() => {
      const el = lightboxScrollerRef.current
      if (!el) return
      el.scrollTo({ left: index * (el.clientWidth || 1), behavior: 'auto' })
    })
    return () => cancelAnimationFrame(raf)
    // intentionally only when open toggles — index at open time is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen])

  // While open: keep index in sync with swipe
  useEffect(() => {
    if (!lightboxOpen) return
    let el: HTMLDivElement | null = null
    const onScroll = () => {
      if (!el) return
      const w = el.clientWidth || 1
      const next = Math.round(el.scrollLeft / w)
      setIndex(Math.max(0, Math.min(count - 1, next)))
    }
    const raf = requestAnimationFrame(() => {
      el = lightboxScrollerRef.current
      el?.addEventListener('scroll', onScroll, { passive: true })
    })
    return () => {
      cancelAnimationFrame(raf)
      el?.removeEventListener('scroll', onScroll)
    }
  }, [lightboxOpen, count])

  useEffect(() => {
    if (!lightboxOpen) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeLightbox()
        return
      }
      if (count < 2) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollToIndex(index + 1, lightboxScrollerRef.current)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollToIndex(index - 1, lightboxScrollerRef.current)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxOpen, count, index, closeLightbox, scrollToIndex])

  // Inline gallery keyboard only when lightbox closed
  useEffect(() => {
    if (lightboxOpen || count < 2) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollToIndex(index + 1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollToIndex(index - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, count, index, scrollToIndex])

  if (count === 0) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center rounded-2xl bg-zinc-100 text-zinc-300 dark:bg-zinc-800',
          fill ? 'h-full w-full' : 'h-64 sm:h-80',
          className
        )}
      >
        <Home className="h-12 w-12" />
      </div>
    )
  }

  const lightbox =
    mounted &&
    lightboxOpen &&
    createPortal(
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-0 sm:p-4"
        onClick={closeLightbox}
      >
        <h2 id={titleId} className="sr-only">
          {title} photos
        </h2>

        <button
          type="button"
          aria-label="Close photos"
          onClick={closeLightbox}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-5 sm:top-5"
        >
          <X className="h-5 w-5" />
        </button>

        <div
          className="relative flex h-full w-full max-h-[1080px] max-w-[1920px] items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={lightboxScrollerRef}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {photos.map((src, i) => (
              <div
                key={`lb-${src}-${i}`}
                className="flex h-full w-full shrink-0 snap-center items-center justify-center p-3 sm:p-6"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${title}, photo ${i + 1} of ${count}`}
                  draggable={false}
                  className="max-h-full max-w-full object-contain select-none"
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0.3'
                  }}
                />
              </div>
            ))}
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() =>
                  scrollToIndex(index - 1, lightboxScrollerRef.current)
                }
                className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:left-4 sm:flex md:left-6"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() =>
                  scrollToIndex(index + 1, lightboxScrollerRef.current)
                }
                className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-4 sm:flex md:right-6"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-full bg-black/55 px-3 py-1.5 text-sm font-medium tabular-nums text-white sm:bottom-6 sm:right-6">
            {index + 1}/{count}
          </div>
        </div>
      </div>,
      document.body
    )

  return (
    <>
      <div className={cn(fill ? 'relative h-full w-full' : 'space-y-3', className)}>
        <div
          className={cn(
            'group relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800',
            fill ? 'absolute inset-0 h-full w-full' : ''
          )}
        >
          <div
            ref={scrollerRef}
            className={cn(
              'flex snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-none',
              fill
                ? 'absolute inset-0 h-full w-full'
                : 'aspect-[16/10] w-full sm:aspect-[2/1] lg:aspect-[21/9]'
            )}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {photos.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                className="relative h-full w-full shrink-0 cursor-zoom-in snap-center border-0 bg-transparent p-0 text-left"
                onClick={() => openLightbox(i)}
                aria-label={`Open photo ${i + 1} of ${count}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${title}, photo ${i + 1}`}
                  draggable={false}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.opacity = '0'
                  }}
                />
              </button>
            ))}
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation()
                  scrollToIndex(index - 1)
                }}
                className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-sm transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation()
                  scrollToIndex(index + 1)
                }}
                className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-sm transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to photo ${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      scrollToIndex(i)
                    }}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === index
                        ? 'w-4 bg-white'
                        : 'w-1.5 bg-white/50 hover:bg-white/80'
                    )}
                  />
                ))}
              </div>

              <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/45 px-2.5 py-1 text-xs font-medium text-white">
                {index + 1} / {count}
              </div>
            </>
          )}
        </div>

        {!fill && count > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {photos.map((src, i) => (
              <button
                key={`thumb-${src}-${i}`}
                type="button"
                onClick={() => openLightbox(i)}
                className={cn(
                  'relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition',
                  i === index
                    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950'
                    : 'opacity-70 hover:opacity-100'
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      {lightbox}
    </>
  )
}
