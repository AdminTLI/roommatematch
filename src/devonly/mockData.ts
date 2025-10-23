/**
 * Development Mock Data
 * 
 * Mock data for local development and testing ONLY.
 * Never imported in production code.
 */

import './assertDev'

export const mockUsers = [
  {
    id: 'mock-user-1',
    email: 'mock1@test.local',
    name: 'Mock User 1'
  },
  {
    id: 'mock-user-2',
    email: 'mock2@test.local',
    name: 'Mock User 2'
  }
]

export const mockProfiles = [
  {
    user_id: 'mock-user-1',
    first_name: 'Mock',
    university_id: 'mock-uni-1',
    degree_level: 'bachelor',
    program: 'Test Program'
  }
]

export const mockMessages = [
  {
    id: 'mock-msg-1',
    sender_id: 'mock-user-1',
    content: 'This is a mock message for testing',
    created_at: new Date().toISOString()
  }
]

// Add more mock data as needed for development

