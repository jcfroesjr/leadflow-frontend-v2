import { useQuery } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/types'

const colunas = [
  { id: 'novo',            label: 'Novos',        color: 'bg-blue-500' },
  { id: 'em_contato',      label: 'Em contato',   color: 'bg-amber-500' },
  { id: 'qualificado',     label: 'Qualificados', color: 'bg-violet-500' },
  { id: 'agendado',        label: 'Agendados',    color: 'bg-green-500' },
  { id: 'convertido',      label: 'Convertidos',  color: 'bg-emerald-600' },
]

async function fetchLeadsForPipeline(empresaId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('id, nome, telefone, status, score, criado_em, fase_conversa')
    .eq('empresa_id', empresaId)
    .in('status', ['novo', 'em_contato', 'qualificado', 'agendado', 'convertido'])
    .order('criado_em', { ascending: false })
    .limit(200)
  if (error) throw new Error(error.message)
  return (data ?? []) as Lead[]
}

export function PipelinePage() {
  const { tenant } = useAuth()
  const empresaId = tenant?.empresa?.id ?? ''

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['pipeline-leads', empresaId],
    queryFn: () => fetchLeadsForPipeline(empresaId),
    enabled: !!empresaId,
    refetchInterval: 30000,
  })

  const byStatus = (status: string) => leads.filter(l => l.status === status)

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Pipeline</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Visão kanban por etapa do funil</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4">
        {colunas.map(col => {
          const colLeads = byStatus(col.id)
          return (
            <div key={col.id} className="flex-shrink-0 w-60 flex flex-col gap-2">
              {/* Column header */}
              <div className="flex items-center gap-2 px-1">
                <span className={cn('w-2 h-2 rounded-full', col.color)} />
                <span className="text-xs font-semibold">{col.label}</span>
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                  {isLoading ? '…' : colLeads.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[120px]">
                {isLoading ? (
                  [...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-xl" />
                  ))
                ) : colLeads.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border h-20 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Vazio</p>
                  </div>
                ) : (
                  colLeads.map(lead => (
                    <div key={lead.id} className="rounded-xl border border-border bg-card p-3 hover:shadow-sm transition-shadow cursor-default">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar name={lead.nome} size="sm" />
                        <p className="text-xs font-medium truncate">{lead.nome}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        {lead.score ? (
                          <span className="text-[10px] text-muted-foreground">
                            Score: {lead.score.toLocaleString('pt-BR')}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeTime(lead.criado_em)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
