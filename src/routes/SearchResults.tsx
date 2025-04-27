import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import supabase from "@/utils/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCards from "@/components/PostsCards";
import CommunityCards from "@/components/CommunityCards";
import Pagination from "@/components/Pagination";
import { motion } from "framer-motion";

// Definição de tipos para os resultados
type Post = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  comunidade_id: string;
  data_criacao: string;
  data_atualizacao?: string;
  candidaturas_abertas?: boolean;
  prazo?: string;
};

type Community = {
  id: string;
  nome: string;
  descricao: string;
  discriminador: string;
  data_criacao: string;
  data_atualizacao: string;
  total_posts: number;
  total_usuarios: number;
};

const ITEMS_PER_PAGE = 6; // Número de itens por página

export default function SearchResults() {
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get("q") || "";
  
  const [isLoading, setIsLoading] = useState(true);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [activeTab, setActiveTab] = useState<"posts" | "communities">("posts");
  const [userId, setUserId] = useState<string | undefined>();
  
  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState({ posts: 1, communities: 1 });

  // Posts e comunidades paginados
  const [paginatedPosts, setPaginatedPosts] = useState<Post[]>([]);
  const [paginatedCommunities, setPaginatedCommunities] = useState<Community[]>([]);

  useEffect(() => {
    // Resetar a página quando trocar de aba
    setCurrentPage(1);
  }, [activeTab]);

  useEffect(() => {
    // Implementa a paginação dos resultados atuais
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    if (activeTab === "posts") {
      setPaginatedPosts(allPosts.slice(startIndex, endIndex));
    } else {
      setPaginatedCommunities(allCommunities.slice(startIndex, endIndex));
    }
  }, [currentPage, activeTab, allPosts, allCommunities]);

  // Calcula o número total de páginas quando os dados mudam
  useEffect(() => {
    setTotalPages({
      posts: Math.ceil(allPosts.length / ITEMS_PER_PAGE) || 1,
      communities: Math.ceil(allCommunities.length / ITEMS_PER_PAGE) || 1
    });
  }, [allPosts, allCommunities]);

  useEffect(() => {
    // Buscar o ID do usuário autenticado
    const fetchUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from("Usuarios")
          .select("id")
          .eq("id_auth_users", user.id)
          .single();
          
        if (userData) {
          setUserId(userData.id);
        }
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      
      try {
        // Buscar posts que correspondem à consulta no título ou descrição
        const { data: postsData, error: postsError } = await supabase
          .from("Postagens")
          .select("*")
          .or(`titulo.ilike.%${searchQuery}%,descricao.ilike.%${searchQuery}%`)
          .order("data_criacao", { ascending: false });

        if (postsError) {
          console.error("Erro ao buscar postagens:", postsError);
        } else {
          setAllPosts(postsData || []);
          // Inicializa com a primeira página
          setPaginatedPosts((postsData || []).slice(0, ITEMS_PER_PAGE));
        }

        // Buscar comunidades que correspondem à consulta no nome ou descrição
        const { data: communitiesData, error: communitiesError } = await supabase
          .from("Comunidades")
          .select("*")
          .or(`nome.ilike.%${searchQuery}%,descricao.ilike.%${searchQuery}%`)
          .order("data_criacao", { ascending: false });

        if (communitiesError) {
          console.error("Erro ao buscar comunidades:", communitiesError);
        } else {
          setAllCommunities(communitiesData || []);
          // Inicializa com a primeira página
          setPaginatedCommunities((communitiesData || []).slice(0, ITEMS_PER_PAGE));
        }
      } catch (error) {
        console.error("Erro ao realizar busca:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchQuery) {
      fetchSearchResults();
    } else {
      setAllPosts([]);
      setAllCommunities([]);
      setPaginatedPosts([]);
      setPaginatedCommunities([]);
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Função para trocar de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Efeito de animação para itens da lista
  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Resultados da pesquisa para: <span className="text-primary">"{searchQuery}"</span>
          </h1>
          <p className="text-base-content/70">
            Encontramos {allPosts.length} postagens e {allCommunities.length} comunidades
          </p>
        </section>

        {/* Tabs de navegação */}
        <div className="tabs tabs-boxed mb-6 inline-flex">
          <a 
            className={`tab ${activeTab === "posts" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            Postagens ({allPosts.length})
          </a>
          <a 
            className={`tab ${activeTab === "communities" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("communities")}
          >
            Comunidades ({allCommunities.length})
          </a>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <>
            {/* Resultados de Postagens */}
            {activeTab === "posts" && (
              <div>
                {paginatedPosts.length > 0 ? (
                  <>
                    <motion.div 
                      className="grid grid-cols-1 gap-6"
                      variants={staggerVariants}
                      initial="hidden"
                      animate="visible"
                      key={`posts-page-${currentPage}`}
                    >
                      {paginatedPosts.map((post) => (
                        <motion.div key={post.id} variants={itemVariants}>
                          <PostCards post={post} />
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    {/* Paginação para posts */}
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages.posts}
                      onPageChange={handlePageChange}
                    />
                  </>
                ) : (
                  <div className="text-center py-12 bg-base-200 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Nenhuma postagem encontrada</h3>
                    <p className="text-base-content/70">Tente usar termos diferentes na sua pesquisa</p>
                  </div>
                )}
              </div>
            )}

            {/* Resultados de Comunidades */}
            {activeTab === "communities" && (
              <div>
                {paginatedCommunities.length > 0 ? (
                  <>
                    <CommunityCards communities={paginatedCommunities} userId={userId} />
                    
                    {/* Paginação para comunidades */}
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages.communities}
                      onPageChange={handlePageChange}
                    />
                  </>
                ) : (
                  <div className="text-center py-12 bg-base-200 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Nenhuma comunidade encontrada</h3>
                    <p className="text-base-content/70">Tente usar termos diferentes na sua pesquisa</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}