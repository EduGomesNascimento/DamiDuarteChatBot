'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';

export default function NewCoupon() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'fixed',
    discount_value: 10,
    min_purchase: null as number | null,
    max_uses: null as number | null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.code.trim()) {
        toast.error('Código do cupom é obrigatório');
        return;
      }

      const { error } = await supabase.from('coupons').insert([
        {
          id: uuid(),
          code: formData.code.toUpperCase().trim(),
          discount_type: formData.discount_type,
          discount_value: Number(formData.discount_value),
          min_purchase: formData.min_purchase ? Number(formData.min_purchase) : null,
          max_uses: formData.max_uses ? Number(formData.max_uses) : null,
          uses: 0,
          active: true,
          start_date: formData.start_date,
          end_date: formData.end_date,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success('Cupom criado com sucesso!');
      router.push('/admin/cupons');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar cupom');
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const code = `JFSON${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setFormData({ ...formData, code });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-black text-primary mb-2">Novo Cupom</h1>
        <p className="text-secondary mb-8">Crie um novo código de desconto para seus clientes</p>

        <div className="card-dark p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Código */}
            <div>
              <label className="form-label">Código do Cupom *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="form-input flex-1"
                  placeholder="Ex: DESCONTO10"
                />
                <button
                  type="button"
                  onClick={generateCode}
                  className="btn-outline"
                >
                  Gerar
                </button>
              </div>
            </div>

            {/* Tipo de Desconto */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Tipo de Desconto *</label>
                <select
                  value={formData.discount_type}
                  onChange={e => setFormData({ ...formData, discount_type: e.target.value as 'percent' | 'fixed' })}
                  className="form-input"
                >
                  <option value="percent">Porcentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>

              <div>
                <label className="form-label">Valor de Desconto *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={e => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                  className="form-input"
                  placeholder={formData.discount_type === 'percent' ? '10' : '50.00'}
                />
              </div>
            </div>

            {/* Mínimo de Compra */}
            <div>
              <label className="form-label">Compra Mínima (opcional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.min_purchase || ''}
                onChange={e => setFormData({ ...formData, min_purchase: e.target.value ? Number(e.target.value) : null })}
                className="form-input"
                placeholder="Ex: 100.00"
              />
              <p className="text-xs text-secondary mt-1">Deixe vazio para sem restrição</p>
            </div>

            {/* Limite de Usos */}
            <div>
              <label className="form-label">Máximo de Usos (opcional)</label>
              <input
                type="number"
                min="1"
                value={formData.max_uses || ''}
                onChange={e => setFormData({ ...formData, max_uses: e.target.value ? Number(e.target.value) : null })}
                className="form-input"
                placeholder="Ex: 100"
              />
              <p className="text-xs text-secondary mt-1">Deixe vazio para uso ilimitado</p>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Data de Início *</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Data de Término *</label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary justify-center disabled:opacity-50"
              >
                {loading ? 'Criando...' : '✓ Criar Cupom'}
              </button>
              <Link href="/admin/cupons" className="flex-1 btn-outline justify-center text-center">
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
