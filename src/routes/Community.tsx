import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import PostCards from "@/components/PostsCards"
import Pagination from "@/components/Pagination"
import supabase from "@/utils/supabase"
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { PlusCircle, UserPlus, UserMinus, Pencil, Trash2 } from "lucide-react"

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
  descricao?: string
  total_usuarios: number
  total_posts: number
  id_usuario_criador: string
  discriminador?: string
}

interface UserInfo {
  id: string | null
  tipo: string | null
}

const POSTS_PER_PAGE = 5 // Número de posts por página

export default function CommunityPage() {
  const {} = useTheme()
  const { discriminador } = useParams<{ discriminador: string }>()
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [paginatedPosts, setPaginatedPosts] = useState<Post[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [community, setCommunity] = useState<Community | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo>({ id: null, tipo: null })
  const [isFollowing, setIsFollowing] = useState(false)
  const [isCreator, setIsCreator] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Estados para edição/exclusão de comunidade
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editNome, setEditNome] = useState("")
  const [editDescricao, setEditDescricao] = useState("")
  const [editDiscriminador, setEditDiscriminador] = useState("")
  const [submitting, setSubmitting] = useState(false)
  // Função para lidar com a mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Efeito para paginar os posts quando mudar a página atual
  useEffect(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE
    const endIndex = startIndex + POSTS_PER_PAGE
    setPaginatedPosts(allPosts.slice(startIndex, endIndex))
  }, [currentPage, allPosts])

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
  }, []) // Consulta para buscar os dados da comunidade pelo discriminador
  useEffect(() => {
    async function fetchCommunity() {
      const { data, error } = await supabase
        .from("Comunidades")
        .select(
          "id, nome, descricao, total_usuarios, total_posts, id_usuario_criador, discriminador"
        )
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

  // Verificar se o usuário já segue a comunidade e se é o criador
  useEffect(() => {
    async function checkFollowAndCreatorStatus() {
      if (!userInfo.id || !community?.id) return

      // Primeiro verificar se o usuário é o criador pelo campo id_usuario_criador
      const isCreatorById = community.id_usuario_criador === userInfo.id

      // Se já é criador pelo ID, definir os estados imediatamente
      if (isCreatorById) {
        setIsCreator(true)
        setIsFollowing(true) // Criador sempre segue a comunidade

        // Garantir que o relacionamento exista no banco
        const { data: existingRelation, error: checkError } = await supabase
          .from("usuario_comunidade")
          .select("id")
          .eq("id_usuario", userInfo.id)
          .eq("id_comunidade", community.id)
          .eq("tipo", "criador")
          .single()

        if (checkError || !existingRelation) {
          // Se não existir uma relação de criador, criamos uma
          await supabase.from("usuario_comunidade").insert([
            {
              id_comunidade: community.id,
              id_usuario: userInfo.id,
              tipo: "criador",
            },
          ])
        }

        return // Não precisamos verificar a relação na tabela novamente
      }

      // Verificar se o usuário já é criador ou seguidor da comunidade na tabela de relações
      const { data, error } = await supabase
        .from("usuario_comunidade")
        .select("id, tipo")
        .eq("id_usuario", userInfo.id)
        .eq("id_comunidade", community.id)
        .in("tipo", ["seguidor", "criador"])

      if (error) {
        console.error("Erro ao verificar status de seguidor:", error)
      } else {
        // Se houver qualquer relação, o usuário está seguindo
        setIsFollowing(data && data.length > 0)

        // Verifica se o usuário é o criador da comunidade pela relação tipo "criador"
        const isCreatorByRelation =
          data?.some((item) => item.tipo === "criador") || false
        setIsCreator(isCreatorByRelation || isCreatorById)
      }
    }

    checkFollowAndCreatorStatus()
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
      .order("data_criacao", { ascending: false })

    if (error) {
      console.error("Error fetching posts:", error)
    } else {
      setAllPosts(data || [])
      setPaginatedPosts((data || []).slice(0, POSTS_PER_PAGE))
      setTotalPages(Math.ceil((data || []).length / POSTS_PER_PAGE) || 1)
    }
  }

  // Consulta para buscar os posts da comunidade pelo ID da comunidade
  useEffect(() => {
    fetchPosts()
  }, [community]) // Função para atualizar a lista de posts após uma edição ou deleção
  const handlePostUpdate = () => {
    fetchPosts()

    // Atualizar a contagem de posts na comunidade após a exclusão
    // Usamos o setState diretamente para refletir a mudança em tempo real
    if (community) {
      setCommunity((prevCommunity) => {
        if (!prevCommunity) return null

        // Ao excluir um post, decrementamos o contador
        return {
          ...prevCommunity,
          total_posts: Math.max(prevCommunity.total_posts - 1, 0),
        }
      })
    }
  }

  // Função para verificar se o usuário pode editar um post
  const canEditPost = (post: Post) => {
    // Apenas docentes que criaram o post podem editá-lo
    return (
      userInfo.tipo === "Docente" &&
      userInfo.id === post.id_usuario_criador &&
      isFollowing
    )
  }

  // Função para abrir o modal de edição de comunidade
  const openEditModal = () => {
    if (community) {
      setEditNome(community.nome)
      // Verificar se a descrição existe no objeto da comunidade antes de definir
      // Se community.descricao for undefined, usar string vazia como fallback
      setEditDescricao(community.descricao || "")
      setEditDiscriminador(discriminador || "")
      setEditModalOpen(true)
    }
  }
  // Função para salvar as alterações da comunidade
  const handleSaveCommunity = async () => {
    if (!community || !userInfo.id) return

    // Verificar se o usuário é o criador da comunidade
    if (community.id_usuario_criador !== userInfo.id) {
      alert("Apenas o criador da comunidade pode editá-la.")
      setEditModalOpen(false)
      return
    }

    setSubmitting(true)

    try {
      // Validar tamanho do discriminador (mínimo 3 caracteres)
      if (editDiscriminador.length < 3) {
        alert("O discriminador deve ter pelo menos 3 caracteres.")
        return
      }

      // Verificar se o discriminador já existe (se for diferente do atual)
      if (editDiscriminador !== discriminador) {
        const { data: existingCommunity, error: checkError } = await supabase
          .from("Comunidades")
          .select("id")
          .eq("discriminador", editDiscriminador)
          .single()

        if (!checkError && existingCommunity) {
          alert("Este discriminador já está em uso. Por favor, escolha outro.")
          return
        }
      }

      // Atualizar a comunidade
      const { error } = await supabase
        .from("Comunidades")
        .update({
          nome: editNome,
          descricao: editDescricao,
          discriminador: editDiscriminador,
          data_atualizacao: new Date().toISOString(),
        })
        .eq("id", community.id)

      if (error) {
        console.error("Erro ao atualizar comunidade:", error)
        alert("Erro ao atualizar comunidade: " + error.message)
        return
      }

      // Fechar o modal e atualizar os dados
      setEditModalOpen(false)
      // Se o discriminador mudou, redirecionar para a nova URL
      if (editDiscriminador !== discriminador) {
        navigate(`/c/${editDiscriminador}`)
      } else {
        // Atualizar os dados da comunidade no estado
        setCommunity({
          ...community,
          nome: editNome,
          descricao: editDescricao,
          discriminador: editDiscriminador,
        })
      }

      alert("Comunidade atualizada com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar comunidade:", error)
    } finally {
      setSubmitting(false)
    }
  }
  // Função para excluir a comunidade
  const handleDeleteCommunity = async () => {
    if (!community || !userInfo.id) return

    // Verificar se o usuário é o criador da comunidade
    if (community.id_usuario_criador !== userInfo.id) {
      alert("Apenas o criador da comunidade pode excluí-la.")
      setDeleteModalOpen(false)
      return
    }

    // Pedir confirmação adicional
    const confirmText = window.prompt(
      "Para confirmar a exclusão, digite 'EXCLUIR':"
    )
    if (confirmText !== "EXCLUIR") {
      alert("Exclusão cancelada.")
      setDeleteModalOpen(false)
      return
    }
    setSubmitting(true)

    try {
      // Excluir as relações de usuário-comunidade
      const { error: relacaoError } = await supabase
        .from("usuario_comunidade")
        .delete()
        .eq("id_comunidade", community.id)

      if (relacaoError) {
        console.error("Erro ao excluir relações da comunidade:", relacaoError)
        alert("Erro ao excluir a comunidade")
        return
      }

      // Excluir a comunidade
      const { error } = await supabase
        .from("Comunidades")
        .delete()
        .eq("id", community.id)

      if (error) {
        console.error("Erro ao excluir comunidade:", error)
        alert("Erro ao excluir a comunidade: " + error.message)
        return
      }

      // Redirecionar para a página de comunidades
      alert("Comunidade excluída com sucesso!")
      navigate("/comunidades")
    } catch (error) {
      console.error("Erro ao excluir comunidade:", error)
    } finally {
      setSubmitting(false)
      setDeleteModalOpen(false)
    }
  }

  // Função para seguir/deixar de seguir a comunidade
  const handleFollowToggle = async () => {
    if (!userInfo.id || !community?.id) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        // Verificar se o usuário é o criador da comunidade
        if (isCreator) {
          alert(
            "Você não pode deixar de seguir uma comunidade que você criou. Para removê-la, você deve excluir a comunidade."
          )
          setFollowLoading(false)
          return
        }

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
      <div className="min-h-screen bg-base-100 py-4 sm:py-8">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
          {" "}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {community ? community.nome : "Carregando..."}
              </h1>
              {isCreator && (
                <div className="inline-block bg-primary text-primary-content px-3 py-2 rounded-lg text-sm font-medium mt-2">
                  Você é o criador desta comunidade
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {isCreator && community && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={openEditModal}
                    className="btn btn-outline btn-info flex items-center justify-center gap-2 btn-sm sm:btn-md"
                    title="Editar comunidade"
                  >
                    <Pencil size={14} className="sm:w-4 sm:h-4" />
                    <span className="sm:inline">Editar</span>
                  </button>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="btn btn-outline btn-error flex items-center justify-center gap-2 btn-sm sm:btn-md"
                    title="Excluir comunidade"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    <span className="sm:inline">Excluir</span>
                  </button>
                </div>
              )}
              {userInfo.id && community && !loading && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading || (isCreator && isFollowing)}
                  className={`btn ${
                    isFollowing
                      ? isCreator
                        ? "btn-primary cursor-not-allowed opacity-70"
                        : "btn-primary"
                      : "btn-outline btn-primary"
                  } flex items-center justify-center gap-2 btn-sm sm:btn-md`}
                  title={
                    isCreator && isFollowing
                      ? "Você não pode deixar de seguir uma comunidade que você criou"
                      : ""
                  }
                >
                  {followLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-1"></span>
                      <span className="hidden sm:inline">
                        {isFollowing ? "Seguindo" : "Seguir"}
                      </span>
                    </>
                  ) : isFollowing ? (
                    <>
                      <UserMinus
                        size={16}
                        className="sm:w-[18px] sm:h-[18px]"
                      />
                      <span className="hidden sm:inline">
                        {isCreator ? "Criador" : "Seguindo"}
                      </span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden sm:inline">Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>{" "}
          {community && (
            <div className="mb-6 p-4 bg-base-200 rounded-lg">
              {community.descricao && (
                <p className="text-base-content mb-3 text-sm sm:text-base">
                  {community.descricao}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-base-content/70">
                <p>
                  <span className="font-medium">Membros:</span>{" "}
                  {community.total_usuarios}
                </p>
                <p>
                  <span className="font-medium">Postagens:</span>{" "}
                  {community.total_posts}
                </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {paginatedPosts.length > 0 ? (
              paginatedPosts.map((post) => (
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
              <p className="text-center text-gray-600 py-12 bg-base-200 rounded-lg">
                Ainda não há posts nessa comunidade
              </p>
            )}
          </div>
          {/* Paginação */}
          {allPosts.length > POSTS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
      {/* Botão fixo para criar postagem (aparece somente para docentes que seguem a comunidade) */}
      {!loading && userInfo.tipo === "Docente" && isFollowing && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <button
            onClick={handleCreatePost}
            className="btn btn-primary shadow-lg flex items-center gap-2 btn-sm sm:btn-md"
          >
            <PlusCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Criar Postagem</span>
            <span className="sm:hidden">Criar</span>
          </button>
        </div>
      )}{" "}
      <Footer />
      {/* Modal de Edição de Comunidade */}
      {editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-base-100 p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Editar Comunidade
            </h2>
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">Nome da Comunidade</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                placeholder="Nome da Comunidade"
                required
              />
            </div>
            <div className="form-control mb-3">
              <label className="label">
                <span className="label-text">Descrição</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                value={editDescricao}
                onChange={(e) => setEditDescricao(e.target.value)}
                placeholder="Descrição da Comunidade"
                rows={3}
              />
            </div>
            <div className="form-control mb-5">
              <label className="label">
                <span className="label-text">Discriminador (URL)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={editDiscriminador}
                onChange={(e) =>
                  setEditDiscriminador(
                    e.target.value.toLowerCase().replace(/\s+/g, "-")
                  )
                }
                placeholder="discriminador-da-comunidade"
                required
              />
              <label className="label">
                <span className="label-text-alt">
                  URL ficará: /c/{editDiscriminador}
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setEditModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveCommunity}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Salvar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Exclusão de Comunidade */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
          <div className="bg-base-100 p-4 sm:p-6 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Excluir Comunidade
            </h2>
            <p className="mb-6 text-sm sm:text-base">
              Tem certeza que deseja excluir a comunidade{" "}
              <strong>{community?.nome}</strong>?
              <br />
              <br />
              <strong>Atenção:</strong> Esta ação é permanente e não pode ser
              desfeita.
              <br />
              <br />
              <strong>Importante:</strong> A exclusão da comunidade também
              removerá todas as suas postagens e relacionamentos.
              <br />
              <br />
              Para confirmar a exclusão, você precisará digitar EXCLUIR no
              prompt que aparecerá.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteCommunity}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Excluir"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
