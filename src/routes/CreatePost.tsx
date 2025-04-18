import { useState, useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import supabase from "@/utils/supabase"

export default function CreatePost() {
  const {} = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const { discriminador } = useParams<{ discriminador: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Recebendo o ID da comunidade da navegação
  const { communityId } = location.state || {}

  // Form fields
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [tipo, setTipo] = useState("Projeto")
  const [prazo, setPrazo] = useState("")

  // Verificar se o usuário é docente
  useEffect(() => {
    const checkUserType = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          navigate("/login")
          return
        }

        // Busca informações do usuário na tabela Usuarios
        const { data, error } = await supabase
          .from("Usuarios")
          .select("tipo")
          .eq("id_auth_users", user.id)
          .single()

        if (error || data?.tipo !== "Docente") {
          navigate(`/comunidade/${discriminador}`)
        }
      } catch (error) {
        console.error("Erro ao verificar tipo de usuário:", error)
        navigate(`/comunidade/${discriminador}`)
      }
    }

    if (!communityId) {
      navigate(`/comunidade/${discriminador}`)
    } else {
      checkUserType()
    }
  }, [communityId, discriminador, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setErrorMessage("Usuário não autenticado")
        return
      }

      // Obter id do usuário a partir do id de autenticação
      const { data: userData, error: userError } = await supabase
        .from("Usuarios")
        .select("id")
        .eq("id_auth_users", user.id)
        .single()

      if (userError || !userData) {
        setErrorMessage("Erro ao obter dados do usuário")
        return
      }

      // Criar nova postagem
      const { data, error } = await supabase
        .from("Postagens")
        .insert([
          {
            comunidade_id: communityId,
            titulo,
            descricao,
            tipo,
            prazo: prazo || null,
            status: "Ativo",
            data_criacao: new Date(),
            id_usuario_criador: userData.id,
          },
        ])
        .select()


      if (error) {
        console.error("Erro ao criar postagem:", error)
        setErrorMessage(`Erro ao criar postagem: ${error.message}`)
      } else {
        setSuccessMessage("Postagem criada com sucesso!")
        setTimeout(() => {
          navigate(`/comunidade/${discriminador}`)
        }, 2000)
      }
    } catch (error: any) {
      console.error("Erro inesperado:", error)
      setErrorMessage(`Ocorreu um erro inesperado: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-base-100 py-8">
        <div className="max-w-screen-md mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-6">Nova Postagem</h1>

          <form
            onSubmit={handleSubmit}
            className="bg-base-200 p-6 rounded-lg shadow-md"
          >
            {errorMessage && (
              <div className="alert alert-error mb-4">
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success mb-4">
                <span>{successMessage}</span>
              </div>
            )}

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Título</span>
              </label>
              <input
                type="text"
                placeholder="Digite o título da postagem"
                className="input input-bordered w-full"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                minLength={3}
              />
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Descrição</span>
              </label>
              <textarea
                placeholder="Digite a descrição detalhada da postagem"
                className="textarea textarea-bordered w-full h-32"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Tipo</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
              >
                <option value="Projeto">Projeto</option>
                <option value="TCC">TCC</option>
                <option value="Pesquisa">Pesquisa</option>
                <option value="Monitoria">Monitoria</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text">Prazo (opcional)</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate(`/comunidade/${discriminador}`)}
                className="btn btn-outline"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Criando...
                  </>
                ) : (
                  "Criar Postagem"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
