'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/providers/ToastProvider'

export interface ProdutoFormData {
  id?: string
  nome: string
  sku: string
  categoriaId: string
  preco: number
  precoOriginal: number | null
  estoque: number
  descricaoInformal: string
  descricaoTecnica: string
  especificacoes: Record<string, string>
  tags: string[]
  imagens: string[]
  datasheetUrl: string | null
  destaque: boolean
  ativo: boolean
  freteGratis: boolean
}

interface Props {
  categorias: { id: string; nome: string }[]
  inicial?: Partial<ProdutoFormData>
  modo: 'criar' | 'editar'
}

const VAZIO: ProdutoFormData = {
  nome: '',
  sku: '',
  categoriaId: '',
  preco: 0,
  precoOriginal: null,
  estoque: 0,
  descricaoInformal: '',
  descricaoTecnica: '',
  especificacoes: {},
  tags: [],
  imagens: [''],
  datasheetUrl: '',
  destaque: false,
  ativo: true,
  freteGratis: false,
}

export function ProductForm({ categorias, inicial, modo }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProdutoFormData>({ ...VAZIO, ...inicial })
  const [specs, setSpecs] = useState<{ k: string; v: string }[]>(
    Object.entries(inicial?.especificacoes ?? {}).map(([k, v]) => ({ k, v: String(v) }))
  )
  const [tagsStr, setTagsStr] = useState((inicial?.tags ?? []).join(', '))

  const [uploading, setUploading] = useState(false)

  function set<K extends keyof ProdutoFormData>(key: K, value: ProdutoFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function uploadImagem(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const j = await res.json()
      if (!res.ok) throw new Error(j.erro || 'Falha no upload')
      setForm((f) => ({ ...f, imagens: [...f.imagens.filter(Boolean), j.url] }))
      toast('Imagem enviada!', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Falha no upload', 'error')
    } finally {
      setUploading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      preco: Number(form.preco),
      precoOriginal: form.precoOriginal ? Number(form.precoOriginal) : null,
      estoque: Number(form.estoque),
      datasheetUrl: form.datasheetUrl || null,
      imagens: form.imagens.map((i) => i.trim()).filter(Boolean),
      tags: tagsStr.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
      especificacoes: Object.fromEntries(specs.filter((s) => s.k.trim()).map((s) => [s.k.trim(), s.v])),
    }

    try {
      const url = modo === 'criar' ? '/api/admin/produtos' : `/api/admin/produtos/${form.id}`
      const res = await fetch(url, {
        method: modo === 'criar' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.erro || 'Erro ao salvar')
      }
      toast(modo === 'criar' ? 'Produto criado!' : 'Produto atualizado!', 'success')
      router.push('/admin/produtos')
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
    <form onSubmit={submit} className="space-y-5">
      <div className="surface-card p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Nome</label>
            <input className={input} value={form.nome} onChange={(e) => set('nome', e.target.value)} required />
          </div>
          <div>
            <label className={label}>SKU</label>
            <input className={input} value={form.sku} onChange={(e) => set('sku', e.target.value)} required />
          </div>
          <div>
            <label className={label}>Categoria</label>
            <select className={input} value={form.categoriaId} onChange={(e) => set('categoriaId', e.target.value)} required>
              <option value="">Selecione…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={label}>Preço</label>
              <input type="number" step="0.01" className={input} value={form.preco} onChange={(e) => set('preco', Number(e.target.value))} required />
            </div>
            <div>
              <label className={label}>Antigo</label>
              <input type="number" step="0.01" className={input} value={form.precoOriginal ?? ''} onChange={(e) => set('precoOriginal', e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className={label}>Estoque</label>
              <input type="number" className={input} value={form.estoque} onChange={(e) => set('estoque', Number(e.target.value))} required />
            </div>
          </div>
        </div>

        <div>
          <label className={label}>Descrição informal</label>
          <textarea className={input} rows={4} value={form.descricaoInformal} onChange={(e) => set('descricaoInformal', e.target.value)} required />
        </div>
        <div>
          <label className={label}>Descrição técnica</label>
          <textarea className={input} rows={2} value={form.descricaoTecnica} onChange={(e) => set('descricaoTecnica', e.target.value)} required />
        </div>
        <div>
          <label className={label}>Tags (separadas por vírgula)</label>
          <input className={input} value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="ARM, WiFi, IoT" />
        </div>
        <div>
          <label className={label}>Datasheet URL</label>
          <input className={input} value={form.datasheetUrl ?? ''} onChange={(e) => set('datasheetUrl', e.target.value)} />
        </div>
      </div>

      {/* Especificações */}
      <div className="surface-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display font-semibold">Especificações</h3>
          <button type="button" onClick={() => setSpecs((s) => [...s, { k: '', v: '' }])} className="btn-ghost text-xs">
            + Linha
          </button>
        </div>
        <div className="space-y-2">
          {specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input className={input} placeholder="Chave (ex: Clock)" value={s.k} onChange={(e) => setSpecs((arr) => arr.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} />
              <input className={input} placeholder="Valor (ex: 168 MHz)" value={s.v} onChange={(e) => setSpecs((arr) => arr.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} />
              <button type="button" onClick={() => setSpecs((arr) => arr.filter((_, j) => j !== i))} className="px-3 text-danger">✕</button>
            </div>
          ))}
          {specs.length === 0 && <p className="text-sm text-text-secondary">Nenhuma especificação. Clique em “+ Linha”.</p>}
        </div>
      </div>

      {/* Imagens */}
      <div className="surface-card p-5">
        <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-display font-semibold">Fotos do produto</h3>
            <p className="text-xs text-text-secondary">Envie arquivos (até 5MB) ou cole URLs. A 1ª imagem é a principal.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className={`btn-ghost text-xs cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploading ? 'Enviando…' : '⬆ Enviar foto'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) uploadImagem(f)
                  e.target.value = ''
                }}
              />
            </label>
            <button type="button" onClick={() => set('imagens', [...form.imagens, ''])} className="btn-ghost text-xs">+ URL</button>
          </div>
        </div>

        {/* Pré-visualização */}
        {form.imagens.filter(Boolean).length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {form.imagens.filter(Boolean).map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={img + i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-white/10">
                <img src={img} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-center text-[9px] font-bold text-primary-fg">
                    PRINCIPAL
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {form.imagens.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input className={input} placeholder="https://… ou /uploads/…" value={img} onChange={(e) => set('imagens', form.imagens.map((x, j) => (j === i ? e.target.value : x)))} />
              <button type="button" onClick={() => set('imagens', form.imagens.filter((_, j) => j !== i))} className="px-3 text-danger">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.destaque} onChange={(e) => set('destaque', e.target.checked)} />
          Destaque
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.ativo} onChange={(e) => set('ativo', e.target.checked)} />
          Ativo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.freteGratis} onChange={(e) => set('freteGratis', e.target.checked)} />
          🚚 Frete grátis
        </label>
        <button type="submit" disabled={saving} className="btn-primary ml-auto">
          {saving ? 'Salvando…' : modo === 'criar' ? 'Criar produto' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}
