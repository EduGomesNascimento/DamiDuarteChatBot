import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { obterProdutoPorSlug, listarProdutos } from '@/lib/data'
import { ProductDetail } from '@/components/produto/ProductDetail'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const produto = await obterProdutoPorSlug(params.slug).catch(() => null)
  if (!produto) return { title: 'Produto não encontrado — Atacado Eletrônica' }
  return {
    title: `${produto.nome} — Atacado Eletrônica`,
    description: produto.descricaoInformal.slice(0, 160),
    openGraph: {
      title: produto.nome,
      description: produto.descricaoInformal.slice(0, 160),
      images: produto.imagens[0] ? [{ url: produto.imagens[0] }] : [],
    },
  }
}

export default async function ProdutoPage({ params }: PageProps) {
  const produto = await obterProdutoPorSlug(params.slug)
  if (!produto) notFound()

  const relacionados = await listarProdutos({ categoria: produto.categoria.slug }).catch(() => [])
  const outrosProdutos = relacionados.filter((p) => p.id !== produto.id).slice(0, 4)

  return <ProductDetail produto={produto} relacionados={outrosProdutos} />
}
