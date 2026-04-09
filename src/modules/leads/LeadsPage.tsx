import { useState } from 'react'
import {
  Search, Plus, Filter, ArrowUpDown, Download,
  CalendarPlus, Video, CalendarX, Link, MessageSquare,
  X, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate, formatPhone, cn } from '@/lib/utils'
import { Users } from 'lucide-react'
import type { Lead } from '@/types'

// ─── Mock data (substituir por TanStack Query + Supabase) ────────────────────
const leadsData: Lead[] = [
  { id: '1', nome: 'Claudia Guedes', telefone: '5511999990001', email: 'claudia@email.com', empresa: 'Boutique da Claudia', status: 'agendado', score: 85000, origem: 'Responde APP', criado_em: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '2', nome: 'Rafael Mendes', telefone: '5511999990002', email: 'rafael@email.com', empresa: 'Loja do Rafael', status: 'em_contato', score: 72000, origem: 'Responde APP', criado_em: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '3', nome: 'Fernanda Lima', telefone: '5511999990003', status: 'novo', score: 60000, origem: 'Responde APP', criado_em: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: '4', nome: 'Bruno Castro', telefone: '5511999990004', empresa: 'Bruno Store', status: 'qualificado', score: 91000, origem: 'Responde APP', criado_em: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '5', nome: 'Adriana Ribeiro', telefone: '5511999990005', email: 'adriana@email.com', status: 'agendado', score: 88000, origem: 'Responde APP', criado_em: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '6', nome: 'Thaise Souza', telefone: '5511999990006', status: 'convertido', score: 95000, origem: 'Responde APP', criado_em: new Date(Date.now() - 7 * 86400000).toISOString() },
]

// ─── Modal genérico ──────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card shadow-xl p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">{title}</h3>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><X size={14} /></Button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Botão de ação inline ────────────────────────────────────────────────────
function ActionBtn({ title, icon: Icon, color, onClick, disabled }: {
  title: string; icon: React.ElementType; color: string; onClick: (e: React.MouseEvent) => void; disabled?: boolean
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        color
      )}
    >
      <Icon size={14} />
    </button>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function LeadsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  // Modal agendar manual
  const [modalAgendar, setModalAgendar] = useState<Lead | null>(null)
  const [agData, setAgData] = useState('')
  const [agHora, setAgHora] = useState('')
  const [agSalvando, setAgSalvando] = useState(false)
  const [agResultado, setAgResultado] = useState<{ ok: boolean; zoom_link?: string; data_fmt?: string; erro?: string } | null>(null)

  // Modal vincular agendamento externo
  const [modalVincular, setModalVincular] = useState<Lead | null>(null)
  const [vinData, setVinData] = useState('')
  const [vinHora, setVinHora] = useState('')
  const [vinSalvando, setVinSalvando] = useState(false)
  const [vinResultado, setVinResultado] = useState<{ ok: boolean; zoom_link?: string; data_fmt?: string; erro?: string } | null>(null)

  // Estados inline
  const [zoomEnviando, setZoomEnviando] = useState<string | null>(null)
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [iniciando, setIniciando] = useState<string | null>(null)

  const filtered = leadsData.filter(l => {
    const matchSearch =
      l.nome.toLowerCase().includes(search.toLowerCase()) ||
      l.telefone.includes(search) ||
      (l.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'todos' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  function exportarCSV() {
    const header = 'nome,telefone,email,empresa,score,status,data\n'
    const rows = filtered.map(l =>
      `"${l.nome}","${l.telefone}","${l.email ?? ''}","${l.empresa ?? ''}",${l.score ?? ''},"${l.status}","${l.criado_em}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click()
  }

  // Handlers (TODO: conectar ao backend real)
  function abrirModalAgendar(e: React.MouseEvent, lead: Lead) {
    e.stopPropagation(); setAgData(''); setAgHora(''); setAgResultado(null); setModalAgendar(lead)
  }
  async function confirmarAgendamento() {
    if (!agData || !agHora || !modalAgendar) return
    setAgSalvando(true)
    // TODO: api.post(`/leads/${modalAgendar.id}/agendar-manual`, { data: agData, hora: agHora })
    await new Promise(r => setTimeout(r, 800))
    setAgResultado({ ok: true, data_fmt: `${agData} às ${agHora}` })
    setAgSalvando(false)
  }

  function abrirModalVincular(e: React.MouseEvent, lead: Lead) {
    e.stopPropagation(); setVinData(''); setVinHora(''); setVinResultado(null); setModalVincular(lead)
  }
  async function confirmarVincular() {
    if (!vinData || !vinHora || !modalVincular) return
    setVinSalvando(true)
    // TODO: api.post(`/leads/${modalVincular.id}/vincular-agendamento`, { data: vinData, hora: vinHora })
    await new Promise(r => setTimeout(r, 800))
    setVinResultado({ ok: true, data_fmt: `${vinData} às ${vinHora}` })
    setVinSalvando(false)
  }

  async function cancelarAgendamento(e: React.MouseEvent, lead: Lead) {
    e.stopPropagation()
    if (!confirm(`Cancelar agendamento de ${lead.nome}? O evento será removido do Google Calendar.`)) return
    setCancelando(lead.id)
    // TODO: api.post(`/leads/${lead.id}/cancelar-manual`)
    await new Promise(r => setTimeout(r, 600))
    setCancelando(null)
  }

  async function enviarZoom(e: React.MouseEvent, lead: Lead) {
    e.stopPropagation()
    setZoomEnviando(lead.id)
    // TODO: api.post(`/leads/${lead.id}/enviar-zoom`)
    await new Promise(r => setTimeout(r, 600))
    setZoomEnviando(null)
  }

  async function iniciarConversa(e: React.MouseEvent, lead: Lead) {
    e.stopPropagation()
    if (!confirm(`Iniciar conversa com ${lead.nome}? A Bia enviará a mensagem inicial.`)) return
    setIniciando(lead.id)
    // TODO: api.post(`/leads/${lead.id}/iniciar-conversa`)
    await new Promise(r => setTimeout(r, 600))
    setIniciando(null)
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Leads</h2>
          <p className="text-xs text-muted-foreground">{leadsData.length} leads cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportarCSV}>
            <Download size={13} />Exportar CSV
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus size={13} />Novo lead
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['todos', 'novo', 'em_contato', 'qualificado', 'agendado', 'convertido', 'perdido'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-md font-medium transition-colors',
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {s === 'todos' ? 'Todos' : s === 'em_contato' ? 'Em contato' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="icon-sm" className="ml-auto"><Filter size={13} /></Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">Lead <ArrowUpDown size={11} /></button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Telefone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Empresa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">Score <ArrowUpDown size={11} /></button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">Data <ArrowUpDown size={11} /></button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState icon={<Users size={18} />} title="Nenhum lead encontrado" description="Tente ajustar os filtros" />
                </td>
              </tr>
            ) : (
              filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={lead.nome} size="sm" />
                      <div>
                        <p className="text-xs font-medium group-hover:text-primary transition-colors">{lead.nome}</p>
                        {lead.email && <p className="text-2xs text-muted-foreground">{lead.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell font-mono">{formatPhone(lead.telefone)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{lead.empresa ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground hidden lg:table-cell">
                    {(lead.score ?? 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{formatDate(lead.criado_em)}</td>
                  {/* Ações */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-0.5">
                      <ActionBtn
                        title="Agendar manualmente"
                        icon={CalendarPlus}
                        color="text-violet-500 hover:bg-violet-500/10"
                        onClick={e => abrirModalAgendar(e, lead)}
                      />
                      <ActionBtn
                        title="Enviar link Zoom"
                        icon={Video}
                        color="text-blue-500 hover:bg-blue-500/10"
                        onClick={e => enviarZoom(e, lead)}
                        disabled={zoomEnviando === lead.id}
                      />
                      <ActionBtn
                        title="Cancelar agendamento"
                        icon={CalendarX}
                        color="text-destructive hover:bg-destructive/10"
                        onClick={e => cancelarAgendamento(e, lead)}
                        disabled={cancelando === lead.id}
                      />
                      <ActionBtn
                        title="Vincular agendamento externo + Zoom"
                        icon={Link}
                        color="text-amber-500 hover:bg-amber-500/10"
                        onClick={e => abrirModalVincular(e, lead)}
                      />
                      <ActionBtn
                        title="Iniciar conversa com Bia"
                        icon={MessageSquare}
                        color="text-green-500 hover:bg-green-500/10"
                        onClick={e => iniciarConversa(e, lead)}
                        disabled={iniciando === lead.id}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal — Agendar manualmente */}
      <Modal
        open={!!modalAgendar}
        onClose={() => { setModalAgendar(null); setAgResultado(null) }}
        title={`Agendar — ${modalAgendar?.nome ?? ''}`}
      >
        {!agResultado ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Informe a data e horário. O evento será criado no Google Calendar e o link Zoom gerado automaticamente.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Data</label>
                <Input type="date" value={agData} onChange={e => setAgData(e.target.value)} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Horário</label>
                <Input type="time" value={agHora} onChange={e => setAgHora(e.target.value)} className="text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalAgendar(null)}>Cancelar</Button>
              <Button size="sm" disabled={!agData || !agHora || agSalvando} onClick={confirmarAgendamento}>
                {agSalvando ? 'Agendando…' : 'Confirmar agendamento'}
              </Button>
            </div>
          </div>
        ) : agResultado.ok ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
              <CheckCircle2 size={15} /> Agendamento criado para {agResultado.data_fmt}
            </div>
            {agResultado.zoom_link && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Link Zoom</p>
                <p className="font-mono text-xs bg-muted p-2 rounded break-all">{agResultado.zoom_link}</p>
              </div>
            )}
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setModalAgendar(null); setAgResultado(null) }}>Fechar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle size={15} /> {agResultado.erro}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setAgResultado(null)}>Tentar novamente</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal — Vincular agendamento externo */}
      <Modal
        open={!!modalVincular}
        onClose={() => { setModalVincular(null); setVinResultado(null) }}
        title={`Vincular agendamento — ${modalVincular?.nome ?? ''}`}
      >
        {!vinResultado ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Informe a data e horário de um agendamento já realizado em outra plataforma. O link Zoom será gerado e vinculado ao lead.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Data</label>
                <Input type="date" value={vinData} onChange={e => setVinData(e.target.value)} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Horário</label>
                <Input type="time" value={vinHora} onChange={e => setVinHora(e.target.value)} className="text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalVincular(null)}>Cancelar</Button>
              <Button size="sm" disabled={!vinData || !vinHora || vinSalvando} onClick={confirmarVincular}>
                {vinSalvando ? 'Vinculando…' : 'Vincular agendamento'}
              </Button>
            </div>
          </div>
        ) : vinResultado.ok ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
              <CheckCircle2 size={15} /> Agendamento vinculado para {vinResultado.data_fmt}
            </div>
            {vinResultado.zoom_link && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Link Zoom</p>
                <p className="font-mono text-xs bg-muted p-2 rounded break-all">{vinResultado.zoom_link}</p>
              </div>
            )}
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setModalVincular(null); setVinResultado(null) }}>Fechar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle size={15} /> {vinResultado.erro}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setVinResultado(null)}>Tentar novamente</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
