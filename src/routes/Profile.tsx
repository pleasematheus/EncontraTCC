import { useState, useEffect } from "react"
import { useTheme } from "@/hooks/useTheme"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import supabase from "@/utils/supabase"

const Profile = () => {
  const {} = useTheme()
  const [user, setUser] = useState<{
    email: string | undefined
    nome: string | undefined
    tipo: string | undefined
  }>({
    email: "",
    nome: "",
    tipo: "",
  })
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [newNome, setNewNome] = useState("")
  const [newTipo, setNewTipo] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    text: string
    type: "success" | "error"
  } | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError

        const userId = user?.id

        if (!userId) throw new Error("Usuário não autenticado")

        const { data: usuario, error: usuarioError } = await supabase
          .from("Usuarios")
          .select("nome, email, tipo")
          .eq("id_auth_users", userId)
          .single()

        if (usuarioError) throw usuarioError

        setUser({
          email: usuario?.email,
          nome: usuario?.nome,
          tipo: usuario?.tipo,
        })

        // Inicializa os campos de edição com os valores atuais
        setNewNome(usuario?.nome || "")
        setNewTipo(usuario?.tipo || "")
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const handleSaveChanges = async () => {
    try {
      setSaving(true)
      setMessage(null)

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser) throw new Error("Usuário não autenticado")

      const { error } = await supabase
        .from("Usuarios")
        .update({
          nome: newNome,
          tipo: newTipo,
        })
        .eq("id_auth_users", currentUser.id)

      if (error) throw error

      // Atualiza o estado do usuário com os novos valores
      setUser((prev) => ({
        ...prev,
        nome: newNome,
        tipo: newTipo,
      }))

      setEditMode(false)
      setMessage({ text: "Perfil atualizado com sucesso!", type: "success" })
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      setMessage({
        text: "Erro ao atualizar perfil. Tente novamente.",
        type: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  const tiposUsuario = ["Docente", "Discente"]

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center gap-2 my-3">
        {loading ? (
          <div className="flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 border-2 divide-y divide-inherit border-base-300 p-4 rounded-lg shadow-lg sm:w-1/2 w-5/6 max-w-sm my-2">
            <h1 className="text-2xl font-bold place-self-center">Perfil</h1>
            <div className="avatar placeholder pb-2 place-self-center">
              <div className="bg-neutral text-neutral-content w-24 rounded-full mt-2">
                <span className="text-3xl">
                  {user.nome?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            </div>

            {message && (
              <div
                className={`alert ${
                  message.type === "success" ? "alert-success" : "alert-error"
                } mt-2`}
              >
                <span>{message.text}</span>
              </div>
            )}

            {!editMode ? (
              <>
                <h1 className="text-left">Nome: {user.nome}</h1>
                <p>Email: {user.email}</p>
                <p>Tipo: {user.tipo}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditMode(true)}
                >
                  Editar Perfil
                </button>
              </>
            ) : (
              <>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Nome</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    className="input input-bordered w-full"
                    value={newNome}
                    onChange={(e) => setNewNome(e.target.value)}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Email (não editável)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={user.email || ""}
                    disabled
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Tipo</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={newTipo}
                    onChange={(e) => setNewTipo(e.target.value)}
                  >
                    <option value="" disabled>
                      Selecione um tipo
                    </option>
                    {tiposUsuario.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleSaveChanges}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Salvar"
                    )}
                  </button>
                  <button
                    className="btn btn-outline flex-1"
                    onClick={() => {
                      setEditMode(false)
                      setNewNome(user.nome || "")
                      setNewTipo(user.tipo || "")
                    }}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default Profile
