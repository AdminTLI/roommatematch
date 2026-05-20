'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, MessageCircle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRealtimeInvalidation } from '@/hooks/use-realtime-invalidation'

interface BottomTabBarProps {
	user: {
		id: string
		email: string
		name: string
		avatar?: string
	}
}

const tabs = [
	{ name: 'Dashboard', href: '/dashboard', icon: Home },
	{ name: 'Matches', href: '/matches', icon: Users },
	{ name: 'Chat', href: '/chat', icon: MessageCircle, badge: true },
	{ name: 'Settings', href: '/settings', icon: Settings },
]

export function BottomTabBar({ user }: BottomTabBarProps) {
	const pathname = usePathname()
	const [unreadChatCount, setUnreadChatCount] = useState(0)
	const unreadDebounceRef = useRef<NodeJS.Timeout | null>(null)

	const fetchUnreadCount = useCallback(async () => {
		try {
			const response = await fetch('/api/chat/unread')
			if (response.ok) {
				const data = await response.json()
				setUnreadChatCount(data.total_unread || 0)
			} else {
				setUnreadChatCount(0)
			}
		} catch {
			setUnreadChatCount(0)
		}
	}, [])

	const debouncedFetchUnreadCount = useCallback(() => {
		if (unreadDebounceRef.current) clearTimeout(unreadDebounceRef.current)
		unreadDebounceRef.current = setTimeout(() => {
			void fetchUnreadCount()
		}, 500)
	}, [fetchUnreadCount])

	useEffect(() => {
		void fetchUnreadCount()
		return () => {
			if (unreadDebounceRef.current) clearTimeout(unreadDebounceRef.current)
		}
	}, [user.id, fetchUnreadCount])

	useRealtimeInvalidation({
		table: 'messages',
		event: 'INSERT',
		queryKeys: [],
		enabled: !!user.id,
		invalidateQueries: false,
		onInvalidate: debouncedFetchUnreadCount,
	})

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle bg-bg-surface/95 dark:bg-bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-bg-surface/80 dark:supports-[backdrop-filter]:bg-bg-surface/80 md:hidden pb-safe-bottom">
			<ul className="app-pt-safe-top grid grid-cols-4 h-20 w-full">
				{tabs.map((tab) => {
					const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
					const Icon = tab.icon
					return (
						<li key={tab.name} className="h-full w-full flex items-center justify-center">
							<Link
								href={tab.href}
								className={cn(
									'flex h-full w-full flex-col items-center justify-center gap-1.5 text-sm',
									isActive
										? 'text-semantic-accent'
										: 'text-text-muted hover:text-text-secondary',
								)}
								aria-current={isActive ? 'page' : undefined}
							>
								<div className="relative flex items-center justify-center">
									<Icon className="h-6 w-6" />
									{tab.badge && unreadChatCount > 0 && (
										<span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] rounded-full bg-semantic-danger text-white text-[10px] leading-[18px] px-1 text-center">
											{unreadChatCount > 99 ? '99+' : unreadChatCount}
										</span>
									)}
								</div>
								<span className="font-medium">{tab.name}</span>
							</Link>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}


