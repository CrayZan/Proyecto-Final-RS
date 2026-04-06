import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Utensils, Plus, Truck, Store, Wallet, 
  CreditCard, Banknote, Navigation, Copy, Check, Loader2 
} from "lucide-react"
import { toast } from "sonner"
import { ref, push, onValue } from "firebase/database"
import { db } from "../lib/firebase"

// --- CONFIGURACIÓN CENTRALIZADA ---
const DATOS_PAGO = {
  alias: "RESTOWEB.SAN.VICENTE", 
  cbu: "0000003100012345678901",
  titular: "TU NOMBRE O COMERCIO",
  urlBackendMP: "https://proyecto-final-rs.onrender.com/create_preference" 
}

export default function Menu({ productos }: { productos: any[] }) {
  const [searchParams] = useSearchParams()
  const [carrito, setCarrito] = useState<any[]>([])
  const [copiado, setCopiado] = useState(false)
  const [loadingMP, setLoadingMP] = useState(false)
  
  const [entrega, setEntrega] = useState<'mesa' | 'delivery' | 'retiro'>('mesa')
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mercadopago'>('efectivo')
  const [numeroMesa, setNumeroMesa] = useState(searchParams.get("mesa") || "")
  const [direccion, setDireccion] = useState("")
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)
  const categorias = ["Todas", ...new Set(productos.map(p => p.categoria))]

  // Función para copiar Alias
  const copiarAlias = () => {
    navigator.clipboard.writeText(DATOS_PAGO.alias)
    setCopiado(true)
    toast.success("Alias copiado al portapapeles")
    setTimeout(() => setCopiado(false), 2000)
  }

  const enviarPedido = async () => {
    if (carrito.length === 0) return toast.error("El carrito está vacío")
    if (entrega === 'mesa' && !numeroMesa) return toast.error("Por favor, ingresá el N° de Mesa")
    if (entrega === 'delivery' && !direccion) return toast.error("Falta la dirección de envío")

    // --- 1. LÓGICA DE MERCADO PAGO (Solo para Delivery/Retiro) ---
    if (entrega !== 'mesa' && metodoPago === 'mercadopago') {
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
          window.location.href = data.init_point 
          return; // Detenemos aquí, el flujo sigue en Mercado Pago
        }
      } catch (err) {
        setLoadingMP(false)
        return toast.error("Error al conectar con Mercado Pago")
      }
    }

    // --- 2. REGISTRO DEL PEDIDO (Mesa, Efectivo o Transferencia) ---
    const pedidoData = {
      items: carrito,
      total,
      entrega,
      // Si es mesa, el pago es presencial. Si no, usamos el seleccionado.
      metodoPago: entrega === 'mesa' ? 'presencial' : metodoPago,
      destino: entrega === 'mesa' ? `Mesa ${numeroMesa}` : direccion,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      estado: "pendiente"
    }

    try {
      await push(ref(db, 'pedidos'), pedidoData)
      
      let mensajeWA = `*NUEVO PEDIDO - ${entrega.toUpperCase()}*%0A`
      mensajeWA += `*Pago:* ${pedidoData.metodoPago.toUpperCase()}%0A`
      mensajeWA += `*Destino:* ${pedidoData.destino}%0A%0A`
      mensajeWA += carrito.map(i => `• ${i.cant}x ${i.nombre}`).join('%0A')
      mensajeWA += `%0A%0A*TOTAL: $${total}*`

      window.open(`https://wa.me/542966249538?text=${mensajeWA}`, '_blank')
      setCarrito([])
      toast.success("¡Pedido enviado con éxito!")
    } catch (e) {
      toast.error("Error al conectar con la base de datos")
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto pb-40 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* COLUMNA IZQUIERDA: MENÚ Y LOGÍSTICA */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* SELECTOR TIPO DE ENTREGA */}
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

          {/* INPUTS SEGÚN ENTREGA */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-50">
            {entrega === 'mesa' ? (
              <input 
                placeholder="ESCRIBÍ TU N° DE MESA..." 
                className="text-xl font-black uppercase italic w-full border-none focus:ring-0 text-slate-800 placeholder:opacity-20"
                value={numeroMesa} onChange={e => setNumeroMesa(e.target.value)}
              />
            ) : entrega === 'delivery' ? (
              <div className="flex gap-2">
                <input 
                  placeholder="DIRECCIÓN DE ENVÍO..." 
                  className="flex-1 bg-slate-50 rounded-xl px-4 font-bold text-sm h-12 border-none" 
                  value={direccion} onChange={e => setDireccion(e.target.value)} 
                />
                <Button variant="outline" className="h-12 w-12 rounded-xl border-orange-100 text-orange-600 shadow-sm"><Navigation size={18} /></Button>
              </div>
            ) : (
              <p className="text-center font-black text-slate-300 italic uppercase text-xs">Te avisamos por WhatsApp para retirar por el local</p>
            )}
          </div>

          {/* CATEGORÍAS */}
          <ScrollArea className="w-full">
            <div className="flex space-x-2 pb-2">
              {categorias.map(c => (
                <Button 
                  key={c} onClick={() => setCatSeleccionada(c)} 
                  variant={catSeleccionada === c ? "default" : "outline"}
                  className={`rounded-full px-6 h-9 font-black uppercase text-[10px] ${catSeleccionada === c ? "bg-orange-600 border-none shadow-md" : "bg-white text-slate-400"}`}
                >
                  {c}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* GRILLA DE PRODUCTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {productos.filter(p => catSeleccionada === "Todas" || p.categoria === catSeleccionada).map(p => (
              <Card key={p.id} className="rounded-[2rem] overflow-hidden border-none shadow-sm hover:shadow-md transition-all bg-white group">
                <div className="h-40 overflow-hidden">
                  <img src={p.imagen} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.nombre} />
                </div>
                <CardContent className="p-5 flex justify-between items-center">
                  <div>
                    <h3 className="uppercase font-black text-xs italic text-slate-800">{p.nombre}</h3>
                    <span className="text-lg font-black text-orange-600">${p.precio.toLocaleString()}</span>
                  </div>
                  <Button 
                    onClick={() => setCarrito([...carrito, {...p, cant: 1}])} 
                    className="bg-slate-900 rounded-xl h-10 w-10 p-0 shadow-lg active:scale-90 transition-transform"
                  >
                    <Plus size={18}/>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: CARRITO Y PAGO */}
        <div className="lg:col-span-1">
          <Card className="rounded-[2.5rem] shadow-2xl border-none sticky top-24 bg-white overflow-hidden border-t-4 border-orange-500">
            <div className="bg-slate-900 p-6 text-center text-white">
               <h3 className="text-white/50 font-black uppercase italic text-[9px] tracking-widest">Total Pedido</h3>
               <div className="text-3xl font-black mt-1">${total.toLocaleString('es-AR')}</div>
            </div>
            
            <CardContent className="p-5 space-y-6">
              
              {/* LÓGICA DE MÉTODOS DE PAGO */}
              {entrega !== 'mesa' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase text-center italic">Seleccioná cómo pagar</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => setMetodoPago('efectivo')} 
                      className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'efectivo' ? 'border-green-500 bg-green-50 shadow-md scale-105' : 'border-slate-50 opacity-40'}`}
                    >
                      <div className="bg-green-500 p-2 rounded-full mb-1"><Banknote size={16} className="text-white" /></div>
                      <span className="text-[7px] font-black uppercase italic text-green-700">Efectivo</span>
                    </button>
                    <button 
                      onClick={() => setMetodoPago('transferencia')} 
                      className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'transferencia' ? 'border-blue-500 bg-blue-50 shadow-md scale-105' : 'border-slate-50 opacity-40'}`}
                    >
                      <div className="bg-blue-600 p-2 rounded-full mb-1"><Wallet size={16} className="text-white" /></div>
                      <span className="text-[7px] font-black uppercase italic text-blue-800">Transf.</span>
                    </button>
                    <button 
                      onClick={() => setMetodoPago('mercadopago')} 
                      className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'mercadopago' ? 'border-sky-400 bg-sky-50 shadow-md scale-105' : 'border-slate-50 opacity-40'}`}
                    >
                      <div className="bg-sky-400 p-2 rounded-full mb-1"><CreditCard size={16} className="text-white" /></div>
                      <span className="text-[7px] font-black uppercase italic text-sky-700">M. Pago</span>
                    </button>
                  </div>

                  {/* Detalle Transferencia */}
                  {metodoPago === 'transferencia' && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-[8px] font-black text-blue-400 uppercase">Alias</p>
                          <p className="text-xs font-black text-blue-900 break-all">{DATOS_PAGO.alias}</p>
                        </div>
                        <Button onClick={copiarAlias} size="sm" className="bg-blue-600 h-8 w-8 rounded-lg p-0">
                          {copiado ? <Check size={14}/> : <Copy size={14}/>}
                        </Button>
                      </div>
                      <p className="text-[10px] font-bold text-blue-800">{DATOS_PAGO.titular}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                  <Utensils className="mx-auto mb-2 text-slate-300" size={24} />
                  <p className="text-[10px] font-black text-slate-400 uppercase italic leading-tight">
                    Pedido para la mesa<br/>el pago es presencial
                  </p>
                </div>
              )}

              {/* LISTA DE RESUMEN RÁPIDO */}
              <div className="max-h-24 overflow-y-auto space-y-2 px-1 border-b border-slate-50 pb-4">
                {carrito.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] font-bold text-slate-400 uppercase italic">
                    <span>{item.cant}x {item.nombre}</span>
                    <button onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))} className="text-red-300 hover:text-red-500">✕</button>
                  </div>
                ))}
              </div>

              {/* BOTÓN DE ACCIÓN FINAL */}
              <Button 
                onClick={enviarPedido} 
                disabled={loadingMP}
                className={`w-full h-14 rounded-2xl font-black text-xs uppercase italic shadow-xl transition-all active:scale-95 ${metodoPago === 'mercadopago' && entrega !== 'mesa' ? 'bg-sky-400 hover:bg-sky-500' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {loadingMP ? (
                  <Loader2 className="animate-spin" />
                ) : entrega === 'mesa' ? (
                  'ENVIAR PEDIDO A COCINA'
                ) : metodoPago === 'mercadopago' ? (
                  'PAGAR CON MERCADO PAGO'
                ) : (
                  'ENVIAR PEDIDO'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
