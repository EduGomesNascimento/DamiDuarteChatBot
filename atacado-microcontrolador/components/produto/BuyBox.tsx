'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { StockBar } from '@/components/ui/StockBar'
import { useCart } from '@/components/providers/CartProvider'
import { useToast } from '@/components/providers/ToastProvider'
import {
  formatBRL,
  formatCEP,
  descontoPorVolume,
  precoComDesconto,
} from '@/lib/utils'
import type { ProdutoDTO } from '@/lib/types'
import type { OpcaoFrete } from '@/lib/shipping'

interface BuyBoxProps {
  produto: ProdutoDTO
}

const TIERS = [
  { min: 1, max: 4, label: '1–4 un.', desc: 0 },
  { min: 5, max: 9, label: '5–9 un.', desc: 0.05 },
  { min: 10, max: 19, label: '10–19 un.', desc: 0.1 },
  { min: 20, max: Infinity, label: '20+ un. (Atacado)', desc: 0.15 },
]

export function BuyBox({ produto }: BuyBoxProps) {
  const router = useRouter()
  const { adicionar } = useCart()
  const { toast } = useToast()

  const [qtd, setQtd] = useState(1)
  const [cep, setCep] = useState('')
  const [calcFreteLoading, setCalcFreteLoading] = useState(false)
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[] | null>(null)
  const [freteErro, setFreteErro] = useState('')
  const [avisoEmail, setAvisoEmail] = useState('')
  const [avisoLoading, setAvisoLoading] = useState(false)

  const semEstoque = produto.estoque <= 0
  const desc = descontoPorVolume(qtd)
  const precoUnit = precoComDesconto(produto.preco, qtd)
  const total = precoUnit * qtd

  function tierAtivo(d: number) {
    return descontoPorVolume(qtd) === d
  }

  function incrementar() {
    setQtd((q) => Math.min(produto.estoque, q + 1))
  }
  function decrementar() {
    setQtd((q) => Math.max(1, q - 1))
  }

  function adicionarAoCarrinho() {
    adicionar(
      {
        produtoId: produto.id,
        slug: produto.slug,
        nome: produto.nome,
        sku: produto.sku,
        preco: produto.preco,
        imagem: produto.imagens[0] || '',
        estoque: produto.estoque,
      },
      qtd
    )
    toast(`${produto.nome} adicionado ao carrinho! (${qtd} un.)`, 'success')
  }

  function comprarAgora() {
    adicionarAoCarrinho()
    router.push('/checkout')
  }

  async function calcularFrete() {
    const cepDigits = cep.replace(/\D/g, '')
    if (cepDigits.length !== 8) {
      setFreteErro('CEP inválido. Informe os 8 dígitos.')
      return
    }
    setCalcFreteLoading(true)
    setFreteErro('')
    setOpcoesFrete(null)
    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: cepDigits, pesoGramas: produto.pesoGramas ?? 200 }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFreteErro(data.erro ?? 'Erro ao calcular frete.')
      } else {
        setOpcoesFrete(data.opcoes)
      }
    } catch {
      setFreteErro('Erro de conexão. Tente novamente.')
    } finally {
      setCalcFreteLoading(false)
    }
  }

  async function enviarAviso() {
    if (!avisoEmail || !avisoEmail.includes('@')) {
      toast('Informe um e-mail válido', 'error')
      return
    }
    setAvisoLoading(true)
    try {
      const res = await fetch('/api/produtos/avise-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtoId: produto.id, email: avisoEmail }),
      })
      if (res.ok) {
        toast('Aviso registrado! Você será notificado quando chegar.', 'success')
        setAvisoEmail('')
      } else {
        const d = await res.json()
        toast(d.erro ?? 'Erro ao registrar aviso', 'error')
      }
    } catch {
      toast('Erro de conexão', 'error')
    } finally {
      setAvisoLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* StockBar */}
      <div>
        <StockBar estoque={produto.estoque} />
        {!semEstoque && (
          <p className="mt-1 text-xs text-text-secondary font-mono">
            {produto.estoque} unidade{produto.estoque !== 1 ? 's' : ''} disponível
            {produto.estoque !== 1 ? 'is' : ''}
          </p>
        )}
      </div>

      {semEstoque ? (
        /* Fora de estoque */
        <div className="space-y-4">
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-center">
            <p className="font-display font-bold text-danger text-lg">Fora de estoque</p>
            <p className="text-sm text-text-secondary mt-1">
              Cadastre seu e-mail e avisamos quando chegar.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="seu@email.com"
              value={avisoEmail}
              onChange={(e) => setAvisoEmail(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-surface-2 px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <Button
              variant="ghost"
              onClick={enviarAviso}
              disabled={avisoLoading}
              className="whitespace-nowrap"
            >
              {avisoLoading ? '...' : 'Avise-me'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Seletor de quantidade */}
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase tracking-wider">
              Quantidade
            </label>
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={decrementar}
                disabled={qtd <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-text-primary transition hover:border-primary/60 hover:text-primary disabled:opacity-40"
              >
                −
              </button>
              <span className="font-display text-2xl font-bold w-10 text-center text-text-primary">
                {qtd}
              </span>
              <button
                onClick={incrementar}
                disabled={qtd >= produto.estoque}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-text-primary transition hover:border-primary/60 hover:text-primary disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Tabela de descontos por volume */}
          <div>
            <p className="text-xs font-mono text-text-secondary uppercase tracking-wider mb-2">
              Desconto por volume
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {TIERS.map((t) => (
                <div
                  key={t.label}
                  className={`rounded-lg border px-3 py-2 text-xs font-mono transition-all ${
                    tierAtivo(t.desc)
                      ? 'border-primary/60 bg-primary/10 text-primary shadow-glow'
                      : 'border-white/5 bg-surface-2 text-text-secondary'
                  }`}
                >
                  <div className="font-semibold">{t.label}</div>
                  <div>{t.desc === 0 ? 'Preço cheio' : `${t.desc * 100}% OFF`}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Preço ao vivo */}
          <div className="rounded-xl border border-white/5 bg-surface-2 p-4 space-y-1">
            {desc > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-text-secondary line-through">
                  {formatBRL(produto.preco)} / un.
                </span>
                <span className="badge bg-success/20 text-success border border-success/30">
                  {(desc * 100).toFixed(0)}% OFF
                </span>
              </div>
            )}
            <div className="flex items-end justify-between gap-2">
              <div>
                <p className="text-xs text-text-secondary font-mono">por unidade</p>
                <p className="font-display text-xl font-bold text-text-primary">
                  {formatBRL(precoUnit)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-text-secondary font-mono">total ({qtd} un.)</p>
                <p className="font-display text-2xl font-bold text-primary text-glow">
                  {formatBRL(total)}
                </p>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={adicionarAoCarrinho} className="w-full py-4 text-base">
              + Adicionar ao carrinho
            </Button>
            <Button variant="ghost" onClick={comprarAgora} className="w-full py-4 text-base">
              Comprar agora
            </Button>
          </div>
        </>
      )}

      {/* Calculadora de frete */}
      <div className="rounded-xl border border-white/5 bg-surface-2 p-4 space-y-3">
        <p className="text-xs font-mono text-text-secondary uppercase tracking-wider">
          Calcular frete
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => setCep(formatCEP(e.target.value))}
            maxLength={9}
            className="flex-1 rounded-xl border border-white/10 bg-surface px-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-secondary focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <Button
            variant="ghost"
            onClick={calcularFrete}
            disabled={calcFreteLoading}
            className="px-4 py-2.5 text-sm"
          >
            {calcFreteLoading ? '...' : 'Calcular'}
          </Button>
        </div>
        {freteErro && (
          <p className="text-xs text-danger font-mono">{freteErro}</p>
        )}
        {opcoesFrete && opcoesFrete.length > 0 && (
          <div className="space-y-2">
            {opcoesFrete.map((op) => (
              <div
                key={op.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-surface px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-text-primary">{op.nome}</p>
                  <p className="text-xs text-text-secondary font-mono">
                    {op.prazoDias === 1
                      ? 'Disponível amanhã'
                      : `Chega em até ${op.prazoDias} dias úteis`}
                  </p>
                </div>
                <span className={`font-display font-bold ${op.valor === 0 ? 'text-success' : 'text-text-primary'}`}>
                  {op.valor === 0 ? 'Grátis' : formatBRL(op.valor)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
