import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';

// --- COMPONENTE: HOME ---
const Home = () => (
  <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <div style={{ fontSize: '60px', marginBottom: '20px' }}>🍴</div>
    <h1 style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#1e293b' }}>Mi Restaurante</h1>
    <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '40px' }}>Gestión profesional para tu negocio.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/menu" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0', padding: '40px 20px', borderRadius: '20px', background: '#fff' }}>
        <div style={{ fontSize: '40px' }}>🛍️</div>
        <h3>Ver Menú</h3>
      </Link>
      <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0', padding: '40px 20px', borderRadius: '20px', background: '#fff' }}>
        <div style={{ fontSize: '40px' }}>⚙️</div>
        <h3>Administración</h3>
      </Link>
    </div>
  </div>
);

// --- COMPONENTE: MENU ---
const Menu = () => {
  const [platos] = useState([
    { id: 1, nombre: "Milanesa Completa", precio: 4500, desc: "Con papas fritas", cat: "Minutas" },
    { id: 2, nombre: "Yerba Mate Premium", precio: 2800, desc: "Selección especial 1kg", cat: "Almacén" }
  ]);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Nuestra Carta</h2>
      {platos.map(plato => (
        <div key={plato.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', marginBottom: '15px', borderRadius: '15px', border: '1px solid #f1f5f9' }}>
          <div>
            <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.8rem' }}>{plato.cat}</span>
            <h3 style={{ margin: '5px 0' }}>{plato.nombre}</h3>
            <p style={{ color: '#64748b' }}>{plato.desc}</p>
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>${plato.precio}</div>
        </div>
      ))}
    </div>
  );
};

// --- COMPONENTE: ADMIN ---
const Admin = () => (
  <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
    <h2>Panel de Control</h2>
    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', marginTop: '20px' }}>
      <p>No hay pedidos pendientes.</p>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  return (
    <Router>
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 5%', borderBottom: '1px solid #f1f5f9' }}>
        <Link to="/" style={{ fontWeight: 'bold', textDecoration: 'none', color: '#0f172a' }}>RESTOWEB</Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/menu" style={{ textDecoration: 'none', color: '#475569' }}>Menú</Link>
          <Link to="/admin" style={{ textDecoration: 'none', color: '#475569' }}>Admin</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
