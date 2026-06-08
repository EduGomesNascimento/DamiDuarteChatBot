import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { SidebarNav } from '@/components/auth/SidebarNav'

export const metadata = {
  title: 'Minha Conta',
}

export default async function MinhaContaLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-text-primary">Minha Conta</h1>
          <p className="text-text-secondary text-sm mt-1">{user.email}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-56 shrink-0">
            <SidebarNav />
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
