'use client'

import { HelpSection as HelpSectionType } from '../help-content'
import { HelpArticleComponent } from './help-article'
import { cn } from '@/lib/utils'

interface HelpSectionProps {
  section: HelpSectionType
  highlightArticleId?: string
  onArticleClick?: (articleId: string, sectionId: string) => void
  className?: string
}

export function HelpSection({
  section,
  highlightArticleId,
  onArticleClick,
  className,
}: HelpSectionProps) {
  const allItems = [...section.articles, ...section.faqs]

  return (
    <div className={cn('space-y-6', className)}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{section.icon}</span>
          <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">{section.description}</p>
      </div>

      {section.articles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Articles</h3>
          {section.articles.map((article) => (
            <HelpArticleComponent
              key={article.id}
              article={article}
              defaultOpen={article.id === highlightArticleId}
              onRelatedClick={onArticleClick}
              className={article.id === highlightArticleId ? 'ring-2 ring-blue-500' : ''}
            />
          ))}
        </div>
      )}

      {section.faqs.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          {section.faqs.map((faq) => (
            <HelpArticleComponent
              key={faq.id}
              article={faq}
              defaultOpen={faq.id === highlightArticleId}
              onRelatedClick={onArticleClick}
              className={faq.id === highlightArticleId ? 'ring-2 ring-blue-500' : ''}
            />
          ))}
        </div>
      )}

      {allItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No articles available in this section yet.
        </div>
      )}
    </div>
  )
}

