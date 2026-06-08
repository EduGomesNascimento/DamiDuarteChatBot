import { NextRequest } from 'next/server'
import { calcularFrete } from '@/lib/shipping'
import { ok, erro } from '@/lib/api'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cep, pesoGramas } = body

    if (!cep || typeof cep !== 'string') {
      return erro('CEP inválido', 400)
    }

    const cepDigits = cep.replace(/\D/g, '')
    if (cepDigits.length !== 8) {
      return erro('CEP inválido', 400)
    }

    const opcoes = calcularFrete(cepDigits, pesoGramas ?? 200)
    return ok({ opcoes })
  } catch (e) {
    console.error(e)
    return erro('Erro ao calcular frete', 500)
  }
}
