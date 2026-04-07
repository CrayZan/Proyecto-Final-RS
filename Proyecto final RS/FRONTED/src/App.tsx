import { useState, useEffect } from "react"
import { Routes, Route, Link, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { UtensilsCrossed, BadgeCheck, CalendarDays, Lock, QrCode, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ref, onValue } from "firebase/database"
import { db } from "./lib/firebase"

import Home from "./pages/Home"
import Menu from "./pages/Menu"
import Admin from "./pages/Admin"
import Comandas from "./pages/Comandas"
import GeneradorQR from "./pages/GeneradorQR"
import Login from "./pages/Login"

// DEFINICIÓN DE LOS TEMAS ELEGANTES
const TEMAS = {
  naranja: {
    name: "Orange Passion",
    primary: "text-orange-600",
    bgIcon: "bg-orange-600",
    border: "border-orange-200",
    hover: "hover:bg-orange-600",
    badge: "bg-orange-50 text-orange-700"
  },
  oscuro: {
    name: "Midnight Luxury",
    primary: "text-yellow-500",
    bgIcon: "bg-zinc-800",
    border: "border-zinc-700",
    hover: "hover:bg-yellow-500",
    badge: "bg-zinc-900 text-yellow-500"
  },
  verde: {
    name: "Forest Minimal",
    primary: "text-emerald-600",
    bgIcon: "bg-emerald-600",
    border: "border-emerald-200",
    hover: "hover:bg-emerald-600",
    badge: "bg-emerald-50 text-emerald-700"
  }
}

export default function App() {
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  const [isAuth, setIsAuth] = useState(false)
  
  // Estado para el tema (Por defecto naranja)
  const [temaActual, setTemaActual] = useState(TEMAS.naranja)

  // Escuchar el cambio de tema desde Firebase
  useEffect(() => {
    onValue(ref(db, 'config/tema'), (snapshot) => {
      const temaKey = snapshot.val() || 'naranja';
      // @ts-ignore
      setTemaActual(TEMAS[temaKey] || TEMAS.naranja);
    });
  }, []);

  useEffect(() => {
    onValue(ref(db, 'productos'), (snapshot) => {
      const data = snapshot.val()
      if (data) setProductos(Object.keys(data).map(key => ({ id: key, ...data[key] })))
    })
  }, [])

  useEffect(() => {
    onValue(ref(db, 'pedidos'), (snapshot) => {
      const data = snapshot.val()
      if (data) setPedidos(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse())
      else setPedidos([])
    })
  }, [])

  useEffect(() => {
    onValue(ref(db, 'reservas'), (snapshot) => {
      const data = snapshot.val()
      if (data) setReservas(Object.keys(data).map(key => ({ id: key, ...data[key] })))
      else setReservas([])
    })
  }, [])

  return (
    <div className={`min-h-screen flex flex-col font-sans relative ${temaActual.name === "Midnight Luxury" ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" richColors />
      
      {/* HEADER ELEGANTE */}
      <header className={`border-b ${temaActual.name === "Midnight Luxury" ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-slate-100'} backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm`}>
        <Link to="/" className="flex items-center gap-2 group">
          <div className={`${temaActual.bgIcon} p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg`}>
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
          <span className={`text-xl font-black tracking-tighter uppercase italic ${temaActual.name === "Midnight Luxury" ? 'text-white' : 'text-slate-900'}`}>
            RESTO<span className={temaActual.primary}>WEB</span>
          </span>
        </Link>
        
        {isAuth && (
          <div className="flex gap-2 items-center">
            {/* ACCESOS RÁPIDOS DINÁMICOS */}
            <Link to="/admin/qrs" className="hidden sm:block">
              <Badge variant="outline" className={`py-2 px-4 font-black text-[9px] rounded-full transition-all border-2 ${temaActual.name === "Midnight Luxury" ? 'bg-zinc-800 border-zinc-700 text-yellow-500' : 'bg-white border-slate-100 text-slate-600'}`}>
                <QrCode size={12} className="mr-2" /> MESAS
              </Badge>
            </Link>

            <Link to="/admin">
              <Badge variant="outline" className={`py-2 px-4 font-black text-[9px] rounded-full transition-all border-2 ${temaActual.name === "Midnight Luxury" ? 'bg-yellow-500 border-yellow-500 text-black' : 'bg-slate-900 border-slate-900 text-white'}`}>
                <CalendarDays size={12} className="mr-2" /> RESERVAS ({reservas.length})
              </Badge>
            </Link>

            <Link to="/comandas">
              <Badge variant="outline" className={`py-2 px-4 font-black text-[9px] rounded-full transition-all border-2 ${temaActual.badge} ${temaActual.border} shadow-sm animate-pulse`}>
                <BadgeCheck size={12} className="mr-2" /> PEDIDOS ({pedidos.length})
              </Badge>
            </Link>
            
            <button 
              onClick={() => setIsAuth(false)} 
              className="ml-2 p-2 hover:bg-red-50 rounded-full text-red-400 transition-colors"
              title="Cerrar Sesión"
            >
              <Sparkles size={16} />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu productos={productos} />} />
          <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} />} />
          
          <Route path="/admin" element={isAuth ? <Admin productos={productos} /> : <Navigate to="/login" />} />
          <Route path="/admin/qrs" element={isAuth ? <GeneradorQR /> : <Navigate to="/login" />} />
          <Route path="/comandas" element={isAuth ? <Comandas pedidos={pedidos} /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* FOOTER ADAPTATIVO */}
      <footer className="p-8 mt-auto">
        {!isAuth && (
          <Link 
            to="/login" 
            className={`fixed bottom-8 left-8 z-40 p-4 rounded-[2rem] shadow-2xl transition-all flex items-center gap-3 group border-2 ${temaActual.name === "Midnight Luxury" ? 'bg-zinc-900 border-zinc-700 text-yellow-500' : 'bg-white border-white text-slate-400 hover:text-orange-600'}`}
          >
            <Lock size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase italic tracking-[0.2em] hidden md:inline">Panel Propietario</span>
          </Link>
        )}
        
        <div className="flex flex-col items-center gap-2">
           <div className={`h-1 w-12 rounded-full ${temaActual.bgIcon} opacity-20`} />
           <div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em]">
             San Vicente <span className={temaActual.primary}>•</span> 2026
           </div>
        </div>
      </footer>
    </div>
  )
}
