-- filepath: e:\SSD_3\Backup\Outros\Projetos\EncontraTCC\src\supabase\sql\EncontraTCC - Materialized Views.sql
-- =============================================================================
-- MATERIALIZED VIEWS DO SISTEMA ENCONTRATCC
-- =============================================================================

-- 0) Remover versões antigas das views (se existirem)
DROP MATERIALIZED VIEW IF EXISTS trending_posts_week;
DROP MATERIALIZED VIEW IF EXISTS private.trending_posts_week;

-- 1) Criar schema privado para materialized views
CREATE SCHEMA IF NOT EXISTS private;


-- 2) Criar a materialized view dentro do schema private
CREATE MATERIALIZED VIEW IF NOT EXISTS private.mv_trending_posts_week AS
SELECT
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
  COUNT(c.id)             AS candidaturas_count,
  MAX(c.data_candidatura) AS ultima_candidatura,
  com.nome    AS comunidade_nome,
  u.nome      AS nome_criador
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
  ultima_candidatura DESC,
  candidaturas_count DESC;


-- 3) Índices para acelerar consultas na materialized view
CREATE INDEX IF NOT EXISTS idx_mv_trending_posts_candidaturas_count
  ON private.mv_trending_posts_week(candidaturas_count DESC);

CREATE INDEX IF NOT EXISTS idx_mv_trending_posts_tipo
  ON private.mv_trending_posts_week(tipo);

CREATE INDEX IF NOT EXISTS idx_mv_trending_posts_comunidade
  ON private.mv_trending_posts_week(comunidade_id);


-- =============================================================================
-- CONFIGURAÇÃO DE ATUALIZAÇÃO AUTOMÁTICA VIA PG_CRON
-- =============================================================================

-- 4) Habilitar extensão pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;


-- 5) Procedure para dar REFRESH na materialized view
CREATE OR REPLACE PROCEDURE public.refresh_mv_trending_posts()
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW private.mv_trending_posts_week;
  RAISE NOTICE 'Materialized view private.mv_trending_posts_week atualizada em %', NOW();
END;
$$;

COMMENT ON PROCEDURE public.refresh_mv_trending_posts() IS
  'Atualiza a materialized view private.mv_trending_posts_week automaticamente via pg_cron';


-- 6) Agendar job diário à meia-noite para chamar a procedure
SELECT
  cron.schedule(
    'daily_refresh_mv_trending_posts',   -- nome do job
    '0 0 * * *',                      -- expressão cron: minuto hora dia mês dia-da-semana
    $$CALL public.refresh_mv_trending_posts();$$
  );


-- =============================================================================
-- FUNÇÃO GETTER PARA A MATERIALIZED VIEW
-- =============================================================================

-- 7) RPC "getter" com filtros e paginação, referenciando explicitamente private.mv_trending_posts_week
CREATE OR REPLACE FUNCTION public.get_trending_posts(
  p_comunidade_id uuid    DEFAULT NULL,
  p_tipo          text    DEFAULT NULL,
  p_limit         integer DEFAULT 10,
  p_offset        integer DEFAULT 0
)
RETURNS TABLE (
  id                  uuid,
  comunidade_id       uuid,
  titulo              text,
  descricao           text,
  tipo                text,
  prazo               timestamp with time zone,
  data_criacao        timestamp with time zone,
  data_atualizacao    timestamp with time zone,
  id_usuario_criador  uuid,
  candidaturas_abertas boolean,
  candidaturas_count  bigint,
  ultima_candidatura  timestamp with time zone,
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
   WHERE (p_comunidade_id IS NULL OR t.comunidade_id = p_comunidade_id)
     AND (p_tipo          IS NULL OR t.tipo           = p_tipo);

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
    AND (p_tipo          IS NULL OR t.tipo           = p_tipo)
  ORDER BY
    t.ultima_candidatura DESC,
    t.candidaturas_count DESC
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_trending_posts(uuid, text, integer, integer) IS
  'Retorna posts em tendência da materialized view private.mv_trending_posts_week com filtros e paginação';


-- 8) Conceder permissão de execução apenas a usuários autenticados
GRANT EXECUTE
  ON FUNCTION public.get_trending_posts(uuid, text, integer, integer)
  TO authenticated;

