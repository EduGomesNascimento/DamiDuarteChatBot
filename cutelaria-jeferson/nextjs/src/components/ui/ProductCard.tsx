'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatBRL, calcDiscount, installmentText } from '@/lib/utils';
import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-brand-gold text-xs">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={s <= Math.round(rating) ? 'text-brand-gold' : 'text-gray-600'}>★</span>
      ))}
    </div>
  );
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const discount = calcDiscount(product.price, product.originalPrice);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const badgeClass = {
    red: 'badge-red',
    gold: 'badge-gold',
    dark: 'badge-dark',
  }[product.badgeType ?? 'red'] ?? 'badge-red';

  return (
    <article
      className={cn(
        'card-dark flex flex-col overflow-hidden group relative',
        className
      )}
    >
      {/* Image */}
      <Link href={`/produto/${product.id}`} className="relative bg-white overflow-hidden aspect-square block">
        {/* Badge - Inside image container */}
        {product.badge && (
          <span className={cn('absolute top-3 left-3 z-20', badgeClass)}>
            {product.badge}
          </span>
        )}

        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        {/* Wishlist */}
        <button
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-red"
          title="Favoritar"
        >
          ♡
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-[10px] text-secondary uppercase tracking-widest mb-1">{product.categoryName}</div>
        <Link href={`/produto/${product.id}`} className="text-sm font-semibold text-primary hover:text-brand-red transition-colors line-clamp-2 mb-2 flex-1">
          {product.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={product.rating} />
          <span className="text-xs text-secondary">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="mb-3">
          {product.originalPrice && (
            <div className="price-original">{formatBRL(product.originalPrice)}</div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="price-current">{formatBRL(product.price)}</span>
            {discount > 0 && (
              <span className="text-xs font-bold text-brand-red bg-brand-red/10 px-1.5 py-0.5 rounded">
                -{discount}%
              </span>
            )}
          </div>
          <div className="price-installment">{installmentText(product.price, product.installments)}</div>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          className={cn(
            'w-full py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all duration-200',
            added
              ? 'bg-green-600 text-white'
              : 'bg-brand-red text-white hover:bg-brand-red-dark active:scale-95'
          )}
        >
          {added ? '✓ Adicionado!' : '🛒 Adicionar ao Carrinho'}
        </button>
      </div>

      {/* Quick view */}
      <Link
        href={`/produto/${product.id}`}
        className="text-center py-2.5 text-xs font-semibold uppercase tracking-wider text-secondary border-t border-border hover:text-primary hover:bg-bg-card-hover transition-all"
      >
        Ver Produto →
      </Link>
    </article>
  );
}
