import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Clock, Check, X } from "lucide-react"
import supabase from "@/utils/supabase"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Pagination from "@/components/Pagination"

// Interfaces mais simples e precisas
interface Comunidade {
  nome: string
  discriminador: string
}

interface Candidatura {
  id: string
  data_candidatura: string
  status: string
  universidade: string
  semestre: string
  motivo: string
  postagem: {
    id: string
    titulo: string
    descricao: string
    comunidade: Comunidade
  }
}

interface Postagem {
  id: string
  titulo: string
  descricao: string
  candidaturas_count: number
  comunidade: Comunidade
}

// Função utilitária para normalizar objetos nested vindos do Supabase
const normalizeNestedObject = <T extends object>(obj: any): T => {
  if (Array.isArray(obj)) return (obj[0] || {}) as T
  return (obj || {}) as T
}

// Número de itens por página
const ITEMS_PER_PAGE = 5

export default function Candidaturas() {
  const [allCandidaturas, setAllCandidaturas] = useState<Candidatura[]>([])
  const [paginatedCandidaturas, setPaginatedCandidaturas] = useState<
    Candidatura[]
  >([])
  const [allPostagens, setAllPostagens] = useState<Postagem[]>([])
  const [paginatedPostagens, setPaginatedPostagens] = useState<Postagem[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Função para lidar com a mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Efeito para atualizar os itens paginados quando mudar de página
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    if (userType === "Discente") {
      setPaginatedCandidaturas(allCandidaturas.slice(startIndex, endIndex))
    } else if (userType === "Docente") {
      setPaginatedPostagens(allPostagens.slice(startIndex, endIndex))
    }
  }, [currentPage, userType, allCandidaturas, allPostagens])

  // Hook para carregar os dados do usuário e candidaturas/postagens
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Verificar autenticação de forma simplificada
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()
        if (authError || !user) throw new Error("Usuário não autenticado")

        // Buscar tipo do usuário
        const { data: userData, error: userError } = await supabase
          .from("Usuarios")
          .select("id, tipo")
          .eq("id_auth_users", user.id)
          .single()
        if (userError || !userData)
          throw new Error("Erro ao obter dados do usuário")

        setUserType(userData.tipo)

        // Carregar dados baseado no tipo do usuário
        if (userData.tipo === "Discente") {
          await fetchCandidaturasDiscente(userData.id)
        } else if (userData.tipo === "Docente") {
          await fetchPostagensDocente(userData.id)
        }
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Função otimizada para buscar candidaturas
  const fetchCandidaturasDiscente = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("Candidaturas")
        .select(
          `
          id,
          data_candidatura,
          status,
          universidade,
          semestre,
          motivo,
          postagem:postagem_id (
            id,
            titulo,
            descricao,
            comunidade:comunidade_id (
              nome,
              discriminador
            )
          )
        `
        )
        .eq("usuario_id", userId)
        .order("data_candidatura", { ascending: false })

      if (error) throw error

      // Processamento simplificado dos dados
      const processed = (data || []).map((item) => {
        const normalizedPostagem = normalizeNestedObject<
          Candidatura["postagem"]
        >(item.postagem)
        return {
          ...item,
          postagem: {
            ...normalizedPostagem,
            comunidade: normalizeNestedObject<Comunidade>(
              normalizedPostagem.comunidade
            ),
          },
        }
      })

      setAllCandidaturas(processed as Candidatura[])
      setPaginatedCandidaturas(processed.slice(0, ITEMS_PER_PAGE))
      setTotalPages(Math.ceil(processed.length / ITEMS_PER_PAGE) || 1)
    } catch (err: any) {
      console.error(err)
      setError(`Erro ao buscar candidaturas: ${err.message}`)
    }
  }

  // Função otimizada para buscar postagens do docente
  const fetchPostagensDocente = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("Postagens")
        .select(
          `
          id,
          titulo,
          descricao,
          comunidade:comunidade_id (
            nome,
            discriminador
          )
        `
        )
        .eq("id_usuario_criador", userId)
        .eq("candidaturas_abertas", true)

      if (error) throw error

      // Usar Promise.all de forma otimizada para buscar contagem
      const postagensPromises = (data || []).map(async (postagem) => {
        const { count } = await supabase
          .from("Candidaturas")
          .select("*", { count: "exact", head: true })
          .eq("postagem_id", postagem.id)

        return {
          id: postagem.id,
          titulo: postagem.titulo,
          descricao: postagem.descricao,
          candidaturas_count: count || 0,
          comunidade: normalizeNestedObject<Comunidade>(postagem.comunidade),
        }
      })

      const postagensComContagem = await Promise.all(postagensPromises)
      setAllPostagens(postagensComContagem)
      setPaginatedPostagens(postagensComContagem.slice(0, ITEMS_PER_PAGE))
      setTotalPages(
        Math.ceil(postagensComContagem.length / ITEMS_PER_PAGE) || 1
      )
    } catch (err: any) {
      console.error(err)
      setError(`Erro ao buscar postagens: ${err.message}`)
    }
  }

  // Formatação de data como função reutilizável
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

  // Map de status para badges - mais declarativo
  const statusBadges = {
    Pendente: (
      <span className="badge badge-warning badge-sm gap-1">
        <Clock size={12} /> Pendente
      </span>
    ),
    Aprovado: (
      <span className="badge badge-success badge-sm gap-1">
        <Check size={12} /> Aprovado
      </span>
    ),
    Rejeitado: (
      <span className="badge badge-error badge-sm gap-1">
        <X size={12} /> Rejeitado
      </span>
    ),
  }

  // Renderização de badge simplificada
  const renderStatusBadge = (status: string) =>
    statusBadges[status as keyof typeof statusBadges] || (
      <span className="badge badge-ghost badge-sm">{status}</span>
    )

  // Views memoizadas para evitar re-renderizações desnecessárias
  const discenteView = useMemo(() => {
    if (allCandidaturas.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg mb-4">Você ainda não possui candidaturas.</p>
          <Link to="/comunidades" className="btn btn-primary">
            Explorar Comunidades
          </Link>
        </div>
      )
    }

    return (
      <>
        <div className="grid gap-6">
          {paginatedCandidaturas.map((c) => (
            <div key={c.id} className="bg-base-200 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {c.postagem.titulo}
                  </h3>
                  <p className="text-sm opacity-70 mb-2">
                    Comunidade: {c.postagem.comunidade.nome}
                  </p>
                </div>
                {renderStatusBadge(c.status)}
              </div>
              <div className="divider my-2"></div>
              <p>
                <span className="font-medium">Data da candidatura:</span>{" "}
                {formatDate(c.data_candidatura)}
              </p>
              <p>
                <span className="font-medium">Universidade:</span>{" "}
                {c.universidade}
              </p>
              <p>
                <span className="font-medium">Semestre:</span> {c.semestre}
              </p>
              {c.status === "Aprovado" && (
                <div className="alert alert-success mt-4">
                  <Check size={16} />
                  <span>Parabéns! Sua candidatura foi aprovada.</span>
                </div>
              )}
              <div className="mt-4">
                <Link
                  to={`/c/${c.postagem.comunidade.discriminador}`}
                  className="btn btn-outline btn-sm"
                >
                  Ver Comunidade
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        {allCandidaturas.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-6"
          />
        )}
      </>
    )
  }, [paginatedCandidaturas, allCandidaturas.length, currentPage, totalPages])

  const docenteView = useMemo(() => {
    if (allPostagens.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg mb-4">
            Você não possui postagens com candidaturas abertas.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Criar Postagem
          </Link>
        </div>
      )
    }

    return (
      <>
        <div className="grid gap-6">
          {paginatedPostagens.map((p) => (
            <div key={p.id} className="bg-base-200 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{p.titulo}</h3>
                  <p className="text-sm opacity-70 mb-2">
                    Comunidade: {p.comunidade.nome}
                  </p>
                </div>
                <div className="badge badge-primary badge-lg">
                  {p.candidaturas_count} candidatura(s)
                </div>
              </div>
              <p className="mb-4 line-clamp-2">{p.descricao}</p>
              <div className="mt-4">
                <Link
                  to={`/candidaturas/${p.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Ver Candidaturas
                </Link>
                <Link
                  to={`/c/${p.comunidade.discriminador}`}
                  className="btn btn-outline btn-sm ml-2"
                >
                  Ver Comunidade
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        {allPostagens.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-6"
          />
        )}
      </>
    )
  }, [paginatedPostagens, allPostagens.length, currentPage, totalPages])

  // Componente principal simplificado
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/dashboard" className="btn btn-ghost btn-sm gap-1 mb-4">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <h1 className="text-3xl font-bold mb-2">Candidaturas</h1>
        {userType === "Discente" && (
          <p className="text-lg opacity-75 mb-4">
            Acompanhe suas candidaturas
            {allCandidaturas.length > 0 && (
              <span> ({allCandidaturas.length} total)</span>
            )}
          </p>
        )}
        {userType === "Docente" && (
          <p className="text-lg opacity-75 mb-4">
            Gerencie as candidaturas de suas postagens
            {allPostagens.length > 0 && (
              <span> ({allPostagens.length} postagens)</span>
            )}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : userType === "Discente" ? (
          discenteView
        ) : (
          docenteView
        )}
      </main>
      <Footer />
    </div>
  )
}
