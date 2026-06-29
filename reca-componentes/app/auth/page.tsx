'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/providers/ToastProvider'
import { GoogleButton } from '@/components/auth/GoogleButton'

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-bg">
      <div className="relative w-full max-w-md">
        <div className="surface-card p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-surface-2 border border-line flex items-center justify-center">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
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
                className="w-full bg-surface border border-line rounded-md px-4 py-3 text-text-primary placeholder-text-secondary/50 outline-none focus:border-primary transition-all duration-200 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-text-primary/30 border-t-text-primary rounded-full animate-spin" />
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

          <div className="mt-6">
            <GoogleButton />
          </div>

          <p className="mt-6 text-center text-xs text-text-secondary">
            Novo por aqui? Você será cadastrado automaticamente.
          </p>
        </div>
      </div>
    </div>
  )
}
