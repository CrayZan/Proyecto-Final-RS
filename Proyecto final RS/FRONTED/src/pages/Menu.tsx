import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Send, MapPin, Trash2, Info, Star } from "lucide-react"
import { toast } from "sonner"
import { ref, push, onValue } from "firebase/database"
import { db } from "../lib/firebase"

export default function Menu({ productos }: { productos: any[] }) {
  const [searchParams] = useSearchParams()
  const [carrito, setCarrito] = useState<any[]>([])
  const [numeroMesa, setNumeroMesa] = useState(searchParams.get("mesa") || "")
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")
  
  // ESTADO PARA LA PROMO TEMPORAL
  const [promo, setPromo] = useState<any>(null)

  // Cargar Promo desde Firebase
  useEffect(() => {
    onValue(ref(db, 'config/promo'), (snapshot) => {
      setPromo(snapshot.val())
    })
  }, [])

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)
  const categorias = ["Todas", ...new Set(productos.map(p => p.categoria))]

  const enviarPedido = async () => {
    if (!numeroMesa) return toast.error("¡Ingresá el N° de Mesa!")
    if (carrito.length === 0) return toast.error("El carrito está vacío")

    const nuevoPedido = {
      mesa: numeroMesa.toUpperCase(),
      items: carrito,
      total: total,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      estado: "pendiente"
    }

    try {
      await push(ref(db, 'pedidos'), nuevoPedido)
      
      const textoWA = carrito.map(i => `${i.cant}x ${i.nombre}`).join('%0A')
      const urlWA = `https://wa.me/542966249538?text=*NUEVO PEDIDO MESA ${numeroMesa.toUpperCase()}*%0A${textoWA}%0A*TOTAL: $${total}*`
      
      window.open(urlWA, '_blank')
      setCarrito([])
      toast.success("¡Pedido enviado a cocina!")
    } catch (error) {
      toast.error("Error de conexión")
    }
  }

  const agregarAlCarrito = (p: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === p.id)
      if (existe) return prev.map(item => item.id === p.id ? { ...item, cant: item.cant + 1 } : item)
      return [...prev, { ...p, cant: 1 }]
    })
    toast.success(`${p.nombre} agregado`)
  }

  const filtrar = catSeleccionada === "Todas" ? productos : productos.filter(p => p.categoria === catSeleccionada)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* BANNER DE PROMO DINÁMICO */}
      {promo?.activa && (
        <div className="mb-10 rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl animate-in slide-in-from-top duration-700">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 h-56 md:h-72">
              <img src={promo.imagen} className="w-full h-full object-cover" alt="Promoción" />
            </div>
            <div className="p-8 md:p-12 space-y-4 text-center md:text-left flex-1">
              <Badge className="bg-orange-600 text-white font-black uppercase px-4 py-1 rounded-full animate-pulse tracking-widest text-[10px]">
                Oferta Especial
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-white">
                {promo.titulo}
              </h2>
              <p className="text-orange-200 font-bold italic text-lg md:text-xl">
                {promo.mensaje}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cabecera de Mesa y Total */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-orange-100">
        <div className="flex items-center gap-3">
          <MapPin className="text-orange-600" size={20} />
          <input 
            placeholder="MESA..." 
            className="font-black text-xl text-slate-900 border-none p-0 focus:ring-0 w-24 uppercase bg-transparent"
            value={numeroMesa} 
            onChange={(e) => setNumeroMesa(e.target.value)} 
          />
        </div>
        <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl font-black text-xl italic shadow-lg">
          ${total.toLocaleString('es-AR')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Selector de Categorías */}
          <ScrollArea className="w-full whitespace-nowrap mb-8">
            <div className="flex space-x-2 pb-2">
              {categorias.map(c => (
                <Button 
                  key={c} 
                  variant={catSeleccionada === c ? "default" : "outline"} 
                  onClick={() => setCatSeleccionada(c)} 
                  className={`rounded-full px-6 font-black uppercase text-[10px] transition-all ${catSeleccionada === c ? "bg-orange-600 border-orange-600 shadow-md scale-105" : "text-slate-400 border-slate-100"}`}
                >
                  {c}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Grilla de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtrar.map(p => (
              <Card key={p.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-md bg-white group hover:shadow-xl transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                  <img src={p.imagen || "https://placehold.co/400x300?text=Comida"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.nombre} />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 backdrop-blur-md text-slate-900 font-black rounded-lg shadow-sm">
                      {p.categoria}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="uppercase font-black text-sm italic text-slate-800 tracking-tight">{p.nombre}</CardTitle>
                  {p.descripcion && (
                    <p className="text-[11px] text-slate-400 font-bold italic leading-tight mt-1 line-clamp-2">
                      {p.descripcion}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pb-4">
                   <p className="text-2xl font-black text-orange-600 tracking-tighter">${p.precio.toLocaleString('es-AR')}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-slate-900 h-12 font-black rounded-2xl shadow-lg hover:bg-orange-600 transition-colors uppercase italic text-xs" onClick={() => agregarAlCarrito(p)}>
                    + Agregar al pedido
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Columna del Carrito */}
        <div className="lg:col-span-1">
          <Card className="rounded-[2.5rem] shadow-2xl border-none sticky top-28 bg-white overflow-hidden">
            <div className="bg-orange-600 p-6 text-center shadow-inner">
               <h3 className="text-white font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-2">
                 <ShoppingCart size={18}/> Tu Pedido
               </h3>
            </div>
            <CardContent className="p-6 max-h-[400px] overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-10 opacity-20 flex flex-col items-center gap-2">
                  <UtensilsCrossed size={32} />
                  <span className="font-black text-[10px] uppercase italic">Seleccioná algo rico</span>
                </div>
              ) : (
                carrito.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-3 mb-3 animate-in slide-in-from-right duration-300">
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-[11px] uppercase leading-none mb-1">{item.nombre}</div>
                      <div className="text-[10px] text-orange-600 font-black italic">x{item.cant} - ${ (item.precio * item.cant).toLocaleString('es-AR') }</div>
                    </div>
                    <button onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))} className="text-red-100 hover:text-red-500 transition-colors p-2">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))
              )}
            </CardContent>
            {carrito.length > 0 && (
              <CardFooter className="p-6 pt-0">
                <Button onClick={enviarPedido} className="w-full bg-green-600 h-16 font-black text-lg rounded-2xl shadow-xl uppercase italic tracking-tighter hover:bg-green-700 transition-all active:scale-95">
                  <Send className="mr-2 h-5 w-5" /> Enviar Pedido
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function UtensilsCrossed({ size }: { size: number }) {
  return <Star size={size} /> // Icono temporal de reemplazo
}
