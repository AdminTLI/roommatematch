'use client'

import { useState, useRef } from 'react'
import { WWSFormData, WWSResult } from '@/lib/wws-calculator/types'
import { calculateWWSResult } from '@/lib/wws-calculator/calculator'
import { HousingTypeStep } from './steps/HousingTypeStep'
import { SurfaceWOZStep } from './steps/SurfaceWOZStep'
import { EnergyLabelStep } from './steps/EnergyLabelStep'
import { FacilitiesStep } from './steps/FacilitiesStep'
import { OutdoorHeatingStep } from './steps/OutdoorHeatingStep'
import { DisclaimerModal } from './DisclaimerModal'
import { ResultsPage } from './ResultsPage'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Container from '@/components/ui/primitives/container'

const TOTAL_STEPS = 5

const createEmptyFormData = (): WWSFormData => ({
  housingType: null,
  privateSurfaceArea: null,
  sharedSurfaceArea: null,
  wozValue: null,
  energyLabel: null,
  kitchenCounterLength: null,
  kitchenAppliances: [],
  kitchenShared: null,
  kitchenNumSharers: null,
  toiletType: null,
  toiletInBathroom: false,
  sanitaryFacilities: [],
  sanitaryShared: null,
  sanitaryNumSharers: null,
  heatingType: null,
  numHeatedRooms: null,
  thermostatValves: false,
  numThermostatValves: null,
  privateOutdoorSpace: null,
  sharedOutdoorSpace: null,
  outdoorNumSharers: null,
  address: '',
  currentRent: null,
})

export function WWSRentCheckClient() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const prevStepRef = useRef(0)
  const [formData, setFormData] = useState<WWSFormData>(createEmptyFormData())

  // Calculate result when all steps are complete and disclaimer is accepted
  const result: WWSResult | null =
    currentStep > TOTAL_STEPS && disclaimerAccepted
      ? calculateWWSResult(formData)
      : null

  // Handle step navigation
  const handleNext = () => {
    if (currentStep === 0) {
      // Intro step - move to first question
      setDirection('forward')
      prevStepRef.current = currentStep
      setCurrentStep(1)
    } else if (currentStep < TOTAL_STEPS) {
      setDirection('forward')
      prevStepRef.current = currentStep
      setCurrentStep(currentStep + 1)
    } else if (currentStep === TOTAL_STEPS) {
      // Last step - show disclaimer modal
      setShowDisclaimer(true)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection('backward')
      prevStepRef.current = currentStep
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle disclaimer acceptance
  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false)
    setDisclaimerAccepted(true)
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setCurrentStep(TOTAL_STEPS + 1) // Show results (step 6)
    }, 1500)
  }

  // Handle form field updates
  const handleFieldChange = (updates: Partial<WWSFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  // Handle current rent change in results
  const handleRentChange = (rent: number | null) => {
    setFormData((prev) => ({ ...prev, currentRent: rent }))
  }

  // Handle address change in results
  const handleAddressChange = (address: string) => {
    setFormData((prev) => ({ ...prev, address }))
  }

  // Handle reset - start the calculator over
  const handleReset = () => {
    setCurrentStep(0)
    setIsGenerating(false)
    setDirection('forward')
    setShowDisclaimer(false)
    setDisclaimerAccepted(false)
    setFormData(createEmptyFormData())
  }

  const isResultsPage = currentStep > TOTAL_STEPS && disclaimerAccepted
  const progress = isResultsPage ? 100 : (currentStep === 0 ? 0 : (currentStep / TOTAL_STEPS) * 100)

  return (
    <div className="bg-white min-h-screen">
      {/* Header with Progress - Only show when not on results page */}
      {!isResultsPage && currentStep > 0 && (
        <div className="sticky top-16 md:top-20 z-20 bg-white/95 backdrop-blur-sm border-b border-brand-border shadow-sm py-6">
          <Container>
            <div className="flex items-center gap-4 mb-4">
              {currentStep > 0 && currentStep < TOTAL_STEPS && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  className="text-brand-text hover:bg-brand-primary/5"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text">
                    WWS Rent Check Calculator
                  </h1>
                  <span className="text-brand-muted text-sm font-medium">
                    {currentStep + 1} of {TOTAL_STEPS}
                  </span>
                </div>
                <Progress
                  value={progress}
                  className="h-2 bg-brand-border/50 [&>div]:bg-brand-primary"
                />
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-12 md:pt-16">
        <Container className="py-8 sm:py-12">
          {/* Introduction Card - shown before first question */}
          {currentStep === 0 && !isGenerating && (
            <div
              key="intro"
              className={cn(
                direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
              )}
            >
              <div className="w-full max-w-2xl mx-auto">
                <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-6 sm:p-8 md:p-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 border-2 border-brand-primary/20 mb-4">
                      <Info className="h-8 w-8 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text mb-4">
                      Welcome to the WWS Rent Check Calculator
                    </h2>
                    <p className="text-brand-muted text-lg">
                      Determine the maximum legal rent for your accommodation based on Dutch WWS (Woningwaarderingsstelsel) regulations
                    </p>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <h3 className="text-brand-text font-semibold text-lg mb-2">What you'll do:</h3>
                      <ul className="space-y-2 text-brand-muted">
                        <li className="flex items-start gap-2">
                          <span className="text-brand-primary mt-1">•</span>
                          <span>Answer questions about your accommodation type, size, and facilities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-primary mt-1">•</span>
                          <span>Get an estimate of your maximum legal basic rent [Kale Huur] based on WWS points</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-primary mt-1">•</span>
                          <span>Compare your current rent with the legal threshold</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-brand-primary mt-1">•</span>
                          <span>Download a letter template to send to your landlord</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <h3 className="text-yellow-900 font-semibold text-lg mb-2">Important to know:</h3>
                      <ul className="space-y-2 text-yellow-800 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">⚠</span>
                          <span>This calculator provides estimates only and is not legally binding</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">⚠</span>
                          <span>Results are based on 2025 WWS (Woningwaarderingsstelsel) standards</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">⚠</span>
                          <span>For official rent assessment, consult the Huurcommissie or a legal expert</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleNext}
                      className="h-12 px-8 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/20"
                    >
                      Let's begin
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Components */}
          {currentStep === 1 && (
            <div
              key={currentStep}
              className={cn(
                direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
              )}
            >
              <HousingTypeStep
                value={formData.housingType}
                onChange={(value) => handleFieldChange({ housingType: value })}
                onNext={handleNext}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div
              key={currentStep}
              className={cn(
                direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
              )}
            >
              <SurfaceWOZStep
                formData={formData}
                onChange={handleFieldChange}
                onNext={handleNext}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div
              key={currentStep}
              className={cn(
                direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
              )}
            >
              <EnergyLabelStep
                value={formData.energyLabel}
                onChange={(value) => handleFieldChange({ energyLabel: value })}
                onNext={handleNext}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div
              key={currentStep}
              className={cn(
                direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
              )}
            >
              <FacilitiesStep
                formData={formData}
                onChange={handleFieldChange}
                onNext={handleNext}
              />
            </div>
          )}

          {currentStep === TOTAL_STEPS && (
            <div
              key={currentStep}
              className={cn(
                direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
              )}
            >
              <OutdoorHeatingStep
                formData={formData}
                onChange={handleFieldChange}
                onNext={handleNext}
              />
            </div>
          )}

          {isGenerating && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-12 text-center max-w-md">
                <Loader2 className="h-12 w-12 text-brand-primary animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-brand-text mb-2">Calculating...</h2>
                <p className="text-brand-muted">
                  Computing your WWS points and maximum legal rent
                </p>
              </div>
            </div>
          )}

          {isResultsPage && result && (
            <div
              key="results"
              className="animate-slide-in-right"
            >
              <ResultsPage
                result={result}
                formData={formData}
                onRentChange={handleRentChange}
                onAddressChange={handleAddressChange}
                onReset={handleReset}
              />
            </div>
          )}
        </Container>
      </div>

      {/* Disclaimer Modal */}
      <DisclaimerModal
        open={showDisclaimer}
        onAccept={handleDisclaimerAccept}
      />

      {/* Footer Disclaimer */}
      <Container className="py-12">
        <p className="text-brand-muted text-sm max-w-2xl mx-auto text-center">
          This calculator is based on 2025 WWS (Woningwaarderingsstelsel) standards.
          Results are estimates and should not be considered legal advice.
        </p>
      </Container>
    </div>
  )
}

