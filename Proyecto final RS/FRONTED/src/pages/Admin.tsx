import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Upload, Edit, Save, X } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

const CATEGORIAS = ["Entradas", "Principales", "Pastas caseras", "Sandwiches", "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", "Postres", "Cervezas", "Vinos", "Gaseosas", "Tragos"]

// MODAL ACTUALIZADO: AHORA EDITA PRECIO Y DESCRIPCIÓN
function ModalEditar({ producto, alGuardar }: { producto: any, alGuardar: Function }) {
  const [precioTemporal, setPrecioTemporal] = useState(producto.precio);
  const [descTemporal, setDescTemporal] = useState(producto.descripcion || "");
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 text-slate-600 border-slate-200 hover:bg-orange-50">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="uppercase font-black tracking-tighter">Editar: {producto.nombre}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4 text-left">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Precio (ARS)</Label>
            <Input 
              type="number" 
              value={precioTemporal} 
              onChange={(e) => setPrecioTemporal(e.target.value)} 
              className="font-bold text-lg border-orange-100 focus:ring-orange-500" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Descripción / Ingredientes</Label>
            <Textarea 
              value={descTemporal} 
              onChange={(e) => setDescTemporal(e.target.value)} 
              className="resize-none h-24 border-orange-100"
              placeholder="Ej: Jamón, morrones y aceitunas..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={() => { 
              alGuardar(producto.id, Number(precioTemporal), descTemporal); 
              setAbierto(false); 
            }} 
            className="bg-slate-900 w-full h-12 font-black uppercase tracking-tight"
          >
            <Save className="mr-2 h-4 w-4 text-orange-500" /> Guardar Cambios
          </Button>
        </DialogFooter>
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
    const nuevo = { 
      id: Date.now(), 
      nombre: nuevoNombre.toUpperCase(), 
      precio: Number(nuevoPrecio), 
      descripcion: nuevaDescripcion,
      categoria: nuevaCat,
      imagen: imagenBase64 || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500" 
    }
    setProductos([...productos, nuevo])
    setModalNuevoAbierto(false)
    setNuevoNombre(""); setNuevoPrecio(""); setNuevaDescripcion(""); setImagenBase64("");
    toast.success("Producto creado")
  }

  // FUNCIÓN ACTUALIZADA PARA RECIBIR TAMBIÉN LA DESCRIPCIÓN
  const guardarEdicion = (id: number, nuevoPrecio: number, nuevaDesc: string) => {
    setProductos(productos.map((p: any) => 
      p.id === id ? { ...p, precio: nuevoPrecio, descripcion: nuevaDesc } : p
    ))
    toast.success("Producto actualizado correctamente")
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <Link to="/" className="text-orange-600 font-black text-xs mb-1 hover:underline flex items-center gap-1">
            <ArrowLeft size={12}/> VOLVER AL INICIO
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Gestión de Carta</h1>
        </div>

        <Dialog open={modalNuevoAbierto} onOpenChange={setModalNuevoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 h-12 px-6 font-bold uppercase shadow-lg hover:bg-orange-700 transition-all">
              <Plus className="mr-2 h-5 w-5" /> Nuevo Plato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="font-black uppercase tracking-tighter">Cargar Producto</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4 text-left">
              <div className="grid gap-1"><Label className="text-[10px] font-black uppercase">Nombre</Label><Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej: Pizza Napolitana" /></div>
              <div className="grid gap-1"><Label className="text-[10px] font-black uppercase">Precio</Label><Input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} /></div>
              <div className="grid gap-1"><Label className="text-[10px] font-black uppercase">Descripción</Label><Textarea value={nuevaDescripcion} onChange={(e) => setNuevaDescripcion(e.target.value)} placeholder="Ingredientes..." className="resize-none h-20" /></div>
              <div className="grid gap-1">
                <Label className="text-[10px] font-black uppercase text-slate-400">Imagen</Label>
                <div className="border-2 border-dashed rounded-xl p-3 bg-slate-50 relative flex items-center justify-center min-h-[80px]">
                  {imagenBase64 ? (
                    <div className="relative w-full h-24">
                      <img src={imagenBase64} className="w-full h-full object-cover rounded-lg" alt="Previa" />
                      <button onClick={() => setImagenBase64("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-6 text-slate-400 mb-1" />
                      <span className="text-[10px] font-black text-slate-400">SUBIR FOTO</span>
                      <input type="file" className="hidden" accept="image/*" onChange={manejarArchivo} />
                    </label>
                  )}
                </div>
              </div>
              <div className="grid gap-1">
                <Label className="text-[10px] font-black uppercase">Categoría</Label>
                <select className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)}>
                  {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter><Button onClick={agregarProducto} className="bg-orange-600 w-full h-12 font-black uppercase">Finalizar Carga</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden rounded-3xl bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow>
                <TableHead className="text-white text-[10px] uppercase font-black pl-6">Producto / Descripción</TableHead>
                <TableHead className="text-right text-white text-[10px] uppercase font-black pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-orange-50/30 transition-colors">
                  <TableCell className="py-4 pl-6">
                    <div className="flex gap-4 items-center">
                      <img src={p.imagen} alt={p.nombre} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md bg-white" />
                      <div className="flex flex-col gap-0.5">
                        <div className="font-black text-slate-900 uppercase text-sm tracking-tight">{p.nombre}</div>
                        <div className="text-[11px] text-slate-400 font-bold leading-tight max-w-[250px] italic">
                          {p.descripcion || "Sin detalles cargados"}
                        </div>
                        <div className="text-orange-600 font-black text-sm mt-1 leading-none">${p.precio.toLocaleString('es-AR')}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      {/* ESTE MODAL AHORA PERMITE EDITAR AMBAS COSAS */}
                      <ModalEditar producto={p} alGuardar={guardarEdicion} />
                      
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-9 w-9 text-red-400 border-slate-200 hover:bg-red-50 hover:border-red-100" 
                        onClick={() => { if(confirm(`¿Eliminar ${p.nombre}?`)) setProductos(productos.filter((i:any) => i.id !== p.id)); }}
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
      
      <footer className="mt-8 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">RestoWeb - San Vicente, Misiones</p>
      </footer>
    </div>
  )
}
