-- Função para incrementar o contador de posts em uma comunidade
CREATE OR REPLACE FUNCTION public.increment_community_posts(community_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public."Comunidades"
  SET total_posts = total_posts + 1
  WHERE id = community_id;
END;
$$;

-- Função para decrementar o contador de posts em uma comunidade
CREATE OR REPLACE FUNCTION public.decrement_community_posts(community_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public."Comunidades"
  SET total_posts = GREATEST(total_posts - 1, 0) -- Evita números negativos
  WHERE id = community_id;
END;
$$;

-- Conceder permissões para funções
GRANT EXECUTE ON FUNCTION public.increment_community_posts(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_community_posts(uuid) TO authenticated;
