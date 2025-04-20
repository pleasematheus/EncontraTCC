import { useState, useEffect } from "react"
import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import supabase from "@/utils/supabase"

const Profile = () => {
  const {} = useTheme()
  const [user, setUser] = useState<{
    email: string | undefined
    nome: string | undefined
    tipo: string | undefined
  }>({
    email: "",
    nome: "",
    tipo: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError

        const userId = user?.id

        if (!userId) throw new Error("Usuário não autenticado")

        const { data: usuario, error: usuarioError } = await supabase
          .from("Usuarios")
          .select("nome, email, tipo")
          .eq("id_auth_users", userId)
          .single()

        if (usuarioError) throw usuarioError

        setUser({
          email: usuario?.email,
          nome: usuario?.nome,
          tipo: usuario?.tipo,
        })
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center gap-2 my-3">
        {loading ? (
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 border-2 divide-y divide-inherit border-base-300 p-4 rounded-lg shadow-lg sm:w-1/2 w-5/6 max-w-sm my-2">
            <h1 className="text-2xl font-bold place-self-center">Perfil</h1>
            <div className="avatar placeholder pb-2 place-self-center">
              <div className="bg-neutral text-neutral-content w-24 rounded-full mt-2">
                <span className="text-3xl">
                  {user.nome?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            </div>
            <h1 className="text-left">Nome: {user.nome}</h1>
            <p>Email: {user.email}</p>
            <p>Tipo: {user.tipo}</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default Profile
