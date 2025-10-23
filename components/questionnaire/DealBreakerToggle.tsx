'use client'

import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

interface Props {
  isDealBreaker?: boolean
  onChange: (v: boolean) => void
}

export function DealBreakerToggle({ isDealBreaker, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={isDealBreaker ? 'destructive' : 'secondary'}>DB</Badge>
      <Switch checked={!!isDealBreaker} onCheckedChange={onChange} />
      <span className="text-sm text-gray-700">Make this a deal-breaker</span>
    </div>
  )
}


