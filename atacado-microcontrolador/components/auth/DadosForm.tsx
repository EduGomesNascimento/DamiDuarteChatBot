'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/providers/ToastProvider'
import { formatTelefone } from '@/lib/utils'

interface Props {
  nomeCompleto: string
  telefone: string
  email: string
  cpf: string
}

export function DadosForm({ nomeCompleto, telefone, email, cpf }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [nome, setNome] = useState(nomeCompleto)
  const [tel, setTel] = useState(formatTelefone(telefone))
  const [saving, setSaving] = useState(false)

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/usuario', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeCompleto: nome, telefone: tel }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.erro || 'Erro ao salvar')
      toast('Dados atualizados!', 'success')
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
    <form onSubmit={salvar} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Nome completo</label>
          <input className={input} value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>
        <div>
          <label className={label}>Telefone</label>
          <input className={input} value={tel} onChange={(e) => setTel(formatTelefone(e.target.value))} />
        </div>
        <div>
          <label className={label}>E-mail</label>
          <input className={`${input} opacity-60`} value={email} disabled />
          <p className="mt-1 text-[11px] text-text-secondary">Trocar e-mail exige verificação por OTP (em breve).</p>
        </div>
        <div>
          <label className={label}>CPF</label>
          <input className={`${input} opacity-60 font-mono`} value={cpf} disabled />
        </div>
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </form>
  )
}
