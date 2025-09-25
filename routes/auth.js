const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Secreto para JWT (en producción debería estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_aqui_2024';
const JWT_EXPIRES_IN = '24h';

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validar campos requeridos
        if (!username || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Username y password son requeridos'
            });
        }

        // Buscar usuario en la base de datos
        const query = 'SELECT * FROM admin_users WHERE username = ? AND is_active = true';
        
        db.query(query, [username], async (err, results) => {
            if (err) {
                console.error("Error al buscar usuario:", err.message);
                return res.status(500).json({
                    status: 'error',
                    message: 'Error interno del servidor',
                    details: err.message
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Credenciales inválidas'
                });
            }

            const user = results[0];

            // Verificar contraseña
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Credenciales inválidas'
                });
            }

            // Crear token JWT
            const token = jwt.sign(
                { 
                    userId: user.id,
                    username: user.username,
                    email: user.email
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Respuesta exitosa
            res.json({
                status: 'success',
                message: 'Login exitoso',
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    },
                    expiresIn: JWT_EXPIRES_IN
                }
            });
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            details: error.message
        });
    }
});

// POST /api/auth/verify - Verificar token
router.post('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Token no proporcionado'
            });
        }

        // Verificar token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token inválido o expirado'
                });
            }

            // Token válido
            res.json({
                status: 'success',
                message: 'Token válido',
                data: {
                    user: {
                        id: decoded.userId,
                        username: decoded.username,
                        email: decoded.email
                    }
                }
            });
        });

    } catch (error) {
        console.error("Error en verificación de token:", error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            details: error.message
        });
    }
});

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const { currentPassword, newPassword } = req.body;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Token no proporcionado'
            });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Contraseña actual y nueva son requeridas'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                status: 'error',
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar token
        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token inválido o expirado'
                });
            }

            // Buscar usuario actual
            const query = 'SELECT * FROM admin_users WHERE id = ? AND is_active = true';
            
            db.query(query, [decoded.userId], async (err, results) => {
                if (err || results.length === 0) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'Usuario no encontrado'
                    });
                }

                const user = results[0];

                // Verificar contraseña actual
                const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
                
                if (!isCurrentPasswordValid) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'Contraseña actual incorrecta'
                    });
                }

                // Hash de la nueva contraseña
                const newPasswordHash = await bcrypt.hash(newPassword, 10);

                // Actualizar contraseña
                const updateQuery = 'UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
                
                db.query(updateQuery, [newPasswordHash, decoded.userId], (err, result) => {
                    if (err) {
                        console.error("Error al actualizar contraseña:", err.message);
                        return res.status(500).json({
                            status: 'error',
                            message: 'Error al actualizar contraseña',
                            details: err.message
                        });
                    }

                    res.json({
                        status: 'success',
                        message: 'Contraseña cambiada exitosamente'
                    });
                });
            });
        });

    } catch (error) {
        console.error("Error al cambiar contraseña:", error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            details: error.message
        });
    }
});

module.exports = router;