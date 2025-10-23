/**
 * Development-Only Guard
 * 
 * Throws an error if this code is imported in a production build.
 * Use this at the top of any dev-only files to prevent accidental
 * inclusion in production bundles.
 * 
 * Usage:
 *   import './assertDev'
 *   // ... rest of your dev-only code
 */

if (process.env.NODE_ENV === 'production') {
  throw new Error(
    'FATAL: Development-only code imported in production build! ' +
    'This file should only be used in development/test environments. ' +
    'Check your imports and ensure src/devonly/** is not referenced in production code.'
  )
}

export {}

