'use client'

import { createContext, useContext, useCallback, useState } from 'react'

type ToastTipo = 'success' | 'error' | 'info'
interface Toast {
  id: number
  msg: string
  tipo: ToastTipo
}

const ToastContext = createContext<{
  toast: (msg: string, tipo?: ToastTipo) => void
}>({ toast: () => {} })

let counter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((msg: string, tipo: ToastTipo = 'info') => {
    const id = ++counter
    setToasts((t) => [...t, { id, msg, tipo }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-glow backdrop-blur-md animate-fade-up ${
              t.tipo === 'success'
                ? 'border-success/40 bg-success/10 text-success'
                : t.tipo === 'error'
                  ? 'border-danger/40 bg-danger/10 text-danger'
                  : 'border-primary/40 bg-primary/10 text-primary'
            }`}
          >
            <span className="font-mono text-xs">
              {t.tipo === 'success' ? '✓' : t.tipo === 'error' ? '✕' : 'ⓘ'}
            </span>
            <span className="text-sm text-text-primary">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
