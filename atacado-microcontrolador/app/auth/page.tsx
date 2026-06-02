'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/providers/ToastProvider'

export default function AuthPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast(data.erro || 'Erro ao enviar código', 'error')
        return
      }
      sessionStorage.setItem('auth_email', email.trim().toLowerCase())
      sessionStorage.setItem('auth_existe', String(data.existe))
      router.push(`/auth/verificar?email=${encodeURIComponent(email.trim().toLowerCase())}`)
    } catch {
      toast('Erro de conexão. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Circuit decoration top */}
        <div className="absolute -top-8 left-0 right-0 flex justify-center gap-3 text-primary/20 font-mono text-xs select-none">
          <span>01001100</span>
          <span className="text-primary/40">◆</span>
          <span>11010011</span>
        </div>

        <div className="gradient-border rounded-2xl">
          <div className="surface-card rounded-2xl p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center shadow-glow">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold text-text-primary text-center mb-2">
              Acesse sua conta
            </h1>
            <p className="text-text-secondary text-sm text-center mb-8">
              Enviaremos um código de 6 dígitos para o seu e-mail
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  autoFocus
                  className="w-full bg-surface-2 border border-white/10 rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 outline-none focus:border-primary focus:shadow-glow transition-all duration-200 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-fg/30 border-t-primary-fg rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Receber código
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-text-secondary">
              Novo por aqui? Você será cadastrado automaticamente.
            </p>

            {/* Circuit lines decoration */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              <span className="font-mono text-xs text-primary/40">AUTH_v2</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* Circuit decoration bottom */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-3 text-primary/20 font-mono text-xs select-none">
          <span>SECURE</span>
          <span className="text-primary/40">◆</span>
          <span>OTP</span>
          <span className="text-primary/40">◆</span>
          <span>256-BIT</span>
        </div>
      </div>
    </div>
  )
}
