import { useTheme } from "../hooks/useTheme"

const LoginPage = () => {
  const {} = useTheme()

  return (
    <main className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="card w-96 shadow-xl bg-base-200">
        <div className="card-body">
          <h2 className="text-center text-2xl font-bold text-primary">Login</h2>
          <form>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Digite seu email"
                className="input input-bordered w-full"
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
              />
            </div>
            <button className="btn btn-primary w-full mt-6">Entrar</button>
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
