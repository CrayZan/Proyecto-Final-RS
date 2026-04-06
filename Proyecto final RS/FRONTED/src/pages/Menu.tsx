import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ShoppingCart, ArrowLeft, Plus, Trash2, Send } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

export default function Menu({ productos }: { productos: any[] }) {
  const [carrito, setCarrito] = useState<{id: number, nombre: string, precio: number, cant: number}[]>([])
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")

  const categoriasExistentes = ["Todas", ...new Set(productos.map(p => p.categoria))]

  const agregarAlCarrito = (p: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === p.id)
      if (existe) return prev.map(item => item.id === p.id ? {...item, cant: item.cant + 1} : item)
      return [...prev, { ...p, cant: 1 }]
    })
    toast.success(`+1 ${p.nombre}`)
  }

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)

  const productosFiltrados = catSeleccionada === "Todas" ? productos : productos.filter(p => p.categoria === catSeleccionada)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <Link to="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900">
          <ArrowLeft /> MENU <span className="text-orange-600">VISUAL</span>
        </Link>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-full font-black scale-110 shadow-lg">
          ${total.toLocaleString('es-AR')}
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-6">
        <div className="flex space-x-2">
          {categoriasExistentes.map((cat) => (
            <Button key={cat} variant={catSeleccionada === cat ? "default" : "outline"} className={`rounded-full px-6 font-bold ${catSeleccionada === cat ? "bg-orange-600" : ""}`} onClick={() => setCatSeleccionada(cat)}>{cat}</Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {productosFiltrados.map(p => (
            <Card key={p.id} className="overflow-hidden border-none shadow-lg group hover:scale-[1.02] transition-all bg-white">
              {/* LA IMAGEN DEL PLATO */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={p.imagen || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={p.nombre}
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm font-bold border-none">
                    {p.categoria}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">{p.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-orange-600">${p.precio.toLocaleString('es-AR')}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => agregarAlCarrito(p)} className="w-full bg-slate-900 h-12 font-bold text-lg rounded-xl">
                  AGREGAR AHORA
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CARRITO (Igual que antes) */}
        <Card className="h-fit sticky top-24 border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-orange-600 text-white p-4 text-center font-black uppercase tracking-widest">Tu Pedido</CardHeader>
          <CardContent className="p-4 space-y-3">
            {carrito.length === 0 ? <p className="text-center text-slate-300 py-10">Vacío</p> : 
              carrito.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm font-bold border-b pb-2">
                  <span>{item.nombre} (x{item.cant})</span>
                  <span>${(item.precio * item.cant).toLocaleString()}</span>
                </div>
              ))
            }
          </CardContent>
          {carrito.length > 0 && (
            <CardFooter className="flex-col p-4 bg-slate-50 border-t">
               <Button onClick={() => window.open(`https://wa.me/?text=Pedido: ${total}`, '_blank')} className="w-full bg-green-600 h-14 font-black text-lg shadow-md mb-2">PEDIR POR WHATSAPP</Button>
               <Button variant="ghost" onClick={() => setCarrito([])} className="text-xs text-slate-400">VACIAR</Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
