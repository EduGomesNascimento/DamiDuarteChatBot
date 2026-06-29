import Link from 'next/link'
import { Reveal } from '@/components/ui/Reveal'
import type { CategoriaDTO } from '@/lib/types'

const ICONS: Record<string, string> = {
  'placas-mcu': '🧠',
  'sensores-modulos': '📡',
  resistores: '🟧',
  capacitores: '🧪',
  'indutores-cristais': '🌀',
  transistores: '🔺',
  'mosfets-reguladores': '⚡',
  diodos: '🔻',
  'circuitos-integrados': '🔳',
  'leds-iluminacao': '💡',
  'buzzers-audio': '🔊',
  'reles-chaves-botoes': '🎛️',
  'energia-protecao': '🔋',
  'prototipagem-pcb': '🧰',
  'ferramentas-solda': '🛠️',
  instrumentacao: '📟',
  'cabos-acessorios': '🔌',
}

export function Categories({ categorias }: { categorias: CategoriaDTO[] }) {
  if (categorias.length === 0) return null
  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <Reveal className="mb-3">
        <h2 className="text-lg font-bold text-text-primary">Navegue por categoria</h2>
      </Reveal>
      <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible lg:grid-cols-8">
        {categorias.map((c) => (
          <Link
            key={c.id}
            href={`/catalogo?categoria=${c.slug}`}
            className="surface-card flex shrink-0 flex-col items-center gap-2 p-4 text-center w-28 sm:w-auto"
          >
            <span className="text-2xl">{ICONS[c.slug] || '🔧'}</span>
            <span className="text-xs font-semibold text-text-primary leading-tight">{c.nome}</span>
            <span className="text-[11px] text-text-secondary">
              {c.totalProdutos ?? 0} itens
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
