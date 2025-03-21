const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,  // Número máximo de conexiones simultáneas
  queueLimit: 0
});

// Conexión de prueba
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error al conectar con la base de datos:", err.code);
  } else {
    console.log("✅ Conexión exitosa con la base de datos MySQL");
    connection.release(); // Libera la conexión cuando termine
  }
});

module.exports = pool;
