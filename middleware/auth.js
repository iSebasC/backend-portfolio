const jwt = require('jsonwebtoken');

// Secreto para JWT (debe ser el mismo que en auth.js)
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_aqui_2024';

/**
 * Middleware para verificar autenticación JWT
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = (req, res, next) => {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Token de acceso requerido'
        });
    }

    // Verificar token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token expirado'
                });
            } else if (err.name === 'JsonWebTokenError') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Token inválido'
                });
            } else {
                return res.status(403).json({
                    status: 'error',
                    message: 'Error de autenticación',
                    details: err.message
                });
            }
        }

        // Token válido, agregar información del usuario al request
        req.user = user;
        next();
    });
};

/**
 * Middleware opcional para verificar autenticación
 * Si hay token lo verifica, si no hay token continúa sin error
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
};

module.exports = {
    authenticateToken,
    optionalAuth
};