'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatBRL } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  total_amount: number;
  shipping_price: number;
  status: string;
  payment_method: string;
  created_at: string;
  customer_name: string;
  address_city: string;
  address_state: string;
  order_items: OrderItem[];
}

const statusLabels: { [key: string]: string } = {
  pending: '⏳ Pendente',
  paid: '✅ Pago',
  shipped: '📦 Enviado',
  delivered: '🎁 Entregue',
  cancelled: '❌ Cancelado',
};

const statusColors: { [key: string]: string } = {
  pending: 'text-yellow-400',
  paid: 'text-green-400',
  shipped: 'text-blue-400',
  delivered: 'text-green-500',
  cancelled: 'text-red-400',
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setOrders(data || []);
      } catch (err: any) {
        toast.error('Erro ao carregar pedidos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-black text-white mb-2">
            Meus Pedidos
          </h1>
          <p className="text-gray-400">Acompanhe suas compras</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-bg-secondary border border-border rounded-lg p-12 text-center">
            <p className="text-gray-400 mb-6">Você ainda não fez nenhum pedido</p>
            <Link href="/" className="btn-primary">
              Ir para Loja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-bg-secondary border border-border rounded-lg p-6 hover:border-brand-red transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    <h3 className="font-bold text-white mb-1">
                      Pedido #{String(order.id).padStart(6, '0')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ENDEREÇO</p>
                    <p className="text-white text-sm">
                      {order.address_city}, {order.address_state}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">PAGAMENTO</p>
                    <p className="text-white text-sm capitalize">
                      {order.payment_method === 'pix' ? '📱 PIX' : order.payment_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">TOTAL</p>
                    <p className="text-white text-sm font-bold">
                      R$ {order.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10">
          <Link href="/usuario" className="text-brand-red hover:text-brand-red-dark transition-colors text-sm">
            ← Voltar ao Perfil
          </Link>
        </div>
      </div>
    </div>
  );
}
