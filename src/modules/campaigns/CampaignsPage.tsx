import { Megaphone, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'

export function CampaignsPage() {
  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Campanhas</h2>
          <p className="text-xs text-muted-foreground">Gerencie suas campanhas de outreach</p>
        </div>
        <Button size="sm" className="gap-1.5"><Plus size={13} />Nova campanha</Button>
      </div>
      <EmptyState
        icon={<Megaphone size={20} />}
        title="Nenhuma campanha criada"
        description="Crie sua primeira campanha para disparar mensagens em massa com automação"
        action={{ label: 'Criar campanha', onClick: () => {} }}
      />
    </div>
  )
}
