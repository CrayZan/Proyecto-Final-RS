import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, Trash2, UploadCloud, Edit3, Save, Megaphone, 
  Star, DollarSign, CalendarDays, Users, Phone, Clock, 
  CheckCircle2, LayoutDashboard, Utensils 
} from "lucide-react"
import { ref, push, remove, update, onValue, set } from "firebase/database"
import { db } from "../lib/firebase"
import { toast } from "sonner"

const CATEGORIAS_MENU = [
  "Entradas", "Principales", "Pastas caseras", "Sandwiches", 
  "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", 
  "Postres", "Cerveza", "Vinos", "Gaseosas"
];

export default function Admin({ productos }: { productos: any[] }) {
  const [tab, setTab] = useState<'menu' | 'reservas'>('menu')
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ precio: "", descripcion: "" })
  const [promo, setPromo] = useState({ activa: false, titulo: "", mensaje: "", imagen: "", precio: "" })
  const [reservas, setReservas] = useState<any[]>([])

  // Cargar Promo y Reservas
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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto mb-20 animate-in fade-in duration-500">
      
      {/* SELECTOR DE PESTAÑAS (Estilo Moderno) */}
      <div className="flex bg-white p-2 rounded-[2rem] shadow-sm mb-8 max-w-md mx-auto border border-slate-100">
        <button 
          onClick={() => setTab('menu')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-black uppercase italic text-xs transition-all ${tab === 'menu' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Utensils size={16} /> Menú y Promo
        </button>
        <button 
          onClick={() => setTab('reservas')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-black uppercase italic text-xs transition-all ${tab === 'reservas' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <CalendarDays size={16} /> Reservas ({reservas.length})
        </button>
      </div>

      {tab === 'menu' ? (
        <div className="space-y-10">
          {/* SECCIÓN PROMO */}
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white overflow-hidden border-b-4 border-orange-600">
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-500">
                  <Megaphone size={20} className="animate-pulse" />
                  <h2 className="font-black uppercase italic text-xl tracking-tighter text-white">Anuncio del Día</h2>
                </div>
                <Input className="bg-white/10 border-white/10 text-white h-12 rounded-xl" placeholder="Título Promo" value={promo.titulo} onChange={e => setPromo({...promo, titulo: e.target.value})} />
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-3.5 text-orange-500" size={16} />
                    <Input className="bg-white/10 border-white/10 text-white h-12 rounded-xl pl-10" placeholder="Precio" type="number" value={promo.precio} onChange={e => setPromo({...promo, precio: e.target.value})} />
                  </div>
                  <textarea className="flex-[2] bg-white/10 border-white/10 text-white rounded-xl p-3 text-sm min-h-[48px] outline-none" placeholder="Descripción..." value={promo.mensaje} onChange={e => setPromo({...promo, mensaje: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => setPromo({...promo, activa: !promo.activa})} className={`${promo.activa ? 'bg-orange-600' : 'bg-slate-700'} font-black rounded-xl uppercase flex-1 h-12`}>
                    {promo.activa ? "OFERTA VISIBLE" : "OFERTA OCULTA"}
                  </Button>
                  <Button onClick={guardarPromo} className="bg-white text-slate-900 font-black rounded-xl uppercase flex-1 h-12 hover:bg-orange-500 transition-all">Sincronizar</Button>
                </div>
              </div>
              <label className="block h-56 rounded-3xl border-2 border-dashed border-white/20 overflow-hidden relative cursor-pointer group">
                 {promo.imagen ? <img src={promo.imagen} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full text-slate-500 font-black uppercase text-[10px]"><UploadCloud className="mb-2" /> Subir Imagen</div>}
                 <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'promo')} />
              </label>
            </div>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
            <div className="xl:col-span-1">
              <Card className="rounded-[3rem] border-none shadow-2xl bg-white sticky top-28 overflow-hidden">
                <div className="bg-orange-600 p-6 text-center text-white font-black uppercase text-xs italic tracking-widest">Nuevo Plato</div>
                <CardContent className="p-8 space-y-4">
                    <label className="block h-40 border-2 border-dashed border-slate-100 rounded-3xl overflow-hidden cursor-pointer">
                      {nuevo.imagen ? <img src={nuevo.imagen} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full text-slate-300"><UploadCloud /><span className="text-[10px] font-black uppercase">Foto</span></div>}
                      <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'producto')} />
                    </label>
                    <Input className="rounded-2xl h-12 font-bold" placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input className="rounded-2xl h-12 font-bold" type="number" placeholder="Precio $" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} />
                      <select className="border border-slate-100 rounded-2xl h-12 px-4 text-xs font-black uppercase bg-slate-50" value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                        {CATEGORIAS_MENU.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <textarea className="w-full border border-slate-100 rounded-2xl p-4 text-sm font-bold min-h-[80px]" placeholder="Ingredientes..." value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} />
                    <Button onClick={agregar} className="w-full bg-slate-900 h-16 font-black uppercase rounded-2xl shadow-xl hover:bg-orange-600 transition-all"><Plus className="mr-2"/> Publicar</Button>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-2 space-y-4">
              <h2 className="text-2xl font-black uppercase italic ml-4 flex items-center gap-2"><Star className="text-orange-600"/> Menú del Día</h2>
              {productos.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-4 group hover:shadow-md transition-all">
                  <img src={p.imagen} className="w-20 h-20 rounded-2xl object-cover shadow-inner" />
                  <div className="flex-1">
                    <p className="font-black uppercase italic text-sm text-slate-800">{p.nombre}</p>
                    {editandoId === p.id ? (
                      <div className="flex gap-2 mt-2">
                        <Input className="h-8 text-xs font-bold border-orange-200" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})} />
                        <Button onClick={() => guardarEdicion(p.id)} className="h-8 bg-green-600 rounded-lg"><Save size={14}/></Button>
                      </div>
                    ) : (
                      <p className="text-orange-600 font-black italic tracking-tighter">${p.precio}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button onClick={() => { setEditandoId(p.id); setEditForm({precio: p.precio.toString(), descripcion: p.descripcion}) }} variant="ghost" className="text-slate-200 hover:text-orange-600"><Edit3 size={18}/></Button>
                    <Button onClick={() => confirm("¿Borrar?") && remove(ref(db, `productos/${p.id}`))} variant="ghost" className="text-slate-100 hover:text-red-600"><Trash2 size={18}/></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* SECCIÓN RESERVAS */
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-8 px-4">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <CalendarDays size={32} className="text-orange-600" /> Reservas Pendientes
            </h2>
            <Badge className="bg-slate-900 px-6 py-2 rounded-full font-black italic">{reservas.length} ACTIVAS</Badge>
          </div>

          {reservas.length === 0 ? (
            <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <CalendarDays size={64} className="mx-auto text-slate-100 mb-4" />
               <p className="font-black uppercase italic text-slate-300">No hay reservas para hoy</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservas.map(r => (
                <Card key={r.id} className="rounded-[2.5rem] border-none shadow-lg bg-white overflow-hidden hover:shadow-2xl transition-all group">
                  <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-600 p-2 rounded-xl text-white shadow-lg rotate-3">
                        <Users size={18} />
                      </div>
                      <span className="font-black text-xl italic tracking-tighter text-slate-900">{r.comensales} PERSONAS</span>
                    </div>
                    <button 
                      onClick={() => confirm("¿Eliminar reserva?") && remove(ref(db, `reservas/${r.id}`))}
                      className="text-slate-200 hover:text-red-600 transition-colors p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-1">
                      <h3 className="font-black uppercase italic text-lg leading-none">{r.nombre} {r.apellido}</h3>
                      <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                        <Phone size={14} /> {r.telefono}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-100">
                        <CalendarDays size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Fecha</span>
                        <span className="font-black text-xs uppercase">{r.fecha}</span>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-100">
                        <Clock size={16} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Hora</span>
                        <span className="font-black text-xs uppercase">{r.hora}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-slate-100 hover:bg-green-600 hover:text-white text-slate-400 font-black uppercase italic rounded-2xl h-12 transition-all shadow-sm flex gap-2"
                      onClick={() => confirm("¿Marcar como cumplida?") && remove(ref(db, `reservas/${r.id}`))}
                    >
                      <CheckCircle2 size={18} /> Finalizar Reserva
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
