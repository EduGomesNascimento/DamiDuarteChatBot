'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ui/ProductCard';
import { getProductById, getRelatedProducts, formatBRL, calcDiscount } from '@/data/products';
import { cn } from '@/lib/utils';
import { installmentText } from '@/lib/utils';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(Number(id));
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-black text-primary mb-4">Produto não encontrado</h1>
          <Link href="/categoria/todos" className="btn-primary">Ver Catálogo →</Link>
        </div>
      </div>
    );
  }

  const discount = calcDiscount(product.price, product.originalPrice);
  const related = getRelatedProducts(product.id, 4);

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen pt-32 pb-16">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-xs text-secondary mb-6 flex gap-2">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href={`/categoria/${product.category}`} className="hover:text-primary">{product.categoryName}</Link>
          <span>/</span>
          <span className="text-primary">{product.shortName}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square bg-white rounded-lg overflow-visible mb-4">
              <div className="relative w-full h-full">
                <Image
                  src={product.images[activeImg] || product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width:1024px) 100vw, 50vw"
                  className="object-contain p-6"
                  priority
                />
              </div>
              {product.badge && (
                <span className={cn('absolute -top-2 -left-2 z-20', product.badgeType === 'gold' ? 'badge-gold' : product.badgeType === 'dark' ? 'badge-dark' : 'badge-red')}>
                  {product.badge}
                </span>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      'w-20 h-20 bg-white rounded border-2 overflow-hidden relative',
                      i === activeImg ? 'border-brand-red' : 'border-border hover:border-gray-500'
                    )}
                  >
                    <Image src={img} alt="" fill className="object-contain p-1" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="text-xs text-secondary uppercase tracking-widest mb-2">{product.categoryName} — SKU: {product.sku}</div>
            <h1 className="font-display text-3xl font-black text-primary mb-3">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5 text-brand-gold">
                {[1,2,3,4,5].map(s => <span key={s} className={s <= Math.round(product.rating) ? 'text-brand-gold' : 'text-tertiary'}>★</span>)}
              </div>
              <span className="text-sm text-secondary">{product.rating} ({product.reviews} avaliações)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {product.originalPrice && (
                <div className="price-original text-base">{formatBRL(product.originalPrice)}</div>
              )}
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-black text-brand-red">{formatBRL(product.price)}</span>
                {discount > 0 && (
                  <span className="text-sm font-bold text-white bg-brand-red px-2 py-1 rounded">-{discount}%</span>
                )}
              </div>
              <div className="text-sm text-secondary mt-1">{installmentText(product.price, product.installments)}</div>
              <div className="text-xs text-brand-gold mt-1">⚡ PIX com aprovação imediata</div>
            </div>

            {/* Description */}
            <p className="text-secondary text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-primary mb-2">Destaques:</h3>
              <ul className="space-y-1.5">
                {product.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-secondary">
                    <span className="text-brand-gold">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Specs */}
            {Object.keys(product.specs).length > 0 && (
              <div className="mb-6 border border-border rounded-lg overflow-hidden">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="flex border-b border-border last:border-b-0">
                    <div className="w-1/3 px-4 py-2 bg-bg-card text-xs text-secondary font-semibold">{k}</div>
                    <div className="w-2/3 px-4 py-2 text-xs text-primary">{v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock */}
            <div className="text-xs text-secondary mb-4">
              {product.stock > 0 ? (
                <span className="text-brand-gold">✓ Em estoque ({product.stock} unidades)</span>
              ) : (
                <span className="text-brand-red">✕ Fora de estoque</span>
              )}
            </div>

            {/* Qty + Add */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-border rounded">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 text-primary hover:bg-bg-card transition-colors">−</button>
                <span className="px-4 py-2 text-primary font-bold min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 text-primary hover:bg-bg-card transition-colors">+</button>
              </div>
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className={cn(
                  'flex-1 py-3 rounded font-bold uppercase tracking-wider transition-all text-sm',
                  added ? 'bg-brand-gold text-black' : 'bg-brand-red text-white hover:bg-brand-red-dark active:scale-[0.98]',
                  product.stock === 0 && 'opacity-50 cursor-not-allowed'
                )}
              >
                {added ? '✓ Adicionado!' : '🛒 Adicionar ao Carrinho'}
              </button>
            </div>

            <Link href="/checkout" className="btn-outline w-full justify-center text-center block py-3">
              Comprar Agora →
            </Link>

            {/* Trust */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-secondary">
              <span>🚚 Frete grátis acima de R$299</span>
              <span>🔒 Compra segura</span>
              <span>↩️ 30 dias para troca</span>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="section-title mb-6">Produtos <span className="text-gradient-gold">Relacionados</span></h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
