import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plus, Trash2, UploadCloud, Edit3, Megaphone, 
  DollarSign, CalendarDays, Settings, Palette, 
  LogOut, LayoutDashboard, ExternalLink, ChevronRight, Check, Utensils, QrCode, Store, Power, BellRing, CreditCard, Lock, X
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

  // --- LÓGICA DE FIREBASE E INICIALIZACIÓN ---
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
        audioRef.current?.play().catch(() => console.log("Audio bloqueado por navegador"));

        toast.custom((t) => (
          <div className={`${tema.bgHeader} border-2 ${tema.border} p-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full w-[90vw] max-w-sm`}>
            <div className={`${tema.accent} p-2 rounded-full animate-bounce text-white`}><BellRing size={16} /></div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] font-black uppercase opacity-50 ${tema.text}`}>¡Nuevo Pedido!</p>
              <p className={`text-sm font-bold truncate ${tema.primary}`}>{nuevoPedido.nombre} {nuevoPedido.apellido}</p>
            </div>
            <button onClick={() => { toast.dismiss(t); cerrarAlerta(); }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${tema.accent} text-white`}>Ver</button>
          </div>
        ), { duration: Infinity });
      }
    });

    return () => { unsubscribe(); audioRef.current?.pause(); };
  }, [tema])

  // --- FUNCIONES DE CONTROL ---
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
        toast.success("Datos bancarios actualizados"); 
        setShowConfirm(false); setPassConfirm("");
      } catch (e) { toast.error("Error al guardar"); } 
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
    if (!nuevo.nombre || !nuevo.precio || !nuevo.imagen) return toast.error("Faltan datos obligatorios");
    await push(ref(db, 'productos'), { ...nuevo, precio: Number(nuevo.precio), disponible: true, createdAt: Date.now() });
    setNuevo({ nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" });
    toast.success("¡Producto publicado!");
  }

  const guardarEdicion = async (id: string) => {
    await update(ref(db, `productos/${id}`), { precio: Number(editForm.precio), descripcion: editForm.descripcion });
    setEditandoId(null);
    toast.success("Actualizado");
  }

  return (
    <div className={`min-h-screen p-3 md:p-8 max-w-7xl mx-auto pb-28 transition-colors duration-500 ${tema.bgPage}`}>
      
      {/* --- MODAL ALERTA NUEVO PEDIDO --- */}
      {showPedidoModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in">
          <Card className={`${tema.bgHeader} w-full max-w-sm rounded-[3rem] shadow-2xl border-4 ${tema.border} overflow-hidden scale-in-center`}>
            <div className={`${tema.accent} p-10 flex flex-col items-center justify-center relative`}>
              <button onClick={cerrarAlerta} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={24}/></button>
              <BellRing className="text-white animate-bounce mb-4 w-16 h-16" />
              <h2 className="text-3xl font-black uppercase italic text-white text-center">¡NUEVA ORDEN!</h2>
            </div>
            <div className="p-8 text-center space-y-6">
              <h3 className={`text-2xl font-black uppercase italic truncate ${tema.primary}`}>{ultimoPedido?.nombre} {ultimoPedido?.apellido}</h3>
              <div className="flex justify-center gap-8 bg-black/5 p-6 rounded-3xl">
                <div><p className="text-[10px] font-black opacity-40 uppercase">Comensales</p><p className={`text-2xl font-black ${tema.text}`}>{ultimoPedido?.comensales}</p></div>
                <div className="w-px bg-black/10" />
                <div><p className="text-[10px] font-black opacity-40 uppercase">Hora</p><p className={`text-2xl font-black ${tema.text}`}>{ultimoPedido?.hora}hs</p></div>
              </div>
              <Button onClick={cerrarAlerta} className={`w-full h-16 rounded-2xl font-black uppercase italic text-xl shadow-xl ${tema.accent}`}>
                <Check className="mr-2 w-6 h-6" /> ATENDER
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* --- CABECERA --- */}
      <header className={`mb-8 ${tema.bgHeader} p-6 rounded-[2.5rem] shadow-sm border ${tema.border} flex flex-col md:flex-row justify-between items-center gap-6`}>
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
            <LayoutDashboard size={14} /> <span>Admin</span> <ChevronRight size={14} /> <span className={tema.primary}>{tab}</span>
          </div>
          <h1 className={`text-2xl md:text-3xl font-black uppercase italic tracking-tighter ${tema.text}`}>
            {perfilEdit.nombreLocal} <span className="opacity-30">Control</span>
          </h1>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => window.open('/', '_blank')} className={`flex-1 md:flex-none rounded-2xl font-black uppercase italic text-[10px] h-12 bg-transparent ${tema.border} ${tema.text}`}>
            <ExternalLink size={16} className="mr-2" /> Web
          </Button>
          <Button onClick={() => window.location.href = "/"} className="flex-1 md:flex-none bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black uppercase italic text-[10px] h-12 border-none">
            <LogOut size={16} className="mr-2" /> Salir
          </Button>
        </div>
      </header>

      {/* --- NAVEGACIÓN TABS --- */}
      <nav className="flex overflow-x-auto no-scrollbar bg-black/5 p-2 rounded-[2rem] mb-10 max-w-xl mx-auto border border-black/5">
        {(['menu', 'reservas', 'config'] as const).map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black uppercase italic text-[10px] transition-all ${tab === t ? `${tema.bgHeader} ${tema.text} shadow-xl scale-105` : 'text-slate-400 opacity-60'}`}
          >
            {t === 'menu' ? <Utensils size={16}/> : t === 'reservas' ? <CalendarDays size={16}/> : <Settings size={16}/>}
            {t === 'reservas' && reservas.length > 0 ? `${t} (${reservas.length})` : t}
          </button>
        ))}
      </nav>

      {/* --- SECCIÓN: MENÚ --- */}
      {tab === 'menu' && (
        <div className="space-y-8">
          {/* PROMO CARD */}
          <Card className={`rounded-[2.5rem] border-none shadow-2xl overflow-hidden border-b-8 ${tema.bgHeader} ${tema.border.replace('border-', 'border-b-')}`}>
            <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 space-y-4">
                <div className={`flex items-center gap-3 ${tema.primary}`}><Megaphone size={24} className="animate-bounce" /><h2 className={`font-black uppercase italic text-2xl ${tema.text}`}>Promo del Día</h2></div>
                <Input className="bg-black/5 border-none h-14 rounded-2xl font-bold text-lg" placeholder="Título de la oferta..." value={promo.titulo} onChange={e => setPromo({...promo, titulo: e.target.value})} />
                <div className="flex gap-3">
                  <div className="relative w-1/3"><DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 ${tema.primary}`} size={18} /><Input className="bg-black/5 border-none h-14 rounded-2xl pl-10 font-black text-xl" type="number" value={promo.precio} onChange={e => setPromo({...promo, precio: e.target.value})} /></div>
                  <textarea className="flex-1 bg-black/5 border-none rounded-2xl p-4 text-sm font-bold h-14 resize-none outline-none" placeholder="Mensaje corto..." value={promo.mensaje} onChange={e => setPromo({...promo, mensaje: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPromo({...promo, activa: !promo.activa})} className={`h-14 font-black rounded-2xl uppercase text-[10px] border-2 transition-all ${promo.activa ? `${tema.accent} border-transparent shadow-lg text-white` : 'border-slate-200 text-slate-300'}`}>
                    {promo.activa ? "OFERTA ACTIVA" : "OFERTA DESACTIVADA"}
                  </button>
                  <Button onClick={guardarPromo} className={`h-14 font-black uppercase rounded-2xl shadow-xl ${tema.accent}`}>Actualizar Promo</Button>
                </div>
              </div>
              <label className="order-1 md:order-2 block h-60 rounded-[2rem] border-4 border-dashed border-black/5 overflow-hidden cursor-pointer relative group transition-all hover:border-orange-500/20">
                {promo.imagen ? <img src={promo.imagen} className="w-full h-full object-cover" alt="Promo" /> : <div className="flex flex-col items-center justify-center h-full opacity-20 font-black text-[10px] uppercase"><UploadCloud className="mb-2" size={32} /> Subir Imagen</div>}
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'promo')} />
              </label>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* FORMULARIO AGREGAR PRODUCTO */}
            <div className="lg:col-span-1">
              <Card className={`rounded-[3rem] border-none shadow-2xl sticky top-8 overflow-hidden border-t-8 ${tema.bgHeader} ${tema.border.replace('border-', 'border-t-')}`}>
                <div className={`${tema.accent} py-4 text-center font-black uppercase text-xs italic text-white`}>Añadir al Menú</div>
                <CardContent className="p-8 space-y-4">
                  <label className="block h-44 border-2 border-dashed border-black/5 rounded-[2rem] overflow-hidden cursor-pointer bg-black/5 flex items-center justify-center group">
                    {nuevo.imagen ? <img src={nuevo.imagen} className="w-full h-full object-cover" /> : <UploadCloud size={30} className="opacity-10 group-hover:opacity-30 transition-all"/>}
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'producto')} />
                  </label>
                  <Input className="rounded-2xl h-14 font-bold bg-black/5 border-none" placeholder="Nombre del plato" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input className="rounded-2xl h-14 font-black bg-black/5 border-none" type="number" placeholder="Precio $" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} />
                    <select className="border-none rounded-2xl h-14 px-4 text-[10px] font-black uppercase bg-black/5 outline-none cursor-pointer" value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                      {CATEGORIAS_MENU.map(c => <option key={c} value={c} className="bg-slate-800 text-white">{c}</option>)}
                    </select>
                  </div>
                  <textarea className="w-full bg-black/5 border-none rounded-2xl p-4 text-sm font-bold min-h-[100px] outline-none" placeholder="Descripción opcional..." value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} />
                  <Button onClick={agregar} className={`w-full h-16 font-black uppercase italic rounded-2xl shadow-xl ${tema.accent}`}>Publicar Producto</Button>
                </CardContent>
              </Card>
            </div>

            {/* LISTA DE PRODUCTOS */}
            <div className="lg:col-span-2 space-y-4">
              {productos.map(p => (
                <div key={p.id} className={`${tema.bgHeader} p-4 rounded-[2.5rem] shadow-sm border ${tema.border} flex flex-col sm:flex-row items-center gap-5 transition-all group hover:shadow-xl ${p.disponible === false ? 'opacity-50 grayscale' : ''}`}>
                  <div className="relative w-full sm:w-28 h-40 sm:h-28 shrink-0">
                    <img src={p.imagen} className="w-full h-full rounded-3xl object-cover shadow-md" alt={p.nombre} />
                    {p.disponible === false && <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center"><span className="text-[10px] font-black text-white bg-red-600 px-3 py-1 rounded-full shadow-lg">AGOTADO</span></div>}
                  </div>
                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <p className="font-black uppercase text-[9px] opacity-30 mb-0.5 tracking-widest">{p.categoria}</p>
                    <p className={`font-black uppercase text-xl leading-tight mb-2 truncate ${tema.text}`}>{p.nombre}</p>
                    {editandoId === p.id ? (
                      <div className="flex gap-2 justify-center sm:justify-start">
                        <Input className="h-10 w-28 font-black text-lg bg-black/10 border-none" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})} />
                        <Button onClick={() => guardarEdicion(p.id)} className="h-10 bg-green-600 text-white px-5 rounded-xl font-black">OK</Button>
                      </div>
                    ) : (
                      <span className={`${tema.primary} font-black italic text-2xl`}>${p.precio.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => update(ref(db, `productos/${p.id}`), { disponible: p.disponible === false })} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${p.disponible === false ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-black/5 text-slate-400 hover:bg-slate-200'}`} title="Disponibilidad">
                      {p.disponible === false ? <Check size={20} strokeWidth={3} /> : <Utensils size={20} />}
                    </button>
                    <button onClick={() => { setEditandoId(p.id); setEditForm({ precio: p.precio.toString(), descripcion: p.descripcion || "" }); }} className="w-12 h-12 rounded-2xl bg-black/5 text-slate-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all shadow-sm"><Edit3 size={20}/></button>
                    <button onClick={() => confirm("¿Seguro de eliminar?") && remove(ref(db, `productos/${p.id}`))} className="w-12 h-12 rounded-2xl bg-black/5 text-slate-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"><Trash2 size={20}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SECCIÓN: RESERVAS/PEDIDOS --- */}
      {tab === 'reservas' && (
        <div className="space-y-4 max-w-2xl mx-auto animate-in slide-in-from-bottom-4">
          {reservas.length === 0 ? (
            <div className="text-center py-32 opacity-20"><Utensils size={64} className="mx-auto mb-4" /><p className="font-black uppercase italic">Sin órdenes pendientes</p></div>
          ) : (
            reservas.map(r => (
              <Card key={r.id} className={`rounded-[2.5rem] border-none shadow-xl overflow-hidden ${tema.bgHeader} border-l-8 ${tema.border.replace('border-', 'border-l-')}`}>
                <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left space-y-1">
                    <h3 className={`font-black uppercase italic text-lg leading-none ${tema.text}`}>{r.nombre} {r.apellido}</h3>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs font-bold opacity-60 italic">
                      <span>{r.fecha}</span><span>{r.hora}HS</span><span>{r.comensales} PERSONAS</span>
                    </div>
                  </div>
                  <Button onClick={() => remove(ref(db, `reservas/${r.id}`))} className="w-full sm:w-auto h-12 px-8 rounded-2xl font-black uppercase italic text-[10px] bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100">FINALIZAR</Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* --- SECCIÓN: CONFIGURACIÓN --- */}
      {tab === 'config' && (
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* PAGOS */}
          <Card className={`rounded-[3rem] border-none shadow-2xl p-8 ${tema.bgHeader}`}>
            <div className="flex items-center gap-4 mb-8">
              <div className={`${tema.accent} p-4 rounded-2xl text-white shadow-lg`}><CreditCard size={28} /></div>
              <div><h3 className={`text-2xl font-black uppercase italic ${tema.text}`}>Pagos Digitales</h3><p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Configuración de Transferencia</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="space-y-2"><p className="text-[10px] font-black uppercase opacity-40 ml-2">Alias Bancario</p><Input className="bg-black/5 border-none font-bold h-14 rounded-2xl px-6" placeholder="AL.IAS.RESTO" value={datosPago.alias} onChange={e => setDatosPago({...datosPago, alias: e.target.value})} /></div>
              <div className="space-y-2"><p className="text-[10px] font-black uppercase opacity-40 ml-2">CBU / CVU</p><Input className="bg-black/5 border-none font-bold h-14 rounded-2xl px-6 text-sm" placeholder="22 dígitos..." value={datosPago.cbu} onChange={e => setDatosPago({...datosPago, cbu: e.target.value})} /></div>
              <div className="space-y-2"><p className="text-[10px] font-black uppercase opacity-40 ml-2">Titular de Cuenta</p><Input className="bg-black/5 border-none font-bold h-14 rounded-2xl px-6" placeholder="Nombre completo" value={datosPago.titular} onChange={e => setDatosPago({...datosPago, titular: e.target.value})} /></div>
            </div>
            
            {showConfirm && (
              <div className="mb-6 p-6 bg-red-500/5 border-2 border-red-500/10 rounded-3xl animate-in zoom-in">
                <p className="text-[10px] font-black uppercase text-red-500 mb-3 text-center tracking-widest">Seguridad Requerida</p>
                <div className="relative max-w-xs mx-auto"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} /><Input type="password" title="Pass" className="bg-white border-none font-black h-14 rounded-2xl pl-12 text-center tracking-[0.5em]" placeholder="••••" value={passConfirm} onChange={e => setPassConfirm(e.target.value)} /></div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              {showConfirm && <Button onClick={() => { setShowConfirm(false); setPassConfirm(""); }} variant="outline" className="h-14 rounded-2xl font-black uppercase italic flex-1 border-2">Cancelar</Button>}
              <Button onClick={guardarPagos} className={`flex-[2] h-14 rounded-2xl font-black uppercase italic shadow-xl ${showConfirm ? 'bg-red-600' : tema.accent}`}>{showConfirm ? "Confirmar Cambio" : "Guardar Datos de Pago"}</Button>
            </div>
          </Card>

          {/* ESTADO Y HORARIOS */}
          <Card className={`rounded-[3rem] border-none shadow-2xl p-8 ${tema.bgHeader}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-6 text-center sm:text-left">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-700 ${estadoLocal.manualAbierto ? 'bg-green-500 shadow-green-200' : 'bg-red-500 shadow-red-200'} text-white`}><Power size={32} /></div>
                <div><h3 className={`text-2xl font-black uppercase italic ${tema.text}`}>Estado del Local</h3><p className="text-[10px] font-bold opacity-30 uppercase">Control de apertura manual</p></div>
              </div>
              <button 
                onClick={() => { const n = { ...estadoLocal, manualAbierto: !estadoLocal.manualAbierto }; setEstadoLocal(n); guardarEstadoLocal(n); }} 
                className={`h-16 px-10 rounded-2xl font-black uppercase italic tracking-widest transition-all ${estadoLocal.manualAbierto ? 'bg-green-500/10 text-green-600 border-4 border-green-500' : 'bg-red-500 text-white shadow-xl shadow-red-200 ring-4 ring-red-100'}`}
              >
                {estadoLocal.manualAbierto ? "LOCAL ABIERTO" : "LOCAL CERRADO"}
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {DIAS_SEMANA.map((dia) => (
                <div key={dia} className="bg-black/5 p-4 rounded-2xl border border-black/5 flex flex-col items-center">
                  <p className={`text-[10px] font-black uppercase mb-3 ${tema.primary}`}>{dia.substring(0,3)}</p>
                  <div className="space-y-3 w-full text-[9px] font-black opacity-60">
                    <div className="text-center"><span className="block opacity-40 mb-1 uppercase">Abre</span><input type="time" title="Apertura" className="bg-white/50 w-full rounded-lg p-1 text-center outline-none" value={(estadoLocal.horarios as any)[dia]?.inicio || "20:00"} onChange={(e) => setEstadoLocal({ ...estadoLocal, horarios: { ...estadoLocal.horarios, [dia]: { ...(estadoLocal.horarios as any)[dia], inicio: e.target.value } } })} /></div>
                    <div className="text-center"><span className="block opacity-40 mb-1 uppercase">Cierra</span><input type="time" title="Cierre" className="bg-white/50 w-full rounded-lg p-1 text-center outline-none" value={(estadoLocal.horarios as any)[dia]?.fin || "00:00"} onChange={(e) => setEstadoLocal({ ...estadoLocal, horarios: { ...estadoLocal.horarios, [dia]: { ...(estadoLocal.horarios as any)[dia], fin: e.target.value } } })} /></div>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => guardarEstadoLocal(estadoLocal)} className={`mt-8 w-full h-14 rounded-2xl font-black uppercase italic shadow-lg ${tema.accent}`}>Actualizar Horarios de la Semana</Button>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PERFIL LOCAL */}
            <Card className={`rounded-[3rem] border-none shadow-xl p-8 ${tema.bgHeader}`}>
              <h3 className={`text-xl font-black uppercase italic mb-6 flex items-center gap-3 ${tema.text}`}><Store className={tema.primary} /> Identidad</h3>
              <div className="flex items-center gap-4 bg-black/5 p-4 rounded-[2rem]">
                <label className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden cursor-pointer bg-white border-2 border-dashed border-black/10 flex items-center justify-center hover:border-orange-500 transition-colors">
                  {perfilEdit.logoUrl ? <img src={perfilEdit.logoUrl} className="w-full h-full object-cover" alt="Logo" /> : <UploadCloud size={24} className="opacity-20" />}
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
                </label>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase opacity-40 mb-1 ml-2">Nombre Comercial</p>
                  <Input className="bg-white border-none font-black h-12 rounded-xl uppercase px-4" value={perfilEdit.nombreLocal} onChange={e => setPerfilEdit({...perfilEdit, nombreLocal: e.target.value.toUpperCase()})} />
                </div>
              </div>
              <Button onClick={guardarPerfil} className={`w-full mt-4 h-14 rounded-2xl font-black uppercase italic ${tema.accent}`}>Guardar Perfil</Button>
            </Card>

            {/* ESTILO VISUAL */}
            <Card className={`rounded-[3rem] border-none shadow-xl p-8 ${tema.bgHeader}`}>
              <h3 className={`text-xl font-black uppercase italic mb-6 flex items-center gap-3 ${tema.text}`}><Palette className={tema.primary} /> Apariencia</h3>
              <div className="grid grid-cols-3 gap-4">
                {['naranja', 'oscuro', 'verde'].map(t => (
                  <button key={t} onClick={() => cambiarTema(t)} className={`flex flex-col items-center gap-3 transition-all hover:scale-110 ${temaActivo === t ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-14 h-14 rounded-2xl border-4 shadow-lg flex items-center justify-center ${t === 'naranja' ? 'bg-orange-600 border-orange-100' : t === 'oscuro' ? 'bg-zinc-900 border-zinc-700' : 'bg-emerald-600 border-emerald-100'}`}>
                      {temaActivo === t && <Check className="text-white" size={20} strokeWidth={4} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase ${tema.text}`}>{t}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* ACCESO RÁPIDO QR */}
          <Link to="/admin/qrs" className="block group">
            <Card className={`rounded-[2.5rem] p-8 flex items-center justify-between ${tema.bgHeader} group-hover:ring-4 ring-orange-500/20 transition-all border-none shadow-2xl`}>
              <div className="flex items-center gap-6">
                <div className={`${tema.accent} p-4 rounded-2xl text-white shadow-lg shadow-orange-100`}><QrCode size={32} /></div>
                <div><h3 className={`font-black uppercase italic text-2xl ${tema.text}`}>Códigos QR & Mesas</h3><p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">Administrar puntos de venta físicos</p></div>
              </div>
              <div className="bg-black/5 p-4 rounded-full group-hover:translate-x-2 transition-transform"><ChevronRight className={tema.primary} size={32} /></div>
            </Card>
          </Link>
        </div>
      )}
    </div>
  )
}
