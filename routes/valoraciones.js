const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta para agregar una valoración
router.post('/agregar', (req, res) => {
  const { nombre, apellido, area, linkedin, comentario } = req.body;

  // Insertar la nueva valoración sin especificar el campo `id`, ya que es AUTO_INCREMENT
  const insertQuery = 'INSERT INTO valoraciones (nombre, apellido, area, linkedin, comentario) VALUES (?, ?, ?, ?, ?)';
  
  db.query(insertQuery, [nombre, apellido, area, linkedin, comentario], (err, result) => {
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
    if (err) {
      console.error("Error al obtener las valoraciones:", err);
      return res.status(500).json({ status: 'error', message: 'Error al obtener las valoraciones' });
    }
    res.json({ status: 'success', data: results });
  });
});


router.get('/portfolio', (req, res) => {
  // Consulta para obtener solo los campos solicitados
  const query = `
    SELECT 
      CONCAT(nombre, ' ', apellido) AS nombre_completo, 
      area, 
      linkedin, 
      comentario
    FROM valoraciones
  `;
  // QUERY
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener las valoraciones resumidas:", err);
      return res.status(500).json({ status: 'error', message: 'Error al obtener las valoraciones resumidas' });
    }
    res.json({ status: 'success', data: results });
  });
});


module.exports = router;
