import { useState, useEffect } from "react"
import supabase from "@/utils/supabase"
import { UserPlus, UserMinus } from "lucide-react"

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
  // estado para controlar loading por comunidade
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>(
    {}
  )
  // manter uma cópia local das comunidades para atualizar contadores
  const [localCommunities, setLocalCommunities] = useState<Community[]>([])

  // inicializar comunidades locais
  useEffect(() => {
    setLocalCommunities(communities)
  }, [communities])

  // ao montar (ou quando mudar userId/communities), buscar follows do usuário
  useEffect(() => {
    if (!userId) return

    const fetchFollows = async () => {
      const { data, error } = await supabase
        .from("usuario_comunidade")
        .select("id_comunidade")
        .eq("id_usuario", userId)
        .eq("tipo", "seguidor") // Alterado para usar "seguidor" em vez de "membro"

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

    // Ativa loading para esta comunidade específica
    setFollowLoading((prev) => ({
      ...prev,
      [communityId]: true,
    }))

    const isCurrentlyFollowing = followingStatus[communityId]

    try {
      if (!isCurrentlyFollowing) {
        // Adicionar o usuário como seguidor
        const { error } = await supabase.from("usuario_comunidade").insert([
          {
            id_comunidade: communityId,
            id_usuario: userId,
            tipo: "seguidor", // Alterado para "seguidor" em vez de "membro"
          },
        ])
        if (error) throw error

        // Incrementar contador de usuários
        await supabase.rpc("increment_community_users", {
          community_id: communityId,
        })

        // Atualizar a UI
        setFollowingStatus((prev) => ({
          ...prev,
          [communityId]: true,
        }))

        // Atualizar contagem local de usuários
        setLocalCommunities((prev) =>
          prev.map((community) =>
            community.id === communityId
              ? { ...community, total_usuarios: community.total_usuarios + 1 }
              : community
          )
        )
      } else {
        // Remover o usuário como seguidor
        const { error } = await supabase
          .from("usuario_comunidade")
          .delete()
          .eq("id_comunidade", communityId)
          .eq("id_usuario", userId)
          .eq("tipo", "seguidor")

        if (error) throw error

        // Decrementar contador de usuários
        await supabase.rpc("decrement_community_users", {
          community_id: communityId,
        })

        // Atualizar a UI
        setFollowingStatus((prev) => ({
          ...prev,
          [communityId]: false,
        }))

        // Atualizar contagem local de usuários
        setLocalCommunities((prev) =>
          prev.map((community) =>
            community.id === communityId
              ? {
                  ...community,
                  total_usuarios: Math.max(community.total_usuarios - 1, 0),
                }
              : community
          )
        )
      }
    } catch (error) {
      console.error("Erro ao atualizar follow:", error)
    } finally {
      // Desativa loading para esta comunidade
      setFollowLoading((prev) => ({
        ...prev,
        [communityId]: false,
      }))
    }
  }

  // utilitário para ler o estado atual de follow
  const isFollowing = (communityId: string) => {
    return followingStatus[communityId] || false
  }

  // utilitário para verificar se uma comunidade está em loading
  const isLoading = (communityId: string) => {
    return followLoading[communityId] || false
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {localCommunities.map((community) => (
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
                      disabled={isLoading(community.id)}
                      className={`btn btn-sm ${
                        isFollowing(community.id)
                          ? "btn-primary"
                          : "btn-outline btn-primary"
                      } flex items-center gap-2`}
                    >
                      {isLoading(community.id) ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : isFollowing(community.id) ? (
                        <>
                          <UserMinus size={16} /> Seguindo
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} /> Seguir
                        </>
                      )}
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
