'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { markIntentionalSignOut } from '@/lib/auth/intentional-sign-out'

interface UserDropdownProps {
  user: {
    id: string
    email: string
    name: string
    avatar?: string
  }
}

export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    markIntentionalSignOut()
    await supabase.auth.signOut()
    router.push('/')
  }

  const initials =
    user.name?.[0]?.toUpperCase() || user.email.charAt(0).toUpperCase()

  const trigger = (
    <Button
      variant="ghost"
      className="relative h-10 w-10 rounded-full ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Open account menu"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar} alt="" />
        <AvatarFallback className="bg-semantic-accent text-white text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
    </Button>
  )

  // Prevent hydration mismatch by only rendering dropdown after mount
  if (!mounted) {
    return trigger
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        forceMount
        className="!max-h-none w-[min(18.5rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border-0 bg-transparent p-0 text-popover-foreground shadow-none"
      >
        {/*
          Theme via CSS variables (bg-popover / bg-secondary / text-foreground) so portaled
          content tracks .dark on <html> without relying on Tailwind dark: utilities.
        */}
        <div className="overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-lg">
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="mb-1 flex items-center gap-3 rounded-xl bg-secondary px-2.5 py-2.5">
              <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border">
                <AvatarImage src={user.avatar} alt="" />
                <AvatarFallback className="bg-semantic-accent text-white text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-sm font-semibold leading-tight text-foreground">
                  {user.name || 'User'}
                </p>
                <p className="truncate text-xs leading-tight text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="mx-1 my-1 bg-border" />

          <DropdownMenuItem
            onClick={() => router.push('/settings')}
            className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2.5 text-foreground focus:bg-secondary focus:text-foreground data-[highlighted]:bg-secondary data-[highlighted]:text-foreground"
          >
            <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-medium">Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2.5 text-foreground focus:bg-secondary focus:text-foreground data-[highlighted]:bg-secondary data-[highlighted]:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-medium">Sign out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
