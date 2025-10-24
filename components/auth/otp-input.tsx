'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  onInput?: (otp: string) => void
  disabled?: boolean
  error?: boolean
  className?: string
}

export function OTPInput({ 
  length = 6, 
  onComplete, 
  onInput,
  disabled = false,
  error = false,
  className 
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''))
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) return
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Call onInput callback
    onInput?.(newOtp.join(''))

    // Move to next input if value entered
    if (value && index < length - 1) {
      setActiveIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }

    // Check if OTP is complete
    if (newOtp.every(digit => digit !== '')) {
      onComplete(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onInput?.(newOtp.join(''))
      } else if (index > 0) {
        // Move to previous input
        setActiveIndex(index - 1)
        inputRefs.current[index - 1]?.focus()
      }
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      setActiveIndex(index - 1)
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveIndex(index + 1)
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData.length > 0) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length && i < length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      onInput?.(newOtp.join(''))
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(pastedData.length, length - 1)
      setActiveIndex(nextIndex)
      inputRefs.current[nextIndex]?.focus()
      
      // Check if complete
      if (newOtp.every(digit => digit !== '')) {
        onComplete(newOtp.join(''))
      }
    }
  }

  const handleFocus = (index: number) => {
    setActiveIndex(index)
  }

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus()
    }
  }, [disabled])

  return (
    <div className={cn("flex gap-3 justify-center", className)}>
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={otp[index]}
          onChange={(e) => handleInputChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-xl font-semibold",
            "border-2 transition-colors",
            activeIndex === index && !disabled && "border-blue-500 ring-2 ring-blue-200",
            error && "border-red-500 bg-red-50",
            disabled && "bg-gray-100 cursor-not-allowed"
          )}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
}
