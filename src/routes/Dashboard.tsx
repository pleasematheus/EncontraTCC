import { useEffect, useState } from "react"
import { useTheme } from "@/hooks/useTheme"
import Header from "../components/Header"
import Footer from "@/components/Footer"
import supabase from "@/utils/supabase"

interface UserData {
  email: string | undefined
  name: string
  [key: string]: any
}

const Dashboard = () => {
  const {} = useTheme()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtém o usuário autenticado de auth.users
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("Erro ao obter usuário:", userError)
          setUserData(null)
        } else {
          // Define os dados do usuário a partir de auth.users
          setUserData({
            email: user.email,
            name: user.user_metadata?.name || "Usuário", // Fallback caso o nome não esteja em user_metadata
            ...user.user_metadata, // Espalha qualquer metadado adicional
          })
        }
      } catch (err) {
        console.error("Erro inesperado:", err)
        setUserData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex flex-col items-center justify-center min-h-screen gap-4 bg-base-100">
          <p>Carregando...</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-screen gap-4 bg-base-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bem-vindo à Dashboard!</h1>

          <div className="mt-4 space-y-2">
            <p className="text-lg">
              <span className="font-semibold">Nome:</span>{" "}
              {userData?.name || "Usuário"}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Email:</span>{" "}
              {userData?.email || "Não disponível"}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Dashboard
