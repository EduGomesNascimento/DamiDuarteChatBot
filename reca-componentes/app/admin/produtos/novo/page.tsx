import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export default async function NovoProdutoPage() {
  let categorias: { id: string; nome: string }[] = []
  try {
    categorias = await prisma.categoria.findMany({ select: { id: true, nome: true }, orderBy: { nome: 'asc' } })
  } catch {
    categorias = []
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/produtos" className="text-sm text-primary hover:underline">← Voltar</Link>
        <h2 className="font-display text-xl font-bold">Novo produto</h2>
      </div>
      <ProductForm categorias={categorias} modo="criar" />
    </div>
  )
}
