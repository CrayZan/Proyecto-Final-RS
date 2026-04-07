import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plus, Trash2, UploadCloud, Edit3, Save, Megaphone, 
  DollarSign, CalendarDays, Users, Settings, Palette, 
  LogOut, LayoutDashboard, ExternalLink, ChevronRight, Check, Utensils, QrCode, Store, Clock, Power
} from "lucide-react"
import { ref, push, remove, update, onValue, set } from "firebase/database"
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
  
  // ESTADO DE APERTURA Y HORARIOS
  const [estadoLocal, setEstadoLocal] = useState({
    manualAbierto: true,
    horarios: DIAS_SEMANA.reduce((acc, dia) => ({ ...acc, [dia]: { inicio: "20:00", fin: "00:00" } }), {})
  })

  const [perfilEdit, setPerfilEdit] = useState({
    nombreLocal: perfil?.nombreLocal || "RESTOAPP",
    logoUrl: perfil?.logoUrl || ""
  })

  useEffect(() => {
    onValue(ref(db, 'config/promo'), (snapshot) => {
      if (snapshot.exists()) setPromo(snapshot.val());
    });

    onValue(ref(db, 'config/tema'), (snapshot) => {
      if (snapshot.exists()) setTemaActivo(snapshot.val());
    });

    onValue(ref(db, 'config/estado'), (snapshot) => {
      if (snapshot.exists()) setEstadoLocal(snapshot.val());
    });

    onValue(ref(db, 'reservas'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setReservas(Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse());
      } else {
        setReservas([]);
      }
    });
  }, [])

  useEffect(() => {
    if (perfil) setPerfilEdit(perfil);
  }, [perfil]);

  const guardarPerfil = async () => {
    try {
      await set(ref(db, 'config/perfil'), perfilEdit);
      toast.success("Perfil del local actualizado");
    } catch (e) {
      toast.error("Error al guardar el perfil");
    }
  }

  const guardarEstadoLocal = async (nuevoEstado: any) => {
    try {
      await set(ref(db, 'config/estado'), nuevoEstado);
      toast.success("Horarios y estado actualizados");
    } catch (e) {
      toast.error("Error al actualizar horarios");
    }
  }

  const cambiarTema = async (nuevoTema: string) => {
    try {
      await set(ref(db, 'config/tema'), nuevoTema);
      setTemaActivo(nuevoTema);
      toast.success(`Estilo ${nuevoTema.toUpperCase()} aplicado`);
    } catch (e) {
      toast.error("Error al cambiar el estilo");
    }
  }

  const guardarPromo = async () => {
    try {
      await set(ref(db, 'config/promo'), promo);
      toast.success("Promoción sincronizada");
    } catch (e) {
      toast.error("Error al sincronizar");
    }
  }

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
    e.preventDefault()
    if (!nuevo.nombre || !nuevo.precio || !nuevo.imagen) return toast.error("Completá nombre, precio y foto");
    await push(ref(db, 'productos'), { ...nuevo, precio: Number(nuevo.precio), disponible: true });
    setNuevo({ nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" });
    toast.success("¡Plato publicado!");
  }

  const guardarEdicion = async (id: string) => {
    await update(ref(db, `productos/${id}`), { precio: Number(editForm.precio), descripcion: editForm.descripcion });
    setEditandoId(null);
    toast.success("Producto actualizado");
  }

  const handleLogout = () => {
    window.location.href = "/";
  }

  return (
    <div className={`p-4 md:p-8 max-w-7xl mx-auto mb-20 animate-in fade-in duration-500 ${tema.bgPage}`}>
      
      {/* CABECERA */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 ${tema.bgHeader} p-6 rounded-[2.5rem] shadow-sm border ${tema.border}`}>
        <div>
          <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
            <LayoutDashboard size={12} />
            <span>Panel</span>
            <ChevronRight size={12} />
            <span className={tema.primary}>{tab === 'menu' ? 'Menú' : tab === 'reservas' ? 'Reservas' : 'Ajustes'}</span>
          </div>
          <h1 className={`text-3xl font-black uppercase italic tracking-tighter ${tema.text}`}>
            Gestión <span className={tema.primary}>{perfil?.nombreLocal || "RestoWeb"}</span>
          </h1>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => window.open('/', '_blank')}
            className={`flex-1 md:flex-none rounded-2xl font-black uppercase italic text-[10px] ${tema.border} ${tema.text} h-12 bg-transparent`}
          >
            <ExternalLink size={14} className="mr-2" /> Ver Web
          </Button>
          <Button 
            onClick={handleLogout}
            className="flex-1 md:flex-none bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black uppercase italic text-[10px] border-none h-12 transition-all"
          >
            <LogOut size={14} className="mr-2" /> Salir
          </Button>
        </div>
      </div>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="flex bg-black/5 p-2 rounded-[2rem] mb-12 max-w-2xl mx-auto border border-black/5">
        <button onClick={() => setTab('menu')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black uppercase italic text-[10px] md:text-xs transition-all ${tab === 'menu' ? `${tema.bgHeader} ${tema.text} shadow-xl scale-105` : 'text-slate-400 hover:text-slate-600'}`}>
          <Utensils size={14} /> Menú y Promo
        </button>
        <button onClick={() => setTab('reservas')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black uppercase italic text-[10px] md:text-xs transition-all ${tab === 'reservas' ? `${tema.bgHeader} ${tema.primary} shadow-xl scale-105` : 'text-slate-400 hover:text-slate-600'}`}>
          <CalendarDays size={14} /> Reservas ({reservas.length})
        </button>
        <button onClick={() => setTab('config')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black uppercase italic text-[10px] md:text-xs transition-all ${tab === 'config' ? `${tema.bgHeader} ${tema.primary} shadow-xl scale-105` : 'text-slate-400 hover:text-slate-600'}`}>
          <Settings size={14} /> Ajustes
        </button>
      </div>

      {tab === 'menu' && (
        <div className="space-y-10 animate-in slide-in-from-left-4 duration-500">
           <Card className={`rounded-[2.5rem] border-none shadow-2xl overflow-hidden border-b-8 ${tema.bgHeader} ${tema.border.replace('border-', 'border-b-')}`}>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className={`flex items-center gap-2 ${tema.primary}`}>
                  <Megaphone size={24} className="animate-bounce" />
                  <h2 className={`font-black uppercase italic text-2xl tracking-tighter ${tema.text}`}>Anuncio del Día</h2>
                </div>
                <Input className="bg-black/10 border-none text-current h-14 rounded-2xl font-bold" placeholder="Título de la Oferta" value={promo.titulo} onChange={e => setPromo({...promo, titulo: e.target.value})} />
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <DollarSign className={`absolute left-4 top-4 ${tema.primary}`} size={18} />
                    <Input className="bg-black/10 border-none h-14 rounded-2xl pl-12 font-bold text-lg" placeholder="Precio" type="number" value={promo.precio} onChange={e => setPromo({...promo, precio: e.target.value})} />
                  </div>
                  <textarea className="flex-[2] bg-black/10 border-none text-current rounded-2xl p-4 text-sm min-h-[56px] outline-none font-medium" placeholder="Mensaje tentador..." value={promo.mensaje} onChange={e => setPromo({...promo, mensaje: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setPromo({...promo, activa: !promo.activa})} className={`h-14 flex-1 font-black rounded-2xl uppercase text-xs transition-all border-2 ${promo.activa ? `${tema.accent} border-transparent shadow-lg` : 'bg-transparent border-slate-700 text-slate-500'}`}>
                    {promo.activa ? "OFERTA ACTIVADA" : "OFERTA PAUSADA"}
                  </button>
                  <Button onClick={guardarPromo} className={`font-black rounded-2xl uppercase flex-1 h-14 transition-all shadow-xl ${tema.accent}`}>Guardar Promo</Button>
                </div>
              </div>
              <label className={`block h-64 rounded-[2rem] border-2 border-dashed border-black/10 overflow-hidden relative cursor-pointer group transition-all`}>
                  {promo.imagen ? <img src={promo.imagen} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="flex flex-col items-center justify-center h-full opacity-30 font-black uppercase text-[10px]"><UploadCloud className="mb-2" size={32} /> Subir Foto</div>}
                  <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'promo')} />
              </label>
            </div>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-1">
                <Card className={`rounded-[3rem] border-none shadow-2xl sticky top-10 overflow-hidden border-t-8 ${tema.bgHeader} ${tema.border.replace('border-', 'border-t-')}`}>
                  <div className={`${tema.accent} p-6 text-center font-black uppercase text-xs italic tracking-widest flex items-center justify-center gap-2`}>
                    <Plus size={16}/> Nuevo Producto
                  </div>
                  <CardContent className="p-8 space-y-4">
                    <label className="block h-48 border-2 border-dashed border-black/5 rounded-[2rem] overflow-hidden cursor-pointer bg-black/5 hover:bg-black/10 transition-all">
                      {nuevo.imagen ? <img src={nuevo.imagen} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full opacity-20"><UploadCloud size={30} className="mb-2"/><span className="text-[10px] font-black uppercase">Foto del plato</span></div>}
                      <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'producto')} />
                    </label>
                    <Input className={`rounded-2xl h-14 font-bold bg-black/5 border-none ${tema.text}`} placeholder="Nombre del plato" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input className="rounded-2xl h-14 font-bold bg-black/5 border-none" type="number" placeholder="Precio $" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} />
                      <select className={`border-none rounded-2xl h-14 px-4 text-[10px] font-black uppercase bg-black/5 outline-none focus:ring-2 ${tema.text}`} value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                        {CATEGORIAS_MENU.map(c => <option key={c} value={c} className="bg-slate-800 text-white">{c}</option>)}
                      </select>
                    </div>
                    <textarea className="w-full bg-black/5 border-none rounded-2xl p-4 text-sm font-bold min-h-[100px] outline-none" placeholder="Descripción..." value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} />
                    <Button onClick={agregar} className={`w-full h-16 font-black uppercase italic rounded-2xl shadow-xl transition-all ${tema.accent}`}><Plus className="mr-2"/> Publicar Ahora</Button>
                  </CardContent>
                </Card>
              </div>

              <div className="xl:col-span-2 space-y-6">
                {productos.map(p => (
                   <div key={p.id} className={`${tema.bgHeader} p-4 rounded-[2.5rem] shadow-sm border ${tema.border} flex items-center gap-5 group hover:shadow-xl hover:translate-x-2 transition-all duration-300 ${p.disponible === false ? 'opacity-40 grayscale' : ''}`}>
                    <div className="relative">
                      <img src={p.imagen} className="w-24 h-24 rounded-[1.5rem] object-cover shadow-lg" />
                      {p.disponible === false && <div className="absolute inset-0 bg-black/60 rounded-[1.5rem] flex items-center justify-center"><span className="text-[8px] font-black text-white bg-red-600 px-2 py-1 rounded-full">AGOTADO</span></div>}
                    </div>
                    <div className="flex-1">
                      <p className="font-black uppercase italic text-[9px] opacity-40 mb-1">{p.categoria}</p>
                      <p className={`font-black uppercase italic text-lg leading-none mb-2 ${tema.text}`}>{p.nombre}</p>
                      {editandoId === p.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input className="h-10 text-xs font-bold bg-black/10 border-none rounded-xl" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})} />
                          <Button onClick={() => guardarEdicion(p.id)} className={`h-10 bg-green-600 rounded-xl px-6 font-black uppercase text-[10px] text-white`}><Save size={14} className="mr-2"/> OK</Button>
                        </div>
                      ) : (
                        <span className={`${tema.primary} font-black italic text-xl tracking-tighter`}>${p.precio}</span>
                      )}
                    </div>
                    <div className="flex gap-2 pr-4">
                      <button 
                        onClick={() => update(ref(db, `productos/${p.id}`), { disponible: p.disponible === false })} 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${p.disponible === false ? 'bg-orange-500 text-white shadow-lg' : 'bg-black/5 text-slate-400 hover:bg-black/10'}`}
                      >
                        {p.disponible === false ? <Check size={18} /> : <Utensils size={18} />}
                      </button>
                      <button 
                        onClick={() => { setEditandoId(p.id); setEditForm({ precio: p.precio.toString(), descripcion: p.descripcion || "" }); }} 
                        className="w-12 h-12 rounded-2xl bg-black/5 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-all"
                      >
                        <Edit3 size={18}/>
                      </button>
                      <button 
                        onClick={() => confirm("¿Borrar?") && remove(ref(db, `productos/${p.id}`))} 
                        className="w-12 h-12 rounded-2xl bg-black/5 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      )}

      {tab === 'reservas' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
           {reservas.map(r => (
             <Card key={r.id} className={`rounded-[3rem] border-none shadow-xl overflow-hidden mb-4 ${tema.bgHeader}`}>
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-black uppercase italic">{r.nombre} {r.apellido}</h3>
                    <p className="text-xs opacity-50">{r.fecha} - {r.hora} ({r.comensales} pers)</p>
                  </div>
                  <Button onClick={() => remove(ref(db, `reservas/${r.id}`))} variant="destructive" className="rounded-xl">Finalizar</Button>
                </CardContent>
             </Card>
           ))}
        </div>
      )}

      {tab === 'config' && (
        <div className="animate-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h2 className={`text-4xl font-black uppercase italic tracking-tighter mb-2 ${tema.text}`}>Configuración</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Personaliza tu marca y estilo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* NUEVA TARJETA: CONTROL DE ESTADO Y HORARIOS */}
            <Card className={`rounded-[3rem] border-none shadow-xl p-8 relative overflow-hidden flex flex-col md:col-span-2 ${tema.bgHeader}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${estadoLocal.manualAbierto ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    <Power size={28} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase italic ${tema.text}`}>Estado del Local</h3>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Control manual y automático</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const nuevo = { ...estadoLocal, manualAbierto: !estadoLocal.manualAbierto };
                    setEstadoLocal(nuevo);
                    guardarEstadoLocal(nuevo);
                  }}
                  className={`h-14 px-8 rounded-2xl font-black uppercase italic text-xs transition-all shadow-lg ${estadoLocal.manualAbierto ? 'bg-green-500/10 text-green-500 border-2 border-green-500' : 'bg-red-500 text-white'}`}
                >
                  {estadoLocal.manualAbierto ? "LOCAL ABIERTO (MANUAL)" : "LOCAL CERRADO (MANUAL)"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia} className="bg-black/5 p-4 rounded-2xl border border-black/5">
                    <p className={`text-[10px] font-black uppercase mb-3 ${tema.primary}`}>{dia}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold opacity-40">ABRE:</span>
                        <input 
                          type="time" 
                          className="bg-transparent font-bold text-xs outline-none" 
                          value={estadoLocal.horarios[dia]?.inicio || "20:00"} 
                          onChange={(e) => {
                            const nuevo = { ...estadoLocal, horarios: { ...estadoLocal.horarios, [dia]: { ...estadoLocal.horarios[dia], inicio: e.target.value } } };
                            setEstadoLocal(nuevo);
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold opacity-40">CIERRA:</span>
                        <input 
                          type="time" 
                          className="bg-transparent font-bold text-xs outline-none" 
                          value={estadoLocal.horarios[dia]?.fin || "00:00"} 
                          onChange={(e) => {
                            const nuevo = { ...estadoLocal, horarios: { ...estadoLocal.horarios, [dia]: { ...estadoLocal.horarios[dia], fin: e.target.value } } };
                            setEstadoLocal(nuevo);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => guardarEstadoLocal(estadoLocal)} 
                className={`mt-6 h-12 rounded-xl font-black uppercase italic ${tema.accent} z-10`}
              >
                Guardar Horarios Semanales
              </Button>
              <Clock className="absolute -right-8 -bottom-8 opacity-5 size-40 -rotate-12" />
            </Card>

            <Card className={`rounded-[3rem] border-none shadow-xl p-8 relative overflow-hidden group flex flex-col ${tema.bgHeader}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${tema.accent}`}>
                <Store size={28} />
              </div>
              <h3 className={`text-xl font-black uppercase italic mb-6 ${tema.text}`}>Perfil del Local</h3>
              
              <div className="space-y-4 z-10">
                <div className="flex items-center gap-4 mb-4">
                  <label className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer bg-black/5 border-2 border-dashed border-black/10 hover:bg-black/10 transition-all flex items-center justify-center">
                    {perfilEdit.logoUrl ? (
                      <img src={perfilEdit.logoUrl} className="w-full h-full object-cover" />
                    ) : (
                      <UploadCloud size={24} className="opacity-20" />
                    )}
                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
                  </label>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">Nombre Comercial</p>
                    <Input 
                      className="bg-black/5 border-none font-bold h-12 rounded-xl"
                      value={perfilEdit.nombreLocal}
                      onChange={e => setPerfilEdit({...perfilEdit, nombreLocal: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>
                <Button onClick={guardarPerfil} className={`w-full h-12 rounded-xl font-black uppercase italic ${tema.accent}`}>
                  Actualizar Datos
                </Button>
              </div>
              <Store className="absolute -right-8 -bottom-8 opacity-5 size-40 -rotate-12" />
            </Card>

            <Card className={`rounded-[3rem] border-none shadow-xl p-8 relative overflow-hidden group flex flex-col ${tema.bgHeader}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${tema.accent}`}>
                  <Palette size={28} />
                </div>
                <h3 className={`text-xl font-black uppercase italic mb-6 ${tema.text}`}>Estilo Visual</h3>
                
                <div className="grid grid-cols-3 gap-4 mb-4 z-10">
                  <div onClick={() => cambiarTema('naranja')} className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${temaActivo === 'naranja' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
                    <div className="w-12 h-12 rounded-xl bg-orange-600 border-4 border-white shadow-lg flex items-center justify-center">
                      {temaActivo === 'naranja' && <Check className="text-white" size={16} />}
                    </div>
                    <span className={`text-[8px] font-black uppercase ${tema.text}`}>Clásico</span>
                  </div>

                  <div onClick={() => cambiarTema('oscuro')} className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${temaActivo === 'oscuro' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border-4 border-white shadow-lg flex items-center justify-center">
                      {temaActivo === 'oscuro' && <Check className="text-yellow-500" size={16} />}
                    </div>
                    <span className={`text-[8px] font-black uppercase ${tema.text}`}>Luxury</span>
                  </div>

                  <div onClick={() => cambiarTema('verde')} className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${temaActivo === 'verde' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 border-4 border-white shadow-lg flex items-center justify-center">
                      {temaActivo === 'verde' && <Check className="text-white" size={16} />}
                    </div>
                    <span className={`text-[8px] font-black uppercase ${tema.text}`}>Forest</span>
                  </div>
                </div>
                <Palette className="absolute -right-8 -bottom-8 opacity-5 size-40 -rotate-12" />
            </Card>

            <Link to="/admin/qrs" className="md:col-span-2 group">
              <Card className={`rounded-[2.5rem] border-none shadow-xl p-6 flex items-center justify-between ${tema.bgHeader} hover:ring-2 ring-current transition-all`}>
                <div className="flex items-center gap-4">
                  <div className={`${tema.accent} p-3 rounded-xl`}>
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h3 className={`font-black uppercase italic ${tema.text}`}>Gestionar Mesas y QR</h3>
                    <p className="text-[10px] font-bold opacity-40 uppercase">Descargar códigos para las mesas</p>
                  </div>
                </div>
                <ChevronRight className="opacity-20" />
              </Card>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
