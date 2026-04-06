import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, Clock, Utensils, Truck, 
  Store, MapPin, ExternalLink, Trash2 
} from "lucide-react"
import { ref, remove } from "firebase/database"
import { db } from "../lib/firebase"
import { toast } from "sonner"

export default function Comandas({ pedidos }: { pedidos: any[] }) {
  
  const finalizarPedido = async (id: string) => {
    await remove(ref(db, `pedidos/${id}`))
    toast.success("Pedido despachado")
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto mb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
            Monitor de <span className="text-orange-600">Cocina</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Panel en tiempo real / San Vicente</p>
        </div>
        <Badge className="bg-slate-900 px-6 py-2 rounded-full font-black italic">
          {pedidos.length} PEDIDOS ACTIVOS
        </Badge>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
           <Utensils size={64} className="mx-auto text-slate-100 mb-4" />
           <p className="font-black uppercase italic text-slate-300">Esperando nuevos pedidos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pedidos.map((p) => (
            <Card key={p.id} className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white group hover:shadow-2xl transition-all">
              
              {/* CABECERA DINÁMICA SEGÚN ENTREGA */}
              <div className={`p-6 flex justify-between items-center ${
                p.entrega === 'delivery' ? 'bg-orange-600' : 
                p.entrega === 'retiro' ? 'bg-slate-800' : 'bg-slate-900'
              } text-white`}>
                <div className="flex items-center gap-3">
                  {p.entrega === 'delivery' ? <Truck size={24} className="animate-bounce" /> : 
                   p.entrega === 'retiro' ? <Store size={24} /> : <Utensils size={24} />}
                  <div>
                    <h3 className="font-black uppercase italic leading-none">
                      {p.entrega === 'delivery' ? 'Delivery' : 
                       p.entrega === 'retiro' ? 'Retiro' : p.destino}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-bold opacity-60 mt-1">
                      <Clock size={10} /> {p.hora}
                    </div>
                  </div>
                </div>
                <button onClick={() => finalizarPedido(p.id)} className="opacity-20 hover:opacity-100 transition-opacity">
                  <Trash2 size={18} />
                </button>
              </div>

              <CardContent className="p-8">
                {/* DIRECCIÓN / UBICACIÓN (Solo si es Delivery) */}
                {p.entrega === 'delivery' && (
                  <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Dirección de Envío:</p>
                    {p.destino.includes('http') ? (
                      <a 
                        href={p.destino} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition-colors"
                      >
                        <MapPin size={14} /> VER UBICACIÓN GPS <ExternalLink size={12} />
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-slate-700">{p.destino}</p>
                    )}
                  </div>
                )}

                {/* ITEMS DEL PEDIDO */}
                <div className="space-y-3 mb-8">
                  {p.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-100 text-slate-900 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black">
                          {item.cant}
                        </span>
                        <span className="font-black uppercase italic text-sm text-slate-700">
                          {item.nombre}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* MÉTODO DE PAGO Y TOTAL */}
                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase">Pago</p>
                    <Badge className={`text-[9px] font-black uppercase ${
                      p.metodoPago === 'mercadopago' ? 'bg-sky-100 text-sky-600' : 
                      p.metodoPago === 'transferencia' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    } border-none`}>
                      {p.metodoPago}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase">Total</p>
                    <p className="text-xl font-black italic text-slate-900">${p.total}</p>
                  </div>
                </div>

                <Button 
                  onClick={() => finalizarPedido(p.id)}
                  className="w-full mt-8 h-14 bg-green-500 hover:bg-green-600 rounded-2xl font-black uppercase italic shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                  <CheckCircle2 className="mr-2" /> Listo para Entregar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
