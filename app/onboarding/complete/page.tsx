'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight } from 'lucide-react'

export default function CompletePage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  
  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          router.push('/matches')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(countdownInterval)
  }, [router])
  
  const handleManualRedirect = () => {
    router.push('/matches')
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
      <div className="text-center space-y-8 px-4">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>
        
        {/* Main Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">All set!</h1>
          <p className="text-lg text-gray-600">
            Your questionnaire has been submitted successfully.
          </p>
        </div>
        
        {/* Countdown Message */}
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Redirecting to your matches in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
          
          {/* Manual Redirect Button */}
          <Button 
            onClick={handleManualRedirect}
            size="lg"
            className="gap-2"
          >
            Go to Matches Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Additional Info */}
        <div className="pt-8 border-t border-gray-200 max-w-md mx-auto">
          <p className="text-sm text-gray-600">
            We'll use your responses to find compatible roommates. 
            You can update your preferences anytime from your profile.
          </p>
        </div>
      </div>
    </div>
  )
}


