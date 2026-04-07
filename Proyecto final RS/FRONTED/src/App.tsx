import { useState, useEffect } from "react"
import { Routes, Route, Link, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { UtensilsCrossed, BadgeCheck, CalendarDays, Lock, QrCode } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ref, onValue } from "firebase/database"
import { db } from "./lib/firebase"

import Home from "./pages/Home"
import Menu from "./pages/Menu"
import Admin from "./pages/Admin"
import Comandas from "./pages/Comandas"
import GeneradorQR from "./pages/GeneradorQR"
import Login from "./pages/Login"

export default function App() {
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([])
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
      if (data) setReservas(Object.keys(data).map(key => ({ id: key, ...data[key] })))
      else setReservas([])
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <Toaster position="top-right" richColors />
      
      {/* HEADER */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-orange-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-md">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic text-slate-900">
            RESTO<span className="text-orange-600">WEB</span>
          </span>
        </Link>
        
        {isAuth && (
          <div className="flex gap-3 items-center">
            {/* BOTÓN QR AGREGADO AL HEADER PARA ACCESO RÁPIDO */}
            <Link to="/admin/qrs">
              <Badge variant="outline" className="hidden md:flex py-1.5 font-black text-[9px] bg-white border-slate-200 text-slate-600 gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                <QrCode size={12} className="text-orange-500" />
                MESAS
              </Badge>
            </Link>

            <Link to="/admin">
              <Badge variant="outline" className="hidden md:flex py-1.5 font-black text-[9px] bg-slate-900 border-slate-900 text-white gap-2 cursor-pointer hover:bg-orange-600 transition-colors">
                <CalendarDays size={12} className="text-orange-500" />
                RESERVAS ({reservas.length})
              </Badge>
            </Link>

            <Link to="/comandas">
              <Badge variant="outline" className="py-1.5 font-black text-[9px] bg-orange-50 border-orange-200 text-orange-700 cursor-pointer hover:bg-orange-100 transition-colors">
                <BadgeCheck size={12} className="text-orange-500 mr-1" />
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
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu productos={productos} />} />
          <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} />} />
          
          {/* RUTAS PROTEGIDAS */}
          <Route path="/admin" element={isAuth ? <Admin productos={productos} /> : <Navigate to="/login" />} />
          <Route path="/admin/qrs" element={isAuth ? <GeneradorQR /> : <Navigate to="/login" />} />
          <Route path="/comandas" element={isAuth ? <Comandas pedidos={pedidos} /> : <Navigate to="/login" />} />
          
          {/* REDIRECCIÓN POR DEFECTO */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="p-6 mt-auto">
        {!isAuth && (
          <Link 
            to="/login" 
            className="fixed bottom-6 left-6 z-40 bg-white/50 backdrop-blur-sm border border-slate-200 p-3 rounded-2xl shadow-lg text-slate-400 hover:text-orange-600 hover:bg-white hover:shadow-orange-100 transition-all flex items-center gap-2 group"
          >
            <Lock size={16} className="group-hover:animate-bounce" />
            <span className="text-[10px] font-black uppercase italic tracking-widest hidden md:inline">Admin Access</span>
          </Link>
        )}
        
        <div className="text-center text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">
          Powered by RestoWeb • San Vicente
        </div>
      </footer>
    </div>
  )
}
