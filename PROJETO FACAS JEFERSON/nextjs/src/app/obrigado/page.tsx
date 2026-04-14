'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ObrigadoContent() {
  const params = useSearchParams();
  const orderId = params.get('order') || '';
  const status = params.get('status') || 'approved';

  const isSuccess = status === 'approved' || status === 'PAID';

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full card-dark p-10 text-center">
        <div className="text-6xl mb-4">{isSuccess ? '✅' : status === 'pending' ? '⏳' : '❌'}</div>

        <h1 className="font-display text-3xl font-black text-white mb-3">
          {isSuccess ? 'Pedido Confirmado!' : status === 'pending' ? 'Pagamento Pendente' : 'Pagamento Não Aprovado'}
        </h1>

        {orderId && (
          <p className="text-gray-400 text-sm mb-4">
            Pedido: <span className="text-brand-gold font-bold font-mono">{orderId}</span>
          </p>
        )}

        <p className="text-gray-500 text-sm mb-8">
          {isSuccess
            ? 'Seu pagamento foi aprovado! Você receberá um e-mail com os detalhes do pedido e informações de rastreio.'
            : status === 'pending'
              ? 'Estamos processando seu pagamento. Você será notificado assim que for confirmado.'
              : 'Houve um problema com o pagamento. Tente novamente ou escolha outro método.'}
        </p>

        {isSuccess && (
          <div className="border border-border rounded-lg p-6 mb-8">
            <h3 className="text-sm font-bold text-white mb-4">Próximos passos:</h3>
            <div className="space-y-3 text-left">
              {[
                { step: '1', label: 'Confirmação', desc: 'Pagamento confirmado', done: true },
                { step: '2', label: 'Preparação', desc: 'Pedido sendo preparado', done: false },
                { step: '3', label: 'Envio', desc: 'Enviado para transportadora', done: false },
                { step: '4', label: 'Entrega', desc: 'Entregue no seu endereço', done: false },
              ].map(s => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.done ? 'bg-green-600 text-white' : 'bg-bg-card text-gray-500 border border-border'
                  }`}>
                    {s.done ? '✓' : s.step}
                  </div>
                  <div>
                    <div className="text-sm text-white font-semibold">{s.label}</div>
                    <div className="text-xs text-gray-500">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">Voltar para a Loja</Link>
          {!isSuccess && <Link href="/checkout" className="btn-outline">Tentar Novamente</Link>}
        </div>
      </div>
    </div>
  );
}

export default function ObrigadoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 flex items-center justify-center text-white">Carregando...</div>}>
      <ObrigadoContent />
    </Suspense>
  );
}
