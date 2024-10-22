import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

import Home from "./routes/Home.tsx"
import Erro from "./routes/Erro.tsx"

import "./index.css"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Erro/>
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)