-- Materialized view para armazenar as postagens com mais candidaturas da semana atual
CREATE MATERIALIZED VIEW IF NOT EXISTS trending_posts_week AS
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
  COUNT(c.id) AS candidaturas_count,
  com.nome AS comunidade_nome,
  u.nome AS nome_criador
FROM
  "Postagens" p
  LEFT JOIN "Candidaturas" c ON p.id = c.postagem_id
  LEFT JOIN "Comunidades" com ON p.comunidade_id = com.id
  LEFT JOIN "Usuarios" u ON p.id_usuario_criador = u.id
WHERE
  p.candidaturas_abertas = true
  AND c.data_candidatura >= (CURRENT_DATE - INTERVAL '7 days')
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
  candidaturas_count DESC;

-- Índice para melhorar a performance de consultas por número de candidaturas
CREATE INDEX IF NOT EXISTS idx_trending_posts_candidaturas_count ON trending_posts_week (candidaturas_count DESC);

-- Índice para melhorar a performance de consultas por tipo de post
CREATE INDEX IF NOT EXISTS idx_trending_posts_tipo ON trending_posts_week (tipo);

-- Índice para melhorar a performance de consultas por comunidade
CREATE INDEX IF NOT EXISTS idx_trending_posts_comunidade ON trending_posts_week (comunidade_id);