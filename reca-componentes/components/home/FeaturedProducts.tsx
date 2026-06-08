import Link from 'next/link'
import { ProductCard } from '@/components/produto/ProductCard'
import { Reveal } from '@/components/ui/Reveal'
import type { ProdutoDTO } from '@/lib/types'

export function FeaturedProducts({ produtos }: { produtos: ProdutoDTO[] }) {
  if (produtos.length === 0) return null
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <Reveal className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Em destaque</h2>
          <p className="mt-1 text-text-secondary">Os queridinhos da bancada.</p>
        </div>
        <Link href="/catalogo" className="text-sm text-primary hover:underline">
          Ver tudo →
        </Link>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {produtos.map((p, i) => (
          <Reveal key={p.id} delay={i * 60}>
            <ProductCard produto={p} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
