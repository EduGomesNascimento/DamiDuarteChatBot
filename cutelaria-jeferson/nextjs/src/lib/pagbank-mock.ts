/**
 * PagBank Mock para desenvolvimento
 * Simula respostas do PagBank sem credenciais reais
 */

import { v4 as uuid } from 'uuid';

export interface CreatePixParams {
  orderId: string;
  total: number;
  buyerName: string;
  buyerEmail: string;
  buyerCpf: string;
  description?: string;
  items: { name: string; quantity: number; unit_amount: number }[];
}

export interface PixResult {
  pagbankOrderId: string;
  pagbankChargeId: string;
  status: string;
  qrCode: string;
  qrCodeImage: string;
  expiresAt: string;
}

export interface CreateCheckoutParams {
  orderId: string;
  total: number;
  freight: number;
  buyerName: string;
  buyerEmail: string;
  buyerCpf: string;
  items: { name: string; quantity: number; unit_amount: number }[];
}

export interface CreateBoletoParams {
  orderId: string;
  total: number;
  buyerName: string;
  buyerEmail: string;
  buyerCpf: string;
  address: {
    street: string;
    number: string;
    locality: string;
    city: string;
    region_code: string;
    postal_code: string;
  };
  items: { name: string; quantity: number; unit_amount: number }[];
}

export interface BoletoResult {
  pagbankOrderId: string;
  pagbankChargeId: string;
  status: string;
  boletoBarcode: string;
  boletoPdfLink: string;
  boletoImageLink: string;
  dueDate: string;
}

// Mock QR Code PIX (copia e cola simulado)
const MOCK_QR_CODE = '00020126580014br.gov.bcb.pix0136d51c5f2c-70e8-4ef6-9c73-a26dbb42f5bd52040000530398654061249.905802BR5913JEFERSON6009SAO PAULO62410503***63047B5D';

/**
 * Simula criação de PIX
 */
export async function createPixPayment(params: CreatePixParams): Promise<PixResult> {
  // Simula delay da API
  await new Promise(r => setTimeout(r, 500));

  const orderId = `ord_${uuid().split('-')[0]}`;
  const chargeId = `chg_${uuid().split('-')[0]}`;

  return {
    pagbankOrderId: orderId,
    pagbankChargeId: chargeId,
    status: 'PENDING',
    qrCode: MOCK_QR_CODE,
    qrCodeImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6ZAAAA7UlEQVR4nO3BMQEAAADCoPVPbQhfoAAAAOA1v9QAATX68/0AAAAASUVORK5CYII=',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

/**
 * Simula criação de Checkout (Cartão)
 */
export async function createCheckoutPagBank(params: CreateCheckoutParams): Promise<string> {
  // Simula delay da API
  await new Promise(r => setTimeout(r, 500));

  // Retorna URL fake que redireciona de volta
  return `/obrigado?order=${params.orderId}&status=approved&mock=true`;
}

/**
 * Simula criação de Boleto
 */
export async function createBoletoPayment(params: CreateBoletoParams): Promise<BoletoResult> {
  // Simula delay da API
  await new Promise(r => setTimeout(r, 500));

  const orderId = `ord_${uuid().split('-')[0]}`;
  const chargeId = `chg_${uuid().split('-')[0]}`;
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return {
    pagbankOrderId: orderId,
    pagbankChargeId: chargeId,
    status: 'WAITING',
    boletoBarcode: '12345.67890 12345.678901 12345.678901 1 12345678901234',
    boletoPdfLink: '#',
    boletoImageLink: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6ZAAAA7UlEQVR4nO3BMQEAAADCoPVPbQhfoAAAAOA1v9QAATX68/0AAAAASUVORK5CYII=',
    dueDate: dueDate.toISOString().split('T')[0],
  };
}

/**
 * Simula consulta de pedido
 */
export async function getOrderById(pagbankOrderId: string): Promise<any> {
  return {
    id: pagbankOrderId,
    status: 'PAID',
    charges: [
      {
        id: `chg_${uuid().split('-')[0]}`,
        status: 'PAID',
        paid_at: new Date().toISOString(),
        amount: { value: 100000, currency: 'BRL' },
      },
    ],
  };
}

/**
 * Simula consulta de charge
 */
export async function getChargeById(chargeId: string): Promise<any> {
  return {
    id: chargeId,
    status: 'PAID',
    paid_at: new Date().toISOString(),
    amount: { value: 100000, currency: 'BRL' },
  };
}
