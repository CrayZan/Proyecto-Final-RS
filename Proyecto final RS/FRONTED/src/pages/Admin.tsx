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
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", categoria: "Comidas", imagen: "" })

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevo.nombre || !nuevo.precio) return
    
    try {
      await push(ref(db, 'productos'), {
        ...nuevo,
        precio: Number(nuevo.precio)
      })
      setNuevo({ nombre: "", precio: "", categoria: "Comidas", imagen: "" })
      toast.success("Producto guardado en la nube")
    } catch (error) {
      toast.error("Error al guardar")
    }
  }

  const borrar = (id: string) => {
    remove(ref(db, `productos/${id}`))
    toast.info("Producto eliminado")
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase italic">Panel Admin</h1>
        <Link to="/admin/qrs">
          <Button variant="outline" className="font-black uppercase text-xs"><QrCode className="mr-2"/> Generar QRs</Button>
        </Link>
      </div>

      <Card className="mb-10 rounded-[2rem] border-none shadow-xl">
        <CardHeader><CardTitle className="uppercase font-black text-sm italic">Nuevo Producto</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={agregar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
            <Input placeholder="Precio" type="number" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} />
            <Input placeholder="URL Imagen" value={nuevo.imagen} onChange={e => setNuevo({...nuevo, imagen: e.target.value})} />
            <select className="border rounded-md p-2 text-sm font-bold" value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
              <option>Comidas</option>
              <option>Bebidas</option>
              <option>Postres</option>
            </select>
            <Button type="submit" className="md:col-span-2 bg-orange-600 font-black uppercase rounded-xl"><Plus className="mr-2"/> Agregar al Menú Online</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {productos.map(p => (
          <div key={p.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <img src={p.imagen} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <p className="font-black uppercase italic text-sm">{p.nombre}</p>
                <p className="text-xs text-orange-600 font-bold">${p.precio}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => borrar(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={20}/></Button>
          </div>
        ))}
      </div>
    </div>
  )
}
