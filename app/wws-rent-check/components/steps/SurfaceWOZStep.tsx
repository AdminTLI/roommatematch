'use client'

import { WWSFormData } from '@/lib/wws-calculator/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ExternalLink, HelpCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SurfaceWOZStepProps {
  formData: WWSFormData
  onChange: (updates: Partial<WWSFormData>) => void
  onNext: () => void
}

export function SurfaceWOZStep({ formData, onChange, onNext }: SurfaceWOZStepProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const canProceed = 
    formData.privateSurfaceArea !== null && 
    formData.privateSurfaceArea > 0 &&
    (formData.housingType === 'non-independent' ? formData.sharedSurfaceArea !== null : true)

  const isNonIndependent = formData.housingType === 'non-independent'

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-6 sm:p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Surface Area [Oppervlakte] & WOZ Value
          </h2>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-brand-text font-semibold mb-2">
              What is the m² of your personal room/studio?
            </label>
            <Input
              type="number"
              value={formData.privateSurfaceArea ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? null : parseFloat(e.target.value)
                onChange({ privateSurfaceArea: value })
              }}
              placeholder="Enter square meters"
              min="1"
              className="h-14 text-lg"
            />
          </div>

          {isNonIndependent && (
            <div>
              <label className="block text-brand-text font-semibold mb-2">
                What is the m² of shared kitchen/living room?
              </label>
              <Input
                type="number"
                value={formData.sharedSurfaceArea ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseFloat(e.target.value)
                  onChange({ sharedSurfaceArea: value })
                }}
                placeholder="Enter square meters"
                min="0"
                className="h-14 text-lg"
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-brand-text font-semibold">
                WOZ Value [WOZ-waarde]
              </label>
              <Popover open={tooltipOpen} onOpenChange={setTooltipOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-brand-muted hover:text-brand-primary transition-colors"
                    aria-label="Help"
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="max-w-xs bg-white border border-brand-border text-brand-text p-4 shadow-xl">
                  <p className="text-sm leading-relaxed mb-2">
                    Go to{' '}
                    <a
                      href="https://www.wozwaardeloket.nl/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-primary hover:underline inline-flex items-center gap-1"
                    >
                      wozwaardeloket.nl
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    , enter your address, and paste the 'WOZ-waarde' here.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <Input
              type="number"
              value={formData.wozValue ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? null : parseFloat(e.target.value)
                onChange({ wozValue: value })
              }}
              placeholder="Enter WOZ value in euros"
              min="0"
              className="h-14 text-lg"
            />
            {isNonIndependent && (
              <p className="text-brand-muted text-sm mt-2">
                Note: WOZ location bonus [Locatiepunten] not included in this calculation for shared housing.
              </p>
            )}
            {!isNonIndependent && formData.wozValue && (
              <p className="text-brand-muted text-sm mt-2">
                Note: WOZ points are capped at 33% of total points (unless rent &gt; €879.66).
              </p>
            )}
          </div>
        </div>

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



