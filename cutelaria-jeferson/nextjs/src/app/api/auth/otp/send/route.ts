import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Salvar OTP no banco
    const { error } = await supabase
      .from('users')
      .update({
        otp_code: code,
        otp_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        otp_attempts: 0,
      })
      .eq('email', email);

    if (error) {
      console.error('OTP save error:', error);
      return NextResponse.json({ error: 'Erro ao gerar OTP' }, { status: 500 });
    }

    // TODO: Enviar email real com Resend/SendGrid
    // await sendEmail(email, `Seu código de login: ${code}`);

    console.log(`📧 OTP enviado para ${email}: ${code}`);

    return NextResponse.json({
      success: true,
      message: 'Código enviado para seu email',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
