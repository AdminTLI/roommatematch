import type { ReactNode } from 'react'
import type { BulletItem, TermsDocument } from '@/lib/legal/terms-content'

const DEFAULT_BETA_NOTICE = {
  title: 'Beta Notice',
  body: 'You are using a pre-release (beta) version of Domu Match. This means features may change, data may be reset, and additional data collection (such as bug reports and session logs) may be done to help us improve the product. This policy explains all of that clearly below.',
}

function BulletList({ items }: { items: BulletItem[] }) {
  return (
    <ul className="list-disc pl-6 space-y-2 text-slate-700 text-sm sm:text-base">
      {items.map((item, index) => (
        <li key={index}>
          {typeof item === 'string' ? (
            item
          ) : (
            <>
              <strong>{item.lead}</strong> {item.body}
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

type LegalDocumentProps = TermsDocument & {
  embedded?: boolean
  footer?: ReactNode
}

export function LegalDocument({
  title,
  lastUpdatedLabel,
  lastUpdatedValue,
  preamble,
  languageNote,
  sections,
  embedded = false,
  footer,
}: LegalDocumentProps) {
  return (
    <div
      className={
        embedded
          ? 'text-[#0F172A]'
          : 'rounded-3xl border border-white/60 bg-white/45 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.08)] p-6 sm:p-10'
      }
    >
      <h1
        className={
          embedded
            ? 'text-2xl font-bold text-slate-900 mb-2'
            : 'text-4xl font-bold text-slate-900 mb-3'
        }
      >
        {title}
      </h1>
      <p className="text-slate-600 mb-2 text-sm">
        {lastUpdatedLabel}: {lastUpdatedValue}
      </p>

      <div className="mb-8 mt-5 rounded-xl border border-amber-400/40 bg-amber-50 p-4">
        <p className="text-amber-900 font-semibold mb-1">{DEFAULT_BETA_NOTICE.title}</p>
        <p className="text-amber-900/90 leading-relaxed text-sm sm:text-base">
          {DEFAULT_BETA_NOTICE.body}
        </p>
      </div>

      <p className="text-slate-700 mb-4 text-sm sm:text-base">{languageNote}</p>
      <p className="text-slate-700 mb-8 leading-relaxed text-sm sm:text-base">{preamble}</p>

      {sections.map((section) => (
        <section key={section.id} className="mb-8">
          <h2
            className={
              embedded
                ? 'text-lg font-semibold text-slate-900 mt-4 mb-2'
                : 'text-2xl font-semibold text-slate-900 mt-6 mb-3'
            }
          >
            {section.title}
          </h2>
          {section.description && (
            <p className="text-slate-700 mb-3 text-sm sm:text-base">{section.description}</p>
          )}
          {section.quote && (
            <div className="border-l-4 border-slate-900 bg-white/60 px-4 py-3 mb-3 text-slate-800 rounded-r text-sm sm:text-base">
              {section.quote}
            </div>
          )}
          {section.table && (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border border-slate-200 bg-white/60 rounded-lg overflow-hidden text-left">
                {section.table.headers && (
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold">
                        {section.table.headers[0]}
                      </th>
                      <th className="px-4 py-3 text-sm font-semibold">
                        {section.table.headers[1]}
                      </th>
                    </tr>
                  </thead>
                )}
                <tbody className="text-slate-700 text-sm sm:text-base">
                  {section.table.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white/40' : 'bg-transparent'}
                    >
                      <td className="px-4 py-3 align-top font-medium text-slate-900">
                        {row.left}
                      </td>
                      <td className="px-4 py-3 align-top">{row.right}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {section.bullets && <BulletList items={section.bullets} />}
          {section.afterBulletsIntro && (
            <p className="text-slate-700 mt-4 mb-3 text-sm sm:text-base">
              {section.afterBulletsIntro}
            </p>
          )}
          {section.afterBullets && <BulletList items={section.afterBullets} />}
          {section.note && (
            <p className="text-slate-700 mt-3 text-sm sm:text-base">{section.note}</p>
          )}
        </section>
      ))}

      {footer}
    </div>
  )
}
