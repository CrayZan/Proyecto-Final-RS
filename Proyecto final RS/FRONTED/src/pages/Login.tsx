import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, UtensilsCrossed, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

// Recibimos 'tema' como prop desde App.tsx
export default function Login({ onLogin, tema }: { onLogin: () => void, tema: any }) {
  const [pass, setPass] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // VALIDACIÓN DE CLAVE (Mantenemos tu clave admin2026)
    if (pass === "admin2026") {
      onLogin() 
      toast.success("¡Bienvenido, Jefe!")
      navigate("/admin") 
    } else {
      toast.error("Contraseña incorrecta. Reintentá.")
      setPass("") 
    }
  }

  return (
    /* Reemplazamos bg-slate-50 por tema.bgPage para eliminar el destello */
    <div className={`min-h-[80vh] flex items-center justify-center p-6 transition-colors duration-500 ${tema.bgPage}`}>
      
      {/* La tarjeta ahora usa tema.bgHeader y tema.border */}
      <Card className={`w-full max-w-md rounded-[3rem] border shadow-2xl animate-in zoom-in duration-500 ${tema.bgHeader} ${tema.border}`}>
        <CardHeader className="text-center pt-10">
          {/* El icono usa tema.bgIcon */}
          <div className={`mx-auto p-4 rounded-[1.5rem] shadow-lg mb-6 rotate-3 ${tema.bgIcon}`}>
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          
          <CardTitle className={`font-black uppercase italic tracking-tighter text-3xl ${tema.text}`}>
            Acceso <span className={`${tema.primary}`}>Admin</span>
          </CardTitle>
          
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-40 ${tema.text}`}>
            RestoWeb • San Vicente
          </p>
        </CardHeader>
        
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Lock 
                className={`absolute left-4 top-4 transition-colors opacity-30 group-focus-within:opacity-100 ${tema.text}`} 
                size={20} 
              />
              <Input 
                type="password" 
                placeholder="CONTRASEÑA MAESTRA" 
                /* Adaptamos el input para que no brille en temas oscuros */
                className={`pl-12 h-14 rounded-2xl border-2 bg-black/5 font-black text-lg placeholder:opacity-20 transition-all outline-none focus:ring-2 focus:ring-offset-0 ${tema.border} ${tema.text}`}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoFocus
              />
            </div>
            
            <Button 
              type="submit" 
              /* El botón ahora usa tema.accent para el color principal */
              className={`w-full h-16 rounded-[1.5rem] font-black uppercase italic text-lg shadow-xl transition-all flex gap-3 hover:scale-[1.02] active:scale-95 ${tema.accent}`}
            >
              ENTRAR AL PANEL <ArrowRight size={20} />
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className={`text-[9px] font-black uppercase tracking-widest opacity-30 ${tema.text}`}>
              Uso exclusivo para propietarios
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
