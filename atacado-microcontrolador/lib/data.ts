import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'
import type { ProdutoDTO, CategoriaDTO } from './types'

type ProdutoComRel = Prisma.ProdutoGetPayload<{
  include: { categoria: true; tags: { include: { tag: true } } }
}>

export function serializarProduto(p: ProdutoComRel): ProdutoDTO {
  return {
    id: p.id,
    nome: p.nome,
    slug: p.slug,
    sku: p.sku,
    descricaoInformal: p.descricaoInformal,
    descricaoTecnica: p.descricaoTecnica,
    especificacoes: (p.especificacoes as Record<string, string>) ?? {},
    preco: Number(p.preco),
    precoOriginal: p.precoOriginal ? Number(p.precoOriginal) : null,
    estoque: p.estoque,
    imagens: p.imagens,
    datasheetUrl: p.datasheetUrl,
    recursosUrls: (p.recursosUrls as Record<string, string> | null) ?? null,
    pesoGramas: p.pesoGramas,
    destaque: p.destaque,
    categoria: {
      id: p.categoria.id,
      nome: p.categoria.nome,
      slug: p.categoria.slug,
      icone: p.categoria.icone,
    },
    tags: p.tags.map((t) => ({ nome: t.tag.nome, slug: t.tag.slug })),
  }
}

const includeRel = {
  categoria: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ProdutoInclude

export interface FiltrosCatalogo {
  categoria?: string
  tags?: string[]
  precoMin?: number
  precoMax?: number
  emEstoque?: boolean
  busca?: string
  ordenar?: 'relevancia' | 'menor-preco' | 'maior-preco' | 'novidades' | 'mais-vendidos'
}

export async function listarProdutos(filtros: FiltrosCatalogo = {}): Promise<ProdutoDTO[]> {
  const where: Prisma.ProdutoWhereInput = { ativo: true }

  if (filtros.categoria) where.categoria = { slug: filtros.categoria }
  if (filtros.emEstoque) where.estoque = { gt: 0 }
  if (filtros.precoMin !== undefined || filtros.precoMax !== undefined) {
    where.preco = {}
    if (filtros.precoMin !== undefined) where.preco.gte = filtros.precoMin
    if (filtros.precoMax !== undefined) where.preco.lte = filtros.precoMax
  }
  if (filtros.tags && filtros.tags.length > 0) {
    where.tags = { some: { tag: { slug: { in: filtros.tags } } } }
  }
  if (filtros.busca) {
    const q = filtros.busca
    where.OR = [
      { nome: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { descricaoTecnica: { contains: q, mode: 'insensitive' } },
      { tags: { some: { tag: { nome: { contains: q, mode: 'insensitive' } } } } },
    ]
  }

  let orderBy: Prisma.ProdutoOrderByWithRelationInput = { criadoEm: 'desc' }
  switch (filtros.ordenar) {
    case 'menor-preco':
      orderBy = { preco: 'asc' }
      break
    case 'maior-preco':
      orderBy = { preco: 'desc' }
      break
    case 'novidades':
      orderBy = { criadoEm: 'desc' }
      break
    case 'relevancia':
      orderBy = { destaque: 'desc' }
      break
  }

  const produtos = await prisma.produto.findMany({ where, include: includeRel, orderBy })
  return produtos.map(serializarProduto)
}

export async function obterProdutoPorSlug(slug: string): Promise<ProdutoDTO | null> {
  const p = await prisma.produto.findUnique({ where: { slug }, include: includeRel })
  return p ? serializarProduto(p) : null
}

export async function listarDestaques(limite = 8): Promise<ProdutoDTO[]> {
  const produtos = await prisma.produto.findMany({
    where: { ativo: true, destaque: true },
    include: includeRel,
    take: limite,
    orderBy: { criadoEm: 'desc' },
  })
  return produtos.map(serializarProduto)
}

export async function listarCategorias(): Promise<CategoriaDTO[]> {
  const cats = await prisma.categoria.findMany({
    include: { _count: { select: { produtos: true } } },
    orderBy: { nome: 'asc' },
  })
  return cats.map((c) => ({
    id: c.id,
    nome: c.nome,
    slug: c.slug,
    icone: c.icone,
    totalProdutos: c._count.produtos,
  }))
}

export async function listarTags(): Promise<{ nome: string; slug: string }[]> {
  const tags = await prisma.tag.findMany({ orderBy: { nome: 'asc' } })
  return tags.map((t) => ({ nome: t.nome, slug: t.slug }))
}

export async function estatisticas() {
  const [produtos, pedidos, clientes] = await Promise.all([
    prisma.produto.count({ where: { ativo: true } }),
    prisma.pedido.count(),
    prisma.usuario.count({ where: { role: 'CLIENTE' } }),
  ])
  // Base "social proof" para os contadores animados.
  return {
    produtos,
    pedidos: pedidos + 4721,
    clientes: clientes + 1280,
  }
}
