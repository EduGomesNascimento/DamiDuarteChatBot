'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatBRL } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Promotion {
  id: string;
  name: string;
  type: 'global' | 'product' | 'category' | 'tag';
  discount_value: number;
  discount_type: 'percent' | 'fixed';
  start_date: string;
  end_date: string;
  active: boolean;
  code?: string;
  used_count: number;
  usage_limit?: number;
}

export default function AdminPromotions() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPromotions();
  }, []);

  async function loadPromotions() {
    const { data } = await supabase
      .from('promotions')
      .select('*')
      .order('start_date', { ascending: false });

    setPromos(data || []);
    setLoading(false);
  }

  async function togglePromotion(id: string, active: boolean) {
    const { error } = await supabase
      .from('promotions')
      .update({ active: !active })
      .eq('id', id);

    if (error) {
      toast.error('Erro ao atualizar');
      return;
    }

    toast.success('Promoção atualizada');
    setPromos(p => p.map(x => x.id === id ? { ...x, active: !active } : x));
  }

  async function deletePromo(id: string) {
    if (!confirm('Deletar promoção?')) return;

    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao deletar');
      return;
    }

    toast.success('Promoção deletada');
    setPromos(p => p.filter(x => x.id !== id));
  }

  const isActive = (p: Promotion) => {
    const now = new Date();
    const start = new Date(p.start_date);
    const end = new Date(p.end_date);
    return now >= start && now <= end && p.active;
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-bg-primary">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl font-black text-white">Promoções</h1>
            <p className="text-gray-500 text-sm mt-1">{promos.length} promoções</p>
          </div>
          <Link href="/admin/promocoes/nova" className="btn-primary">+ Nova Promoção</Link>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Carregando...</div>
        ) : promos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Nenhuma promoção</p>
            <Link href="/admin/promocoes/nova" className="btn-primary">Criar Promoção</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map(p => (
              <div key={p.id} className={`card-dark p-6 border-2 ${isActive(p) ? 'border-green-600/50' : 'border-border'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{p.type.toUpperCase()}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    isActive(p) ? 'bg-green-600 text-white' : 'bg-bg-card text-gray-500'
                  }`}>
                    {isActive(p) ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Desconto */}
                <div className="bg-brand-red/10 border border-brand-red/30 rounded p-3 mb-4">
                  <div className="text-3xl font-black text-brand-red">
                    {p.discount_type === 'percent' ? `${p.discount_value}%` : formatBRL(p.discount_value)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {p.discount_type === 'percent' ? 'Desconto percentual' : 'Desconto fixo'}
                  </div>
                </div>

                {/* Detalhes */}
                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <div>Início: {new Date(p.start_date).toLocaleDateString('pt-BR')}</div>
                  <div>Fim: {new Date(p.end_date).toLocaleDateString('pt-BR')}</div>
                  {p.code && <div className="font-mono text-brand-gold">Código: {p.code}</div>}
                  {p.usage_limit && (
                    <div>Uso: {p.used_count} / {p.usage_limit}</div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePromotion(p.id, p.active)}
                    className="flex-1 text-xs py-2 rounded bg-bg-card hover:bg-border transition-all"
                  >
                    {p.active ? '⏸️ Pausar' : '▶️ Ativar'}
                  </button>
                  <button
                    onClick={() => deletePromo(p.id)}
                    className="text-xs px-3 py-2 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
