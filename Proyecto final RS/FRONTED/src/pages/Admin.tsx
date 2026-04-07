import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Plus, Trash2, UploadCloud, Edit3, Save, Megaphone, 
  DollarSign, CalendarDays, Users, Settings, Palette, 
  LogOut, LayoutDashboard, ExternalLink, ChevronRight, Check, Utensils, QrCode
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

export default function Admin({ productos, tema }: { productos: any[], tema: any }) {
  const [tab, setTab] = useState<'menu' | 'reservas' | 'config'>('menu')
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ precio: "", descripcion: "" })
  const [promo, setPromo] = useState({ activa: false, titulo: "", mensaje: "", imagen: "", precio: "" })
  const [reservas, setReservas] = useState<any[]>([])
  const [temaActivo, setTemaActivo] = useState('naranja')

  useEffect(() => {
    onValue(ref(db, 'config/promo'), (snapshot) => {
      if (snapshot.exists()) setPromo(snapshot.val());
    });

    onValue(ref(db, 'config/tema'), (snapshot) => {
      if (snapshot.exists()) setTemaActivo(snapshot.val());
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

  const toggleDisponibilidad = async (id: string, estadoActual: boolean) => {
    try {
      const nuevoEstado = estadoActual === false ? true : false;
      await update(ref(db, `productos/${id}`), { disponible: nuevoEstado });
      toast.success(nuevoEstado ? "Producto disponible" : "Producto agotado");
    } catch (e) {
      toast.error("Error al actualizar stock");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'producto' | 'promo') => {
    if (!e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      if (tipo === 'producto') setNuevo(prev => ({ ...prev, imagen: reader.result as string }));
      else setPromo(prev => ({ ...prev, imagen: reader.result as string }));
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
            Gestión <span className={tema.primary}>RestoWeb</span>
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
                       {CATEGORIAS_MENU.map(c => <option key={c} className="bg-slate-800 text-white">{c}</option>)}
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
                    <img src={p.imagen} className="w-24 h-24 rounded-[1.5rem] object-cover shadow-lg" />
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
                      {/* BOTÓN DE DISPONIBILIDAD DINÁMICO */}
                      <Button 
                        onClick={() => toggleDisponibilidad(p.id, p.disponible !== false)} 
                        className={`w-12 h-12 rounded-2xl shadow-none transition-all border-none ${
                          p.disponible !== false 
                            ? `${tema.accent} hover:opacity-80` 
                            : "bg-red-500 text-white animate-pulse"
                        }`}
                      >
                        {p.disponible !== false ? <Check size={18} /> : <Trash2 size={18} className="rotate-45" />}
                      </Button>

                      <Button onClick={() => { setEditandoId(p.id); setEditForm({precio: p.precio.toString(), descripcion: p.descripcion}) }} className="w-12 h-12 rounded-2xl bg-black/5 text-slate-400 hover:text-blue-500 shadow-none"><Edit3 size={18}/></Button>
                      <Button onClick={() => confirm("¿Borrar?") && remove(ref(db, `productos/${p.id}`))} className="w-12 h-12 rounded-2xl bg-black/5 text-slate-400 hover:text-red-500 shadow-none"><Trash2 size={18}/></Button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* RESTO DE TABS (RESERVAS Y CONFIG SIN CAMBIOS ADICIONALES) */}
      {tab === 'reservas' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
           {reservas.length === 0 ? (
            <Card className={`text-center py-32 rounded-[3rem] border-4 border-dashed ${tema.border} ${tema.bgHeader}`}>
               <CalendarDays size={64} className="mx-auto opacity-10 mb-6" />
               <p className="font-black uppercase italic opacity-20 text-xl tracking-widest">No hay reservas</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reservas.map(r => (
                <Card key={r.id} className={`rounded-[3rem] border-none shadow-xl overflow-hidden hover:shadow-2xl transition-all group ${tema.bgHeader}`}>
                  <div className={`${tema.accent} p-8 flex justify-between items-center relative overflow-hidden`}>
                    <span className="font-black text-2xl italic tracking-tighter z-10">{r.comensales} PERSONAS</span>
                    <Users className="absolute -right-4 -bottom-4 opacity-10 size-24" />
                  </div>
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <h3 className={`font-black uppercase italic text-xl mb-1 ${tema.text}`}>{r.nombre} {r.apellido}</h3>
                      <div className={`${tema.primary} font-black text-sm flex items-center gap-2`}>{r.telefono}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/5 p-4 rounded-3xl text-center">
                        <span className="text-[9px] font-black opacity-30 uppercase block">Hora</span>
                        <span className={`font-black ${tema.text}`}>{r.hora}</span>
                      </div>
                      <div className="bg-black/5 p-4 rounded-3xl text-center">
                        <span className="text-[9px] font-black opacity-30 uppercase block">Fecha</span>
                        <span className={`font-black ${tema.text}`}>{r.fecha}</span>
                      </div>
                    </div>
                    <Button 
                      className={`w-full hover:bg-green-600 text-white font-black uppercase italic rounded-2xl h-14 ${tema.accent}`} 
                      onClick={() => confirm("¿Finalizar?") && remove(ref(db, `reservas/${r.id}`))}
                    >
                      Atendido
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'config' && (
        <div className="animate-in slide-in-from-right-4 duration-500 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-black uppercase italic tracking-tighter mb-2 ${tema.text}`}>Configuración</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Personaliza tu experiencia RestoWeb</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/admin/qrs" className="group">
              <Card className={`rounded-[3rem] border-none shadow-xl p-10 transition-all h-full relative overflow-hidden flex flex-col ${tema.bgHeader} hover:ring-4 ring-current`}>
                <div className={`${tema.accent} w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8`}>
                  <QrCode size={32} />
                </div>
                <h3 className={`text-2xl font-black uppercase italic mb-3 ${tema.text}`}>Generador de QRs</h3>
                <p className="text-sm font-bold text-slate-400 uppercase">Administra mesas y códigos QR.</p>
                <QrCode className="absolute -right-8 -bottom-8 opacity-5 size-48 -rotate-12" />
              </Card>
            </Link>

            <Card className={`rounded-[3rem] border-none shadow-xl p-10 relative overflow-hidden group flex flex-col ${tema.bgHeader}`}>
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-2xl ${tema.accent}`}>
                  <Palette size={32} />
                </div>
                <h3 className={`text-2xl font-black uppercase italic mb-3 leading-none ${tema.text}`}>Estilo de la App</h3>
                <p className="text-sm font-bold text-slate-400 uppercase leading-relaxed mb-8">Elegí el ambiente visual para tus clientes.</p>
                
                <div className="grid grid-cols-3 gap-4 mb-4 z-10">
                  <div onClick={() => cambiarTema('naranja')} className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${temaActivo === 'naranja' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
                    <div className="w-14 h-14 rounded-2xl bg-orange-600 border-4 border-white shadow-lg flex items-center justify-center">
                      {temaActivo === 'naranja' && <Check className="text-white" size={20} />}
                    </div>
                    <span className={`text-[8px] font-black uppercase ${tema.text}`}>Clásico</span>
                  </div>

                  <div onClick={() => cambiarTema('oscuro')} className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${temaActivo === 'oscuro' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border-4 border-white shadow-lg flex items-center justify-center">
                      {temaActivo === 'oscuro' && <Check className="text-yellow-500" size={20} />}
                    </div>
                    <span className={`text-[8px] font-black uppercase ${tema.text}`}>Luxury</span>
                  </div>

                  <div onClick={() => cambiarTema('verde')} className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${temaActivo === 'verde' ? 'scale-110' : 'opacity-40 hover:opacity-100'}`}>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 border-4 border-white shadow-lg flex items-center justify-center">
                      {temaActivo === 'verde' && <Check className="text-white" size={20} />}
                    </div>
                    <span className={`text-[8px] font-black uppercase ${tema.text}`}>Forest</span>
                  </div>
                </div>
                
                <Palette className="absolute -right-8 -bottom-8 opacity-5 size-48 -rotate-12" />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
