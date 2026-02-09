'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, FileText, ExternalLink } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { HelpArticle, getSectionById, getArticleById } from '../help-content'
import { useApp } from '@/app/providers'
import { cn } from '@/lib/utils'

interface HelpArticleProps {
  article: HelpArticle
  defaultOpen?: boolean
  showRelated?: boolean
  onRelatedClick?: (articleId: string, sectionId: string) => void
  className?: string
}

export function HelpArticleComponent({
  article,
  defaultOpen = false,
  showRelated = true,
  onRelatedClick,
  className,
}: HelpArticleProps) {
  const { locale } = useApp()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const section = getSectionById(article.section, locale as 'en' | 'nl')

  const formatContent = (content: string) => {
    // Format markdown-like content
    const lines = content.split('\n')
    const formatted: (string | JSX.Element)[] = []
    let listItems: string[] = []
    let inList = false

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      // Handle numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        if (!inList) {
          inList = true
          listItems = []
        }
        listItems.push(trimmed.replace(/^\d+\.\s/, ''))
      }
      // Handle bullet points
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) {
          inList = true
          listItems = []
        }
        listItems.push(trimmed.substring(2))
      }
      // Handle bold text (**text**)
      else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        if (inList && listItems.length > 0) {
          formatted.push(
            <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
              {listItems.map((item, i) => (
                <li key={i} className="text-slate-400">
                  {formatBoldAndLinks(item)}
                </li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        const boldText = trimmed.replace(/\*\*/g, '')
        formatted.push(
          <strong key={index} className="font-semibold text-white">
            {boldText}
          </strong>
        )
      }
      // Regular paragraph
      else {
        if (inList && listItems.length > 0) {
          formatted.push(
            <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
              {listItems.map((item, i) => (
                <li key={i} className="text-slate-400">
                  {formatBoldAndLinks(item)}
                </li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }

        if (trimmed.length > 0) {
          formatted.push(
            <p key={index} className="mb-4 text-slate-400 leading-relaxed">
              {formatBoldAndLinks(trimmed)}
            </p>
          )
        }
      }
    })

    // Close any remaining list
    if (inList && listItems.length > 0) {
      formatted.push(
        <ul key="list-final" className="list-disc list-inside space-y-1 mb-4 ml-4">
          {listItems.map((item, i) => (
            <li key={i} className="text-slate-400">
              {formatBoldAndLinks(item)}
            </li>
          ))}
        </ul>
      )
    }

    return formatted
  }

  const formatBoldAndLinks = (text: string) => {
    const parts: (string | JSX.Element)[] = []
    let currentIndex = 0

    // Match **bold** text
    const boldRegex = /\*\*(.*?)\*\*/g
    let match

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index))
      }

      // Add bold text
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {match[1]}
        </strong>
      )

      currentIndex = match.index + match[0].length
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex))
    }

    return parts.length > 0 ? parts : text
  }

  const relatedArticles = article.relatedArticles
    .map(id => getArticleById(id, locale as 'en' | 'nl'))
    .filter((article): article is NonNullable<typeof article> => article !== undefined)

  return (
    <Card id={`article-${article.id}`} className={cn('border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors scroll-mt-8', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-slate-800/50 transition-colors duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1 flex-shrink-0">
                  {article.type === 'faq' ? (
                    <HelpCircle className="h-6 w-6 text-violet-400" />
                  ) : (
                    <FileText className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white text-left mb-1">
                    {article.title}
                  </h3>
                  {section && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{section.icon}</span>
                      <span>{section.title}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="prose prose-sm prose-invert max-w-none prose-p:text-slate-400 prose-li:text-slate-400 prose-strong:text-white">
              {formatContent(article.content)}
            </div>

            {showRelated && relatedArticles.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h4 className="text-sm font-semibold text-white mb-3">Related Articles</h4>
                <div className="space-y-2">
                  {relatedArticles.slice(0, 3).map((related) => (
                    <button
                      key={related.id}
                      onClick={() => {
                        if (onRelatedClick) {
                          onRelatedClick(related.id, related.section)
                        }
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-violet-400 hover:bg-violet-500/20 rounded-lg transition-colors duration-200 group"
                      aria-label={`Read article: ${related.title}`}
                    >
                      <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span>{related.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {article.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

