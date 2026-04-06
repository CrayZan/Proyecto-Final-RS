import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ShoppingCart, Send, MapPin, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { ref, push } from "firebase/database"
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
      // MANDA EL PEDIDO A FIREBASE (TIEMPO REAL)
      await push(ref(db, 'pedidos'), nuevoPedido)
      
      // Respaldo de WhatsApp (el número que me pasaste antes)
      const textoWA = carrito.map(i => `${i.cant}x ${i.nombre}`).join('%0A')
      const urlWA = `https://wa.me/542966249538?text=*NUEVO PEDIDO MESA ${numeroMesa.toUpperCase()}*%0A--------------------------%0A${textoWA}%0A--------------------------%0A*TOTAL: $${total}*`
      
      window.open(urlWA, '_blank')
      
      setCarrito([])
      toast.success("¡Pedido enviado a la cocina!")
    } catch (error) {
      console.error(error)
      toast.error("Error al conectar con la base de datos")
    }
  }

  const filtrar = catSeleccionada === "Todas" ? productos : productos.filter(p => p.categoria === catSeleccionada)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-[2rem] shadow-sm border border-orange-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-3 rounded-2xl text-orange-500"><MapPin size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Tu ubicación</p>
            <input 
              placeholder="Mesa..." 
              className="font-black text-xl text-slate-900 border-none p-0 focus:ring-0 w-32 uppercase"
              value={numeroMesa} 
              onChange={(e) => setNumeroMesa(e.target.value)} 
            />
          </div>
        </div>
        <div className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-3xl italic">${total.toLocaleString('es-AR')}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <ScrollArea className="w-full whitespace-nowrap mb-6">
            <div className="flex space-x-2">
              {categorias.map(c => (
                <Button 
                  key={c} 
                  variant={catSeleccionada === c ? "default" : "outline"} 
                  onClick={() => setCatSeleccionada(c)} 
                  className={`rounded-full px-6 font-black uppercase text-[10px] ${catSeleccionada === c ? "bg-slate-900" : "text-slate-400"}`}
                >
                  {c}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtrar.map(p => (
              <Card key={p.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-md bg-white group">
                <div className="h-48 overflow-hidden">
                  <img src={p.imagen} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.nombre} />
                </div>
                <CardHeader className="pb-1"><CardTitle className="uppercase font-black text-sm italic">{p.nombre}</CardTitle></CardHeader>
                <CardContent>
                   <p className="text-2xl font-black text-orange-600 tracking-tighter">${p.precio.toLocaleString('es-AR')}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-slate-900 h-12 font-black rounded-2xl" onClick={() => {
                    setCarrito(prev => {
                      const existe = prev.find(item => item.id === p.id)
                      if (existe) return prev.map(item => item.id === p.id ? {...item, cant: item.cant + 1} : item)
                      return [...prev, { ...p, cant: 1 }]
                    })
                    toast.success("Agregado")
                  }}>+ AGREGAR</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="rounded-[2.5rem] shadow-2xl border-none sticky top-28">
            <CardHeader className="bg-orange-600 text-white rounded-t-[2.5rem] font-black uppercase text-center py-6 italic tracking-widest">Mi Pedido</CardHeader>
            <CardContent className="p-6 max-h-[400px] overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-10 opacity-20 font-black text-[10px] uppercase tracking-widest">Carrito Vacío</div>
              ) : (
                carrito.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-3 mb-3">
                    <div className="flex-1">
                      <div className="font-black text-slate-800 text-[11px] uppercase leading-tight">{item.nombre}</div>
                      <div className="text-[10px] text-orange-600 font-black">Cant: {item.cant}</div>
                    </div>
                    <button onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))} className="text-red-200 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                ))
              )}
            </CardContent>
            {carrito.length > 0 && (
              <CardFooter className="p-6 pt-0">
                <Button onClick={enviarPedido} className="w-full bg-green-600 h-16 font-black text-lg rounded-2xl shadow-lg uppercase italic tracking-tighter shadow-green-100">
                  <Send className="mr-2" /> ENVIAR PEDIDO
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
