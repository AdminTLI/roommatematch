'use client'

import { useState, useRef } from 'react'
import { RentCalculatorFormData, CalculationResult } from '@/lib/rent-calculator/types'
import { QUESTION_CONFIGS, calculateRentResult } from '@/lib/rent-calculator/wwso-calculator'
import { QuestionStep } from './QuestionStep'
import { ResultsPage } from './ResultsPage'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, Loader2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Container from '@/components/ui/primitives/container'

const TOTAL_STEPS = 7

export function RentCalculatorClient() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const prevStepRef = useRef(0)
  const [formData, setFormData] = useState<RentCalculatorFormData>({
    roomSize: null,
    housemates: null,
    energyLabel: null,
    privateKitchen: null,
    privateBathroom: null,
    outdoorSpace: null,
    buildingEra: null,
    currentRent: null,
  })

  // Calculate result when all questions are answered
  const result: CalculationResult | null =
    currentStep === TOTAL_STEPS
      ? calculateRentResult(formData)
      : null

  // Handle step navigation
  const handleNext = () => {
    if (currentStep === 0) {
      // Intro step - move to first question
      setDirection('forward')
      prevStepRef.current = currentStep
      setCurrentStep(1)
    } else if (currentStep < TOTAL_STEPS - 1) {
      setDirection('forward')
      prevStepRef.current = currentStep
      setCurrentStep(currentStep + 1)
    } else if (currentStep === TOTAL_STEPS - 1) {
      // Last question - show loading then results
      setDirection('forward')
      prevStepRef.current = currentStep
      setIsGenerating(true)
      setTimeout(() => {
        setIsGenerating(false)
        setCurrentStep(TOTAL_STEPS)
      }, 1500)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      // Don't allow going back to intro from first question
      setDirection('backward')
      prevStepRef.current = currentStep
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle form field updates
  const handleFieldChange = (key: keyof RentCalculatorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // Handle current rent change in results
  const handleRentChange = (rent: number | null) => {
    setFormData((prev) => ({ ...prev, currentRent: rent }))
  }

  // Handle reset - start the calculator over
  const handleReset = () => {
    setCurrentStep(0)
    setIsGenerating(false)
    setDirection('forward')
    setFormData({
      roomSize: null,
      housemates: null,
      energyLabel: null,
      privateKitchen: null,
      privateBathroom: null,
      outdoorSpace: null,
      buildingEra: null,
      currentRent: null,
    })
  }

  // Get current question config - adjust index for intro step (step 0 is intro, step 1+ are questions)
  const currentQuestion = currentStep > 0 ? QUESTION_CONFIGS[currentStep - 1] : QUESTION_CONFIGS[0]
  const isResultsPage = currentStep === TOTAL_STEPS

  const progress = isResultsPage ? 100 : (currentStep === 0 ? 0 : (currentStep / TOTAL_STEPS) * 100)

  return (
    <div className="bg-white min-h-screen">
      {/* Header with Progress - Only show when not on results page or intro */}
      {!isResultsPage && currentStep > 0 && (
        <div className="sticky top-16 md:top-20 z-20 bg-white/95 backdrop-blur-sm border-b border-brand-border shadow-sm py-6">
          <Container>
            <div className="flex items-center gap-4 mb-4">
              {currentStep > 1 && currentStep < TOTAL_STEPS && (
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
                  Housing Health Check
                </h1>
                <span className="text-brand-muted text-sm font-medium">
                  {currentStep} of {TOTAL_STEPS}
                </span>
              </div>
              <Progress
                value={isResultsPage ? 100 : ((currentStep) / TOTAL_STEPS) * 100}
                className="h-2 bg-brand-border/50 [&>div]:bg-brand-primary"
              />
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* Main Content - Add margin to account for sticky header */}
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
                    Welcome to the Housing Health Check
                  </h2>
                  <p className="text-brand-muted text-lg">
                    Calculate your legal maximum rent based on Dutch rental law
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="text-brand-text font-semibold text-lg mb-2">What you'll do:</h3>
                    <ul className="space-y-2 text-brand-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-brand-primary mt-1">•</span>
                        <span>Answer 7 simple questions about your rental property</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-primary mt-1">•</span>
                        <span>Get an estimate of your maximum legal rent based on WWSO point system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-primary mt-1">•</span>
                        <span>Compare your current rent with the legal threshold</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-brand-text font-semibold text-lg mb-2">What we'll ask:</h3>
                    <ul className="space-y-2 text-brand-muted">
                      <li className="flex items-start gap-2">
                        <span className="text-brand-primary mt-1">•</span>
                        <span>Room size, number of housemates, and building details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-primary mt-1">•</span>
                        <span>Energy label and facilities (kitchen, bathroom, outdoor space)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-brand-primary mt-1">•</span>
                        <span>Your current monthly rent (optional)</span>
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
                        <span>Results are based on 2025 WWSO (Woonruimte Wet) standards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">⚠</span>
                        <span>For official rent assessment, consult a qualified professional or rent tribunal</span>
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

        {currentStep > 0 && currentStep < TOTAL_STEPS && !isGenerating && (
          <div
            key={currentStep}
            className={cn(
              direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left'
            )}
          >
            <QuestionStep
              config={currentQuestion}
              value={formData[currentQuestion.key]}
              onChange={(value) => handleFieldChange(currentQuestion.key, value)}
              onNext={handleNext}
              canProceed={
                formData[currentQuestion.key] !== null &&
                formData[currentQuestion.key] !== undefined &&
                formData[currentQuestion.key] !== ''
              }
            />
          </div>
        )}

        {isGenerating && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-12 text-center max-w-md">
              <Loader2 className="h-12 w-12 text-brand-primary animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-brand-text mb-2">Generating Report...</h2>
              <p className="text-brand-muted">
                Calculating your WWSO points and legal rent threshold
              </p>
            </div>
          </div>
        )}

        {currentStep === TOTAL_STEPS && result && (
          <div
            key="results"
            className="animate-slide-in-right"
          >
            <ResultsPage
              result={result}
              formData={formData}
              onRentChange={handleRentChange}
              onReset={handleReset}
            />
          </div>
        )}
        </Container>
      </div>

      {/* Footer Disclaimer */}
      <Container className="py-12">
        <p className="text-brand-muted text-sm max-w-2xl mx-auto text-center">
          This calculator is based on 2025 WWSO (Woonruimte Wet) standards.
          Results are estimates and should not be considered legal advice.
        </p>
      </Container>
    </div>
  )
}

