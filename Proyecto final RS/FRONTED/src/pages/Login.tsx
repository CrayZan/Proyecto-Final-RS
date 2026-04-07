import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, UtensilsCrossed, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export default function Login({ onLogin, tema }: { onLogin: () => void, tema: any }) {
  const [pass, setPass] = useState("")
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
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
    <div className={`min-h-[calc(100vh-120px)] flex items-center justify-center p-4 md:p-6 transition-colors duration-500 ${tema.bgPage}`}>
      
      <Card className={`w-full max-w-[340px] md:max-w-md rounded-[2.5rem] md:rounded-[3rem] border shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-500 ${tema.bgHeader} ${tema.border} overflow-hidden`}>
        <CardHeader className="text-center pt-8 md:pt-10 px-6">
          {/* Icono adaptable que escala según pantalla */}
          <div className={`mx-auto p-3.5 md:p-4 rounded-xl md:rounded-[1.5rem] shadow-lg mb-4 md:mb-6 rotate-3 ${tema.bgIcon} w-fit`}>
            <UtensilsCrossed className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          
          <CardTitle className={`font-black uppercase italic tracking-tighter text-2xl md:text-3xl ${tema.text}`}>
            Acceso <span className={`${tema.primary}`}>Admin</span>
          </CardTitle>
          
          <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mt-2 opacity-40 ${tema.text}`}>
            RestoWeb • San Vicente
          </p>
        </CardHeader>
        
        <CardContent className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="relative group">
              <Lock 
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors opacity-30 group-focus-within:opacity-100 ${tema.text}`} 
                size={18} md:size={20} 
              />
              <Input 
                type="password" 
                placeholder="CLAVE MAESTRA" 
                className={`pl-11 md:pl-12 h-12 md:h-14 rounded-xl md:rounded-2xl border-2 bg-black/5 font-black text-sm md:text-lg placeholder:opacity-20 transition-all outline-none focus:ring-2 focus:ring-offset-0 ${tema.border} ${tema.text}`}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoFocus
              />
            </div>
            
            <Button 
              type="submit" 
              className={`w-full h-14 md:h-16 rounded-xl md:rounded-[1.5rem] font-black uppercase italic text-base md:text-lg shadow-xl transition-all flex gap-2 md:gap-3 hover:scale-[1.02] active:scale-95 items-center justify-center ${tema.accent}`}
            >
              ENTRAR <span className="hidden xs:inline">AL PANEL</span> <ArrowRight size={18} md:size={20} />
            </Button>
          </form>
          
          <div className="mt-6 md:mt-8 text-center">
            <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest opacity-30 px-2 ${tema.text}`}>
              Uso exclusivo para propietarios
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
