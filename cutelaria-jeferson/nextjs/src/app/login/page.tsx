'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'email' | 'google' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState(false);

  const supabase = createClient();

  // ---- EMAIL + SENHA ----
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Login realizado!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  // ---- GOOGLE ----
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || 'Erro ao fazer login com Google');
      setLoading(false);
    }
  };

  // ---- OTP ----
  const handleOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Enviar OTP via email
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar OTP');
      toast.success('Código enviado para seu email!');
      setOtpStep(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Código inválido');
      toast.success('Login com OTP realizado!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card-dark p-8">
          <h1 className="font-display text-2xl font-black text-white text-center mb-2">Entrar na Conta</h1>
          <p className="text-gray-500 text-xs text-center mb-6">Escolha o método que preferir</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'email', label: 'Email' },
              { id: 'google', label: 'Google' },
              { id: 'otp', label: 'OTP' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id as any);
                  setOtpStep(false);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded transition-all ${
                  tab === t.id ? 'bg-brand-red text-white' : 'bg-bg-card text-gray-500 hover:bg-border'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* EMAIL + SENHA */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="form-label">E-mail</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Senha</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-input"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          )}

          {/* GOOGLE */}
          {tab === 'google' && (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn-outline w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              <span className="text-xl">🔵</span> Continuar com Google
            </button>
          )}

          {/* OTP */}
          {tab === 'otp' && (
            <>
              {!otpStep ? (
                <form onSubmit={handleOTPRequest} className="space-y-4">
                  <div>
                    <label className="form-label">E-mail</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
                    {loading ? 'Enviando...' : 'Enviar Código'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOTPVerify} className="space-y-4">
                  <div>
                    <label className="form-label">Código (6 dígitos)</label>
                    <input
                      required
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="form-input text-center tracking-widest"
                      placeholder="000000"
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
                    {loading ? 'Verificando...' : 'Verificar Código'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="text-xs text-gray-500 hover:text-white w-full text-center"
                  >
                    Voltar
                  </button>
                </form>
              )}
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta? <Link href="/cadastro" className="text-brand-red hover:underline font-bold">Criar Conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
