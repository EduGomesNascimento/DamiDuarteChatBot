'use client'

import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, label: 'Endereço' },
  { n: 2, label: 'Frete' },
  { n: 3, label: 'Nota Fiscal' },
  { n: 4, label: 'Pagamento' },
]

interface CheckoutStepsProps {
  current: number
}

export function CheckoutSteps({ current }: CheckoutStepsProps) {
  return (
    <nav aria-label="Etapas do checkout" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const done = step.n < current
          const active = step.n === current
          return (
            <li key={step.n} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold font-mono transition-all duration-300',
                    done
                      ? 'border-primary bg-primary text-primary-fg'
                      : active
                        ? 'border-primary bg-primary/10 text-primary shadow-glow'
                        : 'border-white/20 bg-surface text-text-secondary'
                  )}
                >
                  {done ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.n
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1.5 text-xs whitespace-nowrap',
                    active ? 'text-primary font-medium' : done ? 'text-primary/70' : 'text-text-secondary'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mb-4 h-0.5 flex-1 mx-2 transition-all duration-500',
                    done ? 'bg-primary' : 'bg-white/10'
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
