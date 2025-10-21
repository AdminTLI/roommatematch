'use client'

import { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  purpose: string
}

export function SectionIntro({ icon, title, purpose }: Props) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-1 text-indigo-600">{icon}</div>}
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600">{purpose}</p>
      </div>
    </div>
  )
}


