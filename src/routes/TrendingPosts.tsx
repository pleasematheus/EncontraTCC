import { useState, useEffect } from "react"
import supabase from "../utils/supabase"
import Header from "../components/Header"
import Footer from "../components/Footer"
import PostsCards from "../components/PostsCards"

interface Post {
  id: string
  comunidade_id: string
  titulo: string
  descricao: string
  tipo: string
  prazo?: string
  data_criacao: string
  data_atualizacao?: string
  id_usuario_criador?: string
  candidaturas_abertas?: boolean
  candidaturas_count: number
}

const TrendingPosts = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userType, setUserType] = useState<string | null>(null)

  // Obter tipo do usuário (Discente/Docente)
  const getUserType = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser()

      if (!authData.user) {
        return null
      }

      const { data: userData, error } = await supabase
        .from("Usuarios")
        .select("tipo")
        .eq("id_auth_users", authData.user.id)
        .single()

      if (error) throw error

      return userData?.tipo || null
    } catch (error) {
      console.error("Erro ao obter tipo do usuário:", error)
      return null
    }
  }

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      setIsLoading(true)
      try {
        const userTypeValue = await getUserType()
        setUserType(userTypeValue)

        // Buscar posts trending da materialized view
        const { data, error } = await supabase
          .from("trending_posts_week")
          .select("*")
          .order("candidaturas_count", { ascending: false })
          .limit(10)

        if (error) throw error

        setPosts(data || [])
      } catch (err: any) {
        console.error("Erro ao carregar posts em alta:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingPosts()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Posts em Alta</h1>
          <p className="text-gray-600">
            As postagens com mais candidaturas desta semana
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error my-8">
            <span>{error}</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center my-12">
            <p className="text-xl">Nenhuma postagem em alta esta semana</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div key={post.id} className="flex flex-col h-full">
                <PostsCards
                  post={post}
                  isEditable={false}
                  userType={userType}
                  isFollowing={true} // Assumindo que são posts populares de comunidades que o usuário pode se interessar
                />
                <div className="mt-2 text-center">
                  <span className="badge badge-primary">
                    {post.candidaturas_count} candidaturas esta semana
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default TrendingPosts
