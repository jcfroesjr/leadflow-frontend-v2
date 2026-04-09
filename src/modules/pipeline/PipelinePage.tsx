import { Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn, formatRelativeTime } from '@/lib/utils'

const colunas = [
  {
    id: 'novo', label: 'Novos', color: 'bg-blue-500', count: 3,
    leads: [
      { id: '1', nome: 'Fernanda Lima', score: 60000, tempo: new Date(Date.now() - 2 * 3600000).toISOString() },
      { id: '2', nome: 'Carlos Duarte', score: 55000, tempo: new Date(Date.now() - 5 * 3600000).toISOString() },
      { id: '3', nome: 'Ana Paula Silva', score: 48000, tempo: new Date(Date.now() - 8 * 3600000).toISOString() },
    ],
  },
  {
    id: 'em_contato', label: 'Em contato', color: 'bg-amber-500', count: 2,
    leads: [
      { id: '4', nome: 'Rafael Mendes', score: 72000, tempo: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: '5', nome: 'Lucia Torres', score: 68000, tempo: new Date(Date.now() - 2 * 86400000).toISOString() },
    ],
  },
  {
    id: 'qualificado', label: 'Qualificados', color: 'bg-violet-500', count: 2,
    leads: [
      { id: '6', nome: 'Bruno Castro', score: 91000, tempo: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: '7', nome: 'Marcia Alves', score: 87000, tempo: new Date(Date.now() - 4 * 86400000).toISOString() },
    ],
  },
  {
    id: 'agendado', label: 'Agendados', color: 'bg-green-500', count: 2,
    leads: [
      { id: '8', nome: 'Claudia Guedes', score: 85000, tempo: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: '9', nome: 'Adriana Ribeiro', score: 88000, tempo: new Date(Date.now() - 3 * 86400000).toISOString() },
    ],
  },
  {
    id: 'convertido', label: 'Convertidos', color: 'bg-emerald-600', count: 1,
    leads: [
      { id: '10', nome: 'Thaise Souza', score: 95000, tempo: new Date(Date.now() - 7 * 86400000).toISOString() },
    ],
  },
]

export function PipelinePage() {
  return (
    <div className="p-6 space-y-5 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-semibold">Pipeline</h2>
          <p className="text-xs text-muted-foreground">10 leads no funil</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">Filtros</Button>
          <Button size="sm" className="gap-1.5 text-xs"><Plus size={13} />Adicionar lead</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4 shrink-0">
        {colunas.map(col => (
          <div key={col.id} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn('h-2 w-2 rounded-full', col.color)} />
            {col.label}: <span className="font-semibold text-foreground">{col.count}</span>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto flex-1 pb-2">
        {colunas.map(col => (
          <div key={col.id} className="flex flex-col gap-2 min-w-[220px] w-[220px]">
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', col.color)} />
                <span className="text-xs font-semibold">{col.label}</span>
                <Badge variant="muted" className="text-2xs px-1.5">{col.count}</Badge>
              </div>
              <Button variant="ghost" size="icon-sm">
                <Plus size={12} />
              </Button>
            </div>

            {/* Cards */}
            <div className="space-y-2 flex-1">
              {col.leads.map(lead => (
                <div
                  key={lead.id}
                  className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={lead.nome} size="sm" />
                      <p className="text-xs font-medium leading-tight group-hover:text-primary transition-colors">{lead.nome}</p>
                    </div>
                    <Button variant="ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 h-5 w-5">
                      <MoreHorizontal size={11} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xs text-muted-foreground tabular-nums">
                      Score: {lead.score.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-2xs text-muted-foreground">{formatRelativeTime(lead.tempo)}</span>
                  </div>
                </div>
              ))}

              {/* Drop zone */}
              <button className="w-full rounded-xl border border-dashed border-border/60 py-3 text-2xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                + Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
