/***Usuarios***/
-- Permitir que os usuários vejam apenas seus próprios dados
CREATE POLICY "Allow authenticated users to view their own profile" 
ON public."Usuarios" 
FOR SELECT 
TO authenticated 
USING (id_auth_users = (select auth.uid()));

-- Permitir que os usuários insiram dados
CREATE POLICY "Allow authenticated users to insert their profile" 
ON public."Usuarios" 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que os usuários atualizem seus próprios dados
CREATE POLICY "Allow users to update their own profile" 
ON public."Usuarios" 
FOR UPDATE 
TO authenticated 
USING (id_auth_users = (select auth.uid())) 
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que os usuários deletem apenas seus próprios dados
CREATE POLICY "Allow users to delete their own profile" 
ON public."Usuarios" 
FOR DELETE 
TO authenticated 
USING (id_auth_users = (select auth.uid()));

/***Comunidades***/
-- Permitir leitura pública dos dados
CREATE POLICY "Comunidades_Read_Public" ON "Comunidades"
FOR SELECT
USING (true);

-- Permitir que apenas usuários autenticados criem comunidades
CREATE POLICY "Comunidades_Insert_Authenticated" ON "Comunidades"
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que o criador da comunidade atualize os dados
CREATE POLICY "Comunidades_Update_Owner" ON "Comunidades"
FOR UPDATE
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = id_usuario_criador));

-- Permitir que o criador da comunidade delete os dados
CREATE POLICY "Comunidades_Delete_Owner" ON "Comunidades"
FOR DELETE
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = id_usuario_criador));

/***usuario_comunidade***/
-- Permitir leitura pública dos dados
CREATE POLICY "usuario_comunidade_Read_Public" ON "usuario_comunidade"
FOR SELECT
USING (true);

-- Permitir que usuários autenticados entrem em comunidades
CREATE POLICY "usuario_comunidade_Insert_Authenticated" ON "usuario_comunidade"
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que usuários removam a si mesmos de comunidades
CREATE POLICY "usuario_comunidade_Delete_Self" ON "usuario_comunidade"
FOR DELETE
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = id_usuario));

/***Postagens***/
-- Permitir leitura pública dos dados
CREATE POLICY "Postagens_Read_Public" ON "Postagens"
FOR SELECT
USING (true);

-- Permitir que apenas usuários autenticados criem postagens
CREATE POLICY "Postagens_Insert_Authenticated" ON "Postagens"
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que o criador da postagem atualize os dados
CREATE POLICY "Postagens_Update_Owner" ON "Postagens"
FOR UPDATE
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = id_usuario));

-- Permitir que o criador da postagem delete os dados
CREATE POLICY "Postagens_Delete_Owner" ON "Postagens"
FOR DELETE
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = id_usuario));

/***Candidaturas***/
-- Permitir leitura pública dos dados
CREATE POLICY "Candidaturas_Read_Public" ON "Candidaturas"
FOR SELECT
USING (true);

-- Permitir que usuários se candidatem a postagens
CREATE POLICY "Candidaturas_Insert_Authenticated" ON "Candidaturas"
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir que o dono da candidatura atualize seus dados
CREATE POLICY "Candidaturas_Update_Owner" ON "Candidaturas"
FOR UPDATE
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = usuario_id));

-- Permitir que o dono da candidatura delete seus dados
CREATE POLICY "Candidaturas_Delete_Owner" ON "Candidaturas"
FOR DELETE
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = usuario_id));

ALTER TABLE "Usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comunidades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuario_comunidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Postagens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Candidaturas" ENABLE ROW LEVEL SECURITY;