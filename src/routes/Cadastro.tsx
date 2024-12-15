import { useTheme } from "../hooks/useTheme"

const CadastroPage = () => {
  const {} = useTheme()

  return (
    <main className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="card w-96 shadow-xl bg-base-200">
        <div className="card-body">
          <h2 className="text-center text-2xl font-bold text-primary">
            Cadastro
          </h2>
          <form>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Nome</span>
              </label>
              <input
                type="text"
                placeholder="Digite seu nome"
                className="input input-bordered w-full"
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
            <button className="btn btn-primary w-full mt-6">Cadastrar</button>
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
