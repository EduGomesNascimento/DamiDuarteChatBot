import { Reveal } from '@/components/ui/Reveal'

const ITENS = [
  {
    icon: '⚡',
    titulo: 'Entrega rápida no RS',
    desc: 'Saímos de Portão/RS. Retirada local e Sedex pra você não esperar o projeto esfriar.',
  },
  {
    icon: '✅',
    titulo: 'Componentes testados',
    desc: 'Cada lote passa por verificação. Nada de placa que chega morta da caixa.',
  },
  {
    icon: '🛠️',
    titulo: 'Suporte técnico real',
    desc: 'Dúvida de pinagem, toolchain ou firmware? A gente manja e responde.',
  },
  {
    icon: '📐',
    titulo: 'Specs honestas',
    desc: 'Datasheet, pinout e limitações reais. Sem marketing inflado de clock.',
  },
]

export function WhyBuy() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <Reveal className="mb-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Por que comprar aqui?</h2>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITENS.map((it, i) => (
          <Reveal key={it.titulo} delay={i * 80}>
            <div className="surface-card h-full p-6 transition-shadow hover:shadow-glow">
              <span className="text-3xl">{it.icon}</span>
              <h3 className="mt-3 font-display font-semibold">{it.titulo}</h3>
              <p className="mt-2 text-sm text-text-secondary">{it.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
