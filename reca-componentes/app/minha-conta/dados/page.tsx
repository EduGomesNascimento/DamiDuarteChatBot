import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DadosForm } from '@/components/auth/DadosForm'

export const metadata = { title: 'Dados da conta — Minha Conta' }
export const dynamic = 'force-dynamic'

function mascararCpf(cpf: string) {
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11) return '***.***.***-**'
  return `***.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`
}

export default async function DadosPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')

  const usuario = await prisma.usuario
    .findUnique({
      where: { id: user.sub },
      select: { nomeCompleto: true, telefone: true, email: true, cpf: true },
    })
    .catch(() => null)

  if (!usuario) {
    return <div className="surface-card p-6 text-text-secondary">Não foi possível carregar seus dados.</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Dados da conta</h2>
      <div className="surface-card p-6">
        <DadosForm
          nomeCompleto={usuario.nomeCompleto}
          telefone={usuario.telefone}
          email={usuario.email}
          cpf={mascararCpf(usuario.cpf)}
        />
      </div>
    </div>
  )
}
