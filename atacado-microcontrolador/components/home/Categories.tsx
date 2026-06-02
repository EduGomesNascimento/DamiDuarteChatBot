import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import type { CategoriaDTO } from '@/lib/types'

const ICONS: Record<string, string> = {
  'st-arm': '🧠',
  'esp-wifi': '📡',
  'arduino-avr': '🔌',
  'raspberry-pi': '🍓',
  acessorios: '🧰',
}

export function Categories({ categorias }: { categorias: CategoriaDTO[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <Reveal className="mb-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Navegue por categoria</h2>
        <p className="mt-1 text-text-secondary">Escolha sua arquitetura preferida.</p>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {categorias.map((c, i) => (
          <Reveal key={c.id} delay={i * 60}>
            <Link
              href={`/catalogo?categoria=${c.slug}`}
              className="tilt surface-card flex h-full flex-col items-center gap-3 p-6 text-center transition-colors hover:border-primary/40"
            >
              <span className="text-4xl">{ICONS[c.slug] || '🔧'}</span>
              <span className="font-display font-semibold">{c.nome}</span>
              <span className="font-mono text-xs text-text-secondary">
                {c.totalProdutos ?? 0} itens
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
