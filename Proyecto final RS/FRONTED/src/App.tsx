import { useState, useEffect } from "react"
import { Routes, Route, Link } from "react-router-dom"
import { Toaster } from "sonner"
import { UtensilsCrossed, ClipboardList, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ref, onValue } from "firebase/database"
import { db } from "./lib/firebase"

import Menu from "./pages/Menu"
import Admin from "./pages/Admin"
import Comandas from "./pages/Comandas"
import GeneradorQR from "./pages/GeneradorQR"

export default function App() {
  const [productos, setProductos] = useState(() => {
    const g = localStorage.getItem("restoweb_productos")
    return g ? JSON.parse(g) : []
  })

  const [pedidos, setPedidos] = useState<any[]>([])

  // ESCUCHAR PEDIDOS EN TIEMPO REAL DESDE FIREBASE
  useEffect(() => {
    const pedidosRef = ref(db, 'pedidos');
    return onValue(pedidosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).reverse(); 
        setPedidos(lista);
      } else {
        setPedidos([]);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("restoweb_productos", JSON.stringify(productos))
  }, [productos])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Toaster position="top-right" richColors />
      
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-orange-600" />
          <span className="text-xl font-bold tracking-tighter uppercase italic">RESTOWEB</span>
        </Link>
        <Link to="/comandas">
          <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 py-1 font-black uppercase text-[10px]">
            <ClipboardList size={14} className="mr-1 text-orange-600"/> PEDIDOS ({pedidos.length})
          </Badge>
        </Link>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu productos={productos} />} />
        <Route path="/admin" element={<Admin productos={productos} setProductos={setProductos} />} />
        <Route path="/admin/qrs" element={<GeneradorQR />} />
        <Route path="/comandas" element={<Comandas pedidos={pedidos} />} />
      </Routes>
    </div>
  )
}

function Home() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full p-6 py-12 flex flex-col items-center justify-center text-center">
      <h1 className="text-7xl font-black mb-2 italic tracking-tighter">RESTOWEB</h1>
      <p className="text-slate-400 font-bold mb-10 uppercase tracking-widest text-xs">San Vicente - Panel de Control</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <Link to="/menu?mesa=GENERAL" className="p-10 bg-orange-600 text-white rounded-[3rem] shadow-2xl hover:scale-105 transition-all">
          <UtensilsCrossed size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase italic">Ver Menú</h2>
        </Link>
        <Link to="/admin" className="p-10 bg-slate-900 text-white rounded-[3rem] shadow-2xl hover:scale-105 transition-all">
          <Settings size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase italic">Administración</h2>
        </Link>
      </div>
    </main>
  )
}
