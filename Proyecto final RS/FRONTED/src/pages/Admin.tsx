import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, QrCode } from "lucide-react"
import { Link } from "react-router-dom"
import { ref, push, remove } from "firebase/database"
import { db } from "../lib/firebase"
import { toast } from "sonner"

export default function Admin({ productos }: { productos: any[] }) {
  const [nuevo, setNuevo] = useState({ 
    nombre: "", 
    precio: "", 
    categoria: "Comidas", 
    imagen: "", 
    descripcion: "" 
  })

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevo.nombre || !nuevo.precio) return toast.error("Nombre y precio son obligatorios")
    
    try {
      await push(ref(db, 'productos'), {
        ...nuevo,
        precio: Number(nuevo.precio)
      })
      setNuevo({ nombre: "", precio: "", categoria: "Comidas", imagen: "", descripcion: "" })
      toast.success("Producto guardado en la nube")
    } catch (error) {
      toast.error("Error al guardar")
    }
  }

  const borrar = (id: string) => {
    if(confirm("¿Estás seguro de eliminar este producto?")) {
      remove(ref(db, `productos/${id}`))
      toast.info("Producto eliminado")
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Panel Admin</h1>
        <Link to="/admin/qrs">
          <Button variant="outline" className="font-black uppercase text-[10px] rounded-xl border-slate-200 shadow-sm">
            <QrCode size={16} className="mr-2 text-orange-600"/> Generar QRs
          </Button>
        </Link>
      </div>

      <Card className="mb-10 rounded-[2.5rem] border-none shadow-2xl bg-white">
        <CardHeader>
          <CardTitle className="uppercase font-black text-xs text-slate-400 italic tracking-widest text-center">
            Cargar Nuevo Plato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={agregar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Nombre</label>
              <Input className="rounded-xl border-slate-100" placeholder="Ej: Pizza Muzzarella" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Precio ($)</label>
              <Input className="rounded-xl border-slate-100" type="number" placeholder="Ej: 5500" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">URL Imagen</label>
              <Input className="rounded-xl border-slate-100" placeholder="https://..." value={nuevo.imagen} onChange={e => setNuevo({...nuevo, imagen: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Categoría</label>
              <select className="w-full border border-slate-100 rounded-xl p-2 text-sm font-bold bg-white focus:ring-2 ring-orange-500" value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                <option>Comidas</option>
                <option>Bebidas</option>
                <option>Postres</option>
                <option>Promociones</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Descripción (Ingredientes / Tamaño)</label>
              <textarea 
                className="w-full border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-orange-500 min-h-[100px] outline-none"
                placeholder="Ej: Muzzarella, salsa de tomate y aceitunas verdes..."
                value={nuevo.descripcion} 
                onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} 
              />
            </div>
            <Button type="submit" className="md:col-span-2 bg-slate-900 text-white h-14 font-black uppercase rounded-2xl shadow-xl hover:bg-orange-600 transition-colors">
              <Plus className="mr-2"/> Publicar en el Menú
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 mb-20">
        <h2 className="text-xl font-black uppercase italic tracking-tighter ml-2">Productos en Línea</h2>
        {productos.map(p => (
          <div key={p.id} className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-slate-50 group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <img src={p.imagen || "https://placehold.co/100x100?text=Comida"} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <p className="font-black uppercase italic text-sm text-slate-800 tracking-tighter">{p.nombre}</p>
                <p className="text-[10px] text-orange-600 font-black italic">${p.precio.toLocaleString('es-AR')}</p>
                {p.descripcion && <p className="text-[9px] text-slate-400 font-bold truncate max-w-[150px]">{p.descripcion}</p>}
              </div>
            </div>
            <Button variant="ghost" onClick={() => borrar(p.id)} className="text-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
              <Trash2 size={20}/>
            </Button>
          </div>
        ))}
        {productos.length === 0 && (
          <div className="text-center py-10 opacity-20 font-black uppercase text-xs italic tracking-widest">
            No hay productos cargados
          </div>
        )}
      </div>
    </div>
  )
}
