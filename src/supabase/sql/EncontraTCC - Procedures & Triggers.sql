CREATE OR REPLACE FUNCTION public.sp_insert_usuarios_from_auth_users()
RETURNS TRIGGER
LANGUAGE plpgsql
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
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.descricao_vector := to_tsvector('portuguese', NEW.descricao);
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