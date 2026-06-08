'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ProductCard } from '@/components/produto/ProductCard'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'
import type { ProdutoDTO, CategoriaDTO } from '@/lib/types'
import type { FiltrosCatalogo } from '@/lib/data'

interface Props {
  produtos: ProdutoDTO[]
  categorias: CategoriaDTO[]
  tags: { nome: string; slug: string }[]
  filtrosIniciais: FiltrosCatalogo
}

const ORDENAR_OPCOES = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
  { value: 'novidades', label: 'Novidades' },
  { value: 'mais-vendidos', label: 'Mais vendidos' },
]

function buildSearch(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v)
  }
  return sp.toString() ? `?${sp.toString()}` : ''
}

export function CatalogClient({ produtos, categorias, tags, filtrosIniciais }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Filter state (derived from URL, managed locally before pushing)
  const [categoria, setCategoria] = useState(filtrosIniciais.categoria ?? '')
  const [tagsAtivas, setTagsAtivas] = useState<string[]>(filtrosIniciais.tags ?? [])
  const [precoMin, setPrecoMin] = useState(filtrosIniciais.precoMin?.toString() ?? '')
  const [precoMax, setPrecoMax] = useState(filtrosIniciais.precoMax?.toString() ?? '')
  const [emEstoque, setEmEstoque] = useState(filtrosIniciais.emEstoque ?? false)
  const [ordenar, setOrdenar] = useState(filtrosIniciais.ordenar ?? '')
  const [busca, setBusca] = useState(filtrosIniciais.busca ?? '')
  const [buscaInput, setBuscaInput] = useState(filtrosIniciais.busca ?? '')
  const [showSugestoes, setShowSugestoes] = useState(false)
  const [drawerAberto, setDrawerAberto] = useState(false)

  const buscaRef = useRef<HTMLInputElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Sugestões de autocomplete
  const sugestoes = buscaInput.trim().length >= 2
    ? produtos
        .filter((p) => {
          const q = buscaInput.toLowerCase()
          return (
            p.nome.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.tags.some((t) => t.nome.toLowerCase().includes(q))
          )
        })
        .slice(0, 6)
    : []

  const aplicarFiltros = useCallback(
    (overrides: Partial<{
      categoria: string
      tagsAtivas: string[]
      precoMin: string
      precoMax: string
      emEstoque: boolean
      ordenar: string
      busca: string
    }> = {}) => {
      const cat = overrides.categoria !== undefined ? overrides.categoria : categoria
      const tgs = overrides.tagsAtivas !== undefined ? overrides.tagsAtivas : tagsAtivas
      const pMin = overrides.precoMin !== undefined ? overrides.precoMin : precoMin
      const pMax = overrides.precoMax !== undefined ? overrides.precoMax : precoMax
      const stock = overrides.emEstoque !== undefined ? overrides.emEstoque : emEstoque
      const ord = overrides.ordenar !== undefined ? overrides.ordenar : ordenar
      const bsc = overrides.busca !== undefined ? overrides.busca : busca

      const params: Record<string, string | undefined> = {
        categoria: cat || undefined,
        tags: tgs.length > 0 ? tgs.join(',') : undefined,
        precoMin: pMin || undefined,
        precoMax: pMax || undefined,
        emEstoque: stock ? 'true' : undefined,
        ordenar: ord || undefined,
        busca: bsc || undefined,
      }

      router.push(pathname + buildSearch(params))
    },
    [categoria, tagsAtivas, precoMin, precoMax, emEstoque, ordenar, busca, router, pathname]
  )

  function handleCategoriaChange(slug: string) {
    const nova = slug === categoria ? '' : slug
    setCategoria(nova)
    aplicarFiltros({ categoria: nova })
  }

  function handleTagToggle(slug: string) {
    const novas = tagsAtivas.includes(slug)
      ? tagsAtivas.filter((t) => t !== slug)
      : [...tagsAtivas, slug]
    setTagsAtivas(novas)
    aplicarFiltros({ tagsAtivas: novas })
  }

  function handleEmEstoqueToggle() {
    const novo = !emEstoque
    setEmEstoque(novo)
    aplicarFiltros({ emEstoque: novo })
  }

  function handleOrdenarChange(val: string) {
    setOrdenar(val)
    aplicarFiltros({ ordenar: val })
  }

  function handlePrecoChange() {
    aplicarFiltros({})
  }

  function handleBuscaSubmit(e: React.FormEvent) {
    e.preventDefault()
    const val = buscaInput.trim()
    setBusca(val)
    setShowSugestoes(false)
    aplicarFiltros({ busca: val })
  }

  function limparFiltros() {
    setCategoria('')
    setTagsAtivas([])
    setPrecoMin('')
    setPrecoMax('')
    setEmEstoque(false)
    setOrdenar('')
    setBusca('')
    setBuscaInput('')
    router.push(pathname)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (buscaRef.current && !buscaRef.current.parentElement?.contains(e.target as Node)) {
        setShowSugestoes(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const temFiltros =
    categoria || tagsAtivas.length > 0 || precoMin || precoMax || emEstoque || ordenar || busca

  const Sidebar = (
    <aside className="space-y-6">
      {/* Categoria */}
      <div>
        <h3 className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">
          Categoria
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => handleCategoriaChange('')}
            className={cn(
              'w-full text-left rounded-lg px-3 py-2 text-sm transition-all',
              !categoria
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            )}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoriaChange(cat.slug)}
              className={cn(
                'w-full text-left rounded-lg px-3 py-2 text-sm transition-all flex items-center justify-between gap-2',
                categoria === cat.slug
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              <span className="flex items-center gap-2">
                {cat.icone && <span>{cat.icone}</span>}
                {cat.nome}
              </span>
              {cat.totalProdutos !== undefined && (
                <span className="text-xs font-mono opacity-50">{cat.totalProdutos}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preço */}
      <div>
        <h3 className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">
          Faixa de Preço
        </h3>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className="text-xs text-text-secondary font-mono">Mín</label>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="R$ 0"
              value={precoMin}
              onChange={(e) => setPrecoMin(e.target.value)}
              onBlur={handlePrecoChange}
              onKeyDown={(e) => e.key === 'Enter' && handlePrecoChange()}
              className="mt-1 w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-secondary focus:border-primary/60 focus:outline-none"
            />
          </div>
          <span className="text-text-secondary pt-5">–</span>
          <div className="flex-1">
            <label className="text-xs text-text-secondary font-mono">Máx</label>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="R$ ∞"
              value={precoMax}
              onChange={(e) => setPrecoMax(e.target.value)}
              onBlur={handlePrecoChange}
              onKeyDown={(e) => e.key === 'Enter' && handlePrecoChange()}
              className="mt-1 w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-secondary focus:border-primary/60 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <h3 className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">
            Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag.slug}
                onClick={() => handleTagToggle(tag.slug)}
                className={cn(
                  'badge border transition-all cursor-pointer text-xs',
                  tagsAtivas.includes(tag.slug)
                    ? 'bg-primary/15 text-primary border-primary/40 shadow-glow'
                    : 'bg-surface-2 text-text-secondary border-white/10 hover:border-primary/30 hover:text-primary'
                )}
              >
                #{tag.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Em estoque */}
      <div>
        <button
          onClick={handleEmEstoqueToggle}
          className="flex items-center gap-3 w-full group"
        >
          <div
            className={cn(
              'w-10 h-5 rounded-full relative transition-all duration-200',
              emEstoque ? 'bg-primary' : 'bg-surface-2 border border-white/10'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow',
                emEstoque ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </div>
          <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
            Em estoque apenas
          </span>
        </button>
      </div>

      {/* Ordenar */}
      <div>
        <h3 className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-3">
          Ordenar por
        </h3>
        <select
          value={ordenar}
          onChange={(e) => handleOrdenarChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-text-primary focus:border-primary/60 focus:outline-none"
        >
          {ORDENAR_OPCOES.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {/* Limpar filtros */}
      {temFiltros && (
        <button
          onClick={limparFiltros}
          className="w-full text-xs font-mono text-danger/70 hover:text-danger underline underline-offset-4 transition-colors"
        >
          Limpar todos os filtros
        </button>
      )}
    </aside>
  )

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="max-w-screen-xl mx-auto px-4 pt-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-text-primary mb-1">
            Catálogo{' '}
            <span className="text-primary text-glow">
              {categoria
                ? categorias.find((c) => c.slug === categoria)?.nome ?? ''
                : ''}
            </span>
          </h1>
          <p className="text-text-secondary text-sm">
            {produtos.length === 0
              ? 'Nenhum produto encontrado para os filtros selecionados.'
              : `${produtos.length} produto${produtos.length !== 1 ? 's' : ''} encontrado${produtos.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Barra de busca + Filtros mobile */}
        <div className="mb-6 flex gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1">
            <form onSubmit={handleBuscaSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={buscaRef}
                  type="text"
                  placeholder="Buscar por nome, SKU ou tag..."
                  value={buscaInput}
                  onChange={(e) => {
                    setBuscaInput(e.target.value)
                    setShowSugestoes(true)
                  }}
                  onFocus={() => setShowSugestoes(true)}
                  className="w-full rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                {/* Autocomplete dropdown */}
                {showSugestoes && sugestoes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-40 surface-card border border-white/10 rounded-xl overflow-hidden shadow-glow">
                    {sugestoes.map((p) => (
                      <a
                        key={p.slug}
                        href={`/produto/${p.slug}`}
                        onClick={() => setShowSugestoes(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                      >
                        <span className="text-xs font-mono text-text-secondary">{p.sku}</span>
                        <span className="text-sm text-text-primary truncate">{p.nome}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setDrawerAberto(true)}
            className="lg:hidden btn-ghost px-3 py-2.5 text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M11 20h2" />
            </svg>
            Filtros
            {temFiltros && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            )}
          </button>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="flex gap-8">
          {/* Sidebar desktop */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            {Sidebar}
          </div>

          {/* Produtos grid */}
          <div className="flex-1 min-w-0">
            {produtos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🔭</div>
                <h2 className="font-display text-xl font-bold text-text-primary mb-2">
                  Nenhum produto encontrado
                </h2>
                <p className="text-text-secondary text-sm mb-6 max-w-xs">
                  Tente ajustar os filtros ou ampliar sua busca.
                </p>
                <button onClick={limparFiltros} className="btn-ghost text-sm px-4 py-2">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {produtos.map((produto, i) => (
                  <Reveal key={produto.id} delay={Math.min(i * 40, 300)}>
                    <ProductCard produto={produto} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerAberto && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerAberto(false)}
          />
          <div
            ref={drawerRef}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-white/5 overflow-y-auto p-6 shadow-glow"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-text-primary">Filtros</h2>
              <button
                onClick={() => setDrawerAberto(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Fechar filtros"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {Sidebar}
          </div>
        </>
      )}
    </div>
  )
}
