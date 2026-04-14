'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAddresses } from '@/hooks/useAddresses';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Address } from '@/types';

export default function AddressesPage() {
  const { addresses, defaultAddress, loading, addAddress, updateAddress, removeAddress, setDefault } = useAddresses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: 'Casa',
    recipient_name: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    is_default: false,
  });
  const [fetching, setFetching] = useState(false);
  const [authError, setAuthError] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAuthError(true);
    }
  };

  const openModal = (address?: Address) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        name: address.name,
        recipient_name: address.recipient_name,
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        is_default: address.is_default,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: 'Casa',
        recipient_name: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        is_default: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleCepChange = async (cep: string) => {
    setFormData({ ...formData, zip_code: cep });

    const clean = cep.replace(/\D/g, '');
    if (clean.length === 8) {
      try {
        setFetching(true);
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(f => ({
            ...f,
            street: data.logradouro || f.street,
            neighborhood: data.bairro || f.neighborhood,
            city: data.localidade || f.city,
            state: data.uf || f.state,
          }));
        }
      } catch (err) {
        console.error('ViaCEP error:', err);
      } finally {
        setFetching(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recipient_name || !formData.street || !formData.number || !formData.city || !formData.state || !formData.zip_code) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (editingId) {
        await updateAddress(editingId, formData);
      } else {
        await addAddress(formData as Omit<Address, 'id' | 'user_id' | 'created_at'>);
      }
      closeModal();
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este endereço?')) {
      await removeAddress(id);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefault(id);
  };

  if (authError) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-primary mb-4">Você precisa estar logado para acessar esta página.</p>
          <Link href="/login" className="btn-primary">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-bg-primary">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl font-black text-primary">🏠 Meus Endereços</h1>
          <button onClick={() => openModal()} className="btn-primary">
            + Adicionar Endereço
          </button>
        </div>

        {/* Addresses List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-secondary">Carregando endereços...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="card-dark p-8 text-center">
            <p className="text-secondary mb-4">Você ainda não adicionou nenhum endereço.</p>
            <button onClick={() => openModal()} className="btn-primary">
              Adicionar Primeiro Endereço
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map(address => (
              <div key={address.id} className="card-dark p-6 border border-border hover:border-brand-red/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-primary text-lg">
                      {address.name}
                      {address.is_default && (
                        <span className="ml-2 inline-block bg-brand-gold text-black text-xs font-bold px-2 py-1 rounded">
                          PADRÃO
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-secondary mt-1">
                      {address.recipient_name}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-secondary space-y-1 mb-4">
                  <p>{address.street}, {address.number}</p>
                  {address.complement && <p>{address.complement}</p>}
                  <p>{address.neighborhood} — {address.city}, {address.state}</p>
                  <p className="font-mono">{address.zip_code}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => openModal(address)}
                    className="btn-outline text-xs"
                  >
                    ✏️ Editar
                  </button>
                  {!address.is_default && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="btn-outline text-xs"
                    >
                      ⭐ Tornar Padrão
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(address.id)}
                    className="btn-outline text-xs text-brand-red hover:bg-brand-red/10"
                  >
                    🗑️ Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="card-dark rounded-lg w-full max-w-md border border-border p-6">
              <h2 className="text-xl font-bold text-primary mb-4">
                {editingId ? '✏️ Editar Endereço' : '➕ Novo Endereço'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Label */}
                <div>
                  <label className="form-label">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="Casa, Trabalho, etc"
                  />
                </div>

                {/* Recipient */}
                <div>
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.recipient_name}
                    onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                    className="form-input"
                  />
                </div>

                {/* CEP */}
                <div>
                  <label className="form-label">CEP *</label>
                  <input
                    type="text"
                    required
                    value={formData.zip_code}
                    onChange={e => handleCepChange(e.target.value)}
                    className="form-input"
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>

                {/* Street */}
                <div>
                  <label className="form-label">Rua *</label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={e => setFormData({ ...formData, street: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Number */}
                  <div>
                    <label className="form-label">Número *</label>
                    <input
                      type="text"
                      required
                      value={formData.number}
                      onChange={e => setFormData({ ...formData, number: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  {/* Complement */}
                  <div>
                    <label className="form-label">Complemento</label>
                    <input
                      type="text"
                      value={formData.complement}
                      onChange={e => setFormData({ ...formData, complement: e.target.value })}
                      className="form-input"
                      placeholder="Apto, Sala, etc"
                    />
                  </div>
                </div>

                {/* Neighborhood */}
                <div>
                  <label className="form-label">Bairro *</label>
                  <input
                    type="text"
                    required
                    value={formData.neighborhood}
                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* City */}
                  <div className="col-span-2">
                    <label className="form-label">Cidade *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="form-label">Estado *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                      className="form-input"
                      maxLength={2}
                    />
                  </div>
                </div>

                {/* Default */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                  />
                  <span className="text-sm text-secondary">Usar como endereço padrão</span>
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    type="submit"
                    disabled={fetching}
                    className="flex-1 btn-primary justify-center disabled:opacity-50"
                  >
                    {fetching ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 btn-outline justify-center"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
