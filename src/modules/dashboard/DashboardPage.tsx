import { Users, CalendarCheck, MessageSquare, Bot, TrendingUp, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { KpiCard } from '@/components/shared/KpiCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatRelativeTime } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const chartData = [
  { dia: 'Seg', leads: 4, agendamentos: 1 },
  { dia: 'Ter', leads: 7, agendamentos: 2 },
  { dia: 'Qua', leads: 5, agendamentos: 3 },
  { dia: 'Qui', leads: 9, agendamentos: 2 },
  { dia: 'Sex', leads: 12, agendamentos: 4 },
  { dia: 'Sáb', leads: 6, agendamentos: 1 },
  { dia: 'Dom', leads: 3, agendamentos: 0 },
]

const recentLeads = [
  { id: '1', nome: 'Claudia Guedes', telefone: '5511999990001', status: 'agendado' as const, criado_em: new Date(Date.now() - 3 * 60000).toISOString() },
  { id: '2', nome: 'Rafael Mendes', telefone: '5511999990002', status: 'em_contato' as const, criado_em: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: '3', nome: 'Fernanda Lima', telefone: '5511999990003', status: 'novo' as const, criado_em: new Date(Date.now() - 42 * 60000).toISOString() },
  { id: '4', nome: 'Bruno Castro', telefone: '5511999990004', status: 'qualificado' as const, criado_em: new Date(Date.now() - 2 * 3600000).toISOString() },
]

const alerts = [
  { type: 'warning', message: '3 leads sem resposta há mais de 24h', time: '2h atrás' },
  { type: 'info', message: 'Agendamento de amanhã às 14h — Adriana Ribeiro', time: '5h atrás' },
  { type: 'success', message: 'Agente IA ativo e funcionando', time: '' },
]

export function DashboardPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Visão geral</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Acompanhe o desempenho em tempo real</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Leads este mês" value={47} change={12} icon={<Users size={14} />} />
        <KpiCard label="Agendamentos" value={18} change={8} icon={<CalendarCheck size={14} />} />
        <KpiCard label="Conversas ativas" value={9} icon={<MessageSquare size={14} />} />
        <KpiCard label="Taxa de conversão" value="38" suffix="%" change={3} icon={<TrendingUp size={14} />} />
      </div>

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leads e agendamentos — últimos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="leads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="agend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#2563eb" strokeWidth={2} fill="url(#leads)" name="Leads" />
                <Area type="monotone" dataKey="agendamentos" stroke="#22c55e" strokeWidth={2} fill="url(#agend)" name="Agendamentos" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts + Agent status */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Status do Agente IA</CardTitle>
                <Badge variant="success">Online</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bot size={13} className="text-primary" />
                <span>47 msgs processadas hoje</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 size={13} className="text-green-500" />
                <span>Fluxo Q1/Q2 ativo</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={13} />
                <span>Última mensagem há 3 min</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Alertas</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  {a.type === 'warning' && <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />}
                  {a.type === 'success' && <CheckCircle2 size={13} className="text-green-500 mt-0.5 shrink-0" />}
                  {a.type === 'info' && <Bot size={13} className="text-blue-500 mt-0.5 shrink-0" />}
                  <div>
                    <p className="text-xs text-foreground leading-snug">{a.message}</p>
                    {a.time && <p className="text-2xs text-muted-foreground mt-0.5">{a.time}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent leads */}
      <Card>
        <CardHeader>
          <CardTitle>Leads recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors cursor-pointer">
                <Avatar name={lead.nome} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lead.nome}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(lead.criado_em)}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
