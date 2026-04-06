/**
 * lib/apiHelpers.ts
 * Utilities used by every API route handler.
 */

import { NextResponse } from 'next/server';
import type { ApiSuccess, ApiError } from '@/types/api';

export function ok<T>(data: T, meta?: ApiSuccess<T>['meta'], status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ ok: true, data, ...(meta ? { meta } : {}) }, { status });
}

export function err(message: string, status = 400, code?: string, details?: unknown): NextResponse<ApiError> {
  return NextResponse.json({ ok: false, error: message, ...(code ? { code } : {}), ...(details ? { details } : {}) }, { status });
}

export const notFound   = (msg = 'Not found')           => err(msg, 404, 'NOT_FOUND');
export const badRequest = (msg = 'Bad request')         => err(msg, 400, 'BAD_REQUEST');
export const serverErr  = (msg = 'Internal server error') => err(msg, 500, 'INTERNAL_ERROR');
export const forbidden  = (msg = 'Forbidden')           => err(msg, 403, 'FORBIDDEN');

export async function parseBody<T>(req: Request): Promise<T | null> {
  try { return (await req.json()) as T; } catch { return null; }
}

export function getParam(url: string, key: string): string | null {
  return new URL(url).searchParams.get(key);
}

export function getIntParam(url: string, key: string, fallback: number): number {
  const val = getParam(url, key);
  const n = val ? parseInt(val, 10) : NaN;
  return isNaN(n) ? fallback : n;
}

export function handleOptions(): NextResponse {
  return new NextResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
}
