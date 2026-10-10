'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { safeLogger } from '@/lib/utils/logger'
import { cn } from '@/lib/utils'
import { queryKeys } from '@/app/providers'
import { fetchChatCompatibility, type ChatCompatibilityPayload } from '@/lib/chat/fetch-chat-compatibility'
import { buildMatchModuleInsights } from '@/lib/chat/match-module-feedback'
import { MatchInsightMarkdown } from '@/components/compatibility/match-insight-markdown'
import { VibeAlignmentRing } from './vibe-alignment-ring'
import {
  V2_CHAT_MODULES,
  isV2DimensionPayload,
  legacyDimensionLabel,
  vibeAlignmentBand,
  vibeAlignmentBarClass,
  vibeAlignmentSubtitle,
  vibeAlignmentTextClass,
} from '@/lib/chat/vibe-alignment'
import {
  MessengerPaneHeader,
  MessengerPaneInsightList,
  MessengerPaneSection,
  MessengerPaneSectionTitle,
  paneBodyClass,
  paneFlatContentClass,
  paneMutedClass,
  paneScrollClass,
  paneShellClass,
} from './messenger-pane-chrome'

interface MessengerProfilePaneProps {
  chatId: string
  isOpen: boolean
  onClose?: () => void
  onComposeNudge?: (message: string) => void
  partnerDisplayName?: string | null
}

function pctFromFraction(f: number | null | undefined): number | null {
  if (f == null || Number.isNaN(f)) return null
  return Math.min(100, Math.max(0, Math.round(f * 100)))
}

function toDimNumber(v: unknown): number | null {
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function parseDimObj(dimRaw: unknown): Record<string, unknown> | null {
  if (!dimRaw) return null
  if (typeof dimRaw === 'string') {
    try {
      const parsed = JSON.parse(dimRaw) as unknown
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      return null
    }
    return null
  }
  if (typeof dimRaw === 'object' && !Array.isArray(dimRaw)) {
    return dimRaw as Record<string, unknown>
  }
  return null
}

export function MessengerProfilePane({ chatId, isOpen, onClose }: MessengerProfilePaneProps) {
  const [insightOpen, setInsightOpen] = useState(false)
  const [openModuleKey, setOpenModuleKey] = useState<string | null>(null)

  const { data: compat, isLoading: compatLoading, isFetching: compatFetching, error: compatError } =
    useQuery<ChatCompatibilityPayload | null>({
      queryKey: queryKeys.chatCompatibility(chatId),
      queryFn: () => fetchChatCompatibility(chatId),
      staleTime: 5 * 60 * 1000,
      enabled: isOpen && !!chatId,
    })

  useEffect(() => {
    if (compatError) {
      safeLogger.warn('[MessengerProfilePane] Compatibility query failed', { error: compatError })
    }
  }, [compatError])

  useEffect(() => {
    if (!isOpen) return
    setInsightOpen(false)
    setOpenModuleKey(null)
  }, [isOpen, chatId])

  const moduleInsights = useMemo(() => {
    if (!compat) return null
    if (compat.module_insights?.modules?.length) return compat.module_insights
    return buildMatchModuleInsights({
      dimensionScores: compat.dimension_scores_json as Record<string, unknown> | null,
      overallScore: compat.compatibility_score ?? null,
      seed: chatId,
    })
  }, [compat, chatId])

  const dimObj = useMemo(
    () => parseDimObj(compat?.dimension_scores_json),
    [compat?.dimension_scores_json],
  )

  const useV2Modules = useMemo(
    () =>
      isV2DimensionPayload(
        dimObj
          ? Object.fromEntries(
              Object.entries(dimObj).map(([k, v]) => {
                const n = toDimNumber(v)
                return [k, n == null ? v : n]
              }),
            )
          : null,
      ),
    [dimObj],
  )

  const dimensionRows = useMemo(() => {
    const rows: Array<{ key: string; label: string; pct: number }> = []
    if (!dimObj) return rows
    if (useV2Modules) {
      for (const mod of V2_CHAT_MODULES) {
        const pct = pctFromFraction(toDimNumber(dimObj[mod.key]))
        if (pct == null) continue
        rows.push({ key: mod.key, label: mod.label, pct })
      }
      return rows
    }
    for (const [key, score] of Object.entries(dimObj)) {
      if (key === 'gate_conflicts' || key === 'soft_gate_override') continue
      const pct = pctFromFraction(toDimNumber(score))
      if (pct == null) continue
      rows.push({ key, label: legacyDimensionLabel(key), pct })
    }
    return rows
  }, [dimObj, useV2Modules])

  const insightByModule = useMemo(() => {
    const entries = (moduleInsights?.modules || []).map(
      m => [m.key, m] as [string, (typeof m)]
    )
    return new Map<string, (typeof entries)[number][1]>(entries)
  }, [moduleInsights])

  if (!isOpen) return null

  const mainPct =
    compat?.compatibility_score != null && !Number.isNaN(compat.compatibility_score)
      ? pctFromFraction(compat.compatibility_score)
      : null

  const compatPending = (compatLoading || compatFetching) && mainPct === null

  const aiExplanation =
    typeof compat?.personalized_explanation === 'string' && compat.personalized_explanation.trim()
      ? compat.personalized_explanation.trim()
      : null

  const summary = moduleInsights?.summary
  const hasInsightDetails = Boolean(
    summary &&
      (summary.strengths.length > 0 || summary.watchOuts.length > 0 || summary.tip || aiExplanation),
  )

  return (
    <div
      data-messenger-profile-pane
      data-messenger-insights-pane
      className={paneShellClass}
    >
      <MessengerPaneHeader
        title="Match Insights"
        subtitle="How your living habits line up"
        onClose={onClose}
        closeLabel="Close match insights"
      />

      <div
        data-profile-pane-scroll
        className={paneScrollClass}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className={paneFlatContentClass}>
          {compatPending && !compatError ? (
            <div className="space-y-8 pt-2">
              <div className="mx-auto h-28 w-28 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800" />
              <div className="mx-auto h-4 w-40 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-10 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
                ))}
              </div>
            </div>
          ) : compatError && !compat ? (
            <p className={`${paneMutedClass} py-12 text-center`}>
              Couldn&apos;t load match details. Try again in a moment.
            </p>
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                {mainPct != null ? (
                  <>
                    <VibeAlignmentRing percent={mainPct} />
                    <p
                      className={cn(
                        'mt-4 text-sm font-semibold',
                        vibeAlignmentTextClass(mainPct),
                      )}
                    >
                      {vibeAlignmentBand(mainPct)}
                    </p>
                    <p className="mx-auto mt-1.5 max-w-xs text-sm leading-snug text-slate-500 dark:text-slate-400">
                      {vibeAlignmentSubtitle(mainPct)}
                    </p>
                  </>
                ) : (
                  <p className={paneMutedClass}>
                    Alignment details will appear once both profiles are ready.
                  </p>
                )}
              </div>

              {summary && (
                <MessengerPaneSection className="space-y-4">
                  <div className="space-y-2">
                    <MessengerPaneSectionTitle>Overview</MessengerPaneSectionTitle>
                    <p className={cn(paneBodyClass, 'text-slate-800 dark:text-slate-100')}>
                      {summary.headline}
                    </p>
                  </div>

                  {hasInsightDetails && (
                    <div className="space-y-8">
                      <button
                        type="button"
                        onClick={() => setInsightOpen(v => !v)}
                        aria-expanded={insightOpen}
                        className="inline-flex touch-manipulation items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        {insightOpen ? 'Hide details' : 'Show details'}
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            insightOpen && 'rotate-180',
                          )}
                          aria-hidden
                        />
                      </button>

                      {insightOpen && (
                        <div className="space-y-8">
                          <MessengerPaneInsightList
                            title="What matches well"
                            items={summary.strengths}
                            tone="strength"
                          />
                          <MessengerPaneInsightList
                            title="Worth watching"
                            items={summary.watchOuts}
                            tone="watch"
                          />
                          {summary.tip && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                Tip
                              </h4>
                              <p className={paneBodyClass}>{summary.tip}</p>
                            </div>
                          )}
                          {aiExplanation && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                In more depth
                              </h4>
                              <MatchInsightMarkdown markdown={aiExplanation} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </MessengerPaneSection>
              )}

              {dimensionRows.length > 0 && (
                <MessengerPaneSection>
                  <MessengerPaneSectionTitle>Dimensions</MessengerPaneSectionTitle>
                  <p className={paneMutedClass}>
                    Tap a module to see what matches and what to compare.
                  </p>

                  <ul>
                    {dimensionRows.map(row => {
                      const isOpenRow = openModuleKey === row.key
                      const insight = insightByModule.get(row.key)
                      const hasBody =
                        Boolean(insight?.strengths?.length) || Boolean(insight?.watchOuts?.length)

                      return (
                        <li key={row.key}>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenModuleKey(prev => (prev === row.key ? null : row.key))
                            }
                            aria-expanded={isOpenRow}
                            disabled={!hasBody}
                            className={cn(
                              'flex w-full touch-manipulation items-center gap-3 py-3.5 text-left',
                              !hasBody && 'cursor-default',
                            )}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-3">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                  {row.label}
                                </span>
                                <span
                                  className={cn(
                                    'shrink-0 text-sm font-bold tabular-nums',
                                    vibeAlignmentTextClass(row.pct),
                                  )}
                                >
                                  {row.pct}%
                                </span>
                              </div>
                              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    vibeAlignmentBarClass(row.pct),
                                  )}
                                  style={{ width: `${row.pct}%` }}
                                />
                              </div>
                            </div>
                            {hasBody && (
                              <ChevronDown
                                className={cn(
                                  'h-4 w-4 shrink-0 text-slate-400 transition-transform',
                                  isOpenRow && 'rotate-180',
                                )}
                                aria-hidden
                              />
                            )}
                          </button>

                          {isOpenRow && hasBody && (
                            <div className="space-y-6 pb-5">
                              <MessengerPaneInsightList
                                title="What matches well"
                                items={insight?.strengths ?? []}
                                tone="strength"
                              />
                              <MessengerPaneInsightList
                                title="Worth watching"
                                items={insight?.watchOuts ?? []}
                                tone="watch"
                              />
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </MessengerPaneSection>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
