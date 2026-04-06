import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Edit, Trash2, Search } from "lucide-react"
import { Link } from "react-router-dom"

// Datos simulados (Los mismos que en el Menú)
const PRODUCTOS = [
  { id: 1, nombre: "Pizza Muzzarella", precio: 8500, categoria: "Pizzas", stock: 20 },
  { id: 2, nombre: "Hamburguesa Completa", precio: 6200, categoria: "Burgers", stock: 15 },
  { id: 3, nombre: "Empanada de Carne", precio: 900, categoria: "Entradas", stock: 50 },
  { id: 4, nombre: "Gaseosa 500ml", precio: 1500, categoria: "Bebidas", stock: 100 },
]

export default function Admin() {
  return (
    <div className="p-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-2">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
          </Button>
          <h1 className="text-3xl font-black text-slate-900">Panel de Control</h1>
          <p className="text-muted-foreground">Gestiona tus productos y precios aquí.</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700 shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      {/* Buscador Rápido */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar producto por nombre..." className="pl-10 max-w-md bg-white" />
      </div>

      {/* Tabla de Productos */}
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
              {PRODUCTOS.map((p) => (
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
                      <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200">
                        <Edit className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 border-red-100 hover:bg-red-50">
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

      {/* Resumen rápido abajo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-4 flex flex-col items-center">
            <p className="text-sm text-orange-600 font-bold uppercase tracking-wider">Total Productos</p>
            <p className="text-3xl font-black text-orange-900">124</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 flex flex-col items-center">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Ventas Hoy</p>
            <p className="text-3xl font-black text-slate-900">12</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4 flex flex-col items-center">
            <p className="text-sm text-green-600 font-bold uppercase tracking-wider">Ingresos Hoy</p>
            <p className="text-3xl font-black text-green-900">$45.800</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
