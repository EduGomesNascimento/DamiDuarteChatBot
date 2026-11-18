'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Address } from '@/types';
import toast from 'react-hot-toast';

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
      setDefaultAddress(data?.find(a => a.is_default) || null);
    } catch (err) {
      console.error('Failed to load addresses:', err);
      setError('Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData: Omit<Address, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If this is default, unset others
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert([{
          ...addressData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setAddresses([data, ...addresses]);
      if (data.is_default) setDefaultAddress(data);
      toast.success('Endereço adicionado!');
      return data;
    } catch (err) {
      console.error('Failed to add address:', err);
      toast.error('Erro ao adicionar endereço');
      throw err;
    }
  };

  const updateAddress = async (id: string, addressData: Partial<Address>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // If setting as default, unset others
      if (addressData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setAddresses(addresses.map(a => a.id === id ? data : a));
      if (data.is_default) {
        setDefaultAddress(data);
      } else if (defaultAddress?.id === id) {
        setDefaultAddress(null);
      }
      toast.success('Endereço atualizado!');
      return data;
    } catch (err) {
      console.error('Failed to update address:', err);
      toast.error('Erro ao atualizar endereço');
      throw err;
    }
  };

  const removeAddress = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      const updated = addresses.filter(a => a.id !== id);
      setAddresses(updated);
      if (defaultAddress?.id === id) {
        setDefaultAddress(null);
      }
      toast.success('Endereço removido!');
    } catch (err) {
      console.error('Failed to remove address:', err);
      toast.error('Erro ao remover endereço');
      throw err;
    }
  };

  const setDefault = async (id: string) => {
    try {
      await updateAddress(id, { is_default: true });
    } catch (err) {
      console.error('Failed to set default:', err);
      throw err;
    }
  };

  return {
    addresses,
    defaultAddress,
    loading,
    error,
    addAddress,
    updateAddress,
    removeAddress,
    setDefault,
    reload: loadAddresses,
  };
}
