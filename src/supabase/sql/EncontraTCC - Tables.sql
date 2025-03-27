CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE
  "Usuarios" (
    "id" UUID NOT NULL UNIQUE,
    "id_auth_users" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "id_publico" SERIAL UNIQUE,
    "email" VARCHAR(255) NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE TABLE
  "Comunidades" (
    "id" UUID NOT NULL UNIQUE,
    "nome" VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(NOME) >= 3),
    "descricao" TEXT,
    "total_posts" INTEGER NOT NULL,
    "total_usuarios" INTEGER NOT NULL,
    "data_criacao" TIMESTAMP NOT NULL,
    "data_atualizacao" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE INDEX "Comunidades_index_0" ON "Comunidades" ("nome");

CREATE TABLE
  "usuario_comunidade" (
    "id" UUID NOT NULL,
    "id_comunidade" UUID NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "id_usuario" UUID NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE INDEX "usuario_comunidade_index_0" ON "usuario_comunidade" ("id_comunidade");

CREATE INDEX "usuario_comunidade_index_1" ON "usuario_comunidade" ("id_usuario");

CREATE TABLE
  "Postagens" (
    "id" UUID NOT NULL UNIQUE,
    "comunidade_id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL CHECK (CHAR_LENGTH(TITULO) >= 3),
    "descricao" TEXT,
    "tecnologias" VARCHAR(255) ARRAY NOT NULL,
    "prazo" TIMESTAMP,
    "status" VARCHAR(20) NOT NULL,
    "data_criacao" TIMESTAMP NOT NULL,
    "data_atualizacao" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE INDEX "Postagens_index_0" ON "Postagens" ("comunidade_id");

CREATE INDEX "Postagens_index_1" ON "Postagens" ("titulo");

CREATE INDEX idx_postagens_tecnologias ON "Postagens" USING GIN ("tecnologias");

CREATE TABLE
  "Candidaturas" (
    "id" UUID NOT NULL UNIQUE,
    "postagem_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "data_candidatura" TIMESTAMP NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "data_aceitacao" TIMESTAMP NOT NULL,
    "data_saida" TIMESTAMP NOT NULL,
    PRIMARY KEY ("id")
  );

CREATE INDEX "Candidaturas_index_0" ON "Candidaturas" ("postagem_id");

CREATE INDEX "Candidaturas_index_1" ON "Candidaturas" ("usuario_id");

ALTER TABLE "Usuarios" ADD FOREIGN KEY ("id_auth_users") REFERENCES auth.users (id) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "Usuarios" ADD FOREIGN KEY ("email") REFERENCES auth.user (email) ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "usuario_comunidade" ADD FOREIGN KEY ("id_usuario") REFERENCES "Usuarios" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "Candidaturas" ADD FOREIGN KEY ("usuario_id") REFERENCES "Usuarios" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "Candidaturas" ADD FOREIGN KEY ("postagem_id") REFERENCES "Postagens" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "Postagens" ADD FOREIGN KEY ("comunidade_id") REFERENCES "Comunidades" ("id") ON UPDATE NO ACTION ON DELETE CASCADE;

ALTER TABLE "usuario_comunidade" ADD FOREIGN KEY ("id_comunidade") REFERENCES "Comunidades" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;