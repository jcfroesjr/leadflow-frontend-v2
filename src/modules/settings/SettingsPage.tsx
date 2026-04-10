import { useState, useEffect } from 'react'
import { Settings, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface EmpresaData {
  nome: string
  fuso: string
  config_apis?: {
    evolution_url?: string
    evolution_key?: string
    google_calendar_credentials?: object | null
    zoom_account_id?: string
  }
}

export function SettingsPage() {
  const { tenant } = useAuth()
  const empresaId = tenant?.empresa?.id ?? ''

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [nome, setNome] = useState('')
  const [fuso, setFuso] = useState('America/Sao_Paulo')
  const [integrations, setIntegrations] = useState({
    evolution: false,
    googleCalendar: false,
    zoom: false,
  })

  useEffect(() => {
    if (!empresaId) return
    async function load() {
      const { data } = await supabase
        .from('empresas')
        .select('nome, fuso, config_apis')
        .eq('id', empresaId)
        .single()
      if (data) {
        const d = data as EmpresaData
        setNome(d.nome ?? '')
        setFuso(d.fuso ?? 'America/Sao_Paulo')
        const apis = d.config_apis ?? {}
        setIntegrations({
          evolution: !!(apis.evolution_url && apis.evolution_key),
          googleCalendar: !!(apis.google_calendar_credentials),
          zoom: !!(apis.zoom_account_id),
        })
      }
      setLoading(false)
    }
    load()
  }, [empresaId])

  async function handleSave() {
    if (!empresaId) return
    setSaving(true)
    await supabase.from('empresas').update({ nome, fuso }).eq('id', empresaId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const intRows = [
    { name: 'Evolution API (WhatsApp)', ok: integrations.evolution },
    { name: 'Google Calendar', ok: integrations.googleCalendar },
    { name: 'Zoom', ok: integrations.zoom },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold">Configurações</h2>
        <p className="text-xs text-muted-foreground">Dados da empresa e status das integrações</p>
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
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Nome da empresa</label>
                  <Input value={nome} onChange={e => setNome(e.target.value)} className="text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Fuso horário</label>
                  <Input value={fuso} onChange={e => setFuso(e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando…' : 'Salvar alterações'}
                </Button>
                {saved && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Salvo!
                  </span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Integrations status */}
      <Card>
        <CardHeader>
          <CardTitle>Status das integrações</CardTitle>
          <CardDescription>Conexões ativas com serviços externos</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {loading ? (
            <div className="space-y-3 py-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : (
            intRows.map(i => (
              <div key={i.name} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  {i.ok
                    ? <CheckCircle2 size={13} className="text-green-500" />
                    : <XCircle size={13} className="text-muted-foreground" />
                  }
                  <span className="text-xs font-medium">{i.name}</span>
                </div>
                <Badge variant={i.ok ? 'success' : 'secondary'}>
                  {i.ok ? 'conectado' : 'não configurado'}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
