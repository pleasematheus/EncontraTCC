-- Permitir leitura pública dos dados
CREATE POLICY "Usuarios_Read_Public" ON public."Usuarios" FOR
SELECT
  TO authenticated USING (true);

-- Permitir que os usuários vejam apenas seus próprios dados
CREATE POLICY "Allow users to read their own information" ON public."Usuarios" FOR
SELECT
  TO authenticated USING (
    (
      select
        auth.uid ()
    ) = id_auth_users
  );

-- Permitir que os usuários insiram dados
CREATE POLICY "Allow users to insert their own profile" ON public."Usuarios" FOR INSERT TO authenticated
WITH
  CHECK (auth.uid () IS NOT NULL);

-- Permitir que os usuários atualizem seus próprios dados
CREATE POLICY "Allow users to update their own profile" ON public."Usuarios" FOR
UPDATE TO authenticated USING (id_auth_users = auth.uid ());

/***Comunidades***/
-- Permitir leitura pública dos dados
CREATE POLICY "Comunidades_Read_Public" ON "Comunidades" FOR
SELECT
  USING (true);

-- Permitir que apenas usuários autenticados criem comunidades
CREATE POLICY "Comunidades_Insert_Authenticated" ON "Comunidades" FOR INSERT
WITH
  CHECK (
    EXISTS (
      SELECT
        1
      FROM
        "Usuarios"
      WHERE
        id = id_usuario_criador
        AND id_auth_users = auth.uid ()
        AND LOWER(tipo) = 'docente'
    )
  );

-- Permitir que o criador da comunidade atualize os dados
CREATE POLICY "Comunidades_Update_Owner" ON "Comunidades" FOR
UPDATE USING (
  auth.uid () = (
    SELECT
      id_auth_users
    FROM
      "Usuarios"
    WHERE
      id = id_usuario_criador
  )
);

-- Permitir que o criador da comunidade delete os dados
CREATE POLICY "Comunidades_Delete_Owner" ON "Comunidades" FOR DELETE USING (
  auth.uid () = (
    SELECT
      id_auth_users
    FROM
      "Usuarios"
    WHERE
      id = id_usuario_criador
  )
);

/***usuario_comunidade***/
-- Permitir leitura pública dos dados
CREATE POLICY "usuario_comunidade_Read_Public" ON "usuario_comunidade" FOR
SELECT
  USING (true);

-- Permitir que usuários autenticados entrem em comunidades
CREATE POLICY "usuario_comunidade_Insert_Authenticated" ON "usuario_comunidade" FOR INSERT
WITH
  CHECK (auth.uid () IS NOT NULL);

-- Permitir que usuários removam a si mesmos de comunidades
CREATE POLICY "usuario_comunidade_Delete_Self" ON "usuario_comunidade" FOR DELETE USING (
  auth.uid () = (
    SELECT
      id_auth_users
    FROM
      "Usuarios"
    WHERE
      id = id_usuario
  )
);

CREATE POLICY "usuario_comunidade_Follow_Community" ON "usuario_comunidade" FOR INSERT
WITH
  CHECK (
    auth.uid () IS NOT NULL
    AND tipo = 'membro'
    AND auth.uid () = (
      SELECT
        id_auth_users
      FROM
        "Usuarios"
      WHERE
        id = id_usuario
    )
  );

-- Permitir que usuários deixem de seguir comunidades (remover registros com role='seguidor')
CREATE POLICY "usuario_comunidade_Unfollow_Community" ON "usuario_comunidade" FOR DELETE USING (
  auth.uid () = (
    SELECT
      id_auth_users
    FROM
      "Usuarios"
    WHERE
      id = id_usuario
  )
  AND tipo = 'membro'
);

/***Postagens***/
-- Permitir leitura pública dos dados
CREATE POLICY "Postagens_Read_Public" ON "Postagens" FOR
SELECT
  USING (true);

-- Permitir que apenas usuários autenticados criem postagens
CREATE POLICY "Postagens_Insert_Authenticated" ON "Postagens" FOR INSERT
WITH
  CHECK (auth.uid () IS NOT NULL);

-- Permitir que o criador da postagem atualize os dados
CREATE POLICY "Postagens_Update_Owner" ON "Postagens" FOR
UPDATE USING (
  auth.uid () = (
    SELECT
      id_auth_users
    FROM
      "Usuarios"
    WHERE
      id = id_usuario_criador
  )
);

-- Permitir que o criador da postagem delete os dados
CREATE POLICY "Postagens_Delete_Owner" ON "Postagens" FOR DELETE USING (
  auth.uid () = (
    SELECT
      id_auth_users
    FROM
      "Usuarios"
    WHERE
      id = id_usuario_criador
  )
);

/***Candidaturas***/
-- Permitir leitura pública dos dados
CREATE POLICY "Candidaturas_Read_Public" ON "Candidaturas" FOR
SELECT
  USING (true);

-- Permitir que usuários se candidatem a postagens
CREATE POLICY "Candidaturas_Insert_Authenticated" ON "Candidaturas" FOR INSERT
WITH
  CHECK (auth.uid () IS NOT NULL);

-- Permitir que candidatos atualizem suas próprias candidaturas
CREATE POLICY "Candidaturas_Update_Owner" ON "Candidaturas" FOR
UPDATE USING (
  auth.uid () = (
    SELECT
      id_auth_users
    FROM
      "Usuarios"
    WHERE
      id = id_usuario
  )
);

-- Permitir que o dono da postagem atualize as candidaturas (aprovar/rejeitar)
CREATE POLICY "Candidaturas_Update_PostOwner" ON "Candidaturas" FOR
UPDATE USING (
  auth.uid () = (
    SELECT
      u.id_auth_users
    FROM
      "Postagens" p
      JOIN "Usuarios" u ON p.id_usuario_criador = u.id
    WHERE
      p.id = id_postagem
  )
);

-- Permitir que candidatos excluam suas próprias candidaturas
CREATE POLICY "Candidaturas_Delete_Owner" ON "Candidaturas" FOR DELETE USING (
  auth.uid () = (
    SELECT
      id_auth_users
    FROM
      "Usuarios"
    WHERE
      id = id_usuario
  )
);

-- Permitir que o dono da postagem exclua candidaturas
CREATE POLICY "Candidaturas_Delete_PostOwner" ON "Candidaturas" FOR DELETE USING (
  auth.uid () = (
    SELECT
      u.id_auth_users
    FROM
      "Postagens" p
      JOIN "Usuarios" u ON p.id_usuario_criador = u.id
    WHERE
      p.id = id_postagem
  )
);

-- Política para o criador da comunidade atualizar os dados da comunidade
CREATE POLICY "Comunidades_Update_Owner" ON "Comunidades" FOR
UPDATE TO authenticated USING (
  auth.uid () = (
    SELECT
      id_auth_users
    FROM
      "Usuarios"
    WHERE
      id = id_usuario_criador
  )
);

-- Permite que o criador de uma comunidade exclua a comunidade
CREATE POLICY "Comunidades_Delete_Owner" ON "Comunidades" FOR DELETE TO authenticated USING (
  auth.uid () = (
    SELECT
      id_auth_users
    FROM
      "Usuarios"
    WHERE
      id = id_usuario_criador
  )
);

-- Ativando Row-Level Security (RLS) para todas as tabelas
ALTER TABLE "Usuarios" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Comunidades" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "usuario_comunidade" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Postagens" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "Candidaturas" ENABLE ROW LEVEL SECURITY;