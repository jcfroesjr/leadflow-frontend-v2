import { supabase } from '@/lib/supabase'

export interface DashboardMetrics {
  totalLeads: number
  agendados: number
  conversasAtivas: number
  taxaConversao: number
}

export interface ChartPoint {
  date: string
  leads: number
  agendamentos: number
}

export async function fetchDashboardMetrics(empresaId: string): Promise<DashboardMetrics> {
  const [
    { count: totalLeads },
    { count: agendados },
    { count: conversasAtivas },
    { count: qualificados },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId).eq('status', 'agendado'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId).in('status', ['em_contato', 'qualificado']),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId).in('status', ['qualificado', 'agendado', 'convertido']),
  ])

  const total = totalLeads ?? 0
  const quali = qualificados ?? 0
  const taxa = total > 0 ? Math.round((quali / total) * 100) : 0

  return {
    totalLeads: total,
    agendados: agendados ?? 0,
    conversasAtivas: conversasAtivas ?? 0,
    taxaConversao: taxa,
  }
}

export async function fetchChartData(empresaId: string): Promise<ChartPoint[]> {
  // Last 7 days
  const days: ChartPoint[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({ date: dateStr, leads: 0, agendamentos: 0 })
  }

  const from = days[0].date
  const to = new Date()
  to.setDate(to.getDate() + 1)
  const toStr = to.toISOString().split('T')[0]

  const [{ data: leadsData }, { data: agData }] = await Promise.all([
    supabase.from('leads')
      .select('criado_em')
      .eq('empresa_id', empresaId)
      .gte('criado_em', from)
      .lt('criado_em', toStr),
    supabase.from('agendamentos')
      .select('criado_em')
      .eq('empresa_id', empresaId)
      .gte('criado_em', from)
      .lt('criado_em', toStr),
  ])

  for (const row of leadsData ?? []) {
    const d = (row.criado_em as string).split('T')[0]
    const pt = days.find(p => p.date === d)
    if (pt) pt.leads++
  }
  for (const row of agData ?? []) {
    const d = (row.criado_em as string).split('T')[0]
    const pt = days.find(p => p.date === d)
    if (pt) pt.agendamentos++
  }

  return days.map(p => ({
    ...p,
    date: new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
  }))
}

export async function fetchRecentLeads(empresaId: string) {
  const { data } = await supabase
    .from('leads')
    .select('id, nome, telefone, status, score, criado_em')
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: false })
    .limit(5)
  return data ?? []
}
