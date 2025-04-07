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
  title?: string
}

const CommunityCards = ({
  communities,
  title = "Comunidades",
}: CommunityCardsProps) => {
  return (
    <section className="py-8 bg-base-200 border-t border-base-300">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {communities.map((community) => (
            <div
              key={community.id}
              className="card bg-base-100 shadow-md border border-base-300"
            >
              <div className="card-body">
                <h3 className="text-xl font-semibold">{community.nome}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {community.descricao}
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    <strong>Posts:</strong> {community.total_posts}
                  </p>
                  <p>
                    <strong>Usuários:</strong> {community.total_usuarios}
                  </p>
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
