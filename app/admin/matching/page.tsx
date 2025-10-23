// Admin matching page
// Allows admins to run matching algorithm and manage matches

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Users, Target, Lock, CheckCircle } from 'lucide-react'
import type { MatchRecord } from '@/lib/matching/repo'

interface CohortFilter {
  campusCity?: string
  institutionId?: string
  degreeLevel?: string
  programmeId?: string
  graduationYearFrom?: number
  graduationYearTo?: number
  onlyActive?: boolean
  excludeAlreadyMatched?: boolean
  limit?: number
}

export default function AdminMatchingPage() {
  const [filters, setFilters] = useState<CohortFilter>({
    onlyActive: true,
    excludeAlreadyMatched: true,
    limit: 100
  })
  const [mode, setMode] = useState<'pairs' | 'groups'>('pairs')
  const [groupSize, setGroupSize] = useState(3)
  const [isRunning, setIsRunning] = useState(false)
  const [matches, setMatches] = useState<MatchRecord[]>([])
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [isLocking, setIsLocking] = useState(false)
  const [lastRunId, setLastRunId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runMatching = async () => {
    setIsRunning(true)
    setError(null)
    
    try {
      const response = await fetch('/api/match/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          groupSize: mode === 'groups' ? groupSize : undefined,
          cohort: filters
        })
      })

      if (!response.ok) {
        throw new Error('Failed to run matching')
      }

      const result = await response.json()
      setLastRunId(result.runId)
      setMatches(result.matches || [])
      setSelectedMatches(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsRunning(false)
    }
  }

  const lockSelectedMatches = async () => {
    if (selectedMatches.size === 0) return

    setIsLocking(true)
    try {
      const userIds = Array.from(selectedMatches)
      const response = await fetch('/api/match/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: lastRunId,
          userIds
        })
      })

      if (!response.ok) {
        throw new Error('Failed to lock matches')
      }

      // Refresh matches to show locked status
      const listResponse = await fetch(`/api/match/list?runId=${lastRunId}`)
      if (listResponse.ok) {
        const { matches: updatedMatches } = await listResponse.json()
        setMatches(updatedMatches)
      }
      
      setSelectedMatches(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock matches')
    } finally {
      setIsLocking(false)
    }
  }

  const toggleMatchSelection = (matchId: string) => {
    const newSelection = new Set(selectedMatches)
    if (newSelection.has(matchId)) {
      newSelection.delete(matchId)
    } else {
      newSelection.add(matchId)
    }
    setSelectedMatches(newSelection)
  }

  const getMatchId = (match: MatchRecord): string => {
    if (match.kind === 'pair') {
      return `${match.aId}-${match.bId}`
    } else {
      return match.memberIds.join('-')
    }
  }

  const getMatchUsers = (match: MatchRecord): string[] => {
    if (match.kind === 'pair') {
      return [match.aId, match.bId]
    } else {
      return match.memberIds
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matching Algorithm</h1>
          <p className="text-muted-foreground">Run matching algorithm and manage matches</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Users className="w-4 h-4 mr-1" />
          {matches.length} matches
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Cohort Filters</CardTitle>
            <CardDescription>Select the cohort for matching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campusCity">Campus City</Label>
                <Input
                  id="campusCity"
                  value={filters.campusCity || ''}
                  onChange={(e) => setFilters({ ...filters, campusCity: e.target.value || undefined })}
                  placeholder="e.g., Amsterdam"
                />
              </div>
              <div>
                <Label htmlFor="degreeLevel">Degree Level</Label>
                <Select
                  value={filters.degreeLevel || ''}
                  onValueChange={(value) => setFilters({ ...filters, degreeLevel: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelor">Bachelor</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="exchange">Exchange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearFrom">Graduation Year From</Label>
                <Input
                  id="yearFrom"
                  type="number"
                  value={filters.graduationYearFrom || ''}
                  onChange={(e) => setFilters({ ...filters, graduationYearFrom: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="2024"
                />
              </div>
              <div>
                <Label htmlFor="yearTo">Graduation Year To</Label>
                <Input
                  id="yearTo"
                  type="number"
                  value={filters.graduationYearTo || ''}
                  onChange={(e) => setFilters({ ...filters, graduationYearTo: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="2026"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.onlyActive || false}
                  onChange={(e) => setFilters({ ...filters, onlyActive: e.target.checked })}
                />
                <span className="text-sm">Only active users</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.excludeAlreadyMatched || false}
                  onChange={(e) => setFilters({ ...filters, excludeAlreadyMatched: e.target.checked })}
                />
                <span className="text-sm">Exclude already matched</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Matching Options */}
        <Card>
          <CardHeader>
            <CardTitle>Matching Options</CardTitle>
            <CardDescription>Configure the matching algorithm</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mode">Mode</Label>
              <Select value={mode} onValueChange={(value: 'pairs' | 'groups') => setMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pairs">Pairs</SelectItem>
                  <SelectItem value="groups">Groups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'groups' && (
              <div>
                <Label htmlFor="groupSize">Group Size</Label>
                <Input
                  id="groupSize"
                  type="number"
                  min="2"
                  max="6"
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value))}
                />
              </div>
            )}

            <Button 
              onClick={runMatching} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Matching...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Run Matching
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Match Results</CardTitle>
                <CardDescription>
                  {matches.length} matches found • Run ID: {lastRunId}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={lockSelectedMatches}
                  disabled={selectedMatches.size === 0 || isLocking}
                  variant="outline"
                >
                  {isLocking ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  Lock Selected ({selectedMatches.size})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.map((match, index) => {
                const matchId = getMatchId(match)
                const isSelected = selectedMatches.has(matchId)
                const isLocked = match.locked
                
                return (
                  <div
                    key={matchId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border'
                    } ${isLocked ? 'opacity-60' : ''}`}
                    onClick={() => !isLocked && toggleMatchSelection(matchId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isLocked}
                          onChange={() => !isLocked && toggleMatchSelection(matchId)}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="font-medium">
                            {match.kind === 'pair' ? (
                              <>User {match.aId.slice(-4)} ↔ User {match.bId.slice(-4)}</>
                            ) : (
                              <>Group: {match.memberIds.map(id => id.slice(-4)).join(', ')}</>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {match.kind === 'pair' ? 'Pair Match' : `${match.memberIds.length} members`}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {match.fitIndex}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Compatibility
                          </div>
                        </div>
                        
                        {isLocked && (
                          <Badge variant="secondary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>

                    {match.kind === 'pair' && match.sectionScores && (
                      <div className="mt-4 space-y-2">
                        <div className="text-sm font-medium">Section Scores:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(match.sectionScores).map(([section, score]) => (
                            <div key={section} className="flex items-center space-x-2">
                              <span className="text-xs capitalize w-20">{section}:</span>
                              <Progress value={score * 100} className="flex-1 h-2" />
                              <span className="text-xs w-8">{Math.round(score * 100)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {match.kind === 'pair' && match.reasons && match.reasons.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium">Reasons:</div>
                        <div className="text-sm text-muted-foreground">
                          {match.reasons.join(' • ')}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
