import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import supabase from "../utils/supabase"

const SolicitarRedefinicaoSenha = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    text: string
    type: "success" | "error"
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (error) {
        throw error
      }

      setMessage({
        text: "Enviamos um link para redefinição de senha no seu email.",
        type: "success",
      })
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error)
      setMessage({
        text: "Erro ao solicitar redefinição de senha. Verifique seu email e tente novamente.",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-base-100 p-4">
      <div className="w-full max-w-md">
        {/* Botão para voltar à tela inicial */}
        <Link
          to="/login"
          className="btn btn-ghost btn-sm gap-2 mb-6 self-start"
        >
          <ArrowLeft size={16} />
          Voltar ao login
        </Link>

        <div className="card w-full shadow-xl bg-base-200">
          <div className="card-body">
            <h2 className="text-center text-2xl font-bold text-primary">
              Recuperar Senha
            </h2>

            <p className="text-center text-sm mb-4">
              Digite seu email para receber um link de redefinição de senha.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Digite seu email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
                    Recuperar Senha
                  </>
                ) : (
                  "Recuperar Senha"
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm">
                Lembrou sua senha?{" "}
                <Link to="/login" className="text-secondary">
                  Faça login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default SolicitarRedefinicaoSenha
