import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plus, Trash2, UploadCloud, Edit3, Save, Megaphone, 
  DollarSign, CalendarDays, Settings, Palette, 
  LogOut, LayoutDashboard, ExternalLink, ChevronRight, Check, Utensils, QrCode, Store, Clock, Power, BellRing, Volume2, CreditCard, Lock
} from "lucide-react"
import { ref, push, remove, update, onValue, set, onChildAdded, query, limitToLast } from "firebase/database"
import { db } from "../lib/firebase"
import { toast } from "sonner"
import { Link } from "react-router-dom"

const CATEGORIAS_MENU = [
  "Entradas", "Principales", "Pastas caseras", "Sandwiches", 
  "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", 
  "Postres", "Cerveza", "Vinos", "Gaseosas"
];

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function Admin({ productos, tema, perfil }: { productos: any[], tema: any, perfil: any }) {
  const [tab, setTab] = useState<'menu' | 'reservas' | 'config'>('menu')
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ precio: "", descripcion: "" })
  const [promo, setPromo] = useState({ activa: false, titulo: "", mensaje: "", imagen: "", precio: "" })
  const [reservas, setReservas] = useState<any[]>([])
  const [temaActivo, setTemaActivo] = useState('naranja')
  
  const [showPedidoModal, setShowPedidoModal] = useState(false)
  const [ultimoPedido, setUltimoPedido] = useState<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const initialized = useRef(false)

  const [showConfirm, setShowConfirm] = useState(false)
  const [passConfirm, setPassConfirm] = useState("")
  const [datosPago, setDatosPago] = useState({ cbu: "", alias: "", titular: "" })

  const [estadoLocal, setEstadoLocal] = useState({
    manualAbierto: true,
    horarios: DIAS_SEMANA.reduce((acc, dia) => ({ ...acc, [dia]: { inicio: "20:00", fin: "00:00" } }), {})
  })

  const [perfilEdit, setPerfilEdit] = useState({
    nombreLocal: perfil?.nombreLocal || "RESTOAPP",
    logoUrl: perfil?.logoUrl || ""
  })

  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2205/2205-preview.mp3")
    audioRef.current.loop = true

    onValue(ref(db, 'config/promo'), (snapshot) => { if (snapshot.exists()) setPromo(snapshot.val()); });
    onValue(ref(db, 'config/tema'), (snapshot) => { if (snapshot.exists()) setTemaActivo(snapshot.val()); });
    onValue(ref(db, 'config/estado'), (snapshot) => { if (snapshot.exists()) setEstadoLocal(snapshot.val()); });
    onValue(ref(db, 'config/pagos'), (snapshot) => { if (snapshot.exists()) setDatosPago(snapshot.val()); });
    onValue(ref(db, 'reservas'), (snapshot) => {
      const data = snapshot.val();
      setReservas(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse() : []);
    });

    const startTime = Date.now();
    const pedidosRef = query(ref(db, 'reservas'), limitToLast(1));
    
    const unsubscribe = onChildAdded(pedidosRef, (snapshot) => {
      if (!initialized.current) {
        initialized.current = true;
        return;
      }
      
      const nuevoPedido = snapshot.val();
      if (nuevoPedido && nuevoPedido.createdAt > startTime) {
        setUltimoPedido(nuevoPedido);
        setShowPedidoModal(true);
        audioRef.current?.play().catch(() => console.log("Audio bloqueado"));

        toast.custom((t) => (
          <div className={`${tema.bgHeader} border-2 ${tema.border} p-3 md:p-4 rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-right-full w-[90vw] max-w-sm`}>
            <div className={`${tema.accent} p-2 rounded-full animate-bounce text-white`}><BellRing size={16} /></div>
            <div className="flex-1 min-w-0">
              <p className={`text-[8px] md:text-[10px] font-black uppercase opacity-50 ${tema.text}`}>¡Nuevo Pedido!</p>
              <p className={`text-xs md:text-sm font-bold truncate ${tema.primary}`}>{nuevoPedido.nombre} {nuevoPedido.apellido}</p>
            </div>
            <button onClick={() => { toast.dismiss(t); cerrarAlerta(); }} className={`px-2 py-1.5 md:px-3 md:py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase ${tema.accent} text-white`}>Ver</button>
          </div>
        ), { duration: Infinity });
      }
    });

    return () => { unsubscribe(); audioRef.current?.pause(); };
  }, [tema])

  const cerrarAlerta = () => {
    setShowPedidoModal(false);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setTab('reservas');
  }

  const guardarPagos = async () => { 
    if (!showConfirm) return setShowConfirm(true);
    if (passConfirm === "admin2026") {
      try { 
        await set(ref(db, 'config/pagos'), datosPago); 
        toast.success("Datos actualizados"); 
        setShowConfirm(false); setPassConfirm("");
      } catch (e) { toast.error("Error"); } 
    } else toast.error("Clave incorrecta");
  }

  const guardarPerfil = async () => { try { await set(ref(db, 'config/perfil'), perfilEdit); toast.success("Perfil actualizado"); } catch (e) { toast.error("Error"); } }
  const guardarEstadoLocal = async (nuevoEstado: any) => { try { await set(ref(db, 'config/estado'), nuevoEstado); toast.success("Horarios actualizados"); } catch (e) { toast.error("Error"); } }
  const cambiarTema = async (nuevoTema: string) => { try { await set(ref(db, 'config/tema'), nuevoTema); setTemaActivo(nuevoTema); toast.success(`Estilo ${nuevoTema} aplicado`); } catch (e) { toast.error("Error"); } }
  const guardarPromo = async () => { try { await set(ref(db, 'config/promo'), promo); toast.success("Promo guardada"); } catch (e) { toast.error("Error"); } }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'producto' | 'promo' | 'logo') => {
    if (!e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      const result = reader.result as string;
      if (tipo === 'producto') setNuevo(prev => ({ ...prev, imagen: result }));
      else if (tipo === 'promo') setPromo(prev => ({ ...prev, imagen: result }));
      else if (tipo === 'logo') setPerfilEdit(prev => ({ ...prev, logoUrl: result }));
    };
  };

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.nombre || !nuevo.precio || !nuevo.imagen) return toast.error("Faltan datos");
    await push(ref(db, 'productos'), { ...nuevo, precio: Number(nuevo.precio), disponible: true });
    setNuevo({ nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" });
    toast.success("¡Publicado!");
  }

  const guardarEdicion = async (id: string) => {
    await update(ref(db, `productos/${id}`), { precio: Number(editForm.precio), descripcion: editForm.descripcion });
    setEditandoId(null);
    toast.success("Actualizado");
  }

  return (
    <div className={`p-3 md:p-8 max-w-7xl mx-auto mb-24 animate-in fade-in duration-500 ${tema.bgPage}`}>
      
      {/* MODAL DE NUEVO PEDIDO RESPONSIVO */}
      {showPedidoModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 md:p-4 bg-black/95 backdrop-blur-md">
          <div className={`${tema.bgHeader} w-full max-w-md rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-4 ${tema.border} overflow-hidden`}>
            <div className={`${tema.accent} p-6 md:p-10 flex flex-col items-center justify-center`}>
              <BellRing className="text-white animate-bounce mb-4 w-12 h-12 md:w-20 md:h-20" />
              <h2 className="text-2xl md:text-4xl font-black uppercase italic text-white text-center">¡NUEVA ORDEN!</h2>
            </div>
            <div className="p-6 md:p-10 text-center space-y-4 md:space-y-6">
              <h3 className={`text-xl md:text-3xl font-black uppercase italic truncate ${tema.primary}`}>{ultimoPedido?.nombre} {ultimoPedido?.apellido}</h3>
              <div className="grid grid-cols-2 gap-2 md:gap-4 bg-black/5 p-4 md:p-6 rounded-3xl">
                <div className="text-center border-r border-black/10">
                  <p className="text-[8px] md:text-[10px] font-black opacity-40 uppercase">Personas</p>
                  <p className={`text-lg md:text-xl font-black ${tema.text}`}>{ultimoPedido?.comensales}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] md:text-[10px] font-black opacity-40 uppercase">Hora</p>
                  <p className={`text-lg md:text-xl font-black ${tema.text}`}>{ultimoPedido?.hora}hs</p>
                </div>
              </div>
              <Button onClick={cerrarAlerta} className={`w-full h-16 md:h-20 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase italic text-lg md:text-xl ${tema.accent}`}>
                <Check className="mr-2 w-5 h-5 md:w-7 md:h-7" /> ATENDER
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CABECERA ADAPTATIVA */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4 md:gap-6 ${tema.bgHeader} p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border ${tema.border}`}>
        <div className="w-full md:w-auto text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest mb-1">
            <LayoutDashboard size={12} /> <span>Panel</span> <ChevronRight size={12} /> <span className={tema.primary}>{tab}</span>
          </div>
          <h1 className={`text-xl md:text-3xl font-black uppercase italic tracking-tighter ${tema.text}`}>Gestión <span className={tema.primary}>{perfilEdit.nombreLocal}</span></h1>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => window.open('/', '_blank')} className={`flex-1 md:flex-none rounded-xl md:rounded-2xl font-black uppercase italic text-[9px] md:text-[10px] ${tema.border} ${tema.text} h-10 md:h-12 bg-transparent`}><ExternalLink size={14} className="mr-1 md:mr-2" /> Web</Button>
          <Button onClick={() => window.location.href = "/"} className="flex-1 md:flex-none bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl md:rounded-2xl font-black uppercase italic text-[9px] md:text-[10px] h-10 md:h-12 border-none"><LogOut size={14} className="mr-1 md:mr-2" /> Salir</Button>
        </div>
      </div>

      {/* TABS CON SCROLL LATERAL EN MÓVIL */}
      <div className="flex overflow-x-auto no-scrollbar bg-black/5 p-1.5 md:p-2 rounded-[1.5rem] md:rounded-[2rem] mb-8 md:mb-12 max-w-2xl mx-auto border border-black/5 gap-1">
        {(['menu', 'reservas', 'config'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 md:py-4 rounded-[1.2rem] md:rounded-[1.5rem] font-black uppercase italic text-[9px] md:text-[10px] transition-all ${tab === t ? `${tema.bgHeader} ${tema.text} shadow-lg scale-105` : 'text-slate-400'}`}>
            {t === 'menu' ? <Utensils size={14}/> : t === 'reservas' ? <CalendarDays size={14}/> : <Settings size={14}/>}
            {t === 'reservas' ? `${t} (${reservas.length})` : t}
          </button>
        ))}
      </div>

      {tab === 'menu' && (
        <div className="space-y-6 md:space-y-10">
          {/* PROMO CARD RESPONSIVA */}
          <Card className={`rounded-[2rem] md:rounded-[2.5rem] border-none shadow-xl overflow-hidden border-b-4 md:border-b-8 ${tema.bgHeader} ${tema.border.replace('border-', 'border-b-')}`}>
            <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
              <div className="order-2 md:order-1 space-y-3 md:space-y-4">
                <div className={`flex items-center gap-2 ${tema.primary}`}><Megaphone size={20} className="animate-bounce" /><h2 className={`font-black uppercase italic text-xl md:text-2xl ${tema.text}`}>Anuncio del Día</h2></div>
                <Input className="bg-black/5 md:bg-black/10 border-none h-12 md:h-14 rounded-xl md:rounded-2xl font-bold" placeholder="Título" value={promo.titulo} onChange={e => setPromo({...promo, titulo: e.target.value})} />
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1"><DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 ${tema.primary}`} size={18} /><Input className="bg-black/5 md:bg-black/10 border-none h-12 md:h-14 rounded-xl md:rounded-2xl pl-12 font-bold" type="number" value={promo.precio} onChange={e => setPromo({...promo, precio: e.target.value})} /></div>
                  <textarea className="flex-[2] bg-black/5 md:bg-black/10 border-none rounded-xl md:rounded-2xl p-4 text-sm min-h-[50px] outline-none" placeholder="Mensaje..." value={promo.mensaje} onChange={e => setPromo({...promo, mensaje: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button onClick={() => setPromo({...promo, activa: !promo.activa})} className={`h-12 md:h-14 font-black rounded-xl md:rounded-2xl uppercase text-[8px] md:text-[10px] border-2 transition-all ${promo.activa ? `${tema.accent} border-transparent shadow-md` : 'border-slate-300 text-slate-400'}`}>{promo.activa ? "OFERTA ON" : "OFERTA OFF"}</button>
                  <Button onClick={guardarPromo} className={`h-12 md:h-14 font-black uppercase rounded-xl md:rounded-2xl ${tema.accent}`}>Guardar</Button>
                </div>
              </div>
              <label className="order-1 md:order-2 block h-48 md:h-64 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-black/10 overflow-hidden cursor-pointer relative group">
                {promo.imagen ? <img src={promo.imagen} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full opacity-30 font-black text-[9px] md:text-[10px] uppercase"><UploadCloud className="mb-1" size={24} /> Subir Imagen</div>}
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'promo')} />
              </label>
            </div>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10">
            {/* FORMULARIO AGREGAR */}
            <div className="xl:col-span-1">
              <Card className={`rounded-[2rem] md:rounded-[3rem] border-none shadow-xl xl:sticky xl:top-10 overflow-hidden border-t-8 ${tema.bgHeader} ${tema.border.replace('border-', 'border-t-')}`}>
                <div className={`${tema.accent} p-4 md:p-6 text-center font-black uppercase text-[10px] md:text-xs italic text-white flex items-center justify-center gap-2`}><Plus size={16}/> Nuevo Producto</div>
                <CardContent className="p-5 md:p-8 space-y-4">
                  <label className="block h-40 md:h-48 border-2 border-dashed border-black/5 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden cursor-pointer bg-black/5 flex items-center justify-center">
                    {nuevo.imagen ? <img src={nuevo.imagen} className="w-full h-full object-cover" /> : <UploadCloud size={30} className="opacity-20"/>}
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'producto')} />
                  </label>
                  <Input className="rounded-xl h-12 md:h-14 font-bold bg-black/5 border-none" placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input className="rounded-xl h-12 md:h-14 font-bold bg-black/5 border-none" type="number" placeholder="Precio $" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} />
                    <select className="border-none rounded-xl h-12 md:h-14 px-3 text-[9px] md:text-[10px] font-black uppercase bg-black/5 outline-none" value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>{CATEGORIAS_MENU.map(c => <option key={c} value={c} className="bg-slate-800 text-white">{c}</option>)}</select>
                  </div>
                  <textarea className="w-full bg-black/5 border-none rounded-xl p-4 text-sm font-bold min-h-[80px] outline-none" placeholder="Descripción..." value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} />
                  <Button onClick={agregar} className={`w-full h-14 md:h-16 font-black uppercase italic rounded-xl md:rounded-2xl ${tema.accent}`}>Publicar</Button>
                </CardContent>
              </Card>
            </div>

            {/* LISTA DE PRODUCTOS RESPONSIVA */}
            <div className="xl:col-span-2 space-y-3 md:space-y-6">
              {productos.map(p => (
                <div key={p.id} className={`${tema.bgHeader} p-3 md:p-4 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border ${tema.border} flex flex-col sm:flex-row items-center gap-3 md:gap-5 transition-all ${p.disponible === false ? 'opacity-40 grayscale' : ''}`}>
                  <div className="relative w-full sm:w-24 h-40 sm:h-24">
                    <img src={p.imagen} className="w-full h-full rounded-[1.2rem] md:rounded-[1.5rem] object-cover shadow-lg" />
                    {p.disponible === false && <div className="absolute inset-0 bg-black/60 rounded-[1.2rem] flex items-center justify-center"><span className="text-[8px] font-black text-white bg-red-600 px-2 py-1 rounded-full">AGOTADO</span></div>}
                  </div>
                  <div className="flex-1 text-center sm:text-left w-full">
                    <p className="font-black uppercase text-[8px] opacity-40 mb-0.5">{p.categoria}</p>
                    <p className={`font-black uppercase text-base md:text-lg leading-tight mb-1 md:mb-2 ${tema.text}`}>{p.nombre}</p>
                    {editandoId === p.id ? (
                      <div className="flex gap-2 justify-center sm:justify-start">
                        <Input className="h-9 w-24 text-xs font-bold bg-black/10 border-none" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})} />
                        <Button onClick={() => guardarEdicion(p.id)} className="h-9 bg-green-600 text-white px-3 rounded-lg font-black text-[9px]">OK</Button>
                      </div>
                    ) : (
                      <span className={`${tema.primary} font-black italic text-lg md:text-xl`}>${p.precio}</span>
                    )}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-center">
                    <button onClick={() => update(ref(db, `productos/${p.id}`), { disponible: p.disponible === false })} className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${p.disponible === false ? 'bg-orange-500 text-white' : 'bg-black/5 text-slate-400'}`}>{p.disponible === false ? <Check size={18} /> : <Utensils size={18} />}</button>
                    <button onClick={() => { setEditandoId(p.id); setEditForm({ precio: p.precio.toString(), descripcion: p.descripcion || "" }); }} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black/5 text-slate-400 hover:text-blue-500 flex items-center justify-center"><Edit3 size={18}/></button>
                    <button onClick={() => confirm("¿Borrar?") && remove(ref(db, `productos/${p.id}`))} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black/5 text-slate-400 hover:text-red-500 flex items-center justify-center"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'reservas' && (
        <div className="space-y-3 md:space-y-4 max-w-3xl mx-auto">
          {reservas.length === 0 ? <p className="text-center opacity-30 font-black uppercase py-20 text-xs tracking-widest">No hay pedidos</p> : 
            reservas.map(r => (
              <Card key={r.id} className={`rounded-[2rem] md:rounded-[3rem] border-none shadow-lg overflow-hidden ${tema.bgHeader}`}>
                <CardContent className="p-5 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className={`font-black uppercase italic text-sm md:text-base ${tema.text}`}>{r.nombre} {r.apellido}</h3>
                    <p className="text-[10px] md:text-xs opacity-50 font-bold">{r.fecha} • {r.hora}hs • {r.comensales} Pers.</p>
                  </div>
                  <Button onClick={() => remove(ref(db, `reservas/${r.id}`))} variant="destructive" className="w-full sm:w-auto rounded-xl font-black uppercase text-[9px] md:text-[10px] h-10 md:h-12">Finalizar</Button>
                </CardContent>
              </Card>
            ))
          }
        </div>
      )}

      {tab === 'config' && (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* SECCIÓN PAGOS RESPONSIVA */}
            <Card className={`rounded-[2rem] md:rounded-[3rem] border-none shadow-xl p-6 md:p-8 md:col-span-2 ${tema.bgHeader}`}>
              <div className="flex items-center gap-3 md:gap-4 mb-6">
                <div className={`${tema.accent} p-3 rounded-xl text-white`}><CreditCard size={24} /></div>
                <div>
                  <h3 className={`text-lg md:text-xl font-black uppercase italic ${tema.text}`}>Pagos</h3>
                  <p className="text-[9px] font-bold opacity-40 uppercase">Datos para transferencia</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6">
                <div className="space-y-1"><p className="text-[9px] font-black uppercase opacity-40 ml-2">Alias</p><Input className="bg-black/5 border-none font-bold h-11 md:h-12 rounded-xl" placeholder="Alias..." value={datosPago.alias} onChange={e => setDatosPago({...datosPago, alias: e.target.value})} /></div>
                <div className="space-y-1"><p className="text-[9px] font-black uppercase opacity-40 ml-2">CBU</p><Input className="bg-black/5 border-none font-bold h-11 md:h-12 rounded-xl" placeholder="22 dígitos" value={datosPago.cbu} onChange={e => setDatosPago({...datosPago, cbu: e.target.value})} /></div>
                <div className="space-y-1"><p className="text-[9px] font-black uppercase opacity-40 ml-2">Titular</p><Input className="bg-black/5 border-none font-bold h-11 md:h-12 rounded-xl" placeholder="Nombre" value={datosPago.titular} onChange={e => setDatosPago({...datosPago, titular: e.target.value})} /></div>
              </div>
              
              {showConfirm && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-[9px] font-black uppercase text-red-500 mb-2 ml-1">Clave de Seguridad</p>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} /><Input type="password" className="bg-white border-none font-bold h-11 rounded-xl pl-11" placeholder="ADMIN PASS" value={passConfirm} onChange={e => setPassConfirm(e.target.value)} /></div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                {showConfirm && <Button onClick={() => { setShowConfirm(false); setPassConfirm(""); }} variant="outline" className="h-11 md:h-12 rounded-xl font-black uppercase italic">Cancelar</Button>}
                <Button onClick={guardarPagos} className={`flex-1 h-11 md:h-12 rounded-xl font-black uppercase italic ${showConfirm ? 'bg-red-600' : tema.accent}`}>{showConfirm ? "Confirmar" : "Guardar Datos"}</Button>
              </div>
            </Card>

            {/* ESTADO LOCAL - GRID ADAPTATIVO */}
            <Card className={`rounded-[2rem] md:rounded-[3rem] border-none shadow-xl p-6 md:p-8 md:col-span-2 ${tema.bgHeader}`}>
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${estadoLocal.manualAbierto ? 'bg-green-500' : 'bg-red-500'} text-white`}><Power size={24} /></div>
                  <h3 className={`text-lg md:text-xl font-black uppercase italic ${tema.text}`}>Estado</h3>
                </div>
                <button onClick={() => { const n = { ...estadoLocal, manualAbierto: !estadoLocal.manualAbierto }; setEstadoLocal(n); guardarEstadoLocal(n); }} className={`w-full sm:w-auto h-12 px-6 rounded-xl font-black uppercase italic text-[10px] ${estadoLocal.manualAbierto ? 'bg-green-500/10 text-green-500 border-2 border-green-500' : 'bg-red-500 text-white'}`}>{estadoLocal.manualAbierto ? "ABIERTO" : "CERRADO"}</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia} className="bg-black/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-black/5">
                    <p className={`text-[9px] md:text-[10px] font-black uppercase mb-2 ${tema.primary}`}>{dia}</p>
                    <div className="space-y-1.5 text-[8px] md:text-[9px] font-bold opacity-60">
                      <div className="flex justify-between"><span>ABRE:</span><input type="time" className="bg-transparent outline-none w-12" value={(estadoLocal.horarios as any)[dia]?.inicio || "20:00"} onChange={(e) => setEstadoLocal({ ...estadoLocal, horarios: { ...estadoLocal.horarios, [dia]: { ...(estadoLocal.horarios as any)[dia], inicio: e.target.value } } })} /></div>
                      <div className="flex justify-between"><span>CIERRA:</span><input type="time" className="bg-transparent outline-none w-12" value={(estadoLocal.horarios as any)[dia]?.fin || "00:00"} onChange={(e) => setEstadoLocal({ ...estadoLocal, horarios: { ...estadoLocal.horarios, [dia]: { ...(estadoLocal.horarios as any)[dia], fin: e.target.value } } })} /></div>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => guardarEstadoLocal(estadoLocal)} className={`mt-6 w-full h-11 md:h-12 rounded-xl font-black uppercase italic ${tema.accent}`}>Guardar Horarios</Button>
            </Card>

            {/* PERFIL */}
            <Card className={`rounded-[2rem] md:rounded-[3rem] border-none shadow-xl p-6 md:p-8 ${tema.bgHeader}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 md:mb-6 shadow-xl ${tema.accent} text-white`}><Store size={24} /></div>
              <h3 className={`text-lg md:text-xl font-black uppercase italic mb-5 ${tema.text}`}>Perfil</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden cursor-pointer bg-black/5 border-2 border-dashed border-black/10 flex items-center justify-center">{perfilEdit.logoUrl ? <img src={perfilEdit.logoUrl} className="w-full h-full object-cover" /> : <UploadCloud size={20} className="opacity-20" />}<input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} /></label>
                  <div className="flex-1"><p className="text-[9px] font-black uppercase opacity-40 mb-1">Nombre</p><Input className="bg-black/5 border-none font-bold h-11 rounded-xl uppercase text-xs" value={perfilEdit.nombreLocal} onChange={e => setPerfilEdit({...perfilEdit, nombreLocal: e.target.value.toUpperCase()})} /></div>
                </div>
                <Button onClick={guardarPerfil} className={`w-full h-11 rounded-xl font-black uppercase italic ${tema.accent}`}>Actualizar</Button>
              </div>
            </Card>

            {/* TEMAS */}
            <Card className={`rounded-[2rem] md:rounded-[3rem] border-none shadow-xl p-6 md:p-8 ${tema.bgHeader}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 md:mb-6 shadow-xl ${tema.accent} text-white`}><Palette size={24} /></div>
              <h3 className={`text-lg md:text-xl font-black uppercase italic mb-5 ${tema.text}`}>Estilo</h3>
              <div className="grid grid-cols-3 gap-3">
                {['naranja', 'oscuro', 'verde'].map(t => (
                  <div key={t} onClick={() => cambiarTema(t)} className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${temaActivo === t ? 'scale-110' : 'opacity-40'}`}>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border-4 border-white shadow-md flex items-center justify-center ${t === 'naranja' ? 'bg-orange-600' : t === 'oscuro' ? 'bg-zinc-900' : 'bg-emerald-600'}`}>{temaActivo === t && <Check className="text-white" size={14} />}</div>
                    <span className={`text-[7px] md:text-[8px] font-black uppercase ${tema.text}`}>{t}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Link to="/admin/qrs" className="md:col-span-2 group">
              <Card className={`rounded-[2rem] p-5 md:p-6 flex items-center justify-between ${tema.bgHeader} hover:ring-2 ring-current transition-all border-none shadow-lg`}>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`${tema.accent} p-3 rounded-xl text-white`}><QrCode size={22} /></div>
                  <div><h3 className={`font-black uppercase italic text-sm md:text-base ${tema.text}`}>QR & Mesas</h3><p className="text-[9px] font-bold opacity-40 uppercase">Descargar códigos</p></div>
                </div>
                <ChevronRight className="opacity-20" size={20} />
              </Card>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
