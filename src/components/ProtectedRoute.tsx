'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth-store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Usuario no autenticado intentando acceder a ruta protegida
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        // Usuario autenticado intentando acceder a ruta de auth
        router.push('/')
      }
    }
  }, [user, loading, requireAuth, redirectTo, router])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  // Si requiere autenticación y no hay usuario, no mostrar nada
  if (requireAuth && !user) {
    return null
  }

  // Si no requiere autenticación y hay usuario, no mostrar nada
  if (!requireAuth && user) {
    return null
  }

  return <>{children}</>
}
