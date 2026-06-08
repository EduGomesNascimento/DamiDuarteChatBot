import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductsTable } from '@/components/admin/ProductsTable'

export const dynamic = 'force-dynamic'

export default async function AdminProdutosPage() {
  let produtos: {
    id: string
    nome: string
    sku: string
    preco: number
    estoque: number
    ativo: boolean
    destaque: boolean
    imagens: string[]
  }[] = []

  try {
    const rows = await prisma.produto.findMany({ orderBy: { criadoEm: 'desc' } })
    produtos = rows.map((p) => ({
      id: p.id,
      nome: p.nome,
      sku: p.sku,
      preco: Number(p.preco),
      estoque: p.estoque,
      ativo: p.ativo,
      destaque: p.destaque,
      imagens: p.imagens,
    }))
  } catch {
    produtos = []
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Produtos</h2>
        <Link href="/admin/produtos/novo" className="btn-primary text-sm">
          + Novo produto
        </Link>
      </div>
      <div className="surface-card p-2">
        <ProductsTable produtos={produtos} />
      </div>
    </div>
  )
}
