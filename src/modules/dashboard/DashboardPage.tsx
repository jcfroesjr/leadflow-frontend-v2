import { Users, CalendarCheck, MessageSquare, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { KpiCard } from '@/components/shared/KpiCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import type { Lead } from '@/types'
import {
  fetchDashboardMetrics,
  fetchChartData,
  fetchRecentLeads,
} from '@/services/api/dashboard'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardPage() {
  const { tenant } = useAuth()
  const empresaId = tenant?.empresa?.id ?? ''

  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics', empresaId],
    queryFn: () => fetchDashboardMetrics(empresaId),
    enabled: !!empresaId,
  })

  const { data: chartData, isLoading: loadingChart } = useQuery({
    queryKey: ['dashboard-chart', empresaId],
    queryFn: () => fetchChartData(empresaId),
    enabled: !!empresaId,
  })

  const { data: recentLeads, isLoading: loadingLeads } = useQuery({
    queryKey: ['dashboard-recent-leads', empresaId],
    queryFn: () => fetchRecentLeads(empresaId),
    enabled: !!empresaId,
  })

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Visão geral</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {tenant?.empresa?.nome} — acompanhe o desempenho em tempo real
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total de leads"
          value={metrics?.totalLeads ?? 0}
          loading={loadingMetrics}
          icon={<Users size={14} />}
        />
        <KpiCard
          label="Agendamentos"
          value={metrics?.agendados ?? 0}
          loading={loadingMetrics}
          icon={<CalendarCheck size={14} />}
        />
        <KpiCard
          label="Conversas ativas"
          value={metrics?.conversasAtivas ?? 0}
          loading={loadingMetrics}
          icon={<MessageSquare size={14} />}
        />
        <KpiCard
          label="Taxa de conversão"
          value={metrics?.taxaConversao ?? 0}
          suffix="%"
          loading={loadingMetrics}
          icon={<TrendingUp size={14} />}
        />
      </div>

      {/* Chart + Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leads e agendamentos — últimos 7 dias</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingChart ? (
              <Skeleton className="h-44 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={176}>
                <AreaChart data={chartData ?? []} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2, 160 60% 45%))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2, 160 60% 45%))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="leads" name="Leads" stroke="hsl(var(--primary))" fill="url(#leads)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="agendamentos" name="Agendamentos" stroke="hsl(160 60% 45%)" fill="url(#ag)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Agent status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agente IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">Bi</div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-background" />
              </div>
              <div>
                <p className="text-sm font-medium">Bia</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 size={12} />
                Qualificação ativa
              </div>
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 size={12} />
                Agendamento automático
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Últimos leads</CardTitle>
            <a href="/leads" className="text-xs text-primary hover:underline">Ver todos</a>
          </div>
        </CardHeader>
        <CardContent>
          {loadingLeads ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (recentLeads ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum lead recebido ainda.
            </p>
          ) : (
            <div className="space-y-1">
              {(recentLeads ?? []).map((lead: Lead) => (
                <div key={lead.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <Avatar name={lead.nome} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lead.nome}</p>
                    <p className="text-xs text-muted-foreground">{lead.telefone}</p>
                  </div>
                  <StatusBadge status={lead.status as 'novo' | 'em_contato' | 'qualificado' | 'agendado' | 'convertido' | 'perdido'} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(lead.criado_em)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
