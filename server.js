const express = require('express');
const app = express();
const valoracionesRoutes = require('./routes/valoraciones');
const cors = require('cors'); 
require('dotenv').config();

// Configuración de CORS para permitir solicitudes solo desde Netlify
app.use(cors({
  origin: ['http://localhost:3000', 'https://sebastiancabreralcala.netlify.app'], // ← sin slash al final
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/valoraciones', valoracionesRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
