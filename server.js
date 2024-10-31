const express = require('express');
const app = express();
const valoracionesRoutes = require('./routes/valoraciones');
require('dotenv').config();

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/valoraciones', valoracionesRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});