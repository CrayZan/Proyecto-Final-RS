import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// Importamos el archivo de estilos que contiene Tailwind CSS
import './index.css'

// Buscamos el elemento "root" en el HTML y renderizamos la aplicación
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
