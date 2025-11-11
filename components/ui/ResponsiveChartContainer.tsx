'use client'

import { cn } from '@/lib/utils'

interface ResponsiveChartContainerProps {
	children: React.ReactNode
	className?: string
	aspect?: number // width / height, e.g., 16/9
	mobileAspect?: number
}

export function ResponsiveChartContainer({
	children,
	className,
	aspect = 16 / 9,
	mobileAspect = 4 / 3,
}: ResponsiveChartContainerProps) {
	// Build aspect-ratio classes using inline style for arbitrary ratios
	const mobileStyle = { aspectRatio: `${mobileAspect}` }
	const desktopStyle = { aspectRatio: `${aspect}` }
	return (
		<div className={cn('w-full', className)}>
			<div className="md:hidden" style={mobileStyle}>
				<div className="w-full h-full">{children}</div>
			</div>
			<div className="hidden md:block" style={desktopStyle}>
				<div className="w-full h-full">{children}</div>
			</div>
		</div>
	)
}


