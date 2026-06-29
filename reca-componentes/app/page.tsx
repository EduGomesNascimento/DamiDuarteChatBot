import Link from 'next/link'
import { Categories } from '@/components/home/Categories'
import { ProductCard } from '@/components/produto/ProductCard'
import { readConfig } from '@/lib/config'
import { listarCategorias, listarProdutos } from '@/lib/data'
import type { CategoriaDTO, ProdutoDTO } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let categorias: CategoriaDTO[] = []
  let produtos: ProdutoDTO[] = []
  let bannerTexto: string | null = 'Frete grátis acima de R$ 299'

  try {
    const config = await readConfig()
    ;[categorias, produtos] = await Promise.all([listarCategorias(), listarProdutos({})])
    if (config.bannerTexto) bannerTexto = config.bannerTexto
  } catch {
    // Banco indisponível — renderiza estrutura com dados mínimos.
  }

  const vitrine = produtos.slice(0, 40)

  return (
    <>
      {bannerTexto && (
        <div className="border-b border-line bg-surface px-4 py-2 text-center text-xs font-medium text-text-secondary">
          {bannerTexto}
        </div>
      )}

      <Categories categorias={categorias} />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
            {vitrine.length > 0 ? 'Componentes em destaque' : 'Catálogo'}
          </h2>
          <Link href="/catalogo" className="text-sm text-primary hover:underline">
            Ver catálogo completo →
          </Link>
        </div>

        {vitrine.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {vitrine.map((p) => (
              <ProductCard key={p.id} produto={p} />
            ))}
          </div>
        ) : (
          <div className="surface-card p-8 text-center text-text-secondary">
            Não foi possível carregar os produtos agora. Tente novamente em breve ou acesse o{' '}
            <Link href="/catalogo" className="text-primary hover:underline">
              catálogo completo
            </Link>
            .
          </div>
        )}
      </section>
    </>
  )
}
