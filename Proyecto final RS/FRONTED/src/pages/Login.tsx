import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, UtensilsCrossed } from "lucide-react"
import { toast } from "sonner"

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // AQUÍ DEFINÍ TU CONTRASEÑA (Cambiá "admin123" por la que quieras)
    if (pass === "admin2026") {
      onLogin()
      toast.success("Bienvenido al sistema")
    } else {
      toast.error("Contraseña incorrecta")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md rounded-[3rem] border-none shadow-2xl">
        <CardHeader className="text-center pt-10">
          <UtensilsCrossed className="mx-auto h-12 w-12 text-orange-600 mb-4" />
          <CardTitle className="font-black uppercase italic tracking-tighter text-2xl">Acceso Admin</CardTitle>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">RestoWeb San Vicente</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <Input 
                type="password" 
                placeholder="Contraseña Maestra" 
                className="pl-12 h-12 rounded-2xl border-slate-100 font-bold"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full h-14 bg-slate-900 rounded-2xl font-black uppercase shadow-xl hover:bg-orange-600 transition-all">
              Entrar al Panel
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
