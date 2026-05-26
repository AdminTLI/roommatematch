'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCog,
} from 'lucide-react'
import { ROLE_LABELS, ELEVATED_ROLES, type UserRole } from '@/lib/auth/role-constants'
import { useIsSuperAdmin } from '@/lib/auth/roles-client'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'

interface Assignment {
  id: string
  email: string
  role: UserRole
  user_id: string | null
  first_name: string | null
  last_name: string | null
  institution_id: string | null
  institution_name: string | null
  department_title: string | null
  notes: string | null
  status: 'pending' | 'active' | 'revoked'
  invite_sent_at: string | null
  activated_at: string | null
  created_at: string
}

interface UniversityOpt {
  id: string
  name: string
  city: string | null
  is_active: boolean
}

type FormState = {
  email: string
  role: Exclude<UserRole, 'user'>
  first_name: string
  last_name: string
  institution_id: string
  department_title: string
  notes: string
  send_invite: boolean
}

const DEFAULT_FORM: FormState = {
  email: '',
  role: 'admin',
  first_name: '',
  last_name: '',
  institution_id: '',
  department_title: '',
  notes: '',
  send_invite: true,
}

const ROLE_BADGE_CLASS: Record<Exclude<UserRole, 'user'>, string> = {
  super_admin:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  admin:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  moderator:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  university_admin:
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800',
}

const STATUS_BADGE_CLASS: Record<Assignment['status'], string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  revoked: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
}

export function RoleManagementPanel() {
  const { isSuperAdmin, isLoading: isRoleLoading } = useIsSuperAdmin()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [universities, setUniversities] = useState<UniversityOpt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Assignment['status']>('all')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const requiresInstitution = form.role === 'admin' || form.role === 'university_admin'

  const load = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)

    try {
      const [aRes, uRes] = await Promise.all([
        fetch('/api/admin/role-assignments'),
        fetch('/api/admin/universities-list'),
      ])
      if (!aRes.ok) {
        const body = await aRes.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to load role assignments')
      }
      const aData = await aRes.json()
      setAssignments(aData.assignments || [])

      if (uRes.ok) {
        const uData = await uRes.json()
        setUniversities(uData.universities || [])
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load role assignments')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (isSuperAdmin) {
      load()
    } else {
      setIsLoading(false)
    }
  }, [isSuperAdmin, load])

  useEffect(() => {
    if (isDialogOpen) {
      setError(null)
    }
  }, [isDialogOpen])

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        a.email.toLowerCase().includes(q) ||
        (a.first_name || '').toLowerCase().includes(q) ||
        (a.last_name || '').toLowerCase().includes(q) ||
        (a.institution_name || '').toLowerCase().includes(q) ||
        (a.department_title || '').toLowerCase().includes(q)
      )
    })
  }, [assignments, search, statusFilter])

  const summary = useMemo(() => {
    const total = assignments.length
    const active = assignments.filter((a) => a.status === 'active').length
    const pending = assignments.filter((a) => a.status === 'pending').length
    const byRole: Record<string, number> = {}
    for (const a of assignments) {
      byRole[a.role] = (byRole[a.role] || 0) + 1
    }
    return { total, active, pending, byRole }
  }, [assignments])

  if (isRoleLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking permissions…
        </CardContent>
      </Card>
    )
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray-600 dark:text-gray-400">
          Role Management is restricted to Super Admins. Ask a Super Admin to grant access.
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!form.email.trim()) {
      setError('Email is required')
      return
    }
    if (requiresInstitution && !form.institution_id) {
      setError('Institution is required for Admin and University Admin roles')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetchWithCSRF('/api/admin/role-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          role: form.role,
          first_name: form.first_name.trim() || null,
          last_name: form.last_name.trim() || null,
          institution_id: form.institution_id || null,
          department_title: form.department_title.trim() || null,
          notes: form.notes.trim() || null,
          send_invite: form.send_invite,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || data.hint || 'Failed to add role assignment')
      }
      if (form.send_invite && data.invite_sent === false) {
        throw new Error(
          data.invite_error ||
            'Assignment was saved but Supabase could not send the invite email. Configure SMTP and redirect URLs in the Supabase dashboard (Authentication → SMTP / URL configuration).'
        )
      }
      setSuccess(
        form.send_invite
          ? 'Invite sent. They will receive an email to complete institution onboarding.'
          : 'Assignment saved (no invite email sent).'
      )
      setForm(DEFAULT_FORM)
      setIsDialogOpen(false)
      await load(true)
    } catch (e: any) {
      setError(e?.message || 'Failed to add role assignment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResendInvite = async (id: string) => {
    setBusyId(id)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetchWithCSRF('/api/admin/role-assignments/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to resend invite')
      setSuccess('Invite re-sent.')
      await load(true)
    } catch (e: any) {
      setError(e?.message || 'Failed to resend invite')
    } finally {
      setBusyId(null)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this role assignment? The user will be downgraded to a regular user.')) return
    setBusyId(id)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetchWithCSRF(`/api/admin/role-assignments/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to revoke assignment')
      setSuccess('Assignment revoked.')
      await load(true)
    } catch (e: any) {
      setError(e?.message || 'Failed to revoke assignment')
    } finally {
      setBusyId(null)
    }
  }

  const handleRoleChange = async (id: string, role: UserRole) => {
    setBusyId(id)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetchWithCSRF(`/api/admin/role-assignments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to update role')
      setSuccess('Role updated.')
      await load(true)
    } catch (e: any) {
      setError(e?.message || 'Failed to update role')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total" value={summary.total} icon={<ShieldCheck className="h-4 w-4" />} tint="bg-gray-100 dark:bg-gray-900" />
        <SummaryCard label="Active" value={summary.active} icon={<CheckCircle2 className="h-4 w-4" />} tint="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300" />
        <SummaryCard label="Pending invites" value={summary.pending} icon={<Clock className="h-4 w-4" />} tint="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300" />
        <SummaryCard
          label="Super Admins"
          value={summary.byRole['super_admin'] || 0}
          icon={<UserCog className="h-4 w-4" />}
          tint="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Role Management
              </CardTitle>
              <CardDescription>
                Only roles you grant by email appear here. Default users (Student / Young
                Professional) live in the Users tab.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => load(true)}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Invite user
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Invite institution admin</DialogTitle>
                    <DialogDescription>
                      Enter their email and role. We&apos;ll send an invite link so they can set a
                      password and complete their institution profile.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label htmlFor="role-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="role-email"
                          type="email"
                          placeholder="person@example.com"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          className="pl-9"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Role *</Label>
                      <Select
                        value={form.role}
                        onValueChange={(v) => setForm((f) => ({ ...f, role: v as FormState['role'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ELEVATED_ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {form.role === 'super_admin' &&
                          'Full platform-wide access. Use sparingly.'}
                        {form.role === 'admin' &&
                          'Admin scoped to a single institution. Requires Institution below.'}
                        {form.role === 'university_admin' &&
                          'University-level admin. Requires Institution below.'}
                        {form.role === 'moderator' &&
                          'Can review reports/chats and moderate content. Optional institution scope.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="role-first">First name</Label>
                        <Input
                          id="role-first"
                          value={form.first_name}
                          onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="role-last">Last name</Label>
                        <Input
                          id="role-last"
                          value={form.last_name}
                          onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>
                        Institution {requiresInstitution ? '*' : <span className="text-gray-400">(optional)</span>}
                      </Label>
                      <Select
                        value={form.institution_id || 'none'}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, institution_id: v === 'none' ? '' : v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an institution" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">- No institution -</SelectItem>
                          {universities.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name} {u.city ? `· ${u.city}` : ''} {!u.is_active && '(inactive)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="role-title">Department / Title</Label>
                      <Input
                        id="role-title"
                        placeholder="e.g. Head of Student Housing"
                        value={form.department_title}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, department_title: e.target.value }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="role-notes">Notes</Label>
                      <Textarea
                        id="role-notes"
                        rows={3}
                        placeholder="Anything you want to remember about this person (why they were elevated, contact info, etc.)"
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <div>
                        <strong>Heads up:</strong> An invite email will be sent if the address is
                        not registered yet. The invitee completes registration at{' '}
                        <code>/institution/onboarding</code>, then accesses the institution portal.
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        setForm(DEFAULT_FORM)
                        setError(null)
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending invite…
                        </>
                      ) : (
                        'Invite User'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <AlertDescription className="text-green-800 dark:text-green-300">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search by email, name, institution…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-md"
            />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="py-10 text-center text-sm text-gray-500">Loading assignments…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500">
              {assignments.length === 0
                ? 'No role assignments yet. Click “Add role by email” to grant your first one.'
                : 'No assignments match your filters.'}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/40 text-left text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Person</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Institution</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Added</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {[a.first_name, a.last_name].filter(Boolean).join(' ') || '-'}
                        </div>
                        <div className="text-xs text-gray-500">{a.email}</div>
                        {a.department_title && (
                          <div className="text-xs text-gray-400 mt-0.5">{a.department_title}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={a.role}
                          onValueChange={(v) => handleRoleChange(a.id, v as UserRole)}
                          disabled={busyId === a.id}
                        >
                          <SelectTrigger className="w-44 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ELEVATED_ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABELS[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="mt-1">
                          <Badge variant="outline" className={`${ROLE_BADGE_CLASS[a.role as Exclude<UserRole, 'user'>]} border text-xs`}>
                            {ROLE_LABELS[a.role]}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {a.institution_name ? (
                          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            {a.institution_name}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_BADGE_CLASS[a.status]}>
                          {a.status === 'active' && 'Active'}
                          {a.status === 'pending' && 'Pending invite'}
                          {a.status === 'revoked' && 'Revoked'}
                        </Badge>
                        {a.status === 'pending' && a.invite_sent_at && (
                          <div className="text-xs text-gray-400 mt-1">
                            Invited {new Date(a.invite_sent_at).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(a.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {a.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResendInvite(a.id)}
                              disabled={busyId === a.id}
                            >
                              {busyId === a.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Mail className="h-3.5 w-3.5 mr-1" />
                                  Resend
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleRevoke(a.id)}
                            disabled={busyId === a.id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-gray-500 pt-2">
            <strong>Reminder:</strong> Invited admins complete registration via the institution
            portal onboarding flow, then view anonymised student insights scoped to their
            institution.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string
  value: number
  icon: React.ReactNode
  tint: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
            <div className="text-2xl font-bold mt-1">{value}</div>
          </div>
          <div className={`h-10 w-10 rounded-md flex items-center justify-center ${tint}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
