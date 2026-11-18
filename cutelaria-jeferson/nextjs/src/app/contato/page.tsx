'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';

export default function ContatoPage() {
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
    } catch (err: any) {
      toast.error(err.message || 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-bg-secondary to-bg-primary py-16">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-4">
            Entre em <span className="text-gradient-gold">Contato</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Dúvidas? Sugestões? Estamos aqui para ajudar!
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-display font-black text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📍</span> Endereço
                </h3>
                <p className="text-gray-400">
                  Rua das Cutelarias, 123<br />
                  São Paulo - SP, 01000-000<br />
                  Brasil
                </p>
              </div>

              <div>
                <h3 className="text-xl font-display font-black text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📞</span> Telefone
                </h3>
                <p className="text-gray-400">
                  <a href="tel:+5511999999999" className="hover:text-brand-red transition-colors">
                    (11) 99999-9999
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-display font-black text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">💬</span> WhatsApp
                </h3>
                <p className="text-gray-400">
                  <a
                    href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os produtos da Cutelaria Jeferson."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-red transition-colors"
                  >
                    Clique para conversar
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-display font-black text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📧</span> Email
                </h3>
                <p className="text-gray-400">
                  <a href="mailto:contato@cutelariajeferson.com.br" className="hover:text-brand-red transition-colors">
                    contato@cutelariajeferson.com.br
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-display font-black text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⏰</span> Horário
                </h3>
                <p className="text-gray-400">
                  Segunda a Sexta: 8h–18h<br />
                  Sábado: 9h–14h<br />
                  Domingo: Fechado
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-bg-secondary border border-border rounded-lg p-8">
                <h2 className="text-2xl font-display font-black text-white mb-6">Envie uma Mensagem</h2>

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
                  </div>

                  <div>
                    <label className="form-label">Telefone (opcional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="form-label">Mensagem *</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="form-input resize-none h-40"
                      placeholder="Sua mensagem aqui..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary justify-center py-3 disabled:opacity-50"
                  >
                    {loading ? 'Enviando...' : 'Enviar Mensagem'}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Responderemos sua mensagem em até 24 horas.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map or Additional Info */}
      <section className="py-20 bg-bg-secondary">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="bg-bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-display font-black text-white mb-4">
              Preferência de Contato?
            </h2>
            <p className="text-gray-400 mb-8">
              Escolha a forma que melhor se encaixa em você:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os produtos da Cutelaria Jeferson."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition-colors"
              >
                💬 WhatsApp
              </a>
              <a
                href="mailto:contato@cutelariajeferson.com.br"
                className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 rounded transition-colors"
              >
                📧 Email
              </a>
              <a
                href="tel:+5511999999999"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition-colors"
              >
                📞 Telefone
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
