-- Permitir que os usuários vejam apenas seus próprios dados
CREATE POLICY "Allow users to read their own information" 
ON public."Usuarios" 
FOR SELECT 
TO authenticated 
USING ((select auth.uid()) = id_auth_users);

-- Permitir que os usuários insiram dados
CREATE POLICY "Allow users to insert their own profile" 
ON public."Usuarios" 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Permite que os usuários atualizem seus próprios perfis
CREATE POLICY "Allow users to update their own profile"
ON public."Usuarios"
FOR UPDATE
TO authenticated
USING (id_auth_users = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL);

-- Permite que os usuários excluam seus próprios perfis
CREATE POLICY "Allow users to delete their own profile"
ON public."Usuarios"
FOR DELETE
TO authenticated
USING (id_auth_users = auth.uid());

-- Permite que o criador de uma candidatura atualize os dados da candidatura
CREATE POLICY "Candidaturas_Update_Owner"
ON "Candidaturas"
FOR UPDATE
TO authenticated
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = usuario_id));

-- Permite que o criador de uma candidatura exclua a candidatura
CREATE POLICY "Candidaturas_Delete_Owner"
ON "Candidaturas"
FOR DELETE
TO authenticated
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = usuario_id));

-- Permite que um usuário remova a si mesmo de uma comunidade
CREATE POLICY "usuario_comunidade_Delete_Self"
ON "usuario_comunidade"
FOR DELETE
TO authenticated
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = id_usuario));

-- Permite que o criador de uma postagem atualize os dados da postagem
-- Nota: É necessário adicionar o id_usuario na tabela Postagens ou relacionar com usuario_comunidade
CREATE POLICY "Postagens_Update_Owner"
ON "Postagens"
FOR UPDATE
TO authenticated
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" u
                     JOIN "Comunidades" c ON u.id = c.id_usuario_criador
                     WHERE c.id = comunidade_id));

-- Permite que o criador de uma postagem exclua a postagem
-- Nota: É necessário adicionar o id_usuario na tabela Postagens ou relacionar com usuario_comunidade
CREATE POLICY "Postagens_Delete_Owner"
ON "Postagens"
FOR DELETE
TO authenticated
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" u
                     JOIN "Comunidades" c ON u.id = c.id_usuario_criador
                     WHERE c.id = comunidade_id));

-- Removida política duplicada (já existe uma Candidaturas_Delete_Owner acima)
-- CREATE POLICY "Candidaturas_Delete_Owner_2"
-- ON "Candidaturas"
-- FOR DELETE
-- USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = usuario_id));

-- Política para o criador da comunidade atualizar os dados da comunidade
CREATE POLICY "Comunidades_Update_Owner"
ON "Comunidades"
FOR UPDATE
TO authenticated
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = id_usuario_criador));

-- Permite que o criador de uma comunidade exclua a comunidade
CREATE POLICY "Comunidades_Delete_Owner"
ON "Comunidades"
FOR DELETE
TO authenticated
USING (auth.uid() = (SELECT id_auth_users FROM "Usuarios" WHERE id = id_usuario_criador));

-- Ativando Row-Level Security (RLS) para todas as tabelas
ALTER TABLE "Usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comunidades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuario_comunidade" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Postagens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Candidaturas" ENABLE ROW LEVEL SECURITY;