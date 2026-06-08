import { NextRequest } from 'next/server'
import { listarProdutos } from '@/lib/data'
import { ok, erro } from '@/lib/api'
import type { FiltrosCatalogo } from '@/lib/data'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const filtros: FiltrosCatalogo = {}

    const categoria = searchParams.get('categoria')
    if (categoria) filtros.categoria = categoria

    const tagsParam = searchParams.get('tags')
    if (tagsParam) filtros.tags = tagsParam.split(',').filter(Boolean)

    const precoMin = searchParams.get('precoMin')
    if (precoMin) filtros.precoMin = parseFloat(precoMin)

    const precoMax = searchParams.get('precoMax')
    if (precoMax) filtros.precoMax = parseFloat(precoMax)

    const emEstoque = searchParams.get('emEstoque')
    if (emEstoque === 'true') filtros.emEstoque = true

    const busca = searchParams.get('busca')
    if (busca) filtros.busca = busca

    const ordenar = searchParams.get('ordenar')
    if (
      ordenar &&
      ['relevancia', 'menor-preco', 'maior-preco', 'novidades', 'mais-vendidos'].includes(ordenar)
    ) {
      filtros.ordenar = ordenar as FiltrosCatalogo['ordenar']
    }

    const produtos = await listarProdutos(filtros)
    return ok(produtos)
  } catch (e) {
    console.error(e)
    return erro('Erro ao buscar produtos', 500)
  }
}
