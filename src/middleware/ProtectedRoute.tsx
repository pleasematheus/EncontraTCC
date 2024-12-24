import { ReactNode, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)

      const { data: session } = await supabase.auth.getSession()

      if (session?.session?.user) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return <p>Carregando...</p>
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export default ProtectedRoute