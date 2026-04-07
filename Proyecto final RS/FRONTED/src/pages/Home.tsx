import { useState, useEffect } from "react" // Agregado useEffect
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Utensils, CalendarDays, Users, Phone, User, Clock, X, ChefHat, AlertCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { db } from "../lib/firebase"
import { ref, push, onValue } from "firebase/database" // Agregado onValue
import { toast } from "sonner"

export default function Home({ tema, perfil }: { tema: any, perfil: any }) {
  const [showReserva, setShowReserva] = useState(false)
  const [reserva, setReserva] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    comensales: "2",
    fecha: "",
    hora: ""
  })

  // --- NUEVA LÓGICA DE ESTADO ---
  const [estaAbiertoAhora, setEstaAbiertoAhora] = useState(true)

  useEffect(() => {
    const configRef = ref(db, 'config')
    const unsubscribe = onValue(configRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const estadoLocal = data.estado || 'auto'
        const horarios = data.horarios || null

        const verificarApertura = () => {
          if (estadoLocal === 'abierto') return setEstaAbiertoAhora(true)
          if (estadoLocal === 'cerrado') return setEstaAbiertoAhora(false)

          if (estadoLocal === 'auto' && horarios) {
            const ahora = new Date()
            const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
            const hoy = dias[ahora.getDay()]
            const h = horarios[hoy]

            if (!h || !h.activo) return setEstaAbiertoAhora(false)

            const actual = ahora.getHours() * 100 + ahora.getMinutes()
            const inicio = parseInt(h.inicio.replace(':', ''))
            const fin = parseInt(h.fin.replace(':', ''))
            setEstaAbiertoAhora(actual >= inicio && actual <= fin)
          }
        }
        
        verificarApertura()
        const interval = setInterval(verificarApertura, 30000)
        return () => clearInterval(interval)
      }
    })
    return () => unsubscribe()
  }, [])

  const hacerReserva = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reserva.nombre || !reserva.telefono || !reserva.fecha || !reserva.hora) {
      return toast.error("Por favor completá todos los datos")
    }

    try {
      await push(ref(db, 'reservas'), {
        ...reserva,
        estado: "confirmada",
        creado: new Date().toISOString()
      })

      const mensajeWA = `*NUEVA RESERVA*%0A*Nombre:* ${reserva.nombre} ${reserva.apellido}%0A*Personas:* ${reserva.comensales}%0A*Fecha:* ${reserva.fecha}%0A*Hora:* ${reserva.hora}%0A*Tel:* ${reserva.telefono}`
      window.open(`https://wa.me/542966249538?text=${mensajeWA}`, '_blank')

      toast.success("¡Reserva enviada con éxito!")
      setShowReserva(false)
      setReserva({ nombre: "", apellido: "", telefono: "", comensales: "2", fecha: "", hora: "" })
    } catch (e) {
      toast.error("Error al procesar la reserva")
    }
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 space-y-6 transition-colors duration-500 ${tema.bgPage}`}>
      
      <div className="text-center space-y-2 mb-4 animate-in fade-in zoom-in duration-700">
        {/* LOGO DINÁMICO */}
        <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl rotate-6 mb-4 border-4 border-white overflow-hidden bg-orange-600">
          {perfil?.logoUrl ? (
            <img src={perfil.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <ChefHat className="text-white" size={45} />
          )}
        </div>

        {/* NOMBRE DINÁMICO */}
        <h1 className={`text-5xl font-black italic uppercase tracking-tighter leading-none ${tema.text}`}>
          {perfil?.nombreLocal || "RESTOAPP"}
        </h1>
        
        {/* AVISO DE ESTADO EN HOME */}
        {estaAbiertoAhora ? (
          <p className={`opacity-40 font-bold italic text-sm tracking-widest ${tema.text}`}>BIENVENIDOS</p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-red-600 animate-pulse mt-2">
            <AlertCircle size={14} />
            <p className="font-black italic text-[10px] uppercase tracking-widest">Cerrado por el momento</p>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Link to="/menu" className="block">
          <Button className={`w-full h-24 rounded-[2.5rem] shadow-xl border-none text-xl font-black uppercase italic tracking-tighter transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${tema.bgHeader} ${tema.text} hover:opacity-90 relative overflow-hidden`}>
            <Utensils className={estaAbiertoAhora ? "text-orange-600" : "text-slate-400"} size={24} />
            <span className="text-sm opacity-60">{estaAbiertoAhora ? "Explorar el" : "Ver solo"}</span>
            CARTA DIGITAL
            {!estaAbiertoAhora && (
              <div className="absolute top-2 right-4 bg-red-600 text-[8px] text-white px-2 py-0.5 rounded-full">SOLO CONSULTA</div>
            )}
          </Button>
        </Link>

        <Button 
          onClick={() => setShowReserva(true)}
          className="w-full h-24 bg-slate-900 hover:bg-orange-600 text-white rounded-[2.5rem] shadow-2xl border-none text-xl font-black uppercase italic tracking-tighter transition-all active:scale-95 flex flex-col items-center justify-center gap-1 group"
        >
          <CalendarDays className="group-hover:text-white text-orange-500 transition-colors" size={24} />
          <span className="text-sm opacity-60">Asegurá tu lugar</span>
          RESERVAR MESA
        </Button>
      </div>

      <div className={`mt-8 text-[10px] font-black uppercase italic opacity-30 tracking-[0.3em] ${tema.text}`}>
        San Vicente • Misiones
      </div>

      {/* MODAL DE RESERVA ADAPTADO (Tu código original intacto) */}
      {showReserva && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <Card className={`w-full max-w-md rounded-[3rem] border-none shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh] ${tema.bgHeader}`}>
            <div className="bg-orange-600 p-8 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <CalendarDays size={24} />
                <h2 className="font-black uppercase italic tracking-tighter text-xl">Nueva Reserva</h2>
              </div>
              <button onClick={() => setShowReserva(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors shadow-lg">
                <X size={20} />
              </button>
            </div>
            <CardContent className="p-8">
              <form onSubmit={hacerReserva} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase ml-2 opacity-50 italic ${tema.text}`}>Nombre</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input className={`pl-10 rounded-2xl h-12 font-bold border-none bg-black/5 ${tema.text}`} placeholder="Juan" value={reserva.nombre} onChange={e => setReserva({...reserva, nombre: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase ml-2 opacity-50 italic ${tema.text}`}>Apellido</label>
                    <Input className={`rounded-2xl h-12 font-bold border-none bg-black/5 ${tema.text}`} placeholder="Pérez" value={reserva.apellido} onChange={e => setReserva({...reserva, apellido: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-black uppercase ml-2 opacity-50 italic ${tema.text}`}>WhatsApp / Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                    <Input className={`pl-10 rounded-2xl h-12 font-bold border-none bg-black/5 ${tema.text}`} placeholder="3755 000000" type="tel" value={reserva.telefono} onChange={e => setReserva({...reserva, telefono: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase ml-2 opacity-50 italic ${tema.text}`}>Fecha</label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input className={`pl-10 rounded-2xl h-12 font-bold border-none bg-black/5 cursor-pointer ${tema.text}`} type="date" value={reserva.fecha} onChange={e => setReserva({...reserva, fecha: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className={`text-[10px] font-black uppercase ml-2 opacity-50 italic ${tema.text}`}>Hora</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                      <Input className={`pl-10 rounded-2xl h-12 font-bold border-none bg-black/5 cursor-pointer ${tema.text}`} type="time" value={reserva.hora} onChange={e => setReserva({...reserva, hora: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pb-4">
                  <label className={`text-[10px] font-black uppercase ml-2 opacity-50 italic ${tema.text}`}>Comensales</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 text-slate-400" size={18} />
                    <select 
                      className={`w-full pl-10 rounded-2xl h-12 font-black uppercase italic bg-black/5 text-[11px] appearance-none border-none ${tema.text}`}
                      value={reserva.comensales}
                      onChange={e => setReserva({...reserva, comensales: e.target.value})}
                    >
                      {[1,2,3,4,5,6,7,8,9,10,12,15].map(n => <option key={n} value={n} className="text-black">{n} Personas</option>)}
                    </select>
                  </div>
                </div>

                <Button type="submit" className="w-full h-16 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-black uppercase italic text-lg shadow-xl transition-all pt-1 active:scale-95">
                  Confirmar Reserva
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
