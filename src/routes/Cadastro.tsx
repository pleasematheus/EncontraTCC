import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import supabase from "@/utils/supabase"

// Tipo para os roles disponíveis
type Role = "Discente" | "Docente"

const CadastroPage = () => {
  const {} = useTheme()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("Discente") // Estado para o role selecionado
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate() // Hook para redirecionamento

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    try {
      // Cadastro do usuário com email e senha
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setErrorMessage("Ocorreu um erro ao cadastrar. Tente novamente.")
        return
      }

      // Se o cadastro foi bem-sucedido, adicionar os dados adicionais (nome e role) na tabela Usuarios
      if (authData.user) {
        const { error: profileError } = await supabase
          .from("Usuarios") // Usando a tabela Usuarios do esquema public
          .insert([
            {
              id_auth_user: authData.user.id,
              nome: nome,
              role: role,
            },
          ])

        if (profileError) {
          setErrorMessage(
            "Erro ao salvar informações de perfil. Tente novamente."
          )
          return
        }

        // Redireciona para a página de login após o cadastro bem-sucedido
        navigate("/login")
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
                required
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
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text">Tipo de Usuário</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                required
              >
                <option value="Discente">Discente</option>
                <option value="Docente">Docente</option>
              </select>
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