-- Trigger e função para rastrear candidatos únicos por postagem
-- Isso permitirá contar pessoas que se candidataram, não apenas candidaturas

-- Primeiro, adicionar uma coluna para armazenar o número de candidatos únicos na tabela de Postagens
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Postagens' AND column_name = 'candidatos_unicos'
    ) THEN
        ALTER TABLE "Postagens" ADD COLUMN candidatos_unicos integer DEFAULT 0;
    END IF;
END
$$;

-- Função para atualizar a contagem de candidatos únicos após inserção de candidatura
CREATE OR REPLACE FUNCTION update_unique_applicants_count()
RETURNS TRIGGER
LANGUAGE plpgsql
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
        SET candidatos_unicos = candidatos_unicos + 1
        WHERE id = NEW.postagem_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger para execução após inserção de candidatura
DROP TRIGGER IF EXISTS after_candidatura_insert ON "Candidaturas";
CREATE TRIGGER after_candidatura_insert
AFTER INSERT ON "Candidaturas"
FOR EACH ROW
EXECUTE FUNCTION update_unique_applicants_count();

-- Função para atualizar a contagem quando uma candidatura é removida
CREATE OR REPLACE FUNCTION update_unique_applicants_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
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
        SET candidatos_unicos = candidatos_unicos - 1
        WHERE id = OLD.postagem_id;
    END IF;
    
    RETURN OLD;
END;
$$;

-- Criar trigger para execução após remoção de candidatura
DROP TRIGGER IF EXISTS after_candidatura_delete ON "Candidaturas";
CREATE TRIGGER after_candidatura_delete
AFTER DELETE ON "Candidaturas"
FOR EACH ROW
EXECUTE FUNCTION update_unique_applicants_on_delete();

-- Criar função para atualizar a materialized view de trending posts para incluir candidatos únicos
CREATE OR REPLACE FUNCTION update_trending_view_with_unique_applicants()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DROP MATERIALIZED VIEW IF EXISTS trending_posts_week;
    
    CREATE MATERIALIZED VIEW trending_posts_week AS
    SELECT 
        p.id,
        p.comunidade_id,
        p.titulo,
        p.descricao,
        p.tipo,
        p.prazo,
        p.data_criacao,
        p.data_atualizacao,
        p.id_usuario_criador,
        p.candidaturas_abertas,
        COUNT(DISTINCT c.usuario_id) AS candidaturas_count, -- Contagem de candidatos únicos
        com.nome AS comunidade_nome,
        u.nome AS nome_criador
    FROM 
        "Postagens" p
    LEFT JOIN 
        "Candidaturas" c ON p.id = c.postagem_id
    LEFT JOIN 
        "Comunidades" com ON p.comunidade_id = com.id
    LEFT JOIN 
        "Usuarios" u ON p.id_usuario_criador = u.id
    WHERE 
        p.candidaturas_abertas = true
        AND c.data_candidatura >= (CURRENT_DATE - INTERVAL '7 days')
    GROUP BY 
        p.id, p.comunidade_id, p.titulo, p.descricao, p.tipo, p.prazo, 
        p.data_criacao, p.data_atualizacao, p.id_usuario_criador,
        p.candidaturas_abertas, com.nome, u.nome
    ORDER BY 
        candidaturas_count DESC;
    
    -- Recriar índices
    CREATE INDEX IF NOT EXISTS idx_trending_posts_candidaturas_count
    ON trending_posts_week (candidaturas_count DESC);

    CREATE INDEX IF NOT EXISTS idx_trending_posts_tipo
    ON trending_posts_week (tipo);

    CREATE INDEX IF NOT EXISTS idx_trending_posts_comunidade
    ON trending_posts_week (comunidade_id);
END;
$$;

-- Executar a função para atualizar a view
SELECT update_trending_view_with_unique_applicants();

-- Atualizar a função de refresh para usar a nova definição
CREATE OR REPLACE FUNCTION refresh_trending_posts_view()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  SELECT update_trending_view_with_unique_applicants();
END;
$$;