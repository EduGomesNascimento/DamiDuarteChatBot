'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  avatar_url?: string;
  login_method?: string;
  created_at: string;
}

const ADMIN_EMAIL = 'cutelariajeferson@gmail.com';

export default function UsuarioPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [activatingAdmin, setActivatingAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/login');
          return;
        }

        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (data) {
          setUser(data);
          setFormData(data);
        }
      } catch (err: any) {
        toast.error('Erro ao carregar perfil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router, supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          cpf: formData.cpf,
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(formData);
      setEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAdmin = async () => {
    setActivatingAdmin(true);
    try {
      const response = await fetch('/api/admin/activate', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao ativar admin');
      }

      toast.success('Modo admin ativado! Redirecionando...');
      setTimeout(() => router.push('/admin'), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao ativar admin');
    } finally {
      setActivatingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary mb-4">Você precisa estar logado</p>
          <Link href="/login" className="btn-primary">
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-black text-primary mb-2">
            Meu Perfil
          </h1>
          <p className="text-secondary">Gerencie suas informações pessoais</p>
        </div>

        {/* Profile Card */}
        <div className="bg-bg-secondary border border-border rounded-lg p-8">
          {!editing ? (
            // View Mode
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h2 className="text-xl font-bold text-primary mb-6">
                  Informações Pessoais
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">Nome</label>
                    <div className="p-3 bg-bg-card rounded border border-border text-primary">
                      {user.name || '—'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Email</label>
                    <div className="p-3 bg-bg-card rounded border border-border text-primary">
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Telefone</label>
                    <div className="p-3 bg-bg-card rounded border border-border text-primary">
                      {user.phone || '—'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">CPF</label>
                    <div className="p-3 bg-bg-card rounded border border-border text-primary">
                      {user.cpf || '—'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Método de Login</label>
                    <div className="p-3 bg-bg-card rounded border border-border text-primary">
                      {user.login_method === 'google' ? '🔵 Google' : '📧 Email'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Membro desde</label>
                    <div className="p-3 bg-bg-card rounded border border-border text-primary">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="btn-primary w-full sm:w-auto"
              >
                ✏️ Editar Perfil
              </button>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleUpdate} className="space-y-6">
              <h2 className="text-xl font-bold text-primary mb-6">
                Editar Perfil
              </h2>

              <div>
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  value={formData?.name || ''}
                  onChange={e =>
                    setFormData({
                      ...formData!,
                      name: e.target.value,
                    })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">Telefone</label>
                <input
                  type="tel"
                  value={formData?.phone || ''}
                  onChange={e =>
                    setFormData({
                      ...formData!,
                      phone: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="form-label">CPF</label>
                <input
                  type="text"
                  value={formData?.cpf || ''}
                  onChange={e =>
                    setFormData({
                      ...formData!,
                      cpf: e.target.value,
                    })
                  }
                  className="form-input"
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Salvando...' : '💾 Salvar Alterações'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData(user);
                  }}
                  className="btn-outline"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/pedidos"
            className="bg-bg-secondary border border-border rounded-lg p-6 hover:border-brand-red transition-colors text-center"
          >
            <div className="text-3xl mb-2">📦</div>
            <h3 className="font-bold text-primary">Meus Pedidos</h3>
            <p className="text-sm text-secondary">Acompanhe suas compras</p>
          </Link>

          <Link
            href="/usuario/enderecos"
            className="bg-bg-secondary border border-border rounded-lg p-6 hover:border-brand-red transition-colors text-center"
          >
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-bold text-primary">Meus Endereços</h3>
            <p className="text-sm text-secondary">Gerenciar endereços</p>
          </Link>

          <Link
            href="/"
            className="bg-bg-secondary border border-border rounded-lg p-6 hover:border-brand-red transition-colors text-center"
          >
            <div className="text-3xl mb-2">🛍️</div>
            <h3 className="font-bold text-primary">Continuar Comprando</h3>
            <p className="text-sm text-secondary">Voltar à loja</p>
          </Link>

          {user.email === ADMIN_EMAIL && (
            <button
              onClick={handleActivateAdmin}
              disabled={activatingAdmin}
              className="bg-gradient-to-br from-brand-red to-brand-red-dark border border-brand-red rounded-lg p-6 hover:shadow-lg transition-all text-center disabled:opacity-50"
            >
              <div className="text-3xl mb-2">👑</div>
              <h3 className="font-bold text-white">Modo Administrador</h3>
              <p className="text-sm text-white/80">{activatingAdmin ? 'Ativando...' : 'Acessar painel'}</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
