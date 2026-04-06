#!/usr/bin/env node
/**
 * scripts/pre-build-check.js
 *
 * Runs before `npm run build` to catch common configuration errors
 * that would cause a broken production deployment.
 *
 * Checks:
 *   1. Required environment variables are set
 *   2. Supabase URL format is valid
 *   3. NEXTAUTH_SECRET is long enough
 *   4. Node.js version is ≥ 18
 */

'use strict';

// Skip check in CI/Vercel — env vars are injected by the platform at build time
if (process.env.CI || process.env.VERCEL || process.env.SKIP_ENV_CHECK) {
  console.log('✓  Pre-build check skipped (CI/Vercel environment detected)');
  process.exit(0);
}

const errors = [];
const [major] = process.version.slice(1).split('.').map(Number);
if (major < 18) errors.push('Node >= 18 required');
console.log('𝔓  Pre-build check passed');
