import { useState, useEffect } from "react"
import "../index.css"

import Logo from "@/assets/logo.png"

export default () => {
  // Estado para armazenar o tema atual
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")

  // Efeito para aplicar o tema sempre que o estado mudar
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("theme", theme) // Salva a preferência no localStorage
  }, [theme])

  // Função para alternar entre os temas
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return (
    <footer className="footer footer-center text-primary p-10 bg-base-100 border-t-[1px] border-base-300 gap-5 relative bottom-0">
      <aside>
        <img className="w-20 h-20" src={Logo} />
        <p className="font-bold">
          EncontraTCC
          <br />
          Ajudando estudantes a encontrar o TCC perfeito desde 2025
        </p>
        <p className="">
          Copyright © {new Date().getFullYear()} - Todos os direitos reservados
        </p>
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
