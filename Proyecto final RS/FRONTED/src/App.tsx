import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Home = () => (
  <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
    <div style={{ fontSize: '50px', marginBottom: '20px' }}>🍴</div>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>Mi Restaurante</h1>
    <p style={{ color: '#64748b', fontSize: '1.2rem', marginBottom: '40px' }}>Gestión profesional para tu negocio.</p>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/menu" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0', padding: '30px', borderRadius: '15px', background: '#f8fafc' }}>
        <div style={{ fontSize: '30px' }}>🛍️</div>
        <h3 style={{ marginTop: '15px' }}>Ver Menú</h3>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Carta para tus clientes</p>
      </Link>
      <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit', border: '1px solid #e2e8f0', padding: '30px', borderRadius: '15px', background: '#f8fafc' }}>
        <div style={{ fontSize: '30px' }}>⚙️</div>
        <h3 style={{ marginTop: '15px' }}>Panel Admin</h3>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Gestionar platos y precios</p>
      </Link>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.5rem', textDecoration: 'none', color: '#000' }}>
            RESTO<span style={{ color: '#2563eb' }}>WEB</span>
          </Link>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/menu" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Menú</Link>
            <Link to="/admin" style={{ textDecoration: 'none', color: '#475569', fontWeight: '500' }}>Admin</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<div style={{ padding: '50px', textAlign: 'center' }}><h2>Carta de Platos</h2><p>Contenido en desarrollo...</p></div>} />
          <Route path="/admin" element={<div style={{ padding: '50px', textAlign: 'center' }}><h2>Panel de Administración</h2><p>Acceso restringido</p></div>} />
        </Routes>
      </div>
    </Router>
  );
}
