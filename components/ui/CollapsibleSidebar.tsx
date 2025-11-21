'use client'

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

interface CollapsibleSidebarProps {
	sidebar: React.ReactNode
}

export function CollapsibleSidebar({ sidebar }: CollapsibleSidebarProps) {
	return (
		<>
			<aside className="hidden md:block md:w-64 md:flex-shrink-0">
				{sidebar}
			</aside>
			<div className="md:hidden">
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="ghost" size="sm" className="h-11 w-11 p-0">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Open navigation</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-64 p-0" aria-describedby={undefined}>
						<SheetTitle className="sr-only">Navigation menu</SheetTitle>
						{sidebar}
					</SheetContent>
				</Sheet>
			</div>
		</>
	)
}


