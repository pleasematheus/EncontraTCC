import { useState, useEffect } from "react"
import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CommunityCards from "@/components/CommunityCards"
import Pagination from "@/components/Pagination"
import supabase from "@/utils/supabase"
import { PlusCircle } from "lucide-react"

interface Community {
  id: string
  nome: string
  descricao: string
  total_posts: number
  total_usuarios: number
  data_criacao: string
  data_atualizacao: string
  discriminador: string
  is_following?: boolean // Adicionado para controle de seguidores
}

const ITEMS_PER_PAGE = 9 // Número de comunidades por página

export default function Communities() {
  const {} = useTheme()

  const [loading, setLoading] = useState(true)
  const [allCommunities, setAllCommunities] = useState<Community[]>([])
  const [paginatedCommunities, setPaginatedCommunities] = useState<Community[]>(
    []
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [userType, setUserType] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [discriminador, setDiscriminador] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null) // ID do usuário atual

  // Função para lidar com a mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Efeito para paginar as comunidades quando mudar a página atual
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    setPaginatedCommunities(allCommunities.slice(startIndex, endIndex))
  }, [currentPage, allCommunities])

  // Busca o tipo do usuário autenticado e seu ID
  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("Erro ao obter usuário:", userError)
        return
      }

      const { data, error } = await supabase
        .from("Usuarios")
        .select("id, tipo")
        .eq("id_auth_users", user.id)
        .single()

      if (error) {
        console.error("Erro ao buscar informações do usuário:", error)
      } else {
        setUserType(data?.tipo.toLowerCase())
        setUserId(data?.id || null)
      }
    }

    fetchUserInfo()
  }, [])

  // Função para buscar e atualizar a lista de comunidades junto com status de seguidor
  const getComunidades = async () => {
    setLoading(true)

    if (!userId) {
      // Busca todas as comunidades (sem limite)
      const { data, error } = await supabase
        .from("Comunidades")
        .select("*")
        .order("data_criacao", { ascending: false })

      if (error) {
        console.error("Erro ao buscar comunidades:", error)
      } else {
        setAllCommunities(data as Community[])
        setPaginatedCommunities(data.slice(0, ITEMS_PER_PAGE))
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE) || 1)
      }
      setLoading(false)
      return
    }

    // Busca todas as comunidades (sem limite)
    const { data: communitiesData, error: communitiesError } = await supabase
      .from("Comunidades")
      .select("*")
      .order("data_criacao", { ascending: false })

    if (communitiesError) {
      console.error("Erro ao buscar comunidades:", communitiesError)
      setLoading(false)
      return
    }

    // Busca relações de seguidor para o usuário atual
    const { data: followingData, error: followingError } = await supabase
      .from("usuario_comunidade")
      .select("id_comunidade")
      .eq("id_usuario", userId)
      .eq("tipo", "seguidor") // Corrigido para usar "tipo" conforme a estrutura da tabela

    if (followingError) {
      console.error("Erro ao buscar comunidades seguidas:", followingError)
    }

    // Cria um Set com IDs das comunidades seguidas para busca eficiente
    const followingSet = new Set(
      (followingData || []).map((item) => item.id_comunidade)
    )

    // Marca as comunidades seguidas pelo usuário
    const communitiesWithFollowStatus = (communitiesData || []).map(
      (community) => ({
        ...community,
        is_following: followingSet.has(community.id),
      })
    )

    setAllCommunities(communitiesWithFollowStatus)
    setPaginatedCommunities(
      communitiesWithFollowStatus.slice(0, ITEMS_PER_PAGE)
    )
    setTotalPages(
      Math.ceil(communitiesWithFollowStatus.length / ITEMS_PER_PAGE) || 1
    )
    setLoading(false)
  }
  // Carrega as comunidades quando o componente é montado ou userId muda
  useEffect(() => {
    getComunidades()

    // Configurar evento para atualizar quando a página se tornar visível novamente
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        getComunidades()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Limpar o event listener quando o componente for desmontado
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [userId])

  // Função para criar comunidade, validando o tipo e inserindo os dados corretos.
  const handleCreateCommunity = async () => {
    setSubmitting(true)

    // Validar tamanho do discriminador (mínimo 3 caracteres)
    if (discriminador.length < 3) {
      alert("O discriminador deve ter pelo menos 3 caracteres.")
      setSubmitting(false)
      return
    }

    // Obter o usuário autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Erro ao obter usuário:", authError)
      setSubmitting(false)
      return
    }

    // Buscar o registro do usuário na tabela "Usuarios"
    const { data: usuarioData, error: usuarioError } = await supabase
      .from("Usuarios")
      .select("id, tipo")
      .eq("id_auth_users", user.id)
      .single()

    if (usuarioError || !usuarioData) {
      console.error(
        "Erro ao buscar usuário na tabela 'Usuarios':",
        usuarioError
      )
      setSubmitting(false)
      return
    }

    // Se o usuário não for do tipo "docente", a inserção não é permitida.
    if (usuarioData.tipo.toLowerCase() !== "docente") {
      alert("Apenas docentes podem criar comunidades.")
      setSubmitting(false)
      return
    }

    // Inserir a nova comunidade, utilizando o id da tabela Usuarios para id_usuario_criador.
    const { error } = await supabase.from("Comunidades").insert([
      {
        nome,
        descricao,
        discriminador,
        id_usuario_criador: usuarioData.id, // Esse valor está de acordo com a FK da tabela "Usuarios"
        total_posts: 0,
        total_usuarios: 1,
        data_atualizacao: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Erro ao criar comunidade:", error)
    } else {
      // Limpa os campos e fecha o modal.
      setNome("")
      setDescricao("")
      setDiscriminador("")
      setModalOpen(false)
      // Atualiza a lista de comunidades para incluir a nova.
      await getComunidades()
      // Volta para a primeira página após criar uma nova comunidade
      setCurrentPage(1)
    }
    setSubmitting(false)
  }

  return (
    <>
      <Header />
      <main className="px-4 py-8 min-h-screen relative pb-32">
        <h1 className="text-3xl font-bold text-center mb-8">Comunidades</h1>

        {allCommunities.length > 0 && (
          <p className="text-center text-gray-500 mb-6">
            {allCommunities.length} comunidades encontradas
          </p>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : allCommunities.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">
            Ainda não há comunidades cadastradas.
          </p>
        ) : (
          <>
            <CommunityCards
              communities={paginatedCommunities}
              userId={userId || undefined}
            />

            {/* Componente de paginação */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>

      {/* Botão fixo para criar comunidade (aparece somente para docentes) */}
      {userType === "docente" && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            className="btn btn-primary shadow-lg"
            onClick={() => setModalOpen(true)}
          >
            <PlusCircle size={18} />
            Criar comunidade
          </button>
        </div>
      )}

      <Footer />

      {/* Modal para criação de comunidade */}
      {modalOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Criar nova comunidade</h3>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Nome</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Descrição</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Discriminador</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Ex: dev, mat, comp"
                maxLength={9}
                value={discriminador}
                onChange={(e) => setDiscriminador(e.target.value)}
              />
              <label className="label">
                <span className="label-text-alt">
                  O discriminador deve ter entre 3 e 9 caracteres e ajudará a
                  identificar sua comunidade
                </span>
              </label>
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setModalOpen(false)
                  setNome("")
                  setDescricao("")
                  setDiscriminador("")
                }}
              >
                Cancelar
              </button>{" "}
              <button
                className="btn btn-primary"
                onClick={handleCreateCommunity}
                disabled={
                  submitting ||
                  !nome.trim() ||
                  !descricao.trim() ||
                  !discriminador.trim()
                }
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Criar
                  </>
                ) : (
                  "Criar"
                )}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}
