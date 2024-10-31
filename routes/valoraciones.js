const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta para agregar una valoración
router.post('/agregar', (req, res) => {
  const { nombre, apellido, area, comentario } = req.body;
  
  const query = 'INSERT INTO valoraciones (nombre, apellido, area, comentario) VALUES (?, ?, ?, ?)';
  db.query(query, [nombre, apellido, area, comentario], (err, result) => {
    if (err) {
      console.error("Error al insertar en la base de datos:", err);
      return res.status(500).json({ status: "error", message: "Error al insertar la valoración" });
    }
    res.status(200).json({ status: "success", message: "Valoración agregada exitosamente" });
  });
});


// Ruta para obtener todas las valoraciones
router.get('/obtener', (req, res) => {
  const query = 'SELECT * FROM valoraciones';
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

module.exports = router;
