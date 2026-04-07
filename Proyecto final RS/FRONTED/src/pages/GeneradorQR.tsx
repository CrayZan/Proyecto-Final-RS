import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Download, ArrowLeft, Printer } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

export default function GeneradorQR() {
  const [mesas, setMesas] = useState<string[]>(() => {
    const guardado = localStorage.getItem("restoweb_mesas")
    return guardado ? JSON.parse(guardado) : ["1", "2", "3"]
  })
  const [nuevaMesa, setNuevaMesa] = useState("")

  useEffect(() => {
    localStorage.setItem("restoweb_mesas", JSON.stringify(mesas))
  }, [mesas])

  const agregarMesa = () => {
    if (!nuevaMesa) return toast.error("Ingresá un número")
    if (mesas.includes(nuevaMesa)) return toast.error("Esa mesa ya existe")
    setMesas([...mesas, nuevaMesa].sort((a, b) => Number(a) - Number(b)))
    setNuevaMesa("")
    toast.success(`Mesa ${nuevaMesa} lista`)
  }

  const eliminarMesa = (m: string) => {
    setMesas(mesas.filter(item => item !== m))
    toast.error(`Mesa ${m} eliminada`)
  }

  const descargarQR = (idMesa: string) => {
    const svg = document.getElementById(`qr-${idMesa}`)
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        if (ctx) {
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
        }
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `QR_MESA_${idMesa}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }
  }

  const imprimirTodos = () => {
    window.print()
  }

  const URL_BASE = "https://proyecto-final-rs.vercel.app"

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* HEADER DINÁMICO */}
      <div className="max-w-6xl mx-auto mb-10 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2 w-full md:w-auto">
            <Link to="/admin" className="text-orange-600 font-black text-[10px] flex items-center gap-1 uppercase tracking-widest hover:gap-2 transition-all">
              <ArrowLeft size={14}/> Volver al Panel
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
              Gestión de <span className="text-orange-600">Mesas</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase italic">Genera y descarga tus códigos QR</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
             <Button 
              variant="outline"
              onClick={imprimirTodos}
              className="flex-1 md:flex-none border-2 border-slate-200 h-12 rounded-2xl font-black uppercase italic text-[10px]"
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimir Todo
            </Button>
            <div className="flex flex-1 md:w-48 bg-white rounded-2xl shadow-sm border-2 border-orange-100 overflow-hidden focus-within:border-orange-500 transition-all">
              <input 
                type="number"
                placeholder="N°" 
                value={nuevaMesa} 
                onChange={(e) => setNuevaMesa(e.target.value)} 
                className="w-full px-4 font-black text-center bg-transparent outline-none text-slate-700"
              />
              <button 
                onClick={agregarMesa} 
                className="bg-orange-600 text-white px-4 hover:bg-orange-700 transition-colors"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GRILLA DE MESAS RESPONSIVA */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 print:grid-cols-3 print:gap-8">
        {mesas.map((m) => (
          <Card key={m} className="group relative border-none shadow-sm hover:shadow-2xl bg-white rounded-[2.5rem] transition-all duration-300 overflow-hidden print:shadow-none print:border-2 print:border-slate-100">
            <CardContent className="p-6 flex flex-col items-center">
              
              {/* INDICADOR DE MESA */}
              <div className="mb-4 text-center">
                <span className="block text-[10px] font-black text-orange-600 uppercase italic leading-none">RestoWeb</span>
                <span className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Mesa {m}</span>
              </div>

              {/* CONTENEDOR QR */}
              <div className="relative p-4 bg-white rounded-[2rem] border-2 border-slate-50 shadow-inner group-hover:border-orange-200 transition-colors">
                <QRCodeSVG 
                  id={`qr-${m}`} 
                  value={`${URL_BASE}/menu?mesa=${m}`} 
                  size={160} 
                  level={"H"} 
                  includeMargin={false}
                  className="w-full h-auto"
                />
              </div>

              {/* ACCIONES (OCULTAS EN IMPRESIÓN) */}
              <div className="flex gap-2 w-full mt-6 print:hidden">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1 h-10 rounded-xl font-black text-[9px] uppercase italic bg-slate-100 hover:bg-orange-600 hover:text-white transition-all" 
                  onClick={() => descargarQR(m)}
                >
                  <Download className="mr-1 h-3 w-3" /> Descargar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50" 
                  onClick={() => eliminarMesa(m)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* URL AUXILIAR PARA IMPRESIÓN */}
              <p className="hidden print:block text-[8px] mt-4 font-mono text-slate-400 truncate w-full text-center">
                {URL_BASE}/menu?mesa={m}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ESTILOS DE IMPRESIÓN ADICIONALES */}
      <style>{`
        @media print {
          body { background: white !important; }
          @page { margin: 1cm; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

    </div>
  )
}
