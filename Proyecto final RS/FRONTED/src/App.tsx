import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Utensils, LayoutDashboard, ShoppingBag, Menu as MenuIcon } from 'lucide-react';

// Importamos tus componentes de la carpeta UI
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./components/ui/card";

// --- VISTA DE INICIO (HOME) ---
const Home = () => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50 p-6 text-center">
    <div className="bg-primary/10 p-4 rounded-full mb-6">
      <Utensils className="h-12 w-12 text-primary" />
    </div>
    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
      Bienvenido a tu Restaurante
    </h1>
    <p className="text-xl text-muted-foreground max-w-[600px] mb-8">
      Tu sistema de gestión está listo. Desde aquí puedes ver el menú de clientes o gestionar tus platos.
    </p>
    <div className="flex flex-wrap gap-4 justify-center">
      <Link to="/menu">
        <Button size="lg" className="gap-2">
          <ShoppingBag className="h-5 w-5" /> Ver Menú Público
        </Button>
      </Link>
      <Link to="/admin">
