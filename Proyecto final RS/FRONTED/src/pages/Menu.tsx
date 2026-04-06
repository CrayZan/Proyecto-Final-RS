import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, Trash2, Utensils, Plus, Truck, Store, 
  Wallet, CreditCard, Banknote, Navigation, Copy, Check, Loader2 
} from "lucide-react"
import { toast } from "sonner"
import { ref, push, onValue } from "firebase/database"
import { db } from "../lib/firebase"

// ==========================================
// ⚠️ CONFIGURACIÓN DE DATOS (CONECTADO A RENDER)
// ==========================================
const DATOS_PAGO = {
  alias: "RESTOWEB.SAN.VICENTE", 
  cbu: "0000003100012345678901",
  titular: "TU NOMBRE O COMERCIO",
  // URL de tu Backend en Render + el endpoint de pago
  urlBackendMP: "https://proyecto-final-rs.onrender.com/create_preference" 
}

export default function Menu({ productos }: { productos: any[] }) {
  const [searchParams] = useSearchParams()
  const [carrito, setCarrito] = useState<any[]>([])
  const [promo, setPromo] = useState<any>(null)
  const [copiado, setCopiado] = useState(false)
  const [loadingMP, setLoadingMP] = useState(false)
  
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

  const copiarAlias = () => {
    navigator.clipboard.writeText(DATOS_PAGO.alias)
    setCopiado(true)
    toast.success("Alias copiado")
    setTimeout(() => setCopiado(false), 2000)
  }

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) return toast.error("GPS no soportado")
    const tid = toast.loading("Localizando...")
    navigator.geolocation.getCurrentPosition((pos) => {
      setDireccion(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`)
      toast.dismiss(tid)
      toast.success("Ubicación exacta fijada")
    }, () => {
      toast.dismiss(tid)
      toast.error("Error al obtener GPS")
    })
  }

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)
  const categorias = ["Todas", ...new Set(productos.map(p => p.categoria))]

  const enviarPedido = async () => {
    if (entrega === 'mesa' && !numeroMesa) return toast.error("Falta N° de Mesa")
    if (entrega === 'delivery' && !direccion) return toast.error("Falta dirección")
    if (carrito.length === 0) return toast.error("Carrito vacío")

    // 1. Lógica para MERCADO PAGO AUTOMÁTICO vía BACKEND
    if (metodoPago === 'mercadopago') {
      setLoadingMP(true)
      try {
        const response = await fetch(DATOS_PAGO.urlBackendMP, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            items: carrito.map(item => ({
              title: item.nombre,
              unit_price: Number(item.precio),
              quantity: Number(item.cant)
            })),
            total: total 
          })
        })

        const data = await response.json()
        
        if (data.init_point) {
          // Redirigir al Checkout Pro de Mercado Pago
          window.location.href = data.init_point 
          return; // No ejecutamos el resto para que el pedido no se duplique antes de pagar
        } else {
          throw new Error("No se generó el punto de inicio")
        }
      } catch (err) {
        setLoadingMP(false)
        console.error(err)
        return toast.error("Error al conectar con el servidor de pagos")
      }
    }

    // 2. Lógica para EFECTIVO o TRANSFERENCIA
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
      let mensajeWA = `*NUEVO PEDIDO - ${entrega.toUpperCase()}*%0A*Pago:* ${metodoPago.toUpperCase()}%0A*Destino:* ${pedidoData.destino}%0A%0A`
      mensajeWA += carrito.map(i => `• ${i.cant}x ${i.nombre}`).join('%0A')
      mensajeWA += `%0A%0A*TOTAL: $${total}*`

      window.open(`https://wa.me/542966249538?text=${mensajeWA}`, '_blank')
      setCarrito([])
      toast.success("¡Pedido enviado!")
    } catch (e) {
      toast.error("Error al guardar pedido")
    }
  }

  const agregarAlCarrito = (item: any) => {
    setCarrito(prev => {
      const ex = prev.find(p => p.id === item.id)
      if (ex) return prev.map(p => p.id === item.id ? { ...p, cant: p.cant + 1 } : p)
      return [...prev, { ...item, cant: 1 }]
    })
    toast.success(`${item.nombre} sumado`)
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto pb-40 animate-in fade-in duration-500">
      
      {/* BANNER PROMO */}
      {promo?.activa && (
        <div className="mb-10 rounded-[2.5rem] overflow-hidden bg-slate-900 text-white shadow-2xl border border-white/5">
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 h-48 md:h-64 relative">
              <img src={promo.imagen} className="w-full h-full object-cover opacity-70" alt="Promo" />
              <div className="absolute bottom-4 left-4 bg-orange-600 px-4 py-1 rounded-xl font-black text-2xl italic shadow-xl">
                ${Number(promo.precio).toLocaleString('es-AR')}
              </div>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{promo.titulo}</h2>
              <Button onClick={() => agregarAlCarrito({id: 'PROMO', nombre: promo.titulo, precio: Number(promo.precio)})} className="bg-orange-600 hover:bg-orange-700 rounded-xl w-full font-black">
                SUMAR PROMO
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          
          {/* SELECTOR ENTREGA */}
          <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex gap-2">
            {[
              { id: 'mesa', icon: Utensils, label: 'En Mesa' },
              { id: 'delivery', icon: Truck, label: 'Delivery' },
              { id: 'retiro', icon: Store, label: 'Retiro' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setEntrega(opt.id as any)}
                className={`flex-1 flex flex-col items-center py-3 rounded-[1.5rem] transition-all ${entrega === opt.id ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <opt.icon size={18} className="mb-1" />
                <span className="text-[9px] font-black uppercase italic">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* DATOS DINÁMICOS */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-50">
            {entrega === 'mesa' ? (
              <input 
                placeholder="ESCRIBÍ TU N° DE MESA..." 
                className="text-xl font-black uppercase italic w-full border-none focus:ring-0 placeholder:opacity-20 text-slate-800"
                value={numeroMesa} onChange={e => setNumeroMesa(e.target.value)}
              />
            ) : entrega === 'delivery' ? (
              <div className="flex gap-2">
                <input 
                  placeholder="DIRECCIÓN O GPS..." 
                  className="flex-1 bg-slate-50 rounded-xl px-4 font-bold text-sm h-12 border-none"
                  value={direccion} onChange={e => setDireccion(e.target.value)}
                />
                <Button onClick={obtenerUbicacion} variant="outline" className="h-12 w-12 rounded-xl border-orange-100 text-orange-600 shadow-sm">
                  <Navigation size={18} />
                </Button>
              </div>
            ) : (
              <p className="font-black uppercase italic text-slate-400 text-xs text-center">Te avisamos al celu para retirar por el local</p>
            )}
          </div>

          {/* CATEGORÍAS */}
          <ScrollArea className="w-full">
            <div className="flex space-x-2 pb-4">
              {categorias.map(c => (
                <button 
                  key={c} onClick={() => setCatSeleccionada(c)} 
                  className={`rounded-full px-6 py-2 font-black uppercase text-[10px] transition-all ${catSeleccionada === c ? "bg-orange-600 text-white shadow-md" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* LISTADO PRODUCTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(catSeleccionada === "Todas" ? productos : productos.filter(p => p.categoria === catSeleccionada)).map(p => (
              <Card key={p.id} className="rounded-[2rem] overflow-hidden border-none shadow-sm hover:shadow-md transition-all group bg-white">
                <div className="h-40 overflow-hidden"><img src={p.imagen} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.nombre} /></div>
                <CardContent className="p-5 flex justify-between items-center">
                  <div>
                    <h3 className="uppercase font-black text-xs italic tracking-tighter text-slate-800">{p.nombre}</h3>
                    <span className="text-lg font-black text-orange-600">${p.precio.toLocaleString()}</span>
                  </div>
                  <Button onClick={() => agregarAlCarrito(p)} className="bg-slate-900 rounded-xl h-10 w-10 p-0 shadow-lg active:scale-90 transition-transform"><Plus size={18}/></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* COLUMNA CARRITO Y PAGO */}
        <div className="lg:col-span-1">
          <Card className="rounded-[2.5rem] shadow-2xl border-none sticky top-24 bg-white overflow-hidden border-t-4 border-orange-500">
            <div className="bg-slate-900 p-6 text-center">
               <h3 className="text-white/50 font-black uppercase italic tracking-widest text-[9px]">Total a Pagar</h3>
               <div className="text-3xl font-black text-white mt-1">${total.toLocaleString('es-AR')}</div>
            </div>
            
            <CardContent className="p-5 space-y-6">
              
              {/* SELECTOR DE PAGO */}
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setMetodoPago('efectivo')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'efectivo' ? 'border-green-500 bg-green-50 shadow-md scale-105' : 'border-slate-50 opacity-40'}`}
                >
                  <div className="bg-green-500 p-2 rounded-full mb-1"><Banknote size={16} className="text-white" /></div>
                  <span className="text-[7px] font-black uppercase italic text-green-700">Efectivo</span>
                </button>

                <button 
                  onClick={() => setMetodoPago('transferencia')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'transferencia' ? 'border-blue-500 bg-blue-50 shadow-md scale-105' : 'border-slate-50 opacity-40'}`}
                >
                  <div className="bg-blue-600 p-2 rounded-full mb-1"><Wallet size={16} className="text-white" /></div>
                  <span className="text-[7px] font-black uppercase italic text-blue-800">Transf.</span>
                </button>

                <button 
                  onClick={() => setMetodoPago('mercadopago')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'mercadopago' ? 'border-sky-400 bg-sky-50 shadow-md scale-105' : 'border-slate-50 opacity-40'}`}
                >
                  <div className="bg-sky-400 p-2 rounded-full mb-1"><CreditCard size={16} className="text-white" /></div>
                  <span className="text-[7px] font-black uppercase italic text-sky-700">M. Pago</span>
                </button>
              </div>

              {/* PANEL DE TRANSFERENCIA (Solo si se selecciona) */}
              {metodoPago === 'transferencia' && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3 animate-in zoom-in-95">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-[8px] font-black text-blue-400 uppercase">Alias para copiar</p>
                      <p className="text-xs font-black text-blue-900 break-all leading-none">{DATOS_PAGO.alias}</p>
                    </div>
                    <Button onClick={copiarAlias} size="sm" className="bg-blue-600 h-8 w-8 rounded-lg p-0 flex-shrink-0 ml-2">
                      {copiado ? <Check size={14}/> : <Copy size={14}/>}
                    </Button>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-blue-400 uppercase">Titular</p>
                    <p className="text-[10px] font-bold text-blue-800">{DATOS_PAGO.titular}</p>
                  </div>
                </div>
              )}

              {/* LISTA RESUMEN */}
              <div className="max-h-32 overflow-y-auto space-y-2 px-1 border-b border-slate-50 pb-4">
                {carrito.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] font-bold text-slate-500 uppercase italic">
                    <span>{item.cant}x {item.nombre}</span>
                    <button onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500 transition-colors">X</button>
                  </div>
                ))}
                {carrito.length === 0 && <p className="text-[10px] text-center text-slate-300 uppercase font-black italic">Carrito vacío</p>}
              </div>

              <Button 
                onClick={enviarPedido} 
                disabled={loadingMP}
                className={`w-full h-14 rounded-2xl font-black text-xs uppercase italic shadow-xl transition-all active:scale-95 ${metodoPago === 'mercadopago' ? 'bg-sky-400 hover:bg-sky-500' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {loadingMP ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> GENERANDO PAGO...</span>
                ) : (
                  metodoPago === 'mercadopago' ? 'PAGAR CON MERCADO PAGO' : 'ENVIAR PEDIDO POR WHATSAPP'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
