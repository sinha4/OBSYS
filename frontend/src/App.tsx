import { useEffect, useState } from "react"
import Dashboard from "./pages/Dashboard"
import Preloader from "./components/Preloader"

function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      {isLoading ? <Preloader /> : <Dashboard />}
    </div>
  )
}

export default App
