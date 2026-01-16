'use client'

import { EnergyLabel } from '@/lib/wws-calculator/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ExternalLink, HelpCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface EnergyLabelStepProps {
  value: EnergyLabel | null
  onChange: (value: EnergyLabel) => void
  onNext: () => void
}

export function EnergyLabelStep({ value, onChange, onNext }: EnergyLabelStepProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const canProceed = value !== null

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-6 sm:p-8 md:p-10">
        <div className="mb-8">
          <div className="flex items-start gap-3 mb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text flex-1 leading-tight">
              What is the Energy Label [Energieprestatie] of the building?
            </h2>
            <Popover open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex-shrink-0 text-brand-muted hover:text-brand-primary transition-colors"
                  aria-label="Help"
                >
                  <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                className="max-w-xs bg-white border border-brand-border text-brand-text p-4 shadow-xl"
              >
                <p className="text-sm leading-relaxed mb-2">
                  Ask your landlord first. If you can't get it, check{' '}
                  <a
                    href="https://www.ep-online.nl/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:underline inline-flex items-center gap-1"
                  >
                    ep-online.nl
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                <p className="text-sm leading-relaxed text-brand-muted">
                  If you don't know, we'll use the lowest score (Label G) to be conservative.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="mb-8">
          <Select
            value={value || ''}
            onValueChange={(val) => onChange(val as EnergyLabel)}
          >
            <SelectTrigger className="h-14 text-lg border-brand-border focus:border-brand-primary focus:ring-brand-primary">
              <SelectValue placeholder="Select energy label" />
            </SelectTrigger>
            <SelectContent className="bg-white border-brand-border">
              <SelectItem value="A++++">A++++</SelectItem>
              <SelectItem value="A+++">A+++</SelectItem>
              <SelectItem value="A++">A++</SelectItem>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
              <SelectItem value="E">E</SelectItem>
              <SelectItem value="F">F</SelectItem>
              <SelectItem value="G">G</SelectItem>
              <SelectItem value="unknown">I don't know</SelectItem>
            </SelectContent>
          </Select>
          {value === 'unknown' && (
            <p className="text-brand-muted text-sm mt-2">
              We'll use the lowest score (Label G) to be conservative.
            </p>
          )}
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



