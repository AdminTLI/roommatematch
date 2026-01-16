'use client'

import { WWSFormData } from '@/lib/wws-calculator/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OutdoorHeatingStepProps {
  formData: WWSFormData
  onChange: (updates: Partial<WWSFormData>) => void
  onNext: () => void
}

export function OutdoorHeatingStep({ formData, onChange, onNext }: OutdoorHeatingStepProps) {
  const isNonIndependent = formData.housingType === 'non-independent'

  const canProceed = true // All fields are optional

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-6 sm:p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Outdoor Space [Buitenruimte]
          </h2>
          <p className="text-brand-muted text-lg">
            Private and shared outdoor areas
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-brand-text font-semibold mb-2">
              What is the m² of your private outdoor space?
            </label>
            <p className="text-brand-muted text-sm mb-2">
              Formula: 2 pts + (0.35 × m²)
            </p>
            <Input
              type="number"
              value={formData.privateOutdoorSpace ?? ''}
              onChange={(e) => {
                const value = e.target.value === '' ? null : parseFloat(e.target.value)
                onChange({ privateOutdoorSpace: value })
              }}
              placeholder="Enter square meters (0 if none)"
              min="0"
              className="h-14 text-lg"
            />
          </div>

          {isNonIndependent && (
            <div>
              <label className="block text-brand-text font-semibold mb-2">
                What is the m² of shared outdoor space?
              </label>
              <p className="text-brand-muted text-sm mb-2">
                Formula: (2 pts + (0.35 × m²)) / Number of Sharers
              </p>
              <Input
                type="number"
                value={formData.sharedOutdoorSpace ?? ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseFloat(e.target.value)
                  onChange({ sharedOutdoorSpace: value })
                }}
                placeholder="Enter square meters (0 if none)"
                min="0"
                className="h-14 text-lg mb-3"
              />
              {formData.sharedOutdoorSpace && formData.sharedOutdoorSpace > 0 && (
                <div>
                  <label className="block text-brand-text font-semibold mb-2">
                    <strong>How many households share this outdoor space? (including yourself)</strong>
                  </label>
                  <Input
                    type="number"
                    value={formData.outdoorNumSharers ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseInt(e.target.value, 10)
                      onChange({ outdoorNumSharers: value })
                    }}
                    placeholder="Enter number"
                    min="2"
                    className="h-14 text-lg"
                  />
                </div>
              )}
            </div>
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



