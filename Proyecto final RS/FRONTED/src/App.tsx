import { useState, useEffect } from "react"
import { Routes, Route, Link, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { UtensilsCrossed, BadgeCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ref, onValue } from "firebase/database"
import { db } from "./lib/firebase"

import Menu from "./pages/Menu"
import Admin from "./pages/Admin"
import Comandas from "./pages/Comandas"
import GeneradorQR from "./pages/GeneradorQR"
import Login from "./pages/Login"

export default function App() {
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [isAuth, setIsAuth] = useState(false) // ESTADO DE LOGIN

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Toaster position="top-right" richColors />
      
      {/* HEADER LIMPIO: Solo logo y contador de pedidos si estás logueado */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-orange-600" />
          <span className="text-xl font-bold tracking-tighter uppercase italic">RESTOWEB</span>
        </Link>
        
        {isAuth && (
          <div className="flex gap-4 items-center">
            <Link to="/comandas">
              <Badge variant="outline" className="py-1 font-black text-[10px] bg-orange-50 border-orange-200 text-orange-700">
                PEDIDOS EN CURSO ({pedidos.length})
              </Badge>
            </Link>
            <button onClick={() => setIsAuth(false)} className="text-[10px] font-black text-slate-300 uppercase hover:text-red-500">Salir</button>
          </div>
        )}
      </header>

      <Routes>
        <Route path="/" element={<Home isAuth={isAuth} />} />
        <Route path="/menu" element={<Menu productos={productos} />} />
        
        {/* RUTAS PROTEGIDAS */}
        <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} />} />
        <Route path="/admin" element={isAuth ? <Admin productos={productos} /> : <Navigate to="/login" />} />
        <Route path="/admin/qrs" element={isAuth ? <GeneradorQR /> : <Navigate to="/login" />} />
        <Route path="/comandas" element={isAuth ? <Comandas pedidos={pedidos} /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

function Home({ isAuth }: { isAuth: boolean }) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="space-y-2 mb-12">
        <h1 className="text-8xl font-black italic tracking-tighter text-slate-900">RESTOWEB</h1>
        <p className="text-orange-600 font-black uppercase tracking-[0.3em] text-sm">San Vicente · Misiones</p>
      </div>

      <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
        <Link to="/menu?mesa=GENERAL" className="group p-8 bg-orange-600 text-white rounded-[2.5rem] shadow-2xl hover:bg-orange-700 transition-all transform hover:-translate-y-1">
          <UtensilsCrossed size={40} className="mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase italic">Ver Nuestra Carta</h2>
        </Link>

        {/* El botón de admin solo se muestra si ya estás logueado, sino queda oculto */}
        {isAuth ? (
          <Link to="/admin" className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl flex items-center justify-center gap-3">
            <BadgeCheck size={20} className="text-green-400" />
            <span className="font-black uppercase italic">Panel de Control</span>
          </Link>
        ) : (
          <Link to="/login" className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-10 hover:text-slate-900 transition-colors">
            Acceso Personal
          </Link>
        )}
      </div>
    </main>
  )
}
