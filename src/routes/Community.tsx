import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PostCards from "@/components/PostsCards"
import supabase from "@/utils/supabase"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PlusCircle, UserPlus, UserMinus } from "lucide-react"

interface Post {
  id: string
  comunidade_id: string
  titulo: string
  descricao: string
  tipo: string
  prazo?: string
  data_criacao: string
  id_usuario_criador?: string // ID do usuário que criou a postagem
}

interface Community {
  id: string
  nome: string
  total_usuarios: number
}

interface UserInfo {
  id: string | null
  tipo: string | null
}

export default function CommunityPage() {
  const {} = useTheme()
  const { discriminador } = useParams<{ discriminador: string }>()
  const [posts, setPosts] = useState<Post[]>([])
  const [community, setCommunity] = useState<Community | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo>({ id: null, tipo: null })
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Verificar o tipo de usuário atual e seu ID
  useEffect(() => {
    async function getUserInfo() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Busca informações do usuário na tabela Usuarios
        const { data, error } = await supabase
          .from("Usuarios")
          .select("id, tipo")
          .eq("id_auth_users", user.id)
          .single()

        if (error) {
          console.error("Erro ao buscar informações do usuário:", error)
        } else {
          setUserInfo(data || { id: null, tipo: null })
        }
      }
      setLoading(false)
    }

    getUserInfo()
  }, [])

  // Consulta para buscar os dados da comunidade pelo discriminador
  useEffect(() => {
    async function fetchCommunity() {
      const { data, error } = await supabase
        .from("Comunidades")
        .select("id, nome, total_usuarios")
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

  // Verificar se o usuário já segue a comunidade
  useEffect(() => {
    async function checkFollowStatus() {
      if (!userInfo.id || !community?.id) return

      const { data, error } = await supabase
        .from("usuario_comunidade")
        .select("id")
        .eq("id_usuario", userInfo.id)
        .eq("id_comunidade", community.id)
        .eq("tipo", "seguidor") // Alterado de "role" para "tipo"
        .maybeSingle()

      if (error) {
        console.error("Erro ao verificar status de seguidor:", error)
      } else {
        setIsFollowing(!!data)
      }
    }

    checkFollowStatus()
  }, [userInfo.id, community?.id])

  // Função para buscar os posts da comunidade
  const fetchPosts = async () => {
    if (!community) return

    const { data, error } = await supabase
      .from("Postagens")
      .select(
        "id, comunidade_id, titulo, descricao, data_criacao, data_atualizacao, tipo, prazo, id_usuario_criador, candidaturas_abertas"
      )
      .eq("comunidade_id", community.id)

    if (error) {
      console.error("Error fetching posts:", error)
    } else {
      setPosts(data || [])
    }
  }

  // Consulta para buscar os posts da comunidade pelo ID da comunidade
  useEffect(() => {
    fetchPosts()
  }, [community])

  // Função para atualizar a lista de posts após uma edição
  const handlePostUpdate = () => {
    fetchPosts()
  }

  // Função para verificar se o usuário pode editar um post
  const canEditPost = (post: Post) => {
    // Apenas docentes que criaram o post podem editá-lo
    return userInfo.tipo === "Docente" && 
           userInfo.id === post.id_usuario_criador && 
           isFollowing
  }

  // Função para seguir/deixar de seguir a comunidade
  const handleFollowToggle = async () => {
    if (!userInfo.id || !community?.id) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        // Remover o usuário como seguidor
        const { error } = await supabase
          .from("usuario_comunidade")
          .delete()
          .eq("id_comunidade", community.id)
          .eq("id_usuario", userInfo.id)
          .eq("tipo", "seguidor") // Alterado de "role" para "tipo"

        if (error) throw error

        // Decrementar contador de usuários
        await supabase.rpc("decrement_community_users", {
          community_id: community.id,
        })

        // Atualizar a UI
        setIsFollowing(false)
        setCommunity((prev) =>
          prev
            ? {
                ...prev,
                total_usuarios: Math.max(prev.total_usuarios - 1, 0),
              }
            : null
        )
      } else {
        // Adicionar o usuário como seguidor
        const { error } = await supabase.from("usuario_comunidade").insert([
          {
            id_comunidade: community.id,
            id_usuario: userInfo.id,
            tipo: "seguidor", // Alterado de "role" para "tipo"
          },
        ])

        if (error) throw error

        // Incrementar contador de usuários
        await supabase.rpc("increment_community_users", {
          community_id: community.id,
        })

        // Atualizar a UI
        setIsFollowing(true)
        setCommunity((prev) =>
          prev
            ? {
                ...prev,
                total_usuarios: prev.total_usuarios + 1,
              }
            : null
        )
      }
    } catch (error) {
      console.error("Erro ao seguir/deixar de seguir comunidade:", error)
    } finally {
      setFollowLoading(false)
    }
  }

  // Função para navegar para a página de criação de postagem
  const handleCreatePost = () => {
    if (community) {
      navigate(`/c/${discriminador}/criar-postagem`, {
        state: { communityId: community.id },
      })
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-base-100 py-8">
        <div className="max-w-screen-lg mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {community ? community.nome : "Carregando..."}
            </h1>

            {userInfo.id && community && !loading && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`btn ${
                  isFollowing ? "btn-primary" : "btn-outline btn-primary"
                } flex items-center gap-2`}
              >
                {followLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : isFollowing ? (
                  <>
                    <UserMinus size={18} /> Seguindo
                  </>
                ) : (
                  <>
                    <UserPlus size={18} /> Seguir
                  </>
                )}
              </button>
            )}
          </div>

          {community && (
            <div className="mb-6 text-sm text-gray-600">
              <p>Total de membros: {community.total_usuarios}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCards 
                  key={post.id} 
                  post={post} 
                  isEditable={canEditPost(post)}
                  communityDiscriminator={discriminador}
                  onPostUpdate={handlePostUpdate}
                  userType={userInfo.tipo}
                  isFollowing={isFollowing}
                />
              ))
            ) : (
              <p className="text-center text-gray-600">
                Ainda não há posts nessa comunidade
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botão fixo para criar postagem (aparece somente para docentes que seguem a comunidade) */}
      {!loading && userInfo.tipo === "Docente" && isFollowing && (
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
