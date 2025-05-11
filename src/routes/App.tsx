import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Home from "./Home"
import Erro from "./Erro"
import Login from "./Login"
import Cadastro from "./Cadastro"
import Dashboard from "./Dashboard"
import ProtectedRoute from "../middleware/ProtectedRoute"
import Profile from "./Profile"
import Communities from "./Communities"
import Community from "./Community"
import CreatePost from "./CreatePost"
import Candidaturas from "./Candidaturas"
import CandidaturasDetalhes from "./CandidaturasDetalhes"
import SearchResults from "./SearchResults"
import SaibaMais from "./SaibaMais"
import TrendingPosts from "./TrendingPosts"
import SolicitarRedefinicaoSenha from "./SolicitarRedefinicaoSenha"
import RedefinirSenha from "./RedefinirSenha"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Erro />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/cadastro",
    element: <Cadastro />,
  },
  {
    path: "/saiba-mais",
    element: <SaibaMais />,
  },
  {
    path: "/em-alta",
    element: (
      <ProtectedRoute>
        <TrendingPosts />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/perfil",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/comunidades",
    element: (
      <ProtectedRoute>
        <Communities />
      </ProtectedRoute>
    ),
  },
  {
    path: "/c/:discriminador",
    element: (
      <ProtectedRoute>
        <Community />
      </ProtectedRoute>
    ),
  },
  {
    path: "/c/:discriminador/criar-postagem",
    element: (
      <ProtectedRoute>
        <CreatePost />
      </ProtectedRoute>
    ),
  },
  {
    path: "/candidaturas",
    element: (
      <ProtectedRoute>
        <Candidaturas />
      </ProtectedRoute>
    ),
  },
  {
    path: "/candidaturas/:id",
    element: (
      <ProtectedRoute>
        <CandidaturasDetalhes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pesquisa",
    element: (
      <ProtectedRoute>
        <SearchResults />
      </ProtectedRoute>
    ),
  },
  {
    path: "/solicitar-redefinicao-senha",
    element: <SolicitarRedefinicaoSenha />,
  },
  {
    path: "/redefinir-senha",
    element: <RedefinirSenha />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
