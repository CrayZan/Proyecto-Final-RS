import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Edit, Trash2, Search, Save } from "lucide-react"
import { Link } from "react-router-dom"

// Sub-componente para el Modal de Edición (para manejar el estado local)
function ModalEditar({ producto, alGuardar }: { producto: any, alGuardar: Function }) {
  const [precioTemporal, setPrecioTemporal] = useState(producto.precio);
  const [abierto, setAbierto] = useState(false);

  const manejarGuardado = () => {
    alGuardar(producto.id, Number(precioTemporal));
    setAbierto(false); // Cerramos el modal solo al guardar
  };

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4 text-slate-600" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {producto.nombre}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid gap-2">
            <Label>Nuevo precio para {producto.nombre}</Label>
            <Input 
              type="number" 
              value={precioTemporal}
              onChange={(e) => setPrecioTemporal(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={manejarGuardado} className="bg-slate-900 w-full font-bold">
            <Save className="mr-2 h-4 w-4" /> Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Admin({ productos, setProductos }: { productos: any[], setProductos: any }) {
  const [busqueda, setBusqueda] = useState("")

  const eliminarProducto = (id: number) => {
    if(confirm("¿Estás seguro de eliminar este producto?")) {
      setProductos(productos.filter((p: any) => p.id !== id))
    }
  }

  const actualizarPrecio = (id: number, nuevoPrecio: number) => {
    setProductos(productos.map((p: any) => 
      p.id === id ? { ...p, precio: nuevoPrecio } : p
    ))
  }

  const productosFiltrados = productos.filter((p: any) => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" asChild>
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
        </Button>
        <h1 className="text-3xl font-black text-slate-900">Control de Precios</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar producto..." 
          className="pl-10 max-w-sm bg-white" 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <Card className="shadow-xl border-none overflow-hidden">
        <CardHeader className="bg-slate-900 text-white">
          <CardTitle>Inventario Global</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Producto</TableHead>
                <TableHead className="text-right font-bold">Precio Actual</TableHead>
                <TableHead className="text-right font-bold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosFiltrados.map((p: any) => (
                <TableRow key={p.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    ${p.precio.toLocaleString('es-AR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      
                      {/* USAMOS EL NUEVO COMPONENTE DE EDICIÓN */}
                      <ModalEditar producto={p} alGuardar={actualizarPrecio} />

                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:bg-red-50 border-red-100" 
                        onClick={() => eliminarProducto(p.id)}
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
    </div>
  )
}
