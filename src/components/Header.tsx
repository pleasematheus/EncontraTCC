import { useTheme } from "../hooks/useTheme"
import { useNavigate } from "react-router-dom"
import supabase from "@/utils/supabase"
import Logo from "@/assets/cocktail-logo.png"
import { useEffect, useState } from "react"

export default function Header() {
  const {} = useTheme()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [user, setUser] = useState<{
    email: string | undefined
    name: string | undefined
  }>({ email: "", name: "" })
  {user}

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUser({
          email: session.user.email,
          name: session.user.user_metadata?.name || "Usuário",
        })
      }
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Implemente a lógica de pesquisa aqui (navegando para uma página de resultados)
      navigate(`/pesquisa?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  return (
    <header className="navbar bg-base-100 shadow-sm">
      <div className="container mx-auto">
        {/* Logo - sempre visível */}
        <div className="flex-none">
          <a href="/" className="flex items-center gap-2 text-lg font-bold">
            <img className="w-10 h-10" src={Logo} alt="Logo" />
            <span className="hidden sm:inline">EncontraTCC</span>
          </a>
        </div>

        {/* Barra de pesquisa arredondada - visível em telas médias ou maiores */}
        <div className="flex-1 mx-4 hidden md:flex justify-center">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Buscar TCCs, orientadores, temas..."
              className="w-full px-4 py-2 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-base-200 border-base-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* Botão do Menu Hamburger - visível apenas em telas pequenas */}
        <div className="flex md:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-base-200 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Menu de navegação - visível em telas médias e grandes */}
        <nav className="hidden md:flex md:flex-none">
          <ul className="flex gap-2">
            <li>
              <a href="/dashboard" className="btn btn-ghost btn-sm">
                Início
              </a>
            </li>
            <li>
              <a href="/emalta" className="btn btn-ghost btn-sm break-keep">
                Em alta
              </a>
            </li>
            <li>
              <a href="/novos" className="btn btn-ghost btn-sm">
                Novos
              </a>
            </li>
            <li>
              <a href="/candidaturas" className="btn btn-ghost btn-sm">
                Candidaturas
              </a>
            </li>
          </ul>
        </nav>

        {/* Botão de Logout - visível em telas médias e grandes */}
        <div className="hidden md:flex md:flex-none ml-2">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 font-semibold text-white transition-colors bg-red-500 rounded-full hover:bg-red-600 text-sm"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Menu Mobile - aparece quando o menu está aberto em telas pequenas */}
      <div
        className={`md:hidden absolute top-16 left-0 right-0 bg-base-100 shadow-md z-50 ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="container mx-auto p-4">
          {/* Barra de pesquisa mobile arredondada */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar TCCs, orientadores, temas..."
              className="w-full px-4 py-2 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-base-200 border-base-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          <ul className="flex flex-col gap-3">
            <li>
              <a
                href="/dashboard"
                className="block py-2 px-4 hover:bg-base-200 rounded-full"
              >
                Início
              </a>
            </li>
            <li>
              <a
                href="/emalta"
                className="block py-2 px-4 hover:bg-base-200 rounded-full"
              >
                Em alta
              </a>
            </li>
            <li>
              <a
                href="/novos"
                className="block py-2 px-4 hover:bg-base-200 rounded-full"
              >
                Novos
              </a>
            </li>
            <li>
              <a
                href="/candidaturas"
                className="block py-2 px-4 hover:bg-base-200 rounded-full"
              >
                Minhas candidaturas
              </a>
            </li>
            <li className="border-t border-base-300 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-4 text-red-500 hover:bg-base-200 rounded-full"
              >
                Sair
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}