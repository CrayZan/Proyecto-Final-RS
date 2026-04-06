import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Download, QrCode, ArrowLeft } from "lucide-react"
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
        ctx?.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `QR_MESA_${idMesa}.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }
  }

  const URL_BASE = "https://proyecto-final-rs.vercel.app"

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link to="/admin" className="text-orange-600 font-black text-xs mb-1 flex items-center gap-1 uppercase">
            <ArrowLeft size={12}/> Volver al Panel
          </Link>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Gestión de Mesas</h1>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Input placeholder="N° de Mesa" value={nuevaMesa} onChange={(e) => setNuevaMesa(e.target.value)} className="w-24 font-bold border-orange-100" />
          <Button onClick={agregarMesa} className="bg-orange-600 font-black uppercase text-xs px-6">
            <Plus className="mr-2 h-4 w-4" /> Agregar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mesas.map((m) => (
          <Card key={m} className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden group hover:ring-2 ring-orange-500 transition-all">
            <CardContent className="p-6 flex flex-col items-center">
              <span className="font-black text-slate-900 mb-4 text-xl uppercase italic">Mesa {m}</span>
              <div className="bg-white p-3 rounded-2xl mb-4 border shadow-inner">
                <QRCodeSVG id={`qr-${m}`} value={`${URL_BASE}/menu?mesa=${m}`} size={120} level={"H"} includeMargin={true} />
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="sm" className="flex-1 text-[10px] font-black uppercase border-slate-200" onClick={() => descargarQR(m)}>
                  <Download className="mr-1 h-3 w-3" /> PNG
                </Button>
                <Button variant="ghost" size="sm" className="text-red-300 hover:text-red-500" onClick={() => eliminarMesa(m)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
