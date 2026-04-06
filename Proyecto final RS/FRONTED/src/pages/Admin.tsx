import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2, Upload, ImageIcon, X } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

const CATEGORIAS = ["Entradas", "Principales", "Pastas caseras", "Sandwiches", "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", "Postres", "Cervezas", "Vinos", "Gaseosas", "Tragos"]

export default function Admin({ productos, setProductos }: { productos: any[], setProductos: any }) {
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoPrecio, setNuevoPrecio] = useState("")
  const [nuevaCat, setNuevaCat] = useState("Principales")
  const [imagenBase64, setImagenBase64] = useState("") // Aquí guardamos la foto real
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)

  // Función mágica para leer el archivo del dispositivo
  const manejarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenBase64(reader.result as string) // Convertimos la foto en texto para guardarla
        toast.success("Foto cargada con éxito")
      }
      reader.readAsDataURL(archivo)
    }
  }

  const agregarProducto = () => {
    if (!nuevoNombre || !nuevoPrecio) return toast.error("Faltan datos")
    
    const nuevo = { 
      id: Date.now(), 
      nombre: nuevoNombre, 
      precio: Number(nuevoPrecio), 
      categoria: nuevaCat,
      imagen: imagenBase64 || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500" 
    }

    setProductos([...productos, nuevo])
    setModalNuevoAbierto(false)
    setNuevoNombre(""); setNuevoPrecio(""); setImagenBase64("");
    toast.success("Producto guardado en el sistema")
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase">Administrar Stock</h1>
        
        <Dialog open={modalNuevoAbierto} onOpenChange={setModalNuevoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 h-12 px-6 font-bold uppercase shadow-lg">
              <Plus className="mr-2 h-5 w-5" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Cargar Producto Nuevo</DialogTitle></DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nombre del Plato</Label>
                <Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Precio (ARS)</Label>
                <Input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} />
              </div>

              {/* SELECTOR DE ARCHIVOS DEL DISPOSITIVO */}
              <div className="grid gap-2">
                <Label>Foto del Producto</Label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors relative">
                  {imagenBase64 ? (
                    <div className="relative w-full h-40">
                      <img src={imagenBase64} className="w-full h-full object-cover rounded-lg" alt="Vista previa" />
                      <button 
                        onClick={() => setImagenBase64("")}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer w-full py-4">
                      <Upload className="h-10 w-10 text-slate-400 mb-2" />
                      <span className="text-sm font-medium text-slate-500">Elegir de Galería o PC</span>
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

            <DialogFooter>
              <Button onClick={agregarProducto} className="bg-orange-600 w-full h-12 font-black uppercase">Guardar Producto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-900">
              <TableRow>
                <TableHead className="text-white">Imagen</TableHead>
                <TableHead className="text-white">Nombre</TableHead>
                <TableHead className="text-right text-white">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img src={p.imagen} alt={p.nombre} className="w-14 h-14 rounded-lg object-cover border" />
                  </TableCell>
                  <TableCell className="font-bold text-slate-700 uppercase">{p.nombre}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-400" onClick={() => setProductos(productos.filter((i:any) => i.id !== p.id))}><Trash2 className="h-4 w-4" /></Button>
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
