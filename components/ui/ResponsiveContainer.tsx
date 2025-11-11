'use client'

import Container from '@/components/ui/primitives/container'
import { cn } from '@/lib/utils'

interface ResponsiveContainerProps {
	children: React.ReactNode
	className?: string
	padded?: boolean
}

export function ResponsiveContainer({ children, className, padded = true }: ResponsiveContainerProps) {
	return (
		<Container className={cn(padded ? 'py-4 sm:py-6 lg:py-8' : '', 'safe-area-inset', className)}>
			{children}
		</Container>
	)
}


