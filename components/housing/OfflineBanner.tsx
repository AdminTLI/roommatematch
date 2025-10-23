// Offline Banner Component
// Shows when user is offline and provides offline functionality

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowBanner(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    // Check initial state
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="font-medium text-yellow-800">
                You're offline
              </div>
              <div className="text-sm text-yellow-700">
                Some features may not be available. We'll sync when you're back online.
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBanner(false)}
              className="text-yellow-800 hover:bg-yellow-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OnlineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-yellow-600" />
          <span className="text-yellow-600">Offline</span>
        </>
      )}
    </div>
  )
}
