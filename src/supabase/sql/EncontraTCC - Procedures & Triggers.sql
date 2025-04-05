CREATE OR REPLACE FUNCTION public.sp_insert_usuarios_from_auth_users()
RETURNS TRIGGER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public."Usuarios" (id, id_auth_users, name, email)
  VALUES (
    gen_random_uuid(),
    NEW.id,                                 -- Id de auth.users
    UPPER(LEFT(md5(random()::text), 9)),    -- Sequência alfanumérica de 9 caracteres
    NEW.email                               -- Email de auth.users para evitar joins desnecessários
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER trg_insert_usuarios_on_auth_users
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sp_insert_usuarios_from_auth_users();

CREATE TRIGGER trg_insert_description_vector
BEFORE INSERT OR UPDATE ON public."Comunidades"
FOR EACH ROW
EXECUTE FUNCTION public.sp_insert_description_vector();

CREATE TRIGGER trg_after_auth_users_update
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.email IS DISTINCT FROM NEW.email)
EXECUTE FUNCTION public.sync_usuario_email();