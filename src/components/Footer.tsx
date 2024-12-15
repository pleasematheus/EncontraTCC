import { useTheme } from "../hooks/useTheme"

import Logo from "@/assets/logo.png"

export default function Footer() {
  const { theme, toggleTheme } = useTheme()

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
      <label className="flex cursor-pointer gap-2">
        <span className="label-text">Claro</span>
        <input
          type="checkbox"
          value="dark"
          className="toggle theme-controller"
          checked={theme === "dark"}
          onChange={toggleTheme}
        />
        <span className="label-text">Escuro</span>
      </label>
    </footer>
  )
}