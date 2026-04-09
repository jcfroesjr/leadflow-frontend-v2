import { useState } from 'react'
import { Search, Filter, Bot, User, Send, Phone, MoreHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn, formatRelativeTime, formatPhone } from '@/lib/utils'

const conversas = [
  {
    id: '1', nome: 'Claudia Guedes', telefone: '5511999990001', status: 'agendado' as const,
    ultima: 'Perfeito, nos vemos na quinta!', tempo: new Date(Date.now() - 3 * 60000).toISOString(),
    nao_lidas: 0, agente: true,
  },
  {
    id: '2', nome: 'Rafael Mendes', telefone: '5511999990002', status: 'em_contato' as const,
    ultima: 'Sim, meu maior desafio é aumentar as vendas online', tempo: new Date(Date.now() - 12 * 60000).toISOString(),
    nao_lidas: 2, agente: true,
  },
  {
    id: '3', nome: 'Fernanda Lima', telefone: '5511999990003', status: 'novo' as const,
    ultima: 'Oie, tudo bem?', tempo: new Date(Date.now() - 35 * 60000).toISOString(),
    nao_lidas: 1, agente: true,
  },
  {
    id: '4', nome: 'Bruno Castro', telefone: '5511999990004', status: 'qualificado' as const,
    ultima: 'Quero saber mais sobre os horários disponíveis', tempo: new Date(Date.now() - 2 * 3600000).toISOString(),
    nao_lidas: 0, agente: false,
  },
]

const mensagens = [
  { id: '1', role: 'user', conteudo: 'Oi, vi sobre o programa da Rejane', criado_em: new Date(Date.now() - 25 * 60000).toISOString() },
  { id: '2', role: 'assistant', conteudo: 'Oie Claudia, tudo bem? 😊\nSou a Bia do time da Rejane Leal e estou entrando em contato porque você preencheu nosso formulário pra conhecer as estratégias de vendas! 💘\nCorreto?', criado_em: new Date(Date.now() - 24 * 60000).toISOString() },
  { id: '3', role: 'user', conteudo: 'Sim, correto!', criado_em: new Date(Date.now() - 20 * 60000).toISOString() },
  { id: '4', role: 'assistant', conteudo: 'Vi também que você comentou que teu maior desafio hoje é aumentar as vendas da loja. É isso mesmo?', criado_em: new Date(Date.now() - 19 * 60000).toISOString() },
  { id: '5', role: 'user', conteudo: 'Exatamente isso!', criado_em: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: '6', role: 'assistant', conteudo: 'Super te entendo 💛\n\nBaseado nisso tudo que você me contou, já vejo que faria total sentido você conversar com a Rejane. Com certeza ela vai conseguir te ajudar bastante!\n\nTenho estes horários disponíveis para você:\n\n📅 Quinta, 10/04 às 10:00\n📅 Quinta, 10/04 às 14:00\n📅 Sexta, 11/04 às 09:00\n\nQual desses funciona melhor pra você?', criado_em: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: '7', role: 'user', conteudo: 'Quinta às 14h perfeito!', criado_em: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: '8', role: 'assistant', conteudo: 'Perfeito, nos vemos na quinta! 🗓️\n\nSeu agendamento está confirmado para quinta-feira, 10/04 às 14:00. Até lá! 😊', criado_em: new Date(Date.now() - 3 * 60000).toISOString() },
]

export function ConversationsPage() {
  const [selected, setSelected] = useState(conversas[0])
  const [msg, setMsg] = useState('')
  const [filter, setFilter] = useState<'todos' | 'aguardando' | 'modo_humano'>('todos')

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — conversation list */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col">
        <div className="p-3 border-b border-border space-y-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar conversa..." className="pl-8 h-8 text-xs" />
          </div>
          <div className="flex gap-1">
            {(['todos', 'aguardando', 'modo_humano'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'flex-1 text-2xs py-1 rounded-md font-medium transition-colors',
                  filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {f === 'todos' ? 'Todos' : f === 'aguardando' ? 'Aguardando' : 'Humano'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {conversas.map(c => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              className={cn(
                'flex items-start gap-2.5 p-3 cursor-pointer transition-colors hover:bg-muted/40',
                selected.id === c.id && 'bg-muted/60'
              )}
            >
              <Avatar name={c.nome} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-semibold truncate">{c.nome}</span>
                  <span className="text-2xs text-muted-foreground shrink-0">{formatRelativeTime(c.tempo)}</span>
                </div>
                <p className="text-2xs text-muted-foreground truncate mb-1">{c.ultima}</p>
                <div className="flex items-center gap-1.5">
                  {c.agente
                    ? <span className="text-2xs text-primary flex items-center gap-0.5"><Bot size={10} />IA</span>
                    : <span className="text-2xs text-amber-500 flex items-center gap-0.5"><User size={10} />Humano</span>
                  }
                  {c.nao_lidas > 0 && (
                    <span className="ml-auto h-4 w-4 flex items-center justify-center rounded-full bg-primary text-2xs text-white font-bold">
                      {c.nao_lidas}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center — messages */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/60">
          <Avatar name={selected.nome} />
          <div>
            <p className="text-sm font-semibold">{selected.nome}</p>
            <p className="text-xs text-muted-foreground">{formatPhone(selected.telefone)}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <StatusBadge status={selected.status} />
            <Button variant="ghost" size="icon-sm"><Phone size={14} /></Button>
            <Button variant="ghost" size="icon-sm"><MoreHorizontal size={14} /></Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mensagens.map(m => (
            <div key={m.id} className={cn('flex gap-2', m.role === 'assistant' && 'flex-row-reverse')}>
              {m.role === 'assistant'
                ? <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Bot size={12} className="text-primary" /></div>
                : <Avatar name={selected.nome} size="sm" />
              }
              <div className={cn(
                'max-w-xs rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap',
                m.role === 'assistant'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'bg-muted text-foreground rounded-tl-sm'
              )}>
                {m.conteudo}
                <p className={cn('text-2xs mt-1 opacity-60 text-right')}>
                  {new Date(m.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border bg-background/60">
          <div className="flex gap-2">
            <Input
              placeholder="Digite uma mensagem..."
              value={msg}
              onChange={e => setMsg(e.target.value)}
              className="text-sm"
              onKeyDown={e => e.key === 'Enter' && setMsg('')}
            />
            <Button size="icon" onClick={() => setMsg('')} disabled={!msg.trim()}>
              <Send size={14} />
            </Button>
          </div>
          <p className="text-2xs text-muted-foreground mt-1.5 px-1">Agente IA ativo — esta mensagem será enviada diretamente via WhatsApp</p>
        </div>
      </div>

      {/* Right panel — lead info */}
      <div className="w-64 shrink-0 border-l border-border overflow-y-auto p-4 space-y-4">
        <div className="text-center pt-2">
          <Avatar name={selected.nome} size="lg" className="mx-auto mb-2" />
          <p className="text-sm font-semibold">{selected.nome}</p>
          <p className="text-xs text-muted-foreground">{formatPhone(selected.telefone)}</p>
        </div>

        <Card>
          <CardContent className="p-3 space-y-2">
            <InfoRow label="Status" value={<StatusBadge status={selected.status} />} />
            <InfoRow label="Fase IA" value={<Badge variant="secondary">q2_enviado</Badge>} />
            <InfoRow label="Score" value="85.000" />
            <InfoRow label="Origem" value="Responde APP" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Desafio reportado</p>
            <p className="text-xs text-foreground">Aumentar as vendas da loja física e online</p>
          </CardContent>
        </Card>

        <div className="space-y-1.5">
          <Button variant="outline" size="sm" className="w-full text-xs">Assumir conversa</Button>
          <Button variant="ghost" size="sm" className="w-full text-xs text-destructive hover:text-destructive">Arquivar lead</Button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-2xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  )
}
