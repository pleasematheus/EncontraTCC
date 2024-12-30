import { useTheme } from "@/hooks/useTheme"
import supabase from "@/utils/supabase"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

const Dashboard = () => {
  const {} = useTheme()
  const navigate = useNavigate()
  const [user, setUser] = useState<{
    email: string | undefined
    name: string | undefined
  }>({ email: "", name: "" })

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || "Usuário",
        })
      }
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 bg-base-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Bem-vindo à Dashboard!</h1>

        <div className="mt-4 space-y-2">
          <p className="text-lg">
            <span className="font-semibold">Nome:</span> {user.name}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Email:</span> {user.email}
          </p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="px-4 py-2 font-semibold text-white transition-colors bg-red-500 rounded hover:bg-red-600"
      >
        Sair
      </button>
    </main>
  )
}

export default Dashboard