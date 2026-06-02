import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { createHmac } from 'crypto'

/**
 * Integração Mercado Pago.
 *
 * Em produção, defina MP_ACCESS_TOKEN. Sem token, `isConfigured` é false e
 * as rotas devem cair em modo "mock" para que o fluxo de checkout continue
 * demonstrável em desenvolvimento.
 */
export const mpConfigured = Boolean(process.env.MP_ACCESS_TOKEN)

const client = mpConfigured
  ? new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN as string,
      options: { timeout: 8000 },
    })
  : null

export interface ItemPreferencia {
  id: string
  title: string
  quantity: number
  unit_price: number
}

export async function criarPreferencia(params: {
  itens: ItemPreferencia[]
  externalReference: string
  payerEmail?: string
}) {
  if (!client) {
    // Modo mock — devolve uma URL fake que o front trata.
    return {
      id: `mock-${params.externalReference}`,
      init_point: `${process.env.NEXT_PUBLIC_APP_URL || ''}/checkout/mock?ref=${params.externalReference}`,
      mock: true as const,
    }
  }

  const pref = new Preference(client)
  const result = await pref.create({
    body: {
      items: params.itens.map((i) => ({
        id: i.id,
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unit_price,
        currency_id: 'BRL',
      })),
      external_reference: params.externalReference,
      payer: params.payerEmail ? { email: params.payerEmail } : undefined,
      payment_methods: {
        installments: 12,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/minha-conta/pedidos`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/minha-conta/pedidos`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pagamentos/webhook`,
    },
  })
  return { id: result.id, init_point: result.init_point, mock: false as const }
}

export async function consultarPagamento(paymentId: string) {
  if (!client) return null
  const payment = new Payment(client)
  return payment.get({ id: paymentId })
}

/**
 * Valida a assinatura HMAC-SHA256 enviada pelo Mercado Pago no header
 * `x-signature`. Formato: `ts=...,v1=...`.
 */
export function validarAssinaturaWebhook(params: {
  signatureHeader: string | null
  requestId: string | null
  dataId: string | null
}): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // sem secret configurado, não bloqueia (dev)
  if (!params.signatureHeader) return false

  const parts = Object.fromEntries(
    params.signatureHeader.split(',').map((kv) => {
      const [k, v] = kv.split('=')
      return [k.trim(), v?.trim()]
    })
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return false

  const manifest = `id:${params.dataId};request-id:${params.requestId};ts:${ts};`
  const computed = createHmac('sha256', secret).update(manifest).digest('hex')
  return computed === v1
}

export function mapStatusMP(mpStatus: string):
  | 'PENDENTE'
  | 'APROVADO'
  | 'RECUSADO'
  | 'ESTORNADO' {
  switch (mpStatus) {
    case 'approved':
      return 'APROVADO'
    case 'refunded':
    case 'charged_back':
      return 'ESTORNADO'
    case 'rejected':
    case 'cancelled':
      return 'RECUSADO'
    default:
      return 'PENDENTE'
  }
}
