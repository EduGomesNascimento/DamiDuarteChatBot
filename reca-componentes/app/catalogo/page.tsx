import { listarProdutos, listarCategorias, listarTags } from '@/lib/data'
import type { FiltrosCatalogo } from '@/lib/data'
import { CatalogClient } from '@/components/catalogo/CatalogClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Catálogo — Atacado Eletrônica',
  description: 'Explore nossa linha completa de microcontroladores, módulos e componentes eletrônicos.',
}

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

function sp(v: string | string[] | undefined): string | undefined {
  if (!v) return undefined
  return Array.isArray(v) ? v[0] : v
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const filtros: FiltrosCatalogo = {}

  const categoria = sp(searchParams.categoria)
  if (categoria) filtros.categoria = categoria

  const tagsParam = sp(searchParams.tags)
  if (tagsParam) filtros.tags = tagsParam.split(',').filter(Boolean)

  const precoMin = sp(searchParams.precoMin)
  if (precoMin) filtros.precoMin = parseFloat(precoMin)

  const precoMax = sp(searchParams.precoMax)
  if (precoMax) filtros.precoMax = parseFloat(precoMax)

  const emEstoque = sp(searchParams.emEstoque)
  if (emEstoque === 'true') filtros.emEstoque = true

  const busca = sp(searchParams.busca)
  if (busca) filtros.busca = busca

  const ordenar = sp(searchParams.ordenar) as FiltrosCatalogo['ordenar']
  if (
    ordenar &&
    ['relevancia', 'menor-preco', 'maior-preco', 'novidades', 'mais-vendidos'].includes(ordenar)
  ) {
    filtros.ordenar = ordenar
  }

  const [produtos, categorias, tags] = await Promise.all([
    listarProdutos(filtros).catch(() => []),
    listarCategorias().catch(() => []),
    listarTags().catch(() => []),
  ])

  return (
    <CatalogClient
      produtos={produtos}
      categorias={categorias}
      tags={tags}
      filtrosIniciais={filtros}
    />
  )
}
