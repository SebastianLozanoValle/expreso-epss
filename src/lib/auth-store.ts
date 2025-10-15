import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (data.user) {
      set({ user: data.user, loading: false })
    } else {
      set({ loading: false })
    }
    
    return { error }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (data.user) {
      set({ user: data.user, loading: false })
    } else {
      set({ loading: false })
    }
    
    return { error }
  },

  signOut: async () => {
    set({ loading: true })
    await supabase.auth.signOut()
    set({ user: null, loading: false })
  },

  initialize: async () => {
    set({ loading: true })
    
    // Obtener sesión actual
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, loading: false })

    // Escuchar cambios de autenticación
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false })
    })
  },
}))
