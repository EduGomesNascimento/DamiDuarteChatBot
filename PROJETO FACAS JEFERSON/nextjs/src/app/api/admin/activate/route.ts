import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = 'cutelariajeferson@gmail.com';

export async function POST() {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verify email
    if (user.email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Email não autorizado para modo admin' },
        { status: 403 }
      );
    }

    // Update user role
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update user role:', updateError);
      return NextResponse.json(
        { error: 'Erro ao ativar modo admin' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Modo admin ativado com sucesso',
    });
  } catch (error) {
    console.error('Admin activation error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
