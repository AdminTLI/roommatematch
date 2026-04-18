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
        'prose prose-sm max-w-none text-slate-600 dark:prose-invert dark:text-slate-400',
        'prose-p:my-2 prose-p:leading-relaxed prose-p:last:mb-0',
        'prose-strong:font-semibold prose-strong:text-slate-800 dark:prose-strong:text-slate-100',
        'prose-ul:my-2 prose-ul:list-disc prose-ul:space-y-1.5 prose-ul:pl-4 prose-ul:marker:text-slate-400 dark:prose-ul:marker:text-slate-500',
        'prose-li:my-0 prose-li:leading-relaxed',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-800 dark:text-slate-100">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="my-2 list-disc space-y-1.5 pl-4 marker:text-slate-400 dark:marker:text-slate-500">{children}</ul>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
