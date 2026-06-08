import { NextRequest } from 'next/server'
import { ok, erro } from '@/lib/api'

export async function GET(
  _req: NextRequest,
  { params }: { params: { cep: string } }
) {
  const cep = params.cep.replace(/\D/g, '')

  if (cep.length !== 8) {
    return erro('CEP inválido', 400)
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      next: { revalidate: 86400 }, // cache 1 dia
    })

    if (!res.ok) {
      return erro('Erro ao consultar CEP', 502)
    }

    const data = await res.json()

    if (data.erro) {
      return erro('CEP não encontrado', 404)
    }

    return ok(data)
  } catch (e) {
    console.error('[cep] erro:', e)
    return erro('Erro ao consultar CEP', 502)
  }
}
