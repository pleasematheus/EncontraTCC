import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import supabase from "../utils/supabase"

const RedefinirSenha = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    text: string
    type: "success" | "error"
  } | null>(null)
  const [errors, setErrors] = useState({
    password: { error: false, message: "" },
    confirmPassword: { error: false, message: "" },
  })
  const navigate = useNavigate()

  useEffect(() => {
    // Verifica se o usuário chegou a esta página através de um link de redefinição
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        navigate("/solicitar-redefinicao-senha")
      }
    }

    checkSession()
  }, [navigate])

  const validateForm = () => {
    const newErrors = { ...errors }

    // Validar senha
    if (!password) {
      newErrors.password = {
        error: true,
        message: "Digite uma senha",
      }
    } else if (password.length < 6) {
      newErrors.password = {
        error: true,
        message: "A senha deve ter no mínimo 6 caracteres",
      }
    } else {
      newErrors.password = { error: false, message: "" }
    }

    // Validar confirmação de senha
    if (!confirmPassword) {
      newErrors.confirmPassword = {
        error: true,
        message: "Confirme sua senha",
      }
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = {
        error: true,
        message: "As senhas não coincidem",
      }
    } else {
      newErrors.confirmPassword = { error: false, message: "" }
    }

    setErrors(newErrors)
    return !newErrors.password.error && !newErrors.confirmPassword.error
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        throw error
      }

      setMessage({
        text: "Senha atualizada com sucesso!",
        type: "success",
      })

      // Redirecionar após alguns segundos
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error)
      setMessage({
        text: "Erro ao redefinir senha. Tente novamente.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-base-100 p-4">
      <div className="w-full max-w-md">
        <div className="card w-full shadow-xl bg-base-200">
          <div className="card-body">
            <h2 className="text-center text-2xl font-bold text-primary">
              Redefinir Senha
            </h2>

            <p className="text-center text-sm mb-4">
              Digite sua nova senha abaixo.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Nova Senha</span>
                </label>
                <input
                  type="password"
                  placeholder="Digite sua nova senha"
                  className={`input input-bordered w-full ${
                    errors.password.error ? "input-error" : ""
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {errors.password.error && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.password.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Confirme sua Nova Senha</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirme sua nova senha"
                  className={`input input-bordered w-full ${
                    errors.confirmPassword.error ? "input-error" : ""
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {errors.confirmPassword.error && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.confirmPassword.message}
                    </span>
                  </label>
                )}
              </div>
              {message && (
                <div
                  className={`alert ${
                    message.type === "success" ? "alert-success" : "alert-error"
                  } mt-4`}
                >
                  <p>{message.text}</p>
                </div>
              )}{" "}
              <button
                type="submit"
                className="btn btn-primary w-full mt-6"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Redefinir Senha
                  </>
                ) : (
                  "Redefinir Senha"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

export default RedefinirSenha
