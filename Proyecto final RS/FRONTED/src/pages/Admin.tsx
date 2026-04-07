import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, Trash2, UploadCloud, Edit3, Save, Megaphone, 
  Star, DollarSign, CalendarDays, Users, Phone, Clock, 
  CheckCircle2, Utensils, QrCode, Settings, Palette, ArrowRight,
  LogOut, LayoutDashboard, ExternalLink, ChevronRight
} from "lucide-react"
import { ref, push, remove, update, onValue, set } from "firebase/database"
import { db } from "../lib/firebase"
import { toast } from "sonner"
import { Link, useNavigate } from "react-router-dom"

const CATEGORIAS_MENU = [
  "Entradas", "Principales", "Pastas caseras", "Sandwiches", 
  "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", 
  "Postres", "Cerveza", "Vinos", "Gaseosas"
];

export default function Admin({ productos }: { productos: any[] }) {
  const [tab, setTab] = useState<'menu' | 'reservas' | 'config'>('menu')
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ precio: "", descripcion: "" })
  const [promo, setPromo] = useState({ activa: false, titulo: "", mensaje: "", imagen: "", precio: "" })
  const [reservas, setReservas] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    onValue(ref(db, 'config/promo'), (snapshot) => {
      if (snapshot.exists()) setPromo(snapshot.val());
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
    await push(ref(db, 'productos'), { ...nuevo, precio: Number(nuevo.precio) });
    setNuevo({ nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" });
    toast.success("¡Plato publicado!");
  }

  const guardarEdicion = async (id: string) => {
    await update(ref(db, `productos/${id}`), { precio: Number(editForm.precio), descripcion: editForm.descripcion });
    setEditandoId(null);
    toast.success("Producto actualizado");
  }

  const handleLogout = () => {
    // Simplemente recargamos para limpiar el estado de auth o redirigimos
    window.location.href = "/";
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto mb-20 animate-in fade-in duration-500">
      
      {/* CABECERA DINÁMICA E INTUITIVA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50">
        <div>
          <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
            <LayoutDashboard size={12} />
            <span>Panel</span>
            <ChevronRight size={12} />
            <span className="text-orange-600">{tab === 'menu' ? 'Menú' : tab === 'reservas' ? 'Reservas' : 'Ajustes'}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
            Gestión <span className="text-orange-600">RestoWeb</span>
          </h1>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={() => window.open('/', '_blank')}
            className="flex-1 md:flex-none rounded-2xl font-black uppercase italic text-[10px] border-slate-200 h-12"
          >
            <ExternalLink size={14} className="mr-2" /> Ver Web
          </Button>
          <Button 
            onClick={handleLogout}
            className="flex-1 md:flex-none bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl font-black uppercase italic text-[10px] border-none h-12 transition-all"
          >
            <LogOut size={14} className="mr-2" /> Salir
          </Button>
        </div>
      </div>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="flex bg-slate-100 p-2 rounded-[2rem] mb-12 max-w-2xl mx-auto">
        <button 
          onClick={() => setTab('menu')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black uppercase italic text-[10px] md:text-xs transition-all ${tab === 'menu' ? 'bg-white text-slate-900 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Utensils size={14} /> Menú y Promo
        </button>
        <button 
          onClick={() => setTab('reservas')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black uppercase italic text-[10px] md:text-xs transition-all ${tab === 'reservas' ? 'bg-white text-orange-600 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <CalendarDays size={14} /> Reservas ({reservas.length})
        </button>
        <button 
          onClick={() => setTab('config')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black uppercase italic text-[10px] md:text-xs transition-all ${tab === 'config' ? 'bg-white text-blue-600 shadow-xl scale-105' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Settings size={14} /> Ajustes
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑAS */}
      {tab === 'menu' && (
        <div className="space-y-10 animate-in slide-in-from-left-4 duration-500">
          {/* SECCIÓN PROMO */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white overflow-hidden border-b-8 border-orange-600">
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-500">
                  <Megaphone size={24} className="animate-bounce" />
                  <h2 className="font-black uppercase italic text-2xl tracking-tighter text-white">Anuncio del Día</h2>
                </div>
                <Input className="bg-white/10 border-white/10 text-white h-14 rounded-2xl font-bold" placeholder="Título de la Gran Oferta" value={promo.titulo} onChange={e => setPromo({...promo, titulo: e.target.value})} />
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-4 top-4.5 text-orange-500" size={18} />
                    <Input className="bg-white/10 border-white/10 text-white h-14 rounded-2xl pl-12 font-bold text-lg" placeholder="Precio" type="number" value={promo.precio} onChange={e => setPromo({...promo, precio: e.target.value})} />
                  </div>
                  <textarea className="flex-[2] bg-white/10 border-white/10 text-white rounded-2xl p-4 text-sm min-h-[56px] outline-none font-medium" placeholder="Escribe algo tentador..." value={promo.mensaje} onChange={e => setPromo({...promo, mensaje: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => setPromo({...promo, activa: !promo.activa})} className={`h-14 flex-1 font-black rounded-2xl uppercase text-xs transition-all border-2 ${promo.activa ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-900/20' : 'bg-transparent border-slate-700 text-slate-500'}`}>
                    {promo.activa ? "OFERTA ACTIVADA" : "OFERTA PAUSADA"}
                  </button>
                  <Button onClick={guardarPromo} className="bg-white text-slate-900 font-black rounded-2xl uppercase flex-1 h-14 hover:bg-orange-500 hover:text-white transition-all shadow-xl">Guardar Cambios</Button>
                </div>
              </div>
              <label className="block h-64 rounded-[2rem] border-2 border-dashed border-white/20 overflow-hidden relative cursor-pointer group hover:border-orange-500 transition-all">
                 {promo.imagen ? <img src={promo.imagen} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <div className="flex flex-col items-center justify-center h-full text-slate-500 font-black uppercase text-[10px]"><UploadCloud className="mb-2" size={32} /> Subir Foto de Promo</div>}
                 <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'promo')} />
              </label>
            </div>
          </Card>

          {/* GRID DE GESTIÓN */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <div className="xl:col-span-1">
              <Card className="rounded-[3rem] border-none shadow-2xl bg-white sticky top-10 overflow-hidden border-t-8 border-slate-900">
                <div className="bg-slate-900 p-6 text-center text-white font-black uppercase text-xs italic tracking-widest flex items-center justify-center gap-2">
                  <Plus size={16} className="text-orange-500"/> Nuevo Producto
                </div>
                <CardContent className="p-8 space-y-4">
                    <label className="block h-48 border-2 border-dashed border-slate-100 rounded-[2rem] overflow-hidden cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                      {nuevo.imagen ? <img src={nuevo.imagen} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full text-slate-300"><UploadCloud size={30} className="mb-2"/><span className="text-[10px] font-black uppercase">Click para subir foto</span></div>}
                      <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'producto')} />
                    </label>
                    <Input className="rounded-2xl h-14 font-bold border-slate-100 focus:border-orange-500" placeholder="Nombre del plato" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input className="rounded-2xl h-14 font-bold border-slate-100" type="number" placeholder="Precio $" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} />
                      <select className="border border-slate-100 rounded-2xl h-14 px-4 text-[10px] font-black uppercase bg-slate-50 outline-none focus:ring-2 ring-orange-500" value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                        {CATEGORIAS_MENU.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <textarea className="w-full border border-slate-100 rounded-2xl p-4 text-sm font-bold min-h-[100px] outline-none focus:ring-2 ring-orange-500" placeholder="Descripción / Ingredientes..." value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} />
                    <Button onClick={agregar} className="w-full bg-orange-600 h-16 font-black uppercase italic rounded-2xl shadow-xl shadow-orange-100 hover:bg-slate-900 transition-all"><Plus className="mr-2"/> Publicar Ahora</Button>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-2 text-slate-800">
                  <Star className="text-orange-600 fill-orange-600" size={24}/> Tu Carta
                </h2>
                <Badge className="bg-slate-100 text-slate-400 rounded-full px-4">{productos.length} Platos</Badge>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {productos.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-5 group hover:shadow-xl hover:translate-x-2 transition-all duration-300">
                    <img src={p.imagen} className="w-24 h-24 rounded-[1.5rem] object-cover shadow-lg" />
                    <div className="flex-1">
                      <p className="font-black uppercase italic text-xs text-slate-400 mb-1">{p.categoria}</p>
                      <p className="font-black uppercase italic text-lg text-slate-800 leading-none mb-2">{p.nombre}</p>
                      {editandoId === p.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input className="h-10 text-xs font-bold border-orange-200 rounded-xl" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})} />
                          <Button onClick={() => guardarEdicion(p.id)} className="h-10 bg-green-600 rounded-xl px-6 font-black uppercase text-[10px]"><Save size={14} className="mr-2"/> Guardar</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-orange-600 font-black italic text-xl tracking-tighter">${p.precio}</span>
                          <Badge variant="outline" className="text-[9px] font-bold uppercase border-slate-100 text-slate-400">Activo</Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pr-4">
                      <Button onClick={() => { setEditandoId(p.id); setEditForm({precio: p.precio.toString(), descripcion: p.descripcion}) }} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-orange-50 hover:text-orange-600 shadow-none"><Edit3 size={18}/></Button>
                      <Button onClick={() => confirm("¿Borrar plato?") && remove(ref(db, `productos/${p.id}`))} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 shadow-none"><Trash2 size={18}/></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'reservas' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-10 px-4">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <CalendarDays size={32} className="text-orange-600" /> Reservas Hoy
            </h2>
            <Badge className="bg-orange-600 px-6 py-2 rounded-full font-black italic text-white shadow-lg shadow-orange-100">{reservas.length} PENDIENTES</Badge>
          </div>

          {reservas.length === 0 ? (
            <Card className="text-center py-32 rounded-[3rem] border-4 border-dashed border-slate-100 bg-white">
               <CalendarDays size={64} className="mx-auto text-slate-100 mb-6" />
               <p className="font-black uppercase italic text-slate-300 text-xl tracking-widest">Paciencia... <br/>No hay reservas aún</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reservas.map(r => (
                <Card key={r.id} className="rounded-[3rem] border-none shadow-xl bg-white overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                  <div className="bg-slate-900 p-8 flex justify-between items-center relative overflow-hidden">
                    <div className="flex items-center gap-3 z-10">
                      <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-xl rotate-6">
                        <Users size={20} />
                      </div>
                      <span className="font-black text-2xl italic tracking-tighter text-white">{r.comensales} PERSONAS</span>
                    </div>
                    <Users className="absolute -right-4 -bottom-4 text-white/5 size-24" />
                  </div>
                  <CardContent className="p-8 space-y-8">
                    <div>
                      <h3 className="font-black uppercase italic text-xl mb-1 text-slate-800 leading-none">{r.nombre} {r.apellido}</h3>
                      <div className="text-orange-600 font-black text-sm flex items-center gap-2 bg-orange-50 w-fit px-3 py-1 rounded-full">
                        <Phone size={14} /> {r.telefono}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-5 rounded-3xl flex flex-col items-center border border-slate-100">
                        <Clock size={18} className="text-slate-300 mb-2" />
                        <span className="text-[9px] font-black text-slate-300 uppercase mb-1 tracking-widest">Hora</span>
                        <span className="font-black text-sm uppercase text-slate-700">{r.hora}</span>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-3xl flex flex-col items-center border border-slate-100">
                        <CalendarDays size={18} className="text-slate-300 mb-2" />
                        <span className="text-[9px] font-black text-slate-300 uppercase mb-1 tracking-widest">Fecha</span>
                        <span className="font-black text-sm uppercase text-slate-700">{r.fecha}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button 
                        className="flex-1 bg-slate-900 hover:bg-green-600 text-white font-black uppercase italic rounded-2xl h-14 transition-all" 
                        onClick={() => confirm("¿Marcar como finalizada?") && remove(ref(db, `reservas/${r.id}`))}
                      >
                        <CheckCircle2 size={18} className="mr-2" /> Atendido
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-14 h-14 rounded-2xl border-slate-100 text-slate-300 hover:text-red-600 hover:bg-red-50" 
                        onClick={() => confirm("¿Eliminar reserva?") && remove(ref(db, `reservas/${r.id}`))}
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>
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
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">Configuración</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Personaliza tu experiencia RestoWeb</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TARJETA QR */}
            <Link to="/admin/qrs" className="group">
              <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 hover:ring-4 ring-orange-500 transition-all h-full relative overflow-hidden flex flex-col">
                <div className="bg-orange-500 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-orange-200 group-hover:rotate-12 transition-transform">
                  <QrCode className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase italic text-slate-800 mb-3 leading-none">Generador de QRs</h3>
                <p className="text-sm font-bold text-slate-400 uppercase leading-relaxed mb-8">Administra las mesas y descarga los códigos para tus clientes.</p>
                <div className="mt-auto flex items-center text-orange-600 font-black text-xs uppercase italic gap-2">
                  Configurar mesas <ArrowRight size={16} />
                </div>
                <QrCode className="absolute -right-8 -bottom-8 text-slate-50 size-48 -rotate-12 group-hover:text-orange-50 transition-colors" />
              </Card>
            </Link>

            {/* TARJETA TEMAS */}
            <Card className="rounded-[3rem] border-none shadow-xl bg-white p-10 relative overflow-hidden group flex flex-col">
               <div className="bg-blue-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-200 group-hover:rotate-12 transition-transform">
                  <Palette className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase italic text-slate-800 mb-3 leading-none">Identidad Visual</h3>
                <p className="text-sm font-bold text-slate-400 uppercase leading-relaxed mb-8">Elegí el color que mejor represente tu marca en San Vicente.</p>
                
                <div className="flex gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-600 border-4 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform" />
                  <div className="w-10 h-10 rounded-2xl bg-red-600 border-4 border-white shadow-lg cursor-pointer opacity-30 hover:opacity-100 hover:scale-125 transition-transform" />
                  <div className="w-10 h-10 rounded-2xl bg-green-600 border-4 border-white shadow-lg cursor-pointer opacity-30 hover:opacity-100 hover:scale-125 transition-transform" />
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 border-4 border-white shadow-lg cursor-pointer opacity-30 hover:opacity-100 hover:scale-125 transition-transform" />
                </div>
                
                <Palette className="absolute -right-8 -bottom-8 text-slate-50 size-48 -rotate-12 group-hover:text-blue-50 transition-colors" />
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
