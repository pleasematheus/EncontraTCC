import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Home from "./Home"
import Erro from "./Erro"
import Login from "./Login"
import Cadastro from "./Cadastro"
import Dashboard from "./Dashboard"
import ProtectedRoute from "../middleware/ProtectedRoute"
import Profile from "./Profile"

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
  {
    path: "/perfil",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
])

export default function App() {
  return <RouterProvider router={router} />
}