import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

const LoginPage = () => {
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
        setErrorMessage("Email ou senha incorretos.")
      } else {
        navigate("/dashboard") // Redireciona para a dashboard
      }
    } catch (err) {
      setErrorMessage("Ocorreu um erro inesperado. Tente novamente.")
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="card w-96 shadow-xl bg-base-200">
        <div className="card-body">
          <h2 className="text-center text-2xl font-bold text-primary">Login</h2>
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
              <a href="/cadastro" className="text-secondary">
                Cadastre-se
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default LoginPage