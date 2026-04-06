import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"

// Lista de productos para probar (Esto simula tu base de datos)
const PRODUCTOS = [
  { id: 1, nombre: "Pizza Muzzarella", precio: 8500, categoria: "Pizzas" },
  { id: 2, nombre: "Hamburguesa Completa", precio: 6200, categoria: "Burgers" },
  { id: 3, nombre: "Empanada de Carne", precio: 900, categoria: "Entradas" },
  { id: 4, nombre: "Gaseosa 500ml", precio: 1500, categoria: "Bebidas" },
]

export default function Menu() {
  const [carrito, setCarrito] = useState<{id: number, nombre: string, precio: number, cant: number}[]>([])

  const agregarAlCarrito = (p: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === p.id)
      if (existe) return prev.map(item => item.id === p.id ? {...item, cant: item.cant + 1} : item)
      return [...prev, { ...p, cant: 1 }]
    })
  }

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" asChild>
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver al Inicio</Link>
        </Button>
        <h1 className="text-3xl font-bold">Terminal de Ventas</h1>
        <Badge variant="secondary" className="text-lg px-4 py-1 border-orange-200 text-orange-700">
          Total: ${total.toLocaleString('es-AR')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Galería de Productos */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRODUCTOS.map(p => (
            <Card key={p.id} className="hover:border-orange-500 transition-all shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">{p.nombre}</CardTitle>
                  <Badge variant="outline">{p.categoria}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">${p.precio.toLocaleString('es-AR')}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => agregarAlCarrito(p)} className="w-full bg-slate-900">
                  <Plus className="mr-2 h-4 w-4" /> Agregar al pedido
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Lado Derecho: Carrito de Compras */}
        <Card className="h-fit sticky top-6 border-2 border-orange-100 shadow-lg">
          <CardHeader className="bg-orange-50/50">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ShoppingCart className="h-5 w-5" /> Tu Pedido Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {carrito.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">El carrito está vacío</p>
                <p className="text-xs text-slate-400 mt-2">Selecciona productos para comenzar</p>
              </div>
            ) : (
              carrito.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b pb-3">
                  <div>
                    <p className="font-bold text-slate-800">{item.nombre}</p>
                    <p className="text-muted-foreground text-xs">{item.cant} x ${item.precio.toLocaleString('es-AR')}</p>
                  </div>
                  <p className="font-bold text-orange-600">${(item.cant * item.precio).toLocaleString('es-AR')}</p>
                </div>
              ))
            )}
          </CardContent>
          
          {carrito.length > 0 && (
            <CardFooter className="flex-col gap-3 pt-4 border-t bg-slate-50/50">
              <div className="flex justify-between w-full text-xl font-black text-slate-900">
                <span>TOTAL:</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg font-bold">
                Confirmar y Cobrar
              </Button>
              <Button variant="ghost" onClick={() => setCarrito([])} className="w-full text-destructive hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Vaciar Carrito
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
