import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // Asegúrate de tener este componente o usa un <textarea> común
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, QrCode } from "lucide-react"
import { Link } from "react-router-dom"
import { ref, push, remove } from "firebase/database"
import { db } from "../lib/firebase"
import { toast } from "sonner"

export default function Admin({ productos }: { productos: any[] }) {
  const [nuevo, setNuevo] = useState({ nombre: "", precio: "", categoria: "Comidas", imagen: "", descripcion: "" })

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevo.nombre || !nuevo.precio) return
    
    try {
      await push(ref(db, 'productos'), {
        ...nuevo,
        precio: Number(nuevo.precio)
      })
      setNuevo({ nombre: "", precio: "", categoria: "Comidas", imagen: "", descripcion: "" })
      toast.success("Producto guardado en la nube")
    } catch (error) {
      toast.error("Error al guardar")
    }
  }

  const borrar = (id: string) => {
    remove(ref(db, `productos/${id}`))
    toast.info("Producto eliminado")
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase italic">Panel Admin</h1>
        <Link to="/admin/qrs">
          <Button variant="outline" className="font-black uppercase text-xs"><QrCode className="mr-2"/> Generar QRs
