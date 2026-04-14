'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import Link from 'next/link';
import { getProductsByCategory, CATEGORIES } from '@/data/products';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name' | 'rating';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.toLowerCase() || '';
  const [sort, setSort] = useState<SortOption>('featured');

  const category = CATEGORIES.find(c => c.id === slug || c.slug === slug);
  const allProducts = getProductsByCategory(slug);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (query) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.tags.some(t => t.includes(query))
      );
    }
    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }
    return list;
  }, [allProducts, query, sort]);

  const title = category?.name || (slug === 'todos' ? 'Todos os Produtos' : 'Produtos');

  return (
    <div className="min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-6 flex gap-2">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-white">{title}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-black text-white">{title}</h1>
            {category?.description && <p className="text-gray-500 text-sm mt-1">{category.description}</p>}
            <p className="text-xs text-gray-600 mt-2">{filtered.length} produto{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Categories filter */}
            <div className="flex gap-2 flex-wrap">
              {[{ id: 'todos', name: 'Todos' }, ...CATEGORIES.filter(c => c.id !== 'promocoes')].map(c => (
                <Link
                  key={c.id}
                  href={`/categoria/${c.id}`}
                  className={`text-xs px-3 py-1.5 rounded border transition-all ${
                    slug === c.id ? 'border-brand-red bg-brand-red text-white' : 'border-border text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="form-input text-xs py-1.5 w-auto"
            >
              <option value="featured">Destaques</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="rating">Melhor Avaliação</option>
              <option value="name">A-Z</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-white mb-2">Nenhum produto encontrado</h2>
            <p className="text-gray-500 text-sm mb-4">Tente outra categoria ou termo de busca.</p>
            <Link href="/categoria/todos" className="btn-primary">Ver Todos →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
