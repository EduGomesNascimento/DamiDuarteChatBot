import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function calcDiscount(price: number, original?: number): number {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

export function installmentText(price: number, n: number): string {
  return `${n}x de ${formatBRL(price / n)} sem juros`;
}

export const FRETE_GRATIS_MIN = 299.90;
export const FRETE_BASE = 19.90;

export function calcFreight(subtotal: number): number {
  return subtotal >= FRETE_GRATIS_MIN ? 0 : FRETE_BASE;
}

export function generateOrderId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
