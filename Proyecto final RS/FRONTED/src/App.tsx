import { useState, useEffect } from "react"
import { Routes, Route, Link, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { UtensilsCrossed, BadgeCheck, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ref, onValue } from "firebase/database"
import { db } from "./lib/firebase"

import Home from "./pages/Home" // IMPORTAMOS TU NUEVA PÁGINA
import Menu from "./pages/Menu"
import Admin from "./pages/Admin"
import Comandas from "./pages/Comandas"
import GeneradorQR from "./pages/GeneradorQR"
import Login from "./pages/Login"

export default function App() {
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([]) // ESTADO PARA RESERVAS
  const [isAuth, setIsAuth] = useState(false)

  // Cargar Productos
  useEffect(() => {
    onValue(ref(db, 'productos'), (snapshot) => {
      const data = snapshot.val()
      if (data) setProductos(Object.keys(data).map(key => ({ id: key, ...data[key] })))
    })
  }, [])

  // Cargar Pedidos
  useEffect(() => {
    onValue(ref(db, 'pedidos'), (snapshot) => {
      const data = snapshot.val()
      if (data) setPedidos(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse())
      else setPedidos([])
    })
  }, [])

  // Cargar Reservas
  useEffect(() => {
    onValue(ref(db, 'reservas'), (snapshot) => {
      const data = snapshot.val()
      if (data) setReservas(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse())
      else setReservas([])
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Toaster position="top-right" richColors />
      
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-orange-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">
            RESTO<span className="text-orange-600">WEB</span>
          </span>
        </Link>
        
        {isAuth && (
          <div className="flex gap-3 items-center">
            {/* Indicador de Reservas */}
            <Link to="/admin">
              <Badge variant="outline" className="hidden md:flex py-1.5 font-black text-[9px] bg-slate-900 border-slate-900 text-white gap-2">
                <CalendarDays size={12} className="text-orange-500" />
                RESERVAS ({reservas.length})
              </Badge>
            </Link>

            {/* Indicador de Pedidos */}
            <Link to="/comandas">
              <Badge variant="outline" className="py-1.5 font-black text-[9px] bg-orange-50 border-orange-200 text-orange-700">
                PEDIDOS ({pedidos.length})
              </Badge>
            </Link>
            
            <button 
              onClick={() => setIsAuth(false)} 
              className="ml-2 text-[10px] font-black text-slate-300 uppercase hover:text-red-500 transition-colors"
            >
              Salir
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Routes>
          {/* Ahora la ruta principal carga el componente Home con el botón de reserva */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu productos={productos} />} />
          
          <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} />} />
          
          {/* Rutas protegidas pasan el estado de reservas al Admin si lo necesita */}
          <Route path="/admin" element={isAuth ? <Admin productos={productos} /> : <Navigate to="/login" />} />
          <Route path="/admin/qrs" element={isAuth ? <GeneradorQR /> : <Navigate to="/login" />} />
          <Route path="/comandas" element={isAuth ? <Comandas pedidos={pedidos} /> : <Navigate to="/login" />} />
        </Routes>
      </main>
    </div>
  )
}
