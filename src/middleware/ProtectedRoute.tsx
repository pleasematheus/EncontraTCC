import { ReactNode, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import supabase from "@/utils/supabase"
import { useTheme } from "@/hooks/useTheme"

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const {} = useTheme()
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
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span>Carregando...</span>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default ProtectedRoute