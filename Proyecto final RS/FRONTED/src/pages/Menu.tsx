import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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

    // 2. GENERAMOS EL WHATSAPP CON TU NÚMERO ACTUALIZADO
    const textoWA = carrito.map(i => `*${i.cant}x* ${i.nombre}`).join('%0A')
    const urlWA = `https://wa.me/542966249538?text=*MESA ${numeroMesa.toUpperCase()} - NUEVO PEDIDO*%0A--------------------------%0A${textoWA}%0A--------------------------%0A*TOTAL: $${total}*`
    
    window.open(urlWA, '_blank')
    
    setCarrito([])
    toast.success("¡Pedido enviado!", {
      description: "Recibimos tu comanda en el panel y por WhatsApp.",
      duration: 5000
    })
  }

  const productosFiltrados = catSeleccionada === "Todas" ? productos : productos.filter(p => p.categoria === catSeleccionada)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* SECCIÓN MESA Y TOTAL */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-orange-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-3 rounded-2xl text-orange-500 shadow-inner">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Ubicación Actual</p>
            <input 
              placeholder="Ej: Mesa 5"
              className="font-black text-xl text-slate-900 border-none p-0 focus:ring-0 w-32 uppercase placeholder:text-slate-200"
              value={numeroMesa}
              onChange={(e) => setNumeroMesa(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-3xl shadow-xl shadow-orange-100 italic tracking-tighter">
          ${total.toLocaleString('es-AR')}
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
                  className={`rounded-full px-6 font-black uppercase text-[11px] h-9 tracking-widest ${catSeleccionada === cat ? "bg-slate-900" : "text-slate-400 border-slate-200"}`} 
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
              <Card key={p.id} className="overflow-hidden border-none shadow-md group hover:shadow-2xl transition-all duration-300 bg-white flex flex-col rounded-[2.5rem]">
                <div className="relative h-48 overflow-hidden">
                  <img src={p.imagen} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.nombre} />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/40 backdrop-blur-md text-white border-none font-black text-[9px] uppercase px-3 py-1">
                      {p.categoria}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-1 px-6 pt-6">
                  <CardTitle className="text-lg font-black text-slate-800 uppercase leading-tight tracking-tight">{p.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-6">
                  <p className="text-[11px] text-slate-400 font-bold italic mb-4 line-clamp-2 leading-relaxed">
                    {p.descripcion || "Receta artesanal elaborada con ingredientes seleccionados de San Vicente."}
                  </p>
                  <p className="text-2xl font-black text-orange-600 tracking-tighter">${p.precio.toLocaleString('es-AR')}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button onClick={() => agregarAlCarrito(p)} className="w-full bg-slate-900 hover:bg-orange-600 h-12 font-black uppercase rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-100">
                    + Agregar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* CARRITO MODO TICKET TÉRMICO */}
        <div className="lg:col-span-1">
          <Card className="h-fit sticky top-28 border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-orange-600 text-white p-6 text-center">
              <div className="flex items-center justify-center gap-2 font-black uppercase italic tracking-widest text-sm">
                <ShoppingCart className="text-white" size={18}/> Tu Pedido
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-12 text-slate-200">
                  <Utensils className="mx-auto mb-4 opacity-10" size={60}/>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Elegí algo rico<br/>para empezar</p>
                </div>
              ) : (
                carrito.map(item => (
                  <div key={item.id} className="flex justify-between items-start border-b border-slate-50 pb-4">
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-[11px] uppercase tracking-tighter leading-tight mb-1">{item.nombre}</div>
                      <div className="text-[10px] text-orange-600 font-black px-2 py-0.5 bg-orange-50 rounded-full w-fit">
                        {item.cant} UNID. — ${(item.precio * item.cant).toLocaleString()}
                      </div>
                    </div>
                    <button onClick={() => setCarrito(prev => prev.filter(i => i.id !== item.id))} className="text-slate-200 hover:text-red-500 transition-colors ml-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
            {carrito.length > 0 && (
              <CardFooter className="flex-col p-6 bg-slate-50 gap-3 border-t border-dashed border-slate-200">
                <Button onClick={enviarPedidoAlLocal} className="w-full bg-green-600 hover:bg-green-700 h-16 font-black text-lg uppercase shadow-xl shadow-green-100 rounded-2xl active:scale-95 transition-all">
                  <Send className="mr-2 h-5 w-5" /> ENVIAR PEDIDO
                </Button>
                <button onClick={() => setCarrito([])} className="text-[10px] text-slate-300 font-black uppercase tracking-widest hover:text-red-400 transition-colors">Vaciar carrito</button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
