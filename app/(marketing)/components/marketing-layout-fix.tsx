'use client'

import { useEffect } from 'react'

export function MarketingLayoutFix() {
    useEffect(() => {
        document.body.classList.add('marketing-page')

        // Less aggressive scroll lock prevention using only MutationObserver
        // We avoid the requestAnimationFrame loop to save battery/CPU
        const preventScrollLock = () => {
            const bodyStyle = document.body.style
            const htmlStyle = document.documentElement.style

            if (bodyStyle.overflow === 'hidden' || bodyStyle.overflow === 'clip') {
                bodyStyle.overflow = ''
            }
            if (htmlStyle.overflow === 'hidden' || htmlStyle.overflow === 'clip') {
                htmlStyle.overflow = ''
            }

            // Clean up Radix attributes if they exist
            if (document.body.hasAttribute('data-scroll-locked')) {
                document.body.removeAttribute('data-scroll-locked')
            }
            if (document.documentElement.hasAttribute('data-scroll-locked')) {
                document.documentElement.removeAttribute('data-scroll-locked')
            }
        }

        // Run once immediately
        preventScrollLock()

        // Use MutationObserver for reactivity instead of polling
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'style' ||
                        mutation.attributeName === 'class' ||
                        mutation.attributeName?.startsWith('data-'))) {
                    shouldCheck = true
                    break
                }
            }
            if (shouldCheck) preventScrollLock()
        })

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['style', 'class', 'data-scroll-locked']
        })
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['style', 'class', 'data-scroll-locked']
        })

        // Also override setProperty to block it at the source
        // This is much more efficient than polling
        const originalBodySetProperty = document.body.style.setProperty.bind(document.body.style)
        const originalHtmlSetProperty = document.documentElement.style.setProperty.bind(document.documentElement.style)

        document.body.style.setProperty = function (property: string, value: string, priority?: string) {
            if (property === 'overflow' && (value === 'hidden' || value === 'clip')) {
                return // Block scroll lock
            }
            return originalBodySetProperty(property, value, priority)
        }

        document.documentElement.style.setProperty = function (property: string, value: string, priority?: string) {
            if (property === 'overflow' && (value === 'hidden' || value === 'clip')) {
                return // Block scroll lock
            }
            return originalHtmlSetProperty(property, value, priority)
        }

        return () => {
            document.body.classList.remove('marketing-page')
            observer.disconnect()
            document.body.style.setProperty = originalBodySetProperty
            document.documentElement.style.setProperty = originalHtmlSetProperty
            preventScrollLock()
        }
    }, [])

    return null
}
