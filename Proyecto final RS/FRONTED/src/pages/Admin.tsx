import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Edit, Trash2, Search, Save, PackagePlus, ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"

// LISTA DE CATEGORÍAS OFICIALES
const CATEGORIAS = [
  "Entradas", "Principales", "Pastas caseras", "Sandwiches", 
  "Hamburguesas", "Empanadas", "Pizzas", "Pizzetas", 
  "Postres", "Cervezas", "Vinos", "Gaseosas", "Tragos"
]

function ModalEditar({ producto, alGuardar }: { producto: any, alGuardar: Function }) {
  const [precioTemporal, setPrecioTemporal] = useState(producto.precio);
  const [abierto, setAbierto] = useState(false);

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-slate-100">
          <Edit className="h-4 w-4 text-slate-600" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {producto.nombre}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label className="text-xs font-bold uppercase text-slate-500">Nuevo precio (ARS)</Label>
          <Input 
            type="number" 
            value={precioTemporal}
            onChange={(e) => setPrecioTemporal(e.target.value)}
            className="mt-2 text-lg font-bold"
          />
        </div>
        <DialogFooter>
          <Button onClick={() => { alGuardar(producto.id, Number(precioTemporal)); setAbierto(false); }} className="bg-slate-900 w-full h-12">
            <Save className="mr-2 h-4 w-4" /> Actualizar Precio
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
  const [nuevaSalsa, setNuevaSalsa] = useState("Bolognesa") // Solo para pastas
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)

  const agregarProducto = () => {
    if (!nuevoNombre || !nuevoPrecio) return alert("Faltan datos")
    
    // Si es pasta, le pegamos la salsa al nombre o la categoría
    const nombreFinal = nuevaCat === "Pastas caseras" 
      ? `${nuevoNombre} (Salsa ${nuevaSalsa})` 
      : nuevoNombre

    const nuevo = {
      id: Date.now(),
      nombre: nombreFinal,
      precio: Number(nuevoPrecio),
      categoria: nuevaCat,
      stock: 0
    }

    setProductos([...productos, nuevo])
    setModalNuevoAbierto(false)
    setNuevoNombre("")
    setNuevoPrecio("")
  }

  const eliminarProducto = (id: number) => {
    if(confirm("¿Eliminar este producto?")) {
      setProductos(productos.filter((p: any) => p.id !== id))
    }
  }

  const actualizarPrecio = (id: number, nuevoPrecio: number) => {
    setProductos(productos.map((p: any) => p.id === id ? { ...p, precio: nuevoPrecio } : p))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-2 text-slate-500">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio</Link>
          </Button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Menú</h1>
        </div>

        <Dialog open={modalNuevoAbierto} onOpenChange={setModalNuevoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 shadow-xl h-12 px-6 text-lg font-bold">
              <PackagePlus className="mr-2 h-5 w-5" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ítem</DialogTitle>
              <DialogDescription>Selecciona la categoría correcta para organizar tu menú.</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="font-bold">Nombre</Label>
                <Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej: Ravioles" />
              </div>

              <div className="grid gap-2">
                <Label className="font-bold">Precio (ARS)</Label>
                <Input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} placeholder="0.00" />
              </div>

              <div className="grid gap-2">
                <Label className="font-bold">Categoría</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={nuevaCat}
                  onChange={(e) => setNuevaCat(e.target.value)}
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* LÓGICA ESPECIAL PARA PASTAS */}
              {nuevaCat === "Pastas caseras" && (
                <div className="grid gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100 animate-in zoom-in-95">
                  <Label className="text-orange-800 font-bold text-xs uppercase">Tipo de Salsa</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-orange-200 bg-white px-3 py-1 text-sm outline-none"
                    value={nuevaSalsa}
                    onChange={(e) => setNuevaSalsa(e.target.value)}
                  >
                    <option value="Bolognesa">Salsa Bolognesa</option>
                    <option value="Blanca">Salsa Blanca</option>
                  </select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={agregarProducto} className="bg-orange-600 w-full h-12 text-lg font-bold shadow-lg">
                <Plus className="mr-2 h-5 w-5" /> Crear Producto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla de Productos igual que antes */}
      <Card className="shadow-2xl border-none overflow-hidden rounded-xl">
        <CardHeader className="bg-slate-900 text-white p-6 flex flex-row items-center justify-between">
          <CardTitle>Inventario Actual</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar..." 
              className="pl-9 bg-slate-800 border-none text-white placeholder:text-slate-400 h-9" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold py-4">Producto</TableHead>
                <TableHead className="font-bold">Categoría</TableHead>
                <TableHead className="text-right font-bold">Precio</TableHead>
                <TableHead className="text-right font-bold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).map((p: any) => (
                <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-semibold text-slate-700">{p.nombre}</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-white border-slate-200">{p.categoria}</Badge></TableCell>
                  <TableCell className="text-right font-black text-orange-600 text-lg">
                    ${p.precio.toLocaleString('es-AR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <ModalEditar producto={p} alGuardar={actualizarPrecio} />
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 border-slate-200" onClick={() => eliminarProducto(p.id)}>
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
    </div>
  )
}
