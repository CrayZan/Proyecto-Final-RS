import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Trash2, Clock, MapPin } from "lucide-react"
import { toast } from "sonner"

export default function Comandas({ pedidos, setPedidos }: { pedidos: any[], setPedidos: any }) {
  
  const completarPedido = (id: number) => {
    setPedidos(pedidos.filter(p => p.id !== id))
    toast.success("¡Pedido completado!")
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 uppercase">Panel de Comandas</h1>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-black text-sm">
          {pedidos.length} PENDIENTES
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-inner border border-dashed">
          <Clock className="mx-auto h-12 w-12 text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold uppercase italic">Esperando pedidos de las mesas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedidos.map(pedido => (
            <Card key={pedido.id} className="border-none shadow-xl bg-white rounded-3xl overflow-hidden ring-2 ring-orange-500">
              <CardHeader className="bg-slate-900 text-white flex flex-row justify-between items-center py-4">
                <CardTitle className="text-lg font-black flex items-center gap-2 uppercase italic">
                  <MapPin size={18} className="text-orange-500"/> Mesa {pedido.mesa}
                </CardTitle>
                <span className="text-[10px] font-bold opacity-60">{pedido.hora}</span>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 mb-6">
                  {pedido.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between border-b border-slate-100 pb-2">
                      <span className="font-black text-slate-700 text-sm italic underline decoration-orange-300">x{item.cant}</span>
                      <span className="font-bold text-slate-800 text-sm flex-1 ml-3 uppercase">{item.nombre}</span>
                    </div>
                  ))}
                </div>
                <div className="text-right text-xl font-black text-orange-600 mb-4">
                  TOTAL: ${pedido.total.toLocaleString()}
                </div>
                <Button 
                  onClick={() => completarPedido(pedido.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black h-12 rounded-xl"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" /> DESPACHAR
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
