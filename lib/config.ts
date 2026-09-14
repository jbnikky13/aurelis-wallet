const optionalPublicEnv = {
  coingecko: 'NEXT_PUBLIC_COINGECKO_API_URL',
  supabaseUrl: 'NEXT_PUBLIC_SUPABASE_URL',
  supabaseAnonKey: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  walletConnectProjectId: 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
} as const;

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function validateRuntimeConfig(): { ok: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const supabaseUrl = read(optionalPublicEnv.supabaseUrl);
  const supabaseAnonKey = read(optionalPublicEnv.supabaseAnonKey);
  if ((supabaseUrl && !supabaseAnonKey) || (!supabaseUrl && supabaseAnonKey)) {
    warnings.push('Supabase configuration is incomplete; both URL and anon key must be set together.');
  }
  const walletConnectProjectId = read(optionalPublicEnv.walletConnectProjectId);
  if (!walletConnectProjectId) warnings.push('WalletConnect is not configured.');
  return { ok: warnings.every((warning) => !warning.startsWith('Supabase configuration')), warnings };
}

export function assertDeploymentConfig(): void {
  const result = validateRuntimeConfig();
  if (!result.ok) throw new Error(result.warnings.join(' '));
}

export function publicRuntimeConfig() {
  return {
    coingecko: read(optionalPublicEnv.coingecko),
    supabaseConfigured: Boolean(read(optionalPublicEnv.supabaseUrl) && read(optionalPublicEnv.supabaseAnonKey)),
    walletConnectConfigured: Boolean(read(optionalPublicEnv.walletConnectProjectId)),
  };
}
