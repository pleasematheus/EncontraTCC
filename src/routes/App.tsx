import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Home from "./Home"
import Erro from "./Erro"
import Login from "./Login"
import Cadastro from "./Cadastro"
import Dashboard from "./Dashboard"
import ProtectedRoute from "../middleware/ProtectedRoute" // Importe o componente de rota protegida

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
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
])

export default function App() {
  return <RouterProvider router={router} />
}