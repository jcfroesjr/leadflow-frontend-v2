import { supabase } from '@/lib/supabase'

export interface Thread {
  telefone: string
  nome: string
  ultimaMensagem: string
  ultimaAtividade: string
  naoLidas: number
}

export interface Mensagem {
  id: string
  role: 'user' | 'assistant' | 'system'
  conteudo: string
  criado_em: string
}

export async function fetchThreads(empresaId: string): Promise<Thread[]> {
  // Get all messages, then group by telefone client-side
  const { data, error } = await supabase
    .from('conversas')
    .select('telefone, role, conteudo, criado_em')
    .eq('empresa_id', empresaId)
    .not('conteudo', 'like', 'EVENTO_ID:%')
    .not('conteudo', 'like', 'ZOOM_LINK:%')
    .not('conteudo', 'like', 'GRUPO_%')
    .order('criado_em', { ascending: false })
    .limit(500)

  if (error) throw new Error(error.message)

  const map = new Map<string, Thread>()
  for (const row of data ?? []) {
    const tel = row.telefone as string
    if (!map.has(tel)) {
      // Try to get nome from leads table for each unique telefone
      map.set(tel, {
        telefone: tel,
        nome: tel,
        ultimaMensagem: row.conteudo as string,
        ultimaAtividade: row.criado_em as string,
        naoLidas: 0,
      })
    }
  }

  // Enrich with lead names — normalize phone for matching:
  // conversas stores 5521982822554, leads may store 21982822554 (without country code)
  const telefones = Array.from(map.keys())
  if (telefones.length > 0) {
    // Build both variants: with and without 55 prefix
    const variants = new Set<string>()
    for (const tel of telefones) {
      variants.add(tel)
      if (tel.startsWith('55') && tel.length >= 12) variants.add(tel.slice(2))
      else variants.add('55' + tel)
    }
    const { data: leadsData } = await supabase
      .from('leads')
      .select('telefone, nome')
      .eq('empresa_id', empresaId)
      .in('telefone', Array.from(variants))
    for (const l of leadsData ?? []) {
      // Try exact match first
      let t = map.get(l.telefone)
      if (!t) {
        // Try with 55 prefix
        t = map.get('55' + l.telefone) ?? map.get(l.telefone.slice(2))
      }
      if (t) t.nome = l.nome
    }
  }

  return Array.from(map.values()).slice(0, 50)
}

export async function fetchMensagens(empresaId: string, telefone: string): Promise<Mensagem[]> {
  const { data, error } = await supabase
    .from('conversas')
    .select('id, role, conteudo, criado_em')
    .eq('empresa_id', empresaId)
    .eq('telefone', telefone)
    .not('conteudo', 'like', 'EVENTO_ID:%')
    .not('conteudo', 'like', 'ZOOM_LINK:%')
    .not('conteudo', 'like', 'GRUPO_%')
    .order('criado_em', { ascending: true })
    .limit(200)

  if (error) throw new Error(error.message)
  return (data ?? []) as Mensagem[]
}
