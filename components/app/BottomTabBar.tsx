'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, MessageCircle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

	useEffect(() => {
		const supabase = createClient()

		const fetchUnreadCount = async () => {
			try {
				const { data: chatMembers } = await supabase
					.from('chat_members')
					.select('chat_id')
					.eq('user_id', user.id)

				if (!chatMembers || chatMembers.length === 0) {
					setUnreadChatCount(0)
					return
				}

				const chatIds = chatMembers.map((cm) => cm.chat_id)
				const { data: memberships } = await supabase
					.from('chat_members')
					.select('chat_id, last_read_at')
					.eq('user_id', user.id)
					.in('chat_id', chatIds)

				let totalUnread = 0
				for (const membership of memberships || []) {
					const lastReadAt = membership.last_read_at || new Date(0).toISOString()
					const { count } = await supabase
						.from('messages')
						.select('*', { count: 'exact', head: true })
						.eq('chat_id', membership.chat_id)
						.neq('user_id', user.id)
						.gt('created_at', lastReadAt)

					totalUnread += count || 0
				}

				setUnreadChatCount(totalUnread)
			} catch {
				setUnreadChatCount(0)
			}
		}

		fetchUnreadCount()
		const channel = supabase
			.channel('bottom-tabs-chat-updates')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'messages' },
				() => fetchUnreadCount(),
			)
			.subscribe()
		return () => {
			supabase.removeChannel(channel)
		}
	}, [user.id])

	return (
		<nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface-0/95 backdrop-blur supports-[backdrop-filter]:bg-surface-0/80 md:hidden">
			<ul className="safe-area-inset grid grid-cols-5 h-16">
				{tabs.map((tab) => {
					const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
					const Icon = tab.icon
					return (
						<li key={tab.name} className="h-full">
							<Link
								href={tab.href}
								className={cn(
									'flex h-full flex-col items-center justify-center gap-1 text-xs',
									isActive
										? 'text-brand-600'
										: 'text-ink-500 hover:text-ink-700',
								)}
								aria-current={isActive ? 'page' : undefined}
							>
								<div className="relative">
									<Icon className="h-5 w-5" />
									{tab.badge && unreadChatCount > 0 && (
										<span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] rounded-full bg-red-600 text-white text-[10px] leading-[18px] px-1 text-center">
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


