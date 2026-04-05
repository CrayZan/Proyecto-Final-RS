import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';

// --- COMPONENTE: HOME (PÁGINA PRINCIPAL) ---
const Home = () => (
  <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif', animation: 'fadeIn 1s' }}>
    <div style={{ fontSize: '60px', marginBottom: '20px' }}>🍴</div>
    <h1 style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>Mi Restaurante</h1>
    <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
      La mejor gastronomía directamente en tu mesa. Gestiona tus pedidos y reserva tu lugar.
    </p>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/menu" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0', padding: '40px 20px', borderRadius: '20px', background: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', transition: 'transform 0.2s' }}>
        <div style={{ fontSize: '40px' }}>🛍️</div>
        <h3 style={{ marginTop: '15px', fontSize: '1.5rem' }}>Ver Menú</h3>
        <p style={{ color: '#94a3b8' }}>Explora nuestra carta actualizada</p>
      </Link>

      <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0', padding: '40px 20px', borderRadius: '20px', background: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <div style={{ fontSize: '40px' }}>⚙️</div>
        <h3 style={{ marginTop: '15px', fontSize: '1.5rem' }}>Administración</h3>
        <p style={{ color: '#94a3b8' }}>Gestionar platos y pedidos</p>
      </Link>
    </div>
  </div>
);

// --- COMPONENTE: MENÚ (CARTA DE PLATOS) ---
const Menu = () => {
  const [platos] = useState([
    { id: 1, nombre: "Milanesa Completa", precio: 4500, desc: "Con papas fritas y dos huevos fritos", cat: "Minutas" },
    { id: 2, nombre: "Yerba Mate Premium", precio: 2800, desc: "Selección especial de 1kg", cat: "Almacén" },
    { id: 3, nombre: "Parrillada para Dos", precio: 12000, desc: "Asado, vacío, chorizo y ensalada", cat: "Parrilla" },
    { id: 4, nombre: "Empanada Salteña", precio: 800, desc: "Carne cortada a cuchillo frita", cat: "Entradas" }
  ]);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>Nuestra Carta</h2>
      <div style={{ display: 'grid', gap: '20px' }}>
        {platos.map(plato => (
          <div key={plato.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '25px', borderRadius: '15px', background: '#fff', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color
