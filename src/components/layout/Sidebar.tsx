import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, MessageSquare, Users, Kanban, Bot,
  Megaphone, Settings, Zap, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Conversas', icon: MessageSquare, to: '/conversations' },
  { label: 'Leads', icon: Users, to: '/leads' },
  { label: 'Pipeline', icon: Kanban, to: '/pipeline' },
  { label: 'Agente IA', icon: Bot, to: '/ai-agent' },
  { label: 'Campanhas', icon: Megaphone, to: '/campaigns' },
]

const bottom = [
  { label: 'Configurações', icon: Settings, to: '/settings' },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-sidebar-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Zap size={14} className="text-white" />
        </div>
        <span className="font-semibold text-sm text-sidebar-foreground tracking-tight">LeadsFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3 overflow-y-auto">
        {nav.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={cn('shrink-0', isActive ? 'text-primary' : '')} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={12} className="text-primary opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-3 space-y-0.5">
        {bottom.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )
            }
          >
            <Icon size={15} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
