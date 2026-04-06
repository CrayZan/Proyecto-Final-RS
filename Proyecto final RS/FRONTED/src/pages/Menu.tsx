import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Send, MapPin, Trash2, Utensils, Star, Megaphone } from "lucide-react"
import { toast } from "sonner"
import { ref, push, onValue } from "firebase/database"
import { db } from "../lib/firebase"

export default function Menu({ productos }: { productos: any[] }) {
  const [searchParams] = useSearchParams()
  const [carrito, setCarrito] = useState<any[]>([])
  const [numeroMesa, setNumeroMesa] = useState(searchParams.get("mesa") || "")
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")
  
  // ESTADO PARA LA PROMO (Sincronizado con Admin)
  const [promo, setPromo] = useState<any>(null)

  // ESCUCHADOR EN TIEMPO REAL
  useEffect(() => {
    const promoRef = ref(db, 'config/promo');
    const unsubscribe = onValue(promoRef, (snapshot) => {
      if (snapshot.exists()) {
        setPromo(snapshot.val());
      } else {
        setPromo(null);
      }
    });
    return () => unsubscribe(); 
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* BANNER DE PROMO SINCRONIZADO */}
      {promo?.activa && (
        <div className="mb-10 rounded-[2.5rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-white/5 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 h-56 md:h-72">
              <img src={promo.imagen} className="w-full h-full object-cover opacity-90 shadow-2xl" alt="Promoción" />
            </div>
            <div className="p-8 md:p-12 space-y-4 text-center md:text-left flex-1 relative">
              <div className="absolute top-4 right-8 hidden md:block opacity-10">
                 <Megaphone size={120} />
              </div>
              <Badge className="bg-orange-600 text-white font-black uppercase px-4 py-1 rounded-full animate-pulse tracking-widest text-[10px]">
                Recomendado
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
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
      <div className="mb-8 flex justify-between items-center bg-white p-5 rounded-[2.5rem] shadow-sm border border-orange-50">
        <div className="flex items-center gap-3">
          <MapPin className="text-orange-600" size={24} />
          <input 
            placeholder="N° MESA" 
            className="font-black text-2xl text-slate-900 border-none p-0 focus:ring-0 w-32 uppercase bg-transparent"
            value={numeroMesa} 
            onChange={(e) => setNumeroMesa(e.target.value)} 
          />
        </div>
        <div className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-2xl italic tracking-tighter shadow-lg">
          ${total.toLocaleString('es-AR')}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          {/* Selector de Categorías */}
          <ScrollArea className="w-full whitespace-nowrap mb-10">
            <div className="flex space-x-3 pb-4">
              {categorias.map(c => (
                <Button 
                  key={c} 
                  variant={catSeleccionada === c ? "default" : "outline"} 
                  onClick={() => setCatSeleccionada(c)} 
                  className={`rounded-full px-8 h-12 font-black uppercase text-[11px] transition-all shadow-sm ${catSeleccionada === c ? "bg-orange-600 border-orange-600 text-white" : "text-slate-400 bg-white border-slate-100"}`}
                >
                  {c}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Grilla de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtrar.map(p => (
              <Card key={p.id} className="rounded-[3rem] overflow-hidden border-none shadow-sm bg-white group hover:shadow-2xl transition-all duration-500">
                <div className="h-56 overflow-hidden relative">
                  <img src={p.imagen} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 shadow-inner" alt={p.nombre} />
                  <div className="absolute top-5 left-5">
                    <Badge className="bg-white/90 backdrop-blur-md text-slate-900 font-black rounded-xl shadow-sm uppercase text-[9px] px-3 py-1 border-none">
                      {p.categoria}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-2 px-8 pt-8">
                  <CardTitle className="uppercase font-black text-lg italic text-slate-900 tracking-tighter">{p.nombre}</CardTitle>
                  <p className="text-[11px] text-slate-400 font-bold italic leading-tight mt-1 line-clamp-2">
                    {p.descripcion}
                  </p>
                </CardHeader>
                <CardContent className="px-8 pb-6 flex justify-between items-center">
                   <p className="text-3xl font-black text-orange-600 tracking-tighter">${p.precio.toLocaleString('es-AR')}</p>
                   <Button onClick={() => agregarAlCarrito(p)} className="bg-slate-900 hover:bg-orange-600 rounded-2xl h-12 w-12 p-0 shadow-lg transition-colors">
                      <ShoppingCart size={20} className="text-white" />
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Columna del Carrito */}
        <div className="lg:col-span-1">
          <Card className="rounded-[3rem] shadow-2xl border-none sticky top-24 bg-white overflow-hidden">
            <div className="bg-orange-600 p-8 text-center">
               <h3 className="text-white font-black uppercase italic tracking-widest text-xs flex items-center justify-center gap-2">
                 <Utensils size={16}/> Comanda Mesa {numeroMesa || "..."}
               </h3>
            </div>
            <CardContent className="p-8 max-h-[450px] overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-10 opacity-20 flex flex-col items-center gap-4">
                  <Star size={48} className="text-slate-400" />
                  <span className="font-black text-[10px] uppercase italic">Tu pedido está vacío</span>
                </div>
              ) : (
                carrito.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-6 animate-in slide-in-from-right duration-300 last:mb-0">
                    <div className="flex-1">
                      <div className="font-black text-slate-900 text-xs uppercase leading-none mb-1">{item.nombre}</div>
                      <div className="text-[10px] text-orange-600 font-black italic">x{item.cant} — ${(item.precio * item.cant).toLocaleString('es-AR')}</div>
                    </div>
                    <button onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))} className="text-red-100 hover:text-red-600 p-2 transition-colors">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                ))
              )}
            </CardContent>
            {carrito.length > 0 && (
              <CardFooter className="p-8 pt-0">
                <Button onClick={enviarPedido} className="w-full bg-green-600 h-16 font-black text-xl rounded-[1.5rem] shadow-xl uppercase italic tracking-tighter hover:bg-green-700 transition-all active:scale-95">
                  <Send className="mr-3 h-6 w-6" /> Enviar Ahora
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
