/**
 * Load Testing Script
 * Tests critical endpoints under load to verify performance and stability
 * 
 * Usage:
 *   npm install -g k6
 *   k6 run tests/performance/load-test.ts
 * 
 * Or use a simpler approach with curl/ab for basic testing
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Ramp up to 10 users
    { duration: '3m', target: 10 },   // Stay at 10 users
    { duration: '1m', target: 20 },    // Ramp up to 20 users
    { duration: '3m', target: 20 },   // Stay at 20 users
    { duration: '1m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
    errors: ['rate<0.01'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

export default function () {
  // Test homepage
  const homeResponse = http.get(`${BASE_URL}/`)
  check(homeResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads in < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1)

  sleep(1)

  // Test API endpoints (public)
  const apiResponse = http.get(`${BASE_URL}/api/public/health`, {
    headers: { 'Content-Type': 'application/json' },
  })
  check(apiResponse, {
    'API status is 200': (r) => r.status === 200,
    'API responds in < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1)

  sleep(1)

  // Test matches endpoint (would require auth in real scenario)
  // This is a placeholder - in real test, you'd authenticate first
  const matchesResponse = http.get(`${BASE_URL}/matches`, {
    headers: { 'Content-Type': 'text/html' },
  })
  check(matchesResponse, {
    'matches page loads': (r) => r.status === 200 || r.status === 401 || r.status === 403,
  }) || errorRate.add(1)

  sleep(2)
}

export function handleSummary(data: any) {
  return {
    'stdout': JSON.stringify(data, null, 2),
    'summary.json': JSON.stringify(data, null, 2),
  }
}

