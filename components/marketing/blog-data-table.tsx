'use client'

import { cn } from '@/lib/utils'

export type BlogDataTableColumn<T extends string> = {
  key: T
  label: string
  align?: 'left' | 'right'
}

export type BlogDataTableProps<T extends string> = {
  columns: BlogDataTableColumn<T>[]
  rows: Array<Record<T, string | number>>
  caption: string
  className?: string
}

/**
 * Accessible data table for blog articles. Pass only verified values from cited sources.
 */
export function BlogDataTable<T extends string>({
  columns,
  rows,
  caption,
  className,
}: BlogDataTableProps<T>) {
  return (
    <figure className={cn('my-8', className)}>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
        <table className="w-full min-w-72 text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 bg-slate-50/90">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 font-semibold text-slate-900',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-4 py-3',
                      col.align === 'right' && 'text-right tabular-nums'
                    )}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="mt-2 text-sm text-slate-500">{caption}</figcaption>
    </figure>
  )
}
