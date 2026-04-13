'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatBRL } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Coupon {
  id: string;
  code: string;
  discount_value: number;
  discount_type: 'percent' | 'fixed';
  min_purchase?: number;
  max_uses?: number;
  uses: number;
  active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    setCoupons(data || []);
    setLoading(false);
  }

  async function deleteCoupon(id: string) {
    if (!confirm('Tem certeza que deseja deletar este cupom?')) return;

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao deletar cupom');
      return;
    }

    toast.success('Cupom deletado com sucesso');
    setCoupons(c => c.filter(x => x.id !== id));
  }

  async function toggleCoupon(id: string, active: boolean) {
    const { error } = await supabase
      .from('coupons')
      .update({ active: !active })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar cupom');
      return;
    }

    setCoupons(c => c.map(x => x.id === id ? { ...x, active: !active } : x));
    toast.success('Cupom atualizado');
  }

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(filter.toLowerCase())
  );

  const isExpired = (end_date: string) => new Date(end_date) < new Date();
  const isActive = (coupon: Coupon) => coupon.active && !isExpired(coupon.end_date);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-bg-primary">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-black text-primary">Cupons de Desconto</h1>
            <p className="text-secondary text-sm mt-1">{filtered.length} cupons cadastrados</p>
          </div>
          <Link href="/admin/cupons/novo" className="btn-primary">+ Novo Cupom</Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por código..."
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
            <p className="text-secondary mb-4">Nenhum cupom encontrado</p>
            <Link href="/admin/cupons/novo" className="btn-primary">Criar Cupom</Link>
          </div>
        ) : (
          <div className="card-dark overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 text-secondary">Código</th>
                  <th className="text-center p-4 text-secondary">Desconto</th>
                  <th className="text-center p-4 text-secondary">Mín. Compra</th>
                  <th className="text-center p-4 text-secondary">Usos</th>
                  <th className="text-center p-4 text-secondary">Validade</th>
                  <th className="text-center p-4 text-secondary">Status</th>
                  <th className="text-center p-4 text-secondary">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-bg-card transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-primary">{c.code}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-brand-gold font-bold">
                        {c.discount_type === 'percent' ? `${c.discount_value}%` : formatBRL(c.discount_value)}
                      </span>
                    </td>
                    <td className="p-4 text-center text-secondary">
                      {c.min_purchase ? formatBRL(c.min_purchase) : '—'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={c.max_uses ? 'text-secondary' : 'text-brand-gold'}>
                        {c.uses}{c.max_uses ? ` / ${c.max_uses}` : ' / ∞'}
                      </span>
                    </td>
                    <td className="p-4 text-center text-xs">
                      {new Date(c.end_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-bold ${isActive(c) ? 'text-brand-gold' : 'text-brand-red'}`}>
                        {isActive(c) ? 'Ativo' : isExpired(c.end_date) ? 'Expirado' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => toggleCoupon(c.id, c.active)}
                        className="text-brand-gold hover:underline text-xs"
                      >
                        {c.active ? 'Desativar' : 'Ativar'}
                      </button>
                      <Link href={`/admin/cupons/${c.id}`} className="text-brand-gold hover:underline text-xs">
                        Editar
                      </Link>
                      <button
                        onClick={() => deleteCoupon(c.id)}
                        className="text-brand-red hover:underline text-xs"
                      >
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
            { label: 'Total', value: coupons.length },
            { label: 'Ativos', value: coupons.filter(c => isActive(c)).length },
            { label: 'Expirados', value: coupons.filter(c => isExpired(c.end_date)).length },
            { label: 'Uso Total', value: coupons.reduce((s, c) => s + c.uses, 0) },
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
