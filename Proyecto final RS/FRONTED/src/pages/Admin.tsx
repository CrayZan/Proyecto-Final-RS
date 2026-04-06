import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, QrCode, UploadCloud, UtensilsCrossed, Edit3, Save, X, Megaphone, Star } from "lucide-react"
import { Link } from "react-router-dom"
import { ref, push, remove, update, onValue, set } from "firebase/database"
import { db } from "../lib/firebase"
import { toast } from "sonner"

const CATEGORIAS_MENU = [
  "Entradas", "Principales", "Pastas caseras", "Sandwiches", 
  "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", 
  "Postres", "Cerveza", "Vinos", "Gaseosas"
];

export default function Admin({ productos }: { productos: any[] }) {
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ precio: "", descripcion: "" })
  
  // ESTADO PARA LA PROMO
  const [promo, setPromo] = useState({ activa: false, titulo: "", mensaje: "", imagen: "" })

  // LEER PROMO ACTUAL
  useEffect(() => {
    const promoRef = ref(db, 'config/promo');
    onValue(promoRef, (snapshot) => {
      if (snapshot.exists()) setPromo(snapshot.val());
    });
  }, [])

  // GUARDAR PROMO (Sincronización total)
  const guardarPromo = async () => {
    try {
      await set(ref(db, 'config/promo'), promo);
      toast.success("Promoción actualizada y sincronizada");
    } catch (e) {
      toast.error("Error al sincronizar promo");
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
      
      {/* SECCIÓN PROMO TEMPORAL */}
      <Card className="mb-10 rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white overflow-hidden border-b-4 border-orange-600">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-500">
              <Megaphone size={20} className="animate-pulse" />
              <h2 className="font-black uppercase italic text-xl tracking-tighter text-white">Anuncio del Día</h2>
            </div>
            <Input className="bg-white/10 border-white/10 text-white h-12 rounded-xl" placeholder="Título (Ej: ¡SÁBADO DE PIZZAS!)" value={promo.titulo} onChange={e => setPromo({...promo, titulo: e.target.value})} />
            <textarea className="w-full bg-white/10 border-white/10 text-white rounded-xl p-3 text-sm min-h-[80px] outline-none" placeholder="Descripción de la oferta..." value={promo.mensaje} onChange={e => setPromo({...promo, mensaje: e.target.value})} />
            <div className="flex gap-4">
              <Button onClick={() => setPromo({...promo, activa: !promo.activa})} className={`${promo.activa ? 'bg-orange-600' : 'bg-slate-700'} font-black rounded-xl uppercase flex-1 h-12`}>
                {promo.activa ? "OFERTA VISIBLE" : "OFERTA OCULTA"}
              </Button>
              <Button onClick={guardarPromo} className="bg-white text-slate-900 font-black rounded-xl uppercase flex-1 h-12 hover:bg-orange-500 hover:text-white transition-all">Sincronizar</Button>
            </div>
          </div>
          <label className="block h-56 rounded-3xl border-2 border-dashed border-white/20 overflow-hidden relative cursor-pointer group">
             {promo.imagen ? <img src={promo.imagen} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full text-slate-500 font-black uppercase text-[10px]"><UploadCloud className="mb-2" /> Subir Imagen de Promo</div>}
             <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'promo')} />
          </label>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* CARGA DE PRODUCTO */}
        <div className="xl:col-span-1">
          <Card className="rounded-[3rem] border-none shadow-2xl bg-white sticky top-28 overflow-hidden">
            <div className="bg-orange-600 p-6 text-center text-white font-black uppercase text-xs italic tracking-widest">Nuevo Plato</div>
            <CardContent className="p-8 space-y-4">
                <label className="block h-40 border-2 border-dashed border-slate-100 rounded-3xl overflow-hidden cursor-pointer">
                  {nuevo.imagen ? <img src={nuevo.imagen} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center justify-center h-full text-slate-300"><UploadCloud /><span className="text-[10px] font-black uppercase">Foto del Producto</span></div>}
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
                <Button onClick={agregar} className="w-full bg-slate-900 h-16 font-black uppercase rounded-2xl shadow-xl hover:bg-orange-600 transition-all"><Plus className="mr-2"/> Publicar Plato</Button>
            </CardContent>
          </Card>
        </div>

        {/* LISTADO */}
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
  )
}
