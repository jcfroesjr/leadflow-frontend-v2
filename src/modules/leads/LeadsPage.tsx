import { useState } from 'react'
import { Search, Plus, Filter, ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate, formatPhone } from '@/lib/utils'
import { Users } from 'lucide-react'
import type { Lead } from '@/types'

const leadsData: Lead[] = [
  { id: '1', nome: 'Claudia Guedes', telefone: '5511999990001', email: 'claudia@email.com', empresa: 'Boutique da Claudia', status: 'agendado', score: 85000, origem: 'Responde APP', criado_em: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: '2', nome: 'Rafael Mendes', telefone: '5511999990002', email: 'rafael@email.com', empresa: 'Loja do Rafael', status: 'em_contato', score: 72000, origem: 'Responde APP', criado_em: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '3', nome: 'Fernanda Lima', telefone: '5511999990003', status: 'novo', score: 60000, origem: 'Responde APP', criado_em: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: '4', nome: 'Bruno Castro', telefone: '5511999990004', empresa: 'Bruno Store', status: 'qualificado', score: 91000, origem: 'Responde APP', criado_em: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: '5', nome: 'Adriana Ribeiro', telefone: '5511999990005', email: 'adriana@email.com', status: 'agendado', score: 88000, origem: 'Responde APP', criado_em: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: '6', nome: 'Thaise Souza', telefone: '5511999990006', status: 'convertido', score: 95000, origem: 'Responde APP', criado_em: new Date(Date.now() - 7 * 86400000).toISOString() },
]

export function LeadsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  const filtered = leadsData.filter(l => {
    const matchSearch = l.nome.toLowerCase().includes(search.toLowerCase()) ||
      l.telefone.includes(search) || (l.email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'todos' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Leads</h2>
          <p className="text-xs text-muted-foreground">{leadsData.length} leads cadastrados</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus size={13} />
          Novo lead
        </Button>
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
        <div className="flex gap-1">
          {['todos', 'novo', 'em_contato', 'qualificado', 'agendado', 'convertido'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
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
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Lead <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Telefone</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Empresa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Score <ArrowUpDown size={11} />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                  Data <ArrowUpDown size={11} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={<Users size={18} />}
                    title="Nenhum lead encontrado"
                    description="Tente ajustar os filtros ou adicione um novo lead"
                  />
                </td>
              </tr>
            ) : (
              filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors cursor-pointer group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={lead.nome} size="sm" />
                      <div>
                        <p className="text-xs font-medium group-hover:text-primary transition-colors">{lead.nome}</p>
                        {lead.email && <p className="text-2xs text-muted-foreground">{lead.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{formatPhone(lead.telefone)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{lead.empresa ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground hidden lg:table-cell">
                    {(lead.score ?? 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{formatDate(lead.criado_em)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
