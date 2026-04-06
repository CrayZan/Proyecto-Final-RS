import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, ArrowLeft, Plus, Trash2, Send } from "lucide-react"
import { Link } from "react-router-dom"

// Recibimos los productos del sistema global
export default function Menu({ productos }: { productos: any[] }) {
  const [carrito, setCarrito] = useState<{id: number, nombre: string, precio: number, cant: number}[]>([])

  const agregarAlCarrito = (p: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === p.id)
      if (existe) return prev.map(item => item.id === p.id ? {...item, cant: item.cant + 1} : item)
      return [...prev, { ...p, cant: 1 }]
    })
  }

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)

  // Función para enviar por WhatsApp
  const enviarPedido = () => {
    const mensaje = carrito.map(item => `- ${item.cant}x ${item.nombre} ($${item.precio * item.cant})`).join('%0A')
    const textoFinal = `*Nuevo Pedido - RestoWeb*%0A${mensaje}%0A%0A*Total: $${total}*`
    window.open(`https://wa.me/?text=${textoFinal}`, '_blank')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" asChild>
          <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
        </Button>
        <h1 className="text-3xl font-bold">Terminal de Ventas</h1>
        <Badge variant="secondary" className="text-lg px-4 py-1 border-orange-200 text-orange-700 font-black">
          $ {total.toLocaleString('es-AR')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {productos.map(p => (
            <Card key={p.id} className="hover:border-orange-500 transition-all shadow-sm border-2 border-transparent">
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
                  <Plus className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="h-fit sticky top-24 border-2 border-orange-100 shadow-lg">
          <CardHeader className="bg-orange-50/50">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ShoppingCart className="h-5 w-5" /> Tu Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {carrito.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">Vacío</p>
            ) : (
              carrito.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                  <div className="font-medium">{item.nombre} ({item.cant})</div>
                  <div className="font-bold">${(item.cant * item.precio).toLocaleString('es-AR')}</div>
                </div>
              ))
            )}
          </CardContent>
          {carrito.length > 0 && (
            <CardFooter className="flex-col gap-2 pt-4 border-t bg-slate-50/50">
              <div className="flex justify-between w-full text-xl font-black">
                <span>TOTAL:</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <Button onClick={enviarPedido} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                <Send className="mr-2 h-4 w-4" /> Enviar por WhatsApp
              </Button>
              <Button variant="ghost" onClick={() => setCarrito([])} className="w-full text-destructive">
                Vaciar
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
