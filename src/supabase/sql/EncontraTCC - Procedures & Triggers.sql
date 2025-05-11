-- =============================================================================
-- ORDEM DE EXECUÇÃO: 2
-- PROCEDURES E TRIGGERS DO SISTEMA ENCONTRATCC
-- =============================================================================
-- Dependências: EncontraTCC - Tables.sql
-- Arquivo responsável por criar todas as funções, procedures e triggers do sistema

-- =============================================================================
-- SEÇÃO 1: FUNÇÕES DE UTILIDADE
-- =============================================================================

-- Função para criar vetores de busca para o campo descrição
CREATE OR REPLACE FUNCTION public.sp_insert_description_vector()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  NEW.descricao_vector := to_tsvector('portuguese', NEW.descricao);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SEÇÃO 2: FUNÇÕES PARA USUÁRIOS
-- =============================================================================

-- Função para sincronizar email quando alterado na tabela auth.users
CREATE OR REPLACE FUNCTION public.sp_sync_usuario_email()
RETURNS TRIGGER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE public."Usuarios" SET email = NEW.email WHERE id_auth_users = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para inserir um novo usuário com validações
CREATE OR REPLACE FUNCTION public.sp_insert_usuario(
  id_auth uuid,
  nome_input text,
  email_input text,
  tipo_input text
)
RETURNS void
SET search_path = public
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validação do tamanho mínimo do nome (3 caracteres)
  IF LENGTH(nome_input) < 3 THEN
    RAISE EXCEPTION 'O nome deve ter no mínimo 3 caracteres.';
  END IF;

  -- Validação do email com regex
  -- Verifica formato de email básico: algo@algo.algo
  IF NOT email_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'O email deve ter um formato válido.';
  END IF;

  -- Validação do tipo de usuário
  IF tipo_input NOT IN ('Discente', 'Docente') THEN
    RAISE EXCEPTION 'O tipo de usuário deve ser Discente ou Docente.';
  END IF;

  -- Verificação se já existe usuário com o email
  IF EXISTS (
    SELECT 1 FROM public."Usuarios" WHERE email = email_input
  ) THEN
    RAISE EXCEPTION 'Já existe um usuário com este e-mail.';
  END IF;

  INSERT INTO public."Usuarios"(id_auth_users, nome, email, tipo, ativo)
  VALUES (id_auth, nome_input, email_input, tipo_input, true);
END; 
$$;

-- =============================================================================
-- SEÇÃO 3: FUNÇÕES PARA COMUNIDADES
-- =============================================================================

-- Função para incrementar o contador de usuários em uma comunidade
CREATE OR REPLACE FUNCTION public.increment_community_users(
  community_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Comunidades"
    SET total_usuarios = total_usuarios + 1
  WHERE id = community_id;
END;
$$;

-- Função para decrementar o contador de usuários em uma comunidade
CREATE OR REPLACE FUNCTION public.decrement_community_users(
  community_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Comunidades"
  SET total_usuarios = GREATEST(total_usuarios - 1, 0) -- Evita números negativos
  WHERE id = community_id;
END;
$$;

-- Função para incrementar o contador de posts em uma comunidade via API
CREATE OR REPLACE FUNCTION public.increment_community_posts(community_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Comunidades"
  SET total_posts = total_posts + 1
  WHERE id = community_id;
END;
$$;

-- Função para decrementar o contador de posts em uma comunidade via API
CREATE OR REPLACE FUNCTION public.decrement_community_posts(community_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public."Comunidades"
  SET total_posts = GREATEST(total_posts - 1, 0) -- Evita números negativos
  WHERE id = community_id;
END;
$$;

-- Função para inserir o criador da comunidade como responsável na tabela usuario_comunidade
CREATE OR REPLACE FUNCTION public.add_community_creator_as_responsible()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    -- Insere o criador da comunidade na tabela usuario_comunidade como responsável
    INSERT INTO public."usuario_comunidade" (
        id_comunidade,
        id_usuario,
        tipo,
        data_entrada
    ) VALUES (
        NEW.id,
        NEW.id_usuario_criador,
        'seguidor',
        NOW()
    );
    
    RETURN NEW;
END;
$$;

-- =============================================================================
-- SEÇÃO 4: FUNÇÕES PARA POSTAGENS E CANDIDATURAS
-- =============================================================================

-- Função para incrementar o contador de posts em uma comunidade via trigger
CREATE OR REPLACE FUNCTION public.increment_community_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    -- Incrementa a contagem de posts na comunidade correspondente
    UPDATE "Comunidades"
    SET total_posts = total_posts + 1
    WHERE id = NEW.comunidade_id;
    
    RETURN NEW;
END;
$$;

-- Função para decrementar quando um post é removido via trigger
CREATE OR REPLACE FUNCTION public.decrement_community_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    -- Decrementa a contagem de posts na comunidade correspondente
    UPDATE "Comunidades"
    SET total_posts = GREATEST(total_posts - 1, 0)
    WHERE id = OLD.comunidade_id;
    
    RETURN OLD;
END;
$$;

-- Função para atualizar a contagem de candidatos após inserção de candidatura
CREATE OR REPLACE FUNCTION public.update_unique_applicants_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    already_applied boolean;
BEGIN
    -- Verificar se o usuário já tem candidaturas anteriores para esta postagem
    SELECT EXISTS (
        SELECT 1 
        FROM "Candidaturas" 
        WHERE postagem_id = NEW.postagem_id 
          AND usuario_id = NEW.usuario_id 
          AND id != NEW.id
    ) INTO already_applied;
    
    -- Se o usuário não tinha candidaturas anteriores para esta postagem, incrementar o contador
    IF NOT already_applied THEN
        UPDATE "Postagens"
        SET candidaturas = candidaturas + 1
        WHERE id = NEW.postagem_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Função para atualizar a contagem quando uma candidatura é removida
CREATE OR REPLACE FUNCTION public.update_unique_applicants_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    other_applications boolean;
BEGIN
    -- Verificar se o usuário tem outras candidaturas para esta postagem
    SELECT EXISTS (
        SELECT 1 
        FROM "Candidaturas" 
        WHERE postagem_id = OLD.postagem_id 
          AND usuario_id = OLD.usuario_id 
          AND id != OLD.id
    ) INTO other_applications;
    
    -- Se o usuário não tiver outras candidaturas, decrementar o contador
    IF NOT other_applications THEN
        UPDATE "Postagens"
        SET candidaturas = candidaturas - 1
        WHERE id = OLD.postagem_id;
    END IF;
    
    RETURN OLD;
END;
$$;

-- =============================================================================
-- SEÇÃO 5: CONFIGURAÇÃO DE TRIGGERS
-- =============================================================================

-- Triggers para criar vetores de busca
CREATE TRIGGER trg_insert_description_vector
BEFORE INSERT OR UPDATE ON public."Comunidades"
FOR EACH ROW
EXECUTE FUNCTION public.sp_insert_description_vector();

CREATE TRIGGER trg_insert_description_vector_postagens
BEFORE INSERT OR UPDATE ON public."Postagens"
FOR EACH ROW
EXECUTE FUNCTION public.sp_insert_description_vector();

-- Trigger para sincronização de email
CREATE TRIGGER trg_after_auth_users_update
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.sp_sync_usuario_email();

-- Trigger para executar após a inserção de um novo post
/*DROP TRIGGER IF EXISTS after_post_insert ON "Postagens";*/
CREATE TRIGGER after_post_insert
AFTER INSERT ON "Postagens"
FOR EACH ROW
EXECUTE FUNCTION increment_community_post_count();

-- Trigger para executar após a exclusão de um post
/*DROP TRIGGER IF EXISTS after_post_delete ON "Postagens";*/
CREATE TRIGGER after_post_delete
AFTER DELETE ON "Postagens"
FOR EACH ROW
EXECUTE FUNCTION decrement_community_post_count();

-- Trigger para contagem de candidaturas
/*DROP TRIGGER IF EXISTS after_candidatura_insert ON "Candidaturas";*/
CREATE TRIGGER after_candidatura_insert
AFTER INSERT ON "Candidaturas"
FOR EACH ROW
EXECUTE FUNCTION update_unique_applicants_count();

-- Trigger para atualização quando candidatura é removida
/*DROP TRIGGER IF EXISTS after_candidatura_delete ON "Candidaturas";*/
CREATE TRIGGER after_candidatura_delete
AFTER DELETE ON "Candidaturas"
FOR EACH ROW
EXECUTE FUNCTION update_unique_applicants_on_delete();

-- Trigger para adicionar o criador da comunidade como responsável na tabela usuario_comunidade
CREATE TRIGGER after_community_insert
AFTER INSERT ON "Comunidades"
FOR EACH ROW
EXECUTE FUNCTION add_community_creator_as_responsible();

-- =============================================================================
-- SEÇÃO 6: PERMISSÕES DE EXECUÇÃO
-- =============================================================================

-- Conceder permissões para funções de usuário e comunidade
GRANT EXECUTE ON FUNCTION public.increment_community_users(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_community_users(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sp_insert_usuario(uuid, text, text, text) TO anon;

-- Conceder permissões para funções de posts
GRANT EXECUTE ON FUNCTION public.increment_community_posts(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_community_posts(uuid) TO authenticated;

-- Conceder permissões para funções
GRANT EXECUTE ON FUNCTION public.increment_community_posts(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_community_posts(uuid) TO authenticated;