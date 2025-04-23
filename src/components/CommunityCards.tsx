import { useState, useEffect } from "react"
import supabase from "@/utils/supabase"

interface Community {
  id: string
  nome: string
  discriminador: string
  descricao: string
  total_posts: number
  total_usuarios: number
  data_criacao: string
  data_atualizacao: string
}

interface CommunityCardsProps {
  communities: Community[]
  userId?: string // ID do usuário autenticado
}

const CommunityCards = ({ communities, userId }: CommunityCardsProps) => {
  // estado mapeando id da comunidade -> se está seguindo
  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({})

  // ao montar (ou quando mudar userId/communities), buscar follows do usuário
  useEffect(() => {
    if (!userId) return

    const fetchFollows = async () => {
      const { data, error } = await supabase
        .from("usuario_comunidade")
        .select("id_comunidade")
        .eq("id_usuario", userId)

      if (error) {
        console.error("Erro ao buscar comunidades seguidas:", error)
        return
      }

      // inicializa o map de follows
      const status: Record<string, boolean> = {}
      data.forEach((row) => {
        status[row.id_comunidade] = true
      })
      // garante que todas as comunidades tenham um valor booleano
      communities.forEach((c) => {
        if (status[c.id] === undefined) status[c.id] = false
      })

      setFollowingStatus(status)
    }

    fetchFollows()
  }, [userId, communities])

  // alterna o estado de follow e sincroniza com o Supabase
  const handleFollowToggle = async (communityId: string) => {
    if (!userId) return

    const isCurrentlyFollowing = followingStatus[communityId]

    // otimista: já inverte no UI
    setFollowingStatus((prev) => ({
      ...prev,
      [communityId]: !isCurrentlyFollowing,
    }))

    try {
      if (!isCurrentlyFollowing) {
        // insere um novo follow
        const { error } = await supabase.from("usuario_comunidade").insert({
          id_comunidade: communityId,
          id_usuario: userId,
          tipo: "membro", // ou outro valor conforme seu domínio
        })
        if (error) throw error
      } else {
        // remove o follow existente
        const { error } = await supabase
          .from("usuario_comunidade")
          .delete()
          .eq("id_usuario", userId)
          .eq("id_comunidade", communityId)
        if (error) throw error
      }
    } catch (error) {
      console.error("Erro ao atualizar follow:", error)
      // reverte em caso de falha
      setFollowingStatus((prev) => ({
        ...prev,
        [communityId]: isCurrentlyFollowing,
      }))
    }
  }

  // utilitário para ler o estado atual de follow
  const isFollowing = (communityId: string) => {
    return followingStatus[communityId] || false
  }

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
                <span className="badge badge-outline text-xs mb-2">
                  #{community.discriminador}
                </span>
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
                {userId && (
                  <div className="card-actions mt-4 flex justify-between items-center">
                    <a
                      href={`/c/${community.discriminador}`}
                      className="btn btn-outline btn-sm"
                    >
                      Ver mais
                    </a>
                    <button
                      onClick={() => handleFollowToggle(community.id)}
                      className={`btn btn-sm ${
                        isFollowing(community.id)
                          ? "btn-primary"
                          : "btn-outline btn-primary"
                      }`}
                    >
                      {isFollowing(community.id) ? "Seguindo" : "Seguir"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CommunityCards