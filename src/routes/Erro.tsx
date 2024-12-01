import { Link } from "react-router-dom"

export default function Error404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl font-semibold mb-4">
        Ops! A página que você está procurando não foi encontrada.
      </p>
      <p className="text-lg text-muted mb-8">
        Verifique o endereço ou volte para a página inicial.
      </p>
      <Link to="/" className="btn btn-primary">
        Voltar para a Home
      </Link>
      <div className="mt-8 w-full max-w-sm">
        <img
          src="https://cdn-icons-png.flaticon.com/512/6180/6180707.png"
          alt="Ilustração de erro 404"
          className="w-full object-cover"
        />
      </div>
    </div>
  )
}