import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, QrCode, UploadCloud, UtensilsCrossed, Edit3, Save, X, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { ref, push, remove, update } from "firebase/database"
import { db } from "../lib/firebase"
import { toast } from "sonner"

// CATEGORÍAS EXACTAS SOLICITADAS
const CATEGORIAS_MENU = [
  "Entradas", "Principales", "Pastas caseras", "Sandwiches", 
  "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", 
  "Postres", "Cerveza", "Vinos", "Gaseosas"
];

const SUBSALSAS = ["Salsa Bologna", "Salsa Blanca", "Ambas", "Sin Salsa"];

export default function Admin({ productos }: { productos: any[] }) {
  const [nuevo, setNuevo] = useState({ 
    nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" 
  })
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ precio: "", descripcion: "" })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => setNuevo(prev => ({ ...prev, imagen: reader.result as string }));
  };

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevo.nombre || !nuevo.precio || !nuevo.imagen) return toast.error("Completá nombre, precio y foto");
    try {
      await push(ref(db, 'productos'), { ...nuevo, precio: Number(nuevo.precio) });
      setNuevo({ nombre: "", precio: "", categoria: "Principales", imagen: "", descripcion: "" });
      toast.success("¡Plato publicado!");
    } catch (e) { toast.error("Error al guardar"); }
  }

  const iniciarEdicion = (p: any) => {
    setEditandoId(p.id);
    setEditForm({ precio: p.precio.toString(), descripcion: p.descripcion || "" });
  }

  const guardarEdicion = async (id: string) => {
    try {
      await update(ref(db, `productos/${id}`), {
        precio: Number(editForm.precio),
        descripcion: editForm.descripcion
      });
      setEditandoId(null);
      toast.success("Actualizado correctamente");
    } catch (e) { toast.error("Error al actualizar"); }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto mb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Gestión RestoWeb</h1>
        <Link to="/admin/qrs"><Button className="bg-orange-600 font-black uppercase rounded-xl h-12 px-8 shadow-lg shadow-orange-100"><QrCode className="mr-2"/> Panel QRs</Button></Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* FORMULARIO DE CARGA */}
        <div className="xl:col-span-1">
          <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden sticky top-28">
            <div className="bg-slate-900 p-6 text-center"><h2 className="text-white font-black uppercase italic tracking-widest text-xs">Nuevo Item al Menú</h2></div>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Foto del Producto</label>
                {nuevo.imagen ? (
                  <div className="relative h-44 rounded-3xl overflow-hidden border-2 border-slate-50 group">
                    <img src={nuevo.imagen} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setNuevo(prev => ({...prev, imagen: ""}))} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="text-white" /></button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-100 rounded-3xl h-44 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/30 transition-all group">
                    <UploadCloud className="text-slate-200 group-hover:text-orange-500 mb-2" size={32} />
                    <span className="text-[10px] font-black uppercase text-slate-400">Subir Imagen</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Input className="rounded-2xl border-slate-100 h-12 font-bold" placeholder="Nombre del plato" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                </div>
                <Input className="rounded-2xl border-slate-100 h-12 font-bold" type="number" placeholder="Precio $" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} />
                <select className="border border-slate-100 rounded-2xl h-12 px-4 text-xs font-black uppercase bg-slate-50" value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                  {CATEGORIAS_MENU.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {nuevo.categoria === "Pastas caseras" && (
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <p className="text-[9px] font-black uppercase text-orange-600 mb-2 italic">Subcategoría (Salsas automáticas)</p>
                  <div className="flex flex-wrap gap-2">
                    {SUBSALSAS.map(s => <Badge key={s} variant="outline" className="bg-white text-[8px] font-black">{s}</Badge>)}
                  </div>
                </div>
              )}

              <textarea className="w-full border border-slate-100 rounded-2xl p-4 text-sm font-bold min-h-[100px] outline-none shadow-inner" placeholder="Descripción / Ingredientes..." value={nuevo.descripcion} onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} />
              <Button onClick={agregar} className="w-full bg-slate-900 h-16 font-black uppercase rounded-2xl shadow-xl hover:bg-orange-600 transition-all"><Plus className="mr-2"/> Publicar Plato</Button>
            </CardContent>
          </Card>
        </div>

        {/* LISTADO CON EDICIÓN EN LÍNEA */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center gap-4 ml-6 mb-4">
            <UtensilsCrossed className="text-orange-600" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Menú Publicado</h2>
          </div>

          {productos.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col md:flex-row gap-6 items-center group hover:shadow-md transition-all">
              <img src={p.imagen} className="w-24 h-24 rounded-[2rem] object-cover shadow-inner" />
              
              <div className="flex-1 space-y-2 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <p className="font-black uppercase italic text-lg tracking-tighter">{p.nombre}</p>
                  <Badge className="w-fit mx-auto md:mx-0 bg-slate-100 text-slate-400 font-black text-[9px] border-none uppercase">{p.categoria}</Badge>
                </div>

                {editandoId === p.id ? (
                  <div className="space-y-3 mt-2">
                    <Input className="h-10 rounded-xl font-bold border-orange-200" type="number" value={editForm.precio} onChange={e => setEditForm({...editForm, precio: e.target.value})} />
                    <textarea className="w-full border border-orange-200 rounded-xl p-3 text-xs font-bold" value={editForm.descripcion} onChange={e => setEditForm({...editForm, descripcion: e.target.value})} />
                  </div>
                ) : (
                  <div>
                    <p className="text-xl font-black text-orange-600 italic tracking-tighter">${p.precio}</p>
                    <p className="text-[10px] font-bold text-slate-400 italic line-clamp-1">{p.descripcion || "Sin descripción cargada"}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {editandoId === p.id ? (
                  <>
                    <Button onClick={() => guardarEdicion(p.id)} className="bg-green-600 rounded-xl h-12 w-12 p-0"><Save size={20}/></Button>
                    <Button onClick={() => setEditandoId(null)} variant="ghost" className="rounded-xl h-12 w-12 p-0 border border-slate-100"><X size={20}/></Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => iniciarEdicion(p)} variant="ghost" className="text-slate-300 hover:text-orange-600 hover:bg-orange-50 rounded-xl h-12 w-12 p-0"><Edit3 size={20}/></Button>
                    <Button onClick={() => confirm("¿Eliminar?") && remove(ref(db, `productos/${p.id}`))} variant="ghost" className="text-slate-200 hover:text-red-600 hover:bg-red-50 rounded-xl h-12 w-12 p-0"><Trash2 size={20}/></Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
