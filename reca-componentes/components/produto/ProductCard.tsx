'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatBRL } from '@/lib/utils'
import { useCart } from '@/components/providers/CartProvider'
import { useToast } from '@/components/providers/ToastProvider'
import type { ProdutoDTO } from '@/lib/types'

/** Deriva um rating pseudo-estável (4–5 estrelas) e contagem de avaliações a partir do id. */
function pseudoRating(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  const estrelas = 4 + (hash % 21) / 20 // 4.0 a 5.0
  const avaliacoes = 8 + (hash % 480)
  return { estrelas: Math.round(estrelas * 2) / 2, avaliacoes }
}

function Stars({ value }: { value: number }) {
  const full = Math.floor(value)
  const half = value - full >= 0.5
  return (
    <span className="inline-flex items-center text-primary" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-sm leading-none">
          {i < full ? '★' : i === full && half ? '★' : '☆'}
        </span>
      ))}
    </span>
  )
}

export function ProductCard({ produto }: { produto: ProdutoDTO }) {
  const { adicionar } = useCart()
  const { toast } = useToast()
  const semEstoque = produto.estoque <= 0
  const temDesconto = produto.precoOriginal && produto.precoOriginal > produto.preco
  const { estrelas, avaliacoes } = pseudoRating(produto.id)

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
    <Link href={`/produto/${produto.slug}`} className="group block h-full">
      <article className="tilt surface-card overflow-hidden h-full flex flex-col p-3">
        <div className="relative aspect-square overflow-hidden bg-white">
          <Image
            src={produto.imagens[0] || 'https://picsum.photos/seed/chip/800/800'}
            alt={produto.nome}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute left-1 top-1 flex flex-col gap-1">
            {produto.destaque && (
              <span className="badge bg-secondary/10 text-secondary border border-secondary/20">
                Destaque
              </span>
            )}
            {temDesconto && (
              <span className="badge bg-danger/10 text-danger border border-danger/20">
                -{Math.round((1 - produto.preco / produto.precoOriginal!) * 100)}%
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-1.5 pt-3">
          <h3 className="text-sm leading-tight text-primary group-hover:underline line-clamp-2 min-h-[2.5rem]">
            {produto.nome}
          </h3>

          <div className="flex items-center gap-1.5">
            <Stars value={estrelas} />
            <span className="text-xs text-primary">{avaliacoes}</span>
          </div>

          <div className="mt-1">
            {temDesconto && (
              <span className="block text-xs text-text-secondary line-through">
                {formatBRL(produto.precoOriginal!)}
              </span>
            )}
            <span className="text-xl font-bold text-danger">
              {formatBRL(produto.preco)}
            </span>
          </div>

          {produto.freteGratis && (
            <span className="text-[11px] text-text-secondary">
              <span className="font-semibold text-text-primary">Frete GRÁTIS</span> em pedidos elegíveis
            </span>
          )}

          <div className="mt-auto pt-2">
            <button
              onClick={add}
              disabled={semEstoque}
              aria-label="Adicionar ao carrinho"
              className="btn-primary w-full disabled:bg-line disabled:border-line"
            >
              {semEstoque ? 'Esgotado' : 'Adicionar ao carrinho'}
            </button>
          </div>
        </div>
      </article>
    </Link>
  )
}
