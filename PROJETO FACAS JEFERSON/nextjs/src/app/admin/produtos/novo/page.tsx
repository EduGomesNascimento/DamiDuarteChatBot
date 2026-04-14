'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Link from 'next/link';

const CATEGORIES = ['facas', 'kits', 'acessorios'];
const BADGE_TYPES = ['red', 'gold', 'dark'];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    short_name: '',
    slug: '',
    category: 'facas',
    price: 0,
    original_price: 0,
    cost_price: 0,
    sku: '',
    stock: 0,
    weight: 0,
    height: 0,
    width: 0,
    length: 0,
    badge: '',
    badge_type: 'red',
    featured: false,
    active: true,
  });

  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target as any;
    setForm(f => ({
      ...f,
      [name]: type === 'number' ? parseFloat(value) || 0 : type === 'checkbox' ? (e.target as any).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('products').insert({
        ...form,
        tags: [],
        images: [],
      });

      if (error) throw error;

      toast.success('Produto criado com sucesso!');
      router.push('/admin/produtos');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-bg-primary">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/produtos" className="text-gray-500 hover:text-white">← Voltar</Link>
          <h1 className="font-display text-3xl font-black text-white">Novo Produto</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-dark p-8 border border-border space-y-6">
          {/* Seção: Info Básica */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="form-label">Nome do Produto*</label>
                <input required name="name" value={form.name} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Slug (URL)*</label>
                <input required name="slug" value={form.slug} onChange={handleChange} className="form-input" placeholder="ex: faca-bowie" />
              </div>
              <div>
                <label className="form-label">SKU</label>
                <input name="sku" value={form.sku} onChange={handleChange} className="form-input" placeholder="CJ-001" />
              </div>
              <div className="col-span-2">
                <label className="form-label">Nome Curto</label>
                <input name="short_name" value={form.short_name} onChange={handleChange} className="form-input" />
              </div>
              <div className="col-span-2">
                <label className="form-label">Descrição</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-input resize-none h-20" />
              </div>
            </div>
          </div>

          {/* Seção: Preços */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Preços</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">Preço*</label>
                <input required name="price" type="number" step="0.01" value={form.price} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Preço Original (promocional)</label>
                <input name="original_price" type="number" step="0.01" value={form.original_price} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Custo</label>
                <input name="cost_price" type="number" step="0.01" value={form.cost_price} onChange={handleChange} className="form-input" />
              </div>
            </div>
          </div>

          {/* Seção: Estoque e Categoria */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Estoque e Categoria</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Estoque*</label>
                <input required name="stock" type="number" value={form.stock} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Categoria*</label>
                <select name="category" value={form.category} onChange={handleChange} className="form-input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Seção: Dimensões (Frete) */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Dimensões para Frete</h2>
            <p className="text-xs text-gray-500 mb-4">Necessário para cálculo correto de frete</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="form-label">Peso (kg)</label>
                <input name="weight" type="number" step="0.1" value={form.weight} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Altura (cm)</label>
                <input name="height" type="number" step="0.1" value={form.height} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Largura (cm)</label>
                <input name="width" type="number" step="0.1" value={form.width} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Comprimento (cm)</label>
                <input name="length" type="number" step="0.1" value={form.length} onChange={handleChange} className="form-input" />
              </div>
            </div>
          </div>

          {/* Seção: Badge e Status */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Exibição</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Badge (ex: Mais Vendido)</label>
                <input name="badge" value={form.badge} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Tipo de Badge</label>
                <select name="badge_type" value={form.badge_type} onChange={handleChange} className="form-input">
                  {BADGE_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-6 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">Destacado na home</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">Ativo</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center py-3 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Produto'}
            </button>
            <Link href="/admin/produtos" className="btn-outline flex-1 text-center py-3">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
