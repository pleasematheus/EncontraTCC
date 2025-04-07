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

CREATE OR REPLACE FUNCTION public.insert_usuario(
  id_auth uuid,
  nome_input text,
  email_input text,
  tipo_input text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public."Usuarios"(id_auth_users, nome, email, tipo, ativo)
  VALUES (id_auth, nome_input, email_input, tipo_input, true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_usuario(uuid, text, text, text) TO anon;

CREATE TRIGGER trg_insert_description_vector
BEFORE INSERT OR UPDATE ON public."Comunidades"
FOR EACH ROW
EXECUTE FUNCTION public.sp_insert_description_vector();

CREATE TRIGGER trg_after_auth_users_update
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.sp_sync_usuario_email();