import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Utensils, Plus, Truck, Store, Wallet, 
  CreditCard, Banknote, Navigation, Loader2, X, Clock, Copy, Check, ShoppingCart, ChevronUp 
} from "lucide-react"
import { toast } from "sonner"
import { ref, push, onValue, get } from "firebase/database"
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
  const [loadingMP, setLoadingMP] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false) // Para el drawer móvil
  
  const [entrega, setEntrega] = useState<'mesa' | 'delivery' | 'retiro'>('mesa')
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia' | 'mercadopago'>('efectivo')
  const [numeroMesa, setNumeroMesa] = useState(searchParams.get("mesa") || "")
  const [direccion, setDireccion] = useState("")
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")
  const [promoPublicada, setPromoPublicada] = useState<any>(null)

  const [estadoLocal, setEstadoLocal] = useState<'abierto' | 'cerrado' | 'auto'>('auto')
  const [horarios, setHorarios] = useState<any>(null)
  const [estaAbiertoAhora, setEstaAbiertoAhora] = useState(true)

  const categoriasUnicas = ["Todas", ...new Set(productos.map(p => p.categoria))];
  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)

  // --- ESCUCHA DE CONFIGURACIÓN ---
  useEffect(() => {
    const configRef = ref(db, 'config')
    const unsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setEstadoLocal(data.estado || 'auto')
        setHorarios(data.horarios || null)
        if (data.promo?.activa === true) setPromoPublicada(data.promo)
        else setPromoPublicada(null)
      }
    })
    return () => unsubscribe()
  }, [])

  // --- LÓGICA DE VALIDACIÓN DE HORARIOS ---
  useEffect(() => {
    const verificar = () => {
      if (estadoLocal === 'cerrado') { setEstaAbiertoAhora(false); return; }
      if (estadoLocal === 'abierto') { setEstaAbiertoAhora(true); return; }
      if (estadoLocal === 'auto' && horarios) {
        const ahora = new Date()
        const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
        const hoy = dias[ahora.getDay()]
        const h = horarios[hoy]
        if (!h || !h.activo) { setEstaAbiertoAhora(false); return; }
        const actual = ahora.getHours() * 100 + ahora.getMinutes()
        const inicio = parseInt(h.inicio.replace(':', ''))
        const fin = parseInt(h.fin.replace(':', ''))
        setEstaAbiertoAhora(actual >= inicio && actual <= fin)
      }
    }
    verificar()
    const i = setInterval(verificar, 30000)
    return () => clearInterval(i)
  }, [estadoLocal, horarios])

  const copiarDato = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto)
    toast.success(`${label} copiado`)
  }

  const eliminarDelCarrito = (index: number) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
    if(nuevoCarrito.length === 0) setIsCartOpen(false);
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

  // --- FUNCIÓN DE ENVÍO CON TODAS TUS VALIDACIONES ORIGINALES ---
  const enviarPedido = async () => {
    const freshConfig = await get(ref(db, 'config'));
    const isActuallyClosed = freshConfig.exists() && freshConfig.val().estado === 'cerrado';

    if (!estaAbiertoAhora || isActuallyClosed) {
      return toast.error("Lo sentimos, el local acaba de cerrar.")
    }

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
      setIsCartOpen(false)
      setLoadingMP(false)
      toast.success("¡Pedido enviado!")
    } catch (e) {
      setLoadingMP(false)
      toast.error("Error al procesar el pedido")
    }
  }

  return (
    <div className={`min-h-screen pb-28 md:pb-10 transition-colors duration-500 ${tema.bgPage}`}>
      
      {/* HEADER */}
      <header className="flex flex-col items-center pt-8 pb-4 text-center px-4">
        {perfil?.logoUrl && (
          <img src={perfil.logoUrl} alt="Logo" className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] object-cover shadow-2xl mb-4 border-4 border-white animate-in zoom-in" />
        )}
        <h1 className={`text-4xl md:text-6xl font-black uppercase italic tracking-tighter ${tema.text}`}>
          {perfil?.nombreLocal || "RestoWeb"}
        </h1>
        <div className={`h-1.5 w-20 ${tema.accent} rounded-full mt-2`}></div>
        
        {!estaAbiertoAhora && (
          <div className="mt-6 bg-red-600 text-white px-8 py-3 rounded-2xl flex items-center gap-3 animate-pulse shadow-xl">
            <Clock size={20} />
            <span className="font-black uppercase italic text-xs tracking-widest">Local Cerrado temporalmente</span>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* LADO IZQUIERDO: PRODUCTOS Y CONFIG */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SELECTOR DE ENTREGA (STICKY) */}
          <section className="sticky top-2 z-40 bg-opacity-95 backdrop-blur-md">
            <div className={`${tema.bgHeader} p-1.5 rounded-full shadow-2xl border ${tema.border} flex gap-1`}>
              {[
                { id: 'mesa', icon: Utensils, label: 'En Mesa' },
                { id: 'delivery', icon: Truck, label: 'Delivery' },
                { id: 'retiro', icon: Store, label: 'Retiro' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  disabled={!estaAbiertoAhora}
                  onClick={() => setEntrega(opt.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full transition-all ${entrega === opt.id ? `${tema.accent} shadow-lg scale-[1.02]` : `text-slate-400 opacity-50`} ${!estaAbiertoAhora && 'grayscale opacity-50'}`}
                >
                  <opt.icon size={18} />
                  <span className="text-[10px] font-black uppercase italic hidden sm:block">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* INPUTS DE UBICACIÓN */}
          <section className={`${tema.bgHeader} p-4 md:p-6 rounded-[2.5rem] shadow-xl border ${tema.border} flex items-center gap-4 animate-in slide-in-from-top-4`}>
            {entrega === 'mesa' ? (
              <>
                <div className={`${tema.accent} p-3 rounded-2xl hidden sm:block`}><Utensils size={20} /></div>
                <input 
                  disabled={!estaAbiertoAhora}
                  placeholder="NÚMERO DE MESA..." 
                  className={`text-xl font-black uppercase italic w-full bg-transparent border-none focus:ring-0 text-center sm:text-left ${tema.text} ${!estaAbiertoAhora && 'opacity-20'}`}
                  value={numeroMesa} onChange={e => setNumeroMesa(e.target.value)}
                />
              </>
            ) : entrega === 'delivery' ? (
              <div className="flex gap-2 w-full">
                <input 
                  disabled={!estaAbiertoAhora}
                  placeholder="DIRECCIÓN DE ENTREGA..." 
                  className={`flex-1 bg-black/5 rounded-2xl px-4 font-bold text-sm h-14 border-none ${tema.text}`} 
                  value={direccion} onChange={e => setDireccion(e.target.value)} 
                />
                <button disabled={!estaAbiertoAhora} onClick={obtenerUbicacion} className={`h-14 w-14 flex items-center justify-center rounded-2xl ${tema.accent} text-white shadow-lg`}>
                  <Navigation size={20} />
                </button>
              </div>
            ) : (
              <p className={`w-full text-center font-black opacity-40 italic uppercase text-[10px] ${tema.text}`}>Retiro por local - Avisamos por WhatsApp</p>
            )}
          </section>

          {/* CATEGORÍAS */}
          <nav className="flex gap-3 overflow-x-auto pb-4 no-scrollbar sticky top-20 z-30 py-2">
            {categoriasUnicas.map(cat => (
              <button
                key={cat}
                onClick={() => setCatSeleccionada(cat)}
                className={`px-6 py-3 rounded-2xl font-black uppercase italic text-[10px] whitespace-nowrap transition-all border ${catSeleccionada === cat ? `${tema.accent} border-transparent shadow-lg` : `${tema.bgHeader} ${tema.text} opacity-40 border-transparent`}`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* PROMO */}
          {promoPublicada && (
            <Card className={`rounded-[2.5rem] overflow-hidden border-none shadow-2xl animate-in zoom-in duration-500 ${tema.bgHeader} border-l-8 ${tema.border.replace('border-', 'border-l-')} ${!estaAbiertoAhora && 'opacity-50'}`}>
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
                      onClick={() => { setCarrito([...carrito, { id: 'promo', nombre: promoPublicada.titulo, precio: Number(promoPublicada.precio), cant: 1 }]); toast.success("¡Promoción agregada!"); }}
                      disabled={!estaAbiertoAhora}
                      className={`rounded-2xl h-14 px-8 font-black uppercase italic shadow-xl ${estaAbiertoAhora ? tema.accent : 'bg-slate-300'}`}
                    > AGREGAR </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          )}

          {/* GRILLA DE PRODUCTOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {productos.filter(p => catSeleccionada === "Todas" || p.categoria === catSeleccionada).map(p => (
              <Card key={p.id} className={`rounded-[2.5rem] overflow-hidden border-none shadow-sm ${tema.bgHeader} hover:shadow-xl transition-all group active:scale-95 ${(p.disponible === false || !estaAbiertoAhora) ? 'opacity-50' : ''}`}>
                <div className="h-44 overflow-hidden relative">
                  <img src={p.imagen} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.nombre} />
                  {(p.disponible === false || !estaAbiertoAhora) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-red-600 text-white px-6 py-2 rounded-full font-black italic text-[10px] uppercase tracking-widest shadow-2xl">
                        {p.disponible === false ? 'Agotado' : 'Cerrado'}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                   <p className="text-[9px] font-black uppercase italic opacity-30 mb-1">{p.categoria}</p>
                   <h3 className={`uppercase font-black text-sm italic mb-4 line-clamp-1 ${tema.text}`}>{p.nombre}</h3>
                   <div className="flex justify-between items-center">
                      <span className={`text-xl font-black ${tema.primary}`}>${p.precio.toLocaleString()}</span>
                      <Button 
                        onClick={() => { setCarrito([...carrito, {...p, cant: 1}]); toast.success(`${p.nombre} al carrito`); }} 
                        disabled={p.disponible === false || !estaAbiertoAhora}
                        className={`rounded-2xl h-12 w-12 p-0 shadow-lg ${(p.disponible === false || !estaAbiertoAhora) ? 'bg-slate-200 text-slate-400' : tema.accent}`}
                      >
                        {(p.disponible === false || !estaAbiertoAhora) ? <X size={20}/> : <Plus size={24}/>}
                      </Button>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* LADO DERECHO: CARRITO (STICKY / FLOATING MÓVIL) */}
        <aside className={`fixed inset-x-0 bottom-0 z-50 lg:relative lg:inset-auto lg:col-span-4 transition-transform duration-500 ${isCartOpen ? 'translate-y-0' : 'translate-y-[calc(100%-70px)] lg:translate-y-0'}`}>
          
          {/* TIRADOR MÓVIL */}
          <div onClick={() => setIsCartOpen(!isCartOpen)} className={`lg:hidden flex items-center justify-between px-8 h-[70px] rounded-t-[2.5rem] shadow-2xl cursor-pointer ${estaAbiertoAhora ? tema.accent : 'bg-slate-500'}`}>
            <div className="flex items-center gap-3">
              <ShoppingCart size={24} />
              <span className="font-black italic uppercase text-sm">Tu Pedido ({carrito.length})</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-black text-xl">${total.toLocaleString()}</span>
              {isCartOpen ? <X size={24}/> : <ChevronUp size={24} className="animate-bounce"/>}
            </div>
          </div>

          <Card className={`h-[85vh] lg:h-auto lg:sticky lg:top-10 flex flex-col rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl border-none overflow-hidden border-t-8 ${tema.bgHeader} ${tema.border.replace('border-', 'border-t-')}`}>
            <div className={`hidden lg:block ${estaAbiertoAhora ? tema.accent : 'bg-slate-400'} p-8 text-center transition-colors`}>
                <h3 className="opacity-50 font-black uppercase italic text-[10px] mb-1">Total a Pagar</h3>
                <div className="text-4xl font-black italic tracking-tighter">${total.toLocaleString('es-AR')}</div>
            </div>
            
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
              <ScrollArea className="h-[250px] lg:h-[300px] pr-2">
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

              {/* MÉTODOS DE PAGO INTEGRALES */}
              {entrega !== 'mesa' && carrito.length > 0 && (
                <div className={`space-y-4 ${!estaAbiertoAhora && 'opacity-20 pointer-events-none'}`}>
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
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-4 space-y-3 animate-in fade-in zoom-in">
                      <p className="text-[9px] font-black uppercase italic text-blue-600 text-center">Datos Bancarios</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white/50 p-2 rounded-xl">
                          <div className="flex flex-col"><span className="text-[7px] font-bold opacity-40 uppercase">Alias</span><span className="text-[9px] font-black uppercase italic">{DATOS_PAGO.alias}</span></div>
                          <button onClick={() => copiarDato(DATOS_PAGO.alias, "Alias")} className="p-1.5 text-blue-600"><Copy size={12} /></button>
                        </div>
                        <div className="flex justify-between items-center bg-white/50 p-2 rounded-xl">
                          <div className="flex flex-col"><span className="text-[7px] font-bold opacity-40 uppercase">CBU</span><span className="text-[9px] font-black uppercase italic">{DATOS_PAGO.cbu}</span></div>
                          <button onClick={() => copiarDato(DATOS_PAGO.cbu, "CBU")} className="p-1.5 text-blue-600"><Copy size={12} /></button>
                        </div>
                        <div className="text-center pt-1 border-t border-blue-500/10"><span className="text-[7px] uppercase font-bold opacity-40 block">Titular</span><span className="text-[9px] font-black uppercase italic">{DATOS_PAGO.titular}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={enviarPedido} 
                disabled={loadingMP || carrito.length === 0 || !estaAbiertoAhora}
                className={`w-full h-16 rounded-[1.5rem] font-black text-xs uppercase italic shadow-2xl transition-all ${!estaAbiertoAhora ? 'bg-slate-300' : (metodoPago === 'mercadopago' && entrega !== 'mesa' ? 'bg-[#009EE3] text-white' : tema.accent)}`}
              >
                {loadingMP ? <Loader2 className="animate-spin" /> : !estaAbiertoAhora ? 'LOCAL CERRADO' : 'ENVIAR PEDIDO'}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}
