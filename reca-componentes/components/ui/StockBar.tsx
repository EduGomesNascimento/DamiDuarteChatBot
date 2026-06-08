'use client'

import { nivelEstoque } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function StockBar({ estoque, className }: { estoque: number; className?: string }) {
  const nivel = nivelEstoque(estoque)

  const config = {
    alto: { label: 'Em estoque', cor: 'bg-success', texto: 'text-success', pct: 100, pulse: false },
    medio: { label: 'Poucas unidades', cor: 'bg-warning', texto: 'text-warning', pct: 55, pulse: false },
    baixo: {
      label: `ÚLTIMAS ${estoque} UNIDADES!`,
      cor: 'bg-danger',
      texto: 'text-danger',
      pct: 22,
      pulse: true,
    },
    esgotado: { label: 'Fora de estoque', cor: 'bg-gray-600', texto: 'text-text-secondary', pct: 0, pulse: false },
  }[nivel]

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            config.cor,
            config.pulse && 'animate-pulse-soft',
            nivel === 'alto' && 'animate-pulse-soft'
          )}
        />
        <span className={cn('text-xs font-mono font-semibold', config.texto)}>
          {config.label}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', config.cor)}
          style={{ width: `${config.pct}%` }}
        />
      </div>
    </div>
  )
}
