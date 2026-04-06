import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, LayoutDashboard, Settings, ShoppingBag } from "lucide-react"

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b bg-white px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-orange-600" />
          <span className="text-xl font-bold tracking-tight">RESTOWEB</span>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-orange-600 border-orange-200">En Línea</Badge>
          <Button variant="ghost" size="sm">Admin</Button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Gestión de Restaurante</h1>
          <p className="text-muted-foreground text-lg">Selecciona una opción para comenzar a operar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tarjeta de Ventas/Menú */}
          <Card className="hover:shadow-xl transition-all cursor-pointer border-t-4 border-t-orange-500">
            <CardHeader>
              <div className="mb-2 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-orange-600" />
              </div>
              <CardTitle>Punto de Venta</CardTitle>
              <CardDescription>Toma pedidos y gestiona el menú digital.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Acceso rápido a categorías, precios y stock en tiempo real.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Abrir Terminal</Button>
            </CardFooter>
          </Card>

          {/* Tarjeta de Administración */}
          <Card className="hover:shadow-xl transition-all cursor-pointer border-t-4 border-t-slate-800">
            <CardHeader>
              <div className="mb-2 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Settings className="text-slate-800" />
              </div>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>Panel de control, reportes y usuarios.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Ajusta los detalles de tu local y revisa las estadísticas de venta.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-slate-300">Ir a Ajustes</Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t bg-white">
        © 2026 RestoWeb - San Vicente, Misiones
      </footer>
    </div>
  )
}

export default App
