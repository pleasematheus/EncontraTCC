import { useTheme } from "../hooks/useTheme"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <label className="flex cursor-pointer gap-2 items-center">
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
  )
}
