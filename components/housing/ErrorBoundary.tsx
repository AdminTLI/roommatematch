// Error Boundary for Housing Components
// Catches JavaScript errors and displays fallback UI

'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class HousingErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Housing Error Boundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-6">
          We encountered an error while loading the housing listings. 
          This might be a temporary issue.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <div className="font-medium text-red-800 mb-2">Error Details:</div>
            <div className="text-sm text-red-700 font-mono">
              {error.message}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={resetError} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <a href="/housing">
              <Home className="h-4 w-4 mr-2" />
              Back to Housing
            </a>
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>
            If this problem persists, please{' '}
            <Button variant="link" className="p-0 h-auto text-primary">
              contact support
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Specialized error boundaries for different components
export function ListingsErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <HousingErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load listings
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error loading the housing listings.
          </p>
          <Button onClick={resetError} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}
    >
      {children}
    </HousingErrorBoundary>
  )
}

export function MapErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <HousingErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Map failed to load
            </h3>
            <p className="text-gray-600 mb-4">
              There was an error loading the map.
            </p>
            <Button onClick={resetError} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </HousingErrorBoundary>
  )
}
