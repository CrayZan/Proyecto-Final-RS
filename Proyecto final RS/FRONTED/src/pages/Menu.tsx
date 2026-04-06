import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ShoppingCart, Trash2, Send, Utensils, MapPin } from "lucide-react"
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
    if (!numeroMesa) return toast.error("¡Ingresá tu número de mesa!")
    if (carrito.length === 0) return toast.error("El carrito está vacío")

    const nuevaComanda = {
      id: Date.now(),
      mesa: numeroMesa.toUpperCase(),
      items: carrito,
      total: total,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    }

    // --- CORRECCIÓN CRÍTICA AQUÍ ---
    // Leemos lo que ya hay en LocalStorage, sumamos lo nuevo y volvemos a guardar
    const pedidosGuardados = JSON.parse(localStorage.getItem("restoweb_pedidos") || "[]")
    const listaActualizada = [nuevaComanda, ...pedidosGuardados]
    localStorage.setItem("restoweb_pedidos", JSON.stringify(listaActualizada))
    
    // Actualizamos el estado global para que el Panel lo vea al instante
    setPedidos(listaActualizada)
    // ------------------------------

    const textoWA = carrito.map(i => `*${i.cant}x* ${i.nombre}`).join('%0A')
    const urlWA = `https://wa.me/542966249538?text=*MESA ${numeroMesa.toUpperCase()} - NUEVO PEDIDO*%0A--------------------------%0A${textoWA}%0A--------------------------%0A*TOTAL: $${total}*`
    
    window.open(urlWA, '_blank')
    setCarrito([])
    toast.success("¡Pedido enviado a la cocina!")
  }

  const productosFiltrados = catSeleccionada === "Todas" ? productos : productos.filter(p => p.categoria === catSeleccionada)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-orange-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-3 rounded-2xl text-orange-500 shadow-inner"><MapPin size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Ubicación</p>
            <input 
              placeholder="Mesa..." 
              className="font-black text-xl text-slate-900 border-none p-0 focus:ring-0 w-32 uppercase"
              value={numeroMesa} 
              onChange={(e) => setNumeroMesa(e.target.value)} 
            />
          </div>
        </div>
        <div className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-3xl italic">${total.toLocaleString('es-AR')}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <ScrollArea className="w-full whitespace-nowrap mb-6">
            <div className="flex space-x-2">
              {categoriasExistentes.map((cat) => (
                <button 
                  key={cat} 
                  className={`rounded-full px-6 h-9 font-black uppercase text-[10px] border transition-all ${catSeleccionada === cat ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-200"}`} 
                  onClick={() => setCatSeleccionada(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {productosFiltrados.map(p => (
              <Card key={p.id} className="overflow-hidden border-none shadow-md bg-white rounded-[2.5rem]">
                <div className="relative h-48 overflow-hidden">
                  <img src={p.imagen} className="w-full h-full object-cover" alt={p.nombre} />
                </div>
                <CardHeader className="pb-1 px-6 pt-6">
                  <CardTitle className="text-lg font-black text-slate-800 uppercase italic leading-tight">{p.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 px-6">
                  <p className="text-[11px] text-slate-400 font-bold italic mb-4 line-clamp-2">{p.descripcion || "Receta tradicional de San Vicente."}</p>
                  <p className="text-2xl font-black text-orange-600 tracking-tighter">${p.precio.toLocaleString('es-AR')}</p>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button onClick={() => agregarAlCarrito(p)} className="w-full bg-slate-900 hover:bg-orange-600 h-12 font-black uppercase rounded-2xl shadow-lg">
                    + Agregar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-fit sticky top-28 border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-orange-600 text-white p-6 text-center">
              <div className="flex items-center justify-center gap-2 font-black uppercase italic tracking-widest text-sm">
                <ShoppingCart className="text-white" size={18}/> Mi Pedido
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-12 text-slate-200 uppercase font-black text-[10px]">Vacío</div>
              ) : (
                carrito.map(item => (
                  <div key={item.id} className="flex justify-between items-start border-b border-slate-50 pb-4">
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-[11px] uppercase leading-tight mb-1">{item.nombre}</div>
                      <div className="text-[10px] text-orange-600 font-black px-2 py-0.5 bg-orange-50 rounded-full w-fit">
                        {item.cant} UNID. — ${(item.precio * item.cant).toLocaleString()}
                      </div>
                    </div>
                    <button onClick={() => setCarrito(prev => prev.filter(i => i.id !== item.id))} className="text-slate-200 hover:text-red-500 ml-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
            {carrito.length > 0 && (
              <CardFooter className="flex-col p-6 bg-slate-50 gap-3">
                <Button onClick={enviarPedidoAlLocal} className="w-full bg-green-600 hover:bg-green-700 h-16 font-black text-lg uppercase shadow-xl shadow-green-100 rounded-2xl">
                  <Send className="mr-2 h-5 w-5" /> ENVIAR PEDIDO
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
