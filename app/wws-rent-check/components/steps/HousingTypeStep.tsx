'use client'

import { HousingType } from '@/lib/wws-calculator/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HousingTypeStepProps {
  value: HousingType | null
  onChange: (value: HousingType) => void
  onNext: () => void
}

export function HousingTypeStep({ value, onChange, onNext }: HousingTypeStepProps) {
  const canProceed = value !== null

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-6 sm:p-8 md:p-10">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text mb-4">
            What type of accommodation do you live in?
          </h2>
          <p className="text-brand-muted text-lg">
            This determines how we calculate your maximum legal rent
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            type="button"
            onClick={() => onChange('independent')}
            className={cn(
              'w-full text-left p-6 rounded-xl border-2 transition-all',
              value === 'independent'
                ? 'border-brand-primary bg-brand-primary/5 shadow-lg'
                : 'border-brand-border hover:border-brand-primary/50 hover:bg-brand-primary/2'
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1',
                value === 'independent'
                  ? 'border-brand-primary bg-brand-primary'
                  : 'border-brand-border'
              )}>
                {value === 'independent' && (
                  <div className="w-3 h-3 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-brand-text mb-2">
                  Independent [Zelfstandige woonruimte]
                </h3>
                <p className="text-brand-muted">
                  Own front door, own kitchen, own toilet. This includes studios and apartments.
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChange('non-independent')}
            className={cn(
              'w-full text-left p-6 rounded-xl border-2 transition-all',
              value === 'non-independent'
                ? 'border-brand-primary bg-brand-primary/5 shadow-lg'
                : 'border-brand-border hover:border-brand-primary/50 hover:bg-brand-primary/2'
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1',
                value === 'non-independent'
                  ? 'border-brand-primary bg-brand-primary'
                  : 'border-brand-border'
              )}>
                {value === 'non-independent' && (
                  <div className="w-3 h-3 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-brand-text mb-2">
                  Room / Shared Housing [Onzelfstandige woonruimte]
                </h3>
                <p className="text-brand-muted">
                  Shared kitchen and/or toilet. This includes rooms in shared houses.
                </p>
              </div>
            </div>
          </button>
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



