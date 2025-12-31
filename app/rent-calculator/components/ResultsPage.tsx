'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalculationResult, RentCalculatorFormData } from '@/lib/rent-calculator/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Lock, ArrowRight, CheckCircle2, AlertTriangle, TrendingUp, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResultsPageProps {
  result: CalculationResult
  formData: RentCalculatorFormData
  onRentChange: (rent: number | null) => void
  onReset: () => void
}

export function ResultsPage({ result, formData, onRentChange, onReset }: ResultsPageProps) {
  const router = useRouter()
  const [localCurrentRent, setLocalCurrentRent] = useState<string>(
    formData.currentRent?.toString() || ''
  )

  const handleRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalCurrentRent(value)
    const numValue = parseFloat(value)
    onRentChange(isNaN(numValue) ? null : numValue)
  }

  const rentDifference =
    formData.currentRent && formData.currentRent > result.estimatedMaxRent
      ? formData.currentRent - result.estimatedMaxRent
      : 0

  const getStatusIcon = () => {
    switch (result.rentStatus) {
      case 'overpaying':
        return <AlertTriangle className="h-8 w-8 text-red-500" />
      case 'fair-price':
        return <CheckCircle2 className="h-8 w-8 text-emerald-500" />
      case 'market-rate':
        return <TrendingUp className="h-8 w-8 text-blue-500" />
    }
  }

  const getStatusColor = () => {
    switch (result.rentStatus) {
      case 'overpaying':
        return 'text-red-600'
      case 'fair-price':
        return 'text-emerald-600'
      case 'market-rate':
        return 'text-blue-600'
    }
  }

  const getStatusLabel = () => {
    switch (result.rentStatus) {
      case 'overpaying':
        return 'Overpaying'
      case 'fair-price':
        return 'Fair Price'
      case 'market-rate':
        return 'Market Rate'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 space-y-6">
      {/* Main Results Card */}
      <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-6 sm:p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-text mb-4">
            Your Rent Health Check
          </h2>
          <p className="text-brand-muted text-lg">
            Based on Dutch WWSO rental law standards
          </p>
        </div>

        {/* Total Points Display */}
        <div className="text-center mb-8">
          <div className="inline-block bg-brand-primary/5 border-2 border-brand-primary/20 rounded-2xl px-8 py-6">
            <p className="text-brand-muted text-sm mb-2 font-medium">Total WWSO Points</p>
            <p className="text-5xl sm:text-6xl font-bold text-brand-primary">
              {result.points.totalPoints}
            </p>
          </div>
        </div>

        {/* Rent Status Gauge */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            {getStatusIcon()}
            <h3 className={cn('text-2xl font-bold', getStatusColor())}>
              {getStatusLabel()}
            </h3>
          </div>
          
          <div className="bg-brand-primary/5 border border-brand-border rounded-xl p-6">
            {result.threshold.category === 'liberalized' ? (
              <div className="text-center">
                <p className="text-brand-text text-lg mb-2">
                  Your property is in the <span className="font-bold text-brand-primary">Liberalized Sector</span>
                </p>
                <p className="text-brand-muted">
                  Rent is set by market rates with no legal maximum limit
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-brand-muted">Estimated Legal Max Rent</span>
                    <span className="text-brand-text font-bold text-xl">
                      €{result.estimatedMaxRent.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    value={100}
                    className="h-3 bg-brand-border/50 [&>div]:bg-brand-primary/50"
                  />
                </div>
                
                {formData.currentRent && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-brand-muted">Your Current Rent</span>
                      <span className="text-brand-text font-bold text-xl">
                        €{formData.currentRent.toFixed(2)}
                      </span>
                    </div>
                    <Progress
                      value={
                        result.estimatedMaxRent > 0
                          ? Math.min(100, (formData.currentRent / result.estimatedMaxRent) * 100)
                          : 0
                      }
                      className={cn(
                        'h-3 [&>div]:bg-brand-primary',
                        result.isOverpaying && '[&>div]:bg-red-500'
                      )}
                    />
                    {result.isOverpaying && (
                      <p className="text-red-600 text-sm mt-2 font-semibold">
                        You may be overpaying by €{rentDifference.toFixed(2)}/month
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Current Rent Input */}
        <div className="mb-8">
          <label className="block text-brand-muted text-sm mb-2 font-medium">
            Enter your current monthly rent (optional)
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">
                €
              </span>
              <Input
                type="number"
                value={localCurrentRent}
                onChange={handleRentChange}
                placeholder="0.00"
                className="h-14 text-lg border-brand-border pl-10 focus:border-brand-primary focus:ring-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Point Breakdown */}
        <div className="bg-brand-primary/5 border border-brand-border rounded-xl p-6 mb-8">
          <h3 className="text-brand-text font-semibold text-lg mb-4">Point Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-brand-muted">
              <span>Base points ({formData.roomSize || 0} m² × 5)</span>
              <span className="font-semibold text-brand-text">{result.points.basePoints} pts</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Energy label</span>
              <span className="font-semibold text-brand-text">
                {result.points.energyLabelPoints > 0 ? '+' : ''}
                {result.points.energyLabelPoints} pts
              </span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Facilities</span>
              <span className="font-semibold text-brand-text">
                {result.points.facilitiesPoints > 0 ? '+' : ''}
                {result.points.facilitiesPoints} pts
              </span>
            </div>
            {result.points.sharedPenalty !== 0 && (
              <div className="flex justify-between text-red-600">
                <span>Shared penalty</span>
                <span className="font-semibold">
                  {result.points.sharedPenalty} pts
                </span>
              </div>
            )}
            <div className="border-t border-brand-border pt-3 mt-3">
              <div className="flex justify-between text-brand-text font-bold text-lg">
                <span>Total</span>
                <span>{result.points.totalPoints} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Over Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onReset}
            variant="outline"
            className="border-brand-border text-brand-text hover:bg-brand-primary/5 hover:border-brand-primary"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>

      {/* Premium Locked Section */}
      <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-6 sm:p-8 md:p-10 relative">
        {/* Lock Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 border-2 border-brand-primary/20 mb-4">
            <Lock className="h-8 w-8 text-brand-primary" />
          </div>
          <h3 className="text-2xl font-bold text-brand-text mb-2">
            Unlock Full Legal Report
          </h3>
          <p className="text-brand-muted">
            Get detailed insights and a ready-to-use negotiation template
          </p>
        </div>

        {/* Locked Features */}
        <div className="space-y-4 mb-8">
          <div className="bg-brand-primary/5 border border-brand-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-brand-primary/60 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-brand-text font-semibold mb-1">Legal Negotiation Template</h4>
                <p className="text-brand-muted text-sm">
                  Professional email template ready to send to your landlord, citing WWSO regulations
                  and your legal rights
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary/5 border border-brand-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-brand-primary/60 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-brand-text font-semibold mb-1">Detailed Point Breakdown</h4>
                <p className="text-brand-muted text-sm">
                  Understand exactly how each factor affects your legal rent threshold, with
                  explanations of WWSO point calculations
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary/5 border border-brand-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-brand-primary/60 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-brand-text font-semibold mb-1">Extended Questionnaire</h4>
                <p className="text-brand-muted text-sm">
                  Answer additional questions for a deeper analysis of your maximum legal rent,
                  including property-specific factors and amenities
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary/5 border border-brand-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-brand-primary/60 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-brand-text font-semibold mb-1">Location-Based Analysis</h4>
                <p className="text-brand-muted text-sm">
                  Get accurate rent calculations based on your specific location, which affects
                  regional rent regulations and point system adjustments
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-primary/5 border border-brand-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-brand-primary/60 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-brand-text font-semibold mb-1">Higher Accuracy & Lower Discrepancies</h4>
                <p className="text-brand-muted text-sm">
                  Benefit from a more precise point system calculation with reduced margin of error,
                  giving you confidence in your legal rent threshold assessment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div>
          <Button
            onClick={() => router.push('/auth/sign-up?utm_source=rent_calculator&utm_medium=cta')}
            className="w-full h-14 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold text-base sm:text-lg rounded-xl shadow-lg shadow-brand-primary/20"
          >
            <span className="block sm:inline">Unlock Full Legal Report</span>
            <span className="hidden sm:inline">&nbsp;& Find Compatible Roommates</span>
            <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
          </Button>
          <p className="text-center text-brand-muted text-sm mt-4">
            Free account required • No credit card needed
          </p>
        </div>
      </div>
    </div>
  )
}
