'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCEP, formatBRL } from '@/lib/utils';
import type { ShippingOption, Address } from '@/types';
import toast from 'react-hot-toast';

interface ShippingCalculatorProps {
  weight?: number;
  price?: number;
}

export default function ShippingCalculator({ weight = 0.5, price = 100 }: ShippingCalculatorProps) {
  const [cep, setCep] = useState('');
  const [lastCep, setLastCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const supabase = createClient();

  // Load last CEP and default address on mount
  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('lastCEP');
    if (saved) {
      setLastCep(saved);
      setCep(saved);
    }

    // Load default address if user is logged in
    loadDefaultAddress();
  }, []);

  const loadDefaultAddress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (data) {
        setDefaultAddress(data);
        setCep(data.zip_code);
        setLastCep(data.zip_code);
        // Auto-calculate for default address
        calculateShipping(data.zip_code);
      }
    } catch (err) {
      console.error('Failed to load default address:', err);
    }
  };

  const calculateShipping = async (cepValue: string = cep) => {
    if (!cepValue || cepValue.replace(/\D/g, '').length !== 8) {
      toast.error('CEP inválido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep: cepValue,
          weight,
          price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao calcular frete');
      }

      setOptions(data);
      setSelectedOption(data[0]); // Default to first option
      localStorage.setItem('lastCEP', cepValue);
      setLastCep(cepValue);
    } catch (error) {
      console.error('Shipping calculation failed:', error);
      toast.error('Erro ao calcular frete');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5, 8);
    }
    setCep(value);
  };

  return (
    <div className="card-dark p-6 rounded-lg border border-border">
      <h3 className="text-lg font-bold text-primary mb-4">📦 Calcular Frete</h3>

      {/* CEP Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={cep}
          onChange={handleCepChange}
          placeholder="00000-000"
          maxLength={9}
          className="flex-1 form-input"
        />
        <button
          onClick={() => calculateShipping()}
          disabled={loading}
          className="btn-primary px-6"
        >
          {loading ? '⏳ Calculando...' : '🔍 Calcular'}
        </button>
      </div>

      {/* Default Address Info */}
      {defaultAddress && (
        <p className="text-xs text-secondary mb-4">
          Endereço padrão: {defaultAddress.street}, {defaultAddress.number} — {defaultAddress.city}, {defaultAddress.state}
        </p>
      )}

      {/* Shipping Options */}
      {options.length > 0 && (
        <div className="space-y-3">
          {options.map((option) => (
            <label key={`${option.carrier}-${option.name}`} className="flex items-center p-3 rounded border border-border cursor-pointer hover:bg-bg-card transition-colors">
              <input
                type="radio"
                name="shipping"
                checked={selectedOption?.name === option.name}
                onChange={() => setSelectedOption(option)}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-semibold text-primary">{option.name}</div>
                <div className="text-xs text-secondary">{option.carrier}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-brand-gold">{formatBRL(option.price)}</div>
                <div className="text-xs text-secondary">{option.days} dias úteis</div>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Selected Option Summary */}
      {selectedOption && (
        <div className="mt-4 p-3 bg-brand-red/10 rounded border border-brand-red/20">
          <p className="text-sm text-primary font-semibold">
            ✓ {selectedOption.name} — {formatBRL(selectedOption.price)} ({selectedOption.days} dias)
          </p>
        </div>
      )}

      {options.length === 0 && lastCep && !loading && (
        <p className="text-xs text-secondary text-center py-4">
          Digite um CEP e clique em "Calcular" para ver as opções de frete
        </p>
      )}
    </div>
  );
}
