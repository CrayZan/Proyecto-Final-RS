import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Esta es tu configuración real extraída de la imagen que enviaste
const firebaseConfig = {
  apiKey: "AIzaSyCocpq3xsGl0pJ8eZhr-PFvFktc9jUtbjU",
  authDomain: "resto-bar-628e4.firebaseapp.com",
  projectId: "resto-bar-628e4",
  storageBucket: "resto-bar-628e4.firebasestorage.app",
  messagingSenderId: "47430218533",
  appId: "1:47430218533:web:93e996266b6b4ba27460cc",
  measurementId: "G-X2V1GREN2R"
};

// Inicializamos la App
const app = initializeApp(firebaseConfig);

// Exportamos la base de datos para usarla en el Menú y las Comandas
export const db = getDatabase(app);
