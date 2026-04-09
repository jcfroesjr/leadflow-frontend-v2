import { Settings, Key, Globe, Bell, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const sections = [
  { icon: Globe, label: 'Integrações', desc: 'Evolution API, Google Calendar, Zoom' },
  { icon: Key, label: 'API Keys', desc: 'Chaves de acesso para os LLMs' },
  { icon: Bell, label: 'Notificações', desc: 'Alertas e follow-ups automáticos' },
  { icon: Users, label: 'Usuários', desc: 'Membros da equipe e permissões' },
]

export function SettingsPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold">Configurações</h2>
        <p className="text-xs text-muted-foreground">Gerencie integrações, API keys e preferências</p>
      </div>

      {/* Empresa */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-primary" />
            <CardTitle>Dados da empresa</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Nome da empresa</label>
              <Input defaultValue="Rejane Leal Mentora" className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Fuso horário</label>
              <Input defaultValue="America/Sao_Paulo" className="text-sm" />
            </div>
          </div>
          <Button size="sm">Salvar alterações</Button>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sections.map(({ icon: Icon, label, desc }) => (
          <Card key={label} className="cursor-pointer hover:border-primary/30 transition-colors group">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon size={14} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integrations status */}
      <Card>
        <CardHeader>
          <CardTitle>Status das integrações</CardTitle>
          <CardDescription>Conexões ativas com serviços externos</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {[
            { name: 'Evolution API (WhatsApp)', status: 'conectado' },
            { name: 'Google Calendar', status: 'conectado' },
            { name: 'Zoom', status: 'conectado' },
            { name: 'Supabase', status: 'conectado' },
          ].map(i => (
            <div key={i.name} className="flex items-center justify-between py-2.5">
              <span className="text-xs font-medium">{i.name}</span>
              <Badge variant="success">{i.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
