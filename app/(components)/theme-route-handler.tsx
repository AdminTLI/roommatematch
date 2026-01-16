'use client'

import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

export function ThemeRouteHandler() {
    const pathname = usePathname()
    const { setTheme } = useTheme()

    useEffect(() => {
        // Application pages that definitely use the Dark Mode aesthetic
        const isAppPage =
            pathname === '/dashboard' ||
            pathname?.startsWith('/matches') ||
            pathname?.startsWith('/chat') ||
            pathname?.startsWith('/safety') ||
            pathname?.startsWith('/settings') ||
            pathname?.startsWith('/notifications') ||
            pathname?.startsWith('/onboarding') ||
            pathname?.startsWith('/verify')

        // Marketing and Auth pages that should remain in Light Mode
        const isMarketingOrAuth =
            pathname === '/' ||
            pathname?.startsWith('/auth') ||
            pathname?.startsWith('/how-it-works') ||
            pathname?.startsWith('/features') ||
            pathname?.startsWith('/universities') ||
            pathname?.startsWith('/about') ||
            pathname?.startsWith('/privacy') ||
            pathname?.startsWith('/terms') ||
            pathname?.startsWith('/cookies')

        if (isAppPage) {
            setTheme('dark')
        } else if (isMarketingOrAuth) {
            setTheme('light')
        }
    }, [pathname, setTheme])

    return null
}
