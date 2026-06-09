'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { formatBRL } from '@/lib/utils'
import { useCart } from '@/components/providers/CartProvider'

type StatusPedido =
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGAMENTO_CONFIRMADO'
  | 'EM_SEPARACAO'
  | 'ENVIADO'
  | 'ENTREGUE'
  | 'CANCELADO'
  | 'ESTORNADO'

interface PedidoStatus {
  numero: string
  status: StatusPedido
  mpStatus: string | null
  total: number
}

const TERMINAL: StatusPedido[] = ['CANCELADO', 'ESTORNADO']
const PAGO: StatusPedido[] = ['PAGAMENTO_CONFIRMADO', 'EM_SEPARACAO', 'ENVIADO', 'ENTREGUE']

const VISUAL: Record<
  'pago' | 'pendente' | 'falha',
  { icone: string; titulo: string; texto: string; cor: string }
> = {
  pago: {
    icone: '✅',
    titulo: 'Pagamento confirmado!',
    texto: 'Recebemos seu pagamento. Já vamos separar seu pedido. 🎉',
    cor: 'text-success border-success/40 bg-success/10',
  },
  pendente: {
    icone: '⏳',
    titulo: 'Aguardando confirmação',
    texto: 'Seu pagamento está sendo processado. Esta página atualiza sozinha.',
    cor: 'text-warning border-warning/40 bg-warning/10',
  },
  falha: {
    icone: '❌',
    titulo: 'Pagamento não concluído',
    texto: 'O pagamento foi cancelado ou recusado. Você pode tentar novamente.',
    cor: 'text-danger border-danger/40 bg-danger/10',
  },
}

function fase(status?: StatusPedido): 'pago' | 'pendente' | 'falha' {
  if (!status) return 'pendente'
  if (PAGO.includes(status)) return 'pago'
  if (TERMINAL.includes(status)) return 'falha'
  return 'pendente'
}

function RetornoInner() {
  const params = useSearchParams()
  const numero = params.get('pedido') || params.get('external_reference') || ''
  const { limpar } = useCart()
  const [pedido, setPedido] = useState<PedidoStatus | null>(null)
  const [erro, setErro] = useState('')
  const [tentativas, setTentativas] = useState(0)
  const limpouRef = useRef(false)

  useEffect(() => {
    if (!numero) {
      setErro('Pedido não informado.')
      return
    }
    let ativo = true
    let timer: ReturnType<typeof setTimeout>

    async function checar() {
      try {
        const res = await fetch(`/api/pedidos/${encodeURIComponent(numero)}/status`)
        if (res.status === 401) {
          setErro('Faça login para ver o status do pedido.')
          return
        }
        if (!res.ok) throw new Error()
        const data = (await res.json()) as PedidoStatus
        if (!ativo) return
        setPedido({ ...data, total: Number(data.total) })

        const f = fase(data.status)
        if (f === 'pago' && !limpouRef.current) {
          limpouRef.current = true
          limpar()
        }
        // Continua o polling enquanto estiver pendente (até ~2min)
        if (f === 'pendente' && tentativas < 40) {
          timer = setTimeout(() => setTentativas((t) => t + 1), 3000)
        }
      } catch {
        if (ativo) timer = setTimeout(() => setTentativas((t) => t + 1), 4000)
      }
    }

    checar()
    return () => {
      ativo = false
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numero, tentativas])

  const f = fase(pedido?.status)
  const v = VISUAL[f]

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="gradient-border p-8 text-center">
        <div className={`mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border text-4xl ${v.cor}`}>
          {f === 'pendente' ? <span className="animate-pulse-soft">{v.icone}</span> : v.icone}
        </div>
        <h1 className="font-display text-2xl font-bold">{v.titulo}</h1>
        <p className="mt-2 text-text-secondary">{erro || v.texto}</p>

        {numero && (
          <div className="mt-6 space-y-1 rounded-xl border border-white/10 bg-bg/50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Pedido</span>
              <span className="font-mono text-primary">{numero}</span>
            </div>
            {pedido && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Total</span>
                <span className="font-mono">{formatBRL(pedido.total)}</span>
              </div>
            )}
          </div>
        )}

        {f === 'pendente' && (
          <p className="mt-4 text-xs text-text-secondary">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-soft rounded-full bg-warning" /> Verificando
            pagamento…
          </p>
        )}

        <div className="mt-8 flex flex-col gap-2">
          <Link href="/minha-conta/pedidos" className="btn-primary">
            Ver meus pedidos
          </Link>
          {f === 'falha' && (
            <Link href="/checkout" className="btn-ghost">
              Tentar novamente
            </Link>
          )}
          <Link href="/catalogo" className="btn-ghost">
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RetornoPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-text-secondary">Carregando…</div>}>
      <RetornoInner />
    </Suspense>
  )
}
