import { useState } from 'react'
import { Bot, Zap, CheckCircle2, AlertCircle, Settings2, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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
  const [modelo, setModelo] = useState('gemini-2.0-flash')
  const [nomeAgente, setNomeAgente] = useState('Bia')
  const [nomeResponsavel, setNomeResponsavel] = useState('Rejane Leal')
  const [q1, setQ1] = useState('Oie {{lead.nome}}, tudo bem? 😊\nSou a {{nome_agente}} do time da {{nome_responsavel}} e estou entrando em contato porque você preencheu nosso formulário pra conhecer e ter acesso às estratégias de vendas da {{nome_responsavel}} pra aumentar o faturamento da sua loja! 💘\nCorreto?')
  const [q2, setQ2] = useState('Vi também que você comentou que teu maior desafio hoje é {{lead.desafio}}. É isso mesmo?')
  const [empatia, setEmpatia] = useState('Baseado nisso tudo que você me contou e preencheu no seu formulário, já vejo que faria total sentido você conversar mais de perto com a {{nome_responsavel}}. Com certeza ela vai conseguir te ajudar bastante!')
  const [salvo, setSalvo] = useState(false)

  function salvar() {
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Agente IA</h2>
          <p className="text-xs text-muted-foreground">Configure o comportamento do assistente de vendas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-green-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Online
          </div>
          <Button size="sm" onClick={salvar} className="gap-1.5">
            <Save size={13} />
            {salvo ? 'Salvo!' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Status card */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Bot size={18} className="text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Agente ativo e funcionando</p>
            <p className="text-xs text-muted-foreground">47 mensagens processadas hoje · última atividade há 3 min</p>
          </div>
          <Badge variant="success">Gemini 2.0 Flash</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model selection */}
        <Card>
          <CardHeader>
            <CardTitle>Modelo de IA</CardTitle>
            <CardDescription>Escolha o LLM que processa as respostas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {modelos.map(m => (
              <label
                key={m.value}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                  modelo === m.value ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80 hover:bg-muted/30'
                )}
              >
                <input type="radio" name="modelo" value={m.value} checked={modelo === m.value} onChange={() => setModelo(m.value)} className="accent-primary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{m.label}</span>
                    <Badge variant={m.tag === 'Grátis' ? 'success' : m.tag === 'Recomendado' ? 'default' : 'muted'} className="text-2xs">
                      {m.tag}
                    </Badge>
                  </div>
                  <p className="text-2xs text-muted-foreground">{m.provider}</p>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Persona */}
        <Card>
          <CardHeader>
            <CardTitle>Persona do agente</CardTitle>
            <CardDescription>Identidade usada nas mensagens Q1/Q2</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Nome do agente</label>
              <Input value={nomeAgente} onChange={e => setNomeAgente(e.target.value)} placeholder="Bia" className="text-sm" />
              <p className="text-2xs text-muted-foreground mt-1">Variável: <code className="bg-muted px-1 rounded">{'{{nome_agente}}'}</code></p>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Nome do responsável / mentor(a)</label>
              <Input value={nomeResponsavel} onChange={e => setNomeResponsavel(e.target.value)} placeholder="Rejane Leal" className="text-sm" />
              <p className="text-2xs text-muted-foreground mt-1">Variável: <code className="bg-muted px-1 rounded">{'{{nome_responsavel}}'}</code></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow templates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 size={15} className="text-primary" />
            <CardTitle>Mensagens do fluxo de qualificação</CardTitle>
          </div>
          <CardDescription>
            Variáveis disponíveis: <code className="bg-muted px-1 rounded text-xs">{'{{lead.nome}}'}</code>{' '}
            <code className="bg-muted px-1 rounded text-xs">{'{{lead.desafio}}'}</code>{' '}
            <code className="bg-muted px-1 rounded text-xs">{'{{nome_agente}}'}</code>{' '}
            <code className="bg-muted px-1 rounded text-xs">{'{{nome_responsavel}}'}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Mensagem Q1 — primeira abordagem</label>
            <textarea
              rows={4}
              value={q1}
              onChange={e => setQ1(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Mensagem Q2 — confirmação do desafio</label>
            <textarea
              rows={2}
              value={q2}
              onChange={e => setQ2(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 block">Texto de empatia — antes dos slots</label>
            <textarea
              rows={3}
              value={empatia}
              onChange={e => setEmpatia(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs font-mono resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* State machine overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-primary" />
            <CardTitle>Máquina de estados</CardTitle>
          </div>
          <CardDescription>Fluxo determinístico de qualificação — o agente nunca pula etapas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {fases.map((f, i) => (
              <div key={f.fase} className="flex items-center gap-2">
                <div className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs',
                  f.ok ? 'border-green-500/20 bg-green-500/5' : 'border-border bg-muted/30'
                )}>
                  {f.ok
                    ? <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                    : <AlertCircle size={11} className="text-muted-foreground shrink-0" />
                  }
                  <div>
                    <p className="font-medium leading-none">{f.label}</p>
                    <p className="text-2xs text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </div>
                {i < fases.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
