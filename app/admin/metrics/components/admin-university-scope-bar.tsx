'use client'

import { memo } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2 } from 'lucide-react'

const NONE = '__none__'

type Props = {
  isPlatformSuper: boolean
  universityOptions: Array<{ id: string; name: string }>
  selectedUniversityId: string | null
  onUniversityChange: (id: string | null) => void
  /** Shown to university admins (read-only context). */
  lockedUniversityName?: string | null
}

export const AdminUniversityScopeBar = memo(function AdminUniversityScopeBar({
  isPlatformSuper,
  universityOptions,
  selectedUniversityId,
  onUniversityChange,
  lockedUniversityName,
}: Props) {
  if (!isPlatformSuper) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm">
        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
        <span className="font-medium text-foreground">Institution</span>
        <span className="text-muted-foreground">
          {lockedUniversityName?.trim() ? lockedUniversityName : 'Your assigned university'}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4 min-w-0 flex-1 max-w-xl">
      <div className="space-y-1.5 flex-1 min-w-0">
        <Label htmlFor="admin-metrics-university" className="text-xs font-medium">
          Institution Scope
        </Label>
        <Select
          value={selectedUniversityId ?? NONE}
          onValueChange={(v) => onUniversityChange(v === NONE ? null : v)}
        >
          <SelectTrigger id="admin-metrics-university" className="h-10 w-full bg-background">
            <SelectValue placeholder="Select a university" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Choose a university…</SelectItem>
            {universityOptions.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground leading-snug">
          You can switch institutions at any time. All figures reload for the newly selected tenant.
        </p>
      </div>
    </div>
  )
})
