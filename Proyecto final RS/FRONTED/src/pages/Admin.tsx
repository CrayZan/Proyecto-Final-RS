import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plus, Trash2, UploadCloud, Edit3, Save, Megaphone, 
  DollarSign, CalendarDays, Settings, Palette, 
  LogOut, LayoutDashboard, ExternalLink, ChevronRight, Check, Utensils, QrCode, Store, Clock, Power, BellRing, Volume2, CreditCard
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

  // ESTADO PARA DATOS DE PAGO
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
        
        audioRef.current?.play().catch(() => {
          console.log("Audio bloqueado por el navegador");
        });

        toast.custom((t) => (
          <div className={`${tema.bgHeader} border-2 ${tema.border} p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full`}>
            <div className={`${tema.accent} p-3 rounded-full animate-bounce text-white`}>
              <BellRing size={20} />
            </div>
            <div className="flex-1">
              <p className={`text-[10px] font-black uppercase opacity-50 ${tema.text}`}>¡Nuevo Pedido!</p>
              <p className={`text-sm font-bold ${tema.primary}`}>{nuevoPedido.nombre} {nuevoPedido.apellido}</p>
            </div>
            <button 
              onClick={() => { toast.dismiss(t); cerrarAlerta(); }}
              className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase ${tema.accent} text-white`}
            >
              Ver
            </button>
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

  // Funciones de Guardado
  const guardarPagos = async () => { try { await set(ref(db, 'config/pagos'), datosPago); toast.success("Datos de pago guardados"); } catch (e) { toast.error("Error"); } }
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
    <div className={`p-4 md:p-8 max-w-7xl mx-auto mb-20 animate-in fade-in duration-500 ${tema.bgPage}`}>
      
      {/* MODAL DE NUEVO PEDIDO */}
      {showPedidoModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
          <div className={`${tema.bgHeader} w-full max-w-md rounded-[3.5rem] shadow-2xl border-4 ${tema.border} overflow-hidden animate-in zoom-in-95`}>
            <div className={`${tema.accent} p-10 flex flex-col items-center justify-center relative overflow-hidden`}>
              <BellRing size={80} className="relative z-10 text-white animate-bounce mb-4" />
              <h2 className="relative z-10 text-4xl font-black uppercase italic text-white">¡NUEVA ORDEN!</h2>
            </div>
            <div className="p-10 text-center space-y-6">
              <h3 className={`text-3xl font-black uppercase italic ${tema.primary}`}>{ultimoPedido?.nombre} {ultimoPedido?.apellido}</h3>
              <div className="grid grid-cols-2 gap-4 bg-black/5 p-6 rounded-3xl">
                <div className="text-center border-r border-black/10">
                  <p className="text-[10px] font-black opacity-40">PERSONAS</p>
                  <p className={`text-xl font-black ${tema.text}`}>{ultimoPedido?.comensales}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black opacity-40">HORA</p>
                  <p className={`text-xl font-black ${tema.text}`}>{ultimoPedido?.hora}hs</p>
                </div>
              </div>
              <Button onClick={cerrarAlerta} className={`w-full h-20 rounded-[2rem] font-black uppercase italic text-xl ${tema.accent}`}>
                <Check size={28} className="mr-2" /> ATENDER AHORA
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CABECERA */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 ${tema.bgHeader} p-6 rounded-[2.5rem] shadow-sm border ${tema.border}`}>
        <div>
          <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
            <LayoutDashboard size={12} /> <span>Panel</span> <ChevronRight size={12} /> <span className={tema.primary}>{tab.toUpperCase()}</span>
          </div>
          <h1 className={`text-3xl font-black uppercase italic tracking-tighter ${tema.text}`}>Gestión <span className={tema.primary}>{perfilEdit.nombreLocal}</span></h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={() => window.open('/', '_blank')} className={`flex-1 md:flex-none rounded-2xl font-black uppercase italic text-[10px] ${tema.border} ${tema.text} h-12 bg-transparent`}><ExternalLink size={14} className="mr-2" /> Ver Web</Button>
          <Button onClick={() => window.location.href = "/"} className="flex-1 md:flex-none bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black uppercase italic text-[10px] h-12 border-none"><LogOut size={14} className="mr-2" /> Salir</Button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-black/5 p-2 rounded-[2rem] mb-12 max-w-2xl mx-auto border border-black/5">
        {(['menu', 'reservas', 'config'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black uppercase italic text-[10px] transition-all ${tab === t ? `${tema.bgHeader} ${tema.text} shadow-xl scale-105` : 'text-slate-400'}`}>
            {t === 'menu' ? <Utensils size={14}/> : t === 'reservas' ? <CalendarDays size={14}/> : <Settings size={14}/>}
            {t === 'reservas' ? `${t} (${reservas.length})` : t}
          </button>
        ))}
      </div>

      {tab === 'menu' && (
        <div className="space-y-10 animate-in slide-in-from-left-4">
          <Card className={`rounded-[2.5rem] border-none shadow-2xl overflow-hidden border-b-8 ${tema.bgHeader} ${tema.border.replace('border-', 'border-b-')}`}>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className={`flex items-center gap-2 ${tema.primary}`}><Megaphone size={24} className="animate-bounce" /><h2 className={`font-black uppercase italic text-2xl ${tema.text}`}>Anuncio del Día</h2></div>
                <Input className="bg-black/10 border-none h-14 rounded-2xl font-bold" placeholder="Título" value={promo.titulo} onChange={e => setPromo({...promo, titulo: e.target.value})} />
                <div className="flex gap-3">
                  <div className="relative flex-1"><DollarSign className={`absolute left-4 top-4 ${tema.primary}`} size={18} /><Input className="bg-black/10 border-none h-14 rounded-2xl pl-12 font-bold" type="number" value={promo.precio} onChange={e => setPromo({...promo, precio: e.target.value})} /></div>
                  <textarea className="flex-[2] bg-black/10 border-none rounded-2xl p-4 text-sm min-h-[56px] outline-none" placeholder="Mensaje..." value={promo.mensaje} onChange={e => setPromo({...promo, mensaje: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setPromo({...promo, activa: !promo.activa})} className={`h-14 flex-1 font-black rounded-2xl uppercase text-[10px] border-2 ${promo.activa ? `${tema.accent} border-transparent shadow-lg` : 'border-slate-700 text-slate-500'}`}>{promo.activa ? "OFERTA ACTIVADA" : "OFERTA PAUSADA"}</button>
                  <Button onClick={guardarPromo} className={`flex-1 h-14 font-black uppercase rounded-2xl ${tema.accent}`}>Guardar Promo</Button>
                </div>
              </div>
              <label className="block h-64 rounded-[2rem] border-2 border-dashed border-black/10 overflow-hidden cursor-pointer relative group">
                {promo.imagen ? <img src={promo.imagen} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="flex flex-col items-center justify-center h-full opacity-30 font-black text-[10px] uppercase"><UploadCloud className="mb-2" size={32} /> Subir Foto</div>}
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'promo')} />
              </label>
            </div>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <div className="xl:col-span-1">
              <Card className={`rounded-[3rem] border-none shadow-2xl sticky top-10 overflow-hidden border-t-8 ${tema.bgHeader} ${tema.border.replace('border-', 'border-t-')}`}>
                <div className={`${tema.accent} p-6 text-center font-black uppercase text-xs italic text-white flex items-center justify-center gap-2`}><Plus size={16}/> Nuevo Producto</div>
                <CardContent className="p-8 space-y-4">
                  <label className="block h-48 border-2 border-dashed border-black/5 rounded-[2rem] overflow-hidden cursor-pointer bg-black/5 flex items-center justify-center">
                    {nuevo.imagen ? <img src={nuevo.imagen} className="w-full h-full object-cover" /> : <UploadCloud size={30} className="opacity-20"/>}
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'producto')} />
                  </label>
                  <Input className="rounded-2xl h-14 font-bold bg-black/5 border-none" placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input className="rounded-2xl h-14 font-bold bg-black/5 border-none" type="number" placeholder="Precio $" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} />
                    <select className="border-none rounded-2xl h-14 px-4 text-[10px] font-black uppercase bg-black/5 outline-none" value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>{CATEGORIAS_MENU.map(c => <option key={c} value={c} className="bg-slate-800 text-white">{c}</option>)}</select>
                  </div>
                  <textarea className="w-full bg-black/5 border-none rounded-2xl p-4 text-sm font-bold min-h-[100px] outline-none" placeholder="Descripción..." value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} />
                  <Button onClick={agregar} className={`w-full h-16 font-black uppercase italic rounded-2xl ${tema.accent}`}>Publicar Ahora</Button>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-2 space-y-6">
              {productos.map(p => (
                <div key={p.id} className={`${tema.bgHeader} p-4 rounded-[2.5rem] shadow-sm border ${tema.border} flex items-center gap-5 transition-all hover:shadow-xl ${p.disponible === false ? 'opacity-40 grayscale' : ''}`}>
                  <div className="relative"><img src={p.imagen} className="w-24 h-24 rounded-[1.5rem] object-cover shadow-lg" />{p.disponible === false && <div className="absolute inset-0 bg-black/60 rounded-[1.5rem] flex items-center justify-center"><span className="text-[8px] font-black text-white bg-red-600 px-2 py-1 rounded-full">AGOTADO</span></div>}</div>
                  <div className="flex-1">
                    <p className="font-black uppercase text-[9px] opacity-40 mb-1">{p.categoria}</p>
                    <p className={`font-black uppercase text-lg leading-none mb-2 ${tema.text}`}>{p.nombre}</p>
                    {editandoId === p.id ? (<div className="flex gap-2"><Input className="h-10 text-xs font-bold bg-black/10 border-none" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})} /><Button onClick={() => guardarEdicion(p.id)} className="h-10 bg-green-600 text-white px-4 rounded-xl font-black text-[10px]">OK</Button></div>) : (<span className={`${tema.primary} font-black italic text-xl`}>${p.precio}</span>)}
                  </div>
                  <div className="flex gap-2 pr-4">
                    <button onClick={() => update(ref(db, `productos/${p.id}`), { disponible: p.disponible === false })} className={`w-12 h-12 rounded-2xl flex items-center justify-center ${p.disponible === false ? 'bg-orange-500 text-white shadow-lg' : 'bg-black/5 text-slate-400 hover:bg-black/10'}`}>{p.disponible === false ? <Check size={18} /> : <Utensils size={18} />}</button>
                    <button onClick={() => { setEditandoId(p.id); setEditForm({ precio: p.precio.toString(), descripcion: p.descripcion || "" }); }} className="w-12 h-12 rounded-2xl bg-black/5 text-slate-400 hover:text-blue-500 flex items-center justify-center"><Edit3 size={18}/></button>
                    <button onClick={() => confirm("¿Borrar?") && remove(ref(db, `productos/${p.id}`))} className="w-12 h-12 rounded-2xl bg-black/5 text-slate-400 hover:text-red-500 flex items-center justify-center"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'reservas' && (
        <div className="animate-in slide-in-from-bottom-4 space-y-4">
          {reservas.length === 0 ? <p className="text-center opacity-40 font-bold uppercase py-20">Sin pedidos registrados</p> : 
            reservas.map(r => (
              <Card key={r.id} className={`rounded-[3rem] border-none shadow-xl overflow-hidden ${tema.bgHeader}`}><CardContent className="p-6 flex justify-between items-center"><div><h3 className={`font-black uppercase italic ${tema.text}`}>{r.nombre} {r.apellido}</h3><p className="text-xs opacity-50">{r.fecha} - {r.hora} ({r.comensales} pers)</p></div><Button onClick={() => remove(ref(db, `reservas/${r.id}`))} variant="destructive" className="rounded-xl font-black uppercase text-[10px]">Finalizar</Button></CardContent></Card>
            ))
          }
        </div>
      )}

      {tab === 'config' && (
        <div className="animate-in slide-in-from-right-4 max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* SECCIÓN DATOS DE TRANSFERENCIA */}
            <Card className={`rounded-[3rem] border-none shadow-xl p-8 relative overflow-hidden md:col-span-2 ${tema.bgHeader}`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`${tema.accent} p-3 rounded-2xl text-white shadow-lg`}><CreditCard size={28} /></div>
                <div>
                  <h3 className={`text-xl font-black uppercase italic ${tema.text}`}>Datos de Transferencia</h3>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">Información para pagos bancarios</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-40 ml-2">Alias</p><Input className="bg-black/5 border-none font-bold h-12 rounded-xl" placeholder="Ej: mi.local.pago" value={datosPago.alias} onChange={e => setDatosPago({...datosPago, alias: e.target.value})} /></div>
                <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-40 ml-2">CBU / CVU</p><Input className="bg-black/5 border-none font-bold h-12 rounded-xl" placeholder="22 dígitos" value={datosPago.cbu} onChange={e => setDatosPago({...datosPago, cbu: e.target.value})} /></div>
                <div className="space-y-1"><p className="text-[10px] font-black uppercase opacity-40 ml-2">Titular</p><Input className="bg-black/5 border-none font-bold h-12 rounded-xl" placeholder="Nombre completo" value={datosPago.titular} onChange={e => setDatosPago({...datosPago, titular: e.target.value})} /></div>
              </div>
              <Button onClick={guardarPagos} className={`w-full h-12 rounded-xl font-black uppercase italic ${tema.accent}`}>Guardar Datos Bancarios</Button>
            </Card>

            <Card className={`rounded-[3rem] border-none shadow-xl p-8 relative overflow-hidden md:col-span-2 ${tema.bgHeader}`}>
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${estadoLocal.manualAbierto ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}><Power size={28} /></div>
                  <div><h3 className={`text-xl font-black uppercase italic ${tema.text}`}>Estado del Local</h3></div>
                </div>
                <button onClick={() => { const n = { ...estadoLocal, manualAbierto: !estadoLocal.manualAbierto }; setEstadoLocal(n); guardarEstadoLocal(n); }} className={`h-14 px-8 rounded-2xl font-black uppercase italic text-xs shadow-lg ${estadoLocal.manualAbierto ? 'bg-green-500/10 text-green-500 border-2 border-green-500' : 'bg-red-500 text-white'}`}>{estadoLocal.manualAbierto ? "LOCAL ABIERTO" : "LOCAL CERRADO"}</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 z-10">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia} className="bg-black/5 p-4 rounded-2xl border border-black/5">
                    <p className={`text-[10px] font-black uppercase mb-3 ${tema.primary}`}>{dia}</p>
                    <div className="space-y-2 text-[10px]">
                      <div className="flex justify-between font-bold opacity-60"><span>ABRE:</span><input type="time" className="bg-transparent outline-none" value={(estadoLocal.horarios as any)[dia]?.inicio || "20:00"} onChange={(e) => setEstadoLocal({ ...estadoLocal, horarios: { ...estadoLocal.horarios, [dia]: { ...(estadoLocal.horarios as any)[dia], inicio: e.target.value } } })} /></div>
                      <div className="flex justify-between font-bold opacity-60"><span>CIERRA:</span><input type="time" className="bg-transparent outline-none" value={(estadoLocal.horarios as any)[dia]?.fin || "00:00"} onChange={(e) => setEstadoLocal({ ...estadoLocal, horarios: { ...estadoLocal.horarios, [dia]: { ...(estadoLocal.horarios as any)[dia], fin: e.target.value } } })} /></div>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => guardarEstadoLocal(estadoLocal)} className={`mt-6 w-full h-12 rounded-xl font-black uppercase italic ${tema.accent}`}>Guardar Horarios</Button>
            </Card>

            <Card className={`rounded-[3rem] border-none shadow-xl p-8 relative overflow-hidden flex flex-col ${tema.bgHeader}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${tema.accent} text-white`}><Store size={28} /></div>
              <h3 className={`text-xl font-black uppercase italic mb-6 ${tema.text}`}>Perfil del Local</h3>
              <div className="space-y-4 z-10">
                <div className="flex items-center gap-4">
                  <label className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer bg-black/5 border-2 border-dashed border-black/10 flex items-center justify-center">{perfilEdit.logoUrl ? <img src={perfilEdit.logoUrl} className="w-full h-full object-cover" /> : <UploadCloud size={24} className="opacity-20" />}<input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} /></label>
                  <div className="flex-1"><p className="text-[10px] font-black uppercase opacity-40 mb-1">Nombre Comercial</p><Input className="bg-black/5 border-none font-bold h-12 rounded-xl" value={perfilEdit.nombreLocal} onChange={e => setPerfilEdit({...perfilEdit, nombreLocal: e.target.value.toUpperCase()})} /></div>
                </div>
                <Button onClick={guardarPerfil} className={`w-full h-12 rounded-xl font-black uppercase italic ${tema.accent}`}>Actualizar Datos</Button>
              </div>
            </Card>

            <Card className={`rounded-[3rem] border-none shadow-xl p-8 relative overflow-hidden flex flex-col ${tema.bgHeader}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${tema.accent} text-white`}><Palette size={28} /></div>
              <h3 className={`text-xl font-black uppercase italic mb-6 ${tema.text}`}>Estilo Visual</h3>
              <div className="grid grid-cols-3 gap-4 z-10">
                {['naranja', 'oscuro', 'verde'].map(t => (
                  <div key={t} onClick={() => cambiarTema(t)} className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${temaActivo === t ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
                    <div className={`w-12 h-12 rounded-xl border-4 border-white shadow-lg flex items-center justify-center ${t === 'naranja' ? 'bg-orange-600' : t === 'oscuro' ? 'bg-zinc-900' : 'bg-emerald-600'}`}>{temaActivo === t && <Check className="text-white" size={16} />}</div>
                    <span className={`text-[8px] font-black uppercase ${tema.text}`}>{t}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Link to="/admin/qrs" className="md:col-span-2 group"><Card className={`rounded-[2.5rem] border-none shadow-xl p-6 flex items-center justify-between ${tema.bgHeader} hover:ring-2 ring-current transition-all`}><div className="flex items-center gap-4"><div className={`${tema.accent} p-3 rounded-xl text-white`}><QrCode size={24} /></div><div><h3 className={`font-black uppercase italic ${tema.text}`}>Gestionar Mesas y QR</h3><p className="text-[10px] font-bold opacity-40 uppercase">Descargar códigos para las mesas</p></div></div><ChevronRight className="opacity-20" /></Card></Link>
          </div>
        </div>
      )}
    </div>
  )
}
