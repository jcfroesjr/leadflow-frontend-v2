import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Empresa {
  id: string
  nome: string
  plano: string
}

interface Tenant {
  papel: string
  empresa: Empresa
}

interface AuthContextValue {
  user: User | null
  tenant: Tenant | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchTenant(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchTenant(session.user.id)
      else { setTenant(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchTenant(userId: string) {
    try {
      const { data: membro } = await supabase
        .from('membros')
        .select('papel, empresa_id')
        .eq('usuario_id', userId)
        .single()

      if (!membro) {
        setTenant({ papel: 'admin', empresa: { id: '', nome: 'Minha Empresa', plano: 'starter' } })
        return
      }

      const { data: empresa } = await supabase
        .from('empresas')
        .select('id, nome, plano')
        .eq('id', membro.empresa_id)
        .single()

      setTenant({
        papel: membro.papel,
        empresa: empresa ?? { id: membro.empresa_id, nome: 'Minha Empresa', plano: 'starter' },
      })
    } catch (err) {
      console.error('fetchTenant error:', err)
      setTenant({ papel: 'admin', empresa: { id: '', nome: 'Minha Empresa', plano: 'starter' } })
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, tenant, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
