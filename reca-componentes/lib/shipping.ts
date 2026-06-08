/**
 * Cálculo de frete — mock funcional por região/UF.
 *
 * Estrutura preparada para integração real (Correios / Melhor Envio):
 * basta substituir `calcularFrete` por uma chamada à API e manter o formato
 * de retorno `OpcaoFrete[]`.
 */

export interface OpcaoFrete {
  id: string
  nome: string
  prazoDias: number
  valor: number
}

// Origem: Portão/RS (Região Sul)
const REGIAO_POR_UF: Record<string, 'sul' | 'sudeste' | 'centro' | 'nordeste' | 'norte'> = {
  RS: 'sul', SC: 'sul', PR: 'sul',
  SP: 'sudeste', RJ: 'sudeste', MG: 'sudeste', ES: 'sudeste',
  DF: 'centro', GO: 'centro', MT: 'centro', MS: 'centro',
  BA: 'nordeste', SE: 'nordeste', AL: 'nordeste', PE: 'nordeste', PB: 'nordeste',
  RN: 'nordeste', CE: 'nordeste', PI: 'nordeste', MA: 'nordeste',
  PA: 'norte', AM: 'norte', RR: 'norte', AP: 'norte', AC: 'norte', RO: 'norte', TO: 'norte',
}

const TABELA = {
  sul: { pac: { base: 17.9, prazo: 4 }, sedex: { base: 28.9, prazo: 2 } },
  sudeste: { pac: { base: 24.9, prazo: 6 }, sedex: { base: 39.9, prazo: 3 } },
  centro: { pac: { base: 29.9, prazo: 8 }, sedex: { base: 49.9, prazo: 4 } },
  nordeste: { pac: { base: 34.9, prazo: 10 }, sedex: { base: 59.9, prazo: 5 } },
  norte: { pac: { base: 44.9, prazo: 14 }, sedex: { base: 74.9, prazo: 7 } },
}

function ufPorCep(cep: string): string {
  const c = parseInt(cep.replace(/\D/g, '').slice(0, 5), 10)
  // Faixas de CEP aproximadas por UF (simplificado).
  if (c >= 90000 && c <= 99999) return 'RS'
  if (c >= 88000 && c <= 89999) return 'SC'
  if (c >= 80000 && c <= 87999) return 'PR'
  if (c >= 1000 && c <= 19999) return 'SP'
  if (c >= 20000 && c <= 28999) return 'RJ'
  if (c >= 29000 && c <= 29999) return 'ES'
  if (c >= 30000 && c <= 39999) return 'MG'
  if (c >= 40000 && c <= 48999) return 'BA'
  if (c >= 70000 && c <= 73699) return 'DF'
  return 'SP'
}

export function calcularFrete(cep: string, pesoGramas = 200, uf?: string): OpcaoFrete[] {
  const estado = (uf || ufPorCep(cep)).toUpperCase()
  const regiao = REGIAO_POR_UF[estado] || 'sudeste'
  const tab = TABELA[regiao]
  const fatorPeso = Math.max(1, Math.ceil(pesoGramas / 500))

  const opcoes: OpcaoFrete[] = [
    {
      id: 'PAC',
      nome: 'Correios PAC',
      prazoDias: tab.pac.prazo,
      valor: +(tab.pac.base + (fatorPeso - 1) * 4.5).toFixed(2),
    },
    {
      id: 'SEDEX',
      nome: 'Correios Sedex',
      prazoDias: tab.sedex.prazo,
      valor: +(tab.sedex.base + (fatorPeso - 1) * 6.5).toFixed(2),
    },
  ]

  // Retirada local apenas para Portão/RS e proximidades.
  if (estado === 'RS') {
    opcoes.unshift({
      id: 'RETIRADA',
      nome: 'Retirada em Portão/RS',
      prazoDias: 1,
      valor: 0,
    })
  }

  return opcoes
}
