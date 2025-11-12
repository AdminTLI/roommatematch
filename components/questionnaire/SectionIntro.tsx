'use client'

import { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  purpose: string
}

export function SectionIntro({ icon, title, purpose }: Props) {
  return (
    <div className="flex items-start gap-3 sm:gap-2">
      {icon && <div className="mt-1 text-indigo-600 flex-shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        <h2 className="text-xl sm:text-lg font-semibold break-words">{title}</h2>
        <p className="text-base sm:text-sm text-gray-600 mt-1 break-words">{purpose}</p>
      </div>
    </div>
  )
}


