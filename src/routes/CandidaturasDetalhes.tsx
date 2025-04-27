import { useState, useEffect, useMemo } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Check, X, User, Clock } from "lucide-react"
import supabase from "@/utils/supabase"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

// Interfaces mais organizadas
interface Comunidade {
  nome: string
  discriminador: string
}

interface Usuario {
  id: string
  nome: string
  email: string
  instituicao?: string
  curso?: string
}

interface Candidatura {
  id: string
  id_postagem: string
  id_usuario: string
  data_candidatura: string
  status: string
  universidade: string
  semestre: string
  motivo: string
  usuario: Usuario
}

interface Postagem {
  id: string
  titulo: string
  descricao: string
  tipo: string
  prazo?: string
  data_criacao: string
  candidaturas_abertas: boolean
  comunidade_id: string
  id_usuario_criador?: string
  comunidade: Comunidade
}

interface Notification {
  type: "success" | "error"
  message: string
}

// Função utilitária para normalizar objetos nested vindos do Supabase
const normalizeNestedObject = <T,>(obj: any): T => {
  if (Array.isArray(obj)) return obj[0]
  return obj || {}
}

export default function CandidaturasDetalhes() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [postagem, setPostagem] = useState<Postagem | null>(null)
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)

  // Hook para carregar os dados da postagem e candidaturas
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        setIsLoading(true)

        // Verificação de autenticação
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) throw new Error("Usuário não autenticado")

        // Obter dados do usuário
        const { data: userData, error: userError } = await supabase
          .from("Usuarios")
          .select("id, tipo_usuario")
          .eq("id_auth_users", user.id)
          .single()

        if (userError || !userData)
          throw new Error("Erro ao obter dados do usuário")

        // Se não for docente, redirecionar
        if (userData.tipo_usuario !== "Docente") {
          navigate("/candidaturas")
          return
        }

        // Buscar postagem e candidaturas em paralelo
        const [postagemResponse, candidaturasResponse] = await Promise.all([
          supabase
            .from("Postagens")
            .select(
              `
              id,
              titulo,
              descricao,
              tipo,
              prazo,
              data_criacao,
              candidaturas_abertas,
              id_usuario_criador,
              comunidade_id,
              comunidade:comunidade_id(
                nome,
                discriminador
              )
            `
            )
            .eq("id", id)
            .single(),

          supabase
            .from("Candidaturas")
            .select(
              `
              id,
              id_postagem,
              id_usuario,
              data_candidatura,
              status,
              universidade,
              semestre,
              motivo,
              usuario:id_usuario(
                id,
                nome,
                email,
                instituicao,
                curso
              )
            `
            )
            .eq("id_postagem", id)
            .order("data_candidatura", { ascending: false }),
        ])

        // Verificar erros nas respostas
        if (postagemResponse.error || !postagemResponse.data) {
          throw new Error("Postagem não encontrada")
        }

        if (candidaturasResponse.error) {
          throw candidaturasResponse.error
        }

        const postagemData = postagemResponse.data

        // Verificar se o usuário é o criador da postagem
        if (postagemData.id_usuario_criador !== userData.id) {
          navigate("/candidaturas")
          return
        }

        // Processar dados da postagem
        const formattedPostagem: Postagem = {
          ...postagemData,
          comunidade: normalizeNestedObject<Comunidade>(
            postagemData.comunidade
          ),
        }

        setPostagem(formattedPostagem)

        // Processar dados das candidaturas
        const formattedCandidaturas = (candidaturasResponse.data || []).map(
          (item) => ({
            ...item,
            usuario: normalizeNestedObject<Usuario>(item.usuario),
          })
        )

        setCandidaturas(formattedCandidaturas)
      } catch (error: any) {
        console.error("Erro:", error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, navigate])

  // Status counts memoizados para evitar recálculos
  const statusCounts = useMemo(() => {
    const pendingCount = candidaturas.filter(
      (c) => c.status === "Pendente"
    ).length
    const approvedCount = candidaturas.filter(
      (c) => c.status === "Aprovado"
    ).length
    const rejectedCount = candidaturas.filter(
      (c) => c.status === "Rejeitado"
    ).length

    return { pendingCount, approvedCount, rejectedCount }
  }, [candidaturas])

  // Atualizar status da candidatura de forma mais eficiente
  const updateCandidaturaStatus = async (
    candidaturaId: string,
    status: string
  ) => {
    setActionLoading(candidaturaId)
    setNotification(null)

    try {
      // Verificar limite de aprovações
      if (status === "Aprovado" && statusCounts.approvedCount >= 3) {
        setNotification({
          type: "error",
          message:
            "Não é possível aprovar mais de 3 candidaturas para uma postagem.",
        })
        return
      }

      // Atualizar no banco de dados
      const { error } = await supabase
        .from("Candidaturas")
        .update({ status })
        .eq("id", candidaturaId)

      if (error) throw error

      // Atualizar estado local imediatamente (otimista)
      setCandidaturas((prev) =>
        prev.map((c) => (c.id === candidaturaId ? { ...c, status } : c))
      )

      setNotification({
        type: "success",
        message: `Candidatura ${
          status === "Aprovado" ? "aprovada" : "rejeitada"
        } com sucesso!`,
      })
    } catch (error: any) {
      console.error("Erro ao atualizar candidatura:", error)
      setNotification({
        type: "error",
        message: `Erro ao atualizar candidatura: ${error.message}`,
      })
    } finally {
      setActionLoading(null)
    }
  }

  // Formatação de data simplificada
  const formatDate = (dateString?: string) => {
    if (!dateString) return null

    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Mapa de status para badges
  const statusBadges = {
    Pendente: (
      <span className="badge badge-warning gap-1">
        <Clock size={14} /> Pendente
      </span>
    ),
    Aprovado: (
      <span className="badge badge-success gap-1">
        <Check size={14} /> Aprovado
      </span>
    ),
    Rejeitado: (
      <span className="badge badge-error gap-1">
        <X size={14} /> Rejeitado
      </span>
    ),
  }

  // Renderização de badge simplificada
  const renderStatusBadge = (status: string) =>
    statusBadges[status as keyof typeof statusBadges] || (
      <span className="badge badge-ghost">{status}</span>
    )

  // Componente de candidatura para tornar o JSX mais limpo
  const CandidaturaCard = ({ candidatura }: { candidatura: Candidatura }) => (
    <div className="bg-base-200 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-primary text-neutral-content rounded-full w-12">
              <User size={24} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {candidatura.usuario.nome}
            </h3>
            <p className="text-sm opacity-70">{candidatura.usuario.email}</p>
          </div>
        </div>
        {renderStatusBadge(candidatura.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium mb-1">Universidade/Instituição</h4>
          <p>{candidatura.universidade}</p>
        </div>
        <div>
          <h4 className="font-medium mb-1">Semestre</h4>
          <p>{candidatura.semestre}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium mb-1">Motivo da candidatura</h4>
        <p className="bg-base-100 p-3 rounded">{candidatura.motivo}</p>
      </div>

      <div className="mb-2">
        <p className="text-sm opacity-70">
          Candidatura enviada em {formatDate(candidatura.data_candidatura)}
        </p>
      </div>

      {candidatura.status === "Pendente" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => updateCandidaturaStatus(candidatura.id, "Aprovado")}
            className="btn btn-success btn-sm gap-1 flex-1"
            disabled={!!actionLoading}
          >
            {actionLoading === candidatura.id ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Check size={16} />
            )}
            Aprovar
          </button>
          <button
            onClick={() => updateCandidaturaStatus(candidatura.id, "Rejeitado")}
            className="btn btn-error btn-sm gap-1 flex-1"
            disabled={!!actionLoading}
          >
            {actionLoading === candidatura.id ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <X size={16} />
            )}
            Rejeitar
          </button>
        </div>
      )}
    </div>
  )

  // Memoizar a lista de candidaturas renderizada
  const candidaturasListView = useMemo(() => {
    if (candidaturas.length === 0) {
      return (
        <div className="bg-base-200 p-8 rounded-lg text-center">
          <p className="text-lg mb-2">
            Não há candidaturas para esta postagem.
          </p>
          <p className="opacity-70">
            Quando discentes se candidatarem, eles aparecerão aqui.
          </p>
        </div>
      )
    }

    return (
      <div className="grid gap-6">
        {candidaturas.map((candidatura) => (
          <CandidaturaCard key={candidatura.id} candidatura={candidatura} />
        ))}
      </div>
    )
  }, [candidaturas, actionLoading])

  // Componente principal otimizado
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/candidaturas" className="btn btn-ghost btn-sm gap-1 mb-4">
          <ArrowLeft size={16} /> Voltar para Candidaturas
        </Link>

        {notification && (
          <div
            className={`alert ${
              notification.type === "success" ? "alert-success" : "alert-error"
            } mb-4`}
          >
            <span>{notification.message}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : (
          <>
            {postagem && (
              <div className="bg-base-200 p-6 rounded-lg shadow-sm mb-8">
                <h1 className="text-2xl font-bold mb-2">{postagem.titulo}</h1>
                <p className="text-sm opacity-70 mb-4">
                  Comunidade: {postagem.comunidade.nome}
                </p>

                <p className="mb-4">{postagem.descricao}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="badge badge-primary">{postagem.tipo}</div>
                  {postagem.prazo && (
                    <div className="badge">
                      Prazo: {formatDate(postagem.prazo)}
                    </div>
                  )}
                  {postagem.candidaturas_abertas ? (
                    <div className="badge badge-success">
                      Candidaturas Abertas
                    </div>
                  ) : (
                    <div className="badge badge-error">
                      Candidaturas Fechadas
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Candidaturas ({candidaturas.length})
              </h2>
              <div className="text-sm">
                <span className="mr-4">
                  <span className="inline-block w-3 h-3 rounded-full bg-warning mr-1"></span>
                  Pendentes: {statusCounts.pendingCount}
                </span>
                <span className="mr-4">
                  <span className="inline-block w-3 h-3 rounded-full bg-success mr-1"></span>
                  Aprovadas: {statusCounts.approvedCount}/3
                </span>
                <span>
                  <span className="inline-block w-3 h-3 rounded-full bg-error mr-1"></span>
                  Rejeitadas: {statusCounts.rejectedCount}
                </span>
              </div>
            </div>

            {candidaturasListView}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
