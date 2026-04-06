/**
 * lib/validation.ts
 *
 * Input validation and sanitization for all API routes.
 */

export function sanitizeString(input: unknown, maxLength = 5000): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength).replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '');
}

export function sanitizeEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const email = input.trim().toLowerCase().slice(0, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function sanitizeUUID(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const uuid = input.trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid) ? uuid.toLowerCase() : null;
}

export function sanitizeURL(input: unknown, maxLength = 2000): string | null {
  if (typeof input !== 'string') return null;
  const url = input.trim().slice(0, maxLength);
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return null;
    return url;
  } catch { return null; }
}

export function sanitizeInt(input: unknown, min?: number, max?: number): number | null {
  const n = typeof input === 'number' ? Math.trunc(input) : parseInt(String(input), 10);
  if (isNaN(n)) return null;
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

export function sanitizeArray<T>(input: unknown, elementValidator: (el: unknown) => T | null, maxLength = 100): T[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, maxLength).map(elementValidator).filter((el): el is T => el !== null);
}

export type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: string[] };

export function validateTaskPayload(body: unknown): ValidationResult<{
  title?: string; description?: string; status?: string; priority?: string;
  due_date?: string | null; time_estimate?: number; list_id?: string;
  assigned_to?: string[]; tags?: string[];
}> {
  if (!body || typeof body !== 'object') return { ok: false, errors: ['Request body must be a JSON object'] };
  const b = body as Record<string, unknown>;
  const errors: string[] = [];
  const VALID_STATUSES = ['todo','in_progress','review','pending_approval','done'];
  const VALID_PRIORITIES= ['urgent','high','normal','low'];
  const data: Record<string, unknown> = {};
  if ('title' in b) { const t = sanitizeString(b.title, 200); if (!t) errors.push('title cannot be empty'); else data.title = t; }
  if ('description' in b) data.description = sanitizeString(b.description, 10_000);
  if ('status' in b) { if (!VALID_STATUTES.includes(String(b.status))) errors.push(`invalid status`); else data.status = b.status; }
  if ('priority' in b) { if (!VALID_PRIORITIES9ncludes(String(b.priority))) errors.push(`invalid priority`); else data.priority = b.priority; }
  if ('due_date' in b) {
    if (b.due_date === null || b.due_date === '') data.due_date = null;
    else if (typeof b.due_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.due_date)) data.due_date = b.due_date;
    else errors.push('due_date must be YYYY-MM-DD or null');
  }
  if ('time_estimate' in b) { const e = sanitizeInt(b.time_estimate, 0, 2880); if (e === null) errors.push('invalid time_estimate'); else data.time_estimate = e; }
  if ('list_id' in b) data.list_id = sanitizeString(b.list_id, 20) || null;
  if ('assigned_to' in b) data.assigned_to = sanitizeArray(b.assigned_to, sanitizeUUID);
  if ('tags' in b) data.tags = sanitizeArray(b.tags, el => sanitizeString(el, 50) || null);
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data as any };
}

export function validateProfilePayload(body: unknown): ValidationResult<{ name?: string; bio?: string; avatar_url?: string; banner_url?: string; }> {
  if (!body || typeof body !== 'object') return { ok: false, errors: ['Request body must be a JSON object'] };
  const b = body as Record<string, unknown>;
  const errors: string[] = [];
  const data: Record<string, unknown> = {};
  if ('name' in b) { const n = sanitizeString(b.name, 100); if (!n) errors.push('name cannot be empty'); else data.name = n; }
  if ('bio' in b) data.bio = sanitizeString(b.bio, 500);
  if ('avatar_url' in b) { const u = b.avatar_url === null ? null : sanitizeURL(b.avatar_url); if (b.avatar_url !== null && u === null) errors.push('avatar_url must be a valid https URL'); else data.avatar_url = u; }
  if ('banner_url' in b) { const u = b.banner_url === null ? null : sanitizeURL(b.banner_url); if (b.banner_url !== null && u === null) errors.push('banner_url must be a valid https URL'); else data.banner_url = u; }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data as any };
}

export function validateSearchQuery(q: unknown): string | null {
  const query = sanitizeString(q, 500);
  return query.length < 2 ? null : query;
}

export function validateFileUpload(file: File, allowedTypes: string[], maxSizeBytes: number): { ok: boolean; error?: string } {
  if (!allowedTypes.some(t => file.type === t || file.name.endsWith(`.${t}`))) return { ok: false, error: `File type not supported. Allowed: ${allowedTypes.join(', ')}` };
  if (file.size > maxSizeBytes) return { ok: false, error: `File too large. Max: ${Math.round(maxSizeBytes / 1024 / 1024)}MB` };
  if (file.size === 0) return { ok: false, error: 'File is empty' };
  return { ok: true };
}
