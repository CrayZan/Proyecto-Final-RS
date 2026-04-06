import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { ShoppingCart, ArrowLeft, Trash2, Send, Utensils, MapPin } from "lucide-react"
import { toast } from "sonner"

export default function Menu({ productos, setPedidos }: { productos: any[], setPedidos: any }) {
  const [searchParams] = useSearchParams()
  const mesaDesdeURL = searchParams.get("mesa")
  
  const [carrito, setCarrito] = useState<{id: number, nombre: string, precio: number, cant: number}[]>([])
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")
  const [numeroMesa, setNumeroMesa] = useState(mesaDesdeURL || "")

  const categoriasExistentes = ["Todas", ...new Set(productos.map(p => p.categoria))]
  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)

  const agregarAlCarrito = (p: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === p.id)
      if (existe) return prev.map(item => item.id === p.id ? {...item, cant: item.cant + 1} : item)
      return [...prev, { ...p, cant: 1 }]
    })
    toast.success(`Agregado: ${p.nombre}`)
  }

  const enviarPedidoAlLocal = () => {
    if (!numeroMesa) {
      return toast.error("¡Por favor, ingresá tu número de mesa!")
    }
    if (carrito.length === 0) return toast.error("El carrito está vacío")

    // 1. CREAMOS LA COMANDA PARA EL PANEL INTERNO
    const nuevaComanda = {
      id: Date.now(),
      mesa: numeroMesa,
      items: carrito,
      total: total,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    }

    setPedidos((prev: any) => [nuevaComanda, ...prev])

    // 2. GENERAMOS EL WHATSAPP DE RESPALDO
    const textoWA = carrito.map(i => `*${i.cant}x* ${i.nombre}`).join('%0A')
    const urlWA = `https://wa.me/5493755000000?text=*MESA ${numeroMesa} - NUEVO PEDIDO*%0A--------------------------%0A${textoWA}%0A--------------------------%0A*TOTAL: $${total}*`
    
    window.open(urlWA, '_blank')
    
    setCarrito([])
    toast.success("¡Pedido enviado a la cocina!", {
      description: "Tu pedido ya figura en nuestro monitor.",
      duration: 5000
    })
  }

  const productosFiltrados = catSeleccionada === "Todas" ? productos : productos.filter(p => p.categoria === catSeleccionada)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* SECCIÓN MESA */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-orange-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-2 rounded-xl text-white">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Tu Ubicación</p>
            <input 
              placeholder="Número de Mesa"
              className="font-black text-xl text-slate-900 border-none p-0 focus:ring-0 w-32 uppercase"
              value={numeroMesa}
              onChange={(e) => setNumeroMesa(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-2xl shadow-lg">
          TOTAL: ${total.toLocaleString('es-AR')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <ScrollArea className="w-full whitespace-nowrap mb-6">
            <div className="flex space-x-2">
              {categoriasExistentes.map((cat) => (
                <Button 
                  key={cat} 
                  variant={catSeleccionada === cat ? "default" : "outline"} 
                  className={`rounded-full px-6 font-bold ${catSeleccionada === cat ? "bg-orange-600" : "text-slate-500"}`} 
                  onClick={() => setCatSeleccionada(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {productosFiltrados.map(p => (
              <Card key={p.id} className="overflow-hidden border-none shadow-md group hover:shadow-xl transition-all bg-white flex flex-col rounded-3xl">
                <div className="relative h-44 overflow-hidden">
                  <img src={p.imagen} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.nombre} />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-slate-900 border-none font-black text-[10px]">{p.categoria}</Badge>
                </div>
                <CardHeader className="pb-1 px-5">
                  <CardTitle className="text-lg font-black text-slate-800 uppercase leading-tight">{p.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-5">
                  <p className="text-xs text-slate-400 font-bold italic mb-3 line-clamp-2">{p.descripcion || "Receta tradicional de la casa."}</p>
                  <p className="text-2xl font-black text-slate-900">${p.precio.toLocaleString('es-AR')}</p>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Button onClick={() => agregarAlCarrito(p)} className="w-full bg-orange-600 hover:bg-slate-900 h-11 font-black uppercase rounded-xl transition-colors">
                    + Agregar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* CARRITO TIPO TICKET */}
        <div className="lg:col-span-1">
          <Card className="h-fit sticky top-28 border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-5 text-center">
              <div className="flex items-center justify-center gap-2 font-black uppercase italic tracking-tighter">
                <ShoppingCart className="text-orange-500" size={20}/> MI PEDIDO
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-10 text-slate-300">
                  <Utensils className="mx-auto mb-2 opacity-20" size={40}/>
                  <p className="text-xs font-bold uppercase italic">Tu panza te está esperando...</p>
                </div>
              ) : (
                carrito.map(item => (
                  <div key={item.id} className="flex justify-between items-start border-b border-slate-50 pb-3">
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-xs uppercase">{item.nombre}</div>
                      <div className="text-[10px] text-orange-600 font-black">X{item.cant} — ${(item.precio * item.cant).toLocaleString()}</div>
                    </div>
                    <button onClick={() => setCarrito(prev => prev.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
            {carrito.length > 0 && (
              <CardFooter className="flex-col p-6 bg-slate-50 gap-3">
                <Button onClick={enviarPedidoAlLocal} className="w-full bg-green-600 hover:bg-green-700 h-16 font-black text-lg uppercase shadow-lg shadow-green-200">
                  <Send className="mr-2 h-5 w-5" /> ENVIAR AL LOCAL
                </Button>
                <Button variant="ghost" onClick={() => setCarrito([])} className="text-[10px] text-slate-400 font-black uppercase">Cancelar todo</Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
