/**
 * PagBank (PagSeguro) API v4 Integration
 * Docs: https://dev.pagbank.uol.com.br/reference
 *
 * Fluxo PIX:
 *   POST /api/payment/create { method: 'pix', ... }
 *   → cria Order com charge PIX → retorna QR code
 *   → webhook atualiza order
 *
 * Fluxo Cartão (Checkout PagBank):
 *   POST /api/payment/create { method: 'credit_card', ... }
 *   → cria checkout via API → retorna URL de pagamento
 *   → usuário paga no PagBank → redirect back
 *   → webhook atualiza order
 *
 * Fluxo Boleto:
 *   POST /api/payment/create { method: 'boleto', ... }
 *   → cria Order com charge BOLETO → retorna link do boleto
 */

const PAGBANK_BASE_URL = process.env.PAGBANK_ENV === 'production'
  ? 'https://api.pagseguro.com'
  : 'https://sandbox.api.pagseguro.com';

const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN || '';

async function pagbankFetch<T = any>(path: string, body: object): Promise<T> {
  const res = await fetch(`${PAGBANK_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAGBANK_TOKEN}`,
      'x-idempotency-key': crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`PagBank API error [${res.status}]:`, err);
    throw new Error(`PagBank: ${res.status} - ${err}`);
  }

  return res.json();
}

async function pagbankGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${PAGBANK_BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAGBANK_TOKEN}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`PagBank GET error [${res.status}]:`, err);
    throw new Error(`PagBank: ${res.status} - ${err}`);
  }

  return res.json();
}

// ============================================================
// PIX PAYMENT
// ============================================================

export interface CreatePixParams {
  orderId: string;
  total: number; // em reais (ex: 249.90)
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
  qrCode: string;        // texto copia-e-cola
  qrCodeImage: string;   // link da imagem PNG do QR
  expiresAt: string;
}

export async function createPixPayment(params: CreatePixParams): Promise<PixResult> {
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`;

  const order = await pagbankFetch('/orders', {
    reference_id: params.orderId,
    customer: {
      name: params.buyerName,
      email: params.buyerEmail,
      tax_id: params.buyerCpf.replace(/\D/g, ''),
    },
    items: params.items.map((item, i) => ({
      reference_id: `item-${i}`,
      name: item.name.substring(0, 64),
      quantity: item.quantity,
      unit_amount: Math.round(item.unit_amount * 100), // PagBank usa centavos
    })),
    qr_codes: [
      {
        amount: {
          value: Math.round(params.total * 100),
        },
        expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    ],
    notification_urls: [webhookUrl],
  });

  const qr = order.qr_codes?.[0];
  if (!qr) {
    throw new Error('Falha ao gerar QR Code PIX no PagBank');
  }

  // O QR code pode vir em links[0] ou diretamente
  const qrLink = qr.links?.find((l: any) => l.media === 'image/png');

  return {
    pagbankOrderId: order.id,
    pagbankChargeId: qr.id || '',
    status: order.status || 'PENDING',
    qrCode: qr.text || '',
    qrCodeImage: qrLink?.href || '',
    expiresAt: qr.expiration_date || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

// ============================================================
// CREDIT CARD - Checkout PagBank
// ============================================================

export interface CreateCheckoutParams {
  orderId: string;
  total: number;
  freight: number;
  buyerName: string;
  buyerEmail: string;
  buyerCpf: string;
  items: { name: string; quantity: number; unit_amount: number }[];
}

export async function createCheckoutPagBank(params: CreateCheckoutParams): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const webhookUrl = `${appUrl}/api/payment/webhook`;

  const checkout = await pagbankFetch('/checkouts', {
    reference_id: params.orderId,
    customer: {
      name: params.buyerName,
      email: params.buyerEmail,
      tax_id: params.buyerCpf.replace(/\D/g, ''),
    },
    items: params.items.map((item, i) => ({
      reference_id: `item-${i}`,
      name: item.name.substring(0, 64),
      quantity: item.quantity,
      unit_amount: Math.round(item.unit_amount * 100),
    })),
    ...(params.freight > 0 && {
      shipping: {
        type: 'FIXED',
        amount: Math.round(params.freight * 100),
      },
    }),
    payment_methods: [
      { type: 'CREDIT_CARD', brands: ['VISA', 'MASTERCARD', 'ELO', 'AMEX', 'HIPERCARD'] },
      { type: 'DEBIT_CARD', brands: ['VISA', 'MASTERCARD', 'ELO'] },
      { type: 'PIX' },
      { type: 'BOLETO' },
    ],
    payment_methods_configs: [
      {
        type: 'CREDIT_CARD',
        config_options: [
          { option: 'INSTALLMENTS_LIMIT', value: '12' },
        ],
      },
    ],
    redirect_urls: {
      return_url: `${appUrl}/obrigado?order=${params.orderId}`,
    },
    notification_urls: [webhookUrl],
    payment_notification_urls: [webhookUrl],
  });

  // PagBank retorna links com rel: PAY
  const payLink = checkout.links?.find((l: any) => l.rel === 'PAY');
  if (!payLink?.href) {
    throw new Error('Falha ao criar checkout PagBank');
  }

  return payLink.href;
}

// ============================================================
// BOLETO
// ============================================================

export interface CreateBoletoParams {
  orderId: string;
  total: number;
  buyerName: string;
  buyerEmail: string;
  buyerCpf: string;
  address: {
    street: string;
    number: string;
    locality: string; // bairro
    city: string;
    region_code: string; // UF
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

export async function createBoletoPayment(params: CreateBoletoParams): Promise<BoletoResult> {
  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`;
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 dias

  const order = await pagbankFetch('/orders', {
    reference_id: params.orderId,
    customer: {
      name: params.buyerName,
      email: params.buyerEmail,
      tax_id: params.buyerCpf.replace(/\D/g, ''),
    },
    items: params.items.map((item, i) => ({
      reference_id: `item-${i}`,
      name: item.name.substring(0, 64),
      quantity: item.quantity,
      unit_amount: Math.round(item.unit_amount * 100),
    })),
    charges: [
      {
        reference_id: params.orderId,
        description: `Cutelaria Jeferson - Pedido ${params.orderId}`,
        amount: {
          value: Math.round(params.total * 100),
          currency: 'BRL',
        },
        payment_method: {
          type: 'BOLETO',
          boleto: {
            due_date: dueDate.toISOString().split('T')[0],
            instruction_lines: {
              line_1: 'Cutelaria Jeferson - Facas Artesanais',
              line_2: `Pedido: ${params.orderId}`,
            },
            holder: {
              name: params.buyerName,
              tax_id: params.buyerCpf.replace(/\D/g, ''),
              email: params.buyerEmail,
              address: {
                country: 'BRA',
                region: params.address.region_code,
                city: params.address.city,
                postal_code: params.address.postal_code.replace(/\D/g, ''),
                street: params.address.street,
                number: params.address.number,
                locality: params.address.locality,
              },
            },
          },
        },
        notification_urls: [webhookUrl],
      },
    ],
    notification_urls: [webhookUrl],
  });

  const charge = order.charges?.[0];
  if (!charge) {
    throw new Error('Falha ao gerar boleto no PagBank');
  }

  const pdfLink = charge.links?.find((l: any) => l.media === 'application/pdf');
  const imgLink = charge.links?.find((l: any) => l.media === 'image/png');

  return {
    pagbankOrderId: order.id,
    pagbankChargeId: charge.id,
    status: charge.status || 'WAITING',
    boletoBarcode: charge.payment_method?.boleto?.barcode || '',
    boletoPdfLink: pdfLink?.href || '',
    boletoImageLink: imgLink?.href || '',
    dueDate: dueDate.toISOString().split('T')[0],
  };
}

// ============================================================
// CONSULTAR PEDIDO (para webhook / polling)
// ============================================================

export interface PagBankOrderData {
  id: string;
  reference_id: string; // nosso orderId
  status: string;
  charges: {
    id: string;
    status: 'AUTHORIZED' | 'PAID' | 'DECLINED' | 'CANCELED' | 'IN_ANALYSIS' | 'WAITING';
    paid_at?: string;
    amount: { value: number; currency: string };
  }[];
}

export async function getOrderById(pagbankOrderId: string): Promise<PagBankOrderData> {
  return pagbankGet(`/orders/${pagbankOrderId}`);
}

export async function getChargeById(chargeId: string): Promise<any> {
  return pagbankGet(`/charges/${chargeId}`);
}
