'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/providers/ToastProvider'
import type { ConfigDTO } from '@/lib/config'

export function ConfigForm({ inicial }: { inicial: ConfigDTO }) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nomeLoja: inicial.nomeLoja,
    freteGratisAtivo: inicial.freteGratisAtivo,
    freteGratisMinimo: inicial.freteGratisMinimo,
    descontoGlobalPct: inicial.descontoGlobalPct,
    bannerTexto: inicial.bannerTexto ?? '',
  })

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          freteGratisMinimo: Number(form.freteGratisMinimo),
          descontoGlobalPct: Number(form.descontoGlobalPct),
          bannerTexto: form.bannerTexto || null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.erro || 'Erro ao salvar')
      }
      toast('Configurações salvas!', 'success')
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao salvar', 'error')
    } finally {
      setSaving(false)
    }
  }

  const input =
    'w-full rounded-xl border border-white/10 bg-bg px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary/60'
  const label = 'block text-xs font-mono uppercase tracking-wide text-text-secondary mb-1.5'

  return (
    <form onSubmit={salvar} className="surface-card space-y-5 p-6 max-w-2xl">
      <div>
        <label className={label}>Nome da loja</label>
        <input className={input} value={form.nomeLoja} onChange={(e) => setForm({ ...form, nomeLoja: e.target.value })} />
      </div>

      <div>
        <label className={label}>Banner promocional (topo do site)</label>
        <input className={input} value={form.bannerTexto} onChange={(e) => setForm({ ...form, bannerTexto: e.target.value })} placeholder="Ex: Frete grátis acima de R$ 299" />
      </div>

      <div className="rounded-xl border border-white/10 p-4 space-y-4">
        <label className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" checked={form.freteGratisAtivo} onChange={(e) => setForm({ ...form, freteGratisAtivo: e.target.checked })} />
          🚚 Ativar frete grátis acima de um valor
        </label>
        <div>
          <label className={label}>Valor mínimo para frete grátis (R$)</label>
          <input type="number" step="0.01" className={input} value={form.freteGratisMinimo} onChange={(e) => setForm({ ...form, freteGratisMinimo: Number(e.target.value) })} disabled={!form.freteGratisAtivo} />
        </div>
      </div>

      <div>
        <label className={label}>Desconto global da loja (%)</label>
        <input type="number" step="0.5" min="0" max="90" className={input} value={form.descontoGlobalPct} onChange={(e) => setForm({ ...form, descontoGlobalPct: Number(e.target.value) })} />
        <p className="mt-1 text-[11px] text-text-secondary">Aplicado sobre todo o catálogo no carrinho/checkout. Use 0 para desativar.</p>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Salvando…' : 'Salvar configurações'}
      </button>
    </form>
  )
}
