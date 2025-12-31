'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, FileText, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/use-debounce'
import { searchHelpArticles, getSearchSuggestions, SearchResult } from '../lib/search-utils'
import { useApp } from '@/app/providers'
import { getSectionById } from '../help-content'
import { cn } from '@/lib/utils'

interface HelpCenterSearchProps {
  onArticleSelect?: (articleId: string, sectionId: string) => void
  className?: string
}

export function HelpCenterSearch({ onArticleSelect, className }: HelpCenterSearchProps) {
  const { locale } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 300)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Search when query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      const searchResults = searchHelpArticles(debouncedQuery, locale as 'en' | 'nl')
      setResults(searchResults)
      setIsOpen(true)
      setSelectedIndex(-1)
    } else {
      setResults([])
      const searchSuggestions = getSearchSuggestions('')
      setSuggestions(searchSuggestions)
      setIsOpen(true)
    }
  }, [debouncedQuery, locale])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const maxIndex = results.length > 0 ? results.length - 1 : suggestions.length - 1
      setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      if (results.length > 0 && results[selectedIndex]) {
        handleArticleClick(results[selectedIndex].article.id, results[selectedIndex].article.section)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }, [results, suggestions, selectedIndex])

  const handleArticleClick = (articleId: string, sectionId: string) => {
    if (onArticleSelect) {
      onArticleSelect(articleId, sectionId)
    }
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    inputRef.current?.focus()
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const hasResults = results.length > 0
  const showSuggestions = query.trim().length === 0 && suggestions.length > 0
  const showNoResults = debouncedQuery.trim().length > 0 && results.length === 0

  return (
    <div ref={searchRef} className={cn('relative w-full max-w-2xl mx-auto', className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for help articles, FAQs, or topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-10 h-14 text-lg"
          aria-label="Search help center"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && (hasResults || showSuggestions || showNoResults) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[500px] overflow-y-auto z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {hasResults && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {results.length} {results.length === 1 ? 'result' : 'results'} found
              </div>
              <div role="listbox" aria-label="Search results">
                {results.map((result, index) => {
                  const section = getSectionById(result.article.section, locale as 'en' | 'nl')
                  const isSelected = index === selectedIndex
                  
                  return (
                    <button
                      key={result.article.id}
                      onClick={() => handleArticleClick(result.article.id, result.article.section)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-lg transition-colors duration-150',
                        'hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                        isSelected && 'bg-gray-50'
                      )}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          {result.article.type === 'faq' ? (
                            <HelpCircle className="h-5 w-5 text-blue-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-gray-900 truncate">
                              {result.article.title}
                            </div>
                            {section && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                                {section.icon} {section.title}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 line-clamp-2">
                            {result.article.content.substring(0, 100)}...
                          </div>
                          {result.matchedFields.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {result.matchedFields.slice(0, 3).map((field) => (
                                <span
                                  key={field}
                                  className="text-xs text-gray-500 bg-blue-50 px-2 py-0.5 rounded"
                                >
                                  {field}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {showNoResults && (
            <div className="p-8 text-center">
              <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <div className="text-gray-900 font-medium mb-1">No results found</div>
              <div className="text-sm text-gray-500 mb-4">
                Try searching with different keywords or check the suggestions below
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {getSearchSuggestions(debouncedQuery).slice(0, 4).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline px-3 py-1 bg-blue-50 rounded-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSuggestions && (
            <div className="p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Popular Searches
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

