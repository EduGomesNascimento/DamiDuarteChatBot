import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping, validateCEP } from '@/lib/shipping';

// Simple in-memory cache for shipping calculations (5 min TTL)
const shippingCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cep, weight = 0.5, price = 100 } = body;

    // Validate CEP
    if (!cep || !validateCEP(cep)) {
      return NextResponse.json(
        { error: 'CEP inválido' },
        { status: 400 }
      );
    }

    const cleanCep = cep.replace(/\D/g, '');
    const cacheKey = `${cleanCep}-${weight}-${price}`;

    // Check cache
    const cached = shippingCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Calculate shipping using Melhor Envio
    const options = await calculateShipping({
      to_postal_code: cleanCep,
      weight,
      price,
    });

    // Cache the result
    shippingCache.set(cacheKey, {
      data: options,
      timestamp: Date.now(),
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Shipping calculation error:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular frete' },
      { status: 500 }
    );
  }
}
