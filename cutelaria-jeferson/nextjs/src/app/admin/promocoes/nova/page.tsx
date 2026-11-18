'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NewPromotionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'global' as 'global' | 'product' | 'category' | 'tag',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    code: '',
    min_amount: 0,
    usage_limit: 0,
    product_id: null as number | null,
    category: '',
    tag: '',
    description: '',
  });

  const supabase = createClient();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target as any;
    setForm(f => ({
      ...f,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('promotions').insert({
        ...form,
        active: true,
        apply_automatically: true,
        product_id: form.type === 'product' ? form.product_id : null,
        category: form.type === 'category' ? form.category : null,
        tag: form.type === 'tag' ? form.tag : null,
      });

      if (error) throw error;

      toast.success('Promoção criada!');
      router.push('/admin/promocoes');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-bg-primary">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/promocoes" className="text-gray-500 hover:text-white">← Voltar</Link>
          <h1 className="font-display text-3xl font-black text-white">Nova Promoção</h1>
        </div>

        <form onSubmit={handleSubmit} className="card-dark p-8 border border-border space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Informações Básicas</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Nome da Promoção*</label>
                <input required name="name" value={form.name} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Tipo*</label>
                <select name="type" value={form.type} onChange={handleChange} className="form-input">
                  <option value="global">Global (em todo o site)</option>
                  <option value="product">Produto específico</option>
                  <option value="category">Categoria</option>
                  <option value="tag">Tag</option>
                </select>
              </div>
              {form.type === 'product' && (
                <div>
                  <label className="form-label">ID do Produto</label>
                  <input name="product_id" type="number" value={form.product_id || ''} onChange={handleChange} className="form-input" />
                </div>
              )}
              {form.type === 'category' && (
                <div>
                  <label className="form-label">Categoria</label>
                  <select name="category" value={form.category} onChange={handleChange} className="form-input">
                    <option value="">Selecionar</option>
                    <option value="facas">Facas</option>
                    <option value="kits">Kits</option>
                    <option value="acessorios">Acessórios</option>
                  </select>
                </div>
              )}
              {form.type === 'tag' && (
                <div>
                  <label className="form-label">Tag (ex: premium, destaque)</label>
                  <input name="tag" value={form.tag} onChange={handleChange} className="form-input" />
                </div>
              )}
              <div>
                <label className="form-label">Descrição</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="form-input resize-none h-16" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-4">Desconto</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Tipo*</label>
                <select name="discount_type" value={form.discount_type} onChange={handleChange} className="form-input">
                  <option value="percent">Percentual (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Valor*</label>
                <input required name="discount_value" type="number" step="0.01" value={form.discount_value} onChange={handleChange} className="form-input" />
              </div>
              <div className="col-span-2">
                <label className="form-label">Mínimo de Compra (R$)</label>
                <input name="min_amount" type="number" step="0.01" value={form.min_amount} onChange={handleChange} className="form-input" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white mb-4">Período e Limite</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Data de Início*</label>
                <input required name="start_date" type="date" value={form.start_date} onChange={handleChange} className="form-input" />
              </div>
              <div>
                <label className="form-label">Data de Fim*</label>
                <input required name="end_date" type="date" value={form.end_date} onChange={handleChange} className="form-input" />
              </div>
              <div className="col-span-2">
                <label className="form-label">Código de Cupom (opcional)</label>
                <input name="code" value={form.code} onChange={handleChange} className="form-input" placeholder="PRIMEIRACOMPRA" />
              </div>
              <div className="col-span-2">
                <label className="form-label">Limite de Uso (0 = ilimitado)</label>
                <input name="usage_limit" type="number" value={form.usage_limit} onChange={handleChange} className="form-input" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3 disabled:opacity-50">
              {loading ? 'Criando...' : 'Criar Promoção'}
            </button>
            <Link href="/admin/promocoes" className="btn-outline flex-1 text-center py-3">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
