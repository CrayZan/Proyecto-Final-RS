import { useState, useEffect } from "react"
import { Routes, Route, Link, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { UtensilsCrossed, BadgeCheck, CalendarDays, Lock, QrCode, Sparkles, Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ref, onValue } from "firebase/database"
import { db } from "./lib/firebase"

import Home from "./pages/Home"
import Menu from "./pages/Menu"
import Admin from "./pages/Admin"
import Comandas from "./pages/Comandas"
import GeneradorQR from "./pages/GeneradorQR"
import Login from "./pages/Login"

const TEMAS = {
  naranja: {
    name: "Crema Coffee",
    primary: "text-[#8B5E3C]",
    bgPage: "bg-[#FDFBF7]",
    bgHeader: "bg-[#FDFBF7]/80",
    bgIcon: "bg-[#8B5E3C]",
    border: "border-[#E8E2D9]",
    badge: "bg-[#E8E2D9] text-[#5D4037]",
    text: "text-[#4A3F35]",
    accent: "bg-[#8B5E3C] text-[#FDFBF7]"
  },
  oscuro: {
    name: "Midnight Luxury",
    primary: "text-[#D4AF37]",
    bgPage: "bg-[#1A1A1C]",
    bgHeader: "bg-[#242426]/80",
    bgIcon: "bg-[#D4AF37]",
    border: "border-[#323235]",
    badge: "bg-[#2D2D30] text-[#D4AF37]",
    text: "text-[#C2C2C2]",
    accent: "bg-[#D4AF37] text-[#1A1A1C]"
  },
  verde: {
    name: "Forest Minimal",
    primary: "text-[#4E6E5D]",
    bgPage: "bg-[#F2F5F3]",
    bgHeader: "bg-[#F2F5F3]/80",
    bgIcon: "bg-[#4E6E5D]",
    border: "border-[#D1D9D4]",
    badge: "bg-[#D1D9D4] text-[#2F4035]",
    text: "text-[#2F4035]",
    accent: "bg-[#4E6E5D] text-[#F2F5F3]"
  }
}

export default function App() {
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  const [isAuth, setIsAuth] = useState(false)
  const [temaActual, setTemaActual] = useState(TEMAS.naranja)
  
  // --- NUEVO ESTADO PARA EL PERFIL DEL LOCAL ---
  const [perfil, setPerfil] = useState({
    nombreLocal: "RESTOAPP",
    logoUrl: ""
  })

  // 1. Escuchar Perfil del Local (Nombre y Logo)
  useEffect(() => {
    const perfilRef = ref(db, 'config/perfil');
    return onValue(perfilRef, (snapshot) => {
      if (snapshot.exists()) {
        setPerfil(snapshot.val());
      }
    });
  }, []);

  // 2. Escuchar Tema
  useEffect(() => {
    const temaRef = ref(db, 'config/tema');
    const unsubscribe = onValue(temaRef, (snapshot) => {
      const temaKey = snapshot.val();
      if (temaKey && TEMAS[temaKey as keyof typeof TEMAS]) {
        setTemaActual(TEMAS[temaKey as keyof typeof TEMAS]);
      } else {
        setTemaActual(TEMAS.naranja);
      }
    });
    return () => unsubscribe();
  }, []);

  // 3. Carga de Productos, Pedidos y Reservas (Se mantienen igual)
  useEffect(() => {
    const prodRef = ref(db, 'productos');
    return onValue(prodRef, (snapshot) => {
      const data = snapshot.val()
      if (data) setProductos(Object.keys(data).map(key => ({ id: key, ...data[key] })))
    })
  }, [])

  useEffect(() => {
    const pedRef = ref(db, 'pedidos');
    return onValue(pedRef, (snapshot) => {
      const data = snapshot.val()
      if (data) setPedidos(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse())
      else setPedidos([])
    })
  }, [])

  useEffect(() => {
    const resRef = ref(db, 'reservas');
    return onValue(resRef, (snapshot) => {
      const data = snapshot.val()
      if (data) setReservas(Object.keys(data).map(key => ({ id: key, ...data[key] })))
      else setReservas([])
    })
  }, [])

  return (
    <div className={`min-h-screen flex flex-col font-sans relative transition-colors duration-500 ${temaActual.bgPage} ${temaActual.text}`}>
      <Toaster position="top-right" richColors />
      
      <header className={`border-b ${temaActual.bgHeader} ${temaActual.border} backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm`}>
        <Link to="/" className="flex items-center gap-2 group">
          <div className={`${temaActual.bgIcon} p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg overflow-hidden flex items-center justify-center w-10 h-10`}>
            {/* Si hay logoUrl, lo mostramos, si no, el icono por defecto */}
            {perfil.logoUrl ? (
              <img src={perfil.logoUrl} className="w-full h-full object-cover" />
            ) : (
              <UtensilsCrossed className="h-5 w-5 text-white" />
            )}
          </div>
          <span className={`text-xl font-black tracking-tighter uppercase italic ${temaActual.text}`}>
            {perfil.nombreLocal}
          </span>
        </Link>
        
        {isAuth && (
          <div className="flex gap-2 items-center">
            <Link to="/admin/qrs" className="hidden sm:block">
              <Badge variant="outline" className={`py-2 px-4 font-black text-[9px] rounded-full transition-all border ${temaActual.border} ${temaActual.badge}`}>
                <QrCode size={12} className="mr-2" /> MESAS
              </Badge>
            </Link>

            <Link to="/admin">
              <Badge variant="outline" className={`py-2 px-4 font-black text-[9px] rounded-full transition-all border ${temaActual.border} ${temaActual.accent} shadow-md`}>
                <CalendarDays size={12} className="mr-2" /> RESERVAS ({reservas.length})
              </Badge>
            </Link>

            <Link to="/comandas">
              <Badge variant="outline" className={`py-2 px-4 font-black text-[9px] rounded-full transition-all border ${temaActual.border} ${temaActual.badge} shadow-sm animate-pulse`}>
                <BadgeCheck size={12} className="mr-2" /> PEDIDOS ({pedidos.length})
              </Badge>
            </Link>
            
            <button 
              onClick={() => setIsAuth(false)} 
              className={`ml-2 p-2 rounded-full transition-colors ${temaActual.badge} hover:bg-red-500 hover:text-white`}
              title="Cerrar Sesión"
            >
              <Sparkles size={16} />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Routes>
          {/* PASAMOS PERFIL COMO PROP A LAS RUTAS */}
          <Route path="/" element={<Home tema={temaActual} perfil={perfil} />} />
          <Route path="/menu" element={<Menu productos={productos} tema={temaActual} perfil={perfil} />} />
          <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} tema={temaActual} />} />
          
          <Route path="/admin" element={isAuth ? <Admin productos={productos} tema={temaActual} perfil={perfil} /> : <Navigate to="/login" />} />
          <Route path="/admin/qrs" element={isAuth ? <GeneradorQR tema={temaActual} /> : <Navigate to="/login" />} />
          <Route path="/comandas" element={isAuth ? <Comandas pedidos={pedidos} tema={temaActual} /> : <Navigate to="/login" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer className="p-8 mt-auto">
        {!isAuth && (
          <Link 
            to="/login" 
            className={`fixed bottom-8 left-8 z-40 p-4 rounded-[2rem] shadow-2xl transition-all flex items-center gap-3 group border ${temaActual.border} ${temaActual.bgHeader} ${temaActual.primary} hover:scale-105`}
          >
            <Lock size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase italic tracking-[0.2em] hidden md:inline">Panel Propietario</span>
          </Link>
        )}
        
        <div className="flex flex-col items-center gap-2">
           <div className={`h-1 w-12 rounded-full ${temaActual.bgIcon} opacity-10`} />
           <div className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-40 ${temaActual.text}`}>
             San Vicente <span className={temaActual.primary}>•</span> 2026
           </div>
        </div>
      </footer>
    </div>
  )
}
