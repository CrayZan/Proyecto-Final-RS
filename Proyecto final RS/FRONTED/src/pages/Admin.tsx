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
import { Label } from "@/components/ui/label"
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

  const eliminarProducto = (id: number) => {
    if(confirm("¿Estás seguro de eliminar este producto?")) {
      setProductos(productos.filter(p => p.id !== id))
    }
  }

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

        {/* DIÁLOGO PARA NUEVO PRODUCTO */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 shadow-lg">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Producto</DialogTitle>
              <DialogDescription>Carga un nuevo ítem al sistema de ventas.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="
