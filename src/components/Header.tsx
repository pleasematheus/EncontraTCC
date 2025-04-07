import { useTheme } from "@/hooks/useTheme"
import { useNavigate } from "react-router-dom"
import supabase from "@/utils/supabase"
import Logo from "@/assets/cocktail-logo.png"
import { useEffect, useState, useRef } from "react"

export default function Header() {
  const {} = useTheme()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const profileMenuRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState<{
    email: string | undefined
    name: string | undefined
    userId: string | undefined
  }>({ email: "", name: "", userId: "" })

  useEffect(() => {
    const getUser = async () => {
      // Obter sessão do usuário autenticado
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Usar o ID do usuário autenticado para buscar informações na tabela Usuarios
        const { data: usuarioData, error } = await supabase
          .from("Usuarios")
          .select("nome, email")
          .eq("id_auth_users", session.user.id)
          .single()

        if (error) {
          console.error("Erro ao buscar dados do usuário:", error)
          // Fallback para os dados de auth caso não encontre na tabela Usuarios
          setUser({
            email: session.user.email,
            name: session.user.user_metadata?.name || "Usuário",
            userId: session.user.id,
          })
        } else {
          // Usar os dados da tabela Usuarios
          setUser({
            email: usuarioData.email,
            name: usuarioData.nome,
            userId: session.user.id,
          })
        }
      }
    }

    getUser()
  }, [])

  useEffect(() => {
    // Fechar o menu de perfil ao clicar fora dele
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
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

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen)
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
      <div className="container mx-auto gap-2 flex items-center justify-between">
        {/* Logo - sempre visível */}
        <div className="flex-none">
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-bold"
          >
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
            className="p-2 rounded-md hover:bg-base-200 focus:outline-none btn btn-ghost"
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
              <a href="/comunidades" className="btn btn-ghost btn-sm">
                Comunidades
              </a>
            </li>
            <li>
              <a href="/candidaturas" className="btn btn-ghost btn-sm">
                Candidaturas
              </a>
            </li>
          </ul>
        </nav>

        {/* Botão de Perfil - visível em telas médias e grandes */}
        <div
          className="hidden md:flex md:flex-none ml-2 relative"
          ref={profileMenuRef}
        >
          <button
            onClick={toggleProfileMenu}
            className="flex items-center gap-2 px-3 py-1.5 font-medium transition-colors bg-base-200 rounded-full hover:bg-base-300 text-sm"
          >
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="md:hidden lg:block">{user.name}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${
                isProfileMenuOpen ? "rotate-180" : ""
              }`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {/* Menu de Perfil Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-[10px] shadow-lg bg-base-200 ring-1 ring-black ring-opacity-5 z-50">
              <div className="flex flex-col p-1 gap-2">
                <div className="px-4 py-2 text-sm text-base-content border-b border-base-300">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-base-content/70 truncate">
                    {user.email}
                  </div>
                </div>
                <a
                  href="/perfil"
                  className="px-4 py-2 text-sm hover:bg-base-300 btn btn-ghost text-left inline-block align-middle"
                >
                  Meu perfil
                </a>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-base-300 btn btn-ghost"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Mobile - aparece quando o menu está aberto em telas pequenas */}
      <div
        className={`md:hidden absolute top-16 left-0 right-0 bg-base-100 shadow-md z-50 ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="container mx-auto p-4">
          {/* Informações do usuário mobile */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-base-200 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-lg">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-base-content/70 truncate">
                {user.email}
              </div>
            </div>
          </div>

          {/* Barra de pesquisa mobile arredondada */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar TCCs, orientadores, temas..."
              className="w-full px-4 py-2 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-base-200 border-base-300 md:hidden"
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
                href="/comunidades"
                className="block py-2 px-4 hover:bg-base-200 rounded-full"
              >
                Comunidades
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
            <li>
              <a
                href="/perfil"
                className="block py-2 px-4 hover:bg-base-200 rounded-full"
              >
                Meu perfil
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