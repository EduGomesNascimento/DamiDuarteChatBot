import { comAuth, ok, erro } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { produtoSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

export async function POST(request: Request) {
  return comAuth(async () => {
    const body = await request.json()
    const parsed = produtoSchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400)
    }

    const data = parsed.data

    // Generate unique slug
    const baseSlug = slugify(data.nome)
    let slug = baseSlug
    let suffix = 2
    while (await prisma.produto.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`
    }

    // Upsert tags and collect their IDs
    const tagIds: string[] = []
    for (const tagNome of data.tags) {
      const tagSlug = slugify(tagNome)
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: { nome: tagNome },
        create: { nome: tagNome, slug: tagSlug },
      })
      tagIds.push(tag.id)
    }

    const { Prisma } = await import('@prisma/client')

    const produto = await prisma.produto.create({
      data: {
        nome: data.nome,
        slug,
        sku: data.sku,
        descricaoInformal: data.descricaoInformal,
        descricaoTecnica: data.descricaoTecnica,
        especificacoes: data.especificacoes,
        preco: new Prisma.Decimal(data.preco),
        precoOriginal: data.precoOriginal != null ? new Prisma.Decimal(data.precoOriginal) : null,
        estoque: data.estoque,
        imagens: data.imagens,
        datasheetUrl: data.datasheetUrl ?? null,
        categoriaId: data.categoriaId,
        destaque: data.destaque ?? false,
        ativo: data.ativo ?? true,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: { categoria: true, tags: { include: { tag: true } } },
    })

    return ok(produto, { status: 201 })
  }, { admin: true })
}

export async function GET() {
  return comAuth(async () => {
    const produtos = await prisma.produto.findMany({
      include: { categoria: true, tags: { include: { tag: true } } },
      orderBy: { criadoEm: 'desc' },
    })
    return ok(produtos)
  }, { admin: true })
}
