'use client'

import { useState } from 'react'
import { useToast } from '@/components/providers/ToastProvider'

export interface UserRow {
  id: string
  nome: string
  email: string
  role: 'CLIENTE' | 'ADMIN'
  pedidos: number
  cpf: string
  data: string
}

export function UsersTable({ usuarios: inicial }: { usuarios: UserRow[] }) {
  const [usuarios, setUsuarios] = useState(inicial)
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  async function toggleRole(id: string, atual: 'CLIENTE' | 'ADMIN') {
    const novo = atual === 'ADMIN' ? 'CLIENTE' : 'ADMIN'
    if (!confirm(`Alterar papel para ${novo}?`)) return
    setLoading(id)
    try {
      const res = await fetch(`/api/admin/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: novo }),
      })
      if (!res.ok) throw new Error()
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, role: novo } : u)))
      toast('Papel atualizado', 'success')
    } catch {
      toast('Erro ao atualizar', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 font-mono text-xs uppercase tracking-wide text-text-secondary">
            <th className="px-4 py-3 text-left">Nome</th>
            <th className="px-4 py-3 text-left">E-mail</th>
            <th className="px-4 py-3 text-left">CPF</th>
            <th className="px-4 py-3 text-center">Pedidos</th>
            <th className="px-4 py-3 text-left">Papel</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-b border-white/5">
              <td className="px-4 py-3 text-text-primary">{u.nome}</td>
              <td className="px-4 py-3 text-text-secondary">{u.email}</td>
              <td className="px-4 py-3 font-mono text-xs text-text-secondary">{u.cpf}</td>
              <td className="px-4 py-3 text-center font-mono">{u.pedidos}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => toggleRole(u.id, u.role)}
                  disabled={loading === u.id}
                  className={`badge border transition-colors disabled:opacity-50 ${
                    u.role === 'ADMIN'
                      ? 'border-secondary/40 bg-secondary/10 text-secondary'
                      : 'border-white/10 bg-white/5 text-text-secondary hover:text-primary'
                  }`}
                >
                  {u.role}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {usuarios.length === 0 && (
        <div className="py-12 text-center text-text-secondary">Nenhum usuário.</div>
      )}
    </div>
  )
}
