const DemandCards = () => {
  return (
    <div className="py-8 bg-base-200 border-t-[1px] border-base-300">
      <h2 className="text-center text-2xl font-bold mb-6">Exemplo de demandas</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {/* Card 1 */}
        <div className="card w-80 bg-base-100 shadow-xl border border-gray-200">
          <div className="card-body">
            <h3 className="card-title text-xl font-semibold">
              Sistema de Gestão Escolar
            </h3>
            <p className="text-gray-600">
              Universidade Federal de Nova Esperança
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Criação de um sistema web para gerenciar alunos, professores e
              turmas.
            </p>
            <div className="badge badge-primary mt-4">React</div>
            <div className="badge badge-secondary mt-4">Node.js</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="card w-80 bg-base-100 shadow-xl border border-gray-200">
          <div className="card-body">
            <h3 className="card-title text-xl font-semibold">
              App para Controle de Estoque
            </h3>
            <p className="text-gray-600">
              Universidade Estadual de Monte Verde
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Desenvolvimento de um app para pequenos comércios gerenciarem
              estoques.
            </p>
            <div className="badge badge-primary mt-4">Vue.js</div>
            <div className="badge badge-secondary mt-4">Laravel</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="card w-80 bg-base-100 shadow-xl border border-gray-200">
          <div className="card-body">
            <h3 className="card-title text-xl font-semibold">
              Plataforma de Cursos Online
            </h3>
            <p className="text-gray-600">
              Universidade Online de Horizonte Azul
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Criação de uma plataforma para disponibilização de cursos e
              avaliações.
            </p>
            <div className="badge badge-primary mt-4">Angular</div>
            <div className="badge badge-secondary mt-4">Firebase</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemandCards