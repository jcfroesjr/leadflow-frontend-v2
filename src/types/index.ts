export interface Lead {
  id: string
  nome: string
  telefone: string
  email?: string
  empresa?: string
  status: 'novo' | 'em_contato' | 'qualificado' | 'agendado' | 'convertido' | 'perdido'
  fase_conversa?: string
  score?: number
  origem?: string
  dados_raw?: Record<string, unknown>
  criado_em: string
  atualizado_em?: string
}

export interface Conversa {
  id: string
  lead: Lead
  telefone: string
  ultima_mensagem?: string
  ultima_atividade: string
  status: 'ativo' | 'aguardando' | 'resolvido' | 'modo_humano'
  nao_lidas?: number
  agente_ativo: boolean
}

export interface Mensagem {
  id: string
  role: 'user' | 'assistant' | 'sistema'
  conteudo: string
  criado_em: string
}

export interface Agendamento {
  id: string
  lead_id: string
  lead?: Lead
  inicio: string
  fim: string
  status: 'confirmado' | 'cancelado' | 'realizado'
  link_reuniao?: string
  plataforma?: string
}

export interface Empresa {
  id: string
  nome: string
  config_ia?: Record<string, unknown>
  config_apis?: Record<string, unknown>
  config_agendamento?: Record<string, unknown>
}

export interface KpiData {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
}
