'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatBRL } from '@/lib/utils'
import { StockBar } from '@/components/ui/StockBar'
import { useCart } from '@/components/providers/CartProvider'
import { useToast } from '@/components/providers/ToastProvider'
import type { ProdutoDTO } from '@/lib/types'

export function ProductCard({ produto }: { produto: ProdutoDTO }) {
  const { adicionar } = useCart()
  const { toast } = useToast()
  const semEstoque = produto.estoque <= 0
  const temDesconto = produto.precoOriginal && produto.precoOriginal > produto.preco

  function add(e: React.MouseEvent) {
    e.preventDefault()
    adicionar({
      produtoId: produto.id,
      slug: produto.slug,
      nome: produto.nome,
      sku: produto.sku,
      preco: produto.preco,
      imagem: produto.imagens[0] || '',
      estoque: produto.estoque,
    })
    toast(`${produto.nome} adicionado ao carrinho`, 'success')
  }

  return (
    <Link href={`/produto/${produto.slug}`} className="group block">
      <article className="tilt surface-card overflow-hidden h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-surface-2">
          <Image
            src={produto.imagens[0] || 'https://picsum.photos/seed/chip/800/800'}
            alt={produto.nome}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {produto.destaque && (
              <span className="badge bg-secondary/20 text-secondary border border-secondary/30">
                ⭐ Destaque
              </span>
            )}
            {temDesconto && (
              <span className="badge bg-danger/20 text-danger border border-danger/30">
                -{Math.round((1 - produto.preco / produto.precoOriginal!) * 100)}%
              </span>
            )}
            {produto.freteGratis && (
              <span className="badge bg-success/20 text-success border border-success/30">
                🚚 Frete grátis
              </span>
            )}
          </div>
          <span className="absolute right-2 top-2 badge bg-bg/80 text-text-secondary border border-white/10">
            {produto.sku}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {produto.tags.slice(0, 3).map((t) => (
              <span key={t.slug} className="text-[10px] font-mono text-primary/70">
                #{t.nome}
              </span>
            ))}
          </div>

          <h3 className="font-display font-semibold leading-tight group-hover:text-primary transition-colors">
            {produto.nome}
          </h3>

          <div className="mt-auto space-y-3">
            <StockBar estoque={produto.estoque} />
            <div className="flex items-end justify-between gap-2">
              <div>
                {temDesconto && (
                  <span className="block text-xs text-text-secondary line-through">
                    {formatBRL(produto.precoOriginal!)}
                  </span>
                )}
                <span className="font-display text-xl font-bold text-text-primary">
                  {formatBRL(produto.preco)}
                </span>
              </div>
              <button
                onClick={add}
                disabled={semEstoque}
                aria-label="Adicionar ao carrinho"
                className="rounded-xl bg-primary/15 text-primary px-3 py-2 text-sm font-semibold transition-all hover:bg-primary hover:text-primary-fg hover:shadow-glow disabled:opacity-40 disabled:hover:bg-primary/15 disabled:hover:text-primary"
              >
                {semEstoque ? '—' : '+ Carrinho'}
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
