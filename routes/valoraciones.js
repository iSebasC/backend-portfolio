const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta para agregar una valoración
router.post('/agregar', (req, res) => {
  const { nombre, apellido, area, comentario } = req.body;

  // Obtener el último ID
  const getLastIdQuery = 'SELECT id FROM valoraciones ORDER BY id DESC LIMIT 1';

  db.query(getLastIdQuery, (err, result) => {
    if (err) {
      console.error("Error al obtener el último ID:", err);
      return res.status(500).json({ status: "error", message: "Error al obtener el último ID" });
    }

    // Verificar si la tabla tiene registros o no
    const nextId = result.length > 0 ? result[0].id + 1 : 1;

    console.log("Último ID:", result[0]?.id, "Próximo ID:", nextId);

    // Insertar la nueva valoración con el siguiente ID
    const insertQuery = 'INSERT INTO valoraciones (id, nombre, apellido, area, comentario) VALUES (?, ?, ?, ?, ?)';
    db.query(insertQuery, [nextId, nombre, apellido, area, comentario], (err, result) => {
      if (err) {
        console.error("Error al insertar en la base de datos:", err);
        return res.status(500).json({ status: "error", message: "Error al insertar la valoración" });
      }
      res.status(200).json({ status: "success", message: "Valoración agregada exitosamente" });
    });
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

module.exports = router;
