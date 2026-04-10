import { useState, useEffect } from 'react'
import { Bot, Zap, CheckCircle2, AlertCircle, Save } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { fetchAgentConfig, saveAgentConfig, type AgentConfig } from '@/services/api/agent'

const modelos = [
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', tag: 'Grátis', provider: 'Google' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', tag: 'Recomendado', provider: 'Anthropic' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', tag: 'Econômico', provider: 'OpenAI' },
]

const fases = [
  { fase: 'novo', label: 'Lead novo', desc: 'Envia Q1 automaticamente', ok: true },
  { fase: 'q1_enviado', label: 'Q1 enviado', desc: 'Aguarda confirmação ou trata objeções', ok: true },
  { fase: 'q2_enviado', label: 'Q2 enviado', desc: 'Aguarda confirmação do desafio', ok: true },
  { fase: 'qualificado', label: 'Qualificado', desc: 'Empatia + busca de slots', ok: true },
  { fase: 'slots_oferecidos', label: 'Slots oferecidos', desc: 'Aguarda escolha do lead', ok: true },
  { fase: 'agendado', label: 'Agendado', desc: 'Confirmação + link Zoom/grupo', ok: true },
]

export function AiAgentPage() {
  const { tenant } = useAuth()
  const empresaId = tenant?.empresa?.id ?? ''
  const qc = useQueryClient()

  const [modelo, setModelo] = useState('gemini-2.0-flash')
  const [nomeAgente, setNomeAgente] = useState('Bia')
  const [nomeResponsavel, setNomeResponsavel] = useState('Rejane Leal')
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [empatia, setEmpatia] = useState('')
  const [agentePausado, setAgentePausado] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data: config, isLoading } = useQuery({
    queryKey: ['agent-config', empresaId],
    queryFn: () => fetchAgentConfig(empresaId),
    enabled: !!empresaId,
  })

  // Populate form when config loads
  useEffect(() => {
    if (!config) return
    if (config.modelo) setModelo(config.modelo)
    if (config.nome_agente) setNomeAgente(config.nome_agente)
    if (config.nome_responsavel) setNomeResponsavel(config.nome_responsavel)
    if (config.q1_template !== undefined) setQ1(config.q1_template)
    else setQ1('Oie {{lead.nome}}, tudo bem? 😊\nSou a {{nome_agente}} do time da {{nome_responsavel}} e estou entrando em contato porque você preencheu nosso formulário pra conhecer e ter acesso às estratégias de vendas da {{nome_responsavel}} pra aumentar o faturamento da sua loja! 💘\nCorreto?')
    if (config.q2_template !== undefined) setQ2(config.q2_template)
    else setQ2('Vi também que você comentou que teu maior desafio hoje é {{lead.desafio}}. É isso mesmo?')
    if (config.empatia_template !== undefined) setEmpatia(config.empatia_template)
    else setEmpatia('Baseado nisso tudo que você me contou e preencheu no seu formulário, já vejo que faria total sentido você conversar mais de perto com a {{nome_responsavel}}. Com certeza ela vai conseguir te ajudar bastante!')
    if (config.agente_pausado !== undefined) setAgentePausado(config.agente_pausado)
  }, [config])

  const mutation = useMutation({
    mutationFn: (cfg: AgentConfig) => saveAgentConfig(empresaId, cfg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-config', empresaId] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  function handleSave() {
    mutation.mutate({
      modelo,
      nome_agente: nomeAgente,
      nome_responsavel: nomeResponsavel,
      q1_template: q1,
      q2_template: q2,
      empatia_template: empatia,
      agente_pausado: agentePausado,
    })
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Agente IA</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Configure o comportamento e fluxo da Bia</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 size={12} /> Salvo!
            </span>
          )}
          {mutation.isError && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle size={12} /> Erro ao salvar
            </span>
          )}
          <Button size="sm" onClick={handleSave} disabled={mutation.isPending} className="gap-1.5">
            <Save size={13} />
            {mutation.isPending ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Status */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
              {nomeAgente.slice(0, 2)}
            </div>
            <span className={cn('absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-background', agentePausado ? 'bg-amber-400' : 'bg-green-500')} />
          </div>
          <div>
            <p className="text-sm font-semibold">{nomeAgente}</p>
            <p className="text-xs text-muted-foreground">
              {agentePausado ? 'Agente pausado' : 'Agente online'} · {modelos.find(m => m.value === modelo)?.label}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant={agentePausado ? 'secondary' : 'success'}>{agentePausado ? 'Pausado' : 'Ativo'}</Badge>
            <button
              type="button"
              onClick={() => setAgentePausado(p => !p)}
              className={cn(
                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                agentePausado ? 'bg-muted' : 'bg-green-500',
              )}
              aria-label={agentePausado ? 'Ativar agente' : 'Pausar agente'}
            >
              <span className={cn('inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform', agentePausado ? 'translate-x-1' : 'translate-x-4.5')} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Modelo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Modelo de IA</CardTitle>
          <CardDescription className="text-xs">Escolha o provedor de linguagem</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {modelos.map(m => (
            <button
              key={m.value}
              onClick={() => setModelo(m.value)}
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                modelo === m.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50',
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Zap size={13} className={modelo === m.value ? 'text-primary' : 'text-muted-foreground'} />
                <Badge variant={m.tag === 'Recomendado' ? 'success' : 'secondary'} className="text-[10px]">
                  {m.tag}
                </Badge>
              </div>
              <p className="text-xs font-semibold">{m.label}</p>
              <p className="text-[11px] text-muted-foreground">{m.provider}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Persona */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Persona</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nome do agente</label>
            <Input value={nomeAgente} onChange={e => setNomeAgente(e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Nome do responsável</label>
            <Input value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} className="h-8 text-sm" />
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Fluxo de qualificação</CardTitle>
          <CardDescription className="text-xs">
            Variáveis: <code className="bg-muted px-1 rounded">{'{{lead.nome}}'}</code>{' '}
            <code className="bg-muted px-1 rounded">{'{{lead.desafio}}'}</code>{' '}
            <code className="bg-muted px-1 rounded">{'{{nome_agente}}'}</code>{' '}
            <code className="bg-muted px-1 rounded">{'{{nome_responsavel}}'}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Q1 — Primeira abordagem', value: q1, onChange: setQ1 },
            { label: 'Q2 — Confirmação do desafio', value: q2, onChange: setQ2 },
            { label: 'Empatia (após Q2 confirmada)', value: empatia, onChange: setEmpatia },
          ].map(({ label, value, onChange }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* State machine */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Máquina de estados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {fases.map((f, i) => (
            <div key={f.fase} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={cn('w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0', f.ok ? 'bg-green-500/15' : 'bg-muted')}>
                  {f.ok ? <CheckCircle2 size={12} className="text-green-500" /> : <AlertCircle size={12} className="text-muted-foreground" />}
                </div>
                {i < fases.length - 1 && <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-[16px]" />}
              </div>
              <div className="pb-2">
                <p className="text-xs font-medium">{f.label}</p>
                <p className="text-[11px] text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
