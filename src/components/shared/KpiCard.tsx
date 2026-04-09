import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  loading?: boolean
  suffix?: string
}

export function KpiCard({ label, value, change, icon, loading, suffix }: KpiCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-7 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    )
  }

  const trend = change === undefined ? 'neutral' : change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'

  return (
    <Card className="group hover:border-border/80 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {icon && (
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight tabular-nums">
          {value}{suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
        </p>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 mt-2 text-xs font-medium',
            trend === 'up' && 'text-green-500',
            trend === 'down' && 'text-destructive',
            trend === 'neutral' && 'text-muted-foreground',
          )}>
            {trend === 'up' && <TrendingUp size={12} />}
            {trend === 'down' && <TrendingDown size={12} />}
            {trend === 'neutral' && <Minus size={12} />}
            <span>{change > 0 ? '+' : ''}{change}% vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
