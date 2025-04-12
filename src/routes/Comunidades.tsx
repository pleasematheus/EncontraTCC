import { useState, useEffect } from "react"
import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import CommunityCards from "@/components/CommunityCards"
import supabase from "@/utils/supabase"

interface Community {
  id: string
  nome: string
  descricao: string
  total_posts: number
  total_usuarios: number
  data_criacao: string
  data_atualizacao: string
}

export default function Comunidades() {
  const {} = useTheme()

  const [loading, setLoading] = useState(true)
  const [communities, setCommunities] = useState<Community[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Busca o tipo do usuário autenticado.
  useEffect(() => {
    const fetchUserType = async () => {
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
        .select("tipo")
        .eq("id_auth_users", user.id)
        .single()

      if (error) {
        console.error("Erro ao buscar tipo de usuário:", error)
      } else {
        setUserType(data?.tipo.toLowerCase())
      }
    }

    fetchUserType()
  }, [])

  // Função para buscar e atualizar a lista de comunidades.
  const getComunidades = async () => {
    const { data, error } = await supabase
      .from("Comunidades")
      .select("*")
      .order("data_criacao", { ascending: false })
      .limit(10)
    
    if (error) {
      console.error("Erro ao buscar comunidades:", error)
    } else {
      setCommunities(data as Community[])
    }
    setLoading(false)
  }


  // Carrega as comunidades quando o componente é montado.
  useEffect(() => {
    getComunidades()
  }, [])

  // Função para criar comunidade, validando o tipo e inserindo os dados corretos.
  const handleCreateCommunity = async () => {
    setSubmitting(true)

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
      setModalOpen(false)
      // Atualiza a lista de comunidades para incluir a nova.
      await getComunidades()
    }
    setSubmitting(false)
  }

  return (
    <>
      <Header />
      <main className="px-4 py-8 min-h-screen relative pb-32">
        <h1 className="text-3xl font-bold text-center mb-8">Comunidades</h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : communities.length === 0 ? (
          <p className="text-center text-gray-500 mt-12">
            Ainda não há comunidades cadastradas.
          </p>
        ) : (
          <CommunityCards communities={communities} />
        )}
      </main>

      {/* Botão fixo para criar comunidade (aparece somente para docentes) */}
      {userType === "docente" && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            className="btn btn-primary shadow-lg"
            onClick={() => setModalOpen(true)}
          >
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

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => {
                  setModalOpen(false)
                  setNome("")
                  setDescricao("")
                }}
              >
                Cancelar
              </button>
              <button
                className={`btn btn-primary ${submitting ? "loading" : ""}`}
                onClick={handleCreateCommunity}
                disabled={submitting || !nome.trim() || !descricao.trim()}
              >
                Criar
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}