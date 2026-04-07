import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Utensils, Plus, Truck, Store, Wallet, 
  CreditCard, Banknote, Navigation, Copy, Check, Loader2, X, AlertCircle 
} from "lucide-react"
import { toast } from "sonner"
import { ref, push, onValue } from "firebase/database"
import { db } from "../lib/firebase"

const DATOS_PAGO = {
  alias: "RESTOWEB.SAN.VICENTE", 
  cbu: "0000003100012345678901",
  titular: "RESTOWEB SAN VICENTE",
  urlBackendMP: "https://proyecto-final-rs.onrender.com/api/payments/create_preference" 
}

export default function Menu({ productos, tema, perfil }: { productos: any[], tema: any, perfil: any }) {
  const [searchParams] = useSearchParams()
  const [carrito, setCarrito] = useState<any[]>([])
  const [copiado, setCopiado] = useState(false)
  const [loadingMP, setLoadingMP] = useState(false)
  
  const [entrega, setEntrega] = useState<'mesa' | 'delivery' | 'retiro'>('mesa')
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mercadopago'>('efectivo')
  const [numeroMesa, setNumeroMesa] = useState(searchParams.get("mesa") || "")
  const [direccion, setDireccion] = useState("")
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")
  const [promoPublicada, setPromoPublicada] = useState<any>(null)

  // Obtener categorías únicas de los productos
  const categoriasUnicas = ["Todas", ...new Set(productos.map(p => p.categoria))];

  useEffect(() => {
    const promoRef = ref(db, 'config/promo')
    const unsubscribe = onValue(promoRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        if (data.activa === true) setPromoPublicada(data)
        else setPromoPublicada(null)
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
      }

      let mensajeWA = `*NUEVO PEDIDO - ${entrega.toUpperCase()}*%0A`
      mensajeWA += `*Local:* ${perfil?.nombreLocal || 'RestoWeb'}%0A`
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
    <div className={`p-4 md:p-6 max-w-7xl mx-auto pb-40 animate-in fade-in duration-500 ${tema.bgPage}`}>
      
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col items-center mb-10 text-center">
        {perfil?.logoUrl && (
          <img src={perfil.logoUrl} alt="Logo" className="w-24 h-24 rounded-3xl object-cover shadow-2xl mb-4 border-4 border-white" />
        )}
        <h1 className={`text-5xl font-black uppercase italic tracking-tighter ${tema.text}`}>
          {perfil?.nombreLocal || "RestoWeb"}
        </h1>
        <div className={`h-1 w-20 ${tema.accent} rounded-full mt-2`}></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          
          {/* SELECTOR DE ENTREGA */}
          <div className={`${tema.bgHeader} p-2 rounded-[2rem] shadow-sm border ${tema.border} flex gap-2`}>
            {[
              { id: 'mesa', icon: Utensils, label: 'En Mesa' },
              { id: 'delivery', icon: Truck, label: 'Delivery' },
              { id: 'retiro', icon: Store, label: 'Retiro' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setEntrega(opt.id as any)}
                className={`flex-1 flex flex-col items-center py-3 rounded-[1.5rem] transition-all ${entrega === opt.id ? `${tema.accent} shadow-lg scale-105` : `text-slate-400 hover:opacity-70`}`}
              >
                <opt.icon size={18} className="mb-1" />
                <span className="text-[9px] font-black uppercase italic">{opt.label}</span>
              </button>
            ))}
          </div>

          {/* INPUT DE UBICACIÓN / MESA */}
          <div className={`${tema.bgHeader} p-6 rounded-[2.5rem] shadow-sm border ${tema.border} flex items-center gap-4`}>
            {entrega === 'mesa' ? (
              <>
                <div className={`${tema.accent} p-3 rounded-2xl`}>
                   <Utensils size={20} />
                </div>
                <input 
                  placeholder="NÚMERO DE MESA..." 
                  className={`text-xl font-black uppercase italic w-full bg-transparent border-none focus:ring-0 ${tema.text}`}
                  value={numeroMesa} onChange={e => setNumeroMesa(e.target.value)}
                />
              </>
            ) : entrega === 'delivery' ? (
              <div className="flex gap-2 w-full">
                <input 
                  placeholder="DIRECCIÓN DE ENTREGA..." 
                  className={`flex-1 bg-black/5 rounded-2xl px-4 font-bold text-sm h-14 border-none ${tema.text}`} 
                  value={direccion} onChange={e => setDireccion(e.target.value)} 
                />
                <Button onClick={obtenerUbicacion} variant="outline" className={`h-14 w-14 rounded-2xl ${tema.border} ${tema.primary} shadow-sm`}>
                  <Navigation size={20} />
                </Button>
              </div>
            ) : (
              <p className={`w-full text-center font-black opacity-40 italic uppercase text-xs ${tema.text}`}>Retiro por local - Avisamos por WhatsApp</p>
            )}
          </div>

          {/* CATEGORÍAS */}
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categoriasUnicas.map(cat => (
              <button
                key={cat}
                onClick={() => setCatSeleccionada(cat)}
                className={`px-6 py-3 rounded-2xl font-black uppercase italic text-[10px] whitespace-nowrap transition-all border ${catSeleccionada === cat ? `${tema.accent} border-transparent shadow-lg` : `${tema.bgHeader} ${tema.text} opacity-40 border-transparent`}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* PROMO DEL DÍA */}
          {promoPublicada && (
            <Card className={`rounded-[2.5rem] overflow-hidden border-none shadow-2xl animate-in zoom-in duration-500 ${tema.bgHeader} border-l-8 ${tema.border.replace('border-', 'border-l-')}`}>
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto"><img src={promoPublicada.imagen} className="w-full h-full object-cover" alt="Promo" /></div>
                <CardContent className="p-8 flex-1 flex flex-col justify-center relative">
                  <div className="absolute top-4 right-4 rotate-12">
                    <span className="bg-red-500 text-white font-black px-4 py-1 rounded-full text-[10px] uppercase italic shadow-lg">Oferta!</span>
                  </div>
                  <h2 className={`text-3xl font-black uppercase italic tracking-tighter mb-2 ${tema.text}`}>{promoPublicada.titulo}</h2>
                  <p className={`text-xs opacity-60 font-medium mb-6 leading-relaxed ${tema.text}`}>{promoPublicada.mensaje}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-3xl font-black ${tema.primary}`}>${Number(promoPublicada.precio).toLocaleString()}</span>
                    <Button 
                      onClick={() => {
                        setCarrito([...carrito, { id: 'promo', nombre: promoPublicada.titulo, precio: Number(promoPublicada.precio), cant: 1 }]);
                        toast.success("¡Promoción agregada!");
                      }}
                      className={`rounded-2xl h-14 px-8 font-black uppercase italic shadow-xl ${tema.accent}`}
                    >
                      AGREGAR PROMO
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}

          {/* GRILLA DE PRODUCTOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {productos.filter(p => catSeleccionada === "Todas" || p.categoria === catSeleccionada).map(p => (
              <Card key={p.id} className={`rounded-[2.5rem] overflow-hidden border-none shadow-sm ${tema.bgHeader} hover:shadow-xl transition-all group ${p.disponible === false ? 'opacity-50' : ''}`}>
                <div className="h-44 overflow-hidden relative">
                  <img src={p.imagen} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.nombre} />
                  {p.disponible === false && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-red-600 text-white px-6 py-2 rounded-full font-black italic text-xs uppercase tracking-widest shadow-2xl">Agotado</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                   <p className="text-[9px] font-black uppercase italic opacity-30 mb-1">{p.categoria}</p>
                   <h3 className={`uppercase font-black text-sm italic mb-4 ${tema.text}`}>{p.nombre}</h3>
                   <div className="flex justify-between items-center">
                      <span className={`text-xl font-black ${tema.primary}`}>${p.precio.toLocaleString()}</span>
                      <Button 
                        onClick={() => {
                          setCarrito([...carrito, {...p, cant: 1}]);
                          toast.success(`${p.nombre} al carrito`);
                        }} 
                        disabled={p.disponible === false}
                        className={`rounded-2xl h-12 w-12 p-0 shadow-lg ${p.disponible === false ? 'bg-slate-200 text-slate-400' : tema.accent}`}
                      >
                        {p.disponible === false ? <X size={20}/> : <Plus size={24}/>}
                      </Button>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CARRITO (LADO DERECHO) */}
        <div className="lg:col-span-1">
          <Card className={`rounded-[3rem] shadow-2xl border-none sticky top-10 overflow-hidden border-t-8 ${tema.bgHeader} ${tema.border.replace('border-', 'border-t-')}`}>
            <div className={`${tema.accent} p-8 text-center`}>
                <h3 className="opacity-50 font-black uppercase italic text-[10px] mb-1">Total a Pagar</h3>
                <div className="text-4xl font-black italic tracking-tighter">${total.toLocaleString('es-AR')}</div>
            </div>
            
            <CardContent className="p-6 space-y-6">
              <ScrollArea className="h-[250px] pr-2">
                {carrito.length === 0 ? (
                  <div className="text-center py-10 space-y-2 opacity-20">
                    <Utensils className="mx-auto" size={40} />
                    <p className="text-[10px] font-black uppercase italic">Tu pedido está vacío</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {carrito.map((item, idx) => (
                      <div key={idx} className={`flex justify-between items-center p-4 rounded-3xl border ${tema.border} bg-black/5 animate-in slide-in-from-right-4`}>
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-black uppercase italic leading-tight ${tema.text}`}>{item.nombre}</span>
                          <span className={`text-[10px] font-bold ${tema.primary}`}>${item.precio.toLocaleString()}</span>
                        </div>
                        <button onClick={() => eliminarDelCarrito(idx)} className="h-8 w-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <hr className={`opacity-10 ${tema.text}`} />

              {entrega !== 'mesa' && (
                <div className="space-y-4">
                  <p className={`text-[10px] font-black opacity-30 uppercase text-center italic ${tema.text}`}>Forma de Pago</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setMetodoPago('efectivo')} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'efectivo' ? 'border-green-500 bg-green-500/10 scale-105' : `border-transparent opacity-40`}`}>
                      <Banknote size={18} className="text-green-600 mb-1" /><span className={`text-[7px] font-black uppercase italic ${tema.text}`}>Efectivo</span>
                    </button>
                    <button onClick={() => setMetodoPago('transferencia')} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'transferencia' ? 'border-blue-500 bg-blue-500/10 scale-105' : `border-transparent opacity-40`}`}>
                      <Wallet size={18} className="text-blue-600 mb-1" /><span className={`text-[7px] font-black uppercase italic ${tema.text}`}>Transf.</span>
                    </button>
                    <button onClick={() => setMetodoPago('mercadopago')} className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${metodoPago === 'mercadopago' ? 'border-sky-400 bg-sky-400/10 scale-105' : `border-transparent opacity-40`}`}>
                      <CreditCard size={18} className="text-sky-500 mb-1" /><span className={`text-[7px] font-black uppercase italic ${tema.text}`}>M. Pago</span>
                    </button>
                  </div>
                  
                  {metodoPago === 'transferencia' && (
                    <div className={`p-4 rounded-2xl border bg-blue-500/5 ${tema.border} space-y-2`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-black uppercase italic ${tema.text}`}>Alias: {DATOS_PAGO.alias}</span>
                        <Button onClick={copiarAlias} size="sm" className="bg-blue-600 h-8 w-8 p-0 rounded-lg">
                          {copiado ? <Check size={14}/> : <Copy size={14}/>}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={enviarPedido} 
                disabled={loadingMP || carrito.length === 0}
                className={`w-full h-16 rounded-[1.5rem] font-black text-xs uppercase italic shadow-2xl transition-all ${metodoPago === 'mercadopago' && entrega !== 'mesa' ? 'bg-[#009EE3] hover:bg-[#007EB5] text-white' : tema.accent}`}
              >
                {loadingMP ? <Loader2 className="animate-spin" /> : 
                 entrega === 'mesa' ? 'PEDIR A COCINA' : 
                 metodoPago === 'mercadopago' ? 'PAGAR AHORA' : 'CONFIRMAR PEDIDO'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
