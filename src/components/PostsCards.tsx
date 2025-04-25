import { useState } from "react"
import { Edit2, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import supabase from "@/utils/supabase"

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
}

interface PostCardProps {
  post: Post
  isEditable?: boolean
  communityDiscriminator?: string
  onPostUpdate?: () => void
  userType?: string | null // Tipo do usuário (Discente/Docente)
  isFollowing?: boolean // Indica se o usuário segue a comunidade
}

const PostCards = ({
  post,
  isEditable = false,
  communityDiscriminator,
  onPostUpdate,
  userType,
  isFollowing,
}: PostCardProps) => {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [titulo, setTitulo] = useState(post.titulo)
  const [descricao, setDescricao] = useState(post.descricao)
  const [tipo, setTipo] = useState(post.tipo)
  const [prazo, setPrazo] = useState(post.prazo || "")
  const [permiteCandidatura, setPermiteCandidatura] = useState(
    post.candidaturas_abertas || false
  )
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isCandidaturaLoading, setIsCandidaturaLoading] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Reset form state
    setTitulo(post.titulo)
    setDescricao(post.descricao)
    setTipo(post.tipo)
    setPrazo(post.prazo || "")
    setPermiteCandidatura(post.candidaturas_abertas || false)
    setErrorMessage("")
    setIsEditing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    try {
      // Verificar se usuário está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setErrorMessage("Usuário não autenticado")
        setIsLoading(false)
        return
      }

      // Atualizar post no Supabase
      const { error } = await supabase
        .from("Postagens")
        .update({
          titulo,
          descricao,
          tipo,
          prazo: prazo || null,
          candidaturas_abertas: permiteCandidatura,
          data_atualizacao: new Date().toISOString(),
        })
        .eq("id", post.id)

      if (error) throw error

      // Atualizar UI e sair do modo de edição
      setIsEditing(false)

      // Notificar componente pai sobre a atualização
      if (onPostUpdate) {
        onPostUpdate()
      }
    } catch (error: any) {
      console.error("Erro ao atualizar post:", error)
      setErrorMessage(`Erro ao atualizar: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para mostrar o diálogo de confirmação de exclusão
  const handleShowDeleteConfirm = () => {
    setIsDeleting(true)
  }

  // Função para cancelar a exclusão
  const handleCancelDelete = () => {
    setIsDeleting(false)
  }

  // Função para excluir a postagem
  const handleDelete = async () => {
    setIsLoading(true)
    setErrorMessage("")

    try {
      // Verificar se usuário está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setErrorMessage("Usuário não autenticado")
        setIsLoading(false)
        return
      }

      // Excluir post no Supabase
      const { error } = await supabase
        .from("Postagens")
        .delete()
        .eq("id", post.id)

      if (error) throw error

      // Notificar componente pai sobre a exclusão
      if (onPostUpdate) {
        onPostUpdate()
      }
    } catch (error: any) {
      console.error("Erro ao excluir post:", error)
      setErrorMessage(`Erro ao excluir: ${error.message}`)
      setIsDeleting(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para candidatar-se à postagem
  const handleCandidatura = async () => {
    setIsCandidaturaLoading(true)
    setErrorMessage("")

    try {
      // Verificar se usuário está autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setErrorMessage("Usuário não autenticado")
        setIsCandidaturaLoading(false)
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
        setIsCandidaturaLoading(false)
        return
      }

      // Verificar se já existe candidatura deste usuário para esta postagem
      const { data: candidaturaExistente, error: candidaturaError } =
        await supabase
          .from("Candidaturas")
          .select("id")
          .eq("id_postagem", post.id)
          .eq("id_usuario", userData.id)
          .maybeSingle()

      if (candidaturaError) {
        throw candidaturaError
      }

      if (candidaturaExistente) {
        setErrorMessage("Você já se candidatou para esta postagem")
        setIsCandidaturaLoading(false)
        return
      }

      // Criar candidatura
      const { error } = await supabase.from("Candidaturas").insert([
        {
          id_postagem: post.id,
          id_usuario: userData.id,
          data_candidatura: new Date().toISOString(),
          status: "Pendente",
        },
      ])

      if (error) throw error

      // Notificar usuário do sucesso
      alert("Candidatura realizada com sucesso!")
    } catch (error: any) {
      console.error("Erro ao candidatar-se:", error)
      setErrorMessage(`Erro ao candidatar-se: ${error.message}`)
    } finally {
      setIsCandidaturaLoading(false)
    }
  }

  // Formatar data para exibição
  const formatDate = (dateString?: string) => {
    if (!dateString) return null

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Renderizar modal de confirmação de exclusão
  if (isDeleting) {
    return (
      <div className="bg-base-200 shadow rounded p-6 hover:shadow-lg transition duration-300">
        <h3 className="text-xl font-semibold mb-4">Confirmar exclusão</h3>
        <p className="mb-6">Tem certeza que deseja excluir "{post.titulo}"?</p>

        {errorMessage && (
          <div className="alert alert-error mb-4 text-sm">
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleCancelDelete}
            className="btn btn-outline btn-sm"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-error btn-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </button>
        </div>
      </div>
    )
  }

  // Renderizar formulário de edição quando isEditing for true
  if (isEditing) {
    return (
      <div className="bg-base-200 shadow rounded p-6 hover:shadow-lg transition duration-300">
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="alert alert-error mb-4 text-sm">
              <span>{errorMessage}</span>
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
              placeholder="Digite a descrição detalhada"
              className="textarea textarea-bordered w-full h-24"
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

          <div className="form-control mb-4">
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

          <div className="form-control mb-4">
            <label className="cursor-pointer label">
              <span className="label-text">Permitir candidaturas</span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={permiteCandidatura}
                onChange={(e) => setPermiteCandidatura(e.target.checked)}
              />
            </label>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-outline btn-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Renderização normal do card quando não está em modo de edição
  return (
    <div className="bg-base-200 shadow rounded p-6 hover:shadow-lg transition duration-300">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-2xl font-semibold">{post.titulo}</h2>
        {isEditable && (
          <div className="flex gap-1">
            <button
              onClick={handleEdit}
              className="btn btn-ghost btn-sm"
              aria-label="Editar postagem"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={handleShowDeleteConfirm}
              className="btn btn-ghost btn-sm text-error"
              aria-label="Excluir postagem"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      <p className="text-gray-700 mb-4">{post.descricao}</p>
      <div className="flex justify-between items-center">
        <small className="text-gray-500">
          {formatDate(post.data_criacao)}
          {post.data_atualizacao &&
            post.data_atualizacao !== post.data_criacao && (
              <span className="ml-2">
                (Atualizado em {formatDate(post.data_atualizacao)})
              </span>
            )}
        </small>
        {post.tipo && (
          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
            {post.tipo}
          </span>
        )}
      </div>
      {post.prazo && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Prazo: </span>
          {formatDate(post.prazo)}
        </div>
      )}
      {post.candidaturas_abertas && userType === "Discente" && isFollowing && (
        <div className="mt-4">
          <button
            onClick={handleCandidatura}
            className="btn btn-primary btn-sm"
            disabled={isCandidaturaLoading}
          >
            {isCandidaturaLoading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Candidatando...
              </>
            ) : (
              "Candidatar-se"
            )}
          </button>
          {errorMessage && (
            <div className="alert alert-error mt-2 text-sm">
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PostCards
