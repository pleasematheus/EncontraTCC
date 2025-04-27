import { Link } from "react-router-dom";
import { ArrowLeft, Globe, Book, Users, Award, BookOpen, PenTool } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StaggeredFadeIn from "@/components/StaggeredFadeIn";

const SaibaMais = () => {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 min-h-screen">
        <Link
          to="/"
          className="btn btn-ghost btn-sm gap-2 mb-4 flex items-center w-fit"
        >
          <ArrowLeft size={16} />
          Voltar à página inicial
        </Link>

        <div className="prose prose-lg max-w-none mb-16">
          <h1 className="text-4xl font-bold text-center mb-8">
            Sobre o EncontraTCC
          </h1>

          <div className="bg-base-200 p-8 rounded-lg shadow-lg mb-12">
            <h2 className="flex items-center gap-2">
              <Globe className="text-primary" /> Nossa Missão
            </h2>
            <p>
              O EncontraTCC é uma plataforma desenvolvida para conectar
              estudantes em busca de orientação para seus Trabalhos de Conclusão
              de Curso (TCCs) com professores e pesquisadores que possuem
              projetos e áreas de interesse compatíveis. Nossa missão é
              facilitar o processo de encontro entre alunos e orientadores,
              tornando essa etapa crucial da vida acadêmica mais eficiente e
              proveitosa para ambas as partes.
            </p>

            <h2 className="flex items-center gap-2 mt-10">
              <Book className="text-primary" /> Como Funciona
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-xl">Para Estudantes</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Crie uma conta como Discente</li>
                    <li>Explore comunidades acadêmicas</li>
                    <li>Siga comunidades de seu interesse</li>
                    <li>Visualize projetos e oportunidades</li>
                    <li>Candidate-se a projetos compatíveis com seu perfil</li>
                    <li>Acompanhe o status de suas candidaturas</li>
                  </ul>
                </div>
              </div>

              <div className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title text-xl">Para Professores</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Crie uma conta como Docente</li>
                    <li>
                      Crie comunidades relacionadas à sua área de pesquisa
                    </li>
                    <li>Publique projetos, temas de TCCs e oportunidades</li>
                    <li>Receba candidaturas de estudantes interessados</li>
                    <li>Avalie e responda às candidaturas</li>
                    <li>Gerencie seus projetos e orientandos</li>
                  </ul>
                </div>
              </div>
            </div>

            <h2 className="flex items-center gap-2 mt-10">
              <Award className="text-primary" /> Benefícios
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-lg">Economia de Tempo</h3>
                  <p>
                    Processo mais eficiente de busca e seleção, economizando
                    tempo tanto para estudantes quanto para orientadores.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-lg">Melhor Compatibilidade</h3>
                  <p>
                    Encontre projetos e orientadores que realmente combinam com
                    seus interesses e habilidades.
                  </p>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-lg">Visibilidade</h3>
                  <p>
                    Professores podem dar maior visibilidade aos seus projetos
                    de pesquisa e linhas de trabalho.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="flex items-center gap-2 mt-10">
              <Users className="text-primary" /> Nossa Equipe
            </h2>
            <p>
              O EncontraTCC foi desenvolvido como parte de um projeto de
              Trabalho de Conclusão de Curso, com o objetivo principal de
              melhorar a experiência acadêmica e tornar mais acessível e
              eficiente o processo de desenvolvimento de Trabalhos de Conclusão
              de Curso (TCC). A plataforma atua como uma ponte entre
              universidades e estudantes, permitindo que instituições publiquem
              demandas reais de projetos acadêmicos e que alunos encontrem
              oportunidades alinhadas aos seus interesses e áreas de estudo.
              Além de conectar estudantes e universidades, o EncontraTCC também
              busca promover a inovação, o aprendizado prático e o
              fortalecimento das relações entre a academia e o mercado. Através
              de uma interface intuitiva e funcionalidades pensadas para a
              realidade universitária, o sistema incentiva o desenvolvimento de
              TCCs mais aplicados, relevantes e conectados às necessidades do
              mundo real, contribuindo para uma formação acadêmica mais sólida e
              para a construção de carreiras de sucesso.
            </p>

            <h2 className="flex items-center gap-2 mt-10">
              <BookOpen className="text-primary" /> Tipos de Projetos
            </h2>
            <p>
              Nossa plataforma abrange diversos tipos de projetos acadêmicos,
              incluindo:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-base-100 p-4 rounded-md shadow-sm">
                <h3 className="font-semibold">Projetos de Pesquisa</h3>
                <p className="text-sm">
                  Iniciação científica, pesquisas em andamento e novos campos de
                  investigação.
                </p>
              </div>
              <div className="bg-base-100 p-4 rounded-md shadow-sm">
                <h3 className="font-semibold">
                  Trabalhos de Conclusão de Curso
                </h3>
                <p className="text-sm">
                  Orientação para TCCs, monografias e projetos finais de
                  graduação.
                </p>
              </div>
              <div className="bg-base-100 p-4 rounded-md shadow-sm">
                <h3 className="font-semibold">Projetos de Extensão</h3>
                <p className="text-sm">
                  Iniciativas que conectam a universidade com a comunidade
                  externa.
                </p>
              </div>
              <div className="bg-base-100 p-4 rounded-md shadow-sm">
                <h3 className="font-semibold">Monitorias e Tutorias</h3>
                <p className="text-sm">
                  Oportunidades para estudantes apoiarem o ensino e
                  aprendizagem.
                </p>
              </div>
            </div>

            <h2 className="flex items-center gap-2 mt-10">
              <PenTool className="text-primary" /> Comece Agora
            </h2>
            <p>
              Pronto para encontrar o orientador ideal ou os melhores alunos
              para seu projeto de pesquisa? Junte-se ao EncontraTCC hoje mesmo e
              transforme a maneira como os trabalhos acadêmicos são
              desenvolvidos!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/cadastro" className="btn btn-primary">
                Criar uma conta
              </Link>
              <Link to="/login" className="btn btn-outline">
                Já tenho uma conta
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
};

export default SaibaMais;