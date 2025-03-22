"use client"

import DemandCards from "@/components/DemandCards"
import Footer from "@/components/Footer"
import Hero from "@/components/Hero"

export default function Home() {
  // Dados dos cards definidos no componente pai
  const demandsData = [
    {
      id: 1,
      title: "Sistema de Gestão Escolar",
      institution: "Universidade Federal de Nova Esperança",
      description:
        "Criação de um sistema web para gerenciar alunos, professores e turmas.",
      technologies: ["React", "Node.js"],
    },
    {
      id: 2,
      title: "App para Controle de Estoque",
      institution: "Universidade Estadual de Monte Verde",
      description:
        "Desenvolvimento de um app para pequenos comércios gerenciarem estoques.",
      technologies: ["Vue.js", "Laravel"],
    },
    {
      id: 3,
      title: "Plataforma de Cursos Online",
      institution: "Universidade Online de Horizonte Azul",
      description:
        "Criação de uma plataforma para disponibilização de cursos e avaliações.",
      technologies: ["Angular", "Firebase"],
    },
  ]

  return (
    <main>
      <Hero />
      <DemandCards demands={demandsData} title="Exemplo de demandas" />
      <Footer />
    </main>
  )
}