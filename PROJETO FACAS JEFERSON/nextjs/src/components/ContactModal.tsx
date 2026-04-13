'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [tab, setTab] = useState<'form' | 'whatsapp'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('contacts').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success('Mensagem enviada! Entraremos em contato em breve.');
      setFormData({ name: '', email: '', phone: '', message: '' });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      'Olá! Gostaria de saber mais sobre os produtos da Cutelaria Jeferson.'
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-secondary rounded-lg w-full max-w-md border border-border animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-display font-black text-primary">Entre em Contato</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab('form')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === 'form'
                ? 'border-b-2 border-brand-red text-brand-red'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Formulário
          </button>
          <button
            onClick={() => setTab('whatsapp')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === 'whatsapp'
                ? 'border-b-2 border-brand-red text-brand-red'
                : 'text-secondary hover:text-primary'
            }`}
          >
            WhatsApp
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="form-label">WhatsApp (opcional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="form-label">Mensagem</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  className="form-input resize-none h-32"
                  placeholder="Sua mensagem aqui..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-secondary">
                Prefere conversar pelo WhatsApp? Clique no botão abaixo para falar conosco!
              </p>
              <button
                onClick={handleWhatsApp}
                className="w-full bg-brand-gold hover:bg-brand-gold-light text-black font-semibold py-3 rounded transition-colors flex items-center justify-center gap-2"
              >
                💬 Abrir WhatsApp
              </button>
              <p className="text-xs text-secondary">
                Você será redirecionado para o WhatsApp da Cutelaria Jeferson
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
