import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Utensils, Plus, Truck, Store, Wallet, 
  CreditCard, Banknote, Navigation, Copy, Check, Loader2, X 
} from "lucide-react"
import { toast } from "sonner"
import { ref, push, onValue } from "firebase/database" // Agregué onValue
import { db } from "../lib/firebase"

// --- CONFIGURACIÓN CENTRALIZADA ---
const DATOS_PAGO = {
  alias: "RESTOWEB.SAN.VICENTE", 
  cbu: "0000003100012345678901",
  titular: "TU NOMBRE O COMERCIO",
  urlBackendMP: "https://proyecto-final-rs.onrender.com/api/payments/create_preference" 
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

  // --- LÓGICA PARA LA PROMOCIÓN (CORREGIDA) ---
  const [promoPublicada, setPromoPublicada] = useState<any>(null)

  useEffect(() => {
    const promoRef = ref(db, 'config/promo')
    const unsubscribe = onValue(promoRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        // Solo la guardamos si está activa en Firebase
        if (data.activa === true) {
          setPromoPublicada(data)
        } else {
          setPromoPublicada(null)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)

  const eliminarDelCarrito = (index: number) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
    toast.success("Producto eliminado");
  };

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) return toast.error("Tu navegador no soporta geolocalización")
    const toastId = toast.loading("Obteniendo tu ubicación exacta...")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setDireccion(`https://www.google.com/maps?q=${latitude},${longitude}`)
        toast.dismiss(toastId)
        toast.success("Ubicación fijada")
      },
      () => {
        toast.dismiss(toastId)
        toast.error("Error al obtener ubicación")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const copiarAlias = () => {
    navigator.clipboard.writeText(DATOS_PAGO.alias)
    setCopiado(true)
    toast.success("Alias copiado")
    setTimeout(() => setCopiado(false), 2000)
  }

  const enviarPedido = async () => {
    if (carrito.length === 0) return toast.error("El carrito está vacío")
    if (entrega === 'mesa' && !numeroMesa) return toast.error("Por favor, ingresá el N° de Mesa")
    if (entrega === 'delivery' && !direccion) return toast.error("Falta la dirección o ubicación")

    const pedidoData = {
      items: carrito,
      total,
      entrega,
      metodoPago: entrega === 'mesa' ? 'presencial' : metodoPago,
      destino: entrega === 'mesa' ? `Mesa ${numeroMesa}` : direccion,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      estado: "pendiente",
      pagoConfirmado: false 
    }

    try {
      setLoadingMP(true)

      const nuevoPedidoRef = await push(ref(db, 'pedidos'), pedidoData)
      const pedidoId = nuevoPedidoRef.key

      if (entrega !== 'mesa' && metodoPago === 'mercadopago') {
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
              external_reference: pedidoId,
              total: total 
            })
          })
          const data = await response.json()
          if (data.init_point) {
            window.location.href = data.init_point 
            return
          }
        } catch (err) {
          setLoadingMP(false)
          return toast.error("Error al conectar con Mercado Pago")
        }
      }

      let mensajeWA = `*NUEVO PEDIDO - ${entrega.toUpperCase()}*%0A`
      mensajeWA += `*Pago:* ${pedidoData.metodoPago.toUpperCase()}%0A`
      mensajeWA += `*Destino:* ${pedidoData.destino}%0A%0A`
      mensajeWA += carrito.map(i => `• ${i.cant}x ${i.nombre}`).join('%0A')
      mensajeWA += `%0A%0A*TOTAL: $${total}*`

      window.open(`https://wa.me/542966249538?text=${mensajeWA}`, '_blank')
      setCarrito([])
      setLoadingMP(false)
      toast.success("¡Pedido enviado!")

    } catch (e) {
      setLoadingMP(false)
      toast.error("Error al procesar el pedido")
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto pb-40 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
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

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-50">
            {entrega === 'mesa' ? (
              <input 
                placeholder="ESCRIBÍ TU N° DE MESA..." 
                className="text-xl font-black uppercase italic w-full border-none focus:ring-0 text-slate-800"
                value={numeroMesa} onChange={e => setNumeroMesa(e.target.value)}
              />
            ) : entrega === 'delivery' ? (
              <div className="flex gap-2">
                <input 
                  placeholder="DIRECCIÓN O LINK DE MAPA..." 
                  className="flex-1 bg-slate-50 rounded-xl px-4 font-bold text-sm h-12 border-none" 
                  value={direccion} onChange={e => setDireccion(e.target.value)} 
                />
                <Button onClick={obtenerUbicacion} variant="outline" className="h-12 w-12 rounded-xl border-orange-100 text-orange-600 shadow-sm">
                  <Navigation size={18} />
                </Button>
              </div>
            ) : (
              <p className="text-center font-black text-slate-300 italic uppercase text-xs">Retiro por local - Te avisamos por WhatsApp</p>
            )}
          </div>

          {/* --- RENDERIZADO DE LA PROMOCIÓN (NUEVO) --- */}
          {promoPublicada && (
            <Card className="rounded-[2rem] overflow-hidden border-none bg-slate-900 text-white shadow-xl animate-in zoom-in duration-500">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-40 md:h-auto"><img src={promoPublicada.imagen} className="w-full h-full object-cover opacity-80" alt="Promo" /></div>
                <CardContent className="p-6 flex-1 flex flex-col justify-center">
                  <h2 className="text-2xl font-black uppercase italic text-orange-400">{promoPublicada.titulo}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-4">{promoPublicada.mensaje}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black">${Number(promoPublicada.precio).toLocaleString()}</span>
                    <Button 
                      onClick={() => setCarrito([...carrito, { id: 'promo', nombre: promoPublicada.titulo, precio: Number(promoPublicada.precio), cant: 1 }])}
                      className="bg-white text-slate-900 hover:bg-orange-500 hover:text-white rounded-xl font-black uppercase italic"
                    >
                      AGREGAR PROMO
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {productos.filter(p => catSeleccionada === "Todas" || p.categoria === catSeleccionada).map(p => (
              <Card key={p.id} className="rounded-[2rem] overflow-hidden border-none shadow-sm bg-white">
                <div className="h-40 overflow-hidden"><img src={p.imagen} className="w-full h-full object-cover" alt={p.nombre} /></div>
                <CardContent className="p-5 flex justify-between items-center">
                  <div>
                    <h3 className="uppercase font-black text-xs italic">{p.nombre}</h3>
                    <span className="text-lg font-black text-orange-600">${p.precio.toLocaleString()}</span>
                  </div>
                  <Button onClick={() => setCarrito([...carrito, {...p, cant: 1}])} className="bg-slate-900 rounded-xl h-10 w-10 p-0 shadow-lg"><Plus size={18}/></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-[2.5rem] shadow-2xl border-none sticky top-24 bg-white overflow-hidden border-t-4 border-orange-500">
            <div className="bg-slate-900 p-6 text-center text-white">
                <h3 className="text-white/50 font-black uppercase italic text-[9px]">Total Pedido</h3>
                <div className="text-3xl font-black">${total.toLocaleString('es-AR')}</div>
            </div>
            
            <CardContent className="p-5 space-y-6">
              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase text-center italic">Items Seleccionados</p>
                <ScrollArea className="h-[200px] pr-2">
                  {carrito.length === 0 ? (
                    <p className="text-center text-slate-300 py-10 italic text-[10px] font-black uppercase">Carrito vacío</p>
                  ) : (
                    <div className="space-y-2">
                      {carrito.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase italic leading-tight">{item.nombre}</span>
                            <span className="text-[10px] font-bold text-orange-600">${item.precio.toLocaleString()}</span>
                          </div>
                          <button onClick={() => eliminarDelCarrito(idx)} className="h-7 w-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              <hr className="border-slate-100" />

              {entrega !== 'mesa' ? (
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase text-center italic">Método de Pago</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setMetodoPago('efectivo')} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'efectivo' ? 'border-green-500 bg-green-50 shadow-md scale-105' : 'border-slate-50 opacity-40'}`}>
                      <Banknote size={16} className="text-green-600" /><span className="text-[7px] font-black uppercase italic">Efectivo</span>
                    </button>
                    <button onClick={() => setMetodoPago('transferencia')} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'transferencia' ? 'border-blue-500 bg-blue-50 shadow-md scale-105' : 'border-slate-50 opacity-40'}`}>
                      <Wallet size={16} className="text-blue-600" /><span className="text-[7px] font-black uppercase italic">Transf.</span>
                    </button>
                    <button onClick={() => setMetodoPago('mercadopago')} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'mercadopago' ? 'border-sky-400 bg-sky-50 shadow-md scale-105' : 'border-slate-50 opacity-40'}`}>
                      <CreditCard size={16} className="text-sky-500" /><span className="text-[7px] font-black uppercase italic">M. Pago</span>
                    </button>
                  </div>
                  {metodoPago === 'transferencia' && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-black text-blue-900 uppercase italic">Alias: {DATOS_PAGO.alias}</span>
                        <Button onClick={copiarAlias} size="sm" className="bg-blue-600 h-8 w-8 p-0">
                          {copiado ? <Check size={14}/> : <Copy size={14}/>}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase italic">Pago presencial en mesa</p>
                </div>
              )}

              <Button 
                onClick={enviarPedido} 
                disabled={loadingMP}
                className={`w-full h-14 rounded-2xl font-black text-xs uppercase italic shadow-xl transition-all ${metodoPago === 'mercadopago' && entrega !== 'mesa' ? 'bg-sky-400 hover:bg-sky-500' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {loadingMP && metodoPago === 'mercadopago' ? <Loader2 className="animate-spin" /> : 
                 entrega === 'mesa' ? 'ENVIAR PEDIDO A COCINA' : 
                 metodoPago === 'mercadopago' ? 'PAGAR CON MERCADO PAGO' : 'ENVIAR PEDIDO'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
