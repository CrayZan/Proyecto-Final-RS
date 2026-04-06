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
  const [productos, setProductos] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])

  // 1. ESCUCHAR PRODUCTOS DESDE FIREBASE
  useEffect(() => {
    const productosRef = ref(db, 'productos');
    return onValue(productosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setProductos(lista);
      }
    });
  }, []);

  // 2. ESCUCHAR PEDIDOS DESDE FIREBASE
  useEffect(() => {
    const pedidosRef = ref(db, 'pedidos');
    return onValue(pedidosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse();
        setPedidos(lista);
      } else {
        setPedidos([]);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Toaster position="top-right" richColors />
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-orange-600" />
          <span className="text-xl font-bold tracking-tighter uppercase italic">RESTOWEB</span>
        </Link>
        <div className="flex gap-4">
          <Link to="/comandas">
            <Badge variant="outline" className="py-1 font-black uppercase text-[10px]">
              PEDIDOS ({pedidos.length})
            </Badge>
          </Link>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu productos={productos} />} />
        <Route path="/admin" element={<Admin productos={productos} />} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10">
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
