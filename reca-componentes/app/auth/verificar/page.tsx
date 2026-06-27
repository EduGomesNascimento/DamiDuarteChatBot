'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OtpInput } from '@/components/auth/OtpInput'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/providers/ToastProvider'
import { formatCPF, formatCEP, formatTelefone, validarCPF, validarCNPJ } from '@/lib/utils'

// ---- CEP lookup ----
interface ViaCepData {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

async function buscarCep(cep: string): Promise<ViaCepData | null> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ---- Types ----
interface DadosPessoais {
  nomeCompleto: string
  cpf: string
  telefone: string
  dataNasc: string
}

interface DadosEndereco {
  apelido: string
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

interface DadosFiscais {
  tipo: 'PF' | 'PJ'
  cnpj: string
  razaoSocial: string
  ie: string
}

// ---- Step components ----

interface StepPessoaisProps {
  dados: DadosPessoais
  onChange: (d: DadosPessoais) => void
  onNext: () => void
}

function StepPessoais({ dados, onChange, onNext }: StepPessoaisProps) {
  const [errors, setErrors] = useState<Partial<DadosPessoais>>({})

  function validate() {
    const e: Partial<DadosPessoais> = {}
    if (!dados.nomeCompleto.trim() || dados.nomeCompleto.trim().length < 3)
      e.nomeCompleto = 'Informe seu nome completo'
    if (!validarCPF(dados.cpf)) e.cpf = 'CPF inválido'
    if (dados.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido'
    if (!dados.dataNasc) e.dataNasc = 'Data de nascimento obrigatória'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Nome completo</label>
        <input
          type="text"
          value={dados.nomeCompleto}
          onChange={(e) => onChange({ ...dados, nomeCompleto: e.target.value })}
          placeholder="João da Silva"
          className="input-field w-full"
        />
        {errors.nomeCompleto && <p className="text-danger text-xs mt-1">{errors.nomeCompleto}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">CPF</label>
        <input
          type="text"
          value={dados.cpf}
          onChange={(e) => onChange({ ...dados, cpf: formatCPF(e.target.value) })}
          placeholder="000.000.000-00"
          maxLength={14}
          className="input-field w-full font-mono"
        />
        {errors.cpf && <p className="text-danger text-xs mt-1">{errors.cpf}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Telefone</label>
        <input
          type="tel"
          value={dados.telefone}
          onChange={(e) => onChange({ ...dados, telefone: formatTelefone(e.target.value) })}
          placeholder="(51) 99999-9999"
          maxLength={16}
          className="input-field w-full font-mono"
        />
        {errors.telefone && <p className="text-danger text-xs mt-1">{errors.telefone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Data de nascimento</label>
        <input
          type="date"
          value={dados.dataNasc}
          onChange={(e) => onChange({ ...dados, dataNasc: e.target.value })}
          className="input-field w-full"
          max={new Date().toISOString().slice(0, 10)}
        />
        {errors.dataNasc && <p className="text-danger text-xs mt-1">{errors.dataNasc}</p>}
      </div>

      <Button onClick={handleNext} className="w-full mt-2">
        Continuar
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  )
}

interface StepEnderecoProps {
  dados: DadosEndereco
  onChange: (d: DadosEndereco) => void
  onNext: () => void
  onBack: () => void
}

function StepEndereco({ dados, onChange, onNext, onBack }: StepEnderecoProps) {
  const [errors, setErrors] = useState<Partial<DadosEndereco>>({})
  const [loadingCep, setLoadingCep] = useState(false)

  async function handleCepBlur() {
    const cep = dados.cep.replace(/\D/g, '')
    if (cep.length !== 8) return
    setLoadingCep(true)
    const result = await buscarCep(cep)
    setLoadingCep(false)
    if (result && !result.erro) {
      onChange({
        ...dados,
        logradouro: result.logradouro || dados.logradouro,
        bairro: result.bairro || dados.bairro,
        cidade: result.localidade || dados.cidade,
        estado: result.uf || dados.estado,
      })
    }
  }

  function validate() {
    const e: Partial<DadosEndereco> = {}
    if (dados.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP inválido'
    if (!dados.logradouro.trim()) e.logradouro = 'Logradouro obrigatório'
    if (!dados.numero.trim()) e.numero = 'Número obrigatório'
    if (!dados.bairro.trim()) e.bairro = 'Bairro obrigatório'
    if (!dados.cidade.trim()) e.cidade = 'Cidade obrigatória'
    if (!dados.estado.trim() || dados.estado.trim().length !== 2) e.estado = 'UF inválida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Apelido</label>
          <input
            type="text"
            value={dados.apelido}
            onChange={(e) => onChange({ ...dados, apelido: e.target.value })}
            placeholder="Casa"
            className="input-field w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">CEP</label>
          <div className="relative">
            <input
              type="text"
              value={dados.cep}
              onChange={(e) => onChange({ ...dados, cep: formatCEP(e.target.value) })}
              onBlur={handleCepBlur}
              placeholder="00000-000"
              maxLength={9}
              className="input-field w-full font-mono"
            />
            {loadingCep && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
          </div>
          {errors.cep && <p className="text-danger text-xs mt-1">{errors.cep}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Logradouro</label>
        <input
          type="text"
          value={dados.logradouro}
          onChange={(e) => onChange({ ...dados, logradouro: e.target.value })}
          placeholder="Rua das Flores"
          className="input-field w-full"
        />
        {errors.logradouro && <p className="text-danger text-xs mt-1">{errors.logradouro}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Número</label>
          <input
            type="text"
            value={dados.numero}
            onChange={(e) => onChange({ ...dados, numero: e.target.value })}
            placeholder="123"
            className="input-field w-full"
          />
          {errors.numero && <p className="text-danger text-xs mt-1">{errors.numero}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Complemento</label>
          <input
            type="text"
            value={dados.complemento}
            onChange={(e) => onChange({ ...dados, complemento: e.target.value })}
            placeholder="Apto 42 (opcional)"
            className="input-field w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Bairro</label>
        <input
          type="text"
          value={dados.bairro}
          onChange={(e) => onChange({ ...dados, bairro: e.target.value })}
          placeholder="Centro"
          className="input-field w-full"
        />
        {errors.bairro && <p className="text-danger text-xs mt-1">{errors.bairro}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">Cidade</label>
          <input
            type="text"
            value={dados.cidade}
            onChange={(e) => onChange({ ...dados, cidade: e.target.value })}
            placeholder="Portão"
            className="input-field w-full"
          />
          {errors.cidade && <p className="text-danger text-xs mt-1">{errors.cidade}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">UF</label>
          <input
            type="text"
            value={dados.estado}
            onChange={(e) => onChange({ ...dados, estado: e.target.value.toUpperCase().slice(0, 2) })}
            placeholder="RS"
            maxLength={2}
            className="input-field w-full font-mono uppercase"
          />
          {errors.estado && <p className="text-danger text-xs mt-1">{errors.estado}</p>}
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Continuar
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

interface StepFiscalProps {
  cpf: string
  dados: DadosFiscais
  onChange: (d: DadosFiscais) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

function StepFiscal({ cpf, dados, onChange, onSubmit, onBack, loading }: StepFiscalProps) {
  const [errors, setErrors] = useState<Partial<DadosFiscais & { cnpj: string }>>({})

  function validate() {
    const e: Partial<DadosFiscais & { cnpj: string }> = {}
    if (dados.tipo === 'PJ') {
      if (!validarCNPJ(dados.cnpj)) e.cnpj = 'CNPJ inválido'
      if (!dados.razaoSocial.trim()) e.razaoSocial = 'Razão social obrigatória'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (validate()) onSubmit()
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Tipo de nota fiscal</label>
        <div className="grid grid-cols-2 gap-3">
          {(['PF', 'PJ'] as const).map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => onChange({ ...dados, tipo })}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                dados.tipo === tipo
                  ? 'border-primary bg-primary/10 text-primary shadow-glow'
                  : 'border-white/10 bg-surface-2 text-text-secondary hover:border-white/20'
              }`}
            >
              {tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </button>
          ))}
        </div>
      </div>

      {dados.tipo === 'PF' ? (
        <div className="p-4 rounded-xl bg-surface-2 border border-white/10">
          <p className="text-sm text-text-secondary">CPF vinculado</p>
          <p className="font-mono text-text-primary font-medium mt-1">{cpf}</p>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">CNPJ</label>
            <input
              type="text"
              value={dados.cnpj}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 14)
                const fmt = raw
                  .replace(/(\d{2})(\d)/, '$1.$2')
                  .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                  .replace(/\.(\d{3})(\d)/, '.$1/$2')
                  .replace(/(\d{4})(\d)/, '$1-$2')
                onChange({ ...dados, cnpj: fmt })
              }}
              placeholder="00.000.000/0001-00"
              maxLength={18}
              className="input-field w-full font-mono"
            />
            {errors.cnpj && <p className="text-danger text-xs mt-1">{errors.cnpj}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Razão social</label>
            <input
              type="text"
              value={dados.razaoSocial}
              onChange={(e) => onChange({ ...dados, razaoSocial: e.target.value })}
              placeholder="Empresa LTDA"
              className="input-field w-full"
            />
            {errors.razaoSocial && <p className="text-danger text-xs mt-1">{errors.razaoSocial}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Inscrição estadual (opcional)</label>
            <input
              type="text"
              value={dados.ie}
              onChange={(e) => onChange({ ...dados, ie: e.target.value })}
              placeholder="000/0000000"
              className="input-field w-full font-mono"
            />
          </div>
        </>
      )}

      <div className="flex gap-3 mt-2">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="flex-1">
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
              Criando conta...
            </>
          ) : (
            <>
              Criar conta
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// ---- Main Page ----

function VerificarContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { toast } = useToast()

  const emailFromQuery = params.get('email') || ''
  const [email] = useState(emailFromQuery || sessionStorage.getItem('auth_email') || '')

  const [otpLoading, setOtpLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [cadastroStep, setCadastroStep] = useState<'pessoais' | 'endereco' | 'fiscal'>('pessoais')
  const [cadastroLoading, setCadastroLoading] = useState(false)

  // Reenvio
  const [cooldown, setCooldown] = useState(0)

  const startCooldown = useCallback(() => {
    setCooldown(30)
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(t); return 0 }
        return c - 1
      })
    }, 1000)
  }, [])

  const [pessoais, setPessoais] = useState<DadosPessoais>({
    nomeCompleto: '', cpf: '', telefone: '', dataNasc: '',
  })
  const [endereco, setEndereco] = useState<DadosEndereco>({
    apelido: 'Casa', cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  })
  const [fiscal, setFiscal] = useState<DadosFiscais>({
    tipo: 'PF', cnpj: '', razaoSocial: '', ie: '',
  })

  async function handleOtpComplete(code: string) {
    setOtpLoading(true)
    try {
      const res = await fetch('/api/auth/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo: code }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.erro || 'Código inválido', 'error')
        return
      }
      if (data.autenticado && data.cadastroCompleto) {
        toast('Bem-vindo de volta!', 'success')
        router.push('/minha-conta')
      } else {
        setVerified(true)
        setIsNewUser(true)
        toast('E-mail verificado! Complete seu cadastro.', 'success')
      }
    } catch {
      toast('Erro de conexão. Tente novamente.', 'error')
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleReenviar() {
    if (cooldown > 0) return
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        toast('Novo código enviado!', 'success')
        startCooldown()
      } else {
        const d = await res.json()
        toast(d.erro || 'Erro ao reenviar', 'error')
      }
    } catch {
      toast('Erro de conexão.', 'error')
    }
  }

  async function handleCadastroSubmit() {
    setCadastroLoading(true)
    try {
      const body = {
        email,
        nomeCompleto: pessoais.nomeCompleto,
        cpf: pessoais.cpf,
        telefone: pessoais.telefone,
        dataNasc: pessoais.dataNasc,
        endereco: {
          apelido: endereco.apelido || 'Casa',
          cep: endereco.cep,
          logradouro: endereco.logradouro,
          numero: endereco.numero,
          complemento: endereco.complemento,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          estado: endereco.estado,
        },
        dadosFiscais:
          fiscal.tipo === 'PJ'
            ? {
                tipo: 'PJ' as const,
                cnpj: fiscal.cnpj,
                razaoSocial: fiscal.razaoSocial,
                ie: fiscal.ie,
              }
            : { tipo: 'PF' as const },
      }

      const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.erro || 'Erro ao criar conta', 'error')
        return
      }
      toast('Conta criada com sucesso!', 'success')
      router.push('/minha-conta')
    } catch {
      toast('Erro de conexão. Tente novamente.', 'error')
    } finally {
      setCadastroLoading(false)
    }
  }

  const stepLabels = ['Dados pessoais', 'Endereço', 'Nota fiscal']
  const stepIndex = cadastroStep === 'pessoais' ? 0 : cadastroStep === 'endereco' ? 1 : 2

  if (!email) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Sessão expirada.</p>
          <Button onClick={() => router.push('/auth')}>Voltar ao início</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="relative w-full max-w-md animate-fade-up">
        <div className="gradient-border rounded-2xl">
          <div className="surface-card rounded-2xl p-8">

            {!verified ? (
              /* OTP step */
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                <h1 className="font-display text-2xl font-bold text-text-primary text-center mb-2">
                  Verifique seu e-mail
                </h1>
                <p className="text-text-secondary text-sm text-center mb-2">
                  Enviamos um código de 6 dígitos para
                </p>
                <p className="text-primary font-mono text-sm text-center font-medium mb-8 bg-primary/10 py-2 px-4 rounded-lg">
                  {email}
                </p>

                <div className="mb-8">
                  <OtpInput onComplete={handleOtpComplete} disabled={otpLoading} />
                </div>

                {otpLoading && (
                  <p className="text-center text-text-secondary text-sm mb-4 flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Verificando código...
                  </p>
                )}

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={handleReenviar}
                    disabled={cooldown > 0}
                    className="text-sm text-text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cooldown > 0
                      ? `Reenviar em ${cooldown}s`
                      : 'Não recebeu? Reenviar código'}
                  </button>
                  <button
                    onClick={() => router.push('/auth')}
                    className="text-xs text-text-secondary/60 hover:text-text-secondary transition-colors"
                  >
                    Trocar e-mail
                  </button>
                </div>
              </>
            ) : isNewUser ? (
              /* Cadastro multi-step */
              <>
                <div className="mb-6">
                  <h1 className="font-display text-xl font-bold text-text-primary mb-1">
                    Complete seu cadastro
                  </h1>
                  <p className="text-text-secondary text-sm">Etapa {stepIndex + 1} de 3</p>
                </div>

                {/* Progress */}
                <div className="flex gap-2 mb-6">
                  {stepLabels.map((label, i) => (
                    <div key={label} className="flex-1">
                      <div className={`h-1 rounded-full transition-all duration-300 ${
                        i <= stepIndex ? 'bg-primary' : 'bg-white/10'
                      }`} />
                      <p className={`text-xs mt-1 text-center truncate ${
                        i === stepIndex ? 'text-primary' : 'text-text-secondary/50'
                      }`}>{label}</p>
                    </div>
                  ))}
                </div>

                {cadastroStep === 'pessoais' && (
                  <StepPessoais
                    dados={pessoais}
                    onChange={setPessoais}
                    onNext={() => setCadastroStep('endereco')}
                  />
                )}
                {cadastroStep === 'endereco' && (
                  <StepEndereco
                    dados={endereco}
                    onChange={setEndereco}
                    onNext={() => setCadastroStep('fiscal')}
                    onBack={() => setCadastroStep('pessoais')}
                  />
                )}
                {cadastroStep === 'fiscal' && (
                  <StepFiscal
                    cpf={pessoais.cpf}
                    dados={fiscal}
                    onChange={setFiscal}
                    onSubmit={handleCadastroSubmit}
                    onBack={() => setCadastroStep('endereco')}
                    loading={cadastroLoading}
                  />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          background: rgb(26 35 54);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: rgb(249 250 251);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
        }
        .input-field:focus {
          border-color: rgb(var(--c-primary));
          box-shadow: 0 0 20px rgb(var(--c-primary) / 0.3);
        }
        .input-field::placeholder {
          color: rgba(156,163,175,0.5);
        }
      `}</style>
    </div>
  )
}

export default function VerificarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <VerificarContent />
    </Suspense>
  )
}
