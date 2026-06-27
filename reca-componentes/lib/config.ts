import { prisma } from './prisma'

export interface ConfigDTO {
  nomeLoja: string
  freteGratisAtivo: boolean
  freteGratisMinimo: number
  descontoGlobalPct: number
  bannerTexto: string | null
}

const PADRAO: ConfigDTO = {
  nomeLoja: process.env.NEXT_PUBLIC_STORE_NAME || 'RECA Componentes',
  freteGratisAtivo: true,
  freteGratisMinimo: 299,
  descontoGlobalPct: 0,
  bannerTexto: null,
}

/** Lê a configuração da loja (linha única). Cria com padrões se não existir. */
export async function getConfig(): Promise<ConfigDTO> {
  try {
    const c = await prisma.configuracao.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    })
    return {
      nomeLoja: c.nomeLoja,
      freteGratisAtivo: c.freteGratisAtivo,
      freteGratisMinimo: Number(c.freteGratisMinimo),
      descontoGlobalPct: Number(c.descontoGlobalPct),
      bannerTexto: c.bannerTexto,
    }
  } catch {
    return PADRAO
  }
}

/** Leitura sem efeito colateral (não cria a linha). Usado em render de layout. */
export async function readConfig(): Promise<ConfigDTO> {
  try {
    const c = await prisma.configuracao.findUnique({ where: { id: 'default' } })
    if (!c) return PADRAO
    return {
      nomeLoja: c.nomeLoja,
      freteGratisAtivo: c.freteGratisAtivo,
      freteGratisMinimo: Number(c.freteGratisMinimo),
      descontoGlobalPct: Number(c.descontoGlobalPct),
      bannerTexto: c.bannerTexto,
    }
  } catch {
    return PADRAO
  }
}

/**
 * Decide se o frete é grátis: configuração ativa e subtotal acima do mínimo,
 * ou algum item do pedido marcado como frete grátis.
 */
export function freteGratisAplicavel(
  config: ConfigDTO,
  subtotal: number,
  algumItemFreteGratis = false
): boolean {
  if (algumItemFreteGratis) return true
  return config.freteGratisAtivo && subtotal >= config.freteGratisMinimo
}
