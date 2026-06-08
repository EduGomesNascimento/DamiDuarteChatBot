'use client'

import { formatBRL } from '@/lib/utils'

interface DayRevenue {
  dia: string
  valor: number
}

interface RevenueChartProps {
  data: DayRevenue[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const max = Math.max(...data.map((d) => d.valor), 1)

  return (
    <div className="surface-card p-6">
      <h3 className="font-display font-semibold text-text-primary mb-4">
        Receita — últimos 7 dias
      </h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((d) => {
          const pct = (d.valor / max) * 100
          return (
            <div key={d.dia} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-md bg-primary/30 border border-primary/20 transition-all duration-500 group-hover:bg-primary/50 group-hover:shadow-glow relative"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-2 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-primary whitespace-nowrap z-10 pointer-events-none">
                    {formatBRL(d.valor)}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wide">
                {d.dia}
              </span>
            </div>
          )
        })}
      </div>
      {data.every((d) => d.valor === 0) && (
        <p className="text-center text-text-secondary text-sm mt-4">Sem vendas no período</p>
      )}
    </div>
  )
}
