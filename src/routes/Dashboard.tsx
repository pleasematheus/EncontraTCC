import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

const Dashboard = () => {
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      try {
        const { data: session } = await supabase.auth.getSession()

        if (session?.session?.user) {
          const { data: userData, error } = await supabase
            .from("Usuarios") // Nome da tabela no seu banco de dados
            .select("nome")
            .eq("id", session.session.user.id)
            .single()

          if (error) {
            console.error("Erro ao buscar usuário:", error.message)
            setUserName("Usuário não encontrado")
          } else {
            setUserName(userData?.nome || "Usuário")
          }
        } else {
          setUserName("Usuário não autenticado")
        }
      } catch (err) {
        console.error("Erro inesperado:", err)
        setUserName("Erro ao carregar usuário")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <main className="flex items-center justify-center min-h-screen bg-base-100">
      {loading ? (
        <h1 className="text-3xl font-bold">Carregando...</h1>
      ) : (
        <h1 className="text-3xl font-bold">
          Bem-vindo{userName ? `, ${userName}` : ""} à Dashboard!
        </h1>
      )}
    </main>
  )
}

export default Dashboard