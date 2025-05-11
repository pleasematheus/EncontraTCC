CREATE OR REPLACE FUNCTION increment_community_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Incrementa a contagem de posts na comunidade correspondente
    UPDATE "Comunidades"
    SET total_posts = total_posts + 1
    WHERE id = NEW.comunidade_id;
    
    RETURN NEW;
END;
$$;

-- Trigger para executar após a inserção de um novo post
DROP TRIGGER IF EXISTS after_post_insert ON "Postagens";
CREATE TRIGGER after_post_insert
AFTER INSERT ON "Postagens"
FOR EACH ROW
EXECUTE FUNCTION increment_community_post_count();

-- Trigger para decrementar quando um post é removido
CREATE OR REPLACE FUNCTION decrement_community_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Decrementa a contagem de posts na comunidade correspondente
    UPDATE "Comunidades"
    SET total_posts = GREATEST(total_posts - 1, 0)
    WHERE id = OLD.comunidade_id;
    
    RETURN OLD;
END;
$$;

-- Trigger para executar após a exclusão de um post
DROP TRIGGER IF EXISTS after_post_delete ON "Postagens";
CREATE TRIGGER after_post_delete
AFTER DELETE ON "Postagens"
FOR EACH ROW
EXECUTE FUNCTION decrement_community_post_count();