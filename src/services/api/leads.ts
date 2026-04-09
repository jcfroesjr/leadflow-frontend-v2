import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import type { Lead } from '@/types'

export async function fetchLeads(empresaId: string): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: false })
    .limit(100)
  if (error) throw new Error(error.message)
  return (data ?? []) as Lead[]
}

export async function agendarManual(
  leadId: string,
  body: { data: string; hora: string },
): Promise<{ ok: boolean; zoom_link?: string; data_fmt?: string; erro?: string }> {
  return api.post(`/leads/${leadId}/agendar-manual`, body)
}

export async function vincularAgendamento(
  leadId: string,
  body: { data: string; hora: string },
): Promise<{ ok: boolean; zoom_link?: string; data_fmt?: string; erro?: string }> {
  return api.post(`/leads/${leadId}/vincular-agendamento`, body)
}

export async function cancelarAgendamento(
  leadId: string,
): Promise<{ ok: boolean }> {
  return api.post(`/leads/${leadId}/cancelar-manual`, {})
}

export async function enviarZoom(leadId: string): Promise<{ ok: boolean }> {
  return api.post(`/leads/${leadId}/enviar-zoom`, {})
}

export async function iniciarConversa(leadId: string): Promise<{ ok: boolean }> {
  return api.post(`/leads/${leadId}/iniciar-conversa`, {})
}
