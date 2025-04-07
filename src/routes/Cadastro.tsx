import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import supabase from "@/utils/supabase"

type Role = "Discente" | "Docente"

const CadastroPage = () => {
  const {} = useTheme()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("Discente")
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      // 1. Cria o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setErrorMessage("Erro ao cadastrar: " + authError.message)
        return
      }

      const userId = authData.user?.id

      if (!userId) {
        setErrorMessage("Não foi possível obter o ID do usuário.")
        return
      }

      // 2. Insere os dados adicionais na tabela Usuarios
      // const { error: insertError } = await supabase.from("Usuarios").upsert([
      //   {
      //     id_auth_users: userId,
      //     nome,
      //     email,
      //     tipo: role,
      //     ativo: true,
      //   },
      // ])

      const { error: insertError } = await supabase.rpc("insert_usuario", {
        id_auth: userId,
        nome_input: nome,
        email_input: email,
        tipo_input: role,
      })


      if (insertError) {
        setErrorMessage("Erro ao salvar perfil: " + insertError.message)
        return
      }

      // 3. Redireciona para login
      navigate("/login")
    } catch (err: any) {
      console.error("Erro inesperado:", err)
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