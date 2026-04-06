import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ShoppingCart, ArrowLeft, Plus, Trash2, Send, Utensils } from "lucide-react"
import { Link } from "react-router-dom"

export default function Menu({ productos }: { productos: any[] }) {
  const [carrito, setCarrito] = useState<{id: number, nombre: string, precio: number, cant: number}[]>([])
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")

  // Obtenemos las categorías únicas que realmente tienen productos
  const categoriasExistentes = ["Todas", ...new Set(productos.map(p => p.categoria))]

  const agregarAlCarrito = (p: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === p.id)
      if (existe) return prev.map(item => item.id === p.id ? {...item, cant: item.cant + 1} : item)
      return [...prev, { ...p, cant: 1 }]
    })
  }

  const quitarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(item => item.id !== id))
  }

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)

  const enviarPedido = () => {
    const mensaje = carrito.map(item => `*${item.cant}x* ${item.nombre} ($${(item.precio * item.cant).toLocaleString('es-AR')})`).join('%0A')
    const textoFinal = `*NUEVO PEDIDO - RESTOWEB*%0A--------------------------%0A${mensaje}%0A--------------------------%0A*TOTAL: $${total.toLocaleString('es-AR')}*%0A%0A_Enviado desde el sistema de San Vicente_`
    window.open(`https://wa.me/?text=${textoFinal}`, '_blank')
  }

  // Filtrado de productos
  const productosFiltrados = catSeleccionada === "Todas" 
    ? productos 
    : productos.filter(p => p.categoria === catSeleccionada)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Terminal de Ventas</h1>
        </div>
        <div className="bg-orange-600 text-white px-6 py-2 rounded-2xl shadow-lg flex items-center gap-3">
          <span className="text-sm font-bold uppercase opacity-80">Total:</span>
          <span className="text-2xl font-black">$ {total.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {/* BARRA DE CATEGORÍAS (Scroll Horizontal) */}
      <div className="mb-8 overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex w-max space-x-2">
            {categoriasExistentes.map((cat) => (
              <Button
                key={cat}
                variant={catSeleccionada === cat ? "default" : "outline"}
                className={`rounded-full px-6 font-bold transition-all ${
                  catSeleccionada === cat 
                    ? "bg-orange-600 hover:bg-orange-700 shadow-md scale-105" 
                    : "hover:border-orange-300 text-slate-600"
                }`}
                onClick={() => setCatSeleccionada(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* GRILLA DE PRODUCTOS */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map(p => (
              <Card key={p.id} className="group hover:shadow-xl transition-all border-none bg-white/50 backdrop-blur-sm ring-1 ring-slate-200">
                <CardHeader className="pb-2">
                  <Badge variant="secondary" className="w-fit mb-2 bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                    {p.categoria}
                  </Badge>
                  <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                    {p.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-black text-slate-900">${p.precio.toLocaleString('es-AR')}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => agregarAlCarrito(p)} 
                    className="w-full bg-slate-900 hover:bg-orange-600 hover:scale-[1.02] transition-all h-11 font-bold"
                  >
                    <Plus className="mr-2 h-4 w-4" /> AGREGAR AL PEDIDO
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <Utensils className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium text-lg">No hay productos en esta categoría todavía.</p>
            </div>
          )}
        </div>

        {/* CARRITO LATERAL (PEDIDO) */}
        <Card className="h-fit sticky top-24 border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white py-6">
            <CardTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
              <ShoppingCart className="h-6 w-6 text-orange-500" /> Detalle del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 max-h-[400px] overflow-y-auto">
            {carrito.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 font-medium">El carrito está vacío</p>
                <p className="text-[10px] text-slate-300 uppercase mt-2">Empieza a sumar sabores</p>
              </div>
            ) : (
              carrito.map(item => (
                <div key={item.id} className="flex justify-between items-start text-sm border-b border-slate-100 pb-3 group">
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 leading-tight">{item.nombre}</div>
                    <div className="text-xs text-orange-600 font-black">Cant: {item.cant} x ${item.precio.toLocaleString('es-AR')}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => quitarDelCarrito(item.id)}
                    className="h-7 w-7 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
          
          {carrito.length > 0 && (
            <CardFooter className="flex-col gap-3 p-6 border-t bg-slate-50">
              <div className="flex justify-between w-full text-2xl font-black text-slate-900">
                <span className="tracking-tighter">TOTAL:</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <Button onClick={enviarPedido} className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-black shadow-lg shadow-green-200">
                <Send className="mr-2 h-5 w-5" /> CONFIRMAR Y ENVIAR
              </Button>
              <Button variant="ghost" onClick={() => setCarrito([])} className="w-full text-slate-400 text-xs font-bold hover:text-red-500">
                CANCELAR PEDIDO
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
