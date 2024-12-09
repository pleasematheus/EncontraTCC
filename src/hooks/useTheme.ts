import { useEffect, useState } from "react"

export function useTheme() {
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

  return { theme, toggleTheme }
}