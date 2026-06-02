'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/CartProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { Button } from '@/components/ui/Button'
import {
  formatBRL,
  descontoPorVolume,
  precoComDesconto,
} from '@/lib/utils'

const COUPON_SESSION_KEY = 'aen_cupom'

interface CupomAplicado {
  codigo: string
  tipo: string
  valor: number
  desconto: number
}

export default function CarrinhoPage() {
  const { itens, alterarQtd, remover, subtotal } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [codigoCupom, setCodigoCupom] = useState('')
  const [cupomAplicado, setCupomAplicado] = useState<CupomAplicado | null>(null)
  const [carregandoCupom, setCarregandoCupom] = useState(false)

  // Restore coupon from session storage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(COUPON_SESSION_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as CupomAplicado
        setCupomAplicado(saved)
        setCodigoCupom(saved.codigo)
      }
    } catch {}
  }, [])

  // Computed totals
  const subtotalCheio = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const subtotalComVolume = itens.reduce(
    (s, i) => s + precoComDesconto(i.preco, i.quantidade) * i.quantidade,
    0
  )
  const descontoVolume = subtotalCheio - subtotalComVolume
  const descontoCupom = cupomAplicado?.desconto ?? 0
  const total = Math.max(0, subtotalComVolume - descontoCupom)

  async function aplicarCupom() {
    const codigo = codigoCupom.trim().toUpperCase()
    if (!codigo) {
      toast('Informe o código do cupom', 'error')
      return
    }
    setCarregandoCupom(true)
    try {
      const res = await fetch('/api/cupom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, subtotal: subtotalComVolume }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.erro || 'Cupom inválido', 'error')
        return
      }
      const aplicado: CupomAplicado = {
        codigo: data.codigo,
        tipo: data.tipo,
        valor: data.valor,
        desconto: data.desconto,
      }
      setCupomAplicado(aplicado)
      sessionStorage.setItem(COUPON_SESSION_KEY, JSON.stringify(aplicado))
      toast(`Cupom ${data.codigo} aplicado! Desconto de ${formatBRL(data.desconto)}`, 'success')
    } catch {
      toast('Erro ao aplicar cupom', 'error')
    } finally {
      setCarregandoCupom(false)
    }
  }

  function removerCupom() {
    setCupomAplicado(null)
    setCodigoCupom('')
    sessionStorage.removeItem(COUPON_SESSION_KEY)
  }

  function handleFinalizarCompra() {
    if (itens.length === 0) return
    router.push('/checkout')
  }

  if (itens.length === 0) {
    return (
      <main className="min-h-screen bg-bg pt-24 pb-16">
        <div className="mx-auto max-w-3xl px-4 text-center animate-fade-up">
          <div className="mb-6 text-7xl">🛒</div>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-3">
            Carrinho vazio
          </h1>
          <p className="text-text-secondary mb-8">
            Você ainda não adicionou nenhum item ao carrinho.
          </p>
          <Link href="/catalogo">
            <Button variant="primary">Ver catálogo</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-bg pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="font-display text-3xl font-bold text-text-primary mb-8 animate-fade-up">
          Meu Carrinho
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {itens.map((item) => {
              const pctDesc = descontoPorVolume(item.quantidade)
              const precoFinal = precoComDesconto(item.preco, item.quantidade)
              const linhaTotalCheio = item.preco * item.quantidade
              const linhaTotal = precoFinal * item.quantidade
              const temDesconto = pctDesc > 0

              return (
                <div
                  key={item.produtoId}
                  className="surface-card gradient-border p-4 flex gap-4 animate-fade-up"
                >
                  {/* Image */}
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-2">
                    <Image
                      src={item.imagem}
                      alt={item.nome}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-text-primary leading-tight line-clamp-2">
                          {item.nome}
                        </p>
                        <p className="font-mono text-xs text-text-secondary mt-0.5">{item.sku}</p>
                      </div>
                      {/* Remove */}
                      <button
                        onClick={() => remover(item.produtoId)}
                        className="text-text-secondary hover:text-danger transition-colors flex-shrink-0"
                        aria-label="Remover item"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => alterarQtd(item.produtoId, item.quantidade - 1)}
                          disabled={item.quantidade <= 1}
                          className="h-7 w-7 rounded border border-white/10 bg-surface-2 text-text-primary hover:border-primary/50 disabled:opacity-40 transition-colors flex items-center justify-center text-sm"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={item.estoque}
                          value={item.quantidade}
                          onChange={(e) => {
                            const v = parseInt(e.target.value)
                            if (!isNaN(v)) alterarQtd(item.produtoId, v)
                          }}
                          className="h-7 w-14 rounded border border-white/10 bg-surface-2 text-center text-sm text-text-primary focus:border-primary/50 focus:outline-none"
                        />
                        <button
                          onClick={() => alterarQtd(item.produtoId, item.quantidade + 1)}
                          disabled={item.quantidade >= item.estoque}
                          className="h-7 w-7 rounded border border-white/10 bg-surface-2 text-text-primary hover:border-primary/50 disabled:opacity-40 transition-colors flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                        <span className="text-xs text-text-secondary ml-1">
                          (máx {item.estoque})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        {temDesconto && (
                          <div className="flex items-center gap-2 justify-end mb-0.5">
                            <span className="badge text-xs bg-success/10 text-success border border-success/30">
                              -{Math.round(pctDesc * 100)}% volume
                            </span>
                            <span className="text-xs text-text-secondary line-through">
                              {formatBRL(linhaTotalCheio)}
                            </span>
                          </div>
                        )}
                        <p className="font-semibold text-text-primary">
                          {formatBRL(linhaTotal)}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {formatBRL(precoFinal)}/un
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="surface-card gradient-border p-6 sticky top-24 space-y-4 animate-fade-up">
              <h2 className="font-display text-lg font-bold text-text-primary">
                Resumo do Pedido
              </h2>

              {/* Subtotal */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal ({itens.reduce((s, i) => s + i.quantidade, 0)} itens)</span>
                  <span>{formatBRL(subtotalCheio)}</span>
                </div>
                {descontoVolume > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Desconto por volume</span>
                    <span>-{formatBRL(descontoVolume)}</span>
                  </div>
                )}
                {cupomAplicado && (
                  <div className="flex justify-between text-success">
                    <span className="flex items-center gap-1">
                      Cupom {cupomAplicado.codigo}
                      <button
                        onClick={removerCupom}
                        className="text-danger/70 hover:text-danger ml-1 text-xs"
                        aria-label="Remover cupom"
                      >
                        ✕
                      </button>
                    </span>
                    <span>-{formatBRL(cupomAplicado.desconto)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-secondary">
                  <span>Frete</span>
                  <span className="text-warning text-xs font-medium">Calculado no checkout</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-text-primary">
                <span>Total estimado</span>
                <span className="text-primary">{formatBRL(total)}</span>
              </div>

              {/* Coupon field */}
              {!cupomAplicado && (
                <div className="space-y-2">
                  <label className="text-xs text-text-secondary font-medium uppercase tracking-wide">
                    Código de cupom
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codigoCupom}
                      onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && aplicarCupom()}
                      placeholder="BEMVINDO10"
                      className="flex-1 rounded-lg border border-white/10 bg-surface-2 px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                    />
                    <Button
                      variant="ghost"
                      onClick={aplicarCupom}
                      disabled={carregandoCupom}
                      className="text-sm px-3 py-2"
                    >
                      {carregandoCupom ? '...' : 'Aplicar'}
                    </Button>
                  </div>
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleFinalizarCompra}
                disabled={itens.length === 0}
                className="w-full"
              >
                Finalizar compra
              </Button>

              <Link
                href="/catalogo"
                className="block text-center text-xs text-text-secondary hover:text-primary transition-colors"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
