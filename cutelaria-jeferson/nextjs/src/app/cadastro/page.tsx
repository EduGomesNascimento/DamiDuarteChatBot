'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (form.password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name },
        },
      });
      if (error) throw error;
      toast.success('Conta criada! Verifique seu e-mail.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card-dark p-8">
          <h1 className="font-display text-2xl font-black text-white text-center mb-6">Criar Conta</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Nome Completo</label>
              <input required name="name" value={form.name} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">E-mail</label>
              <input required type="email" name="email" value={form.email} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Senha</label>
              <input required type="password" name="password" value={form.password} onChange={handleChange} className="form-input" minLength={8} />
              <p className="text-xs text-gray-600 mt-1">Mínimo 8 caracteres</p>
            </div>
            <div>
              <label className="form-label">Confirmar Senha</label>
              <input required type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="form-input" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-center py-3 disabled:opacity-50">
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta? <Link href="/login" className="text-brand-red hover:underline font-bold">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
