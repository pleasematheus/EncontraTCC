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
  const [changePasswordMode, setChangePasswordMode] = useState(false)
  const [newNome, setNewNome] = useState("")
  const [newTipo, setNewTipo] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState<{
    text: string
    type: "success" | "error"
  } | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

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

  const handleChangePassword = async () => {
    try {
      setChangingPassword(true)
      setPasswordError(null)
      setMessage(null)

      // Validar as senhas
      if (newPassword.length < 6) {
        setPasswordError("A nova senha deve ter pelo menos 6 caracteres")
        return
      }

      if (newPassword !== confirmPassword) {
        setPasswordError("As senhas não coincidem")
        return
      }

      // Verificar a senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: currentPassword,
      })

      if (signInError) {
        setPasswordError("Senha atual incorreta")
        return
      }

      // Atualizar a senha
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      // Limpar os campos
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setChangePasswordMode(false)
      setMessage({ text: "Senha alterada com sucesso!", type: "success" })
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      setPasswordError("Erro ao alterar senha. Tente novamente.")
    } finally {
      setChangingPassword(false)
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
            </div>{" "}
            {message && (
              <div
                className={`alert ${
                  message.type === "success" ? "alert-success" : "alert-error"
                } mt-2`}
              >
                <span>{message.text}</span>
              </div>
            )}
            {!editMode && !changePasswordMode ? (
              <>
                <h1 className="text-left">Nome: {user.nome}</h1>
                <p>Email: {user.email}</p>
                <p>Tipo: {user.tipo}</p>
                <div className="flex flex-col gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setEditMode(true)
                      setChangePasswordMode(false)
                    }}
                  >
                    Editar Perfil
                  </button>
                  <button
                    className="btn btn-outline btn-primary"
                    onClick={() => {
                      setChangePasswordMode(true)
                      setEditMode(false)
                    }}
                  >
                    Alterar Senha
                  </button>
                </div>
              </>
            ) : changePasswordMode ? (
              <>
                <h2 className="text-xl font-semibold pt-2">Alterar Senha</h2>

                {passwordError && (
                  <div className="alert alert-error mt-2">
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Senha Atual</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Digite sua senha atual"
                    className="input input-bordered w-full"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Nova Senha</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Digite sua nova senha"
                    className="input input-bordered w-full"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Confirme a Nova Senha</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Confirme sua nova senha"
                    className="input input-bordered w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Salvar Nova Senha
                      </>
                    ) : (
                      "Salvar Nova Senha"
                    )}
                  </button>
                  <button
                    className="btn btn-outline flex-1"
                    onClick={() => {
                      setChangePasswordMode(false)
                      setCurrentPassword("")
                      setNewPassword("")
                      setConfirmPassword("")
                      setPasswordError(null)
                    }}
                    disabled={changingPassword}
                  >
                    Cancelar
                  </button>
                </div>
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

                <div className="flex gap-2">                  <button
                    className="btn btn-primary flex-1"
                    onClick={handleSaveChanges}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="loading loading-spinner loading-sm mr-2"></span>
                        Salvar
                      </>
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
                    {" "}
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
