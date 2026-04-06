import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Upload, Edit, Save, X, QrCode } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

const CATEGORIAS = ["Entradas", "Principales", "Pastas caseras", "Sandwiches", "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", "Postres", "Cervezas", "Vinos", "Gaseosas", "Tragos"]

function ModalEditar({ producto, alGuardar }: { producto: any, alGuardar: Function }) {
  const [precioTemporal, setPrecioTemporal] = useState(producto.precio);
  const [descTemporal, setDescTemporal] = useState(producto.descripcion || "");
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 text-slate-600 border-slate-200"><Edit className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle className="uppercase font-black tracking-tighter">Editar: {producto.nombre}</DialogTitle></DialogHeader>
        <div className="py-4 space-y-4 text-left">
          <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-400">Precio (ARS)</Label><Input type="number" value={precioTemporal} onChange={(e) => setPrecioTemporal(e.target.value)} className="font-bold border-orange-100" /></div>
          <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-400">Descripción</Label><Textarea value={descTemporal} onChange={(e) => setDescTemporal(e.target.value)} className="resize-none h-24 border-orange-100" /></div>
        </div>
        <DialogFooter><Button onClick={() => { alGuardar(producto.id, Number(precioTemporal), descTemporal); setAbierto(false); }} className="bg-slate-900 w-full h-12 font-black uppercase">Guardar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Admin({ productos, setProductos }: { productos: any[], setProductos: any }) {
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoPrecio, setNuevoPrecio] = useState("")
  const [nuevaDescripcion, setNuevaDescripcion] = useState("")
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
    if (!nuevoNombre || !nuevoPrecio) return toast.error("Faltan datos")
    const nuevo = { id: Date.now(), nombre: nuevoNombre.toUpperCase(), precio: Number(nuevoPrecio), descripcion: nuevaDescripcion, categoria: nuevaCat, imagen: imagenBase64 || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500" }
    setProductos([...productos, nuevo])
    setModalNuevoAbierto(false)
    setNuevoNombre(""); setNuevoPrecio(""); setNuevaDescripcion(""); setImagenBase64("");
    toast.success("Producto creado")
  }

  const guardarEdicion = (id: number, nuevoPrecio: number, nuevaDesc: string) => {
    setProductos(productos.map((p: any) => p.id === id ? { ...p, precio: nuevoPrecio, descripcion: nuevaDesc } : p))
    toast.success("Actualizado")
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Panel Admin</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestión de Carta y Mesas</p>
        </div>
        
        <div className="flex gap-2">
          {/* BOTÓN NUEVO PARA IR A LOS QRs */}
          <Link to="/admin/qrs">
            <Button variant="outline" className="h-12 border-slate-200 font-black uppercase text-xs">
              <QrCode className="mr-2 h-4 w-4 text-orange-600" /> Mesas
            </Button>
          </Link>

          <Dialog open={modalNuevoAbierto} onOpenChange={setModalNuevoAbierto}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 h-12 px-6 font-black uppercase text-xs shadow-lg">
                <Plus className="mr-2 h-5 w-5" /> Nuevo Plato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-black uppercase">Cargar Producto</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-4 text-left">
                <div className="grid gap-1"><Label className="text-[10px] font-black uppercase">Nombre</Label><Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} /></div>
                <div className="grid gap-1"><Label className="text-[10px] font-black uppercase">Precio</Label><Input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} /></div>
                <div className="grid gap-1"><Label className="text-[10px] font-black uppercase">Descripción</Label><Textarea value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} className="resize-none h-20" /></div>
                <div className="grid gap-1">
                  <Label className="text-[10px] font-black uppercase">Imagen</Label>
                  <div className="border-2 border-dashed rounded-xl p-3 bg-slate-50 relative flex items-center justify-center min-h-[80px]">
                    {imagenBase64 ? (
                      <div className="relative w-full h-24">
                        <img src={imagenBase64} className="w-full h-full object-cover rounded-lg" alt="Previa" />
                        <button onClick={() => setImagenBase64("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-6 text-slate-400 mb-1" />
                        <span className="text-[9px] font-black text-slate-400 uppercase">Subir Foto</span>
                        <input type="file" className="hidden" accept="image/*" onChange={manejarArchivo} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="grid gap-1">
                  <Label className="text-[10px] font-black uppercase">Categoría</Label>
                  <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold uppercase" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)}>
                    {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <DialogFooter><Button onClick={agregarProducto} className="bg-orange-600 w-full h-12 font-black uppercase">Guardar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow>
              <TableHead className="text-white text-[10px] uppercase font-black pl-8">Item / Detalles</TableHead>
              <TableHead className="text-right text-white text-[10px] uppercase font-black pr-8">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productos.map((p: any) => (
              <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="py-5 pl-8">
                  <div className="flex gap-4 items-center">
                    <img src={p.imagen} alt={p.nombre} className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-slate-100" />
                    <div>
                      <div className="font-black text-slate-900 uppercase text-sm tracking-tighter italic">{p.nombre}</div>
                      <div className="text-orange-600 font-black text-xs">${p.precio.toLocaleString('es-AR')}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex justify-end gap-2">
                    <ModalEditar producto={p} alGuardar={guardarEdicion} />
                    <Button variant="outline" size="icon" className="h-9 w-9 text-red-400 border-slate-200" onClick={() => setProductos(productos.filter((i:any) => i.id !== p.id))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
