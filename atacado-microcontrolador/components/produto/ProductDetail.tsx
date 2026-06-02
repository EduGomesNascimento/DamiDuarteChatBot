'use client'

import Link from 'next/link'
import { Gallery } from '@/components/produto/Gallery'
import { ProductTabs } from '@/components/produto/ProductTabs'
import { ProductCard } from '@/components/produto/ProductCard'
import { Reveal } from '@/components/ui/Reveal'
import { formatBRL } from '@/lib/utils'
import type { ProdutoDTO } from '@/lib/types'

interface Props {
  produto: ProdutoDTO
  relacionados: ProdutoDTO[]
}

export function ProductDetail({ produto, relacionados }: Props) {
  const temDesconto = produto.precoOriginal && produto.precoOriginal > produto.preco
  const descPct = temDesconto
    ? Math.round((1 - produto.preco / produto.precoOriginal!) * 100)
    : 0

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="max-w-screen-xl mx-auto px-4 pt-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-text-secondary mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Início</Link>
          <span>/</span>
          <Link href="/catalogo" className="hover:text-primary transition-colors">Catálogo</Link>
          <span>/</span>
          <Link
            href={`/catalogo?categoria=${produto.categoria.slug}`}
            className="hover:text-primary transition-colors"
          >
            {produto.categoria.nome}
          </Link>
          <span>/</span>
          <span className="text-text-primary truncate max-w-[200px]">{produto.nome}</span>
        </nav>

        {/* Main content: gallery + info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
          {/* Gallery */}
          <div>
            <Reveal delay={0}>
              <Gallery imagens={produto.imagens} nome={produto.nome} />
            </Reveal>
          </div>

          {/* Product info + tabs */}
          <Reveal delay={80}>
            <div className="flex flex-col gap-5 h-full">
              {/* Header */}
              <div>
                {/* Category + tags */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Link
                    href={`/catalogo?categoria=${produto.categoria.slug}`}
                    className="badge bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 transition-colors"
                  >
                    {produto.categoria.icone && (
                      <span>{produto.categoria.icone}</span>
                    )}
                    {produto.categoria.nome}
                  </Link>
                  {produto.destaque && (
                    <span className="badge bg-primary/15 text-primary border border-primary/30">
                      ⭐ Destaque
                    </span>
                  )}
                  {temDesconto && (
                    <span className="badge bg-danger/20 text-danger border border-danger/30">
                      -{descPct}% OFF
                    </span>
                  )}
                </div>

                {/* Nome */}
                <h1 className="font-display text-2xl lg:text-3xl font-bold text-text-primary leading-tight mb-2">
                  {produto.nome}
                </h1>

                {/* SKU */}
                <p className="text-xs font-mono text-text-secondary">
                  SKU: <span className="text-text-primary">{produto.sku}</span>
                </p>
              </div>

              {/* Price summary (quick glance) */}
              <div className="surface-card p-4 flex items-end justify-between gap-4">
                <div>
                  {temDesconto && (
                    <p className="text-sm text-text-secondary line-through font-mono">
                      {formatBRL(produto.precoOriginal!)}
                    </p>
                  )}
                  <p className="font-display text-3xl font-bold text-primary text-glow">
                    {formatBRL(produto.preco)}
                  </p>
                  <p className="text-xs text-text-secondary font-mono mt-1">
                    Em até 5–9 un. com 5% OFF · 20+ un. com 15% OFF
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-success">✓ Atacado disponível</p>
                  <p className="text-xs font-mono text-text-secondary">desde 5 unidades</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex-1">
                <ProductTabs produto={produto} />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Produtos relacionados */}
        {relacionados.length > 0 && (
          <section>
            <Reveal>
              <h2 className="font-display text-xl font-bold text-text-primary mb-6">
                Produtos <span className="text-primary text-glow">Relacionados</span>
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relacionados.map((rel, i) => (
                <Reveal key={rel.id} delay={i * 60}>
                  <ProductCard produto={rel} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
