'use client';

import { useState } from 'react';
import ResellersModal from '@/components/ResellersModal';

export default function RevendedorPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const benefits = [
    {
      icon: '💰',
      title: 'Margens Atrativas',
      description: 'Preços especiais para revendedores com margens que viabilizam seu negócio.',
    },
    {
      icon: '📦',
      title: 'Produtos Premium',
      description: 'Facas artesanais de alta qualidade, feitas à mão com os melhores materiais.',
    },
    {
      icon: '📱',
      title: 'Marketing de Apoio',
      description: 'Materiais promocionais, fotos em alta resolução e suporte em redes sociais.',
    },
    {
      icon: '🤝',
      title: 'Suporte Dedicado',
      description: 'Equipe pronta para ajudar com pedidos, dúvidas e estratégias de venda.',
    },
    {
      icon: '📊',
      title: 'Relatórios',
      description: 'Acompanhe seus pedidos e comissões através de um portal exclusivo.',
    },
    {
      icon: '🚚',
      title: 'Logística Ágil',
      description: 'Frete preferencial e prazos diferenciados para revendedores.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-bg-secondary to-bg-primary py-20">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <div className="inline-block badge-red mb-4">🤝 PROGRAMA DE REVENDEDORES</div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-white mb-6">
            Venda Facas <span className="text-gradient-gold">Artesanais Premium</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Junte-se à rede Cutelaria Jeferson e cresça seu negócio com produtos de qualidade excepcional.
            Suporte completo, margens atrativas e uma comunidade de revendedores de sucesso.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary btn-lg text-lg"
          >
            Quero Ser Revendedor
          </button>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="section-title text-center mb-16">Por que ser um Revendedor?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="card-dark p-8 text-center hover:scale-105 transition-transform"
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-black text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-bg-secondary">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="section-title text-center mb-16">Como Funciona?</h2>
          <div className="max-w-3xl mx-auto">
            {[
              {
                step: 1,
                title: 'Candidature-se',
                description: 'Preencha nosso formulário com suas informações e experiência no comércio.',
              },
              {
                step: 2,
                title: 'Análise',
                description: 'Nossa equipe analisará sua candidatura e entrará em contato para discutir oportunidades.',
              },
              {
                step: 3,
                title: 'Aprovação',
                description: 'Após aprovado, você receberá acesso ao portal de revendedores e precificação especial.',
              },
              {
                step: 4,
                title: 'Começar a Vender',
                description: 'Comece a vender nossos produtos com margens especiais e suporte dedicado.',
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 mb-8 last:mb-0">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-brand-red text-white font-display font-black text-lg">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="section-title text-center mb-16">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Qual é o investimento inicial?',
                a: 'Não há investimento obrigatório. Você pode começar pequeno e crescer conforme o seu negócio avança.',
              },
              {
                q: 'Posso vender exclusivamente em uma região?',
                a: 'Sim! Oferecemos diferentes modelos de exclusividade territorial dependendo do potencial de venda.',
              },
              {
                q: 'Qual é a margem de lucro?',
                a: 'As margens variam entre 30-50% dependendo do volume de pedidos e tipo de produto.',
              },
              {
                q: 'Como faço pedidos?',
                a: 'Através de um portal exclusivo onde você pode fazer pedidos, acompanhar comissões e acessar materiais de marketing.',
              },
              {
                q: 'E se não conseguir vender?',
                a: 'Sem problema! Não há volume mínimo obrigatório, você vende no seu ritmo.',
              },
            ].map((item, i) => (
              <details
                key={i}
                className="bg-bg-card border border-border rounded p-4 cursor-pointer hover:border-brand-red transition-colors"
              >
                <summary className="font-bold text-white hover:text-brand-red transition-colors">
                  {item.q}
                </summary>
                <p className="mt-3 text-gray-400 text-sm">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-red">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl font-black text-white mb-6">
            Pronto para crescer?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Faça parte de uma comunidade de revendedores de sucesso. Envie sua candidatura agora mesmo!
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-white hover:bg-gray-100 text-brand-red font-bold py-4 px-8 rounded text-lg transition-colors"
          >
            Enviar Candidatura
          </button>
        </div>
      </section>

      <ResellersModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
