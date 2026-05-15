import type { Locale } from '@/lib/i18n'

export type Dictionary = typeof import('@/app/(i18n)/en').en

/** Load a single locale dictionary (code-split per language). */
export async function loadDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === 'nl') {
    return (await import('@/app/(i18n)/nl')).nl
  }
  return (await import('@/app/(i18n)/en')).en
}
