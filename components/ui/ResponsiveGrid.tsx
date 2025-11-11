'use client'

import { cn } from '@/lib/utils'

interface ResponsiveGridProps {
	children: React.ReactNode
	className?: string
	cols?: {
		sm?: number
		md?: number
		lg?: number
		xl?: number
	}
	gap?: string // Tailwind gap classes e.g., 'gap-4'
}

const toCols = (n?: number) => (n ? `grid-cols-${n}` : '')

export function ResponsiveGrid({ children, className, cols = { sm: 1, md: 2, lg: 3 }, gap = 'gap-4' }: ResponsiveGridProps) {
	return (
		<div
			className={cn(
				'grid',
				gap,
				cols.sm ? toCols(cols.sm) : 'grid-cols-1',
				cols.md && `md:${toCols(cols.md)}`,
				cols.lg && `lg:${toCols(cols.lg)}`,
				cols.xl && `xl:${toCols(cols.xl)}`,
				className,
			)}
		>
			{children}
		</div>
	)
}


