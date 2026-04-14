'use client';

import { useState } from 'react';
import Link from 'next/link';
import ContactModal from '@/components/ContactModal';
import ResellersModal from '@/components/ResellersModal';

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false);
  const [resellersOpen, setResellersOpen] = useState(false);

  return (
    <footer className="bg-[#080808] border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Main */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-14">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <span className="text-2xl">⚔️</span>
              <div className="leading-none">
                <div className="font-display text-xl font-black">JEFERSON</div>
                <div className="text-[10px] tracking-[0.18em] text-brand-gold uppercase">Cutelaria Artesanal</div>
              </div>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Cutelaria artesanal com qualidade premium. Criamos facas e acessórios que são obras de arte e ferramentas ao mesmo tempo.
            </p>
          </div>

          {/* Loja */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4 pb-2.5 border-b border-border">Loja</h5>
            <ul className="space-y-2.5">
              {[
                { href: '/categoria/facas', label: 'Facas Artesanais' },
                { href: '/categoria/kits', label: 'Kits' },
                { href: '/categoria/acessorios', label: 'Acessórios' },
                { href: '/categoria/promocoes', label: 'Promoções' },
                { href: '/categoria/todos', label: 'Ver Tudo' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-brand-red hover:pl-1 transition-all">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4 pb-2.5 border-b border-border">Informações</h5>
            <ul className="space-y-2.5">
              {[
                { label: 'Sobre Nós', href: '#' },
                { label: 'Política de Entrega', href: '#' },
                { label: 'Trocas e Devoluções', href: '#' },
                { label: 'Política de Privacidade', href: '#' },
                { label: 'Termos de Uso', href: '#' },
              ].map(item => (
                <li key={item.label}>
                  <a href={item.href} className="text-sm text-gray-500 hover:text-brand-red hover:pl-1 transition-all">{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4 pb-2.5 border-b border-border">Contato</h5>
            <div className="space-y-3 text-sm text-gray-500">
              <div className="flex gap-3"><span className="text-brand-gold">📍</span><span>Rua das Cutelarias, 123<br />São Paulo - SP</span></div>
              <div className="flex gap-3"><span className="text-brand-gold">📞</span><a href="tel:+5511999999999" className="hover:text-white transition-colors">(11) 99999-9999</a></div>
              <div className="flex gap-3"><span className="text-brand-gold">📧</span><a href="mailto:contato@cutelariajeferson.com.br" className="hover:text-white transition-colors text-xs">contato@cutelariajeferson.com.br</a></div>
              <div className="flex gap-3"><span className="text-brand-gold">⏰</span><span>Seg–Sex: 8h–18h<br />Sáb: 9h–14h</span></div>
              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => setContactOpen(true)}
                  className="text-xs bg-brand-red hover:bg-brand-red-dark text-white px-3 py-1.5 rounded transition-colors"
                >
                  💬 Contato
                </button>
                <button
                  onClick={() => setResellersOpen(true)}
                  className="text-xs bg-brand-gold hover:bg-brand-gold-light text-black px-3 py-1.5 rounded transition-colors"
                >
                  🤝 Revendedor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2025 Cutelaria Jeferson. Todos os direitos reservados. CNPJ: 00.000.000/0001-00</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {['💳 Visa', '💳 Master', '💳 Elo', '📱 PIX', '📄 Boleto'].map(p => (
              <span key={p} className="text-[10px] bg-bg-card border border-border px-2 py-1 rounded text-gray-500">{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      <ResellersModal isOpen={resellersOpen} onClose={() => setResellersOpen(false)} />
    </footer>
  );
}
