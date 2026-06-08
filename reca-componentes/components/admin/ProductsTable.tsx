'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatBRL } from '@/lib/utils'
import { useToast } from '@/components/providers/ToastProvider'

interface Produto {
  id: string
  nome: string
  sku: string
  preco: number
  estoque: number
  ativo: boolean
  destaque: boolean
  imagens: string[]
}

interface ProductsTableProps {
  produtos: Produto[]
}

export function ProductsTable({ produtos: initialProdutos }: ProductsTableProps) {
  const [produtos, setProdutos] = useState(initialProdutos)
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  async function toggle(id: string, field: 'ativo' | 'destaque', current: boolean) {
    setLoading(id + field)
    try {
      const res = await fetch(`/api/admin/produtos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !current }),
      })
      if (!res.ok) throw new Error()
      setProdutos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: !current } : p))
      )
      toast(`${field === 'ativo' ? 'Status' : 'Destaque'} atualizado`, 'success')
    } catch {
      toast('Erro ao atualizar produto', 'error')
    } finally {
      setLoading(null)
    }
  }

  async function deletar(id: string, nome: string) {
    if (!confirm(`Desativar "${nome}"? O produto será ocultado mas não excluído.`)) return
    setLoading(id + 'del')
    try {
      const res = await fetch(`/api/admin/produtos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setProdutos((prev) => prev.map((p) => (p.id === id ? { ...p, ativo: false } : p)))
      toast('Produto desativado', 'success')
    } catch {
      toast('Erro ao desativar produto', 'error')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-text-secondary font-mono text-xs uppercase tracking-wide">
            <th className="text-left py-3 px-4 w-12">IMG</th>
            <th className="text-left py-3 px-4">Nome</th>
            <th className="text-left py-3 px-4">SKU</th>
            <th className="text-right py-3 px-4">Preço</th>
            <th className="text-right py-3 px-4">Estoque</th>
            <th className="text-center py-3 px-4">Ativo</th>
            <th className="text-center py-3 px-4">Destaque</th>
            <th className="text-center py-3 px-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((p) => (
            <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
              <td className="py-3 px-4">
                {p.imagens[0] ? (
                  <Image
                    src={p.imagens[0]}
                    alt={p.nome}
                    width={40}
                    height={40}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-text-secondary text-xs">
                    —
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                <span className="font-medium text-text-primary line-clamp-1">{p.nome}</span>
              </td>
              <td className="py-3 px-4">
                <span className="font-mono text-xs text-text-secondary">{p.sku}</span>
              </td>
              <td className="py-3 px-4 text-right font-mono text-text-primary">
                {formatBRL(p.preco)}
              </td>
              <td className="py-3 px-4 text-right">
                <span
                  className={`font-mono text-sm ${
                    p.estoque === 0
                      ? 'text-danger'
                      : p.estoque < 5
                        ? 'text-warning'
                        : 'text-success'
                  }`}
                >
                  {p.estoque}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => toggle(p.id, 'ativo', p.ativo)}
                  disabled={loading === p.id + 'ativo'}
                  className={`w-8 h-5 rounded-full transition-colors relative ${
                    p.ativo ? 'bg-success' : 'bg-white/20'
                  } disabled:opacity-50`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                      p.ativo ? 'left-3.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => toggle(p.id, 'destaque', p.destaque)}
                  disabled={loading === p.id + 'destaque'}
                  className={`text-lg transition-colors ${
                    p.destaque ? 'text-warning' : 'text-white/20'
                  } disabled:opacity-50 hover:text-warning`}
                  title="Destaque"
                >
                  ★
                </button>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Link
                    href={`/admin/produtos/${p.id}`}
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => deletar(p.id, p.nome)}
                    disabled={loading === p.id + 'del'}
                    className="px-3 py-1.5 text-xs rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {produtos.length === 0 && (
        <div className="text-center py-12 text-text-secondary">Nenhum produto cadastrado.</div>
      )}
    </div>
  )
}
