const express = require('express');
const app = express();
const valoracionesRoutes = require('./routes/valoraciones');
const proyectosRoutes = require('./routes/proyectos');
const authRoutes = require('./routes/auth');
const cors = require('cors');
require('dotenv').config();

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4321',
  'https://sebastiancabreralcala.netlify.app',
  'https://adsebasdev.netlify.app',
  'https://www.nexsigndev.com',
  'https://sebastiancabreraalcala.netlify.app',
  'https://sebastiancabreraalcala.com'
];

// Configuración de CORS
app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen como las de herramientas o servidores internos
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('No permitido por CORS'));
    }
  }
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/valoraciones', valoracionesRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/auth', authRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
