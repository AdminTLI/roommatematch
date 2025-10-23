# Development-Only Code

This directory contains code that should **NEVER** be imported in production builds.

## Purpose

- Mock data for local development
- Test fixtures
- Development utilities
- Debugging helpers

## Safety Mechanism

All files in this directory import `./assertDev.ts` which throws an error if the code runs in production.

## Usage

```typescript
// ❌ BAD: Never import in production code
import { mockUsers } from '@/src/devonly/mockData'

// ✅ GOOD: Only use in test files or dev-only components
// __tests__/myComponent.test.ts
import { mockUsers } from '@/src/devonly/mockData'
```

## ESLint Rule

An ESLint rule should be configured to prevent imports from `src/devonly/**` in production code paths.

## CI Check

The `scan:demo` script will flag any suspicious imports of devonly code.

