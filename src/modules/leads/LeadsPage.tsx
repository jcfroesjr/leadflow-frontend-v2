import { useState } from 'react'
import {
  Search, Download,
  CalendarPlus, Video, CalendarX, Link, MessageSquare,
  X, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatPhone, cn } from '@/lib/utils'
import { Users } from 'lucide-react'
import type { Lead } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchLeads,
  agendarManual,
  vincularAgendamento,
  cancelarAgendamento,
  enviarZoom,
  iniciarConversa,
} from '@/services/api/leads'

// ─── Modal genérico ──────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Botão de ação ───────────────────────────────────────────────────────────
function ActionBtn({ title, icon, color, onClick, disabled }: {
  title: string; icon: React.ReactNode; color: string; onClick: () => void; disabled?: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        color,
      )}
    >
      {icon}
    </button>
  )
}

// ─── Modal de agendamento ────────────────────────────────────────────────────
function ScheduleModal({
  open, onClose, title,
  onConfirm,
}: {
  open: boolean; onClose: () => void; title: string;
  onConfirm: (data: string, hora: string) => Promise<{ zoom_link?: string; data_fmt?: string }>
}) {
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ zoom_link?: string; data_fmt?: string } | null>(null)
  const [error, setError] = useState('')

  function handleClose() {
    setData(''); setHora(''); setResult(null); setError(''); onClose()
  }

  async function handleSubmit() {
    if (!data || !hora) return
    setLoading(true); setError('')
    try {
      const r = await onConfirm(data, hora)
      setResult(r)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao processar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      {result ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={18} />
            <span className="font-medium text-sm">Agendado com sucesso!</span>
          </div>
          {result.data_fmt && <p className="text-sm text-muted-foreground">Data: {result.data_fmt}</p>}
          {result.zoom_link && (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Link da reunião</p>
              <a href={result.zoom_link} target="_blank" rel="noreferrer"
                className="text-sm text-primary break-all hover:underline">{result.zoom_link}</a>
            </div>
          )}
          <Button className="w-full" onClick={handleClose}>Fechar</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Data</label>
            <Input type="date" value={data} onChange={e => setData(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Hora</label>
            <Input type="time" value={hora} onChange={e => setHora(e.target.value)} />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!data || !hora || loading}>
              {loading ? 'Processando…' : 'Confirmar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────
export function LeadsPage() {
  const { tenant } = useAuth()
  const empresaId = tenant?.empresa?.id ?? ''
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Modal state
  const [agendarModal, setAgendarModal] = useState<Lead | null>(null)
  const [vincularModal, setVincularModal] = useState<Lead | null>(null)

  // Loading states per action
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({})

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads', empresaId],
    queryFn: () => fetchLeads(empresaId),
    enabled: !!empresaId,
  })

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.nome.toLowerCase().includes(search.toLowerCase()) ||
      l.telefone.includes(search)
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  function setLoading(leadId: string, action: string) {
    setActionLoading(p => ({ ...p, [leadId]: action }))
  }
  function clearLoading(leadId: string) {
    setActionLoading(p => { const n = { ...p }; delete n[leadId]; return n })
  }

  async function handleCancelar(lead: Lead) {
    if (!confirm(`Cancelar agendamento de ${lead.nome}?`)) return
    setLoading(lead.id, 'cancelar')
    try {
      await cancelarAgendamento(lead.id)
      qc.invalidateQueries({ queryKey: ['leads', empresaId] })
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao cancelar')
    } finally { clearLoading(lead.id) }
  }

  async function handleZoom(lead: Lead) {
    setLoading(lead.id, 'zoom')
    try {
      await enviarZoom(lead.id)
      alert('Link Zoom enviado!')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao enviar Zoom')
    } finally { clearLoading(lead.id) }
  }

  async function handleIniciar(lead: Lead) {
    if (!confirm(`Iniciar conversa com ${lead.nome}?`)) return
    setLoading(lead.id, 'iniciar')
    try {
      await iniciarConversa(lead.id)
      qc.invalidateQueries({ queryKey: ['leads', empresaId] })
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao iniciar conversa')
    } finally { clearLoading(lead.id) }
  }

  function exportCSV() {
    const rows = [
      ['Nome', 'Telefone', 'Empresa', 'Status', 'Score', 'Data'],
      ...leads.map(l => [l.nome, l.telefone, l.empresa ?? '', l.status, String(l.score ?? ''), formatDate(l.criado_em)]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'leads.csv'
    a.click()
  }

  const statuses = ['all', 'novo', 'em_contato', 'qualificado', 'agendado', 'convertido', 'perdido']

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Leads</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{leads.length} leads no total</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
          <Download size={13} /> Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input
            placeholder="Buscar por nome ou telefone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent',
              )}
            >
              {s === 'all' ? 'Todos' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Lead', 'Telefone', 'Empresa', 'Status', 'Score', 'Data', 'Ações'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <EmptyState icon={<Users size={32} />} title="Nenhum lead encontrado" description="Ajuste os filtros ou aguarde novos leads." />
                  </td>
                </tr>
              ) : (
                filtered.map(lead => {
                  const busy = actionLoading[lead.id]
                  return (
                    <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={lead.nome} size="sm" />
                          <span className="text-sm font-medium whitespace-nowrap">{lead.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatPhone(lead.telefone)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {lead.empresa ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {lead.score ? lead.score.toLocaleString('pt-BR') : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(lead.criado_em)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <ActionBtn
                            title="Agendar manualmente"
                            icon={<CalendarPlus size={14} />}
                            color="text-violet-500 hover:bg-violet-500/10"
                            onClick={() => setAgendarModal(lead)}
                            disabled={!!busy}
                          />
                          <ActionBtn
                            title="Enviar link Zoom"
                            icon={<Video size={14} />}
                            color="text-blue-500 hover:bg-blue-500/10"
                            onClick={() => handleZoom(lead)}
                            disabled={!!busy}
                          />
                          <ActionBtn
                            title="Cancelar agendamento"
                            icon={<CalendarX size={14} />}
                            color="text-destructive hover:bg-destructive/10"
                            onClick={() => handleCancelar(lead)}
                            disabled={!!busy || lead.status !== 'agendado'}
                          />
                          <ActionBtn
                            title="Vincular agendamento externo"
                            icon={<Link size={14} />}
                            color="text-amber-500 hover:bg-amber-500/10"
                            onClick={() => setVincularModal(lead)}
                            disabled={!!busy}
                          />
                          <ActionBtn
                            title="Iniciar conversa Bia"
                            icon={<MessageSquare size={14} />}
                            color="text-green-500 hover:bg-green-500/10"
                            onClick={() => handleIniciar(lead)}
                            disabled={!!busy}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Agendar */}
      <ScheduleModal
        open={!!agendarModal}
        onClose={() => { setAgendarModal(null); qc.invalidateQueries({ queryKey: ['leads', empresaId] }) }}
        title={`Agendar — ${agendarModal?.nome ?? ''}`}
        onConfirm={(data, hora) => agendarManual(agendarModal!.id, { data, hora })}
      />

      {/* Modal: Vincular */}
      <ScheduleModal
        open={!!vincularModal}
        onClose={() => { setVincularModal(null); qc.invalidateQueries({ queryKey: ['leads', empresaId] }) }}
        title={`Vincular agendamento — ${vincularModal?.nome ?? ''}`}
        onConfirm={(data, hora) => vincularAgendamento(vincularModal!.id, { data, hora })}
      />
    </div>
  )
}
