-- View para consultar as postagens mais recentes com informações das comunidades e criadores
CREATE
OR REPLACE VIEW "PostagensRecentes"
WITH (security_invoker = on) AS
SELECT
  p."id",
  p."titulo",
  p."descricao",
  p."tipo",
  p."prazo",
  p."candidaturas_abertas",
  p."status",
  p."data_criacao",
  p."data_atualizacao",
  c."id" AS "comunidade_id",
  c."nome" AS "comunidade_nome",
  c."discriminador" AS "comunidade_discriminador",
  u."id" AS "criador_id",
  u."nome" AS "criador_nome",
  u."tipo" AS "criador_tipo"
FROM
  "Postagens" p
  JOIN "Comunidades" c ON p."comunidade_id" = c."id"
  JOIN "Usuarios" u ON p."id_usuario_criador" = u."id"
WHERE
  p."status" = 'Ativo'
ORDER BY
  p."data_criacao" DESC;

-- View para consultar as postagens das comunidades que o usuário segue
CREATE
OR REPLACE VIEW "PostagensSeguidas"
WITH (security_invoker = on) AS
SELECT
  p."id",
  p."titulo",
  p."descricao",
  p."tipo",
  p."prazo",
  p."candidaturas_abertas",
  p."status",
  p."data_criacao",
  p."data_atualizacao",
  c."id" AS "comunidade_id",
  c."nome" AS "comunidade_nome",
  c."discriminador" AS "comunidade_discriminador",
  u."id" AS "criador_id",
  u."nome" AS "criador_nome",
  u."tipo" AS "criador_tipo",
  uc."id_usuario" AS "seguidor_id"
FROM
  "Postagens" p
  JOIN "Comunidades" c ON p."comunidade_id" = c."id"
  JOIN "Usuarios" u ON p."id_usuario_criador" = u."id"
  JOIN "usuario_comunidade" uc ON c."id" = uc."id_comunidade"
  AND uc."tipo" = 'seguidor'
WHERE
  p."status" = 'Ativo'
ORDER BY
  p."data_criacao" DESC;