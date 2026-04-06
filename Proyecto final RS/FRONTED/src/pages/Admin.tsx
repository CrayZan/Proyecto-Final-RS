import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, QrCode, UploadCloud, UtensilsCrossed, GlassWater, CakeSlice, TicketPercent, Soup, Croissant, Beef } from "lucide-react"
import { Link } from "react-router-dom"
import { ref, push, remove } from "firebase/database"
import { db } from "../lib/firebase"
import { toast } from "sonner"

// DEFINICIÓN DE CATEGORÍAS COMPLETAS CON ICONOS
const CATEGORIAS_COMPLETAS = [
  { nombre: "Entradas", icono: Croissant },
  { nombre: "Ensaladas", icono: UtensilsCrossed },
  { nombre: "Comidas", icono: UtensilsCrossed },
  { nombre: "Pastas", icono: Soup },
  { nombre: "Carnes", icono: Beef },
  { nombre: "Bebidas", icono: GlassWater },
  { nombre: "Vinos", icono: GlassWater },
  { nombre: "Cervezas", icono: GlassWater },
  { nombre: "Postres", icono: CakeSlice },
  { nombre: "Promociones", icono: TicketPercent },
];

export default function Admin({ productos }: { productos: any[] }) {
  // ESTADO DEL FORMULARIO CON DESCRIPCIÓN INCLUIDA
  const [nuevo, setNuevo] = useState({ 
    nombre: "", 
    precio: "", 
    categoria: "Comidas", 
    imagen: "", 
    descripcion: "" 
  })

  // Función para convertir archivo a Base64 (para guardar la imagen en Firebase)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setNuevo(prev => ({ ...prev, imagen: reader.result as string }));
      toast.success("Imagen cargada correctamente")
    };
    reader.onerror = () => {
      toast.error("Error al leer el archivo")
    };
  };

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevo.nombre || !nuevo.precio) return toast.error("Nombre y precio son obligatorios")
    if (!nuevo.imagen) return toast.error("Por favor, subí una foto del plato")
    
    try {
      // Guardar en Firebase (con descripción)
      await push(ref(db, 'productos'), {
        ...nuevo,
        precio: Number(nuevo.precio)
      })
      // Limpiar formulario (incluida la descripción y la imagen)
      setNuevo({ nombre: "", precio: "", categoria: "Comidas", imagen: "", descripcion: "" })
      toast.success("Producto publicado en San Vicente!")
    } catch (error) {
      toast.error("Error al conectar con la nube")
    }
  }

  const borrar = (id: string) => {
    if(confirm("¿Estás seguro de eliminar este producto del menú?")) {
      remove(ref(db, `productos/${id}`))
      toast.info("Producto eliminado")
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500 mb-20">
      <div className="flex justify-between items-center mb-10 gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-orange-100">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Panel de Control</h1>
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.2em]">San Vicente / Gestión de Menú</p>
        </div>
        <Link to="/admin/qrs">
          <Button variant="outline" className="font-black uppercase text-[10px] h-12 rounded-xl border-slate-200 hover:bg-slate-50 shadow-sm px-6">
            <QrCode size={18} className="mr-2 text-orange-600"/> Generar QRs de Mesas
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUMNA FORMULARIO (1/3 de la pantalla en PC) */}
        <div className="xl:col-span-1">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white sticky top-28">
            <CardHeader className="text-center pt-8 pb-4">
              <CardTitle className="uppercase font-black text-xs text-slate-400 italic tracking-widest">
                Nuevo Plato o Bebida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={agregar} className="space-y-5">
                
                {/* ZONA DE CARGA DE IMAGEN (RECUPERADA) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Foto del producto</label>
                  {nuevo.imagen ? (
                    <div className="relative h-40 rounded-2xl overflow-hidden shadow-inner group border border-slate-100">
                      <img src={nuevo.imagen} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNuevo(prev => ({...prev, imagen: ""}))} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                        <Trash2 className="text-white" size={24}/>
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-200 rounded-2xl h-40 flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-colors p-6 group">
                      <UploadCloud size={32} className="text-slate-300 group-hover:text-orange-500 mb-2"/>
                      <span className="text-[11px] font-bold text-slate-500">Subir desde la PC</span>
                      <span className="text-[9px] font-medium text-slate-400">JPG o PNG</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Nombre</label>
                  <Input className="rounded-xl border-slate-100 h-11 text-slate-900 font-medium" placeholder="Ej: Pizza Muzzarella" value={nuevo.nombre} onChange={e => setNuevo({...nuevo, nombre: e.target.value})} />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Precio ($)</label>
                  <Input className="rounded-xl border-slate-100 h-11 text-slate-900 font-medium" type="number" placeholder="Ej: 5500" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} />
                </div>
                
                {/* SELECTOR DE TODAS LAS CATEGORÍAS (RECUPERADO) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Categoría</label>
                  <select className="w-full border border-slate-100 rounded-xl h-11 px-3 text-sm font-bold bg-white focus:ring-2 ring-orange-500 shadow-inner" value={nuevo.categoria} onChange={e => setNuevo({...nuevo, categoria: e.target.value})}>
                    {CATEGORIAS_COMPLETAS.map(c => (
                      <option key={c.nombre}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                
                {/* DESCRIPCIÓN (INGREDIENTES) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase ml-2 text-slate-400">Descripción (Ingredientes / Tamaño)</label>
                  <textarea 
                    className="w-full border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 ring-orange-500 min-h-[100px] outline-none shadow-inner"
                    placeholder="Ej: Muzzarella, salsa de tomate y aceitunas verdes..."
                    value={nuevo.descripcion} 
                    onChange={e => setNuevo({...nuevo, descripcion: e.target.value})} 
                  />
                </div>
                
                <Button type="submit" className="w-full bg-slate-900 text-white h-16 font-black uppercase rounded-2xl shadow-xl hover:bg-orange-600 transition-colors">
                  <Plus className="mr-2"/> Publicar en el Menú Online
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA LISTADO (2/3 de la pantalla en PC) */}
        <div className="xl:col-span-2">
          <div className="space-y-5">
            <div className="flex items-center gap-2 ml-4">
              <UtensilsCrossed size={18} className="text-orange-600"/>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Productos en Línea</h2>
              <Badge variant="secondary" className="font-black text-[11px] ml-2 text-orange-700 bg-orange-100 px-3 py-1 rounded-full">{productos.length} platos</Badge>
            </div>
            
            {productos.map(p => (
              <div key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-3xl shadow-sm border border-slate-50 group hover:shadow-md transition-all gap-4">
                <div className="flex items-center gap-4">
                  {/* Imagen guardada como base64 */}
                  <img src={p.imagen} className="w-16 h-16 rounded-2xl object-cover shadow-inner" alt={p.nombre} />
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="font-black uppercase italic text-[13px] text-slate-800 tracking-tighter leading-none">{p.nombre}</p>
                       <Badge variant="outline" className="text-[9px] font-bold text-slate-300 rounded-lg px-2 py-0 h-4 border-slate-100">{p.categoria}</Badge>
                    </div>
                    <p className="text-[11px] text-orange-600 font-black italic mt-1">${p.precio.toLocaleString('es-AR')}</p>
                    {p.descripcion && <p className="text-[9px] text-slate-400 font-bold max-w-[300px] leading-tight mt-1 truncate">{p.descripcion}</p>}
                  </div>
                </div>
                <Button variant="ghost" onClick={() => borrar(p.id)} className="text-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors h-11 w-11 p-0 sm:ml-4">
                  <Trash2 size={20}/>
                </Button>
              </div>
            ))}
            
            {productos.length === 0 && (
              <div className="text-center py-20 opacity-20 border-2 border-dashed border-slate-100 rounded-3xl">
                <UtensilsCrossed size={48} className="mx-auto text-slate-300 mb-4"/>
                <p className="font-black uppercase text-xs italic tracking-widest">No hay productos cargados en Firebase</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
