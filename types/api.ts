/**
 * types/api.ts
 * Shared request/response shapes for all API routes.
 */

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApiError {
  ok: false;
  error: string;
  code?: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  version: string;
  database: 'connected' | 'disconnected';
  uptime: number;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'review' | 'pending_approval' | 'done';
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  due_date?: string;
  time_estimate?: number;
  project_id?: string;
  list_id?: string;
  assigned_to?: string[];
  tags?: string[];
}

export interface ProfilePayload {
  name?: string;
  avatar_url?: string;
  banner_url?: string;
  bio?: string;
  links?: Record<string, string>;
  preferences?: { theme?: string; notifications?: boolean; emailUpdates?: boolean; };
}

export interface MessagePayload {
  conversation_id: string;
  content: string;
  type?: 'text' | 'system' | 'task_ref';
}
