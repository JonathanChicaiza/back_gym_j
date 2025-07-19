// src/middlewares/auth.js

// Importar módulos necesarios (ajusta según lo que necesites para autenticación)
// const jwt = require('jsonwebtoken'); // Si usas JWT para tokens
// const { JWT_SECRET } = require('../keys'); // Tu secreto JWT

// Middleware principal de autenticación (isLoggedIn)
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        console.log('Usuario no autenticado, redirigiendo a inicio de sesión');
        req.session.returnTo = req.originalUrl;
        return res.redirect('/');
    }
};

// Middleware para verificar el token de autenticación
// Puedes integrar aquí tu lógica de JWT o usar la de Passport si aplica
const verificarToken = (req, res, next) => {
    // Si ya estás usando Passport con `isLoggedIn`, esta función podría ser redundante
    // o podrías usarla para verificar tokens en rutas API que no usan sesiones.
    // EJEMPLO BÁSICO (adapta a tu lógica real):
    if (req.isAuthenticated()) { // Si Passport ya autenticó al usuario
        console.log('Usuario autenticado con Passport.');
        // Asegúrate de que req.user tenga un rol si lo necesitas para verificarRol
        if (!req.user || !req.user.rol) {
            // Si el rol no está en req.user, podrías buscarlo en la DB o asignarle uno por defecto
            req.user = { ...req.user, rol: 'cliente' }; // Ejemplo: asignar rol por defecto
        }
        return next();
    }

    // Si no está autenticado por Passport, intenta verificar un token JWT si lo usas
    const token = req.headers.authorization?.split(' ')[1]; // Asumiendo 'Bearer TOKEN'

    if (!token) {
        return res.apiError('Acceso denegado. No se proporcionó token.', 401);
    }

    try {
        // --- REEMPLAZA ESTO CON TU LÓGICA REAL DE VERIFICACIÓN DE TOKEN JWT ---
        // const decoded = jwt.verify(token, JWT_SECRET);
        // req.user = decoded; // Adjunta la información del usuario al objeto request
        console.log('Token JWT verificado (ejemplo):', token);
        // Datos de usuario de ejemplo si no usas JWT o para pruebas
        req.user = { id: 'jwt_user_id', rol: 'admin' }; // Asegúrate de que el rol se obtenga del token real
        next(); // Continuar con la siguiente función middleware/ruta
    } catch (error) {
        console.error('Error al verificar token:', error.message);
        return res.apiError('Token inválido o expirado', 403);
    }
};

// Middleware para verificar el rol del usuario
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        // Asegúrate de que req.user esté disponible y tenga un rol
        if (!req.user || !req.user.rol) {
            return res.apiError('Acceso denegado. Rol de usuario no disponible.', 403);
        }

        const userRol = req.user.rol;

        if (!rolesPermitidos.includes(userRol)) {
            return res.apiError('Acceso denegado. Rol no autorizado.', 403);
        }
        next(); // El rol es permitido, continuar
    };
};

// Exportar todas las funciones que se necesitan
module.exports = {
    isLoggedIn, // Tu middleware original
    verificarToken, // El middleware que historial-pago.routes.js espera
    verificarRol    // El middleware que historial-pago.routes.js espera
};
