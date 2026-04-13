'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatBRL, calcFreight, FRETE_GRATIS_MIN } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, savings } = useCart();
  const freight = calcFreight(subtotal);
  const total = subtotal + freight;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="font-display text-3xl font-black text-white mb-3">Seu carrinho está vazio</h1>
          <p className="text-gray-500 mb-6">Explore nossos produtos e encontre sua próxima faca artesanal.</p>
          <Link href="/categoria/todos" className="btn-primary">Ver Catálogo →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="font-display text-3xl font-black text-white mb-8">🛒 Meu Carrinho</h1>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Items */}
          <div className="lg:col-span-8 space-y-4">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="card-dark p-4 flex gap-4">
                <Link href={`/produto/${product.id}`} className="w-24 h-24 bg-white rounded flex-shrink-0 relative">
                  <Image src={product.image} alt={product.name} fill className="object-contain p-2" sizes="96px" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/produto/${product.id}`} className="text-sm font-semibold text-white hover:text-brand-red transition-colors line-clamp-2">
                    {product.name}
                  </Link>
                  <div className="text-xs text-gray-500 mt-1">{product.categoryName} — SKU: {product.sku}</div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-border rounded">
                      <button onClick={() => updateQty(product.id, qty - 1)} className="px-2.5 py-1 text-white hover:bg-bg-card text-sm">−</button>
                      <span className="px-3 py-1 text-white font-bold text-sm">{qty}</span>
                      <button onClick={() => updateQty(product.id, qty + 1)} className="px-2.5 py-1 text-white hover:bg-bg-card text-sm">+</button>
                    </div>
                    <button onClick={() => removeItem(product.id)} className="text-xs text-gray-500 hover:text-brand-red transition-colors">Remover</button>
                  </div>
                </div>
                <div className="text-right">
                  {product.originalPrice && (
                    <div className="price-original text-xs">{formatBRL(product.originalPrice * qty)}</div>
                  )}
                  <div className="font-bold text-brand-red">{formatBRL(product.price * qty)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="card-dark p-6 sticky top-28">
              <h2 className="text-lg font-bold text-white mb-4 pb-3 border-b border-border">Resumo</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} itens)</span>
                  <span className="text-white">{formatBRL(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Economia</span>
                    <span>-{formatBRL(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Frete</span>
                  <span className={freight === 0 ? 'text-green-400 font-semibold' : 'text-white'}>
                    {freight === 0 ? 'GRÁTIS 🎉' : formatBRL(freight)}
                  </span>
                </div>
                {subtotal < FRETE_GRATIS_MIN && (
                  <p className="text-xs text-gray-500 pt-1">
                    Faltam <span className="text-white font-bold">{formatBRL(FRETE_GRATIS_MIN - subtotal)}</span> para frete grátis
                  </p>
                )}
                <div className="flex justify-between font-black text-lg text-white pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-brand-red">{formatBRL(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full justify-center text-center mt-6 py-3">
                🔒 Finalizar Compra
              </Link>

              <Link href="/categoria/todos" className="block text-center text-sm text-gray-500 hover:text-brand-red transition-colors mt-3">
                ← Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
