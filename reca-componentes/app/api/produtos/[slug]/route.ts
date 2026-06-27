import { NextRequest } from 'next/server'
import { obterProdutoPorSlug } from '@/lib/data'
import { ok, erro } from '@/lib/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const produto = await obterProdutoPorSlug(params.slug)
    if (!produto) return erro('Produto não encontrado', 404)
    return ok(produto)
  } catch (e) {
    console.error(e)
    return erro('Erro ao buscar produto', 500)
  }
}
