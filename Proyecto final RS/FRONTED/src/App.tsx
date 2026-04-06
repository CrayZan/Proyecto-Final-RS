import { useState, useEffect } from "react"
import { Routes, Route, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, ShoppingBag, Settings } from "lucide-react"
import { Toaster } from "sonner" // <-- Nueva importación

import Menu from "./pages/Menu"
import Admin from "./pages/Admin"

const PRODUCTOS_INICIALES = [
  { id: 1, nombre: "Pizza Muzzarella", precio: 8500, categoria: "Pizzas", stock: 20 },
  { id: 2, nombre: "Hamburguesa Completa", precio: 6200, categoria: "Burgers", stock: 15 },
  { id: 3, nombre: "Empanada de Carne", precio: 900, categoria: "Entradas", stock: 50 },
  { id: 4, nombre: "Gaseosa 500ml", precio: 1500, categoria: "Bebidas", stock: 100 },
]

function Home() {
  return (
    <main className="flex-1 max-w-4xl mx-auto w-full p-6 py-12 animate-in fade-in duration-700">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tight mb-4 text-slate-900">
          Resto<span className="text-orange-600">Web</span>
        </h1>
        <p className="text-muted-foreground text-lg italic">San Vicente, Misiones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="hover:shadow-2xl transition-all border-t-4 border-t-orange-500 group overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="mb-2 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform text-orange-600">
              <ShoppingBag />
            </div>
            <CardTitle className="text-2xl font-bold">Punto de Venta</CardTitle>
            <CardDescription>Carga pedidos y envía a cocina por WhatsApp.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg font-bold">
              <Link to="/menu">Abrir Terminal</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-2xl transition-all border-t-4 border-t-slate-800 group overflow-hidden bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <div className="mb-2 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform text-slate-800">
              <Settings />
            </div>
            <CardTitle className="text-2xl font-bold">Administración</CardTitle>
            <CardDescription>Gestiona precios, categorías y productos.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline" className="w-full border-slate-300 h-12 text-lg font-bold hover:bg-slate-900 hover:text-white transition-colors">
              <Link to="/admin">Ir a Ajustes</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

export default function App() {
  const [productos, setProductos] = useState(() => {
    const guardado = localStorage.getItem("restoweb_productos")
    return guardado ? JSON.parse(guardado) : PRODUCTOS_INICIALES
  })

  useEffect(() => {
    localStorage.setItem("restoweb_productos", JSON.stringify(productos))
  }, [productos])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      <Toaster position="top-right" richColors /> {/* <-- El componente que muestra los Toasts */}
      
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <UtensilsCrossed className="h-6 w-6 text-orange-600" />
          <span className="text-xl font-bold tracking-tighter text-slate-900 uppercase">RESTOWEB</span>
        </Link>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-bold">
          SISTEMA ACTIVO
        </Badge>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu productos={productos} />} />
        <Route path="/admin" element={<Admin productos={productos} setProductos={setProductos} />} />
      </Routes>

      <footer className="py-8 text-center text-xs text-slate-400 border-t bg-white mt-auto">
        PROYECTO FINAL RS - DESARROLLO DE SOFTWARE
      </footer>
    </div>
  )
}
