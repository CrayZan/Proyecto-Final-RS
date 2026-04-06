import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Edit, Trash2, Search, Save, PackagePlus } from "lucide-react"
import { Link } from "react-router-dom"

// Componente para Editar (Igual al anterior, pero mejorado)
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
          <Label>Nuevo precio (ARS)</Label>
          <Input 
            type="number" 
            value={precioTemporal}
            onChange={(e) => setPrecioTemporal(e.target.value)}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button onClick={() => { alGuardar(producto.id, Number(precioTemporal)); setAbierto(false); }} className="bg-slate-900 w-full">
            <Save className="mr-2 h-4 w-4" /> Actualizar
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
  const [nuevaCat, setNuevaCat] = useState("Pizzas")
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)

  // Función para AGREGAR un producto nuevo
  const agregarProducto = () => {
    if (!nuevoNombre || !nuevoPrecio) return alert("Completa nombre y precio")
    
    const nuevo = {
      id: Date.now(), // Genera un ID único basado en el tiempo
      nombre: nuevoNombre,
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
    if(confirm("¿Eliminar este producto permanentemente?")) {
      setProductos(productos.filter((p: any) => p.id !== id))
    }
  }

  const actualizarPrecio = (id: number, nuevoPrecio: number) => {
    setProductos(productos.map((p: any) => p.id === id ? { ...p, precio: nuevoPrecio } : p))
  }

  const productosFiltrados = productos.filter((p: any) => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-2 text-slate-500">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio</Link>
          </Button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestión de Menú</h1>
        </div>

        {/* MODAL PARA NUEVO PRODUCTO REAL */}
        <Dialog open={modalNuevoAbierto} onOpenChange={setModalNuevoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 shadow-xl h-12 px-6 text-lg font-bold">
              <PackagePlus className="mr-2 h-5 w-5" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ítem</DialogTitle>
              <DialogDescription>Los cambios se verán reflejados en el Menú de ventas.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nombre del Plato o Bebida</Label>
                <Input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej: Pizza con Jamón" />
              </div>
              <div className="grid gap-2">
                <Label>Precio de Venta (ARS)</Label>
                <Input type="number" value={nuevoPrecio} onChange={(e) => setNuevoPrecio(e.target.value)} placeholder="0.00" />
              </div>
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <Input value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} placeholder="Pizzas, Burgers, etc." />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={agregarProducto} className="bg-orange-600 w-full h-12 text-lg">
                <Plus className="mr-2 h-5 w-5" /> Crear Producto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Filtrar por nombre..." 
          className="pl-10 max-w-md bg-white border-slate-200" 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <Card className="shadow-2xl border-none overflow-hidden rounded-xl">
        <CardHeader className="bg-slate-900 text-white p-6">
          <CardTitle className="text-xl">Inventario de Productos</CardTitle>
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
              {productosFiltrados.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-semibold text-slate-700">{p.nombre}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-white">{p.categoria}</Badge></TableCell>
                  <TableCell className="text-right font-black text-orange-600 text-lg">
                    ${p.precio.toLocaleString('es-AR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <ModalEditar producto={p} alGuardar={actualizarPrecio} />
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 border-slate-200" onClick={() => eliminarProducto(p.id)}>
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
