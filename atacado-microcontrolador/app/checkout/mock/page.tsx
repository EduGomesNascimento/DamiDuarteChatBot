'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/providers/ToastProvider'

type Aba = 'pix' | 'boleto' | 'cartao'

function MockInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()
  const numero = params.get('ref') || ''
  const [aba, setAba] = useState<Aba>('pix')
  const [loading, setLoading] = useState(false)
  const [parcelas, setParcelas] = useState(1)

  const pixCode = useMemo(
    () => `00020126AENMOCK${numero}520400005303986540510.005802BR5913ATACADOMICRO6009PORTAORS62${Math.random().toString(36).slice(2, 10).toUpperCase()}6304ABCD`,
    [numero]
  )

  async function confirmar(resultado: 'aprovado' | 'pendente' | 'recusado') {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout/mock-confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero, resultado }),
      })
      if (!res.ok) throw new Error()
      if (resultado === 'aprovado') toast('Pagamento aprovado! 🎉', 'success')
      else if (resultado === 'pendente') toast('Pagamento pendente', 'info')
      else toast('Pagamento recusado', 'error')
      router.push('/minha-conta/pedidos')
    } catch {
      toast('Erro ao processar pagamento', 'error')
    } finally {
      setLoading(false)
    }
  }

  const abas: { id: Aba; label: string }[] = [
    { id: 'pix', label: 'PIX' },
    { id: 'boleto', label: 'Boleto' },
    { id: 'cartao', label: 'Cartão' },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
        ⚠️ Ambiente de simulação — Mercado Pago não configurado. Use os botões abaixo para simular o resultado.
      </div>

      <div className="gradient-border p-6">
        <div className="mb-1 text-xs font-mono uppercase text-text-secondary">Pedido</div>
        <div className="mb-6 font-mono text-primary">{numero}</div>

        <div className="mb-6 flex gap-2">
          {abas.map((a) => (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                aba === a.id ? 'bg-primary text-primary-fg' : 'border border-white/10 text-text-secondary'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {aba === 'pix' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto grid h-48 w-48 place-items-center rounded-xl bg-white p-3">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)',
                  backgroundSize: '16px 16px',
                }}
                aria-label="QR Code PIX (simulado)"
              />
            </div>
            <p className="text-sm text-text-secondary">Escaneie o QR Code ou copie o código PIX:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-white/10 bg-bg px-3 py-2 text-left font-mono text-xs">
                {pixCode}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(pixCode)
                  toast('Código PIX copiado', 'success')
                }}
                className="btn-ghost px-3 py-2 text-xs"
              >
                Copiar
              </button>
            </div>
          </div>
        )}

        {aba === 'boleto' && (
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-white/10 bg-bg p-4 font-mono text-xs tracking-wider">
              34191.79001 01043.510047 91020.150008 1 99990000010000
            </div>
            <button onClick={() => toast('Boleto gerado (simulado)', 'info')} className="btn-ghost w-full">
              ⬇ Baixar boleto (PDF)
            </button>
            <p className="text-xs text-text-secondary">Vencimento em 3 dias úteis.</p>
          </div>
        )}

        {aba === 'cartao' && (
          <div className="space-y-3">
            <input className="w-full rounded-xl border border-white/10 bg-bg px-3 py-2 font-mono text-sm outline-none focus:border-primary/60" placeholder="0000 0000 0000 0000" />
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-xl border border-white/10 bg-bg px-3 py-2 font-mono text-sm outline-none focus:border-primary/60" placeholder="MM/AA" />
              <input className="rounded-xl border border-white/10 bg-bg px-3 py-2 font-mono text-sm outline-none focus:border-primary/60" placeholder="CVV" />
            </div>
            <input className="w-full rounded-xl border border-white/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary/60" placeholder="Nome no cartão" />
            <select
              value={parcelas}
              onChange={(e) => setParcelas(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary/60"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}x {n > 6 ? '(com juros)' : 'sem juros'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-6 space-y-2 border-t border-white/10 pt-5">
          <button onClick={() => confirmar('aprovado')} disabled={loading || !numero} className="btn-primary w-full">
            ✓ Simular pagamento aprovado
          </button>
          <div className="flex gap-2">
            <button onClick={() => confirmar('pendente')} disabled={loading || !numero} className="btn-ghost flex-1 text-xs">
              Pendente
            </button>
            <button onClick={() => confirmar('recusado')} disabled={loading || !numero} className="btn-ghost flex-1 text-xs">
              Recusado
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutMockPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-text-secondary">Carregando…</div>}>
      <MockInner />
    </Suspense>
  )
}
