import { afterEach, describe, expect, it, vi } from 'vitest';
import { userFacingError } from '../lib/errors';
import { validateRuntimeConfig } from '../lib/config';

describe('Build 12 hardening', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('maps RPC failures to a safe user-facing message', () => {
    expect(userFacingError(new Error('RPC timeout after 10000ms'))).toContain('timed out');
    expect(userFacingError(new Error('HTTP 429 rate limit'))).toContain('rate-limiting');
  });

  it('does not expose unknown internal errors', () => {
    expect(userFacingError(new Error(''))).toBe('Something went wrong. Please try again.');
  });

  it('detects partial Supabase configuration', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    expect(validateRuntimeConfig().ok).toBe(false);
  });

  it('accepts absent optional integrations', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', '');
    expect(validateRuntimeConfig().ok).toBe(true);
  });
});

describe('contract address validation', () => {
  it('accepts a valid public contract address', async () => {
    const { assertContractAddress } = await import('../lib/security/validation');
    expect(assertContractAddress('0x0000000000000000000000000000000000000001')).toBe('0x0000000000000000000000000000000000000001');
  });

  it('rejects private-key-shaped values', async () => {
    const { assertContractAddress } = await import('../lib/security/validation');
    expect(() => assertContractAddress('0x' + 'a'.repeat(64))).toThrow('Invalid contract address.');
  });
});
