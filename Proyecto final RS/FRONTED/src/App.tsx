import { useState, useEffect } from "react"
import { Routes, Route, Link, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { UtensilsCrossed, BadgeCheck, CalendarDays, Lock, QrCode, Sparkles, LogOut } from "lucide-react"
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
  const [productos, setProductos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [reservas, setReservas] = useState([])
  const [isAuth, setIsAuth] = useState(false)
  const [temaActual, setTemaActual] = useState(TEMAS.naranja)
  const [perfil, setPerfil] = useState({ nombreLocal: "RESTOAPP", logoUrl: "" })

  useEffect(() => {
    const perfilRef = ref(db, 'config/perfil');
    return onValue(perfilRef, (snapshot) => {
      if (snapshot.exists()) setPerfil(snapshot.val());
    });
  }, []);

  useEffect(() => {
    const temaRef = ref(db, 'config/tema');
    return onValue(temaRef, (snapshot) => {
      const temaKey = snapshot.val();
      setTemaActual(TEMAS[temaKey] || TEMAS.naranja);
    });
  }, []);

  useEffect(() => {
    const prodRef = ref(db, 'productos');
    onValue(prodRef, (snapshot) => {
      const data = snapshot.val()
      if (data) setProductos(Object.keys(data).map(key => ({ id: key, ...data[key] })))
    })
    
    const pedRef = ref(db, 'pedidos');
    onValue(pedRef, (snapshot) => {
      const data = snapshot.val()
      setPedidos(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : [])
    })

    const resRef = ref(db, 'reservas');
    onValue(resRef, (snapshot) => {
      const data = snapshot.val()
      setReservas(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [])
    })
  }, [])

  return (
    <div className={`min-h-screen flex flex-col font-sans relative transition-colors duration-500 ${temaActual.bgPage} ${temaActual.text}`}>
      <Toaster position="top-right" richColors />
      
      {/* HEADER RESPONSIVO */}
      <header className={`border-b ${temaActual.bgHeader} ${temaActual.border} backdrop-blur-md sticky top-0 z-50 px-4 md:px-6 py-3 flex justify-between items-center shadow-sm`}>
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className={`${temaActual.bgIcon} p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg overflow-hidden flex items-center justify-center w-9 h-9 md:w-10 md:h-10`}>
            {perfil.logoUrl ? (
              <img src={perfil.logoUrl} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <UtensilsCrossed className="h-5 w-5 text-white" />
            )}
          </div>
          <span className={`text-base md:text-xl font-black tracking-tighter uppercase italic truncate max-w-[120px] md:max-w-none ${temaActual.text}`}>
            {perfil.nombreLocal}
          </span>
        </Link>
        
        {isAuth && (
          <div className="flex gap-1.5 md:gap-2 items-center">
            {/* MESAS - Visible solo en Desktop o tablets */}
            <Link to="/admin/qrs" className="hidden sm:block">
              <Badge variant="outline" className={`py-1.5 px-3 font-black text-[9px] rounded-full transition-all border ${temaActual.border} ${temaActual.badge}`}>
                <QrCode size={12} className="mr-1.5" /> <span className="hidden lg:inline">MESAS</span>
              </Badge>
            </Link>

            {/* RESERVAS - Texto adaptable */}
            <Link to="/admin">
              <Badge variant="outline" className={`py-1.5 px-3 font-black text-[9px] rounded-full transition-all border ${temaActual.border} ${temaActual.accent} shadow-md`}>
                <CalendarDays size={12} className="mr-1.5" /> 
                <span>{reservas.length} <span className="hidden xs:inline">RESERVAS</span></span>
              </Badge>
            </Link>

            {/* PEDIDOS - Animado y adaptable */}
            <Link to="/comandas">
              <Badge variant="outline" className={`py-1.5 px-3 font-black text-[9px] rounded-full transition-all border ${temaActual.border} ${temaActual.badge} shadow-sm animate-pulse`}>
                <BadgeCheck size={12} className="mr-1.5" /> 
                <span>{pedidos.length} <span className="hidden xs:inline">PEDIDOS</span></span>
              </Badge>
            </Link>
            
            <button 
              onClick={() => setIsAuth(false)} 
              className={`ml-1 p-2 rounded-full transition-colors ${temaActual.badge} hover:bg-red-500 hover:text-white flex items-center justify-center`}
              title="Cerrar Sesión"
            >
              <LogOut size={14} className="md:w-4 md:h-4" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <Routes>
          <Route path="/" element={<Home tema={temaActual} perfil={perfil} />} />
          <Route path="/menu" element={<Menu productos={productos} tema={temaActual} perfil={perfil} />} />
          <Route path="/login" element={<Login onLogin={() => setIsAuth(true)} tema={temaActual} />} />
          <Route path="/admin" element={isAuth ? <Admin productos={productos} tema={temaActual} perfil={perfil} /> : <Navigate to="/login" />} />
          <Route path="/admin/qrs" element={isAuth ? <GeneradorQR tema={temaActual} /> : <Navigate to="/login" />} />
          <Route path="/comandas" element={isAuth ? <Comandas pedidos={pedidos} tema={temaActual} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <footer className="p-6 md:p-8 mt-auto">
        {!isAuth && (
          <Link 
            to="/login" 
            className={`fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40 p-3 md:p-4 rounded-full md:rounded-[2rem] shadow-2xl transition-all flex items-center gap-3 group border ${temaActual.border} ${temaActual.bgHeader} ${temaActual.primary} hover:scale-105 active:scale-95`}
          >
            <Lock size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase italic tracking-[0.2em] hidden sm:inline">Panel Propietario</span>
          </Link>
        )}
        
        <div className="flex flex-col items-center gap-2">
           <div className={`h-1 w-12 rounded-full ${temaActual.bgIcon} opacity-10`} />
           <div className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-center ${temaActual.text}`}>
             San Vicente <span className={temaActual.primary}>•</span> 2026
           </div>
        </div>
      </footer>
    </div>
  )
}
