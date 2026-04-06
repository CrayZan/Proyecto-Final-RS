import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, MapPin, Trash2 } from "lucide-react"
import { ref, remove } from "firebase/database"
import { db } from "../lib/firebase"
import { toast } from "sonner"

export default function Comandas({ pedidos }: { pedidos: any[] }) {
  
  // Esta función borra el pedido de la nube de Firebase al instante
  const despacharPedido = (id: string) => {
    const pedidoRef = ref(db, `pedidos/${id}`)
    remove(pedidoRef)
      .then(() => toast.success("Pedido despachado y borrado de la nube"))
      .catch(() => toast.error("Error al borrar el pedido"))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Monitor de Cocina</h1>
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.2em]">Panel en tiempo real / San Vicente</p>
        </div>
        <div className="bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm">
          <span className="text-xs font-black uppercase text-slate-400">Pedidos activos: </span>
          <span className="text-xl font-black text-slate-900 italic">{pedidos.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pedidos.map(p => (
          <Card key={p.id} className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden ring-1 ring-slate-100 group hover:ring-2 ring-orange-500 transition-all duration-300">
            <CardHeader className="bg-slate-900 text-white flex flex-row justify-between items-center py-5 px-6">
              <div className="flex items-center gap-2">
                <div className="bg-orange-600 p-2 rounded-xl">
                  <MapPin size={16} className="text-white"/>
                </div>
                <CardTitle className="text-lg font-black uppercase italic tracking-tighter">
                  MESA {p.mesa}
                </CardTitle>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">Hora</span>
                <span className="text-xs font-black text-orange-500 tracking-tighter italic">{p.hora}</span>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-3 mb-6 min-h-[100px]">
                {p.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-100 text-slate-900 w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black">
                        {item.cant}
                      </span>
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
                        {item.nombre}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-50 mb-4 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-300 uppercase">Total Pedido</span>
                <span className="text-xl font-black text-slate-900 italic">${p.total.toLocaleString()}</span>
              </div>

              <Button 
                onClick={() => despacharPedido(p.id)} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-black h-14 rounded-2xl shadow-lg shadow-green-100 uppercase italic tracking-tighter text-sm group-hover:scale-105 transition-transform"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" /> LISTO PARA ENTREGAR
              </Button>
            </CardContent>
          </Card>
        ))}

        {pedidos.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-20">
            <Clock size={64} className="mb-4 text-slate-400" />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Esperando pedidos...</h2>
            <p className="text-xs font-bold uppercase tracking-widest mt-2">La cocina está al día</p>
          </div>
        )}
      </div>
    </div>
  )
}
