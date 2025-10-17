import { BaseIDVProvider, IDVConfig, IDVSessionData, IDVSession, IDVStatus, IDVResult, IDVCallbackResult } from './adapter'

// Mock IDV Provider for development and testing
export class MockIDVProvider extends BaseIDVProvider {
  name = 'mock'
  private sessions: Map<string, IDVSession> = new Map()
  private results: Map<string, IDVResult> = new Map()

  constructor() {
    super({
      provider: 'mock',
      apiKey: 'mock_api_key',
      apiSecret: 'mock_api_secret',
      webhookSecret: 'mock_webhook_secret',
      environment: 'sandbox'
    })
  }

  async startVerification(sessionData: IDVSessionData): Promise<IDVSession> {
    const sessionId = this.generateSessionId()
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const session = this.createSession(
      sessionId,
      `${process.env.NEXT_PUBLIC_APP_URL}/verify/mock?session=${sessionId}`
    )
    
    this.sessions.set(sessionId, session)
    
    // Simulate async processing
    setTimeout(() => {
      this.processMockVerification(sessionId, sessionData)
    }, 2000)
    
    return session
  }

  async checkStatus(sessionId: string): Promise<IDVStatus> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    const result = this.results.get(sessionId)
    
    return {
      sessionId,
      status: result ? 'completed' : session.status,
      result,
      expiresAt: session.expiresAt
    }
  }

  async handleCallback(payload: any): Promise<IDVCallbackResult> {
    const { sessionId, status, result } = payload
    
    if (status === 'completed' && result) {
      this.results.set(sessionId, result)
      const session = this.sessions.get(sessionId)
      if (session) {
        session.status = 'completed'
      }
    }
    
    return {
      sessionId,
      status: status || 'failed',
      result,
      error: status === 'failed' ? 'Verification failed' : undefined
    }
  }

  private async processMockVerification(sessionId: string, sessionData: IDVSessionData): Promise<void> {
    // Simulate verification process with random success/failure
    const isSuccess = Math.random() > 0.2 // 80% success rate
    
    if (isSuccess) {
      const result: IDVResult = {
        verified: true,
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
        documentType: 'national_id',
        extractedData: {
          firstName: sessionData.firstName,
          lastName: sessionData.lastName || 'MockLastName',
          documentNumber: `MOCK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          dateOfBirth: '1990-01-01',
          nationality: 'Dutch'
        },
        selfieMatch: true,
        livenessCheck: true
      }
      
      this.results.set(sessionId, result)
      
      const session = this.sessions.get(sessionId)
      if (session) {
        session.status = 'completed'
      }
    } else {
      const result: IDVResult = {
        verified: false,
        confidence: Math.floor(Math.random() * 40) + 20, // 20-60%
        error: 'Document not clear or selfie does not match'
      }
      
      this.results.set(sessionId, result)
      
      const session = this.sessions.get(sessionId)
      if (session) {
        session.status = 'failed'
      }
    }
  }

  // Mock method to simulate webhook callback
  async simulateWebhook(sessionId: string, success: boolean = true): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    const result: IDVResult = success ? {
      verified: true,
      confidence: 95,
      documentType: 'national_id',
      extractedData: {
        firstName: 'Mock',
        lastName: 'User',
        documentNumber: `MOCK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        dateOfBirth: '1990-01-01',
        nationality: 'Dutch'
      },
      selfieMatch: true,
      livenessCheck: true
    } : {
      verified: false,
      confidence: 30,
      error: 'Mock verification failed'
    }

    await this.handleCallback({
      sessionId,
      status: success ? 'completed' : 'failed',
      result
    })
  }

  // Helper method for testing
  getSession(sessionId: string): IDVSession | undefined {
    return this.sessions.get(sessionId)
  }

  getResult(sessionId: string): IDVResult | undefined {
    return this.results.get(sessionId)
  }
}
