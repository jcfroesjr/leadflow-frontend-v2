import { useState } from 'react'
import { Search, Bot, User, Send, Phone } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatRelativeTime, formatPhone } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { fetchThreads, fetchMensagens, type Thread, type Mensagem } from '@/services/api/conversations'

export function ConversationsPage() {
  const { tenant } = useAuth()
  const empresaId = tenant?.empresa?.id ?? ''

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Thread | null>(null)

  const { data: threads = [], isLoading: loadingThreads } = useQuery({
    queryKey: ['threads', empresaId],
    queryFn: () => fetchThreads(empresaId),
    enabled: !!empresaId,
    refetchInterval: 15000,
  })

  const { data: mensagens = [], isLoading: loadingMsgs } = useQuery({
    queryKey: ['mensagens', empresaId, selected?.telefone],
    queryFn: () => fetchMensagens(empresaId, selected!.telefone),
    enabled: !!empresaId && !!selected,
    refetchInterval: 10000,
  })

  const filtered = threads.filter(t =>
    !search || t.nome.toLowerCase().includes(search.toLowerCase()) || t.telefone.includes(search),
  )

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden animate-fade-in">
      {/* Sidebar — thread list */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={13} />
            <Input
              placeholder="Buscar conversa…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingThreads ? (
            <div className="p-3 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-10 px-4">
              Nenhuma conversa encontrada.
            </p>
          ) : (
            filtered.map(t => (
              <button
                key={t.telefone}
                onClick={() => setSelected(t)}
                className={cn(
                  'w-full flex items-start gap-2.5 px-3 py-2.5 hover:bg-accent/50 transition-colors text-left',
                  selected?.telefone === t.telefone && 'bg-accent',
                )}
              >
                <Avatar name={t.nome} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate">{t.nome}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {formatRelativeTime(t.ultimaAtividade)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{t.ultimaMensagem}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Center — messages */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Selecione uma conversa</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
              <Avatar name={selected.nome} size="sm" />
              <div>
                <p className="text-sm font-semibold">{selected.nome}</p>
                <p className="text-xs text-muted-foreground">{formatPhone(selected.telefone)}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                      <Skeleton className="h-10 w-48 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : mensagens.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">Sem mensagens ainda.</p>
              ) : (
                mensagens.map((m: Mensagem) => {
                  const isAssistant = m.role === 'assistant'
                  const isSystem = m.role === 'system'
                  if (isSystem) return (
                    <div key={m.id} className="flex justify-center">
                      <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {m.conteudo}
                      </span>
                    </div>
                  )
                  return (
                    <div key={m.id} className={cn('flex gap-2', isAssistant ? 'justify-start' : 'justify-end')}>
                      {isAssistant && (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-auto">
                          <Bot size={12} className="text-primary" />
                        </div>
                      )}
                      <div className={cn(
                        'max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
                        isAssistant
                          ? 'bg-card border border-border rounded-tl-sm'
                          : 'bg-primary text-primary-foreground rounded-tr-sm',
                      )}>
                        {m.conteudo}
                        <div className={cn('text-[10px] mt-1', isAssistant ? 'text-muted-foreground' : 'text-primary-foreground/70')}>
                          {new Date(m.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {!isAssistant && (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-auto">
                          <User size={12} />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Input bar (read-only view) */}
            <div className="p-3 border-t border-border bg-card">
              <div className="flex gap-2 items-center">
                <Input placeholder="Visualização apenas — respostas via WhatsApp" className="h-9 text-xs" disabled />
                <Button size="icon" className="h-9 w-9 flex-shrink-0" disabled>
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right panel — lead info */}
      {selected && (
        <div className="w-64 flex-shrink-0 border-l border-border bg-card overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="text-center">
              <Avatar name={selected.nome} size="lg" className="mx-auto mb-2" />
              <p className="text-sm font-semibold">{selected.nome}</p>
              <p className="text-xs text-muted-foreground">{formatPhone(selected.telefone)}</p>
            </div>

            <Card>
              <CardContent className="p-3 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone size={11} />
                  <span>{selected.telefone}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
