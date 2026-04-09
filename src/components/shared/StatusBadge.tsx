import { Badge } from '@/components/ui/badge'
import type { Lead } from '@/types'

const statusConfig: Record<Lead['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'muted' }> = {
  novo: { label: 'Novo', variant: 'default' },
  em_contato: { label: 'Em contato', variant: 'warning' },
  qualificado: { label: 'Qualificado', variant: 'secondary' },
  agendado: { label: 'Agendado', variant: 'success' },
  convertido: { label: 'Convertido', variant: 'success' },
  perdido: { label: 'Perdido', variant: 'destructive' },
}

export function StatusBadge({ status }: { status: Lead['status'] }) {
  const cfg = statusConfig[status] ?? { label: status, variant: 'muted' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
