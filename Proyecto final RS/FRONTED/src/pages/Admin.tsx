import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Edit, Trash2, Search, Save, PackagePlus } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner" // <-- IMPORTAMOS TOAST

const CATEGORIAS = ["Entradas", "Principales", "Pastas caseras", "Sandwiches", "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", "Postres", "Cervezas", "Vinos", "Gaseosas", "Tragos"]

function ModalEditar({ producto, alGuardar }: { producto: any, alGuardar: Function }) {
  const [precioTemporal, setPrecioTemporal] = useState(producto.precio);
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Editar {producto.nombre}</DialogTitle></DialogHeader>
        <div className="py-4">
          <Label className="text-xs font-bold uppercase">Nuevo precio (ARS)</Label>
          <Input type="number" value={precioTemporal} onChange={(e) => setPrecioTemporal(e.target.value)} className="mt-2" />
        </div>
        <DialogFooter>
          <Button onClick={() => { alGuardar(producto.id, Number(precioTemporal)); setAbierto(false); }} className="bg-slate-900 w-full h-12 font-bold">
            <Save className="mr-2 h-4 w-4" /> GUARDAR CAMBIOS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Admin({ productos, setProductos }: { productos: any[], setProductos: any }) {
  const [busqueda, setBusqueda] = useState("")
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoPrecio, setNuevoPrecio] = useState("")
  const [nuevaCat, setNuevaCat] = useState("Principales")
  const [nuevaSalsa, setNuevaSalsa] = useState("Bolognesa")
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)

  const agregarProducto = () => {
    if (!nuevoNombre || !nuevoPrecio) return toast.error("Error: Completa todos los campos");
    
    const nombreFinal = nuevaCat === "Pastas caseras" ? `${nuevoNombre} (${nuevaSalsa})` : nuevoNombre
    const nuevo = { id: Date.now(), nombre: nombreFinal, precio: Number(nuevoPrecio), categoria: nuevaCat }

    setProductos([...productos, nuevo])
    setModalNuevoAbierto(false)
    setNuevoNombre("")
    setNuevoPrecio("")
    
    toast.success("Producto creado", { description: `${nombreFinal} se añadió al menú.` })
  }

  const eliminarProducto = (id: number, nombre: string) => {
    if(confirm(`¿Borrar ${nombre}?`)) {
      setProductos(productos.filter((p: any) => p.id !== id))
      toast.error("Producto eliminado permanentemente")
    }
  }

  const actualizarPrecio = (id: number, nuevoPrecio: number) => {
    setProductos(productos.map((p: any) => p.id === id ? { ...p, precio: nuevoPrecio } : p))
    toast.success("¡Precio actualizado!", { icon: "💰" })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-2 text-slate-500"><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link></Button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Panel de Control</h1>
        </div>

        <Dialog open={modalNuevoAbierto} onOpenChange={setModalNuevoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 shadow-xl h-12 px-6 font-bold uppercase tracking-tight">
              <PackagePlus className="mr-2 h-5 w-5" /> Nuevo Ítem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Producto</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Nombre</Label><Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej: Milanesa" /></div>
              <div className="grid gap-2"><Label>Precio</Label><Input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} /></div>
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)}>
                  {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              {nuevaCat === "Pastas caseras" && (
                <div className="grid gap-2 p-3 bg-orange-50 rounded-lg">
                  <Label className="text-xs font-bold text-orange-800">SALSA</Label>
                  <select className="h-9 w-full bg-white rounded border border-orange-200 px-2 text-sm" value={nuevaSalsa} onChange={(e) => setNuevaSalsa(e.target.value)}>
                    <option value="Bolognesa">Bolognesa</option>
                    <option value="Blanca">Blanca</option>
                  </select>
                </div>
              )}
            </div>
            <DialogFooter><Button onClick={agregarProducto} className="bg-orange-600 w-full h-12 text-lg font-bold">CREAR</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-2xl border-none overflow-hidden rounded-3xl">
        <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between">
          <CardTitle className="uppercase tracking-widest text-sm">Inventario</CardTitle>
          <Input placeholder="Buscar..." className="max-w-[200px] bg-slate-800 border-none text-white h-8" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50"><TableRow><TableHead>Producto</TableHead><TableHead>Categoría</TableHead><TableHead className="text-right">Precio</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              {productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).map((p: any) => (
                <TableRow key={p.id} className="hover:bg-slate-50/80">
                  <TableCell className="font-bold uppercase text-slate-600">{p.nombre}</TableCell>
                  <TableCell><Badge variant="outline" className="font-bold">{p.categoria}</Badge></TableCell>
                  <TableCell className="text-right font-black text-orange-600 text-lg">${p.precio.toLocaleString('es-AR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2"><ModalEditar producto={p} alGuardar={actualizarPrecio} /><Button variant="outline" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => eliminarProducto(p.id, p.nombre)}><Trash2 className="h-4 w-4" /></Button></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
