/**
 * Autenticação avançada
 * - Email + Senha
 * - Google OAuth
 * - OTP
 */

import { createClient } from '@/lib/supabase/client';

export interface OTPResult {
  success: boolean;
  message: string;
  expiresIn?: number;
}

/**
 * Enviar OTP por email
 * Simula envio (em produção, usar Resend/SendGrid)
 */
export async function sendOTP(email: string): Promise<OTPResult> {
  const supabase = createClient();

  // Gerar código aleatório de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Salvar no banco (expira em 5 minutos)
  const { error } = await supabase
    .from('users')
    .update({
      otp_code: code,
      otp_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      otp_attempts: 0,
    })
    .eq('email', email);

  if (error) {
    return { success: false, message: 'Erro ao gerar OTP' };
  }

  // TODO: Enviar email com código
  // await sendEmail(email, `Seu código: ${code}`);

  console.log(`📧 OTP para ${email}: ${code} (5 min)`);

  return {
    success: true,
    message: 'Código enviado por email',
    expiresIn: 5 * 60, // segundos
  };
}

/**
 * Verificar OTP
 */
export async function verifyOTP(email: string, code: string): Promise<OTPResult> {
  const supabase = createClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('otp_code, otp_expires_at, otp_attempts')
    .eq('email', email)
    .single();

  if (error || !user) {
    return { success: false, message: 'Usuário não encontrado' };
  }

  // Verificar se expirou
  if (new Date(user.otp_expires_at) < new Date()) {
    return { success: false, message: 'Código expirado. Solicite um novo.' };
  }

  // Verificar tentativas (máx 3)
  if (user.otp_attempts >= 3) {
    return { success: false, message: 'Muito tentativas. Solicite um novo código.' };
  }

  // Verificar código
  if (user.otp_code !== code) {
    await supabase
      .from('users')
      .update({ otp_attempts: (user.otp_attempts || 0) + 1 })
      .eq('email', email);
    return { success: false, message: 'Código inválido' };
  }

  // Limpar OTP
  await supabase
    .from('users')
    .update({
      otp_code: null,
      otp_expires_at: null,
      otp_attempts: 0,
    })
    .eq('email', email);

  return { success: true, message: 'OTP verificado com sucesso' };
}

/**
 * Login com Google
 */
export async function loginWithGoogle() {
  const supabase = createClient();

  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      scopes: 'profile email',
    },
  });
}

/**
 * Registrar com email + senha
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        login_method: 'email',
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Conta criada. Verifique seu email.' };
}

/**
 * Login com email + senha
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Login realizado' };
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/**
 * Obter usuário atual
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}

/**
 * Verificar se é admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}
