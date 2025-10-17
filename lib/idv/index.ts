// ID Verification module exports
export * from './adapter'
export * from './mock'

// Re-export the factory function as default
export { createIDVService as default } from './adapter'
