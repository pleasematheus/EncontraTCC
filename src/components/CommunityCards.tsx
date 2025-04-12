interface Community {
  id: string
  nome: string
  descricao: string
  total_posts: number
  total_usuarios: number
  data_criacao: string
  data_atualizacao: string
}

interface CommunityCardsProps {
  communities: Community[]
}

const CommunityCards = ({ communities }: CommunityCardsProps) => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <div
              key={community.id}
              className="card bg-card shadow-xl border border-base-300 transition-transform duration-300 hover:scale-105"
            >
              <div className="card-body">
                <h3 className="card-title text-xl font-bold text-card-foreground">
                  {community.nome}
                </h3>
                <p className="text-base text-gray-700 dark:text-gray-300 mt-2">
                  {community.descricao}
                </p>
                <div className="mt-4 flex justify-between text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Posts:</span>{" "}
                      {community.total_posts}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Usuários:</span>{" "}
                      {community.total_usuarios}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Criada:</span>{" "}
                      {new Date(community.data_criacao).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Atualizada:</span>{" "}
                      {new Date(
                        community.data_atualizacao
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="card-actions mt-4">
                  <button className="btn btn-outline btn-sm">Ver mais</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CommunityCards