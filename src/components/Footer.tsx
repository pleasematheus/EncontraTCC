import "../index.css"

import Logo from "@/assets/logo.png"

export default () => {
  return (
    <footer className="footer footer-center text-primary-content p-10 bg-[#FFF] border-t-[1px] border-[#EAEAEA] gap-5 relative bottom-0">
      <aside>
        <img className="w-20 h-20" src={Logo} />
        <p className="font-bold text-black">
          EncontraTCC
          <br />
          Ajudando estudantes a encontrar o TCC perfeito desde 2025
        </p>
        <p className="text-black">
          Copyright © {new Date().getFullYear()} - Todos os direitos reservados
        </p>
      </aside>
      <nav>
        <a href="#" className="btn btn-ghost text-black">
          <i className="bi bi-caret-up-fill"></i> Voltar ao topo
        </a>
      </nav>
    </footer>
  )
}
