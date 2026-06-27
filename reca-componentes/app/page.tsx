import { Hero } from '@/components/home/Hero'
import { Categories } from '@/components/home/Categories'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { WhyBuy } from '@/components/home/WhyBuy'
import { Stats } from '@/components/home/Stats'
import { listarCategorias, listarDestaques, estatisticas } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let categorias: Awaited<ReturnType<typeof listarCategorias>> = []
  let destaques: Awaited<ReturnType<typeof listarDestaques>> = []
  let stats = { produtos: 18, pedidos: 4721, clientes: 1280 }

  try {
    ;[categorias, destaques, stats] = await Promise.all([
      listarCategorias(),
      listarDestaques(8),
      estatisticas(),
    ])
  } catch {
    // Banco indisponível — renderiza estrutura com dados mínimos.
  }

  return (
    <>
      <Hero />
      <Stats produtos={stats.produtos} pedidos={stats.pedidos} clientes={stats.clientes} />
      <Categories categorias={categorias} />
      <FeaturedProducts produtos={destaques} />
      <WhyBuy />
    </>
  )
}
