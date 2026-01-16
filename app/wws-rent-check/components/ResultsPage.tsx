'use client'

import { useState } from 'react'
import { WWSFormData, WWSResult } from '@/lib/wws-calculator/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, AlertTriangle, TrendingUp, RotateCcw, Download, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateLandlordLetter } from '@/lib/wws-calculator/letter-generator'
import { showSuccessToast, showErrorToast } from '@/lib/toast'

interface ResultsPageProps {
  result: WWSResult
  formData: WWSFormData
  onRentChange: (rent: number | null) => void
  onReset: () => void
  onAddressChange?: (address: string) => void
}

export function ResultsPage({ result, formData, onRentChange, onReset, onAddressChange }: ResultsPageProps) {
  const [localCurrentRent, setLocalCurrentRent] = useState<string>(
    formData.currentRent?.toString() || ''
  )
  const [address, setAddress] = useState(formData.address || '')

  const handleRentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalCurrentRent(value)
    const numValue = parseFloat(value)
    onRentChange(isNaN(numValue) ? null : numValue)
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value
    setAddress(newAddress)
    if (onAddressChange) {
      onAddressChange(newAddress)
    }
  }

  const rentDifference =
    formData.currentRent && formData.currentRent > result.maxRent
      ? formData.currentRent - result.maxRent
      : 0

  const getStatusIcon = () => {
    if (result.category === 'liberalized') {
      return <TrendingUp className="h-8 w-8 text-blue-500" />
    }
    if (result.isOverpaying) {
      return <AlertTriangle className="h-8 w-8 text-red-500" />
    }
    return <CheckCircle2 className="h-8 w-8 text-emerald-500" />
  }

  const getStatusColor = () => {
    if (result.category === 'liberalized') {
      return 'text-blue-600'
    }
    if (result.isOverpaying) {
      return 'text-red-600'
    }
    return 'text-emerald-600'
  }

  const getStatusLabel = () => {
    if (result.category === 'liberalized') {
      return 'Liberalized Sector'
    }
    if (result.isOverpaying) {
      return 'Overpaying'
    }
    return 'Fair Price'
  }

  const handleDownloadLetter = async () => {
    try {
      const letter = generateLandlordLetter({ ...formData, address: address || formData.address }, result)
      
      // Copy to clipboard
      await navigator.clipboard.writeText(letter)
      showSuccessToast('Letter copied to clipboard!')
      
      // Also create a downloadable text file
      const blob = new Blob([letter], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wws-rent-letter-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating letter:', error)
      showErrorToast('Failed to generate letter. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 space-y-6">
      {/* Main Results Card */}
      <div className="bg-white border-2 border-brand-border rounded-2xl shadow-elev-2 p-6 sm:p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-text mb-4">
            Your WWS Rent Check Results
          </h2>
          <p className="text-brand-muted text-lg">
            Based on Dutch WWS (Woningwaarderingsstelsel) rental law standards
          </p>
        </div>

        {/* Total Points Display */}
        <div className="text-center mb-8">
          <div className="inline-block bg-brand-primary/5 border-2 border-brand-primary/20 rounded-2xl px-8 py-6">
            <p className="text-brand-muted text-sm mb-2 font-medium">Total WWS Points</p>
            <p className="text-5xl sm:text-6xl font-bold text-brand-primary">
              {Math.round(result.points.totalPoints)}
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
            {result.category === 'liberalized' ? (
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
                    <span className="text-brand-muted">Maximum Legal Basic Rent [Kale Huur]</span>
                    <span className="text-brand-text font-bold text-xl">
                      €{result.maxRent.toFixed(2)}
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
                        result.maxRent > 0
                          ? Math.min(100, (formData.currentRent / result.maxRent) * 100)
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

        {/* Address Input */}
        <div className="mb-6">
          <label className="block text-brand-muted text-sm mb-2 font-medium">
            Your Address (for the letter)
          </label>
          <Input
            type="text"
            value={address}
            onChange={handleAddressChange}
            placeholder="Enter your address"
            className="h-14 text-lg"
          />
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
              <span>Kitchen [Keuken]</span>
              <span className="font-semibold text-brand-text">
                {result.points.kitchen.finalPoints.toFixed(2)} pts
              </span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Sanitary [Sanitair]</span>
              <span className="font-semibold text-brand-text">
                {result.points.sanitary.finalPoints.toFixed(2)} pts
              </span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Surface Area [Oppervlakte]</span>
              <span className="font-semibold text-brand-text">
                {result.points.surface.total.toFixed(2)} pts
              </span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Energy Label [Energieprestatie]</span>
              <span className="font-semibold text-brand-text">
                {result.points.energy.toFixed(2)} pts
              </span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Outdoor Space [Buitenruimte]</span>
              <span className="font-semibold text-brand-text">
                {result.points.outdoor.total.toFixed(2)} pts
              </span>
            </div>
            {result.points.woz.applied && (
              <div className="flex justify-between text-brand-muted">
                <span>WOZ Value</span>
                <span className="font-semibold text-brand-text">
                  {result.points.woz.cappedPoints.toFixed(2)} pts
                </span>
              </div>
            )}
            <div className="border-t border-brand-border pt-3 mt-3">
              <div className="flex justify-between text-brand-text font-bold text-lg">
                <span>Total</span>
                <span>{Math.round(result.points.totalPoints)} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download Letter Button */}
        <div className="flex justify-center gap-4 mb-4">
          <Button
            onClick={handleDownloadLetter}
            className="h-14 px-8 bg-brand-primary hover:bg-brand-primaryHover text-white font-semibold rounded-xl shadow-lg shadow-brand-primary/20"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Letter for Landlord
          </Button>
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
    </div>
  )
}

