import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import supabase from "../utils/supabase"

const CadastroPage = () => {
  const {} = useTheme()

  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate() // Hook para redirecionamento

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            name: nome,
          },
        },
      })

      if (error) {
        setErrorMessage("Ocorreu um erro ao cadastrar. Tente novamente.")
      } else {
        navigate("/dashboard")
      }
    } catch (err) {
      setErrorMessage("Erro inesperado. Tente novamente.")
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="card w-96 shadow-xl bg-base-200">
        <div className="card-body">
          <h2 className="text-center text-2xl font-bold text-primary">
            Cadastro
          </h2>
          <form onSubmit={handleCadastro}>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Nome</span>
              </label>
              <input
                type="text"
                placeholder="Digite seu nome"
                className="input input-bordered w-full"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="form-control w-full mt-4">
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
              Cadastrar
            </button>
          </form>
          <div className="text-center mt-4">
            <p className="text-sm">
              Já tem uma conta?{" "}
              <a href="/login" className="text-secondary">
                Faça login
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CadastroPage
