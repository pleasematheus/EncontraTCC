-- =============================================================================
-- ORDEM DE EXECUÇÃO: 4
-- MATERIALIZED VIEWS DO SISTEMA ENCONTRATCC
-- =============================================================================
-- Dependências: 
--   EncontraTCC - Tables.sql
--   EncontraTCC - Procedures & Triggers.sql
--   EncontraTCC - Views.sql
-- Arquivo responsável por criar todas as materialized views e procedures associadas

-- =============================================================================
-- SEÇÃO 1: CONFIGURAÇÃO E CRIAÇÃO DE MATERIALIZED VIEWS
-- =============================================================================

-- IMPORTANTE: As conversões de tipo explícitas (::text, ::uuid, etc.) são essenciais para 
-- evitar o erro "structure of query does not match function result type" quando a função 
-- get_trending_posts é chamada. Não remova essas conversões!

-- 0) Remover versões antigas das views (se existirem)
/*DROP MATERIALIZED VIEW IF EXISTS trending_posts_week;
DROP MATERIALIZED VIEW IF EXISTS private.trending_posts_week;*/

-- 1) Criar schema privado para materialized views
CREATE SCHEMA IF NOT EXISTS private;

-- 2) Criar a materialized view dentro do schema private
CREATE MATERIALIZED VIEW IF NOT EXISTS private.mv_trending_posts_week AS
SELECT
  p.id::uuid,
  p.comunidade_id::uuid,
  p.titulo::text,  -- Conversão explícita para text para evitar incompatibilidade de tipo varchar(255)
  p.descricao::text,
  p.tipo::text,
  p.prazo::timestamptz,
  p.data_criacao::timestamptz,
  p.data_atualizacao::timestamptz,
  p.id_usuario_criador::uuid,
  p.candidaturas_abertas::boolean,
  COUNT(c.id)::bigint             AS candidaturas_count,
  MAX(c.data_candidatura)::timestamptz AS ultima_candidatura,
  com.nome::text    AS comunidade_nome,
  u.nome::text      AS nome_criador
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
  com.nome,  u.nome
ORDER BY
  ultima_candidatura DESC NULLS LAST,
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

-- Verificar se a extensão foi criada com sucesso
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    RAISE EXCEPTION 'A extensão pg_cron não foi instalada corretamente. Verifique se seu banco de dados possui os privilégios necessários.';
  END IF;
END $$;


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

-- 7) Dropa versões antigas da função, se existirem
DROP FUNCTION IF EXISTS public.get_trending_posts(uuid, text, integer, integer);

-- 8) RPC "getter" com filtros e paginação, referenciando explicitamente private.mv_trending_posts_week
CREATE OR REPLACE FUNCTION public.get_trending_posts(
  p_comunidade_id uuid    DEFAULT NULL,
  p_limit         integer DEFAULT 10,
  p_offset        integer DEFAULT 0
)
RETURNS TABLE (
  id                  uuid,
  comunidade_id       uuid,  titulo              text,
  descricao           text,
  tipo                text,
  prazo               timestamptz,
  data_criacao        timestamptz,
  data_atualizacao    timestamptz,
  id_usuario_criador  uuid,
  candidaturas_abertas boolean,  candidaturas_count  bigint,
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
    v_total_count  FROM private.mv_trending_posts_week t
  WHERE (p_comunidade_id IS NULL OR t.comunidade_id = p_comunidade_id)
  ORDER BY
    t.ultima_candidatura DESC NULLS LAST,
    t.candidaturas_count DESC
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_trending_posts(uuid, integer, integer) IS  'Retorna posts em tendência da materialized view private.mv_trending_posts_week com filtros e paginação';


-- 9) Conceder permissão de execução apenas a usuários autenticados
GRANT EXECUTE
  ON FUNCTION public.get_trending_posts(uuid, integer, integer)
  TO authenticated;

