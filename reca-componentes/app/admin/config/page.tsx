import { getConfig } from '@/lib/config'
import { ConfigForm } from '@/components/admin/ConfigForm'

export const dynamic = 'force-dynamic'

export default async function AdminConfigPage() {
  const config = await getConfig()
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold">Configurações da loja</h2>
        <p className="text-sm text-text-secondary">Frete grátis, descontos e identidade — tudo aqui.</p>
      </div>
      <ConfigForm inicial={config} />
    </div>
  )
}
