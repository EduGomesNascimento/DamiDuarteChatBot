'use client'

import { useRef, useState, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  onComplete: (code: string) => void
  disabled?: boolean
  value?: string
  onChange?: (value: string) => void
}

export function OtpInput({ onComplete, disabled, value: externalValue, onChange }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const currentDigits =
    externalValue !== undefined
      ? externalValue.split('').concat(Array(6).fill('')).slice(0, 6)
      : digits

  function update(newDigits: string[]) {
    setDigits(newDigits)
    const val = newDigits.join('')
    onChange?.(val)
    if (newDigits.every((d) => d !== '') && val.length === 6) {
      onComplete(val)
    }
  }

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      const next = [...currentDigits]
      next[index] = ''
      update(next)
      return
    }
    const char = raw.slice(-1)
    const next = [...currentDigits]
    next[index] = char
    update(next)
    if (index < 5) {
      refs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (currentDigits[index]) {
        const next = [...currentDigits]
        next[index] = ''
        update(next)
      } else if (index > 0) {
        refs.current[index - 1]?.focus()
        const next = [...currentDigits]
        next[index - 1] = ''
        update(next)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      refs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    update(next)
    const focusIndex = Math.min(pasted.length, 5)
    refs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={currentDigits[i]}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          aria-label={`Dígito ${i + 1} do código`}
          className={cn(
            'w-12 h-14 text-center font-mono text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200',
            'bg-surface text-text-primary caret-primary',
            'border-white/10 hover:border-white/20',
            'focus:border-primary focus:shadow-glow',
            disabled && 'opacity-50 cursor-not-allowed',
            currentDigits[i] && 'border-primary/60'
          )}
        />
      ))}
    </div>
  )
}
