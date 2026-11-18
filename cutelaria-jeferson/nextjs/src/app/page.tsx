import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import HeroSlider from '@/components/home/HeroSlider';
import ProductCard from '@/components/ui/ProductCard';
import {
  getFeaturedProducts, CATEGORIES, PRODUCTS,
  formatBRL,
} from '@/data/products';

export const metadata: Metadata = {
  title: 'Cutelaria Jeferson — Facas Artesanais Premium',
};

const KIT_BANNERS = [
  {
    label: 'Kit Especial',
    name: 'Kit Triplo\nForjado',
    desc: 'Três facas de 10 polegadas em estojo premium',
    image: '/images/fundo/KIT TRIPLO FORJADO 10 POLEGADAS.jpeg',
    href: '/produto/11',
  },
  {
    label: 'Presente Ideal',
    name: 'Kit Petisqueira\nBoi Inox',
    desc: '7 peças para churrasco profissional',
    image: '/images/fundo/KIT PETISQUEIRA BOI INOX 7 PEÇAS.jpeg',
    href: '/categoria/kits',
  },
  {
    label: 'Destaque da Semana',
    name: 'Facão\nKukri',
    desc: 'Edição limitada em aço carbono',
    image: '/images/fundo/FACÃO KUKRI AÇO CARBONO.jpeg',
    href: '/produto/10',
  },
];

export default function HomePage() {
  const featured = getFeaturedProducts(8);

  return (
    <>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Promo Strip */}
      <div className="bg-brand-gold flex flex-wrap items-center justify-center gap-8 py-2.5 px-4">
        {[
          { icon: '🚚', text: 'Frete Grátis acima de R$299' },
          { icon: '🔒', text: 'Compra 100% Segura' },
          { icon: '↩️', text: 'Troca Fácil em 30 dias' },
          { icon: '⭐', text: '+500 Clientes Satisfeitos' },
        ].map(item => (
          <div key={item.text} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-black">
            <span>{item.icon}</span> {item.text}
          </div>
        ))}
      </div>

      {/* Featured Products */}
      <section className="py-16" id="produtos">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-2">Destaques</p>
              <h2 className="section-title">Produtos em <span className="text-gradient-gold">Destaque</span></h2>
              <div className="w-14 h-0.5 bg-brand-red mt-3" />
            </div>
            <Link href="/categoria/todos" className="border border-brand-red text-brand-red text-sm font-bold px-4 py-2 rounded hover:bg-brand-red hover:text-white transition-all whitespace-nowrap">
              Ver Todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 relative">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-10 bg-bg-secondary">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="relative rounded-xl overflow-hidden border border-brand-red/20 bg-gradient-to-br from-[#1a0005] via-[#300010] to-[#1a0005]">
            <div className="grid md:grid-cols-3 items-center gap-8 p-10">
              <div>
                <p className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-3">✨ Oferta Especial</p>
                <h2 className="font-display text-3xl font-black text-white mb-3">Primeira Compra com Desconto</h2>
                <p className="text-white/70 text-sm mb-6">Cadastre-se e ganhe desconto exclusivo na sua primeira compra em qualquer produto.</p>
                <Link href="/cadastro" className="btn-primary">Criar Conta Grátis →</Link>
              </div>
              <div className="text-center border-x border-brand-red/30 py-4">
                <div className="font-display text-8xl font-black text-brand-red leading-none drop-shadow-[0_0_30px_rgba(196,18,48,0.5)]">5%</div>
                <div className="text-brand-gold text-sm font-bold tracking-widest uppercase mt-1">DE DESCONTO</div>
                <div className="mt-4 border border-dashed border-brand-red rounded px-4 py-2 text-brand-gold font-bold tracking-widest font-mono">
                  PRIMEIRACOMPRA
                </div>
              </div>
              <div className="space-y-3">
                {['Desconto na primeira compra', 'Frete Grátis acima de R$299', 'Parcelamento em até 12x', 'Troca grátis em 30 dias', 'Garantia de qualidade'].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-white/80">
                    <span className="text-brand-gold">✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kits Banners */}
      <section className="py-16" id="kits">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="section-label mb-2">Conjuntos Exclusivos</p>
            <h2 className="section-title">Kits <span className="text-gradient-gold">Artesanais</span></h2>
            <div className="w-14 h-0.5 bg-brand-red mx-auto mt-3 mb-4" />
            <p className="text-gray-500 text-sm max-w-md mx-auto">Conjuntos completos para presentes ou para completar sua coleção.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {KIT_BANNERS.map(kit => (
              <Link key={kit.href} href={kit.href} className="relative overflow-hidden rounded-lg group min-h-[280px] block">
                <Image
                  src={kit.image}
                  alt={kit.name}
                  fill
                  sizes="(max-width:768px) 100vw,33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                  <div className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-1">{kit.label}</div>
                  <div className="font-display text-2xl font-black text-white leading-tight">{kit.name.replace('\n', ' ')}</div>
                  <div className="text-white/70 text-xs mt-1 mb-3">{kit.desc}</div>
                  <span className="text-brand-red text-xs font-bold uppercase tracking-wide">Ver Mais →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Section */}
      <section className="relative min-h-[460px] flex items-center" id="sobre">
        <Image
          src="/images/fundo/FACA DE INOX FULL TANG.jpeg"
          alt="Cutelaria Jeferson"
          fill
          sizes="100vw"
          className="object-cover"
          style={{ position: 'absolute' }}
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 max-w-screen-xl mx-auto px-8 md:px-16 py-20">
          <div className="max-w-xl">
            <p className="text-brand-gold text-xs font-bold tracking-widest uppercase mb-4">Nossa Missão</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Facas <em className="text-gradient-gold">artesanais</em>,<br />criadas para durar gerações
            </h2>
            <p className="text-white/75 mb-8">
              Cada faca que sai da nossa cutelaria é resultado de horas de trabalho manual e paixão pela arte da cutelaria.
            </p>
            <div className="flex gap-10 mb-10">
              {[['10+', 'Anos'], ['500+', 'Clientes'], ['100%', 'Artesanal']].map(([n, l]) => (
                <div key={l} className="text-center">
                  <div className="font-display text-3xl font-black text-brand-red">{n}</div>
                  <div className="text-xs text-white/60 uppercase tracking-wide mt-1">{l}</div>
                </div>
              ))}
            </div>
            <Link href="/categoria/facas" className="btn-primary">Conhecer a Coleção →</Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="section-label mb-2">Navegue por</p>
            <h2 className="section-title">Nossas <span className="text-gradient-gold">Categorias</span></h2>
            <div className="w-14 h-0.5 bg-brand-red mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat.id} href={`/categoria/${cat.id}`} className="relative overflow-hidden rounded-lg group aspect-[4/5] block">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width:640px) 50vw,25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                <div className="absolute bottom-0 p-4 z-10 w-full">
                  <div className="font-display text-lg font-black text-white">{cat.icon} {cat.name}</div>
                  <div className="text-white/60 text-xs mt-0.5">{cat.count} produtos</div>
                  <span className="inline-block mt-2 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded transition-all group-hover:bg-brand-red-dark">
                    Ver Todos
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="py-16 bg-bg-secondary">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-label mb-2">Catálogo Completo</p>
              <h2 className="section-title">Todos os <span className="text-gradient-gold">Produtos</span></h2>
              <div className="w-14 h-0.5 bg-brand-red mt-3" />
            </div>
            <Link href="/categoria/todos" className="border border-brand-red text-brand-red text-sm font-bold px-4 py-2 rounded hover:bg-brand-red hover:text-white transition-all whitespace-nowrap">
              Ver Catálogo →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {PRODUCTS.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/categoria/todos" className="btn-primary">Ver Todos os Produtos →</Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="border-y border-border py-7">
        <div className="max-w-screen-xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🚚', title: 'Frete Grátis', desc: 'Acima de R$299,90' },
            { icon: '🔒', title: 'Compra Segura', desc: 'SSL 256 bits' },
            { icon: '↩️', title: 'Devolução Grátis', desc: '30 dias para trocar' },
            { icon: '🏆', title: 'Qualidade Garantida', desc: '100% artesanal' },
          ].map(item => (
            <div key={item.title} className="flex items-center gap-4 px-4 border-r border-border last:border-r-0">
              <span className="text-3xl text-brand-gold">{item.icon}</span>
              <div>
                <div className="font-bold text-sm text-white">{item.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <section className="py-16 bg-bg-secondary border-t border-border text-center">
        <div className="max-w-xl mx-auto px-4">
          <p className="section-label mb-2">Newsletter</p>
          <h2 className="section-title mb-2">Fique por dentro das <span className="text-gradient-gold">novidades</span></h2>
          <p className="text-gray-500 text-sm mb-8">Receba promoções exclusivas e lançamentos no seu email.</p>
          <form className="flex rounded overflow-hidden border border-border max-w-sm mx-auto" action="#">
            <input
              type="email"
              placeholder="Seu melhor email"
              required
              className="flex-1 px-4 py-3 bg-bg-card text-white text-sm placeholder-gray-600 focus:outline-none"
            />
            <button type="submit" className="bg-brand-red text-white px-5 text-sm font-bold uppercase hover:bg-brand-red-dark transition-colors">
              Assinar
            </button>
          </form>
          <p className="text-xs text-gray-600 mt-3">Sem spam. Cancele quando quiser.</p>
        </div>
      </section>
    </>
  );
}
