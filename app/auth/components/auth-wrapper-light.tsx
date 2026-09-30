'use client'

import type { ReactNode } from 'react'
import { MarketingSubpageWrapperLight } from '@/app/(marketing)/components/marketing-subpage-wrapper-light'

type AuthWrapperLightProps = {
  children: ReactNode
  className?: string
  /** Render the standard marketing footer */
  footer?: boolean
}

export function AuthWrapperLight({
  children,
  className = '',
  footer = false,
}: AuthWrapperLightProps) {
  return (
    <MarketingSubpageWrapperLight footer={footer} className={className}>
      {children}
    </MarketingSubpageWrapperLight>
  )
}
