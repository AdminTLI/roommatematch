'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StackedCardListProps<T> {
	items: T[]
	getTitle?: (item: T) => React.ReactNode
	getSubtitle?: (item: T) => React.ReactNode
	renderBody: (item: T) => React.ReactNode
	className?: string
	density?: 'comfortable' | 'compact'
	onClickItem?: (item: T) => void
}

export function StackedCardList<T>({
	items,
	getTitle,
	getSubtitle,
	renderBody,
	className,
	density = 'comfortable',
	onClickItem,
}: StackedCardListProps<T>) {
	return (
		<div className={cn('space-y-4', className)}>
			{items.map((item, idx) => (
				<Card
					key={idx}
					className={cn('border border-line transition-shadow', onClickItem && 'cursor-pointer hover:shadow-md')}
					onClick={() => onClickItem?.(item)}
				>
					<CardHeader className={cn(density === 'compact' ? 'py-3' : 'py-4')}>
						{getTitle && <CardTitle className="text-base sm:text-lg">{getTitle(item)}</CardTitle>}
						{getSubtitle && <p className="text-sm text-ink-600">{getSubtitle(item)}</p>}
					</CardHeader>
					<CardContent className={cn(density === 'compact' ? 'py-3' : 'py-4')}>{renderBody(item)}</CardContent>
				</Card>
			))}
		</div>
	)
}


