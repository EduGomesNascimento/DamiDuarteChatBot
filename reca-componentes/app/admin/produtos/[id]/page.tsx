import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductForm, type ProdutoFormData } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const produto = await prisma.produto
    .findUnique({
      where: { id: params.id },
      include: { tags: { include: { tag: true } } },
    })
    .catch(() => null)

  if (!produto) notFound()

  const categorias = await prisma.categoria
    .findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } })
    .catch(() => [] as { id: string; nome: string }[])

  const inicial: Partial<ProdutoFormData> = {
    id: produto.id,
    nome: produto.nome,
    sku: produto.sku,
    categoriaId: produto.categoriaId,
    preco: Number(produto.preco),
    precoOriginal: produto.precoOriginal ? Number(produto.precoOriginal) : null,
    estoque: produto.estoque,
    descricaoInformal: produto.descricaoInformal,
    descricaoTecnica: produto.descricaoTecnica,
    especificacoes: (produto.especificacoes as Record<string, string>) ?? {},
    tags: produto.tags.map((t) => t.tag.nome),
    imagens: produto.imagens.length ? produto.imagens : [''],
    datasheetUrl: produto.datasheetUrl ?? '',
    destaque: produto.destaque,
    ativo: produto.ativo,
    freteGratis: produto.freteGratis,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/produtos" className="text-sm text-primary hover:underline">← Voltar</Link>
        <h2 className="font-display text-xl font-bold">Editar: {produto.nome}</h2>
      </div>
      <ProductForm categorias={categorias} inicial={inicial} modo="editar" />
    </div>
  )
}
