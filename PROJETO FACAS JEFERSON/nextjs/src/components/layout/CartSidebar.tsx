'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatBRL, calcFreight, FRETE_GRATIS_MIN } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function CartSidebar() {
  const [open, setOpen] = useState(false);
  const { items, removeItem, updateQty, subtotal, savings } = useCart();

  const close = useCallback(() => setOpen(false), []);

  // Expose toggle for Header
  useEffect(() => {
    (window as any).__toggleCart = (v: boolean) => setOpen(v);
  }, []);

  // ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const freight = calcFreight(subtotal);
  const total = subtotal + freight;
  const progress = Math.min((subtotal / FRETE_GRATIS_MIN) * 100, 100);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        className={cn(
          'fixed inset-0 bg-black/70 z-40 transition-all duration-300',
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 bottom-0 w-full max-w-sm bg-bg-secondary border-l border-border',
          'z-50 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-label="Carrinho de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-bold text-lg">🛒 Meu Carrinho</h2>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center text-gray-500 hover:bg-brand-red hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Frete progress */}
        {subtotal < FRETE_GRATIS_MIN && items.length > 0 && (
          <div className="px-5 py-3 bg-bg-card border-b border-border">
            <p className="text-xs text-gray-400 mb-1.5">
              Faltam <strong className="text-white">{formatBRL(FRETE_GRATIS_MIN - subtotal)}</strong> para frete grátis!
            </p>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-red rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {subtotal >= FRETE_GRATIS_MIN && items.length > 0 && (
          <div className="px-5 py-2 bg-green-900/30 border-b border-border text-xs text-green-400 font-semibold text-center">
            🎉 Parabéns! Você ganhou frete grátis!
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
              <span className="text-5xl">🛒</span>
              <p className="text-sm">Seu carrinho está vazio</p>
              <button onClick={close} className="btn-primary text-sm mt-2">
                Explorar Produtos →
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="py-4 flex gap-3">
                  <div className="w-16 h-16 bg-white rounded flex-shrink-0 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="object-contain w-full h-full p-1"
                      onError={() => {}}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produto/${product.id}`}
                      onClick={close}
                      className="text-sm font-semibold text-white hover:text-brand-red transition-colors line-clamp-2"
                    >
                      {product.shortName}
                    </Link>
                    <div className="text-brand-red font-bold mt-1">{formatBRL(product.price)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(product.id, qty - 1)}
                        className="w-6 h-6 rounded border border-border text-white flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-all text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold min-w-[20px] text-center">{qty}</span>
                      <button
                        onClick={() => updateQty(product.id, qty + 1)}
                        className="w-6 h-6 rounded border border-border text-white flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-all text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-gray-600 hover:text-brand-red transition-colors text-sm self-start mt-1"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="space-y-1.5 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal</span><span className="text-white">{formatBRL(subtotal)}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Economia</span><span>-{formatBRL(savings)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Frete</span>
                <span className={freight === 0 ? 'text-green-400 font-semibold' : 'text-white'}>
                  {freight === 0 ? 'GRÁTIS 🎉' : formatBRL(freight)}
                </span>
              </div>
              <div className="flex justify-between font-black text-white text-base pt-2 border-t border-border">
                <span>Total</span><span className="text-brand-red">{formatBRL(total)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="btn-primary w-full justify-center text-center"
            >
              🔒 Finalizar Compra
            </Link>
            <button onClick={close} className="w-full text-center text-sm text-gray-500 hover:text-brand-red transition-colors">
              ← Continuar Comprando
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
