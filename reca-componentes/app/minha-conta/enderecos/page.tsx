import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { EnderecosClient } from '@/components/auth/EnderecosClient'

export const metadata = {
  title: 'Endereços — Minha Conta',
}

export default async function EnderecosPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/auth')

  return <EnderecosClient />
}
