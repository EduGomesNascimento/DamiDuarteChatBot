/**
 * Cálculo de frete real via Melhor Envio API
 * Suporta: Correios (PAC/SEDEX), Jadlog, Sedex
 *
 * Docs: https://www.melhorenvio.com.br/docs
 */

const MELHOR_ENVIO_API = 'https://api.melhorenvio.com.br';
const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;

export interface ShippingOption {
  carrier: string; // 'sedex', 'pac', 'jadlog'
  name: string; // ex: "Sedex - 2 dias"
  price: number; // em reais
  days: number; // dias úteis
  error?: string;
}

/**
 * Calcular frete em tempo real
 */
export async function calculateShipping(params: {
  zipCode: string; // CEP destino
  weight: number; // kg
  height: number; // cm
  width: number; // cm
  length: number; // cm
}): Promise<ShippingOption[]> {
  // Se não tiver token, retornar valores simulados
  if (!MELHOR_ENVIO_TOKEN || MELHOR_ENVIO_TOKEN === 'sua_chave_aqui') {
    return getMockShipping(params);
  }

  try {
    const response = await fetch(`${MELHOR_ENVIO_API}/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        from: {
          postal_code: '01310100', // CEP Cutelaria Jeferson (SP)
        },
        to: {
          postal_code: params.zipCode.replace(/\D/g, ''),
        },
        products: [
          {
            weight: Math.max(0.3, params.weight), // Melhor Envio requer mínimo 0.3kg
            height: Math.max(5, params.height),
            width: Math.max(5, params.width),
            length: Math.max(5, params.length),
          },
        ],
        services: ['40010', '40045', '04162', '04065'], // PAC, SEDEX, Jadlog, etc
      }),
    });

    if (!response.ok) {
      console.warn('Melhor Envio API error:', response.statusText);
      return getMockShipping(params);
    }

    const data = await response.json();

    // Parse resposta
    return (data || [])
      .filter((option: any) => option.price !== null && option.price >= 0)
      .map((option: any) => ({
        carrier: mapCarrier(option.service),
        name: option.name || mapServiceName(option.service),
        price: parseFloat(option.price) || 0,
        days: option.delivery_time || 0,
      }))
      .sort((a: any, b: any) => a.price - b.price)
      .slice(0, 5); // Top 5 opções

  } catch (error) {
    console.error('Shipping calc error:', error);
    return getMockShipping(params);
  }
}

/**
 * Mapear código de serviço para carrier
 */
function mapCarrier(serviceCode: string): string {
  const map: Record<string, string> = {
    '40010': 'pac',
    '40045': 'sedex',
    '04162': 'jadlog',
    '04065': 'sedex_contrato',
    '03298': 'pac_contrato',
  };
  return map[serviceCode] || 'outros';
}

/**
 * Nome amigável do serviço
 */
function mapServiceName(serviceCode: string): string {
  const map: Record<string, string> = {
    '40010': 'PAC - 7 a 15 dias',
    '40045': 'SEDEX - 2 a 3 dias',
    '04162': 'Jadlog - 2 a 5 dias',
    '04065': 'SEDEX (Contratado) - 1 dia',
    '03298': 'PAC (Contratado) - 5 dias',
  };
  return map[serviceCode] || 'Frete';
}

/**
 * Simulação para quando não houver token real
 */
function getMockShipping(params: {
  zipCode: string;
  weight: number;
  height: number;
  width: number;
  length: number;
}): ShippingOption[] {
  const basePrice = 15;
  const weightFactor = Math.ceil(params.weight) * 2;
  const volumeFactor = (params.height * params.width * params.length) / 6000;

  return [
    {
      carrier: 'pac',
      name: 'PAC - 7 a 15 dias',
      price: basePrice + weightFactor + volumeFactor * 5,
      days: 12,
    },
    {
      carrier: 'sedex',
      name: 'SEDEX - 2 a 3 dias',
      price: basePrice + weightFactor + volumeFactor * 10,
      days: 2,
    },
    {
      carrier: 'jadlog',
      name: 'Jadlog - 2 a 5 dias',
      price: basePrice + weightFactor + volumeFactor * 7,
      days: 3,
    },
  ].map(opt => ({
    ...opt,
    price: Math.round(opt.price * 100) / 100,
  }));
}

/**
 * Validar CEP
 */
export function validateCEP(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep);
}

/**
 * Formatar CEP
 */
export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
}
