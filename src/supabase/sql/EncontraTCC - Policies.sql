/*** Usuários ***/
CREATE POLICY "usuarios_read_public"
  ON public."Usuarios"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "usuarios_read_self"
  ON public."Usuarios"
  FOR SELECT
  TO authenticated
  USING ( auth.uid() = id_auth_users );

CREATE POLICY "usuarios_insert_self"
  ON public."Usuarios"
  FOR INSERT
  TO authenticated
  WITH CHECK ( auth.uid() IS NOT NULL );

CREATE POLICY "usuarios_update_self"
  ON public."Usuarios"
  FOR UPDATE
  TO authenticated
  USING ( auth.uid() = id_auth_users );


/*** Comunidades ***/
CREATE POLICY "comunidades_read_public"
  ON public."Comunidades"
  FOR SELECT
  USING (true);

CREATE POLICY "comunidades_insert_authenticated"
  ON public."Comunidades"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public."Usuarios"
      WHERE id = id_usuario_criador
        AND id_auth_users = auth.uid()
        AND LOWER(tipo) = 'docente'
    )
  );

CREATE POLICY "comunidades_update_owner"
  ON public."Comunidades"
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT id_auth_users
      FROM public."Usuarios"
      WHERE id = id_usuario_criador
    )
  );

CREATE POLICY "comunidades_delete_owner"
  ON public."Comunidades"
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT id_auth_users
      FROM public."Usuarios"
      WHERE id = id_usuario_criador
    )
  );


/*** usuario_comunidade ***/
CREATE POLICY "usuario_comunidade_read_public"
  ON public."usuario_comunidade"
  FOR SELECT
  USING (true);

CREATE POLICY "usuario_comunidade_insert_authenticated"
  ON public."usuario_comunidade"
  FOR INSERT
  TO authenticated
  WITH CHECK ( auth.uid() IS NOT NULL );

CREATE POLICY "usuario_comunidade_follow"
  ON public."usuario_comunidade"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND tipo = 'membro'
    AND auth.uid() = (
      SELECT id_auth_users
      FROM public."Usuarios"
      WHERE id = id_usuario
    )
  );

CREATE POLICY "usuario_comunidade_unfollow"
  ON public."usuario_comunidade"
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT id_auth_users
      FROM public."Usuarios"
      WHERE id = id_usuario
    )
    AND tipo = 'membro'
  );


/*** Postagens ***/
CREATE POLICY "postagens_read_public"
  ON public."Postagens"
  FOR SELECT
  USING (true);

CREATE POLICY "postagens_insert_authenticated"
  ON public."Postagens"
  FOR INSERT
  TO authenticated
  WITH CHECK ( auth.uid() IS NOT NULL );

CREATE POLICY "postagens_update_owner"
  ON public."Postagens"
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT id_auth_users
      FROM public."Usuarios"
      WHERE id = id_usuario_criador
    )
  );

CREATE POLICY "postagens_delete_owner"
  ON public."Postagens"
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT id_auth_users
      FROM public."Usuarios"
      WHERE id = id_usuario_criador
    )
  );


/*** Candidaturas ***/
CREATE POLICY "candidaturas_read_public"
  ON public."Candidaturas"
  FOR SELECT
  USING (true);

CREATE POLICY "candidaturas_insert_authenticated"
  ON public."Candidaturas"
  FOR INSERT
  TO authenticated
  WITH CHECK ( auth.uid() IS NOT NULL );

CREATE POLICY "candidaturas_update_owner"
  ON public."Candidaturas"
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT id_auth_users
      FROM public."Usuarios"
      WHERE id = usuario_id
    )
  );

CREATE POLICY "candidaturas_update_post_owner"
  ON public."Candidaturas"
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT u.id_auth_users
      FROM public."Postagens" p
      JOIN public."Usuarios" u ON p.id_usuario_criador = u.id
      WHERE p.id = postagem_id
    )
  );

CREATE POLICY "candidaturas_delete_owner"
  ON public."Candidaturas"
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT id_auth_users
      FROM public."Usuarios"
      WHERE id = usuario_id
    )
  );

CREATE POLICY "candidaturas_delete_post_owner"
  ON public."Candidaturas"
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = (
      SELECT u.id_auth_users
      FROM public."Postagens" p
      JOIN public."Usuarios" u ON p.id_usuario_criador = u.id
      WHERE p.id = postagem_id
    )
  );

/*** Habilitar RLS em todas as tabelas ***/
ALTER TABLE public."Usuarios"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Comunidades"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."usuario_comunidade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Postagens"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Candidaturas"       ENABLE ROW LEVEL SECURITY;