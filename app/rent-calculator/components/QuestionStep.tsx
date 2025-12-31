'use client'

import React, { useState, useEffect } from 'react'
import { QuestionConfig } from '@/lib/rent-calculator/types'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestionStepProps {
  config: QuestionConfig
  value: any
  onChange: (value: any) => void
  onNext: () => void
  canProceed: boolean
}

export function QuestionStep({ config, value, onChange, onNext }: QuestionStepProps) {
  // Ensure we always have a controlled value (never undefined)
  // For dropdowns, use empty string to keep Select controlled from the start
  const initialValue = config.type === 'dropdown' 
    ? (value ?? '') 
    : (value ?? (config.type === 'numeric' ? null : ''))
  const [localValue, setLocalValue] = useState(initialValue)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const handleChange = (newValue: any) => {
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value, 10)
    if (!isNaN(numValue)) {
      handleChange(numValue)
    } else if (e.target.value === '') {
      handleChange(null)
    }
  }

  // Sync localValue with prop value when it changes
  useEffect(() => {
    if (config.type === 'dropdown') {
      // For dropdowns, always use empty string for controlled behavior
      setLocalValue(value ?? '')
    } else {
      setLocalValue(value ?? (config.type === 'numeric' ? null : ''))
    }
  }, [value, config.type])

  const isValid = () => {
    if (config.required && (localValue === null || localValue === undefined || localValue === '')) {
      return false
    }
    if (config.type === 'numeric' && localValue !== null) {
      const num = Number(localValue)
      if (config.min !== undefined && num < config.min) return false
      if (config.max !== undefined && num > config.max) return false
    }
    return true
  }

  const canProceed = isValid()

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card matching marketing theme */}
      <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-6 sm:p-8 md:p-10">
        {/* Question Header */}
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text flex-1 leading-tight">
              {config.label}
            </h2>
            {config.tooltip && (
              <Popover open={tooltipOpen} onOpenChange={setTooltipOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex-shrink-0 text-brand-muted hover:text-brand-primary transition-colors touch-manipulation"
                    aria-label="Why we ask this"
                    onClick={(e) => {
                      e.preventDefault()
                      setTooltipOpen(!tooltipOpen)
                    }}
                  >
                    <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="end"
                  className="max-w-xs bg-white border border-brand-border text-brand-text p-4 shadow-xl"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <p className="text-sm leading-relaxed">{config.tooltip}</p>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-8">
          {config.type === 'numeric' && (
            <div className="space-y-4">
              <Input
                type="number"
                value={localValue === null ? '' : localValue}
                onChange={handleNumericChange}
                placeholder={config.placeholder || 'Enter a number'}
                min={config.min}
                max={config.max}
                className="h-14 text-lg border-brand-border focus:border-brand-primary focus:ring-brand-primary"
              />
              {(config.min !== undefined || config.max !== undefined) && (
                <p className="text-brand-muted text-sm">
                  {config.min !== undefined && config.max !== undefined
                    ? `Between ${config.min} and ${config.max}`
                    : config.min !== undefined
                    ? `Minimum: ${config.min}`
                    : `Maximum: ${config.max}`}
                </p>
              )}
            </div>
          )}

          {config.type === 'dropdown' && (
            <Select
              value={localValue !== null && localValue !== undefined && localValue !== '' ? String(localValue) : ''}
              onValueChange={(val) => handleChange(val)}
            >
              <SelectTrigger className="h-14 text-lg border-brand-border focus:border-brand-primary focus:ring-brand-primary">
                <SelectValue placeholder={config.placeholder || 'Select an option'} />
              </SelectTrigger>
              <SelectContent className="bg-white border-brand-border">
                {config.options?.map((option) => (
                  <SelectItem
                    key={String(option.value)}
                    value={String(option.value)}
                    className="text-brand-text"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {config.type === 'toggle' && (
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleChange(true)}
                className={cn(
                  'flex-1 h-14 rounded-xl font-semibold text-lg transition-all',
                  localValue === true
                    ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primaryHover'
                    : 'bg-white border-2 border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary'
                )}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleChange(false)}
                className={cn(
                  'flex-1 h-14 rounded-xl font-semibold text-lg transition-all',
                  localValue === false
                    ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primaryHover'
                    : 'bg-white border-2 border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary'
                )}
              >
                No
              </button>
            </div>
          )}

          {config.type === 'toggle-era' && (
            <div className="flex gap-4">
              {config.options?.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => handleChange(option.value)}
                  className={cn(
                    'flex-1 h-14 rounded-xl font-semibold text-lg transition-all',
                    localValue === option.value
                      ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primaryHover'
                      : 'bg-white border-2 border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="flex justify-end">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              'h-12 px-8 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/20',
              !canProceed && 'opacity-50 cursor-not-allowed'
            )}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
