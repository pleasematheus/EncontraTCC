CREATE OR REPLACE FUNCTION public.sp_insert_description_vector()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  NEW.descricao_vector := to_tsvector('portuguese', NEW.descricao);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.sp_sync_usuario_email()
RETURNS TRIGGER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE public."Usuarios" SET email = NEW.email WHERE id_auth_users = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Função para incrementar o contador de usuários em uma comunidade
CREATE OR REPLACE FUNCTION public.increment_community_users(community_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public."Comunidades"
  SET total_usuarios = total_usuarios + 1
  WHERE id = community_id;
END;
$$;

-- Função para decrementar o contador de usuários em uma comunidade
CREATE OR REPLACE FUNCTION public.decrement_community_users(community_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public."Comunidades"
  SET total_usuarios = GREATEST(total_usuarios - 1, 0) -- Evita números negativos
  WHERE id = community_id;
END;
$$;

-- Conceder permissões para funções
GRANT EXECUTE ON FUNCTION public.increment_community_users(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_community_users(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sp_insert_usuario(uuid, text, text, text) TO anon;

CREATE TRIGGER trg_insert_description_vector
BEFORE INSERT OR UPDATE ON public."Comunidades"
FOR EACH ROW
EXECUTE FUNCTION public.sp_insert_description_vector();

CREATE TRIGGER trg_insert_description_vector_postagens
BEFORE INSERT OR UPDATE ON public."Postagens"
FOR EACH ROW
EXECUTE FUNCTION public.sp_insert_description_vector();

CREATE TRIGGER trg_after_auth_users_update
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.sp_sync_usuario_email();