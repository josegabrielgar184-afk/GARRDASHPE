// Cliente para la edge function admin-ops (custom claims, cuentas de prueba,
// monedas de prueba, auditoría y simulación de canjes).
// Todas las escrituras sensibles se ejecutan en el backend; el cliente solo
// envía el token de Firebase y muestra los resultados.

const ADMIN_OPS_URL = (import.meta as any).env?.VITE_ADMIN_OPS_URL
  || (typeof window !== 'undefined' && (window as any).__ADMIN_OPS_URL)
  || '';

// La URL base de Supabase Edge Functions se construye desde las variables de
// entorno del proyecto. Si no está definida, se usa la URL por defecto del
// proyecto Supabase provisionado.
function getBaseUrl(): string {
  if (ADMIN_OPS_URL) return ADMIN_OPS_URL;
  const env = (import.meta as any).env;
  const url = env?.VITE_SUPABASE_URL || env?.SUPABASE_URL || '';
  if (url) return `${url}/functions/v1/admin-ops`;
  // Fallback: las edge functions de Supabase se sirven en /functions/v1/.
  return '/api/admin-ops';
}

export interface AuditLogEntry {
  id: string;
  adminUid: string;
  targetUid: string;
  email: string | null;
  action: string;
  coinsDelta: number;
  metadata: Record<string, unknown> | null;
  timestamp: string | null;
}

export interface AdminOpsResult {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
}

async function callAdminOps(action: string, payload: Record<string, unknown> = {}): Promise<AdminOpsResult> {
  const { auth } = await import('@/lib/firebase');
  const user = auth.currentUser;
  if (!user) return { ok: false, error: 'No autenticado' };
  const token = await user.getIdToken();

  const res = await fetch(getBaseUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const json = await res.json().catch(() => ({ error: 'Respuesta inválida' }));
  if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
  return { ok: true, ...json };
}

export async function resolveEmail(email: string): Promise<AdminOpsResult & { uid?: string; email?: string }> {
  return callAdminOps('resolve_email', { email });
}

export async function authorizeTestAccount(email: string): Promise<AdminOpsResult & { uid?: string }> {
  return callAdminOps('authorize_test', { email });
}

export async function revokeTestAccount(uid: string): Promise<AdminOpsResult> {
  return callAdminOps('revoke_test', { uid });
}

export async function addTestCoins(uid: string, amount: number): Promise<AdminOpsResult & { newBalance?: number }> {
  return callAdminOps('add_test_coins', { uid, amount });
}

export async function simulateCanje(uid: string, rewardId: string, playerID: string, nickname: string): Promise<AdminOpsResult & { simCanjeId?: string }> {
  return callAdminOps('simulate_canje', { uid, rewardId, playerID, nickname });
}

export async function listAuditLog(limit = 50): Promise<AdminOpsResult & { entries?: AuditLogEntry[] }> {
  return callAdminOps('list_audit_log', { limit });
}

export async function checkClaims(): Promise<AdminOpsResult & { admin?: boolean; testAccount?: boolean; uid?: string }> {
  return callAdminOps('check_claims');
}

export async function setAdminClaim(uid: string): Promise<AdminOpsResult> {
  return callAdminOps('set_admin_claim', { uid });
}
