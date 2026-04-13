'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatBRL } from '@/lib/utils';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalPromotions: number;
  recentOrders: any[];
  topProducts: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();

      // Total revenue (soma de orders paid)
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status')
        .eq('status', 'paid');
      const totalRevenue = (orders || []).reduce((s, o) => s + o.total, 0);

      // Counts
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: totalPromotions } = await supabase
        .from('promotions')
        .select('*', { count: 'exact', head: true });

      // Recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, status, total, created_at, shipping_method')
        .order('created_at', { ascending: false })
        .limit(5);

      // Top products
      const { data: topProducts } = await supabase
        .from('products')
        .select('id, name, price, stock, reviews')
        .order('reviews', { ascending: false })
        .limit(5);

      setStats({
        totalRevenue,
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
        totalPromotions: totalPromotions || 0,
        recentOrders: recentOrders || [],
        topProducts: topProducts || [],
      });

      setLoading(false);
    }

    loadStats();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-primary">Carregando...</div>;
  }

  const statusColors: Record<string, string> = {
    paid: 'text-brand-gold',
    pending: 'text-brand-red',
    cancelled: 'text-brand-red',
    shipped: 'text-brand-gold',
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-bg-primary">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-4xl font-black text-primary">Dashboard Admin</h1>
            <p className="text-secondary text-sm mt-1">Gerenciamento completo da loja</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/admin/produtos" className="btn-primary">Produtos</Link>
            <Link href="/admin/promocoes" className="btn-primary">Promoções</Link>
            <Link href="/admin/cupons" className="btn-primary">Cupons</Link>
            <Link href="/admin/pedidos" className="btn-primary">Pedidos</Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Receita Total', value: formatBRL(stats?.totalRevenue || 0), color: 'from-green-600' },
            { label: 'Pedidos', value: stats?.totalOrders || 0, color: 'from-blue-600' },
            { label: 'Produtos', value: stats?.totalProducts || 0, color: 'from-purple-600' },
            { label: 'Promoções', value: stats?.totalPromotions || 0, color: 'from-pink-600' },
          ].map(stat => (
            <div key={stat.label} className={`card-dark p-6 bg-gradient-to-br ${stat.color} to-transparent border border-border`}>
              <div className="text-secondary text-sm mb-2">{stat.label}</div>
              <div className="font-display text-3xl font-black text-primary">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="card-dark p-6 border border-border">
            <h2 className="text-lg font-bold text-primary mb-4">Pedidos Recentes</h2>
            <div className="space-y-3">
              {(stats?.recentOrders || []).length === 0 ? (
                <p className="text-secondary text-sm">Nenhum pedido</p>
              ) : (
                stats?.recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-bg-card rounded border border-border">
                    <div>
                      <div className="text-sm font-semibold text-primary font-mono">#{order.id.substring(0, 8)}</div>
                      <div className="text-xs text-secondary">{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${statusColors[order.status] || 'text-gray-400'}`}>
                        {order.status.toUpperCase()}
                      </div>
                      <div className="text-sm text-brand-red font-bold">{formatBRL(order.total)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/admin/pedidos" className="text-xs text-brand-red mt-4 block hover:underline">
              Ver todos →
            </Link>
          </div>

          {/* Top Products */}
          <div className="card-dark p-6 border border-border">
            <h2 className="text-lg font-bold text-primary mb-4">Produtos Populares</h2>
            <div className="space-y-3">
              {(stats?.topProducts || []).length === 0 ? (
                <p className="text-secondary text-sm">Nenhum produto</p>
              ) : (
                stats?.topProducts.map(product => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-bg-card rounded border border-border">
                    <div>
                      <div className="text-sm font-semibold text-primary line-clamp-1">{product.name}</div>
                      <div className="text-xs text-secondary">{product.reviews} avaliações</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-brand-red font-bold">{formatBRL(product.price)}</div>
                      <div className="text-xs text-secondary">Estoque: {product.stock}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/admin/produtos" className="text-xs text-brand-red mt-4 block hover:underline">
              Gerenciar produtos →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/admin/produtos/novo" className="card-dark p-6 border border-brand-red/30 hover:border-brand-red transition-all">
            <div className="text-3xl mb-2">📦</div>
            <h3 className="font-bold text-primary">Novo Produto</h3>
            <p className="text-xs text-secondary mt-1">Adicionar produto ao catálogo</p>
          </Link>
          <Link href="/admin/promocoes/nova" className="card-dark p-6 border border-brand-red/30 hover:border-brand-red transition-all">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="font-bold text-primary">Nova Promoção</h3>
            <p className="text-xs text-secondary mt-1">Criar desconto ou oferta</p>
          </Link>
          <Link href="/admin/cupons/novo" className="card-dark p-6 border border-brand-red/30 hover:border-brand-red transition-all">
            <div className="text-3xl mb-2">🎟️</div>
            <h3 className="font-bold text-primary">Novo Cupom</h3>
            <p className="text-xs text-secondary mt-1">Criar código de desconto</p>
          </Link>
          <Link href="/admin/logs" className="card-dark p-6 border border-brand-red/30 hover:border-brand-red transition-all">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-bold text-primary">Logs Admin</h3>
            <p className="text-xs text-secondary mt-1">Histórico de ações</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
