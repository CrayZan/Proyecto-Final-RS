import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Upload, Edit, Save, X } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

const CATEGORIAS = ["Entradas", "Principales", "Pastas caseras", "Sandwiches", "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", "Postres", "Cervezas", "Vinos", "Gaseosas", "Tragos"]

// COMPONENTE PARA EDITAR PRECIO
function ModalEditar({ producto, alGuardar }: { producto: any, alGuardar: Function }) {
  const [precioTemporal, setPrecioTemporal] = useState(producto.precio);
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100 border-slate-200">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar Precio: {producto.nombre}</DialogTitle></DialogHeader>
        <div className="py-4 space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">Monto en ARS</Label>
          <Input 
            type="number" 
            value={precioTemporal} 
            onChange={(e) => setPrecioTemporal(e.target.value)} 
            className="text-lg font-bold"
          />
        </div>
        <DialogFooter>
          <Button onClick={() => { alGuardar(producto.id, Number(precioTemporal)); setAbierto(false); }} className="bg-slate-900 w-full h-12 font-bold">
            <Save className="mr-2 h-4 w-4" /> ACTUALIZAR
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Admin({ productos, setProductos }: { productos: any[], setProductos: any }) {
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoPrecio, setNuevoPrecio] = useState("")
  const [nuevaCat, setNuevaCat] = useState("Principales")
  const [imagenBase64, setImagenBase64] = useState("")
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)

  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) {
      const reader = new FileReader()
      reader.onloadend = () => { setImagenBase64(reader.result as string); toast.success("Foto cargada"); }
      reader.readAsDataURL(archivo)
    }
  }

  const agregarProducto = () => {
    if (!nuevoNombre || !nuevoPrecio) return toast.error("Completa los datos")
    const nuevo = { 
      id: Date.now(), 
      nombre: nuevoNombre.toUpperCase(), 
      precio: Number(nuevoPrecio), 
      categoria: nuevaCat,
      imagen: imagenBase64 || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500" 
    }
    setProductos([...productos, nuevo])
    setModalNuevoAbierto(false)
    setNuevoNombre(""); setNuevoPrecio(""); setImagenBase64("");
    toast.success("¡Producto creado!")
  }

  const actualizarPrecio = (id: number, nuevoPrecio: number) => {
    setProductos(productos.map((p: any) => p.id === id ? { ...p, precio: nuevoPrecio } : p))
    toast.success("Precio actualizado")
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gestión de Menú</h1>
        
        <Dialog open={modalNuevoAbierto} onOpenChange={setModalNuevoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 h-12 px-6 font-bold uppercase shadow-lg">
              <Plus className="mr-2 h-5 w-5" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Nuevo Item</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4 text-left">
              <div className="grid gap-2"><Label>Nombre</Label><Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} /></div>
              <div className="grid gap-2"><Label>Precio</Label><Input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} /></div>
              <div className="grid gap-2">
                <Label>Imagen</Label>
                <div className="border-2 border-dashed rounded-xl p-4 bg-slate-50 relative flex items-center justify-center min-h-[100px]">
                  {imagenBase64 ? (
                    <div className="relative w-full h-32">
                      <img src={imagenBase64} className="w-full h-full object-cover rounded-lg" alt="Previa" />
                      <button onClick={() => setImagenBase64("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14}/></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-8 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-400">SUBIR FOTO</span>
                      <input type="file" className="hidden" accept="image/*" onChange={manejarArchivo} />
                    </label>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)}>
                  {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter><Button onClick={agregarProducto} className="bg-orange-600 w-full h-12 font-bold uppercase">Guardar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow>
                <TableHead className="text-white text-xs uppercase font-black">Imagen</TableHead>
                <TableHead className="text-white text-xs uppercase font-black">Nombre</TableHead>
                <TableHead className="text-right text-white text-xs uppercase font-black pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <img src={p.imagen} alt={p.nombre} className="w-14 h-14 rounded-lg object-cover border bg-white" />
                  </TableCell>
                  <TableCell>
                    <div className="font-black text-slate-800 uppercase text-sm leading-none">{p.nombre}</div>
                    <div className="text-orange-600 font-bold text-xs mt-1">${p.precio.toLocaleString('es-AR')}</div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      {/* REINCORPORAMOS EL MODAL DE EDICIÓN */}
                      <ModalEditar producto={p} alGuardar={actualizarPrecio} />

                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 border-slate-200" 
                        onClick={() => setProductos(productos.filter((i:any) => i.id !== p.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="mt-6"><Button variant="ghost" asChild><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link></Button></div>
    </div>
  )
}
