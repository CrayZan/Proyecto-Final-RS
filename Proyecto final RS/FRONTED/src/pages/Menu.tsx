import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ShoppingCart, ArrowLeft, Plus, Trash2, Send, Utensils } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner" // <-- IMPORTAMOS TOAST

export default function Menu({ productos }: { productos: any[] }) {
  const [carrito, setCarrito] = useState<{id: number, nombre: string, precio: number, cant: number}[]>([])
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")

  const categoriasExistentes = ["Todas", ...new Set(productos.map(p => p.categoria))]

  const agregarAlCarrito = (p: any) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === p.id)
      if (existe) return prev.map(item => item.id === p.id ? {...item, cant: item.cant + 1} : item)
      return [...prev, { ...p, cant: 1 }]
    })
    // LANZAMOS EL TOAST
    toast.success(`${p.nombre} agregado`, {
      description: "Se sumó correctamente al pedido.",
      duration: 2000,
    })
  }

  const quitarDelCarrito = (item: any) => {
    setCarrito(prev => prev.filter(i => i.id !== item.id))
    toast.error(`Eliminado: ${item.nombre}`)
  }

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)

  const enviarPedido = () => {
    const mensaje = carrito.map(item => `*${item.cant}x* ${item.nombre} ($${(item.precio * item.cant).toLocaleString('es-AR')})`).join('%0A')
    const textoFinal = `*NUEVO PEDIDO - RESTOWEB*%0A--------------------------%0A${mensaje}%0A--------------------------%0A*TOTAL: $${total.toLocaleString('es-AR')}*`
    window.open(`https://wa.me/?text=${textoFinal}`, '_blank')
    toast.info("Redirigiendo a WhatsApp...")
  }

  const productosFiltrados = catSeleccionada === "Todas" 
    ? productos 
    : productos.filter(p => p.categoria === catSeleccionada)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm">
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Terminal</h1>
        </div>
        <div className="bg-orange-600 text-white px-6 py-2 rounded-2xl shadow-lg flex items-center gap-3">
          <span className="text-sm font-bold uppercase opacity-80 font-mono">AR$</span>
          <span className="text-2xl font-black">{total.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <div className="mb-8 overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex w-max space-x-2">
            {categoriasExistentes.map((cat) => (
              <Button
                key={cat}
                variant={catSeleccionada === cat ? "default" : "outline"}
                className={`rounded-full px-6 font-bold transition-all ${
                  catSeleccionada === cat ? "bg-orange-600 shadow-md scale-105" : "text-slate-600"
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
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {productosFiltrados.map(p => (
            <Card key={p.id} className="group hover:shadow-xl transition-all border-none bg-white ring-1 ring-slate-200">
              <CardHeader className="pb-2">
                <Badge variant="secondary" className="w-fit mb-1 bg-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                  {p.categoria}
                </Badge>
                <CardTitle className="text-lg font-bold text-slate-800 uppercase">{p.nombre}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-slate-900">${p.precio.toLocaleString('es-AR')}</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => agregarAlCarrito(p)} className="w-full bg-slate-900 hover:bg-orange-600 transition-all font-bold uppercase h-11">
                  <Plus className="mr-2 h-4 w-4" /> Agregar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="h-fit sticky top-24 border-none shadow-2xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white py-5 text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-lg font-black uppercase">
              <ShoppingCart className="h-5 w-5 text-orange-500" /> Detalle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 max-h-[350px] overflow-y-auto">
            {carrito.length === 0 ? (
              <p className="text-slate-400 text-center font-medium py-10 italic">Carrito vacío</p>
            ) : (
              carrito.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-3">
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{item.nombre}</div>
                    <div className="text-xs text-orange-600 font-black">x{item.cant} - ${ (item.precio * item.cant).toLocaleString('es-AR') }</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => quitarDelCarrito(item)} className="h-8 w-8 text-slate-300 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
          {carrito.length > 0 && (
            <CardFooter className="flex-col gap-3 p-6 border-t bg-slate-50">
              <div className="flex justify-between w-full text-2xl font-black text-slate-900 border-b border-slate-200 pb-2 mb-2">
                <span>TOTAL:</span>
                <span className="text-orange-600">${total.toLocaleString('es-AR')}</span>
              </div>
              <Button onClick={enviarPedido} className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-black shadow-lg">
                <Send className="mr-2 h-5 w-5" /> ENVIAR PEDIDO
              </Button>
              <Button variant="ghost" onClick={() => { setCarrito([]); toast.info("Pedido cancelado"); }} className="w-full text-slate-400 text-xs font-bold">
                VACIAR TODO
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
