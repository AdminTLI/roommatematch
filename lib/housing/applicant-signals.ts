import { createAdminClient } from '@/lib/supabase/server'
import { onboardingAnswerToVibeScale } from '@/lib/vibe-check/lifestyle-fit'
import type { MemberHousingSignals } from './group-listing-score'

const SIGNAL_ITEM_IDS = [
  'M5_Q17', // smoking
  'M8_Q14', // pets
  'M8_Q11', // airbnb / short-let
  'M8_Q19', // BRP
  'M4_Q1', // cleanliness standard
  'M4_Q14', // chores structure
  'M2_Q1', // chronotype / schedule
  'M2_Q13', // quiet hours
  'M5_Q1', // guest frequency
  'M5_Q5', // overnight / parties energy
  'M1_Q13', // social energy at home
] as const

function unwrapAnswerValue(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'value' in (raw as Record<string, unknown>)) {
    return (raw as { value: unknown }).value
  }
  return raw
}

function scheduleFromChronotype(raw: unknown): 'early' | 'flexible' | 'late' | null {
  const vibe = onboardingAnswerToVibeScale('M2_Q1', raw)
  if (vibe == null) return null
  // vibe scale after mapping: 1 early … 5 night owl
  if (vibe <= 2) return 'early'
  if (vibe >= 4) return 'late'
  return 'flexible'
}

/**
 * Load lightweight housing signals for scoring (no PII for host cards).
 */
export async function loadMemberHousingSignals(
  userIds: string[]
): Promise<MemberHousingSignals[]> {
  const admin = await createAdminClient()
  const unique = [...new Set(userIds.filter(Boolean))]
  if (!unique.length) return []

  const [{ data: profiles }, { data: prefs }, { data: sections }] = await Promise.all([
    admin
      .from('profiles')
      .select('user_id, verification_status, university_email, housing_budget_max')
      .in('user_id', unique),
    admin.from('user_housing_preferences').select('*').in('user_id', unique),
    admin.from('onboarding_sections').select('user_id, section, answers').in('user_id', unique),
  ])

  const prefByUser = new Map((prefs || []).map((p) => [p.user_id, p]))
  const profileByUser = new Map((profiles || []).map((p) => [p.user_id, p]))
  const answersByUser = new Map<string, Record<string, unknown>>()
  const wanted = new Set<string>(SIGNAL_ITEM_IDS)

  for (const row of sections || []) {
    if (!answersByUser.has(row.user_id)) answersByUser.set(row.user_id, {})
    const bucket = answersByUser.get(row.user_id)!
    const answers = row.answers
    if (Array.isArray(answers)) {
      for (const a of answers) {
        const key = a?.question_key || a?.item_id || a?.itemId || a?.id
        if (key && wanted.has(String(key))) bucket[String(key)] = a?.value ?? a?.answer ?? a
      }
    } else if (answers && typeof answers === 'object') {
      for (const [key, value] of Object.entries(answers as Record<string, unknown>)) {
        if (wanted.has(key)) bucket[key] = value
      }
    }
  }

  return unique.map((userId) => {
    const profile = profileByUser.get(userId)
    const pref = prefByUser.get(userId)
    const a = answersByUser.get(userId) || {}

    const truthy = (v: unknown): boolean | undefined => {
      const unwrapped = unwrapAnswerValue(v)
      if (unwrapped === true || unwrapped === 'true' || unwrapped === 'yes' || unwrapped === 1 || unwrapped === '1') {
        return true
      }
      if (
        unwrapped === false ||
        unwrapped === 'false' ||
        unwrapped === 'no' ||
        unwrapped === 0 ||
        unwrapped === '0'
      ) {
        return false
      }
      return undefined
    }

    const vibe = (itemId: (typeof SIGNAL_ITEM_IDS)[number]): number | null =>
      onboardingAnswerToVibeScale(itemId, a[itemId])

    const likert = (raw: unknown): number | null => {
      const unwrapped = unwrapAnswerValue(raw)
      const n =
        typeof unwrapped === 'number'
          ? unwrapped
          : unwrapped && typeof unwrapped === 'object' && typeof (unwrapped as { value?: unknown }).value === 'number'
            ? (unwrapped as { value: number }).value
            : Number(unwrapped)
      if (!Number.isFinite(n)) return null
      const rounded = Math.round(n)
      if (rounded < 1 || rounded > 5) return null
      return rounded
    }

    return {
      userId,
      maxRentMonthly:
        pref?.max_rent_monthly != null
          ? Number(pref.max_rent_monthly)
          : profile?.housing_budget_max != null
            ? Number(profile.housing_budget_max)
            : null,
      moveInFlexibilityDays:
        pref?.move_in_flexibility_days != null ? Number(pref.move_in_flexibility_days) : 30,
      minStayMonths:
        pref?.min_stay_months != null ? Number(pref.min_stay_months) : null,
      maxStayMonths:
        pref?.max_stay_months != null ? Number(pref.max_stay_months) : null,
      smokingOk:
        truthy(a['M5_Q17']) === false
          ? false
          : pref?.smoking_preference === 'smoking_ok'
            ? true
            : pref?.smoking_preference === 'no_smoking'
              ? false
              : undefined,
      petsOk:
        truthy(a['M8_Q14']) === true || pref?.pet_friendly_required === true || undefined,
      airbnbOk:
        truthy(a['M8_Q11']) === true ? true : truthy(a['M8_Q11']) === false ? false : undefined,
      brpNeeded: truthy(a['M8_Q19']) === true ? true : undefined,
      // Host lifestyle_prefs ↔ student questionnaire mapping:
      // cleanliness ← M4_Q1, quiet hours ← M2_Q13, day guests ← M5_Q1,
      // overnight ← M5_Q5, parties/gatherings ← M5_Q1 (gathering energy),
      // social energy ← M1_Q13, chores ← M4_Q14, schedule ← M2_Q1.
      cleanliness: vibe('M4_Q1'),
      quietHoursImportance: vibe('M2_Q13'),
      guestsFrequency: vibe('M5_Q1'),
      overnightGuests: vibe('M5_Q5') ?? likert(a['M5_Q5']),
      partiesFrequency: vibe('M5_Q1'),
      socialLevel: likert(a['M1_Q13']) ?? vibe('M5_Q1'),
      choresExpectation: likert(a['M4_Q14']),
      preferredSchedule: scheduleFromChronotype(a['M2_Q1']),
      requiredAmenities: Array.isArray(pref?.required_amenities)
        ? (pref.required_amenities as string[]).filter((x) => typeof x === 'string')
        : [],
      preferredAmenities: Array.isArray(pref?.preferred_amenities)
        ? (pref.preferred_amenities as string[]).filter((x) => typeof x === 'string')
        : [],
      verified: profile?.verification_status === 'verified',
      universityEmailVerified: Boolean(profile?.university_email),
    } satisfies MemberHousingSignals
  })
}
