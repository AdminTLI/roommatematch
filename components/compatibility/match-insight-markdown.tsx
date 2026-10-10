'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

type MatchInsightMarkdownProps = {
  markdown: string
  className?: string
}

/**
 * Renders Domu Match coach-style compatibility copy (Markdown with bold headers and bullets).
 */
export function MatchInsightMarkdown({ markdown, className }: MatchInsightMarkdownProps) {
  return (
    <div
      className={cn(
        // Lock to panel body size (text-sm) so prose defaults do not drift larger/smaller.
        'max-w-none text-sm leading-relaxed text-slate-600 dark:text-slate-300',
        '[&_p]:my-2 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:last:mb-0',
        '[&_strong]:font-semibold [&_strong]:text-slate-800 dark:[&_strong]:text-slate-100',
        '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-4',
        '[&_ul]:marker:text-slate-400 dark:[&_ul]:marker:text-slate-500',
        '[&_li]:my-0 [&_li]:text-sm [&_li]:leading-relaxed',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="mb-2 text-sm leading-relaxed last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-800 dark:text-slate-100">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1.5 pl-4 marker:text-slate-400 dark:marker:text-slate-500">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="text-sm leading-relaxed">{children}</li>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
