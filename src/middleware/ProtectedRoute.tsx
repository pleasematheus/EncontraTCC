import { ReactNode, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import supabase from "../utils/supabase"

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setIsAuthenticated(!!session?.user)
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Inscrever para mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    // Cleanup da inscrição
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    // Você pode substituir isso por um componente de loading mais elaborado
    return <div>Carregando...</div>
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default ProtectedRoute