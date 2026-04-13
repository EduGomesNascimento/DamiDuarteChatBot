'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

interface ResellersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResellersModal({ isOpen, onClose }: ResellersModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    company: '',
    experience: '',
    message: '',
  });
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('resellers').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          company: formData.company || null,
          experience: formData.experience || null,
          message: formData.message || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success('Sua aplicação foi enviada! Entraremos em contato em breve.');
      setFormData({ name: '', email: '', phone: '', city: '', company: '', experience: '', message: '' });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar aplicação');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-bg-secondary rounded-lg w-full max-w-2xl border border-border animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-bg-secondary rounded-t-lg">
          <h2 className="text-xl font-display font-black text-primary">Seja um Revendedor</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-bg-card p-4 rounded border border-border">
            <p className="text-primary mb-2">
              🎯 <strong>Faça parte da rede Cutelaria Jeferson!</strong>
            </p>
            <p className="text-sm text-secondary">
              Buscamos parceiros para distribuir nossos produtos artesanais. Com margens atrativas,
              suporte ao revendedor e marketing de apoio, sua revenda de facas artesanais será um sucesso.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="form-label">Email *</label>
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
                <label className="form-label">WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="form-label">Cidade *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="form-input"
                  placeholder="Ex: São Paulo"
                />
              </div>

              <div>
                <label className="form-label">Razão Social / Empresa</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="form-input"
                  placeholder="Seu negócio (opcional)"
                />
              </div>

              <div>
                <label className="form-label">Experiência</label>
                <select
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value })}
                  className="form-input"
                >
                  <option value="">Selecione...</option>
                  <option value="primeira-vez">Primeira vez vendendo</option>
                  <option value="iniciante">Iniciante (0-1 ano)</option>
                  <option value="intermediario">Intermediário (1-3 anos)</option>
                  <option value="experiência">Experiente (3+ anos)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Mensagem / Comentários</label>
              <textarea
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="form-input resize-none h-24"
                placeholder="Conte-nos um pouco sobre seu negócio e suas expectativas..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary justify-center disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Candidatura'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-outline justify-center"
              >
                Cancelar
              </button>
            </div>

            <p className="text-xs text-secondary text-center">
              Entraremos em contato para discutir as oportunidades disponíveis.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
