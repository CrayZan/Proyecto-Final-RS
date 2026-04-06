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

export default function Admin({ productos, setProductos }: { productos: any[], setProductos: any }) {
  const [busqueda, setBusqueda] = useState("")

  const eliminarProducto = (id: number) => {
    if(confirm("¿Seguro?")) {
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
        <h1 className="text-3xl font-black">Control de Stock</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar..." 
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
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Precio Actual</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosFiltrados.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    ${p.precio.toLocaleString('es-AR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Editar Precio</DialogTitle></DialogHeader>
                          <div className="py-4">
                            <Label>Nuevo precio para {p.nombre}</Label>
                            <Input 
                              type="number" 
                              defaultValue={p.precio} 
                              onBlur={(e) => actualizarPrecio(p.id, Number(e.target.value))}
                            />
                          </div>
                          <DialogFooter>
                            <Button className="bg-slate-900 w-full">Guardar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-red-500" onClick={() => eliminarProducto(p.id)}>
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
