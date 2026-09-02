'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RefreshCw, Search, Unlink } from 'lucide-react'
import { showErrorToast, showSuccessToast } from '@/lib/toast'
import { fetchWithCSRF } from '@/lib/utils/fetch-with-csrf'
import { ADMIN_FIELD_CLASS, ADMIN_LABEL_CLASS, ADMIN_PAGE_STACK } from '@/lib/admin/ui'

type HolderRow = {
  userId: string
  name: string
  loginEmail: string | null
  universityEmail: string | null
  isVerifiedStudent: boolean | null
}

type FlagRow = {
  id: string
  emailNormalized: string
  status: string
  createdAt: string
  attemptingUser: {
    userId: string
    name: string
    loginEmail: string | null
  }
  holders: HolderRow[]
}

type RecoveryTicketRow = {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  universityEmail: string | null
  replyEmail: string | null
  requesterName: string
  requesterLoginEmail: string | null
}

type LookupPayload = {
  emailNormalized: string
  holders: HolderRow[]
} | null

export function AdminUniversityEmailFlagsPanel() {
  const [flags, setFlags] = useState<FlagRow[]>([])
  const [total, setTotal] = useState(0)
  const [lookup, setLookup] = useState<LookupPayload>(null)
  const [recoveryTickets, setRecoveryTickets] = useState<RecoveryTicketRow[]>([])
  const [lookupEmail, setLookupEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [releaseTarget, setReleaseTarget] = useState<{
    holder: HolderRow
    emailNormalized: string
    flagId?: string
  } | null>(null)
  const [releaseReason, setReleaseReason] = useState('')

  const loadFlags = useCallback(async (email?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ status: 'open', limit: '200' })
      const trimmed = email?.trim()
      if (trimmed) params.set('email', trimmed)
      const res = await fetch(`/api/admin/university-email-flags?${params}`)
      if (res.status === 403) {
        throw new Error('Super admin access required')
      }
      if (!res.ok) throw new Error('Failed to load university email flags')
      const data = await res.json()
      setFlags(data.flags ?? [])
      setTotal(data.total ?? 0)
      setLookup(data.lookup ?? null)
      setRecoveryTickets(data.recoveryTickets ?? [])
    } catch (error) {
      showErrorToast(
        error instanceof Error ? error.message : 'Could not load university email flags'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadFlags()
  }, [loadFlags])

  const dismissFlag = async (id: string) => {
    setBusyId(id)
    try {
      const res = await fetchWithCSRF(`/api/admin/university-email-flags/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Dismiss failed')
      }
      showSuccessToast('Flag dismissed')
      void loadFlags(lookupEmail)
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Could not dismiss flag')
    } finally {
      setBusyId(null)
    }
  }

  const confirmRelease = async () => {
    if (!releaseTarget) return
    setBusyId(releaseTarget.holder.userId)
    try {
      const res = await fetchWithCSRF('/api/admin/university-email-flags/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holderUserId: releaseTarget.holder.userId,
          emailNormalized: releaseTarget.emailNormalized,
          flagId: releaseTarget.flagId ?? null,
          reason: releaseReason.trim() || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Release failed')
      }
      const remaining = data.remainingHolderCount ?? 0
      showSuccessToast(
        remaining > 0
          ? `Released from this account. ${remaining} other holder${remaining === 1 ? '' : 's'} still have this email.`
          : 'Released. This university email is free for a future student verification.'
      )
      setReleaseTarget(null)
      setReleaseReason('')
      void loadFlags(lookupEmail)
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Could not release email')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className={ADMIN_PAGE_STACK}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <form
          className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault()
            void loadFlags(lookupEmail)
          }}
        >
          <label className="min-w-0 flex-1">
            <span className={ADMIN_LABEL_CLASS}>Look up university email</span>
            <Input
              className={ADMIN_FIELD_CLASS}
              value={lookupEmail}
              onChange={(event) => setLookupEmail(event.target.value)}
              placeholder="student@university.nl"
              type="email"
            />
          </label>
          <Button type="submit" variant="outline" disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" />
            Look up
          </Button>
        </form>
        <Button variant="outline" onClick={() => void loadFlags(lookupEmail)} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {lookup && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current holders</CardTitle>
            <CardDescription>
              Existing accounts are left as they are until you release a specific holder.
              Releasing one duplicate does not change any other account that still has{' '}
              <span className="font-medium">{lookup.emailNormalized}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lookup.holders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No current holders. A future student can verify this email.
              </p>
            ) : (
              <HolderTable
                holders={lookup.holders}
                busyId={busyId}
                onRelease={(holder) =>
                  setReleaseTarget({
                    holder,
                    emailNormalized: lookup.emailNormalized,
                  })
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recovery requests</CardTitle>
          <CardDescription>
            Students who said they cannot access the original login email. These also appear under
            System → Support as account tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading requests…</p>
          ) : recoveryTickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open recovery requests.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>University email</TableHead>
                  <TableHead>Requested by</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recoveryTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="font-medium">#{ticket.ticketNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {ticket.universityEmail || '–'}
                    </TableCell>
                    <TableCell>
                      <div>{ticket.requesterName}</div>
                      <div className="text-xs text-muted-foreground">
                        {ticket.replyEmail || ticket.requesterLoginEmail}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-pre-wrap text-sm text-muted-foreground">
                      {ticket.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <a href="/admin/support">Support</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blocked verification attempts</CardTitle>
          <CardDescription>
            {total} open flag{total === 1 ? '' : 's'}. New student verifications cannot reuse a
            university email that another account already has. Existing duplicates were not changed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading flags…</p>
          ) : flags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open reuse flags.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>University email</TableHead>
                  <TableHead>Attempted by</TableHead>
                  <TableHead>Current holders</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="font-medium">{flag.emailNormalized}</TableCell>
                    <TableCell>
                      <div>{flag.attemptingUser.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {flag.attemptingUser.loginEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {flag.holders.length === 0 ? (
                          <span className="text-xs text-muted-foreground">None listed</span>
                        ) : (
                          flag.holders.map((holder) => (
                            <div key={holder.userId} className="flex items-center justify-between gap-2">
                              <div>
                                <div className="text-sm">{holder.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {holder.loginEmail}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busyId === holder.userId}
                                onClick={() =>
                                  setReleaseTarget({
                                    holder,
                                    emailNormalized: flag.emailNormalized,
                                    flagId: flag.id,
                                  })
                                }
                              >
                                <Unlink className="mr-1 h-3 w-3" />
                                Release
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(flag.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === flag.id}
                        onClick={() => void dismissFlag(flag.id)}
                      >
                        Dismiss
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(releaseTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setReleaseTarget(null)
            setReleaseReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release university email</DialogTitle>
            <DialogDescription>
              This unlinks <span className="font-medium">{releaseTarget?.emailNormalized}</span> from{' '}
              {releaseTarget?.holder.name} only. Other accounts that already have this email are left
              unchanged. The student on the released account will need to verify a university email
              again.
            </DialogDescription>
          </DialogHeader>
          <label>
            <span className={ADMIN_LABEL_CLASS}>Reason (optional)</span>
            <Textarea
              value={releaseReason}
              onChange={(event) => setReleaseReason(event.target.value)}
              placeholder="Why this account should no longer hold the campus email"
            />
          </label>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReleaseTarget(null)
                setReleaseReason('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => void confirmRelease()} disabled={Boolean(busyId)}>
              Release this account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function HolderTable({
  holders,
  busyId,
  onRelease,
}: {
  holders: HolderRow[]
  busyId: string | null
  onRelease: (holder: HolderRow) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead>Login email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holders.map((holder) => (
          <TableRow key={holder.userId}>
            <TableCell>{holder.name}</TableCell>
            <TableCell>{holder.loginEmail}</TableCell>
            <TableCell>
              {holder.isVerifiedStudent ? (
                <Badge variant="secondary">Verified student</Badge>
              ) : (
                <Badge variant="outline">Not verified</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === holder.userId}
                onClick={() => onRelease(holder)}
              >
                <Unlink className="mr-1 h-3 w-3" />
                Release
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
