import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  // Handle errors from OAuth provider
  if (error) {
    console.error('OAuth error:', error, error_description);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, request.url)
    );
  }

  // Exchange code for session
  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Exchange code error:', error);
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
        );
      }

      // Successful login - redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    } catch (err) {
      console.error('Callback error:', err);
      return NextResponse.redirect(
        new URL('/login?error=Erro ao processar login', request.url)
      );
    }
  }

  // No code or error provided
  return NextResponse.redirect(new URL('/login?error=Código não fornecido', request.url));
}
