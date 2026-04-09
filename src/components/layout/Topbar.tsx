import { Search, Bell, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { useTheme } from '@/hooks/useTheme'

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-5">
      {title && (
        <h1 className="text-sm font-semibold text-foreground mr-auto hidden sm:block">{title}</h1>
      )}

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar leads, conversas..."
          className="pl-8 h-8 text-xs bg-muted border-transparent focus-visible:border-border"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Theme toggle */}
        <Button variant="ghost" size="icon-sm" onClick={toggle} className="text-muted-foreground hover:text-foreground">
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="relative text-muted-foreground hover:text-foreground">
          <Bell size={15} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        {/* Profile */}
        <Avatar name="Admin" size="sm" className="ml-1 cursor-pointer" />
      </div>
    </header>
  )
}
