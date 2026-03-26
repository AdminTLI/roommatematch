'use client'

import type { ReactNode } from 'react'
import { MarketingSubpageWrapperLight } from '@/app/(marketing)/components/marketing-subpage-wrapper-light'

type AuthWrapperLightProps = {
  children: ReactNode
  className?: string
}

export function AuthWrapperLight({ children, className = '' }: AuthWrapperLightProps) {
  return (
    <MarketingSubpageWrapperLight footer={false} className={`min-h-screen ${className}`}>
      {children}
    </MarketingSubpageWrapperLight>
  )
}

