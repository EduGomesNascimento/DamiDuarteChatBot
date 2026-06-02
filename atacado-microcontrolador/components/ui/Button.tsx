'use client'

import { useState, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface Ripple {
  id: number
  x: number
  y: number
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

let rid = 0

export function Button({ variant = 'primary', className, children, onClick, ...rest }: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = ++rid
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 600)
    onClick?.(e)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(variant === 'primary' ? 'btn-primary' : 'btn-ghost', className)}
      {...rest}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute rounded-full bg-white/40"
          style={{
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            transform: 'translate(-50%, -50%)',
            animation: 'ripple 0.6s ease-out forwards',
          }}
        />
      ))}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  )
}
