'use client'

import { useState } from 'react'
import { formatBRL } from '@/lib/utils'
import { useToast } from '@/components/providers/ToastProvider'

export interface CupomRow {
  id: string
  codigo: string
  tipo: 'PERCENTUAL' | 'FIXO'
  valor: number
  minimo: number | null
  usos: number
  maxUsos: number | null
  expiraEm: string | null
  ativo: boolean
}

export function CouponsManager({ cupons: inicial }: { cupons: CupomRow[] }) {
  const [cupons, setCupons] = useState(inicial)
  const { toast } = useToast()
  const [form, setForm] = useState({
    codigo: '',
    tipo: 'PERCENTUAL' as 'PERCENTUAL' | 'FIXO',
    valor: 10,
    minimo: '' as string,
    maxUsos: '' as string,
    expiraEm: '' as string,
  })
  const [saving, setSaving] = useState(false)

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/cupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: form.codigo,
          tipo: form.tipo,
          valor: Number(form.valor),
          minimo: form.minimo ? Number(form.minimo) : null,
          maxUsos: form.maxUsos ? Number(form.maxUsos) : null,
          expiraEm: form.expiraEm || null,
        }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.erro || 'Erro')
      setCupons((prev) => [...prev, { ...j, valor: Number(j.valor), minimo: j.minimo ? Number(j.minimo) : null }])
      toast('Cupom criado!', 'success')
      setForm({ codigo: '', tipo: 'PERCENTUAL', valor: 10, minimo: '', maxUsos: '', expiraEm: '' })
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function toggle(id: string, ativo: boolean) {
    try {
      const res = await fetch(`/api/admin/cupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !ativo }),
      })
      if (!res.ok) throw new Error()
      setCupons((prev) => prev.map((c) => (c.id === id ? { ...c, ativo: !ativo } : c)))
    } catch {
      toast('Erro ao atualizar', 'error')
    }
  }

  async function remover(id: string) {
    if (!confirm('Excluir cupom?')) return
    try {
      const res = await fetch(`/api/admin/cupons/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setCupons((prev) => prev.filter((c) => c.id !== id))
      toast('Cupom excluído', 'success')
    } catch {
      toast('Erro ao excluir', 'error')
    }
  }

  const input = 'w-full rounded-xl border border-white/10 bg-bg px-3 py-2 text-sm outline-none focus:border-primary/60'

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form onSubmit={criar} className="surface-card space-y-3 p-5 lg:col-span-1">
        <h3 className="font-display font-semibold">Novo cupom</h3>
        <input className={input} placeholder="CÓDIGO" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })} required />
        <select className={input} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as 'PERCENTUAL' | 'FIXO' })}>
          <option value="PERCENTUAL">Percentual (%)</option>
          <option value="FIXO">Valor fixo (R$)</option>
        </select>
        <input className={input} type="number" step="0.01" placeholder="Valor" value={form.valor} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} required />
        <input className={input} type="number" step="0.01" placeholder="Mínimo do pedido (opcional)" value={form.minimo} onChange={(e) => setForm({ ...form, minimo: e.target.value })} />
        <input className={input} type="number" placeholder="Máx. usos (opcional)" value={form.maxUsos} onChange={(e) => setForm({ ...form, maxUsos: e.target.value })} />
        <input className={input} type="date" value={form.expiraEm} onChange={(e) => setForm({ ...form, expiraEm: e.target.value })} />
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Salvando…' : 'Criar cupom'}</button>
      </form>

      <div className="surface-card overflow-x-auto p-2 lg:col-span-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 font-mono text-xs uppercase tracking-wide text-text-secondary">
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Desconto</th>
              <th className="px-4 py-3 text-center">Usos</th>
              <th className="px-4 py-3 text-center">Ativo</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cupons.map((c) => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-primary">{c.codigo}</td>
                <td className="px-4 py-3">
                  {c.tipo === 'PERCENTUAL' ? `${c.valor}%` : formatBRL(c.valor)}
                  {c.minimo ? <span className="text-xs text-text-secondary"> · mín {formatBRL(c.minimo)}</span> : null}
                </td>
                <td className="px-4 py-3 text-center font-mono text-xs">{c.usos}{c.maxUsos ? `/${c.maxUsos}` : ''}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggle(c.id, c.ativo)} className={`h-5 w-8 rounded-full transition-colors ${c.ativo ? 'bg-success' : 'bg-white/20'}`}>
                    <span className={`block h-4 w-4 rounded-full bg-white transition-all ${c.ativo ? 'ml-3.5' : 'ml-0.5'}`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => remover(c.id)} className="text-xs text-danger hover:underline">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {cupons.length === 0 && <div className="py-12 text-center text-text-secondary">Nenhum cupom.</div>}
      </div>
    </div>
  )
}
