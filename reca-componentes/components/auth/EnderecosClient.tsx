'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/providers/ToastProvider'
import { Button } from '@/components/ui/Button'
import { formatCEP } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Endereco {
  id: string
  apelido: string
  cep: string
  logradouro: string
  numero: string
  complemento?: string | null
  bairro: string
  cidade: string
  estado: string
  principal: boolean
}

interface FormData {
  apelido: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  principal: boolean
}

const defaultForm: FormData = {
  apelido: 'Casa',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  principal: false,
}

async function buscarCep(cep: string) {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export function EnderecosClient() {
  const { toast } = useToast()
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [cepLoading, setCepLoading] = useState(false)

  const loadEnderecos = useCallback(async () => {
    try {
      const res = await fetch('/api/enderecos')
      if (res.ok) {
        const data = await res.json()
        setEnderecos(data)
      }
    } catch {
      toast('Erro ao carregar endereços.', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadEnderecos()
  }, [loadEnderecos])

  async function handleCepBlur() {
    const cep = form.cep.replace(/\D/g, '')
    if (cep.length !== 8) return
    setCepLoading(true)
    const data = await buscarCep(cep)
    setCepLoading(false)
    if (data && !data.erro) {
      setForm((f) => ({
        ...f,
        logradouro: data.logradouro || f.logradouro,
        bairro: data.bairro || f.bairro,
        cidade: data.localidade || f.cidade,
        estado: data.uf || f.estado,
      }))
    }
  }

  function openCreate() {
    setForm(defaultForm)
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(end: Endereco) {
    setForm({
      apelido: end.apelido,
      cep: formatCEP(end.cep),
      logradouro: end.logradouro,
      numero: end.numero,
      complemento: end.complemento || '',
      bairro: end.bairro,
      cidade: end.cidade,
      estado: end.estado,
      principal: end.principal,
    })
    setEditingId(end.id)
    setShowForm(true)
  }

  function cancel() {
    setShowForm(false)
    setEditingId(null)
    setForm(defaultForm)
  }

  async function handleSave() {
    if (!form.cep || form.cep.replace(/\D/g, '').length !== 8) {
      toast('CEP inválido.', 'error'); return
    }
    if (!form.logradouro.trim() || !form.numero.trim() || !form.bairro.trim() || !form.cidade.trim() || form.estado.trim().length !== 2) {
      toast('Preencha todos os campos obrigatórios.', 'error'); return
    }
    setSaving(true)
    try {
      const body = { ...form, cep: form.cep.replace(/\D/g, '') }
      const url = editingId ? `/api/enderecos/${editingId}` : '/api/enderecos'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast(editingId ? 'Endereço atualizado!' : 'Endereço adicionado!', 'success')
        cancel()
        loadEnderecos()
      } else {
        const d = await res.json()
        toast(d.erro || 'Erro ao salvar endereço.', 'error')
      }
    } catch {
      toast('Erro de conexão.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/enderecos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast('Endereço removido.', 'success')
        loadEnderecos()
      } else {
        toast('Erro ao remover endereço.', 'error')
      }
    } catch {
      toast('Erro de conexão.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetPrincipal(end: Endereco) {
    try {
      const body = {
        apelido: end.apelido,
        cep: end.cep,
        logradouro: end.logradouro,
        numero: end.numero,
        complemento: end.complemento || '',
        bairro: end.bairro,
        cidade: end.cidade,
        estado: end.estado,
        principal: true,
      }
      const res = await fetch(`/api/enderecos/${end.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast('Endereço principal atualizado.', 'success')
        loadEnderecos()
      }
    } catch {
      toast('Erro ao atualizar endereço.', 'error')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-up">
        {[1, 2].map((i) => (
          <div key={i} className="surface-card rounded-2xl p-5 h-28 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-xl font-bold text-text-primary">Endereços</h2>
        {!showForm && (
          <Button onClick={openCreate} className="text-sm px-4 py-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo endereço
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="surface-card rounded-2xl p-6 border border-primary/20">
          <h3 className="font-medium text-text-primary mb-4">
            {editingId ? 'Editar endereço' : 'Novo endereço'}
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Apelido</label>
                <input
                  type="text"
                  value={form.apelido}
                  onChange={(e) => setForm({ ...form, apelido: e.target.value })}
                  className="input-field w-full"
                  placeholder="Casa"
                />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">CEP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.cep}
                    onChange={(e) => setForm({ ...form, cep: formatCEP(e.target.value) })}
                    onBlur={handleCepBlur}
                    className="input-field w-full font-mono"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {cepLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-1">Logradouro</label>
              <input type="text" value={form.logradouro} onChange={(e) => setForm({ ...form, logradouro: e.target.value })} className="input-field w-full" placeholder="Rua das Flores" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-text-secondary mb-1">Número</label>
                <input type="text" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="input-field w-full" placeholder="123" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">Complemento</label>
                <input type="text" value={form.complemento} onChange={(e) => setForm({ ...form, complemento: e.target.value })} className="input-field w-full" placeholder="Apto (opcional)" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-secondary mb-1">Bairro</label>
              <input type="text" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} className="input-field w-full" placeholder="Centro" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-text-secondary mb-1">Cidade</label>
                <input type="text" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="input-field w-full" placeholder="Portão" />
              </div>
              <div>
                <label className="block text-xs text-text-secondary mb-1">UF</label>
                <input type="text" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase().slice(0, 2) })} className="input-field w-full font-mono uppercase" placeholder="RS" maxLength={2} />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.principal}
                onChange={(e) => setForm({ ...form, principal: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-surface-2 accent-primary"
              />
              <span className="text-sm text-text-secondary">Definir como endereço principal</span>
            </label>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={cancel} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? (
                  <span className="w-4 h-4 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
                ) : editingId ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enderecos list */}
      {enderecos.length === 0 && !showForm ? (
        <div className="surface-card rounded-2xl p-10 text-center">
          <p className="text-text-secondary">Nenhum endereço cadastrado.</p>
          <button onClick={openCreate} className="text-primary text-sm mt-2 hover:underline">
            Adicionar agora
          </button>
        </div>
      ) : (
        enderecos.map((end) => (
          <div
            key={end.id}
            className={cn(
              'surface-card rounded-2xl p-5 border transition-all duration-200',
              end.principal ? 'border-primary/30' : 'border-white/5'
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-text-primary">{end.apelido}</span>
                  {end.principal && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Principal
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary">
                  {end.logradouro}, {end.numero}
                  {end.complemento && ` — ${end.complemento}`}
                </p>
                <p className="text-sm text-text-secondary">
                  {end.bairro}, {end.cidade} - {end.estado}
                </p>
                <p className="font-mono text-xs text-text-secondary/60 mt-1">
                  CEP {formatCEP(end.cep)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!end.principal && (
                  <button
                    onClick={() => handleSetPrincipal(end)}
                    className="text-xs text-text-secondary hover:text-primary transition-colors px-2 py-1"
                  >
                    Definir principal
                  </button>
                )}
                <button
                  onClick={() => openEdit(end)}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-white/5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(end.id)}
                  disabled={deletingId === end.id}
                  className="text-xs text-text-secondary hover:text-danger transition-colors p-2 rounded-lg hover:bg-danger/10"
                >
                  {deletingId === end.id ? (
                    <span className="w-4 h-4 border-2 border-danger/30 border-t-danger rounded-full animate-spin block" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      <style jsx>{`
        .input-field {
          background: rgb(26 35 54);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          color: rgb(249 250 251);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus {
          border-color: #00D4FF;
          box-shadow: 0 0 20px rgba(0,212,255,0.3);
        }
        .input-field::placeholder {
          color: rgba(156,163,175,0.5);
        }
      `}</style>
    </div>
  )
}
