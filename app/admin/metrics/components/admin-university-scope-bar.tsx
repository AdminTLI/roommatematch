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
import { ADMIN_FIELD_CLASS, ADMIN_LABEL_CLASS } from '@/lib/admin/ui'

const NONE = '__none__'

type Props = {
  isPlatformSuper: boolean
  universityOptions: Array<{ id: string; name: string }>
  selectedUniversityId: string | null
  onUniversityChange: (id: string | null) => void
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
      <div className="space-y-1.5 min-w-[200px]">
        <Label className={ADMIN_LABEL_CLASS}>Institution</Label>
        <p className="flex h-10 items-center gap-2 text-sm text-gray-900 dark:text-gray-50">
          <Building2 className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          {lockedUniversityName?.trim() ? lockedUniversityName : 'Your assigned university'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5 min-w-[220px] flex-1 max-w-sm">
      <Label htmlFor="admin-metrics-university" className={ADMIN_LABEL_CLASS}>
        Institution
      </Label>
      <Select
        value={selectedUniversityId ?? NONE}
        onValueChange={(v) => onUniversityChange(v === NONE ? null : v)}
      >
        <SelectTrigger id="admin-metrics-university" className={ADMIN_FIELD_CLASS}>
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
    </div>
  )
})
