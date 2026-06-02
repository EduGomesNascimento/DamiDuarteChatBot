import { prisma } from '@/lib/prisma'
import { UsersTable, type UserRow } from '@/components/admin/UsersTable'

export const dynamic = 'force-dynamic'

function mascararCpf(cpf: string) {
  const c = cpf.replace(/\D/g, '')
  if (c.length !== 11) return '***.***.***-**'
  return `***.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`
}

export default async function AdminUsuariosPage() {
  let usuarios: UserRow[] = []
  try {
    const rows = await prisma.usuario.findMany({
      include: { _count: { select: { pedidos: true } } },
      orderBy: { criadoEm: 'desc' },
    })
    usuarios = rows.map((u) => ({
      id: u.id,
      nome: u.nomeCompleto,
      email: u.email,
      role: u.role,
      pedidos: u._count.pedidos,
      cpf: mascararCpf(u.cpf),
      data: u.criadoEm.toLocaleDateString('pt-BR'),
    }))
  } catch {
    usuarios = []
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold">Usuários</h2>
      <div className="surface-card p-2">
        <UsersTable usuarios={usuarios} />
      </div>
    </div>
  )
}
