import { useEffect, useState } from "react"
import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Pagination from "@/components/Pagination"
import supabase from "@/utils/supabase"
import { Link } from "react-router-dom"
import { Calendar, Clock } from "lucide-react"

interface UserData {
  id?: string
  nome?: string
  email?: string
  tipo?: string
}

interface PostagemRecente {
  id: string
  titulo: string
  descricao: string
  tipo: string
  prazo: string | null
  candidaturas_abertas: boolean
  data_criacao: string
  data_atualizacao: string | null
  comunidade_nome: string
  comunidade_discriminador: string
  criador_nome: string
}

const POSTS_PER_PAGE = 5; // Número de posts por página

const Dashboard = () => {
  const {} = useTheme()

  const [userData, setUserData] = useState<UserData | null>(null)
  const [todasPostagensRecentes, setTodasPostagensRecentes] = useState<PostagemRecente[]>([])
  const [postagensExibidas, setPostagensExibidas] = useState<PostagemRecente[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Função para lidar com a mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Efeito para atualizar as postagens exibidas com base na página atual
  useEffect(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    setPostagensExibidas(todasPostagensRecentes.slice(startIndex, endIndex));
  }, [currentPage, todasPostagensRecentes]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obtém o usuário autenticado de auth.users
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("Erro ao obter usuário:", userError)
          setUserData(null)
          setLoading(false)
          return
        }

        // Buscar dados do usuário na tabela Usuarios
        const { data, error } = await supabase
          .from("Usuarios")
          .select("id, nome, email, tipo")
          .eq("id_auth_users", user.id)
          .single()

        if (error) {
          console.error("Erro ao obter dados do usuário:", error)
          setUserData(null)
        } else {
          setUserData(data)
        }
      } catch (err) {
        console.error("Erro inesperado:", err)
        setUserData(null)
      } finally {
        setLoading(false)
      }
    }

    const fetchPostagensRecentes = async () => {
      try {
        setLoadingPosts(true)

        // Obter o usuário atual
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          console.error("Usuário não autenticado")
          setTodasPostagensRecentes([])
          setLoadingPosts(false)
          return
        }

        // Obter ID do usuário na tabela Usuarios
        const { data: userData, error: userError } = await supabase
          .from("Usuarios")
          .select("id")
          .eq("id_auth_users", user.id)
          .single()

        if (userError || !userData) {
          console.error("Erro ao obter dados do usuário:", userError)
          setTodasPostagensRecentes([])
          setLoadingPosts(false)
          return
        }

        // Buscar postagens das comunidades seguidas pelo usuário (agora busca todas)
        const { data, error } = await supabase
          .from("PostagensSeguidas")
          .select("*")
          .eq("seguidor_id", userData.id)
          .order("data_criacao", { ascending: false })

        if (error) {
          console.error("Erro ao obter postagens seguidas:", error)
          setTodasPostagensRecentes([])
        } else {
          setTodasPostagensRecentes(data);
          // Define o número total de páginas
          setTotalPages(Math.ceil(data.length / POSTS_PER_PAGE) || 1);
          // Define a primeira página de postagens
          setPostagensExibidas(data.slice(0, POSTS_PER_PAGE));
        }
      } catch (err) {
        console.error("Erro inesperado ao carregar postagens:", err)
        setTodasPostagensRecentes([])
      } finally {
        setLoadingPosts(false)
      }
    }

    fetchUserData()
    fetchPostagensRecentes()
  }, [])

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex flex-col items-center justify-center min-h-screen gap-4 bg-base-100">
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-base-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              Bem-vindo, {userData?.nome || "Usuário"}!
            </h1>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl font-bold border-b border-base-300 pb-3 mb-4">
                  Postagens Recentes
                  {todasPostagensRecentes.length > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({todasPostagensRecentes.length} postagens)
                    </span>
                  )}
                </h2>

                {loadingPosts ? (
                  <div className="flex items-center justify-center py-10">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : postagensExibidas.length > 0 ? (
                  <>
                    <div className="space-y-6">
                      {postagensExibidas.map((postagem) => (
                        <div
                          key={postagem.id}
                          className="bg-base-100 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-300"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Link
                              to={`/c/${postagem.comunidade_discriminador}`}
                              className="badge badge-primary mb-2"
                            >
                              {postagem.comunidade_nome}
                            </Link>
                            <span className="badge badge-outline">
                              {postagem.tipo}
                            </span>
                          </div>

                          <h3 className="text-xl font-semibold mb-2">
                            {postagem.titulo}
                          </h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {postagem.descricao}
                          </p>

                          <div className="flex flex-wrap items-center text-sm text-gray-500 mb-3 gap-3">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>
                                Criado em{" "}
                                {new Date(
                                  postagem.data_criacao
                                ).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            {postagem.data_atualizacao &&
                              postagem.data_atualizacao !==
                                postagem.data_criacao && (
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>
                                    Atualizado em{" "}
                                    {new Date(
                                      postagem.data_atualizacao
                                    ).toLocaleDateString("pt-BR")}
                                  </span>
                                </div>
                              )}
                            {postagem.prazo && (
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1 text-amber-500" />
                                <span className="text-amber-500 font-medium">
                                  Prazo:{" "}
                                  {new Date(postagem.prazo).toLocaleDateString(
                                    "pt-BR"
                                  )}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <span className="text-sm">
                              Por {postagem.criador_nome}
                            </span>
                            <div className="flex gap-2">
                              {postagem.candidaturas_abertas && (
                                <span className="badge badge-success">
                                  Aceita candidaturas
                                </span>
                              )}
                              <Link
                                to={`/c/${postagem.comunidade_discriminador}`}
                                className="btn btn-sm btn-primary"
                              >
                                Ver mais
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Componente de paginação */}
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      className="mt-6"
                    />
                  </>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      Nenhuma postagem recente encontrada nas comunidades que
                      você segue.
                    </p>
                    <div className="mt-4">
                      <Link to="/comunidades" className="btn btn-primary">
                        Explorar Comunidades
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card bg-base-200 shadow-lg mt-6">
              <div className="card-body">
                <h2 className="card-title text-xl font-bold border-b border-base-300 pb-3 mb-4">
                  Links Rápidos
                </h2>
                <div className="flex flex-wrap gap-3">
                  <Link to="/comunidades" className="btn btn-outline btn-sm">
                    Explorar Comunidades
                  </Link>
                  <Link
                    to="/candidaturas"
                    className="btn btn-outline btn-sm"
                  >
                    Minhas Candidaturas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Dashboard
