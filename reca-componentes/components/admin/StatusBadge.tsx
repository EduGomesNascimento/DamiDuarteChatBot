import { cn } from '@/lib/utils'

type StatusPedido =
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGAMENTO_CONFIRMADO'
  | 'EM_SEPARACAO'
  | 'ENVIADO'
  | 'ENTREGUE'
  | 'CANCELADO'
  | 'ESTORNADO'

const STATUS_MAP: Record<StatusPedido, { label: string; color: string }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando pagamento', color: 'text-warning border-warning/30 bg-warning/10' },
  PAGAMENTO_CONFIRMADO: { label: 'Pago', color: 'text-primary border-primary/30 bg-primary/10' },
  EM_SEPARACAO: { label: 'Em separação', color: 'text-primary border-primary/30 bg-primary/10' },
  ENVIADO: { label: 'Enviado', color: 'text-secondary border-secondary/30 bg-secondary/10' },
  ENTREGUE: { label: 'Entregue', color: 'text-success border-success/30 bg-success/10' },
  CANCELADO: { label: 'Cancelado', color: 'text-danger border-danger/30 bg-danger/10' },
  ESTORNADO: { label: 'Estornado', color: 'text-danger border-danger/30 bg-danger/10' },
}

interface Props {
  status: StatusPedido
}

export function StatusBadge({ status }: Props) {
  const cfg = STATUS_MAP[status]
  return (
    <span className={cn('badge border', cfg.color)}>
      {cfg.label}
    </span>
  )
}

export { STATUS_MAP }
export type { StatusPedido }
