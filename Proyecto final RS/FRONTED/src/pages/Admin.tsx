import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { ArrowLeft, Plus, Edit, Trash2, Search, Save } from "lucide-react"
import { Link } from "react-router-dom"

const PRODUCTOS_INICIALES = [
  { id: 1, nombre: "Pizza Muzzarella", precio: 8500, categoria: "Pizzas", stock: 20 },
  { id: 2, nombre: "Hamburguesa Completa", precio: 6200, categoria: "Burgers", stock: 15 },
  { id: 3, nombre: "Empanada de Carne", precio: 900, categoria: "Entradas", stock: 50 },
  { id: 4, nombre: "Gaseosa 500ml", precio: 1500, categoria: "Bebidas", stock: 100 },
]

export default function Admin() {
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES)
  const [busqueda, setBusqueda] = useState("")

  // Función para "Eliminar" (Simulado)
  const eliminarProducto = (id: number) => {
    if(confirm("¿Estás seguro de eliminar este producto?")) {
      setProductos(productos.filter(p => p.id !== id))
    }
  }

  // Filtrar productos según la búsqueda
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-2">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
          </Button>
          <h1 className="text-3xl font-black text-slate-900">Panel de Control</h1>
          <p className="text-muted-foreground">Gestiona tus productos y precios aquí.</p>
        </div>

        {/* BOTÓN CON DIÁLOGO (MODAL) */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Producto</DialogTitle>
              <DialogDescription>Completa los datos para sumar al menú.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="Nombre del producto" />
              <Input type="number" placeholder="Precio (ARS)" />
              <Input placeholder="Categoría (Pizzas, Bebidas...)" />
            </div>
            <DialogFooter>
              <Button onClick={() => alert("Producto guardado (Simulado)")} className="bg-orange-600">
                <Save className="mr-2 h-4 w-4" /> Guardar Producto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar producto por nombre..." 
          className="pl-10 max-w-md bg-white" 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <Card className="shadow-xl border-none">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <CardTitle>Inventario de Productos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Producto</TableHead>
                <TableHead className="font-bold">Categoría</TableHead>
                <TableHead className="font-bold text-right">Precio</TableHead>
                <TableHead className="font-bold text-center">Stock</TableHead>
                <TableHead className="font-bold text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosFiltrados.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">{p.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    ${p.precio.toLocaleString('es-AR')}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock} uni.
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 border-slate-200"
                        onClick={() => alert("Editando: " + p.nombre)}
                      >
                        <Edit className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 border-red-100 hover:bg-red-50"
                        onClick={() => eliminarProducto(p.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
