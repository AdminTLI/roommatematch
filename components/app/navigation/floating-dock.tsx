'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, MessageCircle, Shield, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FloatingDock() {
    const pathname = usePathname()

    const tabs = [
        { id: 'dashboard', label: 'Home', icon: Home, href: '/dashboard' },
        { id: 'matches', label: 'Connect', icon: Users, href: '/matches' },
        { id: 'chats', label: 'Chats', icon: MessageCircle, href: '/chat' },
        { id: 'safety', label: 'Safety', icon: Shield, href: '/safety' },
        { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
    ]

    // Check if we are on one of the main tabs to highlight
    const activeTabId = tabs.find(tab => {
        // Exact match for dashboard
        if (tab.href === '/dashboard' && pathname === '/dashboard') return true
        // Prefix match for others (e.g. /chat/123 should highlight /chat)
        if (tab.href !== '/dashboard' && pathname.startsWith(tab.href)) return true
        return false
    })?.id || ''

    return (
        <div className="fixed bottom-4 inset-x-0 w-full z-50 pointer-events-none flex justify-center px-4">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="pointer-events-auto bg-white/25 dark:bg-slate-900/25 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 dark:border-white/20 rounded-full p-2.5 flex items-center justify-center shadow-[0_0_28px_rgba(15,23,42,0.08)] dark:shadow-[0_0_32px_rgba(0,0,0,0.4)]"
            >
                <div className="flex items-center space-x-2 sm:space-x-3">
                    {tabs.map((tab) => {
                        const isActive = activeTabId === tab.id
                        const Icon = tab.icon

                        return (
                            <Link key={tab.id} href={tab.href} className="relative group">
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-indigo-600 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <div className={cn(
                                    "relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-colors duration-200 z-10",
                                    !isActive && "text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/50"
                                )}>
                                    <Icon className={cn(
                                        "w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-200",
                                        isActive ? "text-white" : "text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                                    )} />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </motion.div>
        </div>
    )
}
