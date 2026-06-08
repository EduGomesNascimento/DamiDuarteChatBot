import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { AdminNav } from '@/components/admin/AdminNav'

export const metadata = { title: 'Painel Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')
  if (user.role !== 'ADMIN') redirect('/minha-conta')

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">Painel</h1>
            <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
          </div>
          <span className="badge border border-secondary/40 bg-secondary/10 text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse-soft" />
            MODO ADMIN
          </span>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="w-full shrink-0 md:w-56">
            <AdminNav />
          </aside>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
