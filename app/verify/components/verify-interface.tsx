'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  Lock,
  Clock,
  UserCheck,
  FileText,
  Sparkles
} from 'lucide-react'

interface VerifyInterfaceProps {
  user: User
}

export function VerifyInterface({ user }: VerifyInterfaceProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState<'id' | 'selfie' | 'review' | 'processing' | 'completed'>('id')
  const [idFile, setIdFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const idInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIdFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setIdPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelfieUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelfieFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelfiePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      setError('Unable to access camera. Please upload a photo instead.')
    }
  }

  const captureSelfie = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video && canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
            setSelfieFile(file)
            setSelfiePreview(canvas.toDataURL())
            stopCamera()
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }

  const stopCamera = () => {
    const video = videoRef.current
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      video.srcObject = null
    }
  }

  const submitVerification = async () => {
    if (!idFile || !selfieFile) {
      setError('Please upload both ID document and selfie photo')
      return
    }

    setIsUploading(true)
    setStep('processing')

    try {
      // Upload files to Supabase Storage
      const idFileName = `${user.id}/id_${Date.now()}.jpg`
      const selfieFileName = `${user.id}/selfie_${Date.now()}.jpg`

      const { error: idError } = await supabase.storage
        .from('verification-documents')
        .upload(idFileName, idFile)

      if (idError) throw idError

      const { error: selfieError } = await supabase.storage
        .from('verification-documents')
        .upload(selfieFileName, selfieFile)

      if (selfieError) throw selfieError

      // Create verification record
      const { error: verificationError } = await supabase
        .from('verifications')
        .insert({
          user_id: user.id,
          id_document_path: idFileName,
          selfie_path: selfieFileName,
          status: 'pending'
        })

      if (verificationError) throw verificationError

      // Update profile status
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('user_id', user.id)

      if (profileError) throw profileError

      setStep('completed')

    } catch (error) {
      console.error('Verification submission failed:', error)
      setError('Failed to submit verification. Please try again.')
      setStep('review')
    } finally {
      setIsUploading(false)
    }
  }

  const getStepIcon = (stepName: string) => {
    const isActive = step === stepName
    const isCompleted = ['id', 'selfie', 'review', 'processing', 'completed'].indexOf(step) > 
                       ['id', 'selfie', 'review', 'processing', 'completed'].indexOf(stepName)
    
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else if (isActive) {
      return <div className="h-5 w-5 rounded-full bg-blue-600"></div>
    } else {
      return <div className="h-5 w-5 rounded-full bg-gray-300"></div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Verify Your Identity
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          To ensure a safe and secure platform, we need to verify your identity with a government-issued ID and a selfie photo.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { key: 'id', label: 'Upload ID', icon: FileText },
            { key: 'selfie', label: 'Take Selfie', icon: Camera },
            { key: 'review', label: 'Review', icon: UserCheck },
            { key: 'processing', label: 'Processing', icon: Clock },
            { key: 'completed', label: 'Complete', icon: CheckCircle }
          ].map((stepInfo, index) => (
            <div key={stepInfo.key} className="flex items-center">
              <div className="flex flex-col items-center">
                {getStepIcon(stepInfo.key)}
                <span className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                  {stepInfo.label}
                </span>
              </div>
              {index < 4 && (
                <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {step === 'id' && <FileText className="h-5 w-5" />}
            {step === 'selfie' && <Camera className="h-5 w-5" />}
            {step === 'review' && <UserCheck className="h-5 w-5" />}
            {step === 'processing' && <Clock className="h-5 w-5" />}
            {step === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
            
            {step === 'id' && 'Upload Government ID'}
            {step === 'selfie' && 'Take Selfie Photo'}
            {step === 'review' && 'Review & Submit'}
            {step === 'processing' && 'Processing Verification'}
            {step === 'completed' && 'Verification Submitted'}
          </CardTitle>
          <CardDescription>
            {step === 'id' && 'Upload a clear photo of your government-issued ID (passport, driver\'s license, or national ID)'}
            {step === 'selfie' && 'Take a clear selfie photo showing your face'}
            {step === 'review' && 'Review your uploaded documents before submitting'}
            {step === 'processing' && 'Your verification is being processed. This may take a few minutes.'}
            {step === 'completed' && 'Your verification has been submitted and is under review.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ID Upload Step */}
          {step === 'id' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {idPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={idPreview} 
                      alt="ID Preview" 
                      className="max-w-full h-64 object-contain mx-auto rounded-lg"
                    />
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" onClick={() => idInputRef.current?.click()}>
                        Change Photo
                      </Button>
                      <Button onClick={() => setStep('selfie')}>
                        Continue
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Upload your ID document</p>
                      <p className="text-gray-500">Supported formats: JPG, PNG, PDF (max 10MB)</p>
                    </div>
                    <Button onClick={() => idInputRef.current?.click()}>
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
              
              <input
                ref={idInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleIdUpload}
                className="hidden"
              />
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  📋 ID Requirements
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Government-issued photo ID (passport, driver's license, national ID)</li>
                  <li>• Photo must be clear and readable</li>
                  <li>• All four corners visible</li>
                  <li>• No glare or reflections</li>
                </ul>
              </div>
            </div>
          )}

          {/* Selfie Step */}
          {step === 'selfie' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {selfiePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={selfiePreview} 
                      alt="Selfie Preview" 
                      className="max-w-full h-64 object-contain mx-auto rounded-lg"
                    />
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" onClick={() => setSelfiePreview(null)}>
                        Retake
                      </Button>
                      <Button onClick={() => setStep('review')}>
                        Continue
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-4 justify-center">
                      <Button onClick={startCamera} variant="outline">
                        <Camera className="h-4 w-4 mr-2" />
                        Use Camera
                      </Button>
                      <Button onClick={() => selfieInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                    </div>
                    
                    {/* Camera Interface */}
                    {videoRef.current?.srcObject && (
                      <div className="space-y-4">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="max-w-full h-64 object-cover mx-auto rounded-lg"
                        />
                        <Button onClick={captureSelfie}>
                          <Camera className="h-4 w-4 mr-2" />
                          Capture Photo
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelfieUpload}
                className="hidden"
              />
              
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
                  📸 Selfie Requirements
                </h4>
                <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                  <li>• Clear photo of your face</li>
                  <li>• Good lighting, no shadows</li>
                  <li>• Look directly at the camera</li>
                  <li>• No sunglasses or face coverings</li>
                </ul>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">ID Document</h4>
                  {idPreview && (
                    <img 
                      src={idPreview} 
                      alt="ID Preview" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Selfie Photo</h4>
                  {selfiePreview && (
                    <img 
                      src={selfiePreview} 
                      alt="Selfie Preview" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  )}
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
                  ⚠️ Important Notice
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Your documents will be securely processed and stored. Verification typically takes 1-2 business days. 
                  You'll receive an email notification once your verification is complete.
                </p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setStep('selfie')}>
                  Back
                </Button>
                <Button onClick={submitVerification} disabled={isUploading}>
                  {isUploading ? 'Submitting...' : 'Submit Verification'}
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <div>
                <h3 className="text-lg font-medium">Processing Your Verification</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Please wait while we process your documents...
                </p>
              </div>
            </div>
          )}

          {/* Completed Step */}
          {step === 'completed' && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-green-900 dark:text-green-200 mb-2">
                  Verification Submitted Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your verification documents have been submitted and are under review. 
                  You'll receive an email notification once the verification is complete.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>• Our team will review your documents within 1-2 business days</li>
                  <li>• You'll receive an email notification of the result</li>
                  <li>• Once verified, you'll have full access to the platform</li>
                </ul>
              </div>
              
              <Button onClick={() => router.push('/matches')} className="w-full">
                Continue to Matches
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-1">
                Your Privacy & Security
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                All documents are encrypted and stored securely. We only use your information for verification 
                purposes and never share it with third parties. Our verification process complies with GDPR 
                and Dutch privacy regulations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
