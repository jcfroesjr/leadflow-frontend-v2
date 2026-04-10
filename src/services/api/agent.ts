import { supabase } from '@/lib/supabase'

export interface AgentConfig {
  modelo?: string
  openai_key?: string
  nome_agente?: string
  nome_responsavel?: string
  q1_template?: string
  q2_template?: string
  empatia_template?: string
  score_minimo?: number
  temperatura?: number
  max_tokens?: number
  agente_pausado?: boolean
}

export async function fetchAgentConfig(empresaId: string): Promise<AgentConfig> {
  const { data, error } = await supabase
    .from('empresas')
    .select('config_ia, config_apis')
    .eq('id', empresaId)
    .single()
  if (error) throw new Error(error.message)
  return (data?.config_ia ?? {}) as AgentConfig
}

export async function saveAgentConfig(
  empresaId: string,
  config: AgentConfig,
): Promise<void> {
  // Merge with existing config_ia
  const { data: existing } = await supabase
    .from('empresas')
    .select('config_ia')
    .eq('id', empresaId)
    .single()

  const merged = { ...(existing?.config_ia ?? {}), ...config }

  const { error } = await supabase
    .from('empresas')
    .update({ config_ia: merged })
    .eq('id', empresaId)
  if (error) throw new Error(error.message)
}
