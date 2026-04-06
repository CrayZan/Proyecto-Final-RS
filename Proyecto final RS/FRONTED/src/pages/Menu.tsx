import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ShoppingCart, ArrowLeft, Plus, Trash2, Send, Info } from "lucide-react"
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
          <ArrowLeft /> RESTO<span className="text-orange-600">WEB</span>
        </Link>
        <div className="bg-slate-900 text-white px-4 py-2 rounded-full font-black shadow-lg">
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
            <Card key={p.id} className="overflow-hidden border-none shadow-lg group hover:scale-[1.02] transition-all bg-white flex flex-col">
              <div className="relative h-44 overflow-hidden">
                <img src={p.imagen} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.nombre} />
                <Badge className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white border-none font-bold uppercase text-[9px]">{p.categoria}</Badge>
              </div>

              <CardHeader className="pb-1">
                <CardTitle className="text-lg font-black text-slate-800 uppercase tracking-tight">{p.nombre}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1">
                {/* LA DESCRIPCIÓN APARECE AQUÍ */}
                <p className="text-xs text-slate-400 font-medium leading-relaxed italic mb-2">
                  {p.descripcion || "Consulte ingredientes al mozo."}
                </p>
                <p className="text-2xl font-black text-orange-600">${p.precio.toLocaleString('es-AR')}</p>
              </CardContent>

              <CardFooter>
                <Button onClick={() => agregarAlCarrito(p)} className="w-full bg-slate-900 h-11 font-bold text-sm uppercase rounded-xl">
                  AGREGAR
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CARRITO */}
        <Card className="h-fit sticky top-24 border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-orange-600 text-white p-4 text-center font-black uppercase text-sm tracking-widest">Pedido Actual</CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
            {carrito.length === 0 ? <p className="text-center text-slate-300 py-6 text-sm">No hay productos</p> : 
              carrito.map(item => (
                <div key={item.id} className="flex justify-between items-center text-xs font-bold border-b pb-2">
                  <span>{item.nombre} (x{item.cant})</span>
                  <span className="text-orange-600">${(item.precio * item.cant).toLocaleString()}</span>
                </div>
              ))
            }
          </CardContent>
          {carrito.length > 0 && (
            <CardFooter className="flex-col p-4 bg-slate-50 border-t">
               <div className="flex justify-between w-full mb-3 font-black text-lg"><span>TOTAL:</span><span>${total.toLocaleString()}</span></div>
               <Button onClick={() => window.open(`https://wa.me/?text=Nuevo Pedido: ${total}`, '_blank')} className="w-full bg-green-600 h-12 font-black text-sm uppercase shadow-md mb-2">ENVIAR WHATSAPP</Button>
               <Button variant="ghost" onClick={() => setCarrito([])} className="text-[10px] text-slate-400 uppercase font-black">Limpiar Carrito</Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
