'use client'

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'

interface MobileDrawerProps {
	user: {
		id: string
		email: string
		name: string
		avatar?: string
	}
}

export function MobileDrawer({ user }: MobileDrawerProps) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="sm" className="h-11 w-11 p-0 lg:hidden">
					<Menu className="h-5 w-5" />
					<span className="sr-only">Open navigation menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="left" className="w-64 p-0" aria-describedby={undefined}>
				<SheetTitle className="sr-only">Navigation menu</SheetTitle>
				<Sidebar user={user} />
			</SheetContent>
		</Sheet>
	)
}


