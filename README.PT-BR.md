# EncontraTCC

> [Read in English 🇺🇸](README.md)

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-5-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/deploy-vercel-000?logo=vercel&logoColor=white)

Plataforma web que conecta **discentes** em busca de orientação para o TCC com **docentes e pesquisadores** que possuem projetos e linhas de pesquisa compatíveis. O objetivo é tornar o processo de encontrar um orientador mais eficiente e transparente para todos os envolvidos.

---

## Sumário

- [Screenshots](#screenshots)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Começando](#começando)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy](#deploy)
- [Papéis de Usuário](#papéis-de-usuário)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## Screenshots

| Landing Page | Dashboard |
|---|---|
| ![Landing Page](docs/hero.png) | ![Dashboard](docs/dashboard.png) |

| Comunidade | Candidaturas |
|---|---|
| ![Comunidade](docs/community.png) | ![Candidaturas](docs/applications.png) |

---

## Funcionalidades

### Para Discentes (Estudantes)
- Explorar comunidades criadas por docentes
- Visualizar demandas de projetos publicadas
- Candidatar-se a oportunidades de orientação
- Acompanhar o status das candidaturas

### Para Docentes (Professores / Pesquisadores)
- Criar e gerenciar comunidades temáticas
- Publicar demandas de projetos com prazo e descrição
- Revisar e gerenciar candidaturas recebidas

### Geral
- Autenticação segura com redefinição de senha por e-mail
- Dashboard personalizado com postagens das comunidades seguidas
- Página de tendências com filtragem e paginação
- Busca por comunidades e postagens
- Tema claro / escuro

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Roteamento | React Router DOM 6 |
| Estilização | Tailwind CSS 3 + daisyUI 4 |
| Animações | Framer Motion |
| Componentes UI | Headless UI, Heroicons, Lucide React |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| Deploy | Vercel |

---

## Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- Conta e projeto no [Supabase](https://supabase.com/)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/pleasematheus/encontratcc.git
cd encontratcc

# Instale as dependências
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave-anon>
```

Esses valores estão disponíveis em **Project Settings → API** no painel do Supabase.

### Executando em desenvolvimento

```bash
# Compilar o Tailwind CSS em modo watch (terminal 1)
npm run tailwatch

# Iniciar o servidor de desenvolvimento Vite (terminal 2)
npm run dev
```

O servidor estará disponível em `http://localhost:5173`.

---

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento local |
| `npm run dev:network` | Inicia o servidor acessível na rede local |
| `npm run build` | Compila TypeScript e gera o build de produção |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa o ESLint |
| `npm run tailwatch` | Compila o Tailwind CSS em modo watch |
| `npm run tailbuild` | Compila e minifica o Tailwind CSS para produção |

---

## Estrutura do Projeto

```
src/
├── assets/          # Imagens e logotipos
├── components/      # Componentes reutilizáveis (Header, Footer, Cards, etc.)
├── hooks/           # Hooks customizados (useTheme)
├── lib/             # Utilitários gerais
├── middleware/      # Proteção de rotas autenticadas
├── routes/          # Componentes de página (uma pasta por rota)
└── utils/
    └── supabase.ts  # Inicialização do cliente Supabase
```

---

## Deploy

O projeto está configurado para deploy na **Vercel**. O arquivo `vercel.json` inclui a regra de reescrita necessária para o roteamento de SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Para fazer deploy, basta conectar o repositório à Vercel e definir as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações do projeto.

---

## Papéis de Usuário

| Papel | Descrição |
|---|---|
| **Discente** | Estudante que busca orientação e se candidata a projetos |
| **Docente** | Professor ou pesquisador que publica demandas e seleciona candidatos |

---

## Contribuindo

Contribuições são bem-vindas! Para começar:

1. Faça um fork do repositório
2. Crie uma branch para sua feature ou correção (`git checkout -b feature/minha-feature`)
3. Faça o commit das suas alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Envie para sua branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

Mantenha os PRs focados — uma feature ou correção por PR facilita muito a revisão.

---

## Licença

Distribuído sob a licença **Apache 2.0**. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
