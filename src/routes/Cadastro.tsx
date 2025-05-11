import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTheme } from "@/hooks/useTheme"
import { ArrowLeft } from "lucide-react"
import supabase from "@/utils/supabase"

type Role = "Discente" | "Docente"

interface FieldError {
  error: boolean
  message: string
}

interface FormErrors {
  nome: FieldError
  email: FieldError
  password: FieldError
  confirmPassword: FieldError
}

const CadastroPage = () => {
  const {} = useTheme()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<Role>("Discente")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState({
    nome: false,
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [errors, setErrors] = useState<FormErrors>({
    nome: { error: false, message: "" },
    email: { error: false, message: "" },
    password: { error: false, message: "" },
    confirmPassword: { error: false, message: "" },
  })
  const navigate = useNavigate()

  // Função para validar o formato do email usando regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    return emailRegex.test(email)
  }

  // Função para validar o nome (mínimo 3 caracteres)
  const isValidName = (name: string): boolean => {
    return name.trim().length >= 3
  }

  // Validar formulário em tempo real quando os valores mudam
  useEffect(() => {
    validateForm()
  }, [nome, email, password, confirmPassword])

  // Função para validar o formulário inteiro
  const validateForm = () => {
    const newErrors = { ...errors }

    // Validar nome
    if (touched.nome) {
      if (!nome.trim()) {
        newErrors.nome = { error: true, message: "Nome é obrigatório" }
      } else if (!isValidName(nome)) {
        newErrors.nome = {
          error: true,
          message: "O nome deve ter no mínimo 3 caracteres",
        }
      } else {
        newErrors.nome = { error: false, message: "" }
      }
    }

    // Validar email
    if (touched.email) {
      if (!email.trim()) {
        newErrors.email = { error: true, message: "Email é obrigatório" }
      } else if (!isValidEmail(email)) {
        newErrors.email = {
          error: true,
          message: "O email deve ter um formato válido",
        }
      } else {
        newErrors.email = { error: false, message: "" }
      }
    }

    // Validar senha
    if (touched.password) {
      if (!password) {
        newErrors.password = { error: true, message: "Senha é obrigatória" }
      } else if (password.length < 6) {
        newErrors.password = {
          error: true,
          message: "A senha deve ter no mínimo 6 caracteres",
        }
      } else {
        newErrors.password = { error: false, message: "" }
      }
    }

    // Validar confirmação de senha
    if (touched.confirmPassword) {
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
    }

    setErrors(newErrors)
  }

  // Função para marcar campo como tocado
  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true })
  }

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setIsLoading(true)

    // Marcar todos os campos como tocados para exibir todos os erros
    setTouched({
      nome: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    // Validar formulário antes de enviar
    validateForm()

    // Verificar se há erros no formulário
    if (
      errors.nome.error ||
      errors.email.error ||
      errors.password.error ||
      errors.confirmPassword.error
    ) {
      setErrorMessage("Por favor, corrija os erros no formulário.")
      setIsLoading(false)
      return
    }

    try {
      // 1. Cria o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setErrorMessage("Erro ao cadastrar: " + authError.message)
        setIsLoading(false)
        return
      }

      const userId = authData.user?.id

      if (!userId) {
        setErrorMessage("Não foi possível obter o ID do usuário.")
        setIsLoading(false)
        return
      }

      // 2. Insere os dados adicionais na tabela Usuarios
      const { error: insertError } = await supabase.rpc("sp_insert_usuario", {
        id_auth: userId,
        nome_input: nome,
        email_input: email,
        tipo_input: role,
      })

      if (insertError) {
        setErrorMessage("Erro ao salvar perfil: " + insertError.message)
        setIsLoading(false)
        return
      }

      // 3. Redireciona para login
      navigate("/login")
    } catch (err: any) {
      console.error("Erro inesperado:", err)
      setErrorMessage("Erro inesperado. Tente novamente.")
    } finally {
      setIsLoading(false)
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
                  className={`input input-bordered w-full ${
                    touched.nome && errors.nome.error ? "input-error" : ""
                  }`}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onBlur={() => handleBlur("nome")}
                  required
                />
                {touched.nome && errors.nome.error && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.nome.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Digite seu email"
                  className={`input input-bordered w-full ${
                    touched.email && errors.email.error ? "input-error" : ""
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  required
                />
                {touched.email && errors.email.error && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.email.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Senha</span>
                </label>
                <input
                  type="password"
                  placeholder="Digite sua senha"
                  className={`input input-bordered w-full ${
                    touched.password && errors.password.error
                      ? "input-error"
                      : ""
                  }`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  required
                />
                {touched.password && errors.password.error && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.password.message}
                    </span>
                  </label>
                )}
              </div>
              <div className="form-control w-full mt-4">
                <label className="label">
                  <span className="label-text">Confirme sua Senha</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirme sua senha"
                  className={`input input-bordered w-full ${
                    touched.confirmPassword && errors.confirmPassword.error
                      ? "input-error"
                      : ""
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  required
                />
                {touched.confirmPassword && errors.confirmPassword.error && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.confirmPassword.message}
                    </span>
                  </label>
                )}
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
              )}              <button
                type="submit"
                className="btn btn-primary w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Cadastrar
                  </>
                ) : (
                  "Cadastrar"
                )}
              </button>
            </form>
            <div className="text-center mt-4">
              <p className="text-sm">
                Já tem uma conta?{" "}
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

export default CadastroPage
