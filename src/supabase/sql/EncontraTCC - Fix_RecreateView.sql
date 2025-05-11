-- =============================================================================
-- SCRIPT ALTERNATIVO PARA CORREÇÃO DO ERRO DE ESTRUTURA - RECRIAR VIEW
-- =============================================================================
-- Data: 11/05/2024
-- Objetivo: Resolver definitivamente o erro "structure of query does not match function result type"
-- Abordagem: Recriar a view materializada com tipos explícitos e a função correspondente

-- 1) Remover todas as versões existentes da função e view para evitar conflitos
DROP FUNCTION IF EXISTS public.get_trending_posts(uuid, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_trending_posts(uuid, integer, integer);
DROP MATERIALIZED VIEW IF EXISTS private.mv_trending_posts_week;

-- 2) Recriar a view materializada com tipos explícitos
CREATE MATERIALIZED VIEW private.mv_trending_posts_week AS
SELECT
  p.id::uuid,
  p.comunidade_id::uuid,
  p.titulo::text,  -- Conversão explícita para text
  p.descricao::text,
  p.tipo::text,
  p.prazo::timestamptz,
  p.data_criacao::timestamptz,
  p.data_atualizacao::timestamptz,
  p.id_usuario_criador::uuid,
  p.candidaturas_abertas::boolean,
  COUNT(c.id)::bigint AS candidaturas_count,
  MAX(c.data_candidatura)::timestamptz AS ultima_candidatura,
  com.nome::text AS comunidade_nome,
  u.nome::text AS nome_criador
FROM
  "Postagens" p
  LEFT JOIN "Candidaturas" c
    ON p.id = c.postagem_id
  LEFT JOIN "Comunidades" com
    ON p.comunidade_id = com.id
  LEFT JOIN "Usuarios" u
    ON p.id_usuario_criador = u.id
WHERE
  p.candidaturas_abertas = true
GROUP BY
  p.id,
  p.comunidade_id,
  p.titulo,
  p.descricao,
  p.tipo,
  p.prazo,
  p.data_criacao,
  p.data_atualizacao,
  p.id_usuario_criador,
  p.candidaturas_abertas,
  com.nome,
  u.nome
ORDER BY
  MAX(c.data_candidatura) DESC NULLS LAST,
  COUNT(c.id) DESC;

-- 3) Criar índices novamente
CREATE INDEX IF NOT EXISTS idx_mv_trending_posts_candidaturas_count
  ON private.mv_trending_posts_week(candidaturas_count DESC);

CREATE INDEX IF NOT EXISTS idx_mv_trending_posts_tipo
  ON private.mv_trending_posts_week(tipo);

CREATE INDEX IF NOT EXISTS idx_mv_trending_posts_comunidade
  ON private.mv_trending_posts_week(comunidade_id);

-- 4) Inspecionar a estrutura da view recriada
DO $$
DECLARE
    col_info RECORD;
BEGIN
    RAISE NOTICE 'Estrutura da view materializada recriada:';
    FOR col_info IN (
        SELECT column_name, data_type, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'private' AND table_name = 'mv_trending_posts_week'
        ORDER BY ordinal_position
    ) LOOP
        RAISE NOTICE '% - % (%)', col_info.column_name, col_info.data_type, col_info.udt_name;
    END LOOP;
END $$;

-- 5) Recriar a função com os tipos corretos
CREATE OR REPLACE FUNCTION public.get_trending_posts(
  p_comunidade_id uuid    DEFAULT NULL,
  p_limit         integer DEFAULT 10,
  p_offset        integer DEFAULT 0
)
RETURNS TABLE (
  id                  uuid,
  comunidade_id       uuid,
  titulo              text,
  descricao           text,
  tipo                text,
  prazo               timestamptz,
  data_criacao        timestamptz,
  data_atualizacao    timestamptz,
  id_usuario_criador  uuid,
  candidaturas_abertas boolean,
  candidaturas_count  bigint,
  ultima_candidatura  timestamptz,
  comunidade_nome     text,
  nome_criador        text,
  total_count         bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_count bigint;
BEGIN
  -- calcula o total de linhas para paginação
  SELECT COUNT(*) INTO v_total_count
    FROM private.mv_trending_posts_week t
   WHERE (p_comunidade_id IS NULL OR t.comunidade_id = p_comunidade_id);

  -- retorna os dados paginados + total_count em cada linha
  RETURN QUERY
  SELECT
    t.id,
    t.comunidade_id,
    t.titulo,
    t.descricao,
    t.tipo,
    t.prazo,
    t.data_criacao,
    t.data_atualizacao,
    t.id_usuario_criador,
    t.candidaturas_abertas,
    t.candidaturas_count,
    t.ultima_candidatura,
    t.comunidade_nome,
    t.nome_criador,
    v_total_count
  FROM private.mv_trending_posts_week t
  WHERE (p_comunidade_id IS NULL OR t.comunidade_id = p_comunidade_id)
  ORDER BY
    t.ultima_candidatura DESC NULLS LAST,
    t.candidaturas_count DESC
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$;

-- 6) Adicionar comentário e conceder permissões
COMMENT ON FUNCTION public.get_trending_posts(uuid, integer, integer) IS
  'Retorna posts em tendência da materialized view private.mv_trending_posts_week com filtros e paginação';

GRANT EXECUTE
  ON FUNCTION public.get_trending_posts(uuid, integer, integer)
  TO authenticated;

-- 7) Testar a função
DO $$
BEGIN
  RAISE NOTICE 'Tentando executar uma consulta de teste...';
  BEGIN
    PERFORM * FROM public.get_trending_posts(NULL, 1, 0) LIMIT 0;
    RAISE NOTICE 'SUCESSO: A função foi executada sem erros!';
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'ERRO ao testar a função: %', SQLERRM;
  END;
END $$;
