import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const useMock = !process.env.PAGBANK_TOKEN || process.env.PAGBANK_TOKEN.includes('seu_token');

/**
 * PagBank Webhook - recebe notificações de pagamento
 * Em mock mode, simula automaticamente como "paid"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mock mode: simula pagamento bem-sucedido
    if (useMock) {
      const orderId = body.orderId || body.reference_id || body.external_reference;
      if (!orderId) {
        return NextResponse.json({ message: 'MOCK: sem orderId' });
      }

      const supabase = createAdminClient();
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      console.log(`📌 MOCK WEBHOOK: Pedido ${orderId} marcado como PAID`);
      return NextResponse.json({ success: true, status: 'paid', mock: true });
    }

    // Real mode: processar notificação do PagBank
    const paymentLib = await import('@/lib/pagbank');
    const pagbankOrderId = body.id;

    if (!pagbankOrderId) {
      return NextResponse.json({ message: 'Notificação ignorada' });
    }

    // Buscar pedido completo no PagBank
    let orderData;
    try {
      orderData = await paymentLib.getOrderById(pagbankOrderId);
    } catch {
      orderData = body;
    }

    const referenceId = orderData.reference_id;
    if (!referenceId) {
      console.warn('Webhook sem reference_id:', pagbankOrderId);
      return NextResponse.json({ message: 'Sem reference_id' });
    }

    // Determinar status
    const charges = orderData.charges || [];
    const qrCodes = orderData.qr_codes || [];

    let newStatus = 'pending';

    for (const charge of charges) {
      if (charge.status === 'PAID' || charge.status === 'AUTHORIZED') {
        newStatus = 'paid';
        break;
      } else if (charge.status === 'DECLINED' || charge.status === 'CANCELED') {
        newStatus = 'cancelled';
        break;
      } else if (charge.status === 'IN_ANALYSIS') {
        newStatus = 'in_analysis';
      }
    }

    if (newStatus === 'pending') {
      for (const qr of qrCodes) {
        if (qr.status === 'PAID') {
          newStatus = 'paid';
          break;
        }
      }
    }

    // Atualizar no Supabase
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        pagbank_order_id: pagbankOrderId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', referenceId);

    if (error) {
      console.error('Erro ao atualizar pedido:', error);
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
    }

    console.log(`Pedido ${referenceId} → ${newStatus}`);
    return NextResponse.json({ success: true, status: newStatus });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 });
  }
}
