import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, Trash2, Utensils, Star, 
  Plus, Truck, Store, Wallet, CreditCard, Banknote, Navigation 
} from "lucide-react"
import { toast } from "sonner"
import { ref, push, onValue } from "firebase/database"
import { db } from "../lib/firebase"

export default function Menu({ productos }: { productos: any[] }) {
  const [searchParams] = useSearchParams()
  const [carrito, setCarrito] = useState<any[]>([])
  const [promo, setPromo] = useState<any>(null)
  
  const [entrega, setEntrega] = useState<'mesa' | 'delivery' | 'retiro'>('mesa')
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mercadopago'>('efectivo')
  const [numeroMesa, setNumeroMesa] = useState(searchParams.get("mesa") || "")
  const [direccion, setDireccion] = useState("")
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")

  useEffect(() => {
    const promoRef = ref(db, 'config/promo');
    onValue(promoRef, (snapshot) => {
      if (snapshot.exists()) setPromo(snapshot.val());
    });
  }, [])

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) return toast.error("Tu navegador no soporta geolocalización")
    
    const toastId = toast.loading("Obteniendo ubicación precisa...")
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords
      setDireccion(`https://www.google.com/maps?q=${latitude},${longitude}`)
      toast.dismiss(toastId)
      toast.success("¡Ubicación fijada con éxito!")
    }, () => {
      toast.dismiss(toastId)
      toast.error("No se pudo obtener la ubicación. Por favor, escribila manualmente.")
    })
  }

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)
  const categorias = ["Todas", ...new Set(productos.map(p => p.categoria))]

  const enviarPedido = async () => {
    if (entrega === 'mesa' && !numeroMesa) return toast.error("Ingresá el N° de Mesa")
    if (entrega === 'delivery' && !direccion) return toast.error("Necesitamos tu dirección o ubicación")
    if (carrito.length === 0) return toast.error("El carrito está vacío")

    const pedidoData = {
      items: carrito,
      total,
      entrega,
      metodoPago,
      destino: entrega === 'mesa' ? `Mesa ${numeroMesa}` : direccion,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      estado: "pendiente"
    }

    try {
      await push(ref(db, 'pedidos'), pedidoData)
      
      let mensajeWA = `*NUEVO PEDIDO - ${entrega.toUpperCase()}*%0A`
      mensajeWA += `*Pago:* ${metodoPago.toUpperCase()}%0A`
      mensajeWA += `*Destino:* ${pedidoData.destino}%0A%0A`
      mensajeWA += carrito.map(i => `• ${i.cant}x ${i.nombre}`).join('%0A')
      mensajeWA += `%0A%0A*TOTAL: $${total}*`

      window.open(`https://wa.me/542966249538?text=${mensajeWA}`, '_blank')
      setCarrito([])
      toast.success("¡Pedido enviado!")
    } catch (error) {
      toast.error("Error al procesar el pedido")
    }
  }

  const agregarAlCarrito = (item: any) => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === item.id)
      if (existe) return prev.map(p => p.id === item.id ? { ...p, cant: p.cant + 1 } : p)
      return [...prev, { ...item, cant: 1 }]
    })
    toast.success(`${item.nombre} sumado`)
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto pb-32 animate-in fade-in duration-500">
      
      {/* BANNER PROMO */}
      {promo?.activa && (
        <div className="mb-10 rounded-[3rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-white/5">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 h-64 relative">
              <img src={promo.imagen} className="w-full h-full object-cover opacity-80" alt="Promo" />
              <div className="absolute bottom-6 left-6 bg-orange-600 px-6 py-2 rounded-2xl font-black text-3xl italic shadow-2xl rotate-[-2deg]">
                ${Number(promo.precio).toLocaleString('es-AR')}
              </div>
            </div>
            <div className="p-8 space-y-4 flex-1">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{promo.titulo}</h2>
              <Button onClick={() => agregarAlCarrito({id: 'PROMO', nombre: promo.titulo, precio: Number(promo.precio)})} className="bg-orange-600 hover:bg-orange-700 rounded-2xl w-full h-14 font-black">
                <Plus className="mr-2"/> AGREGAR PROMO
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3 space-y-8">
          
          {/* SELECTOR DE LOGÍSTICA */}
          <div className="bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 flex gap-2">
            {[
              { id: 'mesa', icon: Utensils, label: 'En Mesa' },
              { id: 'delivery', icon: Truck, label: 'Delivery' },
              { id: 'retiro', icon: Store, label: 'Retiro' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setEntrega(opt.id as any)}
                className={`flex-1 flex flex-col items-center py-4 rounded-[2rem] transition-all ${entrega === opt.id ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <opt.icon size={20} className="mb-1" />
                <span className="text-[10px] font-black uppercase italic">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* CAMPOS DINÁMICOS SEGÚN ENTREGA */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-orange-50 animate-in slide-in-from-top-2">
            {entrega === 'mesa' ? (
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-2xl text-orange-600"><Utensils size={24}/></div>
                <input 
                  placeholder="N° DE MESA" 
                  className="text-2xl font-black uppercase italic w-full border-none focus:ring-0 placeholder:opacity-20"
                  value={numeroMesa} onChange={e => setNumeroMesa(e.target.value)}
                />
              </div>
            ) : entrega === 'delivery' ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    placeholder="DIRECCIÓN DE ENVÍO..." 
                    className="flex-1 bg-slate-50 rounded-2xl px-6 font-bold text-sm h-14 border-none"
                    value={direccion} onChange={e => setDireccion(e.target.value)}
                  />
                  <Button onClick={obtenerUbicacion} variant="outline" className="h-14 w-14 rounded-2xl border-orange-200 text-orange-600">
                    <Navigation size={20} />
                  </Button>
                </div>
                <p className="text-[10px] font-black text-slate-300 uppercase px-4 tracking-widest">Usá el GPS para que el repartidor llegue exacto</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 px-4 py-2">
                <Store className="text-orange-600" />
                <p className="font-black uppercase italic text-slate-400 text-sm">Te avisamos al WhatsApp para que retires</p>
              </div>
            )}
          </div>

          {/* CATEGORÍAS */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-3 pb-4">
              {categorias.map(c => (
                <Button 
                  key={c} variant={catSeleccionada === c ? "default" : "outline"} onClick={() => setCatSeleccionada(c)} 
                  className={`rounded-full px-8 h-12 font-black uppercase text-[11px] ${catSeleccionada === c ? "bg-orange-600 border-none shadow-lg" : "bg-white text-slate-400 border-slate-100"}`}
                >
                  {c}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* PRODUCTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {(catSeleccionada === "Todas" ? productos : productos.filter(p => p.categoria === catSeleccionada)).map(p => (
              <Card key={p.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-sm hover:shadow-xl transition-all group">
                <div className="h-48 overflow-hidden"><img src={p.imagen} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.nombre} /></div>
                <CardHeader className="p-6 pb-0"><CardTitle className="uppercase font-black text-lg italic tracking-tighter">{p.nombre}</CardTitle></CardHeader>
                <CardContent className="p-6 pt-2 flex justify-between items-center">
                  <span className="text-2xl font-black text-orange-600">${p.precio.toLocaleString()}</span>
                  <Button onClick={() => agregarAlCarrito(p)} className="bg-slate-900 rounded-2xl h-12 w-12 p-0 shadow-lg hover:bg-orange-600 transition-colors"><Plus size={20}/></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CARRITO Y PAGOS */}
        <div className="lg:col-span-1">
          <Card className="rounded-[3rem] shadow-2xl border-none sticky top-24 bg-white overflow-hidden">
            <div className="bg-slate-900 p-8 text-center">
               <h3 className="text-white font-black uppercase italic tracking-widest text-[10px] opacity-60">Tu Pedido</h3>
               <div className="text-4xl font-black text-orange-500 mt-2">${total.toLocaleString()}</div>
            </div>
            
            <CardContent className="p-6 space-y-8">
              
              {/* SELECTOR DE PAGO A COLOR */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 text-center tracking-[0.2em] italic">Elegí cómo pagar</p>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => setMetodoPago('efectivo')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'efectivo' ? 'border-green-500 bg-green-50 scale-105 shadow-md' : 'border-slate-50 opacity-40'}`}
                  >
                    <div className="bg-green-500 p-2 rounded-full mb-1"><Banknote size={18} className="text-white" /></div>
                    <span className="text-[8px] font-black uppercase italic text-green-700">Efectivo</span>
                  </button>

                  <button 
                    onClick={() => setMetodoPago('transferencia')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'transferencia' ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' : 'border-slate-50 opacity-40'}`}
                  >
                    <div className="bg-blue-600 p-2 rounded-full mb-1"><Wallet size={18} className="text-white" /></div>
                    <span className="text-[8px] font-black uppercase italic text-blue-800">Transf.</span>
                  </button>

                  <button 
                    onClick={() => setMetodoPago('mercadopago')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'mercadopago' ? 'border-sky-400 bg-sky-50 scale-105 shadow-md' : 'border-slate-50 opacity-40'}`}
                  >
                    <div className="bg-sky-400 p-2 rounded-full mb-1"><CreditCard size={18} className="text-white" /></div>
                    <span className="text-[8px] font-black uppercase italic text-sky-700">M. Pago</span>
                  </button>
                </div>
              </div>

              {/* LISTA CARRITO */}
              <div className="max-h-48 overflow-y-auto space-y-3 px-2">
                {carrito.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center animate-in slide-in-from-right">
                    <div className="text-[11px] font-black uppercase italic text-slate-700">{item.cant}x {item.nombre}</div>
                    <button onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                  </div>
                ))}
                {carrito.length === 0 && <p className="text-center text-[10px] font-bold text-slate-300 uppercase italic py-4">Carrito vacío</p>}
              </div>

              <Button onClick={enviarPedido} className="w-full h-16 bg-green-600 hover:bg-green-700 rounded-[1.5rem] font-black text-lg uppercase italic shadow-xl transition-transform active:scale-95">
                <Send className="mr-2" /> ENVIAR PEDIDO
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
