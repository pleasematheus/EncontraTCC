import { useTheme } from "@/hooks/useTheme"
import Header from "../components/Header"
import Footer from "@/components/Footer"

const Dashboard = () => {
  const {} = useTheme()

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-screen gap-4 bg-base-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bem-vindo à Dashboard!</h1>

          <div className="mt-4 space-y-2">
            <p className="text-lg">
              <span className="font-semibold">Nome:</span>
            </p>
            <p className="text-lg">
              <span className="font-semibold">Email:</span>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Dashboard
