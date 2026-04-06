import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Send, MapPin, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ref, push, set } from "firebase/database"
import { db } from "../lib/firebase"

export default function Menu({ productos }: { productos: any[] }) {
  const [searchParams] = useSearchParams()
  const [carrito, setCarrito] = useState<any[]>([])
  const [numeroMesa, setNumeroMesa] = useState(searchParams.get("mesa") || "")
  const [catSeleccionada, setCatSeleccionada] = useState("Todas")

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cant), 0)
  const categorias = ["Todas", ...new Set(productos.map(p => p.categoria))]

  const enviarPedido = async () => {
    if (!numeroMesa) return toast.error("¡Ingresá el N° de Mesa!")
    if (carrito.length === 0) return toast.error("El carrito está vacío")

    const nuevoPedido = {
      mesa: numeroMesa.toUpperCase(),
      items: carrito,
      total: total,
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      estado: "pendiente"
    }

    try {
      // Intentamos guardar en la carpeta "pedidos" de Firebase
      const pedidosRef = ref(db, 'pedidos');
      const nuevoPedidoRef = push(pedidosRef);
      await set(nuevoPedidoRef, nuevoPedido);
      
      // WhatsApp de respaldo
      const textoWA = carrito.map(i => `${i.cant}x ${i.nombre}`).join('%0A')
      window.open(`https://wa.me/542966249538?text=*MESA ${numeroMesa.toUpperCase()}*%0A${textoWA}`, '_blank')
      
      setCarrito([])
      toast.success("¡Pedido enviado con éxito!")
    } catch (error) {
      console.error(error)
      toast.error("Error de conexión con la nube")
    }
  }

  const filtrar = catSeleccionada === "Todas" ? productos : productos.filter(p => p.categoria === catSeleccionada)

  return (
    <div className="p-4 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-orange-100">
        <div className="flex items-center gap-2">
          <MapPin className="text-orange-600" />
          <input className="font-black text-xl w-24 border-none focus:ring-0 uppercase" placeholder="Mesa" value={numeroMesa} onChange={e => setNumeroMesa(e.target.value)} />
        </div>
        <div className="text-2xl font-black text-slate-900">${total.toLocaleString('es-AR')}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ScrollArea className="mb-6">
            <div className="flex gap-2">
              {categorias.map(c => (
                <Button key={c} variant={catSeleccionada === c ? "default" : "outline"} onClick={() => setCatSeleccionada(c)} className="rounded-full font-black uppercase text-[10px]">
                  {c}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtrar.map(p => (
              <Card key={p.id} className="rounded-[2rem] overflow-hidden border-none shadow-md">
                <img src={p.imagen} className="h-40 w-full object-cover" />
                <CardHeader><CardTitle className="uppercase font-black text-sm">{p.nombre}</CardTitle></CardHeader>
                <CardContent className="font-black text-orange-600">${p.precio}</CardContent>
                <CardFooter>
                  <Button className="w-full bg-slate-900 font-black" onClick={() => setCarrito([...carrito, {...p, cant: 1}])}>AGREGAR</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-[2rem] shadow-2xl border-none">
            <CardHeader className="bg-orange-600 text-white rounded-t-[2rem] font-black uppercase text-center py-4">Tu Pedido</CardHeader>
            <CardContent className="p-4">
              {carrito.length === 0 ? <p className="text-center py-10 opacity-20 font-black text-[10px]">VACÍO</p> : 
                carrito.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs font-bold border-b py-2 uppercase">
                    <span>{item.cant}x {item.nombre}</span>
                    <button onClick={() => setCarrito(carrito.filter((_, idx) => idx !== i))}><Trash2 size={14} className="text-red-200"/></button>
                  </div>
                ))
              }
            </CardContent>
            <CardFooter>
              <Button onClick={enviarPedido} className="w-full bg-green-600 h-14 font-black rounded-2xl shadow-lg uppercase">ENVIAR</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
