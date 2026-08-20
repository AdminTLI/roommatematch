'use client'

import { useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InstitutionSelect } from '@/components/questionnaire/InstitutionSelect'
import { ProgrammeSelect } from '@/components/questionnaire/ProgrammeSelect'
import { Checkbox } from '@/components/ui/checkbox'
import type { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { ReactNode } from 'react'

interface AcademicStepProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  user: User
  errors?: Record<string, string>
  onFieldBlur?: (field: string) => void
}

const DEGREE_OPTIONS = [
  { value: 'bachelor', label: "Bachelor's" },
  { value: 'premaster', label: 'Pre-Master' },
  { value: 'master', label: "Master's" },
] as const

const START_MONTHS = [
  { value: '9', label: 'September' },
  { value: '2', label: 'February' },
  { value: '1', label: 'January' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Label className="text-sm font-bold text-[#1E293B] dark:text-slate-200">{children}</Label>
  )
}

/** Shared onboarding select trigger: 48px tall, white, clear chevron */
export const onboardingSelectTriggerClass = cn(
  'h-12 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-3 text-sm shadow-none',
  'focus:ring-2 focus:ring-[#4F46E5]/30 data-[placeholder]:text-slate-500',
  '[&_svg]:h-5 [&_svg]:w-5 [&_svg]:opacity-70 [&_svg]:text-slate-500',
  'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:data-[placeholder]:text-slate-400',
  'dark:focus:ring-indigo-400/30 dark:[&_svg]:text-slate-400'
)

function selectTriggerClassName(hasValue: boolean) {
  return cn(
    onboardingSelectTriggerClass,
    hasValue
      ? 'font-medium text-[#0F172A] dark:text-slate-50'
      : 'font-normal text-slate-500 dark:text-slate-400'
  )
}

const onboardingSelectContentClass =
  'rounded-2xl border border-slate-200 bg-white text-[#0F172A] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.12)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50 dark:shadow-black/40'

export function AcademicStep({ data, onChange, errors = {} }: AcademicStepProps) {
  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({ length: 11 }, (_, i) => currentYear + i)
  const supabase = createClient()

  useEffect(() => {
    const syncUniversity = async () => {
      if (data.university_id && !data.institution_slug && !data.university_slug) {
        try {
          const { data: uniData, error } = await supabase
            .from('universities')
            .select('id, slug, name')
            .eq('id', data.university_id)
            .maybeSingle()

          if (!error && uniData) {
            onChange({
              ...data,
              institution_slug: uniData.slug,
              university_slug: uniData.slug,
            })
          }
        } catch (error) {
          console.error('Error looking up university:', error)
        }
        return
      }

      const slug = data.institution_slug || data.university_slug
      if (!slug || slug === 'other' || data.university_id) return

      try {
        const { data: uniData, error } = await supabase
          .from('universities')
          .select('id, slug, name')
          .eq('slug', slug)
          .maybeSingle()

        if (!error && uniData) {
          onChange({
            ...data,
            university_id: uniData.id,
          })
        }
      } catch (error) {
        console.error('Error looking up university:', error)
      }
    }

    syncUniversity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.university_id, data.institution_slug, data.university_slug])

  const handleChange = (field: string, value: unknown) => {
    const newData: Record<string, unknown> = { ...data, [field]: value }

    if (field === 'university_id' || field === 'institution_slug' || field === 'degree_level') {
      newData.program_id = null
      newData.undecided_program = false
    }

    // Wireframe has student status only — infer programme language for matching backends
    if (field === 'student_origin') {
      newData.study_program_type =
        value === 'international' ? 'english_taught' : 'dutch_taught'
    }

    // Wireframe collects graduation year only — default month to June (NL standard)
    if (field === 'expected_graduation_year' && !data.graduation_month) {
      newData.graduation_month = 6
    }

    onChange(newData)
  }

  const handleInstitutionChange = async ({
    institutionId,
    institutionOther,
    universityDbId,
  }: {
    institutionId: string
    institutionOther?: string
    universityDbId?: string
  }) => {
    const newData: Record<string, unknown> = {
      ...data,
      institution_slug: institutionId,
      program_id: null,
      undecided_program: false,
    }

    if (institutionId === 'other') {
      newData.institution_other = institutionOther
      newData.university_id = null
    } else {
      newData.institution_other = undefined

      if (!universityDbId && institutionId) {
        try {
          const { data: uniData, error } = await supabase
            .from('universities')
            .select('id, slug, name')
            .eq('slug', institutionId)
            .maybeSingle()

          if (!error && uniData) {
            newData.university_id = uniData.id
          }
        } catch (error) {
          console.error('Error finding university ID:', error)
        }
      } else if (universityDbId) {
        newData.university_id = universityDbId
      }
    }

    onChange(newData)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <FieldLabel>University</FieldLabel>
        <InstitutionSelect value={data.institution_slug} onChange={handleInstitutionChange} />
        {(errors.institution_slug || errors.institution_other) && (
          <p className="text-xs text-red-500">
            {errors.institution_slug || errors.institution_other}
          </p>
        )}
      </div>

      <div className="space-y-2.5">
        <FieldLabel>Degree Level</FieldLabel>
        <div className="grid grid-cols-3 gap-2.5">
          {DEGREE_OPTIONS.map((opt) => {
            const active = data.degree_level === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('degree_level', opt.value)}
                className={cn(
                  'min-h-[48px] rounded-2xl px-2 py-3 text-center text-sm font-semibold transition-all sm:px-3',
                  active
                    ? 'border-2 border-[#4F46E5] bg-indigo-50 text-[#4F46E5] shadow-[0_10px_25px_-5px_rgba(79,70,229,0.15)] dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700/50'
                )}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        {errors.degree_level && <p className="text-xs text-red-500">{errors.degree_level}</p>}
      </div>

      <div className="space-y-2.5">
        <FieldLabel>Programme</FieldLabel>
        {!data.undecided_program ? (
          <ProgrammeSelect
            institutionId={data.institution_slug}
            level={data.degree_level as any}
            value={data.program_id}
            onChange={(programmeId, programmeName) => {
              onChange({
                ...data,
                program_id: programmeId,
                program: programmeName ?? data.program,
                undecided_program: false,
              })
            }}
            disabled={!data.institution_slug || !data.degree_level}
            placeholder="Search programme (e.g. International Business)…"
          />
        ) : (
          <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
            You can pick a programme later. We&apos;ll still match you on lifestyle.
          </div>
        )}
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
          <Checkbox
            id="undecided_program"
            checked={data.undecided_program || false}
            onCheckedChange={(checked) => handleChange('undecided_program', checked)}
            className="rounded border-slate-300 data-[state=checked]:border-[#4F46E5] data-[state=checked]:bg-[#4F46E5] dark:border-slate-500"
          />
          I haven&apos;t decided on a specific programme yet
        </label>
        {errors.program_id && <p className="text-xs text-red-500">{errors.program_id}</p>}
      </div>

      <div className="space-y-2.5">
        <FieldLabel>Study Period</FieldLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#334155] dark:text-slate-300">Start Month</p>
            <Select
              value={data.study_start_month?.toString() || ''}
              onValueChange={(value) =>
                handleChange('study_start_month', value ? parseInt(value) : null)
              }
            >
              <SelectTrigger className={selectTriggerClassName(!!data.study_start_month)}>
                <SelectValue placeholder="September" />
              </SelectTrigger>
              <SelectContent className={onboardingSelectContentClass}>
                {START_MONTHS.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={m.value}
                    className="focus:bg-slate-50 focus:text-[#0F172A] dark:focus:bg-slate-700 dark:focus:text-slate-50"
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.study_start_month && (
              <p className="text-xs text-red-500">{errors.study_start_month}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#334155] dark:text-slate-300">
              Graduation Year
            </p>
            <Select
              value={data.expected_graduation_year?.toString() || ''}
              onValueChange={(value) =>
                handleChange('expected_graduation_year', parseInt(value))
              }
            >
              <SelectTrigger className={selectTriggerClassName(!!data.expected_graduation_year)}>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className={onboardingSelectContentClass}>
                {graduationYears.map((year) => (
                  <SelectItem
                    key={year}
                    value={year.toString()}
                    className="focus:bg-slate-50 focus:text-[#0F172A] dark:focus:bg-slate-700 dark:focus:text-slate-50"
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.expected_graduation_year && (
              <p className="text-xs text-red-500">{errors.expected_graduation_year}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <FieldLabel>Student Status</FieldLabel>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleChange('student_origin', 'dutch')}
            className={cn(
              'flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition-all',
              data.student_origin === 'dutch'
                ? 'border-2 border-[#4F46E5] bg-indigo-50 text-[#4F46E5] shadow-[0_10px_25px_-5px_rgba(79,70,229,0.15)] dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700/50'
            )}
          >
            <span aria-hidden>🇳🇱</span>
            Domestic Student
          </button>
          <button
            type="button"
            onClick={() => handleChange('student_origin', 'international')}
            className={cn(
              'flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition-all',
              data.student_origin === 'international'
                ? 'border-2 border-[#4F46E5] bg-indigo-50 text-[#4F46E5] shadow-[0_10px_25px_-5px_rgba(79,70,229,0.15)] dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700/50'
            )}
          >
            <span aria-hidden>🌍</span>
            International Student
          </button>
        </div>
        {errors.student_origin && (
          <p className="text-xs text-red-500">{errors.student_origin}</p>
        )}
      </div>
    </div>
  )
}
