import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  Store, 
  Settings, 
  ChevronRight, 
  ShoppingBag,
  Info
} from 'lucide-react';

// Importamos tus componentes UI
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

// --- VISTA DE INICIO (HOME) ---
const Home = () => (
  <div className="max-w-5xl mx-auto px-6 py-12 md:py-24">
    <div className="text-center mb-16">
      <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
        <UtensilsCrossed className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6">
        Tu Restaurante Digital
      </h1>
      <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
        Gestiona tu menú, recibe pedidos y administra tu negocio desde un solo lugar.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      <Card className="hover:shadow-xl transition-all border-2 border-transparent hover:border-primary/20 cursor-pointer group">
        <Link to="/menu" className="block p-2">
          <CardHeader>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 text-orange-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Menú para Clientes</CardTitle>
            <CardDescription className="text-lg">Tus clientes podrán ver los platos y precios actualizados.</CardDescription>
          </CardHeader>
          <CardFooter className="text-primary font-semibold flex items-center group-hover:gap-2 transition-all">
            Ir al menú <ChevronRight className="h-5 w-5" />
          </CardFooter>
        </Link>
      </Card>

      <Card className="hover:shadow-xl transition-all border-2 border-transparent hover:border-primary/20 cursor-pointer group">
        <Link to="/admin" className="block p-2">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <Settings className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Administración</CardTitle>
            <CardDescription className="text-lg">Configura tus platos, precios y disponibilidad en tiempo real.</CardDescription>
          </CardHeader>
          <CardFooter className="text-primary font-semibold flex items-center group-hover:gap-2 transition-all">
            Gestionar <ChevronRight className="h-5 w-5" />
          </CardFooter>
        </Link>
      </Card>
    </div>
  </div>
);

// --- VISTA DE MENÚ (CLIENTES) ---
const Menu = () => (
  <div className="max-w-6xl mx-auto px-6 py-12">
    <div className="flex items-center gap-3 mb-10 border-b pb-6">
