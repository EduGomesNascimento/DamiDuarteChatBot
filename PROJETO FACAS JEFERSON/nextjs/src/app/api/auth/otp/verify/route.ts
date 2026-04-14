import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email e código são obrigatórios' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Buscar usuário e OTP
    const { data: user, error } = await supabase
      .from('users')
      .select('id, otp_code, otp_expires_at, otp_attempts')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar expiração
    if (!user.otp_expires_at || new Date(user.otp_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Código expirado' }, { status: 400 });
    }

    // Verificar tentativas
    if ((user.otp_attempts || 0) >= 3) {
      return NextResponse.json({ error: 'Muitas tentativas. Solicite um novo código.' }, { status: 400 });
    }

    // Verificar código
    if (user.otp_code !== code) {
      await supabase
        .from('users')
        .update({ otp_attempts: (user.otp_attempts || 0) + 1 })
        .eq('id', user.id);

      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    // Limpar OTP
    await supabase
      .from('users')
      .update({
        otp_code: null,
        otp_expires_at: null,
        otp_attempts: 0,
        last_login_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Criar session (você pode usar JWT ou Supabase session)
    // Por enquanto, apenas retornamos sucesso

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
