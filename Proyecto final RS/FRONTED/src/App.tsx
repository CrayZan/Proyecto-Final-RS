import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UtensilsCrossed, Store, Settings, ChevronRight, ShoppingBag, Info } from 'lucide-react';

// Cambiamos las rutas de "@/" a "./" para evitar errores de configuración
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/card";

const Home = () => (
  <div className="max-w-5xl mx-auto px-6 py-12 text-center">
    <div className="inline-flex p-3 bg-slate-100 rounded-2xl mb-6">
      <UtensilsCrossed className="h-10 w-10 text-slate-900" />
    </div>
    <h1 className="text-4xl font-bold mb-4">Tu Restaurante Digital</h1>
    <p className="text-slate-500 mb-8 text-lg">Gestiona tu menú y administra tu negocio.</p>
    <div className="grid md:grid-cols-2 gap-6 text-left">
      <Link to="/menu" className="border p-6 rounded-xl hover:bg-slate-50">
        <ShoppingBag className="mb-4 text-blue-600" />
        <h3 className="text-xl font-bold">Ver Menú</h3>
        <p className="text-sm text-slate-500">Vista para tus clientes.</p>
      </Link>
      <Link to="/admin" className="border p-6 rounded-xl hover:bg-slate-50">
        <Settings className="mb-4 text-orange-600" />
        <h3 className="text-xl font-bold">Administración</h3>
        <p className="text-sm text-slate-500">Configura tus platos.</p>
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <nav className="p-6 border-b flex justify-between items-center">
          <Link to="/" className="font-bold text-xl flex items-center gap-2">
            <Store className="h-6 w-6 text-blue-600" /> RESTOWEB
          </Link>
          <div className="space-x-4 text-sm font-medium">
            <Link to="/menu">Menú</Link>
            <Link to="/admin">Admin</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<div className="p-10 text-center text-2xl font-bold">Cargando Menú...</div>} />
          <Route path="/admin" element={<div className="p-10 text-center text-2xl font-bold">Panel Admin</div>} />
        </Routes>
      </div>
    </Router>
  );
}
