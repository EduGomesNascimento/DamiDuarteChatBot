'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatBRL } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  original_price?: number;
  stock: number;
  category: string;
  active: boolean;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const supabase = createClient();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    setProducts(data || []);
    setLoading(false);
  }

  async function deleteProduct(id: number) {
    if (!confirm('Tem certeza?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao deletar');
      return;
    }

    toast.success('Produto deletado');
    setProducts(p => p.filter(x => x.id !== id));
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.sku?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-bg-primary">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-black text-primary">Produtos</h1>
            <p className="text-secondary text-sm mt-1">{filtered.length} produtos cadastrados</p>
          </div>
          <Link href="/admin/produtos/novo" className="btn-primary">+ Novo Produto</Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nome ou SKU..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="form-input w-full max-w-md"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-secondary">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-secondary mb-4">Nenhum produto encontrado</p>
            <Link href="/admin/produtos/novo" className="btn-primary">Criar Produto</Link>
          </div>
        ) : (
          <div className="card-dark overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 text-secondary">Nome</th>
                  <th className="text-left p-4 text-secondary">SKU</th>
                  <th className="text-right p-4 text-secondary">Preço</th>
                  <th className="text-center p-4 text-secondary">Estoque</th>
                  <th className="text-center p-4 text-secondary">Categoria</th>
                  <th className="text-center p-4 text-secondary">Dimensões</th>
                  <th className="text-center p-4 text-secondary">Status</th>
                  <th className="text-center p-4 text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-bg-card transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-primary">{p.name}</div>
                    </td>
                    <td className="p-4 text-secondary font-mono text-xs">{p.sku || '-'}</td>
                    <td className="p-4 text-right">
                      <div className="font-bold text-brand-red">{formatBRL(p.price)}</div>
                      {p.original_price && (
                        <div className="text-xs text-secondary line-through">{formatBRL(p.original_price)}</div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={p.stock > 0 ? 'text-brand-gold' : 'text-brand-red'}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="p-4 text-center text-xs text-primary">{p.category}</td>
                    <td className="p-4 text-center text-xs text-secondary">
                      {p.weight ? `${p.weight}kg • ${p.height}×${p.width}×${p.length}cm` : '—'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={p.active ? 'text-brand-gold text-xs font-bold' : 'text-brand-red text-xs'}>
                        {p.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <Link href={`/admin/produtos/${p.id}`} className="text-brand-red hover:underline text-xs">
                        Editar
                      </Link>
                      <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:underline text-xs">
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: products.length },
            { label: 'Ativos', value: products.filter(p => p.active).length },
            { label: 'Sem Estoque', value: products.filter(p => p.stock === 0).length },
            { label: 'Com Promoção', value: products.filter(p => p.original_price && p.original_price > p.price).length },
          ].map(s => (
            <div key={s.label} className="card-dark p-4 border border-border text-center">
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-secondary mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
