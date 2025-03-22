import Logo from "@/assets/logo.png"
import ThemeToggle from "./ToggleTheme"

export default function Footer() {
  const getFullYear = () => {
    return new Date().getFullYear()
  }

  return (
    <footer className="footer footer-center text-primary p-10 bg-base-100 border-t-[1px] border-base-300 gap-5 relative bottom-0">
      <aside>
        <img className="w-20 h-20" src={Logo} alt="Logo" />
        <p className="font-bold">
          EncontraTCC
          <br />
          Ajudando estudantes a encontrar o TCC perfeito desde {getFullYear()}
        </p>
        <p>Copyright © {getFullYear()} - Todos os direitos reservados</p>
      </aside>
      <nav>
        <a href="#" className="btn btn-ghost">
          <i className="bi bi-caret-up-fill"></i> Voltar ao topo
        </a>
      </nav>
      <ThemeToggle />
    </footer>
  )
}
