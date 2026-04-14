import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkoutSchema, rateLimit, getRateLimitKey, apiError } from '@/lib/security';
import { calcFreight } from '@/lib/utils';

// Detect mock mode
const useMock = !process.env.PAGBANK_TOKEN || process.env.PAGBANK_TOKEN.includes('seu_token');

export async function POST(request: NextRequest) {
  // Rate limit
  const key = getRateLimitKey(request, 'payment');
  if (!rateLimit(key, 10, 60_000)) {
    return apiError('Muitas tentativas. Aguarde um momento.', 429);
  }

  try {
    const body = await request.json();

    // Validate
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map(e => e.message).join(', ');
      return apiError(msg);
    }

    const { name, email, cpf, phone, cep, address, number, complement, neighborhood, city, state, paymentMethod } = parsed.data;
    const { items: rawItems } = body;

    if (!rawItems || !rawItems.length) {
      return apiError('Carrinho vazio');
    }

    // Calculate totals
    const subtotal = rawItems.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const freight = calcFreight(subtotal);
    const total = subtotal + freight;

    if (total <= 0) return apiError('Valor inválido');

    const supabase = createAdminClient();

    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        total,
        subtotal,
        freight,
        status: 'pending',
        payment_method: paymentMethod,
        shipping_address: { name, email, cpf, phone, cep, address, number, complement, neighborhood, city, state },
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Supabase order error:', orderError);
      return apiError('Erro ao registrar pedido', 500);
    }

    // 2. Create order items
    const orderItems = rawItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    await supabase.from('order_items').insert(orderItems);

    // 3. Common params
    const itemsForPayment = rawItems.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      unit_amount: item.price,
    }));

    const buyerData = {
      orderId: order.id,
      total,
      buyerName: name,
      buyerEmail: email,
      buyerCpf: cpf,
      items: itemsForPayment,
    };

    // 4. Import payment lib dynamically
    const paymentLib = useMock
      ? await import('@/lib/pagbank-mock')
      : await import('@/lib/pagbank');

    // 5. Process payment
    if (paymentMethod === 'pix') {
      const pix = await paymentLib.createPixPayment(buyerData);

      await supabase
        .from('orders')
        .update({ pagbank_order_id: pix.pagbankOrderId, pagbank_charge_id: pix.pagbankChargeId })
        .eq('id', order.id);

      if (useMock) {
        console.log('📌 MOCK MODE - PIX simulado:', {
          orderId: order.id,
          qrCode: pix.qrCode.substring(0, 50) + '...',
        });
      }

      return NextResponse.json({
        orderId: order.id,
        method: 'pix',
        qrCode: pix.qrCode,
        qrCodeImage: pix.qrCodeImage,
        expiresAt: pix.expiresAt,
        mock: useMock,
      });

    } else if (paymentMethod === 'boleto') {
      const boleto = await paymentLib.createBoletoPayment({
        ...buyerData,
        address: {
          street: address,
          number,
          locality: neighborhood,
          city,
          region_code: state,
          postal_code: cep,
        },
      });

      await supabase
        .from('orders')
        .update({ pagbank_order_id: boleto.pagbankOrderId, pagbank_charge_id: boleto.pagbankChargeId })
        .eq('id', order.id);

      if (useMock) {
        console.log('📌 MOCK MODE - Boleto simulado:', {
          orderId: order.id,
          barcode: boleto.boletoBarcode.substring(0, 20) + '...',
        });
      }

      return NextResponse.json({
        orderId: order.id,
        method: 'boleto',
        boletoBarcode: boleto.boletoBarcode,
        boletoPdfLink: boleto.boletoPdfLink,
        boletoImageLink: boleto.boletoImageLink,
        dueDate: boleto.dueDate,
        mock: useMock,
      });

    } else {
      // Cartão → Checkout
      const checkoutUrl = await paymentLib.createCheckoutPagBank({
        ...buyerData,
        freight,
      });

      await supabase
        .from('orders')
        .update({ pagbank_checkout_url: checkoutUrl })
        .eq('id', order.id);

      if (useMock) {
        console.log('📌 MOCK MODE - Checkout simulado:', {
          orderId: order.id,
          redirectUrl: checkoutUrl,
        });
      }

      return NextResponse.json({
        orderId: order.id,
        method: 'checkout',
        checkoutUrl,
        mock: useMock,
      });
    }

  } catch (error: any) {
    console.error('Payment create error:', error);
    return apiError(error.message || 'Erro interno do servidor', 500);
  }
}
