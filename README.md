# 🎓 EncontraTCC

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.13-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.45.4-3ECF8E.svg)](https://supabase.com/)

Uma plataforma moderna desenvolvida para conectar estudantes universitários com professores e orientadores para Trabalhos de Conclusão de Curso (TCCs), projetos de pesquisa e oportunidades acadêmicas.

## 🎯 Sobre o Projeto

O **EncontraTCC** é uma aplicação web que visa facilitar o processo de encontro entre alunos e orientadores acadêmicos. A plataforma permite que professores publiquem projetos, oportunidades de pesquisa e temas de TCC, enquanto estudantes podem explorar essas oportunidades e candidatar-se àquelas que mais se alinham com seus interesses e perfil acadêmico.

### ✨ Principais Funcionalidades

#### 👨‍🎓 Para Estudantes (Discentes)

- **Exploração de Oportunidades**: Navegue por comunidades acadêmicas e projetos disponíveis
- **Sistema de Candidaturas**: Candidate-se a projetos de interesse com informações detalhadas
- **Acompanhamento**: Monitore o status de suas candidaturas em tempo real
- **Pesquisa Avançada**: Encontre projetos por área, tipo ou palavras-chave
- **Perfil Personalizado**: Gerencie suas informações acadêmicas e histórico

#### 👨‍🏫 Para Professores (Docentes)

- **Gestão de Comunidades**: Crie e administre comunidades relacionadas às suas áreas de pesquisa
- **Publicação de Projetos**: Publique TCCs, projetos de pesquisa, extensão e monitoria
- **Avaliação de Candidaturas**: Receba, avalie e responda candidaturas de estudantes
- **Dashboard Completo**: Gerencie todos os seus projetos e orientandos em um só lugar
- **Estatísticas**: Acompanhe métricas de engajamento e candidaturas

#### 🌟 Funcionalidades Gerais

- **Sistema de Autenticação**: Login seguro com confirmação por email
- **Interface Responsiva**: Design adaptável para desktop e mobile
- **Temas**: Suporte a modo claro e escuro
- **Notificações**: Sistema de alerts e feedback em tempo real
- **Posts em Tendência**: Visualize os projetos mais populares da semana

## 🛠️ Tecnologias Utilizadas

### Frontend

- **React 18.3.1** - Biblioteca para construção da interface
- **TypeScript 5.5.3** - Tipagem estática para JavaScript
- **Vite 5.4.8** - Ferramenta de build e desenvolvimento
- **Tailwind CSS 3.4.13** - Framework de estilos utilitários
- **DaisyUI 4.12.14** - Componentes pré-construídos para Tailwind
- **Framer Motion 11.11.10** - Animações e transições fluidas
- **React Router DOM 6.26.2** - Roteamento do lado do cliente

### Backend & Database

- **Supabase 2.45.4** - Backend-as-a-Service com PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança granular de dados
- **Triggers & Stored Procedures** - Lógica de negócio no banco
- **Materialized Views** - Otimização de consultas complexas

### UI/UX & Icons

- **Headless UI 2.1.10** - Componentes acessíveis sem estilo
- **Heroicons 2.1.5** - Ícones do sistema
- **Lucide React 0.451.0** - Biblioteca de ícones moderna
- **Radix UI Icons 1.3.0** - Ícones adicionais

### Desenvolvimento & Build

- **ESLint 9.11.1** - Linting e qualidade de código
- **Autoprefixer 10.4.20** - Prefixos CSS automáticos
- **PostCSS 8.4.47** - Processamento de CSS
- **Dotenv 16.4.7** - Gerenciamento de variáveis de ambiente

## 🚀 Início Rápido

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase

### Instalação

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/encontratcc.git
cd encontratcc
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Execute em modo de desenvolvimento:**

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run dev:network      # Inicia servidor acessível na rede local

# Build
npm run build           # Gera build de produção
npm run preview         # Preview do build de produção

# Linting
npm run lint            # Executa ESLint

# Tailwind CSS
npm run tailwatch       # Watch mode para CSS
npm run tailpreview     # Gera CSS para preview
npm run tailbuild       # Gera CSS minificado para produção
```

## 📁 Estrutura do Projeto

```
src/
├── assets/              # Imagens e recursos estáticos
├── components/          # Componentes reutilizáveis
│   ├── CommunityCards.tsx
│   ├── DemandCards.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Pagination.tsx
│   ├── PostsCards.tsx
│   └── ...
├── fonts/              # Fontes customizadas (Switzer)
├── hooks/              # Custom hooks
│   └── useTheme.ts
├── lib/                # Bibliotecas e utilitários
├── middleware/         # Middleware de autenticação
├── routes/             # Páginas da aplicação
│   ├── App.tsx         # Configuração de rotas
│   ├── Home.tsx        # Página inicial
│   ├── Dashboard.tsx   # Dashboard do usuário
│   ├── Communities.tsx # Lista de comunidades
│   ├── Community.tsx   # Página individual da comunidade
│   ├── Candidaturas.tsx # Gerenciamento de candidaturas
│   └── ...
├── supabase/           # Configurações e SQL do Supabase
│   ├── sql/            # Scripts SQL
│   └── templates/      # Templates de email
└── utils/              # Funções utilitárias
```

## 🗄️ Estrutura do Banco de Dados

O projeto utiliza PostgreSQL através do Supabase com as seguintes tabelas principais:

- **Usuarios** - Informações dos usuários (discentes e docentes)
- **Comunidades** - Comunidades acadêmicas criadas por docentes
- **Postagens** - Projetos, TCCs e oportunidades publicadas
- **Candidaturas** - Candidaturas de estudantes aos projetos
- **usuario_comunidade** - Relacionamento entre usuários e comunidades

### Funcionalidades Avançadas do BD

- **Triggers** automáticos para contadores e sincronização
- **Stored Procedures** para operações complexas
- **Materialized Views** para posts em tendência
- **Full-text Search** com suporte ao português
- **Row Level Security** para proteção de dados

## 🎨 Design System

O projeto utiliza um design system consistente baseado em:

- **Tipografia**: Fonte Switzer (custom)
- **Cores**: Palette moderna com suporte a tema claro/escuro
- **Componentes**: DaisyUI + componentes customizados
- **Responsividade**: Mobile-first approach
- **Animações**: Framer Motion para micro-interações

## 🔐 Autenticação e Segurança

- **Autenticação**: Supabase Auth com confirmação por email
- **Autorização**: Role-based access control (Discente/Docente)
- **Segurança**: Row Level Security policies no banco
- **Validação**: Validação client-side e server-side
- **Senhas**: Redefinição segura via email

## 📱 Funcionalidades por Tela

### 🏠 Home

- Hero section com apresentação da plataforma
- Cards de funcionalidades principais
- Call-to-action para cadastro

### 🏢 Dashboard

- Visão geral das atividades do usuário
- Estatísticas personalizadas por perfil
- Acesso rápido às principais funcionalidades

### 🏛️ Comunidades

- Lista paginada de todas as comunidades
- Sistema de busca e filtros
- Possibilidade de seguir/deixar de seguir
- Criação de novas comunidades (docentes)

### 📋 Projetos

- Visualização de projetos por comunidade
- Sistema de candidaturas
- Filtros por tipo, prazo e status
- Gerenciamento de candidaturas (docentes)

### 👤 Perfil

- Gerenciamento de informações pessoais
- Histórico de candidaturas/projetos
- Configurações da conta

## 🌟 Diferenciais

1. **Interface Intuitiva**: UX/UI pensada para facilitar o uso por estudantes e professores
2. **Performance**: Otimizações com Materialized Views e lazy loading
3. **Escalabilidade**: Arquitetura preparada para crescimento
4. **Acessibilidade**: Componentes acessíveis com Headless UI
5. **Responsividade**: Funciona perfeitamente em qualquer dispositivo
6. **Tempo Real**: Atualizações instantâneas de status e notificações

## 🚀 Deploy

O projeto está configurado para deploy fácil no Vercel:

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. O deploy será automático a cada push na branch main

```bash
# Build local para teste
npm run build
npm run preview
```

## 📈 Roadmap

- [ ] Sistema de notificações push
- [ ] Chat integrado entre orientadores e estudantes
- [ ] API pública para integrações
- [ ] App mobile nativo
- [ ] Sistema de avaliações e reviews
- [ ] Integração com plataformas acadêmicas

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Por favor, leia o guia de contribuição antes de submeter PRs.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

Desenvolvido como Trabalho de Conclusão de Curso com o objetivo de melhorar a experiência acadêmica e tornar mais acessível o processo de desenvolvimento de TCCs.

---

<div align="center">
  <p>Feito com ❤️ para a comunidade acadêmica</p>
  <p>© 2025 EncontraTCC - Todos os direitos reservados</p>
</div>
