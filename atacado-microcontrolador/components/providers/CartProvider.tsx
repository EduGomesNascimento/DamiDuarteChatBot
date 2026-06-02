'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import type { CartItem } from '@/lib/types'

interface CartContextValue {
  itens: CartItem[]
  totalItens: number
  subtotal: number
  adicionar: (item: Omit<CartItem, 'quantidade'>, qtd?: number) => void
  remover: (produtoId: string) => void
  alterarQtd: (produtoId: string, qtd: number) => void
  limpar: () => void
  bump: number // incrementa ao adicionar — usado para animação de bounce
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = 'aen_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([])
  const [bump, setBump] = useState(0)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItens(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(itens))
  }, [itens, hydrated])

  const adicionar = useCallback((item: Omit<CartItem, 'quantidade'>, qtd = 1) => {
    setItens((prev) => {
      const existe = prev.find((i) => i.produtoId === item.produtoId)
      if (existe) {
        return prev.map((i) =>
          i.produtoId === item.produtoId
            ? { ...i, quantidade: Math.min(i.estoque, i.quantidade + qtd) }
            : i
        )
      }
      return [...prev, { ...item, quantidade: qtd }]
    })
    setBump((b) => b + 1)
  }, [])

  const remover = useCallback((produtoId: string) => {
    setItens((prev) => prev.filter((i) => i.produtoId !== produtoId))
  }, [])

  const alterarQtd = useCallback((produtoId: string, qtd: number) => {
    setItens((prev) =>
      prev
        .map((i) =>
          i.produtoId === produtoId
            ? { ...i, quantidade: Math.max(0, Math.min(i.estoque, qtd)) }
            : i
        )
        .filter((i) => i.quantidade > 0)
    )
  }, [])

  const limpar = useCallback(() => setItens([]), [])

  const totalItens = useMemo(() => itens.reduce((s, i) => s + i.quantidade, 0), [itens])
  const subtotal = useMemo(
    () => itens.reduce((s, i) => s + i.preco * i.quantidade, 0),
    [itens]
  )

  return (
    <CartContext.Provider
      value={{ itens, totalItens, subtotal, adicionar, remover, alterarQtd, limpar, bump }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider')
  return ctx
}
