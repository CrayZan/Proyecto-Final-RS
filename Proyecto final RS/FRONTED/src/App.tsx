import { useState, useEffect } from "react"
import { Routes, Route, Link, useSearchParams } from "react-router-dom"
import { Toaster } from "sonner"
import { UtensilsCrossed, Settings, ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import Menu from "./pages/Menu"
import Admin from "./pages/Admin"
import Comandas from "./pages/Comandas" // Nueva página

const PRODUCTOS_INICIALES = [
  { id: 1, nombre: "PIZZA MUZZARELLA", precio: 8500, categoria: "Pizzas", descripcion: "Muzzarella y orégano", imagen: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500" },
  { id: 2, nombre: "HAMBURGUESA COMPLETA", precio: 6200, categoria: "Hamburguesas", descripcion: "Lechuga, tomate, huevo y queso", imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500" }
]

export default function App() {
  const [productos, setProductos] = useState(() => {
    const guardado = localStorage.getItem("restoweb_productos")
    return guardado ? JSON.parse(guardado) : PRODUCTOS_INICIALES
  })

  // Aquí guardaremos los pedidos que llegan de las mesas
  const [pedidos, setPedidos] = useState(() => {
    const guardado = localStorage.getItem("restoweb_pedidos")
    return guardado ? JSON.parse(guardado) : []
  })

  useEffect(() => {
    localStorage.setItem("restoweb_productos", JSON.stringify(productos))
  }, [productos])

  useEffect(() => {
    localStorage.setItem("restoweb_pedidos", JSON.stringify(pedidos))
  }, [pedidos])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Toaster position="top-right" richColors />
      
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-orange-600" />
          <span className="text-xl font-bold tracking-tighter text-slate-900 uppercase">RESTOWEB</span>
        </Link>
        <div className="flex gap-2">
           <Link to="/comandas">
             <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 py-1">
               <ClipboardList size={14} className="mr-1"/> PANEL {pedidos.length > 0 && `(${pedidos.length})`}
             </Badge>
           </Link>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        {/* El menú ahora acepta modo "cliente" si hay un numero de mesa en la URL */}
        <Route path="/menu" element={<Menu productos={productos} setPedidos={setPedidos} />} />
        <Route path="/admin" element={<Admin productos={productos} setProductos={setProductos} />} />
        <Route path="/comandas" element={<Comandas pedidos={pedidos} setPedidos={setPedidos} />} />
      </Routes>

      <footer className="py-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-white mt-auto border-t">
        Sistema de Autogestión - San Vicente, Misiones
      </footer>
    </div>
  )
}

function Home() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full p-6 py-12 flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-black mb-2 italic">BIENVENIDO</h1>
      <p className="text-slate-400 font-bold mb-10 uppercase tracking-tighter">Selecciona tu acceso</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <Link to="/menu?mesa=QR" className="p-8 bg-orange-600 text-white rounded-3xl shadow-xl hover:scale-105 transition-transform">
          <UtensilsCrossed size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-black">VER MENÚ</h2>
          <p className="opacity-80 text-sm">Escaneá y pedí desde tu mesa</p>
        </Link>
        
        <Link to="/admin" className="p-8 bg-slate-900 text-white rounded-3xl shadow-xl hover:scale-105 transition-transform">
          <Settings size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-black">ADMINISTRAR</h2>
          <p className="opacity-80 text-sm">Precios, stock y fotos</p>
        </Link>
      </div>
    </main>
  )
}
