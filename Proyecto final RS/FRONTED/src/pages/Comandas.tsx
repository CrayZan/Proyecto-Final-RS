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
    <div className="p-3 md:p-8 max-w-7xl mx-auto mb-20">
      {/* HEADER RESPONSIVO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900">
            Monitor de <span className="text-orange-600">Cocina</span>
          </h1>
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-400">
            Panel en tiempo real / San Vicente
          </p>
        </div>
        <Badge className="bg-slate-900 px-4 md:px-6 py-1.5 md:py-2 rounded-full font-black italic text-[10px] md:text-sm shrink-0">
          {pedidos.length} {pedidos.length === 1 ? 'PEDIDO ACTIVO' : 'PEDIDOS ACTIVOS'}
        </Badge>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-20 md:py-40 bg-white rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-slate-100 mx-2">
            <Utensils size={48} className="md:size-16 mx-auto text-slate-100 mb-4" />
            <p className="font-black uppercase italic text-slate-300 text-sm md:text-base px-4">Esperando nuevos pedidos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {pedidos.map((p) => (
            <Card key={p.id} className="rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-lg overflow-hidden bg-white group hover:shadow-2xl transition-all flex flex-col">
              
              {/* CABECERA DINÁMICA */}
              <div className={`p-4 md:p-6 flex justify-between items-center ${
                p.entrega === 'delivery' ? 'bg-orange-600' : 
                p.entrega === 'retiro' ? 'bg-slate-800' : 'bg-slate-900'
              } text-white shrink-0`}>
                <div className="flex items-center gap-2 md:gap-3">
                  {p.entrega === 'delivery' ? <Truck size={20} className="md:size-6 animate-bounce" /> : 
                   p.entrega === 'retiro' ? <Store size={20} md:size-6 /> : <Utensils size={20} md:size-6 />}
                  <div>
                    <h3 className="font-black uppercase italic leading-none text-sm md:text-base truncate max-w-[120px] md:max-w-none">
                      {p.entrega === 'delivery' ? 'Delivery' : 
                       p.entrega === 'retiro' ? 'Retiro' : p.destino}
                    </h3>
                    <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold opacity-60 mt-1">
                      <Clock size={10} /> {p.hora}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => finalizarPedido(p.id)} 
                  className="opacity-40 hover:opacity-100 p-2 -mr-2 transition-opacity"
                >
                  <Trash2 size={16} md:size-18 />
                </button>
              </div>

              <CardContent className="p-5 md:p-8 flex flex-col flex-1">
                {/* DIRECCIÓN / UBICACIÓN */}
                {p.entrega === 'delivery' && (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 bg-orange-50 rounded-xl md:rounded-2xl border border-orange-100">
                    <p className="text-[9px] font-black text-orange-600 uppercase mb-1">Envío:</p>
                    {p.destino.includes('http') ? (
                      <a 
                        href={p.destino} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 text-[11px] font-bold text-slate-700 hover:text-orange-600 transition-colors truncate"
                      >
                        <MapPin size={12} className="shrink-0" /> UBICACIÓN GPS <ExternalLink size={10} />
                      </a>
                    ) : (
                      <p className="text-[11px] font-bold text-slate-700 truncate leading-tight">{p.destino}</p>
                    )}
                  </div>
                )}

                {/* ITEMS DEL PEDIDO - Área con scroll si hay muchos items */}
                <div className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-1">
                  {p.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                      <div className="flex items-center gap-2 md:gap-3">
                        <span className="bg-slate-100 text-slate-900 w-5 h-5 md:w-6 md:h-6 rounded-md md:rounded-lg flex items-center justify-center text-[9px] md:text-[10px] font-black shrink-0">
                          {item.cant}
                        </span>
                        <span className="font-black uppercase italic text-xs md:text-sm text-slate-700 leading-tight">
                          {item.nombre}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* MÉTODO DE PAGO Y TOTAL */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center mb-5 md:mb-8">
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase">Pago</p>
                    <Badge className={`text-[8px] md:text-[9px] font-black uppercase px-2 py-0 h-4 md:h-5 ${
                      p.metodoPago === 'mercadopago' ? 'bg-sky-100 text-sky-600' : 
                      p.metodoPago === 'transferencia' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    } border-none`}>
                      {p.metodoPago}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase">Total</p>
                    <p className="text-lg md:text-xl font-black italic text-slate-900">${p.total}</p>
                  </div>
                </div>

                <Button 
                  onClick={() => finalizarPedido(p.id)}
                  className="w-full h-12 md:h-14 bg-green-500 hover:bg-green-600 rounded-xl md:rounded-2xl font-black uppercase italic shadow-lg shadow-green-100 transition-all active:scale-95 text-xs md:text-base"
                >
                  <CheckCircle2 className="mr-2 size-4 md:size-5" /> Listo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
