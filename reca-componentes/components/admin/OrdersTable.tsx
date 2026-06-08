'use client'

import { useState } from 'react'
import { formatBRL } from '@/lib/utils'
import { useToast } from '@/components/providers/ToastProvider'
import { STATUS_MAP, type StatusPedido } from '@/components/admin/StatusBadge'

export interface PedidoRow {
  id: string
  numero: string
  cliente: string
  email: string
  total: number
  status: StatusPedido
  rastreamento: string | null
  data: string
}

const STATUS_OPTIONS = Object.keys(STATUS_MAP) as StatusPedido[]

export function OrdersTable({ pedidos: inicial }: { pedidos: PedidoRow[] }) {
  const [pedidos, setPedidos] = useState(inicial)
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  async function patch(id: string, body: Partial<{ status: StatusPedido; rastreamento: string }>) {
    setLoading(id)
    try {
      const res = await fetch(`/api/admin/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, ...body } : p)))
      toast('Pedido atualizado', 'success')
    } catch {
      toast('Erro ao atualizar pedido', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 font-mono text-xs uppercase tracking-wide text-text-secondary">
            <th className="px-4 py-3 text-left">Pedido</th>
            <th className="px-4 py-3 text-left">Cliente</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Rastreamento</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
            <tr key={p.id} className="border-b border-white/5">
              <td className="px-4 py-3">
                <div className="font-mono text-xs text-primary">{p.numero}</div>
                <div className="text-[10px] text-text-secondary">{p.data}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-text-primary">{p.cliente}</div>
                <div className="text-[10px] text-text-secondary">{p.email}</div>
              </td>
              <td className="px-4 py-3 text-right font-mono">{formatBRL(p.total)}</td>
              <td className="px-4 py-3">
                <select
                  value={p.status}
                  disabled={loading === p.id}
                  onChange={(e) => patch(p.id, { status: e.target.value as StatusPedido })}
                  className="rounded-lg border border-white/10 bg-bg px-2 py-1.5 text-xs outline-none focus:border-primary/60"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_MAP[s].label}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <input
                  defaultValue={p.rastreamento ?? ''}
                  placeholder="código…"
                  disabled={loading === p.id}
                  onBlur={(e) => {
                    if (e.target.value !== (p.rastreamento ?? '')) patch(p.id, { rastreamento: e.target.value })
                  }}
                  className="w-32 rounded-lg border border-white/10 bg-bg px-2 py-1.5 font-mono text-xs outline-none focus:border-primary/60"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pedidos.length === 0 && (
        <div className="py-12 text-center text-text-secondary">Nenhum pedido ainda.</div>
      )}
    </div>
  )
}
