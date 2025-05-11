-- =============================================================================
-- ORDEM DE EXECUÇÃO: 1
-- SCHEMA E TABELAS DO SISTEMA ENCONTRATCC
-- =============================================================================
-- Dependências: Nenhuma
-- Arquivo responsável por criar todas as tabelas do sistema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE
  IF NOT EXISTS "Usuarios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4 () UNIQUE,
    "id_auth_users" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(10) NOT NULL CHECK (tipo IN ('Discente', 'Docente')),
    "ativo" BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  IF NOT EXISTS "Comunidades" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4 () UNIQUE,
    "nome" VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(nome) >= 3),
    "discriminador" VARCHAR(9) NOT NULL UNIQUE CHECK (CHAR_LENGTH(discriminador) >= 3),
    "descricao" TEXT,
    "descricao_vector" TSVECTOR,
    "id_usuario_criador" UUID NOT NULL,
    "total_posts" INTEGER DEFAULT 0,
    "total_usuarios" INTEGER NOT NULL,
    "data_criacao" TIMESTAMP NOT NULL DEFAULT NOW (),
    "data_atualizacao" TIMESTAMP,
    PRIMARY KEY ("id")
  );

CREATE INDEX idx_comunidades_nome ON "Comunidades" ("nome");

CREATE TABLE
  IF NOT EXISTS "usuario_comunidade" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4 () UNIQUE,
    "id_comunidade" UUID NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "id_usuario" UUID NOT NULL,
    "data_entrada" TIMESTAMP NOT NULL DEFAULT NOW (),
    PRIMARY KEY ("id")
  );

CREATE INDEX idx_usuario_comunidade_id ON "usuario_comunidade" ("id_comunidade");

CREATE INDEX idx_usuario_comunidade_id_usuario ON "usuario_comunidade" ("id_usuario");

CREATE TABLE
  IF NOT EXISTS "Postagens" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4 () UNIQUE,
    "id_usuario_criador" UUID NOT NULL,
    "comunidade_id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(titulo) >= 3),
    "descricao" TEXT,
    "descricao_vector" TSVECTOR,
    "tipo" VARCHAR(255) NOT NULL,
    "prazo" TIMESTAMP,
    "candidaturas" BIGINT NOT NULL DEFAULT 0,
    "candidaturas_abertas" BOOLEAN NOT NULL DEFAULT FALSE,
    "status" VARCHAR(20) NOT NULL,
    "data_criacao" TIMESTAMP NOT NULL DEFAULT NOW (),
    "data_atualizacao" TIMESTAMP,
    PRIMARY KEY ("id")
  );

CREATE INDEX idx_postagens_comunidade_id ON "Postagens" ("comunidade_id");

CREATE INDEX idx_postagens_titulo ON "Postagens" ("titulo");

CREATE INDEX idx_postagens_status ON "Postagens" ("status");

CREATE INDEX idx_postagens_descricao_vector ON "Postagens" USING GIN ("descricao_vector");

CREATE TABLE
  IF NOT EXISTS "Candidaturas" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4 () UNIQUE,
    "postagem_id" UUID NOT NULL DEFAULT uuid_generate_v4 () UNIQUE,
    "usuario_id" UUID NOT NULL,
    "data_candidatura" TIMESTAMP NOT NULL,
    "universidade" VARCHAR(255) NOT NULL,
    "curso" VARCHAR(255) NOT NULL,
    "semestre" CHAR(2),
    "motivo" TEXT,
    "status" VARCHAR(20) NOT NULL,
    "data_aceitacao" TIMESTAMP,
    "data_saida" TIMESTAMP,
    PRIMARY KEY ("id")
  );

CREATE INDEX idx_candidaturas_postagem_id ON "Candidaturas" ("postagem_id");

CREATE INDEX idx_candidaturas_usuario_id ON "Candidaturas" ("usuario_id");

CREATE INDEX idx_candidaturas_status ON "Candidaturas" ("status");

-- Foreign keys
ALTER TABLE "Usuarios" ADD FOREIGN KEY ("id_auth_users") REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "usuario_comunidade" ADD FOREIGN KEY ("id_usuario") REFERENCES "Usuarios" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "Candidaturas" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuarios" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "Candidaturas" ADD FOREIGN KEY ("postagem_id") REFERENCES "Postagens" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE "Postagens" ADD FOREIGN KEY ("comunidade_id") REFERENCES "Comunidades" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE "Postagens" ADD FOREIGN KEY ("id_usuario_criador") REFERENCES "Usuarios" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "usuario_comunidade" ADD FOREIGN KEY ("id_comunidade") REFERENCES "Comunidades" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE "Comunidades" ADD FOREIGN KEY ("id_usuario_criador") REFERENCES "Usuarios" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;