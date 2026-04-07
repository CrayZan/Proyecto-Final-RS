import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, UtensilsCrossed, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom" // IMPORTANTE: Para el salto automático

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("")
  const navigate = useNavigate() // Esta es la herramienta que nos permite "viajar" por la app

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // VALIDACIÓN DE CLAVE
    if (pass === "admin2026") {
      onLogin() // Avisa a la App que estamos autorizados
      toast.success("¡Bienvenido, Jefe!")
      
      // EL SALTO MÁGICO: Te lleva al panel automáticamente
      navigate("/admin") 
    } else {
      toast.error("Contraseña incorrecta. Reintentá.")
      setPass("") // Limpia el campo si falla
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md rounded-[3rem] border-none shadow-2xl animate-in zoom-in duration-500">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto bg-orange-600 p-4 rounded-[1.5rem] shadow-lg shadow-orange-100 mb-6 rotate-3">
            <UtensilsCrossed className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="font-black uppercase italic tracking-tighter text-3xl text-slate-900">
            Acceso <span className="text-orange-600">Admin</span>
          </CardTitle>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
            RestoWeb • San Vicente
          </p>
        </CardHeader>
        
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" size={20} />
              <Input 
                type="password" 
                placeholder="CONTRASEÑA MAESTRA" 
                className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 font-black text-lg placeholder:text-slate-300 focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoFocus
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-16 bg-slate-900 hover:bg-orange-600 text-white rounded-[1.5rem] font-black uppercase italic text-lg shadow-xl shadow-slate-200 transition-all flex gap-3"
            >
              ENTRAR AL PANEL <ArrowRight size={20} />
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              Uso exclusivo para propietarios
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
