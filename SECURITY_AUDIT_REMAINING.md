# Remaining Security Vulnerabilities After Audit Fix

## Summary
After running `npm audit fix`, 19 vulnerabilities remain. Most are in development/build dependencies or require breaking changes to fix.

---

## Vulnerabilities Requiring Manual Review

### 1. xlsx (High Severity) - No Fix Available
**Package:** `xlsx@^0.18.5`  
**Issues:**
- Prototype Pollution in sheetJS (GHSA-4r6h-8v6p-xvw6)
- Regular Expression Denial of Service (ReDoS) (GHSA-5pgg-2g8v-p4x9)

**Usage:** Only used in scripts for importing program data (`scripts/import_programs.ts`, `scripts/sync-skdb-programmes.ts`)

**Risk Assessment:** LOW
- Not used in production runtime
- Only executed by admins during data import
- Input is controlled (SKDB data files)

**Recommendation:** 
- Monitor for updates to xlsx package
- Consider alternative libraries if available
- Ensure imported data files are from trusted sources only

---

### 2. esbuild (Moderate Severity) - Breaking Change Required
**Package:** `esbuild <=0.24.2` (via Vercel dependencies)  
**Issue:** Enables any website to send requests to development server (GHSA-67mh-4wv8-2f99)

**Risk Assessment:** LOW
- Only affects development server
- Not a production concern
- Fix requires `npm audit fix --force` which would install `vercel@25.2.0` (breaking change)

**Recommendation:**
- Acceptable risk for development-only vulnerability
- Monitor Vercel updates for fix
- Consider updating when Vercel releases stable version with fix

---

### 3. path-to-regexp (High Severity) - Breaking Change Required
**Package:** `path-to-regexp 4.0.0 - 6.2.2` (via @vercel/node)  
**Issue:** Outputs backtracking regular expressions (GHSA-9wv6-86v2-598j)

**Risk Assessment:** LOW-MEDIUM
- Used by Vercel's routing
- Fix requires breaking changes
- Could potentially cause DoS if route patterns are complex

**Recommendation:**
- Monitor for Vercel updates
- Review route patterns for complexity
- Consider updating when stable fix available

---

### 4. undici (Moderate Severity) - Breaking Change Required
**Package:** `undici <=5.28.5` (via @vercel/node)  
**Issues:**
- Use of Insufficiently Random Values (GHSA-c76h-2ccp-4975)
- Denial of Service attack via bad certificate data (GHSA-cxrh-j4jr-qwg3)

**Risk Assessment:** LOW
- Used by Vercel's HTTP client
- Fix requires breaking changes
- Moderate severity

**Recommendation:**
- Monitor for Vercel updates
- Update when stable fix available

---

### 5. glob (High Severity) - Next.js Dependency
**Package:** `glob 10.2.0 - 10.4.5` (via @next/eslint-plugin-next)  
**Issue:** Command injection via -c/--cmd (GHSA-5j98-mcp5-4vw2)

**Risk Assessment:** LOW
- Only affects CLI usage
- Used by Next.js ESLint plugin
- Not used in production runtime

**Recommendation:**
- Monitor Next.js updates
- Update when Next.js updates dependency

---

## Action Items

1. **Immediate:** None - all critical runtime vulnerabilities have been addressed
2. **Short-term:** Monitor package updates for xlsx, Vercel dependencies
3. **Long-term:** Consider alternatives to xlsx if vulnerabilities persist
4. **Ongoing:** Run `npm audit` regularly and update dependencies as fixes become available

---

## Notes

- All vulnerabilities in Vercel/Next.js dependencies require waiting for upstream fixes
- xlsx is only used in admin scripts, not production runtime
- Breaking changes from `npm audit fix --force` are not recommended without thorough testing
- Current security posture is strong - remaining issues are in dev dependencies or require breaking changes


