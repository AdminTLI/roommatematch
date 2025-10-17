// ID Verification Adapter Interface
// This provides a vendor-agnostic interface for ID verification services

export interface IDVProvider {
  name: string
  startVerification(sessionData: IDVSessionData): Promise<IDVSession>
  checkStatus(sessionId: string): Promise<IDVStatus>
  handleCallback(payload: any): Promise<IDVCallbackResult>
}

export interface IDVSessionData {
  userId: string
  email: string
  firstName: string
  lastName?: string
  metadata?: Record<string, any>
}

export interface IDVSession {
  sessionId: string
  verificationUrl?: string
  expiresAt: Date
  status: 'pending' | 'completed' | 'failed' | 'expired'
}

export interface IDVStatus {
  sessionId: string
  status: 'pending' | 'completed' | 'failed' | 'expired'
  result?: IDVResult
  error?: string
  expiresAt: Date
}

export interface IDVResult {
  verified: boolean
  confidence: number // 0-100
  documentType?: string
  extractedData?: {
    firstName?: string
    lastName?: string
    documentNumber?: string
    dateOfBirth?: string
    nationality?: string
  }
  selfieMatch?: boolean
  livenessCheck?: boolean
}

export interface IDVCallbackResult {
  sessionId: string
  status: 'completed' | 'failed'
  result?: IDVResult
  error?: string
}

export interface IDVConfig {
  provider: 'mock' | 'veriff' | 'idenfy'
  apiKey: string
  apiSecret: string
  webhookSecret: string
  environment: 'sandbox' | 'production'
}

// Abstract base class for IDV providers
export abstract class BaseIDVProvider implements IDVProvider {
  abstract name: string
  protected config: IDVConfig

  constructor(config: IDVConfig) {
    this.config = config
  }

  abstract startVerification(sessionData: IDVSessionData): Promise<IDVSession>
  abstract checkStatus(sessionId: string): Promise<IDVStatus>
  abstract handleCallback(payload: any): Promise<IDVCallbackResult>

  protected validateConfig(): void {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('IDV provider configuration is incomplete')
    }
  }

  protected generateSessionId(): string {
    return `idv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  protected createSession(sessionId: string, verificationUrl?: string): IDVSession {
    return {
      sessionId,
      verificationUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: 'pending'
    }
  }
}

// IDV service factory
export class IDVService {
  private provider: IDVProvider

  constructor(provider: IDVProvider) {
    this.provider = provider
  }

  async startVerification(sessionData: IDVSessionData): Promise<IDVSession> {
    return this.provider.startVerification(sessionData)
  }

  async checkStatus(sessionId: string): Promise<IDVStatus> {
    return this.provider.checkStatus(sessionId)
  }

  async handleCallback(payload: any): Promise<IDVCallbackResult> {
    return this.provider.handleCallback(payload)
  }

  getProviderName(): string {
    return this.provider.name
  }
}

// Factory function to create IDV service
export function createIDVService(): IDVService {
  const provider = process.env.IDV_PROVIDER || 'mock'
  
  switch (provider) {
    case 'mock':
      // Import mock provider dynamically to avoid circular dependencies
      const { MockIDVProvider } = require('./mock')
      return new IDVService(new MockIDVProvider())
    
    case 'veriff':
      // TODO: Implement Veriff provider
      throw new Error('Veriff provider not yet implemented')
    
    case 'idenfy':
      // TODO: Implement iDenfy provider
      throw new Error('iDenfy provider not yet implemented')
    
    default:
      throw new Error(`Unknown IDV provider: ${provider}`)
  }
}
