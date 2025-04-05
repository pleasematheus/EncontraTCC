import { useState, useEffect } from "react"
import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import supabase from "@/utils/supabase"

const Profile = () => {
  const {} = useTheme()
  const [user, setUser] = useState<{
    email: string | undefined
    name: string | undefined
  }>({ email: "", name: "" })
  const [loading, setLoading] = useState(true)

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

      setLoading(false)
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
          <div className="grid grid-cols-1 gap-2 border-2 divide-y divide-inherit border-base-300 p-4 rounded-lg shadow-lg sm:w-1/2 w-5/6 max-w-sm">
            <h1 className="text-2xl font-bold place-self-center">Perfil</h1>
            <div className="avatar placeholder pb-2 place-self-center">
              <div className="bg-neutral text-neutral-content w-24 rounded-full mt-2">
                <span className="text-3xl">
                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            </div>
            <h1 className="text-left">Nome: {user.name}</h1>
            <p>Email: {user.email}</p>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default Profile
