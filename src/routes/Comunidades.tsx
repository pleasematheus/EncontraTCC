import { useState, useEffect } from "react"
import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CommunityCards from "@/components/CommunityCards"
import supabase from "@/utils/supabase"

interface Community {
  id: string
  nome: string
  descricao: string
  total_posts: number
  total_usuarios: number
  data_criacao: string
  data_atualizacao: string
}

export default function Comunidades() {
  const {} = useTheme()

  const [loading, setLoading] = useState(true)
  const [communities, setCommunities] = useState<Community[]>([])

  useEffect(() => {
    const getComunidades = async () => {
      const { data, error } = await supabase
        .from("Comunidades")
        .select("*")
        .order("data_criacao", { ascending: false })

      if (error) {
        console.error("Erro ao buscar comunidades:", error)
      } else {
        setCommunities(data as Community[])
      }

      setLoading(false)
    }

    getComunidades()
  }, [])

  return (
    <>
      <Header />
      <main className="px-4 py-8 min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-8">Comunidades</h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : communities.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">
            Ainda não há comunidades cadastradas.
          </p>
        ) : (
          <CommunityCards communities={communities} />
        )}
      </main>
      <Footer />
    </>
  )
}
