import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { ArrowLeft } from "lucide-react"
import supabase from "../utils/supabase"

const LoginPage = () => {
  const {} = useTheme()

  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate() // Hook para redirecionamento

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

      if (error) {
        console.error("Erro ao fazer login:", error)
        setErrorMessage("Email ou senha incorretos.")
      } else {
        navigate("/dashboard") // Redireciona para a dashboard
      }
    } catch (err) {
      setErrorMessage("Ocorreu um erro inesperado. Tente novamente.")
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-base-100 p-4">
      <div className="w-full max-w-md">
        {/* Botão para voltar à tela inicial */}
        <Link to="/" className="btn btn-ghost btn-sm gap-2 mb-6 self-start">
          <ArrowLeft size={16} />
          Voltar à página inicial
        </Link>

        <div className="card w-full shadow-xl bg-base-200">
          <div className="card-body">
            <h2 className="text-center text-2xl font-bold text-primary">
              Login
            </h2>
            <form onSubmit={handleLogin}>
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
                />
              </div>
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Senha</span>
                </label>
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  className="input input-bordered w-full"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              {errorMessage && (
                <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
              )}
              <button type="submit" className="btn btn-primary w-full mt-6">
                Entrar
              </button>
            </form>
            <div className="text-center mt-4">
              <p className="text-sm">
                Não tem uma conta?{" "}
                <Link to="/cadastro" className="text-secondary">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
