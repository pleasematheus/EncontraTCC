import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Home from "./Home"
import Erro from "./Erro"
import Login from "./Login"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Erro />,
  },
  {
    path: "/login",
    element: <Login/>
  }
])

export default function App() {
  return <RouterProvider router={router} />
}