import { Counter } from '@/components/ui/Counter'
import { Reveal } from '@/components/ui/Reveal'

export function Stats({
  produtos,
  pedidos,
  clientes,
}: {
  produtos: number
  pedidos: number
  clientes: number
}) {
  const items = [
    { label: 'Produtos no catálogo', value: produtos, suffix: '' },
    { label: 'Pedidos enviados', value: pedidos, suffix: '' },
    { label: 'Makers atendidos', value: clientes, suffix: '' },
    { label: 'Satisfação', value: 98, suffix: '%' },
  ]
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <Reveal className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="gradient-border p-6 text-center">
            <div className="font-display text-3xl font-bold text-primary sm:text-4xl">
              <Counter to={it.value} suffix={it.suffix} />
            </div>
            <div className="mt-1 text-sm text-text-secondary">{it.label}</div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
