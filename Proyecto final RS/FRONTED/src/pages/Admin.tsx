import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Edit, Trash2, Search, Save, PackagePlus, ImageIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

const CATEGORIAS = ["Entradas", "Principales", "Pastas caseras", "Sandwiches", "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", "Postres", "Cervezas", "Vinos", "Gaseosas", "Tragos"]

export default function Admin({ productos, setProductos }: { productos: any[], setProductos: any }) {
  const [busqueda, setBusqueda] = useState("")
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoPrecio, setNuevoPrecio] = useState("")
  const [nuevaImagen, setNuevaImagen] = useState("") // NUEVO ESTADO PARA IMAGEN
  const [nuevaCat, setNuevaCat] = useState("Principales")
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)

  const agregarProducto = () => {
    if (!nuevoNombre || !nuevoPrecio) return toast.error("Completa nombre y precio");
    
    const nuevo = { 
      id: Date.now(), 
      nombre: nuevoNombre, 
      precio: Number(nuevoPrecio), 
      categoria: nuevaCat,
      imagen: nuevaImagen || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format" // Imagen por defecto si está vacío
    }

    setProductos([...productos, nuevo])
    setModalNuevoAbierto(false)
    setNuevoNombre(""); setNuevoPrecio(""); setNuevaImagen("");
    toast.success("¡Producto con foto creado!");
  }

  const eliminarProducto = (id: number) => {
    if(confirm("¿Eliminar?")) {
      setProductos(productos.filter((p: any) => p.id !== id))
      toast.error("Eliminado")
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Menú Visual</h1>
        
        <Dialog open={modalNuevoAbierto} onOpenChange={setModalNuevoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 shadow-xl h-12 px-6 font-bold uppercase">
              <Plus className="mr-2 h-5 w-5" /> Agregar con Foto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Producto</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Nombre</Label><Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} /></div>
              <div className="grid gap-2"><Label>Precio</Label><Input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} /></div>
              <div className="grid gap-2">
                <Label>URL de la Imagen (Link)</Label>
                <div className="flex gap-2">
                  <Input value={nuevaImagen} onChange={(e) => setNuevaImagen(e.target.value)} placeholder="https://ejemplo.com/foto.jpg" />
                  <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center border text-slate-400">
                    <ImageIcon size={20} />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">Pega aquí el enlace de una foto de Google o Unsplash.</p>
              </div>
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)}>
                  {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter><Button onClick={agregarProducto} className="bg-orange-600 w-full h-12 font-bold">CREAR PRODUCTO</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900"><TableRow>
              <TableHead className="text-white">Imagen</TableHead>
              <TableHead className="text-white">Producto</TableHead>
              <TableHead className="text-right text-white">Acciones</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {productos.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img src={p.imagen} alt={p.nombre} className="w-12 h-12 rounded-lg object-cover border shadow-sm" />
                  </TableCell>
                  <TableCell className="font-bold text-slate-700">{p.nombre}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => eliminarProducto(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="mt-4"><Button variant="ghost" asChild><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link></Button></div>
    </div>
  )
}
