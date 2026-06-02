import { comAuth, ok, erro } from '@/lib/api'
import { prisma } from '@/lib/prisma'
import { produtoSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

interface RouteParams {
  params: { id: string }
}

export async function PUT(request: Request, { params }: RouteParams) {
  return comAuth(async () => {
    const { id } = params
    const existing = await prisma.produto.findUnique({ where: { id } })
    if (!existing) return erro('Produto não encontrado', 404)

    const body = await request.json()
    const parsed = produtoSchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0]?.message ?? 'Dados inválidos', 400)
    }

    const data = parsed.data

    // Regenerate slug only if name changed
    let slug = existing.slug
    if (data.nome !== existing.nome) {
      const baseSlug = slugify(data.nome)
      slug = baseSlug
      let suffix = 2
      while (true) {
        const conflict = await prisma.produto.findUnique({ where: { slug } })
        if (!conflict || conflict.id === id) break
        slug = `${baseSlug}-${suffix++}`
      }
    }

    // Upsert tags
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

    // Re-sync tags: delete all then recreate
    await prisma.produtoTag.deleteMany({ where: { produtoId: id } })

    const produto = await prisma.produto.update({
      where: { id },
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

    return ok(produto)
  }, { admin: true })
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  return comAuth(async () => {
    const { id } = params
    const existing = await prisma.produto.findUnique({ where: { id } })
    if (!existing) return erro('Produto não encontrado', 404)

    // Soft delete to preserve FK references in ItemPedido
    await prisma.produto.update({ where: { id }, data: { ativo: false } })
    return ok({ ok: true, message: 'Produto desativado' })
  }, { admin: true })
}

const patchSchema = z.object({
  ativo: z.boolean().optional(),
  destaque: z.boolean().optional(),
})

export async function PATCH(request: Request, { params }: RouteParams) {
  return comAuth(async () => {
    const { id } = params
    const existing = await prisma.produto.findUnique({ where: { id } })
    if (!existing) return erro('Produto não encontrado', 404)

    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return erro('Dados inválidos', 400)

    const produto = await prisma.produto.update({
      where: { id },
      data: parsed.data,
    })

    return ok(produto)
  }, { admin: true })
}

export async function GET(_request: Request, { params }: RouteParams) {
  return comAuth(async () => {
    const { id } = params
    const produto = await prisma.produto.findUnique({
      where: { id },
      include: { categoria: true, tags: { include: { tag: true } } },
    })
    if (!produto) return erro('Produto não encontrado', 404)
    return ok(produto)
  }, { admin: true })
}
