import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, CheckCircle2, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

// ─── Secret input with show/hide toggle ───────────────────────────────────────
function SecretInput({ value, onChange, placeholder, className }: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn('pr-9 font-mono text-xs', className)}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Apis {
  evolution_url: string
  evolution_key: string
  evolution_instancia: string
  anthropic_key: string
  gemini_key: string
  openai_key: string
  notificacoes_telefones: string[]
  notificacoes_ativas: boolean
  notificacoes_enviar_pdf: boolean
  notificacoes_score_minimo: number
  notificacoes_instancia: string
  notificacoes_key: string
  google_oauth_client_id: string
  google_oauth_client_secret: string
  google_calendar_id: string
  google_calendars_verificar: string[]
  google_calendar_credentials: object | null
  zoom_account_id: string
  zoom_client_id: string
  zoom_client_secret: string
  meta_access_token: string
  meta_ad_account_id: string
}

const DEFAULT_APIS: Apis = {
  evolution_url: '', evolution_key: '', evolution_instancia: '',
  anthropic_key: '', gemini_key: '', openai_key: '',
  notificacoes_telefones: [], notificacoes_ativas: true, notificacoes_enviar_pdf: true,
  notificacoes_score_minimo: 0, notificacoes_instancia: '', notificacoes_key: '',
  google_oauth_client_id: '', google_oauth_client_secret: '',
  google_calendar_id: 'primary', google_calendars_verificar: [],
  google_calendar_credentials: null,
  zoom_account_id: '', zoom_client_id: '', zoom_client_secret: '',
  meta_access_token: '', meta_ad_account_id: '',
}

type Aba = 'apis' | 'notificacoes' | 'empresa'

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 mt-5 first:mt-0">
      {children}
    </p>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SettingsPage() {
  const { tenant } = useAuth()
  const empresaId = tenant?.empresa?.id ?? ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')
  const [aba, setAba] = useState<Aba>('apis')

  const [apis, setApis] = useState<Apis>(DEFAULT_APIS)
  const [empresa, setEmpresa] = useState({ nome: '', cnpj: '', fuso: 'America/Sao_Paulo' })
  const [configIa, setConfigIa] = useState<{ agente_pausado: boolean }>({ agente_pausado: false })
  const [novoTel, setNovoTel] = useState('')

  useEffect(() => {
    if (!empresaId) return
    async function load() {
      const { data } = await supabase
        .from('empresas')
        .select('nome, cnpj, fuso, evolution_instancia, config_apis, config_ia')
        .eq('id', empresaId)
        .single()
      if (data) {
        setEmpresa({ nome: data.nome ?? '', cnpj: data.cnpj ?? '', fuso: data.fuso ?? 'America/Sao_Paulo' })
        const ca = data.config_apis ?? {}
        setApis({
          ...DEFAULT_APIS,
          ...ca,
          evolution_instancia: data.evolution_instancia ?? '',
          google_calendars_verificar: ca.google_calendars_verificar ?? [],
          notificacoes_telefones: ca.notificacoes_telefones ?? [],
        })
        setConfigIa({ agente_pausado: data.config_ia?.agente_pausado ?? false })
      }
      setLoading(false)
    }
    load()
  }, [empresaId])

  function setApi<K extends keyof Apis>(k: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setApis(a => ({ ...a, [k]: e.target.value }))
  }

  async function salvarApis(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('empresas').update({
      config_apis: apis,
      evolution_instancia: apis.evolution_instancia,
    }).eq('id', empresaId)
    setSaving(false)
    setSaved('apis')
    setTimeout(() => setSaved(''), 3000)
  }

  async function salvarEmpresa(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('empresas').update({ nome: empresa.nome, cnpj: empresa.cnpj, fuso: empresa.fuso }).eq('id', empresaId)
    setSaving(false)
    setSaved('empresa')
    setTimeout(() => setSaved(''), 3000)
  }

  async function toggleAgente() {
    const novo = !configIa.agente_pausado
    setConfigIa({ agente_pausado: novo })
    const { data: existing } = await supabase.from('empresas').select('config_ia').eq('id', empresaId).single()
    await supabase.from('empresas').update({ config_ia: { ...(existing?.config_ia ?? {}), agente_pausado: novo } }).eq('id', empresaId)
  }

  function addTel() {
    const t = novoTel.replace(/\D/g, '')
    if (!t || apis.notificacoes_telefones.includes(t)) return
    setApis(a => ({ ...a, notificacoes_telefones: [...a.notificacoes_telefones, t] }))
    setNovoTel('')
  }

  const abas: { id: Aba; label: string }[] = [
    { id: 'apis', label: 'Integrações de API' },
    { id: 'notificacoes', label: 'Notificações' },
    { id: 'empresa', label: 'Dados da empresa' },
  ]

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold">Configurações</h2>
        <p className="text-xs text-muted-foreground">Chaves de API e dados da sua conta</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-0">
        {abas.map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={cn(
              'px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px',
              aba === a.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* ── ABA: APIs ── */}
      {aba === 'apis' && (
        <form onSubmit={salvarApis} className="space-y-0">
          <Card>
            <CardContent className="pt-5 space-y-4">
              <SectionLabel>WhatsApp — Evolution API</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <Field label="URL base">
                  <Input value={apis.evolution_url} onChange={setApi('evolution_url')} placeholder="https://evo.suaempresa.com" className="text-xs" />
                </Field>
                <Field label="Global API Key">
                  <SecretInput value={apis.evolution_key} onChange={setApi('evolution_key')} placeholder="Chave da Evolution API" />
                </Field>
                <Field label="Nome da instância WhatsApp">
                  <Input value={apis.evolution_instancia} onChange={setApi('evolution_instancia')} placeholder="minha-instancia" className="text-xs" />
                </Field>
              </div>

              <SectionLabel>Modelos de linguagem (LLM)</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Anthropic — API Key">
                  <SecretInput value={apis.anthropic_key} onChange={setApi('anthropic_key')} placeholder="sk-ant-api03-..." />
                </Field>
                <Field label="Google Gemini — API Key">
                  <SecretInput value={apis.gemini_key} onChange={setApi('gemini_key')} placeholder="AIzaSy..." />
                </Field>
                <Field label="OpenAI — API Key">
                  <SecretInput value={apis.openai_key} onChange={setApi('openai_key')} placeholder="sk-..." />
                </Field>
              </div>

              <SectionLabel>Google Agenda — OAuth2</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Google OAuth Client ID">
                  <Input value={apis.google_oauth_client_id} onChange={setApi('google_oauth_client_id')} placeholder="123456789-xxxx.apps.googleusercontent.com" className="text-xs" />
                </Field>
                <Field label="Google OAuth Client Secret">
                  <SecretInput value={apis.google_oauth_client_secret} onChange={setApi('google_oauth_client_secret')} placeholder="GOCSPX-..." />
                </Field>
                <Field label="ID da agenda principal (onde cria eventos)">
                  <Input value={apis.google_calendar_id} onChange={setApi('google_calendar_id')} placeholder="exemplo@gmail.com" className="text-xs" />
                </Field>
                <Field
                  label="Credenciais Service Account (JSON)"
                  hint={apis.google_calendar_credentials ? '✓ configurado' : 'não configurado'}
                >
                  <Input
                    type="file"
                    accept=".json"
                    className="text-xs py-1"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = ev => {
                        try {
                          const json = JSON.parse(ev.target?.result as string)
                          setApis(a => ({ ...a, google_calendar_credentials: json }))
                        } catch { alert('Arquivo JSON inválido') }
                      }
                      reader.readAsText(file)
                    }}
                  />
                </Field>
              </div>

              <Field label="Agendas para verificar disponibilidade">
                <div className="space-y-2">
                  {(apis.google_calendars_verificar ?? []).map((calId, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={calId}
                        className="text-xs"
                        placeholder="ex: exemplo@gmail.com ou ID do calendário"
                        onChange={e => {
                          const updated = [...apis.google_calendars_verificar]
                          updated[i] = e.target.value
                          setApis(a => ({ ...a, google_calendars_verificar: updated }))
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 flex-shrink-0 text-destructive border-destructive/30"
                        onClick={() => setApis(a => ({ ...a, google_calendars_verificar: a.google_calendars_verificar.filter((_, j) => j !== i) }))}
                      >
                        <X size={13} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs w-full"
                    onClick={() => setApis(a => ({ ...a, google_calendars_verificar: [...(a.google_calendars_verificar ?? []), ''] }))}
                  >
                    <Plus size={12} className="mr-1.5" /> Adicionar agenda
                  </Button>
                </div>
              </Field>

              <SectionLabel>Zoom — Videoconferência</SectionLabel>
              <p className="text-[11px] text-muted-foreground -mt-2">
                Crie um app "Server-to-Server OAuth" em marketplace.zoom.us para obter as credenciais abaixo.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Account ID">
                  <Input value={apis.zoom_account_id} onChange={setApi('zoom_account_id')} placeholder="xxxxxxxxxxxx" className="text-xs" />
                </Field>
                <Field label="Client ID">
                  <Input value={apis.zoom_client_id} onChange={setApi('zoom_client_id')} placeholder="xxxxxxxxxxxx" className="text-xs" />
                </Field>
                <Field label="Client Secret">
                  <SecretInput value={apis.zoom_client_secret} onChange={setApi('zoom_client_secret')} placeholder="xxxxxxxxxxxxxxxxxxxx" />
                </Field>
              </div>

              <SectionLabel>Meta Ads — Rastreamento de criativos</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Access Token (longa duração)" hint="Gere em developers.facebook.com → Graph API Explorer">
                  <SecretInput value={apis.meta_access_token} onChange={setApi('meta_access_token')} placeholder="EAAxxxxxxxx..." />
                </Field>
                <Field label="ID da Conta de Anúncios (opcional)" hint="Formato: act_ seguido do ID numérico">
                  <Input value={apis.meta_ad_account_id} onChange={setApi('meta_ad_account_id')} placeholder="act_123456789" className="text-xs" />
                </Field>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
                  {saved === 'apis' ? <><CheckCircle2 size={12} /> Salvo!</> : saving ? 'Salvando…' : 'Salvar chaves'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* ── ABA: Notificações ── */}
      {aba === 'notificacoes' && (
        <form onSubmit={salvarApis} className="space-y-4">
          {/* Agente IA toggle */}
          <Card className={cn('border', configIa.agente_pausado ? 'border-destructive/40 bg-destructive/5' : 'border-green-500/30 bg-green-500/5')}>
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">Agente IA</p>
                  <Badge variant={configIa.agente_pausado ? 'destructive' : 'success'} className="text-[10px]">
                    {configIa.agente_pausado ? 'PAUSADO' : 'ATIVO'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {configIa.agente_pausado
                    ? 'A IA não enviará mensagens. Notificações continuam normalmente.'
                    : 'A IA está ativa: envia mensagem inicial e responde no WhatsApp.'}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={configIa.agente_pausado ? 'default' : 'destructive'}
                onClick={toggleAgente}
                className="flex-shrink-0"
              >
                {configIa.agente_pausado ? '▶ Reativar IA' : '⏸ Pausar IA'}
              </Button>
            </CardContent>
          </Card>

          {/* Notificações de leads */}
          <Card className={cn('border', apis.notificacoes_ativas ? 'border-green-500/30' : 'border-destructive/30')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm">Notificações de novos leads</CardTitle>
                  <Badge variant={apis.notificacoes_ativas ? 'success' : 'secondary'} className="text-[10px]">
                    {apis.notificacoes_ativas ? 'ATIVAS' : 'DESATIVADAS'}
                  </Badge>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={apis.notificacoes_ativas ? 'destructive' : 'default'}
                  onClick={() => setApis(a => ({ ...a, notificacoes_ativas: !a.notificacoes_ativas }))}
                >
                  {apis.notificacoes_ativas ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
              <CardDescription className="text-xs">
                {apis.notificacoes_ativas
                  ? 'Os telefones cadastrados receberão mensagem + PDF quando um novo lead chegar.'
                  : 'Nenhuma notificação será enviada para a equipe.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Instância Evolution para notificações" hint="Se vazia, usa a instância principal">
                  <Input value={apis.notificacoes_instancia} className="text-xs"
                    onChange={e => setApis(a => ({ ...a, notificacoes_instancia: e.target.value }))}
                    placeholder="Deixe em branco para usar a principal" />
                </Field>
                <Field label="Chave API da instância de notificações" hint="Se vazia, usa a Global API Key">
                  <SecretInput value={apis.notificacoes_key}
                    onChange={e => setApis(a => ({ ...a, notificacoes_key: e.target.value }))}
                    placeholder="Deixe em branco para usar a principal" />
                </Field>
                <Field label="Score mínimo para notificar" hint="Use 0 para notificar todos os leads">
                  <Input type="number" min="0" className="text-xs"
                    value={apis.notificacoes_score_minimo}
                    onChange={e => setApis(a => ({ ...a, notificacoes_score_minimo: Number(e.target.value) }))} />
                </Field>
                <Field label="Enviar PDF ao notificar">
                  <div className="flex items-center justify-between rounded-lg border border-border p-2.5">
                    <span className="text-xs">{apis.notificacoes_enviar_pdf ? 'PDF ativado' : 'PDF desativado'}</span>
                    <Button type="button" size="sm" variant={apis.notificacoes_enviar_pdf ? 'destructive' : 'default'}
                      onClick={() => setApis(a => ({ ...a, notificacoes_enviar_pdf: !a.notificacoes_enviar_pdf }))}>
                      {apis.notificacoes_enviar_pdf ? 'Desativar PDF' : 'Ativar PDF'}
                    </Button>
                  </div>
                </Field>
              </div>

              {/* Telefones */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Telefones para notificar</p>
                {apis.notificacoes_telefones.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Nenhum telefone cadastrado.</p>
                  </div>
                ) : (
                  apis.notificacoes_telefones.map(tel => (
                    <div key={tel} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                      <span className="flex-1 font-mono text-xs">+{tel}</span>
                      <button type="button" onClick={() => setApis(a => ({ ...a, notificacoes_telefones: a.notificacoes_telefones.filter(t => t !== tel) }))}
                        className="text-destructive hover:text-destructive/80 text-xs">
                        Remover
                      </button>
                    </div>
                  ))
                )}
                <div className="flex gap-2">
                  <Input
                    value={novoTel}
                    placeholder="5521999999999"
                    className="font-mono text-xs"
                    onChange={e => setNovoTel(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTel() } }}
                    maxLength={15}
                  />
                  <Button type="button" size="sm" disabled={!novoTel} onClick={addTel}>
                    <Plus size={13} className="mr-1" /> Adicionar
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
                  {saved === 'apis' ? <><CheckCircle2 size={12} /> Salvo!</> : saving ? 'Salvando…' : 'Salvar notificações'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {/* ── ABA: Empresa ── */}
      {aba === 'empresa' && (
        <form onSubmit={salvarEmpresa}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dados da empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome da empresa">
                  <Input required value={empresa.nome} onChange={e => setEmpresa(x => ({ ...x, nome: e.target.value }))} className="text-sm" />
                </Field>
                <Field label="CNPJ">
                  <Input value={empresa.cnpj} onChange={e => setEmpresa(x => ({ ...x, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" className="text-sm" />
                </Field>
                <Field label="Fuso horário">
                  <select
                    value={empresa.fuso}
                    onChange={e => setEmpresa(x => ({ ...x, fuso: e.target.value }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</option>
                    <option value="America/Manaus">America/Manaus (UTC-4)</option>
                    <option value="America/Belem">America/Belem (UTC-3)</option>
                    <option value="America/Fortaleza">America/Fortaleza (UTC-3)</option>
                    <option value="America/Recife">America/Recife (UTC-3)</option>
                  </select>
                </Field>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
                  {saved === 'empresa' ? <><CheckCircle2 size={12} /> Salvo!</> : saving ? 'Salvando…' : 'Salvar empresa'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}
