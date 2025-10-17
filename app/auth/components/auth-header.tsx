'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AuthHeader() {
  const router = useRouter()

  return (
    <header className="w-full py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/auth/sign-in')}
            >
              Sign In
            </Button>
            <Button 
              size="sm"
              onClick={() => router.push('/auth/sign-up')}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}