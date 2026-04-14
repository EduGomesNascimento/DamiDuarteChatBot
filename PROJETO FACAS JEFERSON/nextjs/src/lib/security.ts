/**
 * Server-side security utilities
 * Input validation using Zod + custom helpers
 */

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// ---- Brazilian validators ----
export function validateCPF(cpf: string): boolean {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
}

export const cpfSchema = z.string().refine(validateCPF, { message: 'CPF inválido' });
export const cepSchema = z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido');
export const phoneSchema = z.string().regex(/^[\d\s\(\)\-\+]{10,15}$/, 'Telefone inválido');

// ---- Zod schemas ----
export const checkoutSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  email: z.string().email('Email inválido').toLowerCase(),
  cpf: cpfSchema,
  phone: phoneSchema,
  cep: cepSchema,
  address: z.string().min(3).max(200).trim(),
  number: z.string().max(20).trim(),
  complement: z.string().max(100).optional().default(''),
  neighborhood: z.string().max(100).trim(),
  city: z.string().max(100).trim(),
  state: z.string().length(2).toUpperCase(),
  paymentMethod: z.enum(['pix', 'credit_card', 'boleto']),
});

export const registerSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa ter letra maiúscula')
    .regex(/[a-z]/, 'Precisa ter letra minúscula')
    .regex(/\d/, 'Precisa ter número'),
  cpf: cpfSchema,
  phone: phoneSchema.optional(),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

// ---- Rate limiting (in-memory for serverless) ----
const _rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = _rateMap.get(key);
  if (!entry || now > entry.resetAt) {
    _rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export function getRateLimitKey(req: NextRequest, suffix: string): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
  return `${ip}:${suffix}`;
}

// ---- Response helpers ----
export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

// ---- CSRF / Webhook signature ----
export async function verifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  );
  const sigData = Buffer.from(signature.replace('sha256=', ''), 'hex');
  const bodyData = encoder.encode(body);
  try {
    return await crypto.subtle.verify('HMAC', key, sigData, bodyData);
  } catch {
    return false;
  }
}

// ---- Sanitize string (basic) ----
export function sanitize(str: string): string {
  return str.replace(/[<>"'&]/g, c => ({
    '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;',
  }[c] || c));
}
