'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/providers/CartProvider'
import { useToast } from '@/components/providers/ToastProvider'
import { Button } from '@/components/ui/Button'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { formatBRL, formatCEP, precoComDesconto } from '@/lib/utils'

const COUPON_SESSION_KEY = 'aen_cupom'

interface Endereco {
  id: string
  apelido: string
  logradouro: string
  numero: string
  complemento?: string | null
  bairro: string
  cidade: string
  estado: string
  cep: string
  principal: boolean
}

interface OpcaoFrete {
  id: string
  nome: string
  prazoDias: number
  valor: number
}

interface CupomSessao {
  codigo: string
  tipo: string
  valor: number
  desconto: number
}

export default function CheckoutPage() {
  const { itens, subtotal, limpar } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [carregando, setCarregando] = useState(false)

  // Step 1: endereço
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [enderecoId, setEnderecoId] = useState('')
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(true)

  // Step 2: frete
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([])
  const [modalidadeFrete, setModalidadeFrete] = useState('')
  const [freteValor, setFreteValor] = useState(0)
  const [carregandoFrete, setCarregandoFrete] = useState(false)

  // Step 3: dados fiscais
  const [tipoFiscal, setTipoFiscal] = useState<'PF' | 'PJ'>('PF')
  const [cpf, setCpf] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [razaoSocial, setRazaoSocial] = useState('')

  // Coupon from session
  const [cupomSessao, setCupomSessao] = useState<CupomSessao | null>(null)

  // Computed
  const subtotalCheio = itens.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const subtotalComVolume = itens.reduce(
    (s, i) => s + precoComDesconto(i.preco, i.quantidade) * i.quantidade,
    0
  )
  const descontoVolume = subtotalCheio - subtotalComVolume
  const descontoCupom = cupomSessao?.desconto ?? 0
  const total = Math.max(0, subtotalComVolume - descontoCupom + freteValor)

  // Auth check + initial data load
  useEffect(() => {
    async function init() {
      // Check auth
      try {
        const res = await fetch('/api/auth/me')
        if (res.status === 401) {
          toast('Faça login para continuar', 'error')
          router.push('/auth?next=/checkout')
          return
        }
      } catch {
        toast('Erro de conexão', 'error')
        return
      }

      if (itens.length === 0) {
        toast('Seu carrinho está vazio', 'error')
        router.push('/carrinho')
        return
      }

      // Load coupon from session
      try {
        const raw = sessionStorage.getItem(COUPON_SESSION_KEY)
        if (raw) setCupomSessao(JSON.parse(raw))
      } catch {}

      // Load addresses
      setCarregandoEnderecos(true)
      try {
        const res = await fetch('/api/enderecos')
        if (res.ok) {
          const data: Endereco[] = await res.json()
          setEnderecos(data)
          const principal = data.find((e) => e.principal) || data[0]
          if (principal) setEnderecoId(principal.id)
        }
      } catch {
        toast('Erro ao carregar endereços', 'error')
      } finally {
        setCarregandoEnderecos(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load freight options when address is selected
  const carregarFrete = useCallback(
    async (eid: string) => {
      const end = enderecos.find((e) => e.id === eid)
      if (!end) return
      setCarregandoFrete(true)
      setOpcoesFrete([])
      setModalidadeFrete('')
      try {
        const pesoGramas = 200 * itens.reduce((s, i) => s + i.quantidade, 0)
        const res = await fetch('/api/frete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cep: end.cep, pesoGramas }),
        })
        if (res.ok) {
          const data: OpcaoFrete[] = await res.json()
          setOpcoesFrete(data)
          if (data.length > 0) {
            setModalidadeFrete(data[0].id)
            setFreteValor(data[0].valor)
          }
        }
      } catch {
        toast('Erro ao calcular frete', 'error')
      } finally {
        setCarregandoFrete(false)
      }
    },
    [enderecos, itens, toast]
  )

  function handleNextStep() {
    if (step === 1) {
      if (!enderecoId) {
        toast('Selecione um endereço de entrega', 'error')
        return
      }
      carregarFrete(enderecoId)
      setStep(2)
    } else if (step === 2) {
      if (!modalidadeFrete) {
        toast('Selecione uma modalidade de frete', 'error')
        return
      }
      setStep(3)
    } else if (step === 3) {
      setStep(4)
    }
  }

  function handleSelectFrete(id: string, valor: number) {
    setModalidadeFrete(id)
    setFreteValor(valor)
  }

  async function handlePagar() {
    setCarregando(true)
    try {
      const payload = {
        enderecoId,
        modalidadeFrete,
        freteValor,
        cupomCodigo: cupomSessao?.codigo,
        itens: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
      }

      const res = await fetch('/api/checkout/criar-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        toast(data.erro || 'Erro ao criar pedido', 'error')
        return
      }

      // Clear cart and coupon session
      limpar()
      sessionStorage.removeItem(COUPON_SESSION_KEY)

      if (data.mock) {
        router.push(data.init_point)
      } else {
        window.location.href = data.init_point
      }
    } catch {
      toast('Erro ao processar pagamento', 'error')
    } finally {
      setCarregando(false)
    }
  }

  const enderecoSelecionado = enderecos.find((e) => e.id === enderecoId)

  return (
    <main className="min-h-screen bg-bg pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="font-display text-3xl font-bold text-text-primary mb-8 animate-fade-up">
          Checkout
        </h1>

        <CheckoutSteps current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main step content */}
          <div className="lg:col-span-2">
            {/* Step 1: Endereço */}
            {step === 1 && (
              <div className="surface-card gradient-border p-6 animate-fade-up">
                <h2 className="font-display text-xl font-semibold text-text-primary mb-4">
                  Endereço de Entrega
                </h2>

                {carregandoEnderecos ? (
                  <div className="flex items-center gap-3 text-text-secondary py-8 justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Carregando endereços...</span>
                  </div>
                ) : enderecos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text-secondary mb-4">
                      Você não tem nenhum endereço cadastrado.
                    </p>
                    <a
                      href="/minha-conta/enderecos"
                      className="text-primary hover:underline font-medium"
                    >
                      Cadastrar endereço
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {enderecos.map((end) => (
                      <label
                        key={end.id}
                        className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all ${
                          enderecoId === end.id
                            ? 'border-primary/60 bg-primary/5'
                            : 'border-white/10 bg-surface-2 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="endereco"
                          value={end.id}
                          checked={enderecoId === end.id}
                          onChange={() => setEnderecoId(end.id)}
                          className="mt-0.5 accent-primary"
                        />
                        <div>
                          <p className="font-medium text-text-primary flex items-center gap-2">
                            {end.apelido}
                            {end.principal && (
                              <span className="badge text-xs bg-primary/10 text-primary border border-primary/30">
                                Principal
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-text-secondary mt-0.5">
                            {end.logradouro}, {end.numero}
                            {end.complemento && ` - ${end.complemento}`}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {end.bairro}, {end.cidade} - {end.estado},{' '}
                            {formatCEP(end.cep)}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleNextStep}
                    disabled={!enderecoId || carregandoEnderecos}
                  >
                    Continuar para Frete
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Frete */}
            {step === 2 && (
              <div className="surface-card gradient-border p-6 animate-fade-up">
                <h2 className="font-display text-xl font-semibold text-text-primary mb-1">
                  Modalidade de Frete
                </h2>
                {enderecoSelecionado && (
                  <p className="text-sm text-text-secondary mb-5">
                    Entrega para: {enderecoSelecionado.cidade}/{enderecoSelecionado.estado} —{' '}
                    {formatCEP(enderecoSelecionado.cep)}
                  </p>
                )}

                {carregandoFrete ? (
                  <div className="flex items-center gap-3 text-text-secondary py-8 justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Calculando frete...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {opcoesFrete.map((op) => (
                      <label
                        key={op.id}
                        className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-all ${
                          modalidadeFrete === op.id
                            ? 'border-primary/60 bg-primary/5'
                            : 'border-white/10 bg-surface-2 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="frete"
                            value={op.id}
                            checked={modalidadeFrete === op.id}
                            onChange={() => handleSelectFrete(op.id, op.valor)}
                            className="accent-primary"
                          />
                          <div>
                            <p className="font-medium text-text-primary">{op.nome}</p>
                            <p className="text-sm text-text-secondary">
                              Prazo: {op.prazoDias} dia{op.prazoDias !== 1 ? 's' : ''} útei{op.prazoDias !== 1 ? 's' : 'l'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {op.valor === 0 ? (
                            <span className="font-semibold text-success">Grátis</span>
                          ) : (
                            <span className="font-semibold text-text-primary">
                              {formatBRL(op.valor)}
                            </span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleNextStep}
                    disabled={!modalidadeFrete || carregandoFrete}
                  >
                    Continuar para Nota Fiscal
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Dados fiscais */}
            {step === 3 && (
              <div className="surface-card gradient-border p-6 animate-fade-up">
                <h2 className="font-display text-xl font-semibold text-text-primary mb-4">
                  Dados para Nota Fiscal
                </h2>

                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setTipoFiscal('PF')}
                    className={`flex-1 rounded-lg border py-3 font-medium transition-all ${
                      tipoFiscal === 'PF'
                        ? 'border-primary/60 bg-primary/5 text-primary'
                        : 'border-white/10 text-text-secondary hover:border-white/20'
                    }`}
                  >
                    Pessoa Física (CPF)
                  </button>
                  <button
                    onClick={() => setTipoFiscal('PJ')}
                    className={`flex-1 rounded-lg border py-3 font-medium transition-all ${
                      tipoFiscal === 'PJ'
                        ? 'border-primary/60 bg-primary/5 text-primary'
                        : 'border-white/10 text-text-secondary hover:border-white/20'
                    }`}
                  >
                    Pessoa Jurídica (CNPJ)
                  </button>
                </div>

                {tipoFiscal === 'PF' ? (
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">CPF</label>
                    <input
                      type="text"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">CNPJ</label>
                      <input
                        type="text"
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">
                        Razão Social
                      </label>
                      <input
                        type="text"
                        value={razaoSocial}
                        onChange={(e) => setRazaoSocial(e.target.value)}
                        placeholder="Empresa LTDA"
                        className="w-full rounded-lg border border-white/10 bg-surface-2 px-3 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <p className="mt-4 text-xs text-text-secondary">
                  Os dados fiscais serão utilizados apenas para emissão da nota fiscal.
                </p>

                <div className="mt-6 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    Voltar
                  </Button>
                  <Button variant="primary" onClick={handleNextStep}>
                    Continuar para Pagamento
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Pagamento */}
            {step === 4 && (
              <div className="surface-card gradient-border p-6 animate-fade-up">
                <h2 className="font-display text-xl font-semibold text-text-primary mb-4">
                  Pagamento
                </h2>

                <div className="rounded-lg bg-surface-2 border border-white/10 p-4 mb-6">
                  <p className="text-sm text-text-secondary mb-1">Total a pagar</p>
                  <p className="font-display text-3xl font-bold text-primary">
                    {formatBRL(total)}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Frete ({modalidadeFrete}): {freteValor === 0 ? 'Grátis' : formatBRL(freteValor)}
                  </p>
                </div>

                <p className="text-sm text-text-secondary mb-6">
                  Você será redirecionado para o Mercado Pago para escolher seu método de pagamento
                  (PIX, Boleto ou Cartão de Crédito).
                </p>

                <Button
                  variant="primary"
                  onClick={handlePagar}
                  disabled={carregando}
                  className="w-full"
                >
                  {carregando ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processando...
                    </span>
                  ) : (
                    'Pagar com Mercado Pago'
                  )}
                </Button>

                <div className="mt-6 flex justify-start">
                  <Button variant="ghost" onClick={() => setStep(3)}>
                    Voltar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="surface-card gradient-border p-5 sticky top-24 animate-fade-up">
              <h3 className="font-display text-base font-bold text-text-primary mb-4">
                Resumo do Pedido
              </h3>

              {/* Items */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                {itens.map((item) => (
                  <div key={item.produtoId} className="flex justify-between text-xs gap-2">
                    <span className="text-text-secondary line-clamp-1 flex-1">
                      {item.quantidade}× {item.nome}
                    </span>
                    <span className="text-text-primary whitespace-nowrap">
                      {formatBRL(precoComDesconto(item.preco, item.quantidade) * item.quantidade)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>{formatBRL(subtotalCheio)}</span>
                </div>
                {descontoVolume > 0 && (
                  <div className="flex justify-between text-success text-xs">
                    <span>Desconto volume</span>
                    <span>-{formatBRL(descontoVolume)}</span>
                  </div>
                )}
                {cupomSessao && (
                  <div className="flex justify-between text-success text-xs">
                    <span>Cupom {cupomSessao.codigo}</span>
                    <span>-{formatBRL(descontoCupom)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-secondary">
                  <span>Frete</span>
                  <span>
                    {modalidadeFrete
                      ? freteValor === 0
                        ? 'Grátis'
                        : formatBRL(freteValor)
                      : '—'}
                  </span>
                </div>
              </div>

              <div className="border-t border-white/10 mt-3 pt-3 flex justify-between font-bold">
                <span className="text-text-primary">Total</span>
                <span className="text-primary">{formatBRL(total)}</span>
              </div>

              {/* Security badges */}
              <div className="mt-4 flex items-center gap-2 text-xs text-text-secondary justify-center">
                <svg className="h-3.5 w-3.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Pagamento 100% seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
