import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PostCards from "@/components/PostsCards"
import supabase from "@/utils/supabase"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PlusCircle } from "lucide-react"

interface Post {
  id: string
  comunidade_id: string
  titulo: string
  descricao: string
  tipo: string
  prazo?: string
  data_criacao: string
}

interface Community {
  id: string
  nome: string
}

interface UserInfo {
  tipo: string | null
}

export default function CommunityPage() {
  const {} = useTheme()
  const { discriminador } = useParams<{ discriminador: string }>()
  const [posts, setPosts] = useState<Post[]>([])
  const [community, setCommunity] = useState<Community | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo>({ tipo: null })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Verificar o tipo de usuário atual
  useEffect(() => {
    async function getUserType() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Busca informações do usuário na tabela Usuarios
        const { data, error } = await supabase
          .from("Usuarios")
          .select("tipo")
          .eq("id_auth_users", user.id)
          .single()

        if (error) {
          console.error("Erro ao buscar tipo de usuário:", error)
        } else {
          setUserInfo(data || { tipo: null })
        }
      }
      setLoading(false)
    }

    getUserType()
  }, [])

  // Consulta para buscar os dados da comunidade pelo discriminador
  useEffect(() => {
    async function fetchCommunity() {
      const { data, error } = await supabase
        .from("Comunidades")
        .select("id, nome")
        .eq("discriminador", discriminador)
        .single()

      if (error) {
        console.error("Error fetching community:", error)
      } else {
        setCommunity(data)
      }
    }

    fetchCommunity()
  }, [discriminador])

  // Consulta para buscar os posts da comunidade pelo ID da comunidade
  useEffect(() => {
    async function fetchPosts() {
      if (!community) return

      const { data, error } = await supabase
        .from("Postagens")
        .select(
          "id, comunidade_id, titulo, descricao, data_criacao, tipo, prazo"
        )
        .eq("comunidade_id", community.id)

      if (error) {
        console.error("Error fetching posts:", error)
      } else {
        setPosts(data || [])
      }
    }

    fetchPosts()
  }, [community])

  // Função para navegar para a página de criação de postagem
  const handleCreatePost = () => {
    if (community) {
      navigate(`/comunidade/${discriminador}/criar-postagem`, {
        state: { communityId: community.id },
      })
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-base-100 py-8">
        <div className="max-w-screen-lg mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">
            {community ? community.nome : "Carregando..."}
          </h1>
          <div className="grid grid-cols-1 gap-4">
            {posts.length > 0 ? (
              posts.map((post) => <PostCards key={post.id} post={post} />)
            ) : (
              <p className="text-center text-gray-600">
                Ainda não há posts nessa comunidade
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botão fixo para criar postagem (aparece somente para docentes) */}
      {!loading && userInfo.tipo === "Docente" && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleCreatePost}
            className="btn btn-primary shadow-lg flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Criar Postagem
          </button>
        </div>
      )}

      <Footer />
    </>
  )
}
