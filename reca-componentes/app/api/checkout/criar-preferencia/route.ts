import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { ok, erro, comAuth } from '@/lib/api'
import { checkoutSchema } from '@/lib/validations'
import { criarPreferencia } from '@/lib/mercadopago'
import { precoComDesconto, gerarNumeroPedido } from '@/lib/utils'
import { getConfig, freteGratisAplicavel } from '@/lib/config'
import type { AuthPayload } from '@/lib/auth'

export async function POST(req: NextRequest) {
  return comAuth(async (user: AuthPayload) => {
    const body = await req.json()
    const parsed = checkoutSchema.safeParse(body)
    if (!parsed.success) {
      return erro(parsed.error.errors[0].message, 400)
    }

    const { enderecoId, modalidadeFrete, freteValor, cupomCodigo, itens } = parsed.data

    // Verify the address belongs to this user
    const endereco = await prisma.endereco.findFirst({
      where: { id: enderecoId, usuarioId: user.sub },
    })
    if (!endereco) return erro('Endereço não encontrado', 400)

    // Load products and verify stock
    const produtoIds = itens.map((i) => i.produtoId)
    const produtos = await prisma.produto.findMany({
      where: { id: { in: produtoIds }, ativo: true },
    })

    if (produtos.length !== itens.length) {
      return erro('Um ou mais produtos não foram encontrados', 400)
    }

    for (const item of itens) {
      const produto = produtos.find((p) => p.id === item.produtoId)!
      if (produto.estoque < item.quantidade) {
        return erro(
          `Estoque insuficiente para "${produto.nome}" (disponível: ${produto.estoque})`,
          400
        )
      }
    }

    // Recompute prices server-side
    let subtotalCheio = 0
    let subtotalComVolume = 0
    const linhas = itens.map((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId)!
      const precoUnit = Number(produto.preco)
      const precoDesc = precoComDesconto(precoUnit, item.quantidade)
      const linhaTotal = precoDesc * item.quantidade
      subtotalCheio += precoUnit * item.quantidade
      subtotalComVolume += linhaTotal
      return {
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        nome: produto.nome,
        preco: precoDesc,
        linhaTotal,
      }
    })

    const descontoVolume = subtotalCheio - subtotalComVolume

    // Desconto global da loja (admin)
    const config = await getConfig()
    const descontoGlobal = subtotalComVolume * (config.descontoGlobalPct / 100)
    const subtotalLiquido = subtotalComVolume - descontoGlobal

    // Validate coupon server-side
    let descontoCupom = 0
    let cupomCodigoFinal: string | null = null
    if (cupomCodigo) {
      const codigoUpper = cupomCodigo.toUpperCase().trim()
      const cupom = await prisma.cupom.findUnique({ where: { codigo: codigoUpper } })
      if (
        cupom &&
        cupom.ativo &&
        !(cupom.expiraEm && cupom.expiraEm < new Date()) &&
        !(cupom.maxUsos !== null && cupom.usos >= cupom.maxUsos) &&
        !(cupom.minimo !== null && subtotalLiquido < Number(cupom.minimo))
      ) {
        if (cupom.tipo === 'PERCENTUAL') {
          descontoCupom = subtotalLiquido * (Number(cupom.valor) / 100)
        } else {
          descontoCupom = Number(cupom.valor)
        }
        descontoCupom = Math.min(descontoCupom, subtotalLiquido)
        cupomCodigoFinal = cupom.codigo
      }
    }

    const algumFreteGratis = produtos.some((p) => p.freteGratis)
    const freteGratis = freteGratisAplicavel(config, subtotalLiquido, algumFreteGratis)
    const freteNum = freteGratis ? 0 : freteValor
    const total = Math.max(0, subtotalLiquido - descontoCupom + freteNum)
    const descontoTotal = descontoVolume + descontoGlobal + descontoCupom
    const modalidadeFinal = freteGratis ? `${modalidadeFrete} (grátis)` : modalidadeFrete

    // Generate order number
    const count = await prisma.pedido.count()
    const numero = gerarNumeroPedido(count + 1)

    // Create order + items + decrement stock in a transaction
    const pedido = await prisma.$transaction(async (tx) => {
      // Decrement stock for each product
      for (const item of itens) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: item.quantidade } },
        })
      }

      // Increment coupon usage
      if (cupomCodigoFinal) {
        await tx.cupom.update({
          where: { codigo: cupomCodigoFinal },
          data: { usos: { increment: 1 } },
        })
      }

      // Create the order
      return tx.pedido.create({
        data: {
          numero,
          usuarioId: user.sub,
          enderecoId,
          status: 'AGUARDANDO_PAGAMENTO',
          subtotal: new Prisma.Decimal(subtotalLiquido),
          frete: new Prisma.Decimal(freteNum),
          desconto: new Prisma.Decimal(descontoTotal),
          total: new Prisma.Decimal(total),
          modalidadeFrete: modalidadeFinal,
          cupomCodigo: cupomCodigoFinal ?? undefined,
          itens: {
            create: linhas.map((l) => ({
              produtoId: l.produtoId,
              nome: l.nome,
              preco: new Prisma.Decimal(l.preco),
              quantidade: l.quantidade,
              subtotal: new Prisma.Decimal(l.linhaTotal),
            })),
          },
        },
      })
    })

    // Create Mercado Pago preference
    const mpItens = linhas.map((l) => ({
      id: l.produtoId,
      title: l.nome.slice(0, 255),
      quantity: l.quantidade,
      unit_price: Math.round(l.preco * 100) / 100,
    }))

    const pref = await criarPreferencia({
      itens: mpItens,
      externalReference: numero,
      payerEmail: user.email,
    })

    // Save the MP preference id if available
    if (pref.id) {
      await prisma.pedido.update({
        where: { id: pedido.id },
        data: { mpPaymentId: pref.id },
      })
    }

    return ok({
      pedidoNumero: numero,
      init_point: pref.init_point,
      mock: pref.mock,
    })
  })
}
